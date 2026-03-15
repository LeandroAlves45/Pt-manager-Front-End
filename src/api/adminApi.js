/**
 * adminApi.js — chamadas à API de administração da plataforma.
 *
 * Todos os endpoints requerem role="superuser".
 * Qualquer outro role recebe HTTP 403.
 */

import api from './axiosConfig';

/**
 * Métricas globais da plataforma.
 *
 * @returns {Promise<{
 *   total_trainers: number,
 *   active_trainers: number,
 *   trialing_trainers: number,
 *   total_clients: number,
 *   estimated_monthly_revenue_eur: number
 * }>}
 */

export const getPlatformMetrics = async () => {
  const response = await api.get('/api/v1/admin/metrics');
  return response.data;
};

/**
 * Lista todos os trainers da plataforma com o estado das suas subscrições.
 *
 * @param {string} [statusFilter] - Filtrar por status: active | trialing | past_due | cancelled
 * @returns {Promise<Array<{
 *   user_id, full_name, email, is_active, is_exempt_from_billing,
 *   subscription_status, subscription_tier, active_clients_count,
 *   monthly_eur, trial_end, joined_at
 * }>>}
 */
export const getTrainers = async (statusFilter) => {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await api.get('/api/v1/admin/trainers', { params });
  return response.data;
};

/**
 * Suspende um trainer — bloqueia acesso imediatamente (is_active = false).
 *
 * @param {string} trainerId
 * @returns {Promise<{ detail: string }>}
 */
export const suspendTrainer = async (trainerId) => {
  const response = await api.post(
    `/api/v1/admin/trainers/${trainerId}/suspend`
  );
  return response.data;
};

/**
 * Reativa um trainer suspenso (is_active = true).
 *
 * @param {string} trainerId
 * @returns {Promise<{ detail: string }>}
 */
export const activateTrainer = async (trainerId) => {
  const response = await api.post(
    `/api/v1/admin/trainers/${trainerId}/activate`
  );
  return response.data;
};

/**
 * Concede isenção permanente de billing a um trainer (free-forever).
 * Equivale a subscrição PRO activa indefinidamente, sem Stripe.
 *
 * @param {string} trainerId
 * @returns {Promise<{ detail: string }>}
 */
export const grantExemption = async (trainerId) => {
  const response = await api.post(
    `/api/v1/admin/trainers/${trainerId}/grant-exemption`
  );
  return response.data;
};

/**
 * Revoga a isenção de billing de um trainer.
 *
 * @param {string} trainerId
 * @returns {Promise<{ detail: string }>}
 */
export const revokeExemption = async (trainerId) => {
  const response = await api.post(
    `/api/v1/admin/trainers/${trainerId}/revoke-exemption`
  );
  return response.data;
};
