import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useClients } from '../hooks/useClients';
import {
  createClient,
  archiveClient,
  updateClient,
  unarchiveClient,
} from '../api/clientsApi';
import { purchasePack } from '../api/packsApi';
import ClientTable from '@/components/clients/ClientTable';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import PackPurchaseDialog from '@/components/packs/PackPurchaseDialog';
import { Button } from '@/components/ui/button';

/**
 * Página de gestão de clientes.
 *
 * Esta é a página "smart" (container) - contém a lógica de negócio:
 * - Busca dados via hook (useClients)
 * - Gere estados dos dialogs (form aberto/fechado, cliente selecionado)
 * - Executa operações CRUD via API
 * - Mostra feedback ao utilizador (toast)
 * - Delega a apresentação visual ao ClientTable e ClientFormDialog
 *
 * Padrão Container/Presentational:
 * Clients (smart) → ClientTable (visual) + ClientFormDialog  (visual) + PackPurchaseDialog (visual)
 */
export default function Clients() {
  const navigate = useNavigate();

  //Busca todos os clientes (sem filtro)
  const { clients, loading, error, refetch } = useClients({});

  //Estado do dialog de formulário (aberto/fechado)
  const [formOpen, setFormOpen] = useState(false);
  const [packDialogOpen, setPackDialogOpen] = useState(false); // Dialog de atribuir pack

  //Cliente atualmente selecionado para edição (null para criação)
  const [selectedClient, setSelectedClient] = useState(null);

  // --- HANDLERS DE AÇÕES ---

  //Abrir dialog para criar novo cliente
  const handleAddClient = () => {
    setSelectedClient(null); //Limpa seleção
    setFormOpen(true); //Abre form
  };

  // Abrir dialog para editar cliente existente
  const handleEditClient = (client) => {
    setSelectedClient(client); //Seleciona cliente
    setFormOpen(true); //Abre form
  };

  //Navega para a página de detalhes do cliente
  const handleViewClient = (client) => {
    navigate(`/clientes/${client.id}`); //Redireciona para detalhes
  };

  //Submete o formulário de criação/edição
  const handleSave = async (data) => {
    try {
      if (selectedClient) {
        //Edição
        await updateClient(selectedClient.id, data);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        //Criação
        await createClient(data);
        toast.success('Cliente criado com sucesso!');
      }
      setFormOpen(false); //Fecha form
      refetch(); //Atualiza lista
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Ocorreu um erro ao salvar o cliente.'
      );
    }
  };

  //Arquivar ou reativa cliente
  const handleToggleArchive = async (client) => {
    try {
      if (client.status === 'active') {
        await archiveClient(client.id);
        toast.success(`${client.full_name} arquivado com sucesso!`);
      } else {
        await unarchiveClient(client.id);
        toast.success(`${client.full_name} reativado com sucesso!`);
      }
      refetch(); //Atualiza lista
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Ocorreu um erro ao atualizar o status do cliente.'
      );
    }
  };

  // agendar sessão
  const handleScheduleSession = (client) => {
    // TODO: abrir dialog de agendar sessão com cliente pré-selecionado
    navigate('/sessoes');
  };

  //comprar pack
  const handlePurchasePack = (client) => {
    // TODO: abrir dialog de compra de pack com cliente pré-selecionado
    setSelectedClient(client); // Define cliente selecionado
    setPackDialogOpen(true); // Abre dialog de pack
  };

  // HANDLER DE COMPRA DE PACK
  /**
   * Processa a atribuição de um pack ao cliente.
   *
   * Fluxo:
   * 1. Recebe clientId e packTypeId do dialog
   * 2. Chama API para criar a compra
   * 3. Mostra feedback de sucesso/erro
   * 4. Atualiza lista de clientes (refetch)
   *
   * @param {string} clientId - ID do cliente
   * @param {string} packTypeId - ID do tipo de pack
   */

  const handlePackPurchase = async (clientId, packTypeId) => {
    try {
      // TODO: chamar API para criar compra de pack
      await purchasePack(clientId, { pack_type_id: packTypeId });
      toast.success('Pack atribuído com sucesso!');
      refetch(); // Atualiza lista de clientes para refletir novo pack
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Ocorreu um erro ao atribuir o pack ao cliente.'
      );
      throw error; // Re-throw para permitir tratamento adicional no dialog, se necessário
    }
  };

  // --- RENDERIZAÇÃO ---
  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-12 text-destructive">
          <p>Erro ao carregar clientes: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6">
      {/* Header da página */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerir a lista de clientes
        </p>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        //loading skeleton
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        // TABELA DE CLIENTES
        <ClientTable
          clients={clients}
          onAddClient={handleAddClient}
          onEditClient={handleEditClient}
          onViewClient={handleViewClient}
          onScheduleSession={handleScheduleSession}
          onPurchasePack={handlePurchasePack}
          onArchiveClient={handleToggleArchive}
        />
      )}

      {/* Dialog de criação/edição */}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
        onSave={handleSave}
      />

      {/* DIALOG DE ATRIBUIÇÃO DE PACK */}
      <PackPurchaseDialog
        open={packDialogOpen}
        onOpenChange={setPackDialogOpen}
        client={selectedClient}
        onPurchase={handlePackPurchase}
      />
    </div>
  );
}
