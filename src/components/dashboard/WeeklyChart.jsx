import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

/**
 * gráfico  de barras para mostrar sessões por dia da semana
 *
 * Recebe um array de sessões e calcula internamente o número de sessões por dia da semana
 *
 * @param {Array} sessions - Array de objetos de sessões, cada objeto deve conter:
 */
export default function WeeklyChart({ sessions = [] }) {
  //Nomes dos dias da semana para exibição
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  //Calcula o número de sessões por dia da semana
  const now = new Date();
  const dayOfWeek = now.getDay(); //0 (Dom) a 6 (Sáb)
  const mondayOffSet = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; //Calcula o offset para chegar na segunda-feira
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffSet); //Define a data para a segunda-feira da semana atual
  monday.setHours(0, 0, 0, 0); //Zera as horas para facilitar a comparação

  //Conta sessões por dia da semana (de segunda a domingo)
  const weekOrder = [1, 2, 3, 4, 5, 6, 0]; //Ordem dos dias da semana para exibição (Seg a Dom)
  const counts = {};
  weekOrder.forEach((d) => {
    counts[d] = 0;
  }); //Inicializa contagem para cada dia da semana

  sessions.forEach((session) => {
    const sessionDate = new Date(session.starts_at);
    //Verifica se a sessão é da semana atual
    const diffDays = Math.floor((sessionDate - monday) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      const sessionDay = sessionDate.getDay(); //0 (Dom) a 6 (Sáb)
      counts[day] = (counts[day] || 0) + 1; //Incrementa a contagem para o dia da semana
    }
  });

  //Transforma em formato que o recharts espera
  const chartData = weekOrder.map((dayIndex) => ({
    name: dayNames[dayIndex],
    sessões: counts[dayIndex] || 0,
  }));

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Sessões esta semana
        </h3>
        {/* ResponsiveContainer para garantir que o gráfico se ajuste ao tamanho do card */}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(240 12% 15%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(240 10% 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(240 12% 15%)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(240 10% 55%)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240 12% 8%)',
                border: '1px solid hsl(240 12% 15%)',
                borderRadius: '8px',
                color: 'hsl(240 10% 96%)',
              }}
            />
            <Bar
              dataKey="sessões"
              fill="hsl(197 100% 45%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
