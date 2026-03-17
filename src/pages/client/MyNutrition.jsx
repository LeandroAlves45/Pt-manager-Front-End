/**
 * MyNutrition.jsx — planos alimentares do cliente (read-only).
 *
 * Mostra os planos activos com refeições, alimentos e macros totais.
 */

import { useEffect, useState } from 'react';
import { getMyMealPlans } from '@/api/clientPortalApi';
import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Labels para os tipos de plano
const PLAN_TYPE_LABELS = {
  training_day: 'Dia de Treino',
  rest_day: 'Dia de Descanso',
  upper_body_day: 'Dia de Parte Superior',
  lower_body_day: 'Dia de Parte Inferior',
  refeed_day: 'Dia de Refeed',
  competition_day: 'Dia de Competição',
  custom: 'Plano Personalizado',
};

export default function MyNutrition() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyMealPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Nutrição
        </h1>
        <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            Sem planos alimentares
          </p>
          <p className="text-sm text-muted-foreground">
            O seu treinador ainda não lhe atribuiu um plano alimentar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nutrição</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {plans.length} plano{plans.length !== 1 ? 's' : ''} alimentar
          {plans.length !== 1 ? 's' : ''}
        </p>
      </div>

      {plans.map((plan) => (
        <Card key={plan.id} className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <Badge variant="secondary">
                {PLAN_TYPE_LABELS[plan.type] ?? plan.plan_type}
              </Badge>
            </div>

            {/* Macros alvos */}
            {plan.target_macros && (
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                {plan.macro_targets.kcal && (
                  <span className="text-muted-foreground">
                    Calorias:{' '}
                    <span className="text-foreground font-medium">
                      {plan.macro_targets.kcal} kcal
                    </span>
                  </span>
                )}
                {plan.macro_targets.protein_g && (
                  <span className="text-muted-foreground">
                    Proteína:{' '}
                    <span className="text-foreground font-medium">
                      {plan.macro_targets.protein_g} g
                    </span>
                  </span>
                )}
                {plan.macro_targets.carbs_g && (
                  <span className="text-muted-foreground">
                    Hidratos:{' '}
                    <span className="text-foreground font-medium">
                      {plan.macro_targets.carbs_g} g
                    </span>
                  </span>
                )}
                {plan.macro_targets.fats_g && (
                  <span className="text-muted-foreground">
                    Gorduras:{' '}
                    <span className="text-foreground font-medium">
                      {plan.macro_targets.fats_g} g
                    </span>
                  </span>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {plan.meals?.map((meal) => (
              <div key={meal.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">
                  {meal.name}
                </p>

                {/* Alimentação da refeição */}
                <div className="flex flex-col gap-1">
                  {meal.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0"
                    >
                      <span className="text-foreground">{item.food_name}</span>
                      <div className="flex gap-3 text-muted-foreground">
                        {item.kcal && <span>{Math.round(item.kcal)} kcal</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total da refeição */}
                {meal.totals && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      Total :{' '}
                      <span className="text-foreground font-medium">
                        {Math.round(meal.totals.kcal ?? 0)} kcal
                      </span>
                    </span>
                    <span>
                      P:{' '}
                      <span className="text-foreground">
                        {Math.round(meal.totals.protein_g ?? 0)} g
                      </span>
                    </span>
                    <span>
                      H:{' '}
                      <span className="text-foreground">
                        {Math.round(meal.totals.carbs_g ?? 0)} g
                      </span>
                    </span>
                    <span>
                      G:{' '}
                      <span className="text-foreground">
                        {Math.round(meal.totals.fats_g ?? 0)} g
                      </span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
