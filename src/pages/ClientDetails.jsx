import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClients } from '../api/clientsApi';
import { getSessions } from '../api/sessionApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Mail, Phone, Calendar, Ruler, Target } from 'lucide-react';
import {
  getInitials,
  calculateAge,
  formatDate,
  getSexLabel,
  getStatusColor,
  getStatusLabel,
} from '@/lib/helpers';
import { set } from 'react-hook-form';

/**
 * Página de detalhes de um cliente
 *
 * Acedida via rota / clientes/:id
 * Use Params() extrai o :id da URL.
 *
 * Mostra: informações pessoais, sessões, progresso, status.
 */
export default function ClientDetails() {
  //useParams extrai parâmetros dinâmicos da URL
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //Busca detalhes do cliente
        const clients = await getClients({ Client_id: id });
        if (clients.length > 0) {
          setClient(clients[0]);
        }
        //Busca sessões do cliente
        const sessionsData = await getSessions({ Client_id: id });
        setSessions(sessionsData);
      } catch (error) {
        toast.error('Erro ao carregar dados do cliente');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
          <div className="h-48 rounded-xl bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 lg:p-6 text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  //calcula progresso do pack
  const packProgress = client.active_pack
    ? (client.active_pack.sessions_used / client.active_pack.sessions_total) *
      100
    : 0;

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      {/*Botão voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/clients')}
        className="w-fit text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos Clientes
      </Button>

      {/* Header com info dos clientes */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials(client.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-semibold text-foreground">
                  {client.full_name}
                </h1>
                <Badge
                  variant="outline"
                  className={getStatusColor(client.status)}
                >
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                {client.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {client.email}
                  </span>
                )}
                {client.birth_date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />{' '}
                    {calculateAge(client.birth_date)} anos (
                    {formatDate(client.birth_date)})
                  </span>
                )}
                {client.sex && (
                  <span className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" /> {getSexLabel(client.sex)}
                  </span>
                )}
                {client.height_cm && (
                  <span className="flex items-center gap-2">
                    <Ruler className="h-3.5 w-3.5" /> {client.height_cm} cm
                  </span>
                )}
                {client.objective && (
                  <span className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" /> {client.objective}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pack ativo */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Pack Ativo
          </h2>
          {client.active_pack ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {client.active_pack.pack_type_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {client.active_pack.sessions_used} /{' '}
                  {client.active_pack.sessions_total} sessões usadas
                </span>
              </div>
              <Progress value={packProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {client.active_pack.sessions_remaining} sessões restantes
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum pack ativo</p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de sessões */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Últimas Sessões ({sessions.length})
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session_id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {formatDate(session.starts_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {' '}
                      {session.duration_minutes}min{' '}
                      {session.location && `- ${session.location}`}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(session.status)}`}
                  >
                    {getStatusLabel(session.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
