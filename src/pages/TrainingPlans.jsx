import { useState } from 'react';
import { matchesSearch } from '@/utils/validators';
import { toast } from 'react-toastify';
import { useTrainingPlans } from '@/hooks/useTrainingPlans';
import { useClients } from '@/hooks/useClients';
import {
  createTrainingPlan,
  updateTrainingPlan,
  deleteTrainingPlan,
  setClientActivePlan,
  getPlanDays,
  getDayExercises,
} from '@/api/trainingPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Copy, Users, ClipboardList, Zap } from 'lucide-react';
import PlanList from '@/components/training-plans/PlanList';
import PlanFormDialog from '@/components/training-plans/PlanFormDialog';
import PlanDaysList from '@/components/training-plans/PlanDaysList';
import ActivatePlanDialog from '@/components/training-plans/ActivatePlanDialog';

/**
 * Página de Planos de Treino
 *
 * Responsabilidades desta página (componente "orquestrador"):
 * - Buscar dados (planos e clientes)
 * - Gerir estado de UI (modais abertos, plano selecionado, filtros)
 * - Executar operações CRUD e chamar a API
 * - Passar dados e callbacks para componentes filhos
 *
 * Modais/Sheets:
 * - PlanFormDialog: criar/editar plano
 * - Sheet lateral: detalhe do plano com PlanDaysList
 * - ActivatePlanDialog: ativar plano para cliente
 */

export default function TrainingPlans() {
  //Dados e operações de planos e clientes
  const { plans, loading, error, refetch } = useTrainingPlans();
  const { clients } = useClients();

  //Estado de UI
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); //filtro por tipo de plano

  //Dialog para criação/edição de plano
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); //plano selecionado para editar ou ver detalhes

  //Sheet lateral para detalhes do plano
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState(null); //plano selecionado para ver detalhes
  const [detailDays, setDetailDays] = useState([]); //dias do plano selecionado
  const [loadingDays, setLoadingDays] = useState(false); //estado de loading para os dias do plano

  //Dialog para ativar plano para cliente
  const [activateOpen, setActivateOpen] = useState(false);
  const [planToActivate, setPlanToActivate] = useState(null); //plano selecionado para ativar para cliente

  //Filtros

  const filtered = plans.filter((plan) => {
    //Filtro por tipo
    if (typeFilter === 'templates' && plan.client_id !== null) return false; //se não for filtro de templates, só mostra planos com cliente
    if (typeFilter === 'clients' && plan.client_id === null) return false; //se for filtro de clientes, só mostra planos com cliente

    // Filtro por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      const client = clients.find((c) => c.id === plan.client_id);
      return matchesSearch(q, plan.name, client?.full_name);
    }
    return true;
  });

  //Contadores para os labels das tabs
  const templatesCount = plans.filter((p) => p.client_id === null).length;
  const clientsPlansCount = plans.filter((p) => p.client_id !== null).length;

  // HANDLERS

  const handleCreate = () => {
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  const handleView = async (plan) => {
    setDetailPlan(plan);
    setDetailOpen(true);
    setLoadingDays(true);
    try {
      //Buscar os dias do plano para mostrar no detalhe
      const days = await getPlanDays(plan.id);

      //busca exercicios de cada dia em paralelo
      const daysWithExercises = await Promise.all(
        days.map(async (day) => {
          try {
            const exercises = await getDayExercises(day.id);
            return { ...day, exercises };
          } catch {
            toast.error('Erro ao carregar exercícios do dia');
            return { ...day, exercises: [] }; //retorna o dia mesmo se falhar os exercícios
          }
        })
      );
      setDetailDays(daysWithExercises);
    } catch (error) {
      toast.error('Erro ao carregar dias do plano');
    } finally {
      setLoadingDays(false);
    }
  };

  //Refetch dos planos após criar/editar/excluir para atualizar a lista
  const handleRefreshDays = async () => {
    if (!detailPlan) return;
    try {
      const days = await getPlanDays(detailPlan.id);
      //Para cada dia, busca os exercícios e adiciona na propriedade "exercises" do dia
      const daysWithExercises = await Promise.all(
        days.map(async (day) => {
          try {
            const exercises = await getDayExercises(day.id);
            //retorna o dia com exercicios
            return { ...day, exercises };
          } catch {
            toast.error('Erro ao carregar exercícios do dia');
            return { ...day, exercises: [] }; //retorna o dia mesmo se falhar os exercícios
          }
        })
      );
      setDetailDays(daysWithExercises);
    } catch {
      toast.error('Erro ao atualizar dias do plano');
    }
  };

  //Guardar (criar ou editar)
  const handleSave = async (data) => {
    try {
      if (selectedPlan) {
        await updateTrainingPlan(selectedPlan.id, data);
        toast.success('Plano atualizado com sucesso');
      } else {
        await createTrainingPlan(data);
        toast.success('Plano criado com sucesso');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar plano');
    }
  };

  //Excluir plano
  const handleDelete = async (plan) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await deleteTrainingPlan(plan.id);
      toast.success('Plano excluído com sucesso');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir plano');
    }
  };

  //Ativar plano para cliente
  const handleOpenActivate = (plan) => {
    setPlanToActivate(plan);
    setActivateOpen(true);
  };

  const handleActivate = async ({ client_id, active_from }) => {
    try {
      await setClientActivePlan({
        client_id,
        training_plan_id: planToActivate.id,
        active_from,
      });
      toast.success('Plano ativado para cliente com sucesso');
      setActivateOpen(false);
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Erro ao ativar plano para cliente'
      );
    }
  };

  //Renderização
  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-destructive text-center py-12">{error}</p>
        <div className="flex justify-center mt-4">
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      {/* Header com título, barra de pesquisa e botão de criar plano */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Planos de Treino
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus planos de treino e templates
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Criar Plano
        </Button>
      </div>

      {/* Barra de pesquisa e tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-input"
          />
        </div>

        {/* Tabs para filtrar por tipo de plano (todos, templates, clientes) */}
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="bg-secondary">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Todos ({plans.length})
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Templates ({templatesCount})
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Por cliente ({clientsPlansCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tabela*/}
      {loading ? (
        //Skeleton
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <PlanList
          plans={filtered}
          clients={clients}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog criar/editar plano */}
      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={selectedPlan}
        clients={clients}
        onSave={handleSave}
      />

      {/* Sheet lateral para detalhes do plano */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl bg-card border-border text-foreground overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {detailPlan?.name}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Gere os dias e exercícios deste plano.
            </SheetDescription>
            {/* Badge de status e botão de ativar plano para cliente (só se for template) */}
            <div className="flex items-center gap-3 mt-2">
              <Badge
                variant="outline"
                className="border-border text-muted-foreground"
              >
                {detailPlan?.status === 'published'
                  ? 'Publicado'
                  : detailPlan?.status === 'draft'
                    ? 'Rascunho'
                    : 'Arquivado'}
              </Badge>
              {/* Botão ativar */}
              {detailPlan?.status === 'published' && (
                <Button
                  size="sm"
                  onClick={() => handleOpenActivate(detailPlan)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 ml-auto"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Ativar para cliente
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Lista de dias do plano */}
          {loadingDays ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            detailPlan && (
              <PlanDaysList
                planId={detailPlan.id}
                days={detailDays}
                onRefresh={handleRefreshDays}
              />
            )
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog para ativar plano para cliente */}
      <ActivatePlanDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        plan={planToActivate}
        clients={clients}
        onActivate={handleActivate}
      />
    </div>
  );
}
