/**
 * MyTrainingPlan.jsx — plano de treino activo do cliente (read-only).
 *
 * Mostra o plano completo: dias, exercícios, séries, repetições e cargas planeadas.
 * O cliente pode ver mas não pode editar — a gestão é feita pelo trainer.
 */

import { useEffect, useState } from 'react';
import { getMyTrainingPlan } from '@/api/clientPortalApi';
import { Dumbbell, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyTrainingPlan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Controla quais dias estão expandidos (por índice)
  const [expandedDays, setExpandedDays] = useState([]);

  useEffect(() => {
    getMyTrainingPlan()
      .then((d) => {
        setData(d);
        // Expande o primeiro dia por defeito
        if (d?.days?.length > 0) {
          setExpandedDays({ 0: true });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(index) {
    setExpandedDays((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Sem plano ativo
  if (!data?.plan) {
    return (
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Plano de Treino
        </h1>
        <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            Sem plano de treino ativo
          </p>
          <p className="text-sm text-muted-foreground">
            O teu Personal Trainer ainda não te atribuiu um plano de treino.
            Assim que o fizer, poderás consultá-lo aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Plano de Treino
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{data.plan.name}</p>
      </div>

      {/* Info do plano */}
      {(data.plan.start_date || data.plan.notes) && (
        <Card className="border-border bg-card">
          <CardContent className="pt-4 flex flex-col gap-2">
            {data.plan.start_date && (
              <p className="text-sm text-muted-foreground">
                Início:{' '}
                <span className="text-foreground">{data.plan.start_date}</span>
                {data.plan.end_date && (
                  <>
                    {' '}
                    · Fim:{' '}
                    <span className="text-foreground">
                      {data.plan.end_date}
                    </span>
                  </>
                )}
              </p>
            )}
            {data.plan.notes && (
              <p className="text-sm text-muted-foreground">{data.plan.notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de dias */}
      <div className="flex flex-col gap-3">
        {data.days.map((day, index) => (
          <Card key={day.id} className="border-border bg-card overflow-hidden">
            {/* Header do dia — clicável para expandir/colapsar */}
            <button
              onClick={() => toggleDay(index)}
              className="w-full text-left"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{day.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {day.exercises.length} exercício
                      {day.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {expandedDays[index] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </button>

            {/* Exercícios do dia — visíveis apenas quando expandido */}
            {expandedDays[index] && (
              <CardContent className="pt-0 flex flex-col gap-3">
                {day.exercises.map((ex, exIndex) => (
                  <div
                    key={ex.id}
                    className="rounded-lg border border-border bg-background p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {exIndex + 1}.
                          </span>
                          <p className="text-sm font-medium text-foreground">
                            {ex.exercise_name}
                          </p>
                          {ex.is_superset_group && (
                            <Badge variant="secondary" className="text-xs">
                              Superset
                            </Badge>
                          )}
                        </div>
                        {ex.exercise_muscles && (
                          <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                            {ex.exercise_muscles}
                          </p>
                        )}
                      </div>
                      {ex.exercise_url && (
                        <a
                          href={ex.exercise_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Parâmetros do exercício */}
                    <div className="flex flex-wrap gap-3 ml-5 text-xs text-muted-foreground">
                      {ex.sets && (
                        <span>
                          <span className="text-foreground font-medium">
                            {ex.sets}
                          </span>{' '}
                          séries
                        </span>
                      )}
                      {ex.reps_range && (
                        <span>
                          <span className="text-foreground font-medium">
                            {ex.reps_range}
                          </span>{' '}
                          reps
                        </span>
                      )}
                      {ex.rest_range_seconds && (
                        <span>
                          Descanso:{' '}
                          <span className="text-foreground font-medium">
                            {ex.rest_range_seconds}s
                          </span>
                        </span>
                      )}
                      {ex.tempo && (
                        <span>
                          Tempo:{' '}
                          <span className="text-foreground font-medium">
                            {ex.tempo}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Cargas planeadas por série */}
                    {ex.set_loads?.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-5">
                        {ex.set_loads.map((sl) => (
                          <div
                            key={sl.set_number}
                            className="rounded bg-muted px-2 py-1 text-xs"
                          >
                            <span className="text-muted-foreground">
                              S{sl.set_number}:{' '}
                            </span>
                            <span className="text-foreground font-medium">
                              {sl.planned_weight_kg
                                ? `${sl.planned_weight_kg} kg`
                                : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
