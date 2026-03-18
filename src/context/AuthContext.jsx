/**
 * AuthContext.jsx — contexto global de autenticação.
 *
 * Responsabilidades:
 *   - Armazenar o utilizador autenticado e o seu token JWT
 *   - Executar o login (chamar a API, guardar token, carregar branding)
 *   - Executar o logout (limpar estado e redirecionar)
 *   - Injectar o tema de cor do trainer via CSS variables no documento
 *   - Expor booleans de role para simplificar guards nos componentes
 *
 * Padrão de uso:
 *   // Qualquer componente dentro de <AuthProvider> pode fazer:
 *   const { user, login, logout, isTrainer, trainerSettings } = useAuth();
 *
 * O contexto é providenciado em main.jsx — envolve toda a app.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { hexToHSL } from '../utils/formatters';

// ============================================================
// Criação do contexto de autenticação - valor por defeito é null
// ============================================================

const AuthContext = createContext(null);

// ============================================================
// Função utilitária: aplica a cor do trainer como CSS variables
//
// Ao mudar --primary em runtime, todos os componentes que usam
// bg-primary, text-primary, border-primary actualizam automaticamente
// sem necessidade de rebuild — é o núcleo do white-label branding.
// ============================================================

function applyBrandColor(hexColor) {
  if (!hexColor) return;

  const hsl = hexToHSL(hexColor);

  // Aplica a todas as CSS variables que derivam da cor primária
  document.documentElement.style.setProperty('--primary', hsl);
  document.documentElement.style.setProperty('--sidebar-primary', hsl);
  document.documentElement.style.setProperty('--ring', hsl);
}

// ============================================================
// Provider — envolve a app e disponibiliza o contexto
// ============================================================

export function AuthProvider({ children }) {
  // Utilizador autenticado: { id, email, full_name, role, client_id } | null
  const [user, setUser] = useState(null);

  // Token JWT guardado no localStorage — lido aqui para sincronizar o estado
  const [token, setToken] = useState(() => localStorage.getItem('pt_token'));

  // Settings de branding do trainer: { primary_color, logo_url, app_name } | null
  const [trainerSettings, setTrainerSettings] = useState(null);

  // true enquanto a app verifica se há um token guardado válido (splash inicial)
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // ----------------------------------------------------------
  // Carregar settings de branding do trainer
  // Chamado após login com role="trainer" ou no restore de sessão
  // ----------------------------------------------------------

  const fetchTrainerSettings = useCallback(async () => {
    try {
      // GET /api/v1/trainer-profile/settings — devolve primary_color, logo_url, app_name
      const response = await api.get('/api/v1/trainer-profile/settings');
      const settings = response.data;

      setTrainerSettings(settings);

      // Aplica a cor do trainer imediatamente após carregar
      if (settings?.primary_color) {
        applyBrandColor(settings.primary_color);
      }
    } catch {
      // Se não existirem settings (trainer novo), usa a cor por defeito
      applyBrandColor('#00A8E8');
    }
  }, []);

  // ----------------------------------------------------------
  // Restaurar sessão ao carregar a app
  //
  // Ao abrir a app, verifica se há token guardado no localStorage.
  // Se sim, busca o perfil do utilizador para validar que o token
  // ainda é válido e restaurar o estado.
  // ----------------------------------------------------------

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('pt_token');

      if (!storedToken) {
        // Sem token — utilizador não está autenticado
        setIsLoading(false);
        return;
      }

      try {
        // Valida o token fazendo um pedido autenticado ao perfil
        // O interceptor do Axios injeta o Bearer token automaticamente
        const response = await api.get('/api/v1/auth/users/me');
        const userData = response.data;

        setUser(userData);
        setToken(storedToken);

        // Carrega branding se for trainer
        if (userData.role === 'trainer') {
          await fetchTrainerSettings();
        }
      } catch {
        // Token inválido ou expirado — limpa o estado
        // O interceptor 401 do Axios já redireciona para /login
        localStorage.removeItem('pt_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [fetchTrainerSettings]);

  // ----------------------------------------------------------
  // Login
  //
  // 1. Chama POST /api/v1/auth/login com email e password
  // 2. Guarda o token JWT no localStorage
  // 3. Busca o perfil completo do utilizador
  // 4. Carrega branding (se trainer)
  // 5. Redireciona para o dashboard correcto baseado no role
  // ----------------------------------------------------------

  const login = useCallback(
    async (email, password) => {
      // Chama o endpoint de login — devolve { access_token, role, user_id, full_name }
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      });
      const { access_token, role } = response.data;

      // Guarda token no localStorage para persistência entre sessões
      localStorage.setItem('pt_token', access_token);
      setToken(access_token);

      // Busca o perfil completo (o login só devolve dados básicos do JWT)
      const profileResponse = await api.get('/api/v1/auth/users/me');
      const userData = profileResponse.data;
      setUser(userData);

      // Carrega e aplica branding antes de redirecionar (evita flash de cor errada)
      if (role === 'trainer') {
        await fetchTrainerSettings();
      }

      // Redireciona para o dashboard correcto baseado no role do JWT
      // Cada role tem o seu próprio layout e conjunto de rotas
      if (role === 'superuser') {
        navigate('/admin/dashboard');
      } else if (role === 'trainer') {
        navigate('/trainer/dashboard');
      } else if (role === 'client') {
        navigate('/cliente/dashboard');
      }
    },
    [navigate, fetchTrainerSettings]
  );

  // ----------------------------------------------------------
  // Logout
  //
  // Limpa todo o estado de autenticação e redireciona para login.
  // ----------------------------------------------------------

  const logout = useCallback(() => {
    // Remove token do localStorage — o interceptor Axios deixa de o injectar
    localStorage.removeItem('pt_token');
    setToken(null);
    setUser(null);
    setTrainerSettings(null);

    // Repõe a cor por defeito (PT Manager azul) ao fazer logout
    applyBrandColor('#00A8E8');

    navigate('/login');
  }, [navigate]);

  // ----------------------------------------------------------
  // Valores expostos pelo contexto
  // ----------------------------------------------------------

  const value = {
    user,
    token,
    trainerSettings,
    isLoading,

    // Funções
    login,
    logout,
    fetchTrainerSettings, // exposto para o TrainerProfile actualizar o branding em runtime

    // Booleans de conveniência — evitam comparações de string nos componentes
    isAuthenticated: !!user,
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client',
    isSuperuser: user?.role === 'superuser',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook de conveniência — a única forma de consumir o contexto
//
// Uso: const { user, login, isTrainer } = useAuth();
// Lança erro se usado fora do AuthProvider (detecta erros cedo)
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de <AuthProvider>. Verifica o main.jsx.'
    );
  }

  return context;
}
