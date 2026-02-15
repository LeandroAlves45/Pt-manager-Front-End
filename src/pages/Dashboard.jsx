import { useClients } from '@/hooks/useClients';
import { useSessions } from '@/hooks/useSessions';
import StatsCards from '@/components/dashboard/StatsCards';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';

/**
 * Página principal - Dashboard.
 *
 * Busca dados de clientes e sessões via hooks e calcula as estatísticas
 * para passar aos componentes filhos.
 *
 * Fluxo de dados:
 * API → hooks (useClients, useSessions) → Dashboard → componentes filhos (via props)
 */

export default function Dashboard() {
  //Busca clientes ativos
  const { clients, loading: clientsLoading } = useClients({ status: 1 });
  //Busca todas as sessões
  const { sessions, loading: sessionsLoading } = useSessions({ limit: 200 });

  //Calcula estatísticas para os cards
  const totalClients = clients.length;

  //sessões agendadas para hoje
  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter((s) => {
    return s.status === 'scheduled' && s.starts_at?.startsWith(today);
  }).length;

  //Clientes com pack ativo
  const activePacks = clients.filter((c) => c.active_pack !== null).length;

  //Total de sessões agendadas
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalSessionsThisMouth = sessions.filter((s) => {
    const d = new Date(s.starts_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  //loading state global
  const loading = clientsLoading || sessionsLoading;

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      {/* Header da página */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da sua atividade
        </p>
      </div>

      {loading ? (
        //Skeleton de loading simples
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Cards de estatísticas */}
          <StatsCards
            totalClients={totalClients}
            sessionsToday={sessionsToday}
            activePacks={activePacks}
            totalSessionsThisMouth={totalSessionsThisMouth}
          />

          {/* Grid: gráfico à esquerda, próximas sessões à direita */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyChart sessions={sessions} />
            <UpcomingSessions sessions={sessions} />
          </div>
        </>
      )}
    </div>
  );
}
