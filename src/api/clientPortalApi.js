/**
 * clientPortalApi.js — chamadas à API do portal do cliente.
 *
 * Todos os endpoints usam o JWT para identificar o cliente automaticamente.
 * O cliente nunca precisa de saber o seu próprio client_id.
 */

import api from './axiosConfig';

/** Perfil do cliente autenticado */
export const getMyProfile = async () => {
  const response = await api.get('/api/v1/portal/my-profile');
  return response.data;
};

/**
 * Plano de treino activo com todos os dias e exercícios.
 * Retorna { active_plan, plan, days } — days pode ser [] se não houver plano.
 */

export const getMyTrainingPlan = async () => {
  const response = await api.get('/api/v1/portal/my-plan');
  return response.data;
};

/** Lista de planos alimentares activos do cliente com refeições e macros*/
export const getMyMealPlans = async () => {
  const response = await api.get('/api/v1/portal/my-meal-plans');
  return response.data;
};

/** Todos os check-ins do cliente */
export const getMyCheckIns = async () => {
  const response = await api.get('/api/v1/portal/my-check-ins');
  return response.data;
};

/**
 * Submete a resposta do cliente a um check-in pendente.
 *
 * @param {string} checkinId
 * @param {Object} data - { weight_kg, body_fat, client_notes, questionnaire, photos }
 */
export const respondToCheckIn = async (checkinId, data) => {
  const response = await api.post(
    `/api/v1/portal/check-ins/${checkinId}/respond`,
    data
  );
  return response.data;
};
