/**
 * AdminDashboard.jsx — métricas globais da plataforma.
 *
 * Mostra: total de trainers, trainers activos/em trial,
 * total de clientes, e receita mensal estimada.
 */

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, UserCheck, Euro } from 'lucide-react';
import { getPlatformMetrics } from '../../api/adminApi';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPlatformMetrics();
      setMetrics(data);
    } catch {
      setError('Erro ao carregar métricas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Personal Trainers',
      value: metrics?.total_trainers ?? 0,
      icon: UserCheck,
      description: 'Contas registadas na plataforma',
    },
    {
      title: 'Personal Trainers Ativos',
      value: metrics?.active_trainers ?? 0,
      icon: UserCheck,
      description: `${metrics?.trialing_trainers ?? 0} em trial`,
    },
    {
      title: 'Total de Clientes',
      value: metrics?.total_clients ?? 0,
      icon: TrendingUp,
      description: 'Clientes activos na plataforma',
    },
    {
      title: 'Receita Estimada',
      value: `€${metrics?.estimated_monthly_revenue_eur ?? 0}`,
      icon: Euro,
      description: 'Por mês (subcrições activas)',
    },
  ];

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da plataforma PT Manager
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-center pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
