// src/utils/dateUtils.js

export const obterDataVencimento = (dias = 1) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);

  // Pula fim de semana para próximo dia útil (segunda-feira)
  while (data.getDay() === 0 || data.getDay() === 6) {
    data.setDate(data.getDate() + 1);
  }

  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const day = String(data.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};