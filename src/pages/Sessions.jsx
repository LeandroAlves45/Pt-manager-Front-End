import { useState, useMemo, use } from 'react';
import { toast } from 'react-toastify';
import { useSessions } from '@/hooks/useSessions';
import {
  completeSession,
  markSessionMissed,
  cancelSession,
} from '@/api/sessionApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Search,
  CalendarPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getInitials,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
} from '@/lib/helpers';

/**
 * Página de gestão de sessões de treino.
 *
 * Mostra todas as sessões com filtros por status e pesquisa por nome de cliente.
 * Ações disponíveis: Concluir, Marcar Falta, Cancelar.
 */

export default function Sessions() {
  const { sessions, loading, error, refetch } = useSessions({ limit: 200 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  //Filtra sessões por status e pesquisa
  const filtered = useMemo(() => {
    let result = sessions;
    if (statusFilter !== 'all')
      result = result.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.client?.name.toLowerCase().includes(q));
    }
    return result;
  }, [sessions, search, statusFilter]);

  //Ações de sessão
  const handleComplete = async (session) => {
    try {
      await completeSession(session.id);
      toast.success(`Sessão de ${session.client_name} concluída`);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erro ao concluir sessão');
    }
  };

  const handleMissed = async (session) => {
    try {
      await markSessionMissed(session.id);
      toast.success(`Falta registada para ${session.client_name}`);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erro ao marcar falta');
    }
  };

  const handleCancel = async (session) => {
    try {
      await cancelSession(session.id);
      toast.success(`Sessão de ${session.client_name} cancelada`);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erro ao cancelar sessão');
    }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sessões</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerir sessões de treino
          </p>
        </div>
      </div>

      {/* Filtros e pesquisa */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-input text-foreground"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-secondary">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Agendadas
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Concluídas
            </TabsTrigger>
            <TabsTrigger
              value="missed"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Faltas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tabela de sessões */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Data / Hora
                </TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">
                  Duração
                </TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">
                  Local
                </TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma sessão encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((session) => (
                  <TableRow
                    key={session.id}
                    className="border-border hover:bg-accent/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(session.client_name || '??')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {session.client_name || 'Cliente'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {formatDateTime(session.starts_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {session.duration_minutes} min
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {session.location || 'Local não informado'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          getStatusColor(session.status)
                        )}
                      >
                        {getStatusLabel(session.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Só mostra ações para sessões agendadas */}
                      {session.status === 'scheduled' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover border-border"
                          >
                            <DropdownMenuItem
                              onClick={() => handleComplete(session)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-success" />{' '}
                              Concluir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMissed(session)}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Marcar Falta
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleCancel(session)}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
