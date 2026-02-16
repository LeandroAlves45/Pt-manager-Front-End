import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Sessions from './pages/Sessions';
import Packs from './pages/Packs';
import Exercises from './pages/Exercises';

//Componente raiz da aplicação.

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar de navegação - fixa no desktop, sheet no mobile */}
      <Sidebar />

      {/* Área principal de conteúdo */}
      <main className="lg:pl-64 min-h-screen">
        <Routes>
          {/* Dashboard- página inicial com estatísticas e visão geral */}
          <Route path="/" element={<Dashboard />} />

          {/* Clientes - lista, detalhes, agendamento e compra de packs */}
          <Route path="/clientes" element={<Clients />} />
          <Route path="/clientes/:id" element={<ClientDetails />} />

          {/* Gestão de sessões */}
          <Route path="/sessoes" element={<Sessions />} />

          {/* Gestão de packs */}
          <Route path="/packs" element={<Packs />} />

          {/* Gestão de exercícios */}
          <Route path="/exercicios" element={<Exercises />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
