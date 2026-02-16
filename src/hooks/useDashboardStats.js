import { useState, useEffect } from 'react';
import { useClients } from './useClients';
import { useSessions } from './useSessions';
import { getPackTypes } from '@/api/packTypesApi';

export const useDashboardStats = () => {
  const { clients } = useClients();
  const { sessions } = useSessions();
  const [packTypes, setPackTypes] = useState([]);

  useEffect(() => {
    const fetchPackTypes = async () => {
      try {
        const data = await getPackTypes();
        setPackTypes(data);
      } catch (error) {
        console.error('Erro ao carregar tipos de packs:', error);
      }
    };

    fetchPackTypes();
  }, []);

  //Estatísticas calculadas
  const stats = {
    //Clientes
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === 'active').length,
    clientsWithActivePack: clients.filter((c) => c.active_pack).length,

    //Sessões
    totalSessions: sessions.length,
    todaySessions: sessions.filter(
      (s) => new Date(s.starts_at).toDateString() === new Date().toDateString()
    ).length,

    //Packs
    activePacks: clients.filter((c) => c.active_pack).length,

    //Clientes em risco (sem sessão agendada e pack a acabar)
    clientsAtRisk: clients.filter((c) => {
      if (!c.active_pack) return true; // Sem pack ativo já é um risco
      if (c.active_pack.sessions_remaining <= 2) return true; // Pack quase acabando
      return false;
    }),

    //Sessões da semana
    weekSessions: sessions.filter((s) => {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      ); // Domingo
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const sessionDate = new Date(s.starts_at);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    }),
  };

  return stats;
};
