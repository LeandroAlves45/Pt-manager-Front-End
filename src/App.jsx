/**
 * App.jsx — componente raiz e definição de todas as rotas.
 *
 * Arquitectura de 3 dashboards:
 *   /login              → LoginPage (pública)
 *   /admin/*            → Layout de superuser (a construir na Fase 2)
 *   /trainer/*          → Layout de trainer (actual conteúdo da app)
 *   /cliente/*          → Portal do cliente (a construir na Fase 3)
 *
 * Cada namespace de rotas tem o seu próprio ProtectedRoute com o role exigido.
 * O conteúdo de cada dashboard tem o seu próprio layout (sidebar, navegação).
 *
 * Rotas sem autenticação:
 *   /login              → página de login
 *   /                   → redireciona para /login (nunca deve ficar em /)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
// Páginas públicas
import LoginPage from './pages/LoginPage';
import TrainerSignupPage from './pages/TrainerSignupPage';

// Layouts
import TrainerLayout from './layouts/TrainerLayout';
import AdminLayout from './layouts/AdminLayout';

// Páginas do Trainer
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Sessions from './pages/Sessions';
import Packs from './pages/Packs';
import Exercises from './pages/Exercises';
import TrainingPlans from './pages/TrainingPlans';
import BillingPage from './pages/trainer/BillingPage';
import TrainerProfilePage from './pages/trainer/TrainerProfilePage';

// Páginas de Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTrainers from './pages/admin/AdminTrainers';

// Placeholder para o portal do cliente — a construir na Fase 3
function ClientPlaceholder() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Client Dashboard (em construção)</p>
    </div>
  );
}

// Componente raiz da aplicação.

export default function App() {
  return (
    <Routes>
      {/* ============================================================
                ROTAS PÚBLICAS — não requerem autenticação
            ============================================================ */}

      {/* Página de login — acessível a todos */}
      <Route path="/login" element={<LoginPage />} />

      {/* Página de registo de trainers — acessível a todos */}
      <Route path="/signup" element={<TrainerSignupPage />} />

      {/* Raiz redireciona para login — nunca deve ficar em / */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ============================================================
                ROTAS DO TRAINER 
            ============================================================ */}

      <Route
        path="/trainer/*"
        element={
          <ProtectedRoute requiredRole="trainer">
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        {/* Redireciona /trainer para /trainer/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard principal */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Gestão de clientes */}
        <Route path="clientes" element={<Clients />} />
        <Route path="clientes/:id" element={<ClientDetails />} />

        {/* Gestão de sessões */}
        <Route path="sessoes" element={<Sessions />} />

        {/* Gestão de packs */}
        <Route path="packs" element={<Packs />} />

        {/* Gestão de exercícios */}
        <Route path="exercicios" element={<Exercises />} />

        {/* Gestão de planos de treino */}
        <Route path="planos" element={<TrainingPlans />} />

        {/* Página de faturação e subscrição */}
        <Route path="billing" element={<BillingPage />} />

        {/* Página de perfil do trainer */}
        <Route path="perfil" element={<TrainerProfilePage />} />

        {/* Página de nutrição */}
        <Route
          path="nutricao"
          element={
            <div className="p-6 text-muted-foreground">
              Nutrição — em construção
            </div>
          }
        />

        {/* Página de avaliação */}
        <Route
          path="avaliacoes"
          element={
            <div className="p-6 text-muted-foreground">
              Avaliações — em construção
            </div>
          }
        />

        <Route
          path="suplementos"
          element={
            <div className="p-6 text-muted-foreground">
              Suplementos — em construção
            </div>
          }
        />
      </Route>

      {/* ============================================================
                ROTAS DO SUPERUSER — requerem role="superuser"
            ============================================================ */}

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="superuser">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Redireciona /admin para /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard de administração */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Gestão de trainers */}
        <Route path="trainers" element={<AdminTrainers />} />
      </Route>

      {/* ============================================================
                ROTAS DO CLIENTE — requerem role="client"
                Fase 3 — portal do cliente a construir
            ============================================================ */}

      <Route
        path="/client/*"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientPlaceholder />
          </ProtectedRoute>
        }
      />

      {/* Fallback para rotas desconhecidas — redireciona para login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
