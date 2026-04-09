/**
 * axiosConfig.js — instância Axios centralizada para toda a aplicação.
 *
 * Esta é a única instância Axios que deve ser usada em toda a app.
 * Nunca usar fetch() ou criar outra instância Axios directamente.
 *
 * Configuração incluída:
 *   - Base URL (Railway em produção, localhost em desenvolvimento)
 *   - Header X-API-Key em todos os pedidos
 *   - Interceptor de request: injeta Bearer token JWT se existir
 *   - Interceptor de response: trata erros 401 (redireciona para login)
 *     e loga erros de validação 422 (Pydantic) de forma legível
 */

import axios from 'axios';

// Obtem variaveis de ambiente
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://pt-manager-back-end.onrender.com' // Produção
    : 'http://localhost:8000'); // Desenvolvimento local

const API_KEY = import.meta.env.VITE_API_KEY;

// ============================================================
// Criação da instância Axios com configuração base
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Tempo limite de 60 segundos
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-KEY': API_KEY }),
  },
});

// ============================================================
// Interceptor de REQUEST — injeta o Bearer token JWT
//
// Este interceptor é executado antes de cada pedido ser enviado.
// Lê o token do localStorage e adiciona ao header Authorization.
// ============================================================

api.interceptors.request.use(
  (config) => {
    // Lê o token guardado no login (AuthContext.login guarda aqui)
    const token = localStorage.getItem('pt_token');

    if (token) {
      // Formato Bearer padrão JWT
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de desenvolvimento: método e URL do pedido
    if (import.meta.env.MODE === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// Interceptor de RESPONSE — tratamento centralizado de erros
//
// Este interceptor é executado após receber cada resposta.
// Casos tratados:
//   401 — token expirado ou inválido: limpa localStorage e redireciona para login
//   422 — erro de validação Pydantic: loga cada campo com erro individualmente
//   outros — loga o status e o body do erro
// ============================================================

api.interceptors.response.use(
  // Repostas com sucesso (2xx) passam direto
  (response) => response,

  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expirado, inválido, ou utilizador inativo.
        // Limpa o estado de autenticação e força novo login.

        const isOnLoginPage = window.location.pathname === '/login';

        if (!isOnLoginPage) {
          localStorage.removeItem('pt_token');
          window.location.href = '/login';
        }
      } else if (status === 422) {
        // Erro de validação do Pydantic.
        // O campo "detail" é um array com todos os erros de validação.
        console.error(`❌ Erro 422 - Validação falhou:`);

        if (data.detail && Array.isArray(data.detail)) {
          data.detail.forEach((err) => {
            // loc: localização do erro (ex: ["body", "name"])
            // msg: mensagem do erro
            // type: tipo do erro Pydantic
            console.error(
              `  Campo: ${err.loc.join(' → ')} | Erro: ${err.msg} | Tipo: ${err.type}`
            );
          });
        } else {
          // Fallback para outros formatos de erro 422
          console.error(JSON.stringify(data, null, 2));
        }
      } else if (status === 402) {
        // Subcrição expirada — o componente deve mostrar um aviso de billing
        console.warn(
          `⚠️ Erro 402: Subscrição expirada ou inativa.`,
          data?.detail
        );
      } else {
        console.error(`❌ Erro ${status}:`, data);
      }
    } else {
      // Sem resposta do servidor (ex: rede offline, timeout)
      console.error('❌ Erro de rede ou timeout.', error.message);
    }

    // Propaga o erro para o caller tratar a UI
    return Promise.reject(error);
  }
);

export default api;
