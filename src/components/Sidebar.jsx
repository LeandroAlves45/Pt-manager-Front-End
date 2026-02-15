import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Package,
  Dumbbell,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/helpers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import logoImg from '@/assets/logo.png';

/**
 *
 * Items de navegação da sidebar
 * Cada item tem: label (texto visivel), href (rota), icon (componente do lucide-react)
 */

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Sessões', href: '/sessoes', icon: CalendarDays },
  { label: 'Packs', href: '/packs', icon: Package },
  { label: 'Exercícios', href: '/exercicios', icon: Dumbbell },
];

//Nome do trainer (no futuro, isso deve vir do contexto de autenticação)
const trainerName = 'Leandro Alves';

/**
 * Conteudo partilhado na navegação
 * Usado tanto na sidebar desktop quanto no menu mobile
 *
 * @param {Function} onNavigate - função chamada ao clicar em um item
 */

function NavContent({ onNavigate }) {
  //useLocation() devolve {pathname: '/rota-atual', ...}
  // Uso pathname para destacar o item ativo
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo e nome do trainer no topo */}
      <div className="flex items-center gap-3 px-4 py-6">
        <img src={logoImg} alt="Logo" className="h-8 w-auto" />
      </div>

      {/*Lista de links de navegação */}
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            // Determina se o item está ativo comparando a rota atual com o href do item
            // A rota '/' só é ativa se o pathname for exatamente '/'
            // As outras rotas são ativas se o pathname começar com o href
            const isActive =
              item.href === '/'
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    //Classes base: layout do item, padding, bordas, arrednoamento, fonte
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    //Classes condicionais: ativo vs inativo
                    isActive
                      ? 'bg-primary/10 text-primary' // ativo: fundo azul subtil + texto azul
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground' //inativo: cinza, hover muda
                  )}
                >
                  {/* Ícone do item, shrink-0 impede que encolha */}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Componente principal da sidebar
 *
 * Responsivo:
 * - Desktop (>=1024px / lg): Sidebar fixa à esquerda com 16rem (64 = w-64) de largura
 * - Mobile (<1024px): Escondida, acessível via botão hamburger que abre um Sheet (painel lateral)
 */

export function Sidebar() {
  //Estado para controlar se o menu mobile está aberto
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== SIDEBAR DESKTOP ===== */}
      {/* hidden lg:flex - escondida no mobile, visível no desktop */}
      {/* fixed inset-y-0 - fixa do topo ao fundo do ecrã */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 border-r border-border bg-sidebar">
        <NavContent />
      </aside>

      {/* ===== HEADER MOBILE (com hamburger) ===== */}
      {/* sticky top-0 - fica fixo no topo ao fazer scroll */}
      {/* lg:hidden - só visível no mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background border-b border-border px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Botão hamburger para abrir o menu */}
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>

          {/* Painel lateral que desliza da esquerda */}
          <SheetContent
            side="left"
            className="w-64 p-0 bg-sidebar border-border"
          >
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            {/* Ao clicar num link, fecha o sheet */}
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo no header mobile */}
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">PT Manager</span>
        </div>
      </header>
    </>
  );
}
