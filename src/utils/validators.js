/**
 * validators.js — regras de validação reutilizáveis para react-hook-form.
 *
 * Uso:
 *   import { emailRules, passwordRules } from '@/utils/validators';
 *   <Input {...register('email', emailRules)} />
 */

// ---------------------------------------------------------------------------
// Padrões regex
// ---------------------------------------------------------------------------

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;
export const URL_REGEX = /^https?:\/\/.+/;

// ---------------------------------------------------------------------------
// Regras para react-hook-form
// ---------------------------------------------------------------------------

/** Email — usado em LoginPage, TrainerSignupPage, ClientFormDialog */
export const emailRules = {
  required: 'Email é obrigatório',
  pattern: {
    value: EMAIL_REGEX,
    message: 'Email inválido',
  },
};

/** Password cliente — mínimo 6 caracteres */
export const passwordRules = {
  required: 'Password é obrigatória',
  minLength: { value: 6, message: 'A password deve ter pelo menos 6 caracteres' },
};

/** Password trainer — mínimo 8 caracteres */
export const trainerPasswordRules = {
  required: 'A password é obrigatória',
  minLength: { value: 8, message: 'A password deve ter no mínimo 8 caracteres' },
};

/**
 * Regras de confirmação de password.
 * @param {string} passwordValue — valor atual do campo password
 */
export const confirmPasswordRules = (passwordValue) => ({
  required: 'Confirmação de password é obrigatória',
  validate: (value) => value === passwordValue || 'As passwords não coincidem',
});

/** Nome completo — mínimo 2 caracteres */
export const fullNameRules = {
  required: 'Nome é obrigatório',
  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
};

/** Telemóvel — mínimo 9 dígitos (formato PT) */
export const phoneRules = {
  required: 'Telemóvel é obrigatório',
  minLength: { value: 9, message: 'Mínimo de 9 caracteres' },
};

/** Altura em cm (60–260) */
export const heightRules = {
  required: 'Altura é obrigatória',
  min: { value: 60, message: 'Mínimo de 60 cm' },
  max: { value: 260, message: 'Máximo de 260 cm' },
};

/** Cor hex #RRGGBB */
export const hexColorRules = {
  required: 'A cor é obrigatória',
  pattern: {
    value: HEX_COLOR_REGEX,
    message: 'Formato inválido. Use #RRGGBB',
  },
};

/** URL de vídeo (http/https) */
export const videoUrlRules = {
  pattern: {
    value: URL_REGEX,
    message: 'URL inválido — deve começar com http:// ou https://',
  },
};

// ---------------------------------------------------------------------------
// Utilitários de pesquisa
// ---------------------------------------------------------------------------

/**
 * Verifica se algum dos campos de um objecto contém o termo de pesquisa (case-insensitive).
 * @param {string} query
 * @param {...string} fields
 * @returns {boolean}
 *
 * Exemplo:
 *   clients.filter(c => matchesSearch(search, c.full_name, c.email, c.phone))
 */
export function matchesSearch(query, ...fields) {
  const q = query.toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(q));
}
