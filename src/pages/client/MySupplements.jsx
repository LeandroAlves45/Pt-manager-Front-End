/**
 * MySupplements.jsx — suplementos atribuídos ao cliente (read-only).
 *
 * Mostra a lista de suplementos que o trainer atribuiu ao cliente,
 * com dose, timing e notas específicas para este cliente.
 *
 * Os dados chegam já expandidos do backend (nome, descrição, etc.)
 * para evitar pedidos adicionais à API.
 *
 * Esta página é read-only — o cliente não pode alterar nada.
 */

import { useEffect, useState } from 'react';
import { getMySupplements } from '@/api/supplementsApi';
import { Pill, Clock, Beaker } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { set } from 'react-hook-form';

export default function MySupplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega os suplementos atribuídos ao cliente autenticado
    getMySupplements()
      .then(setSupplements)
      .catch(() => {}) // errors de rede já são tratados pelo interceptor do Axios
      .finally(() => setLoading(false));
  }, []);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Estado vazio - sem suplementos atribuídos
  if (supplements.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Suplementação
        </h1>
        <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <Pill className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            Nenhum suplemento atribuído.
          </p>
          <p className="text-sm text-muted-foreground">
            O teu Personal Trainer ainda não te atribuiu nenhum suplemento ao
            teu plano.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Suplementação
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {supplements.length} suplemento{supplements.length !== 1 ? 's' : ''}{' '}
          no teu plano
        </p>
      </div>

      {/* Grelha de cartões — 1 coluna em mobile, 2 em tablet, 3 em desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {supplements.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">
                  {item.supplement_name}
                </CardTitle>
                {/* Badge de timing do catálogo — aparece se existir */}
                {item.supplement_timing && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {item.supplement_timing}
                  </Badge>
                )}
              </div>
              {/* Descrição do catálogo */}
              {item.supplement_description && (
                <p className="text-sm text-muted-foreground leading-snug">
                  {item.supplement_description}
                </p>
              )}
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0">
              {/* Dose — mostra a dose específica do cliente, ou a do catálogo como fallback */}
              <div className="flex items-start gap-2">
                <Beaker className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Dose
                  </p>
                  <p className="text-sm">
                    {/* Dose específica do cliente tem prioridade sobre a dose padrão do catálogo */}
                    {item.dose ||
                      item.supplement_serving_size ||
                      'Conforme indicação'}
                  </p>
                </div>
              </div>

              {/* Timing / momento de toma — se existir */}
              {(item.timing_notes || item.supplement_timing) && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Quando tomar
                    </p>
                    <p className="text-sm">
                      {/* timing_notes do cliente tem prioridade sobre o timing padrão */}
                      {item.timing_notes || item.supplement_timing}
                    </p>
                  </div>
                </div>
              )}

              {/* Notas do trainer para este cliente — só aparece se existirem */}
              {item.notes && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Nota do treinador
                  </p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
