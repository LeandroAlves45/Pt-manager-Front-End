import { Users, CalendarDays, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente de cartões de estatísticas para o dashboard
 *
 * Recebe dados via props ou busca via API (ex: total clientes, sessões esta semana, planos ativos, progresso médio)
 * Mostra: total de clientes, sessões esta semana, planos ativos, progresso médio
 *
 * Props:
 * @param {number} totalClients - Total de clientes
 * @param {number} sessionsToday - Total de sessões esta semana
 * @param {number} activePacks - Total de packs ativos
 * @param {number} totalSessions - Progresso médio do mês
 */

export default function StatsCards({
  totalClients = 0,
  sessionsToday = 0,
  activePacks = 0,
  totalSessions = 0,
}) {
  //Array de objetos para facilitar renderização dos cartões
  const stats = [
    {
      label: 'Clientes Ativos',
      value: totalClients,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Sessões Hoje',
      value: sessionsToday,
      icon: CalendarDays,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Packs Ativos',
      value: activePacks,
      icon: Package,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Sessões Mês',
      value: totalSessions,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    //grid responsivo: 1 coluna mobile, 2 tablet, 4 desktop
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {/* Label do stat em text secundario */}
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                {/* Valor do stat em destaque */}
                <span className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </span>
              </div>
              {/* Icone com fundo colorido arredondado */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
