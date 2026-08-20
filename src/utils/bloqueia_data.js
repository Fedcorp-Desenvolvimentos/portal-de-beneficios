// src/utils/dateUtils.js

export const obterDataVencimento = (dias = 1) => {
  const data = new Date();

  // Conta em DIAS ÚTEIS: cada incremento pula sábado e domingo, então
  // obterDataVencimento(2) numa sexta devolve terça (e não domingo→segunda,
  // como na versão anterior que somava dias corridos e só depois pulava o
  // fim de semana).
  for (let i = 0; i < dias; i++) {
    data.setDate(data.getDate() + 1);
    while (data.getDay() === 0 || data.getDay() === 6) {
      data.setDate(data.getDate() + 1);
    }
  }

  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const day = String(data.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};