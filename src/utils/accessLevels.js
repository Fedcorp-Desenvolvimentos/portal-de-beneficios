export const ACCESS_LEVELS = {
  DESENVOLVEDOR: "dev",
  FINANCEIRO: "fin",
  FATURAMENTO: "fat",
  ADM: "adm",
  DEPARTAMENTO_PESSOAL: "dep",
  SUPERVISOR: "sup",
  CLIENTE: "cli",
};

export const ACCESS_LEVEL_LABELS = {
  [ACCESS_LEVELS.DESENVOLVEDOR]: "Desenvolvedor",
  [ACCESS_LEVELS.FINANCEIRO]: "Financeiro Fedcorp",
  [ACCESS_LEVELS.FATURAMENTO]: "Faturista Fedcorp",
  [ACCESS_LEVELS.ADM]: "Usuário da Administradora",
  [ACCESS_LEVELS.DEPARTAMENTO_PESSOAL]: "Departamento Pessoal",
  [ACCESS_LEVELS.SUPERVISOR]: "Supervisor da Administradora",
  [ACCESS_LEVELS.CLIENTE]: "Cliente(Condomínio)",
};

// Função para obter o label do nível de acesso
export const getAccessLevelLabel = (level) => {
  if (!level) return "Sem acesso";

  return (
    ACCESS_LEVEL_LABELS[level] ||
    level.charAt(0).toUpperCase() + level.slice(1)
  );
};

// Função para verificar se o usuário tem um nível específico
export const hasAccessLevel = (userLevel, requiredLevel) => {
  return userLevel === requiredLevel;
};

// Função para verificar se o usuário tem um dos níveis permitidos
export const hasAnyAccessLevel = (userLevel, allowedLevels = []) => {
  return allowedLevels.includes(userLevel);
};

// Função para obter a cor do badge baseada no nível
export const getAccessLevelColor = (level) => {
  const colors = {
    [ACCESS_LEVELS.DESENVOLVEDOR]: "#0284c7", // azul
    [ACCESS_LEVELS.FINANCEIRO]: "#16a34a", // verde
    [ACCESS_LEVELS.FATURAMENTO]: "#d97706", // laranja
    [ACCESS_LEVELS.ADM]: "#dc2626", // vermelho
    [ACCESS_LEVELS.DEPARTAMENTO_PESSOAL]: "#7c3aed", // roxo
    [ACCESS_LEVELS.SUPERVISOR]: "#0d9488", // teal
    [ACCESS_LEVELS.CLIENTE]: "#64748b", // cinza
  };

  return colors[level] || "#64748b";
};