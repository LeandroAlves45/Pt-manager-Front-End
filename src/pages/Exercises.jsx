import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  getExercises,
  createExercise,
  updateExercise,
} from '@/api/exercisesApi';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Edit, Search, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { url } from 'node:inspector';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', muscles: '', url: '', is_active: true },
  });

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  //Filtragem local
  const filtered = useMemo(() => {
    let result = exercises;
    if (statusFilter === 'active') result = result.filter((e) => e.is_active);
    else if (statusFilter === 'inactive')
      result = result.filter((e) => !e.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscles.toLowerCase().includes(q)
      );
    }
    return result;
  }, [exercises, search, statusFilter]);

  const openAdd = () => {
    setEditingExercise(null);
    reset({ name: '', muscles: '', url: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (exercise) => {
    setEditingExercise(exercise);
    reset({
      name: exercise.name,
      muscles: exercise.muscles,
      url: exercise.url || '',
      is_active: exercise.is_active,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    const cleaned = { ...data, url: data.url?.trim() || null };
    try {
      if (editingExercise) {
        await updateExercise(editingExercise.id, cleaned);
        toast.success('Exercício atualizado com sucesso!');
      } else {
        await createExercise(cleaned);
        toast.success('Exercício criado com sucesso!');
      }
      setDialogOpen(false);
      fetchExercises();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Ocorreu um erro ao salvar o exercício.'
      );
    }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Exercícios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerir a biblioteca de exercícios
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Exercício
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar exercícios..."
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
              Todos {exercises.length}
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Ativos
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Inativos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Músculos
                </TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">
                  URL
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
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum exercício encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exercise) => (
                  <TableRow
                    key={exercise.id}
                    className="border-border hover:bg-accent/50"
                  >
                    <TableCell className="text-sm font-medium text-foreground">
                      {exercise.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscles.split(',').map((muscle) => (
                          <Badge
                            key={muscle.trim()}
                            variant="outline"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {m.trim()}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {exercise.url ? (
                        <a
                          href={exercise.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Ver
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          exercise.is_active
                            ? 'bg-success/15 text-success border-success/20'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {exercise.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuItem onClick={() => openEdit(exercise)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de criação/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingExercise
                ? 'Atualize os detalhes do exercício.'
                : 'Preencha os detalhes para criar um novo exercício.'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-name">Nome *</Label>
              <Input
                id="ex-name"
                {...register('name', { required: 'Nome obrigatório' })}
                className="bg-background border-input text-foreground"
                placeholder="Ex: Supino Plano"
              />
              {errors.name && (
                <span className="text-xs text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-muscles">Músculos *</Label>
              <Input
                id="ex-muscles"
                {...register('muscles', { required: 'Músculos obrigatórios' })}
                className="bg-background border-input text-foreground"
                placeholder="Ex: Peito, Tríceps"
              />
              {errors.muscles && (
                <span className="text-xs text-destructive">
                  {errors.muscles.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-url">URL do Vídeo</Label>
              <Input
                id="ex-url"
                {...register('url')}
                className="bg-background border-input text-foreground"
                placeholder="https://exemplo.com/exercicio"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ex-active">Ativo</Label>
              <Switch
                id="ex-active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editingExercise ? 'Guardar Alterações' : 'Criar Exercício'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
