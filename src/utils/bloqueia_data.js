// src/utils/dateUtils.js

export const obterDataVencimento = (dias = 1) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  
  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const day = String(data.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};