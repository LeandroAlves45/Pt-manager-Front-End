import api from './axiosConfig';

// == EXERCÍCIOS ==

/**
 * Lista todos os exercícios com filtros opcionais
 *
 * @param {Object} params - Parâmetros de filtro
 * @param {string} [params.q] - pesquisa por nome
 * @param {boolean} [params.only_active] - só exercícios ativos
 * @param {number} [params.page_size] - tamanho da página
 * @param {number} [params.page_number] - número da página
 * @returns {Promise<Array>} Lista de exercícios
 */
export const getExercises = async (params = {}) => {
  const response = await api.get('/api/v1/exercises/', { params });
  return response.data;
};

/**
 * Cria um novo exercício
 *
 * @param {Object} data - Dados do exercício {name, muscles...}
 * @returns {Promise<Object>} Exercício criado
 */
export const createExercise = async (data) => {
  const response = await api.post('/api/v1/exercises/', data);
  return response.data;
};

/**
 * Atualiza um exercício existente
 *
 * @param {string} id - ID do exercicio
 * @param {Object} data - Dados do exercício a atualizar (mesmos campos de createExercise)
 * @returns {Promise<Object>} Exercício atualizado
 */
export const updateExercise = async (id, data) => {
  const response = await api.put(`/api/v1/exercises/${id}/`, data);
  return response.data;
};
