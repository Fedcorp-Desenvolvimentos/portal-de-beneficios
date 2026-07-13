// styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* ===== VARIÁVEIS GLOBAIS ===== */
  :root {
    /* Cores principais - Tema corporativo azul */
    --color-primary: #0F3D5D;
    --color-primary-dark: #1e4fbd;
    --color-primary-light: #e8f0fe;
    --color-primary-bg: #f0f7ff;
    
    /* Cores de texto */
    --color-text-primary: #1e293b;
    --color-text-secondary: #475569;
    --color-text-tertiary: #64748b;
    --color-text-disabled: #94a3b8;
    
    /* Cores de fundo */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f8fafc;
    --color-bg-tertiary: #f1f5f9;
    --color-bg-card: #ffffff;
    
   --panel: #ffffff;
   --text: #1e293b;
   --muted: #64748b;
   --border: #cbd5e1;
   --bg: #f8fafc;

    /* Cores de borda */
    --color-border-light: #e2e8f0;
    --color-border: #cbd5e1;
    --color-border-dark: #94a3b8;
    
    /* Cores de feedback */
    --color-success: #10b981;
    --color-success-bg: #e8f5e9;
    --color-warning: #f59e0b;
    --color-warning-bg: #fff3e0;
    --color-danger: #ef4444;
    --color-danger-bg: #fee2e2;
    --color-info: #3b82f6;
    --color-info-bg: #e0f2fe;
    
    /* Sombras */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    
    /* Espaçamentos */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    
    /* Bordas */
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;
    --radius-full: 9999px;
    
    /* Fontes */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    
    /* Pesos */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Altura de linha */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
    
    /* Transições */
    --transition-fast: 150ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
    
    /* Z-index */
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;
  }

  /* ===== RESET E ESTILOS BASE ===== */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    background-color: var(--color-bg-secondary);
    overflow-x: hidden;
  }

  /* ===== TIPOGRAFIA ===== */
  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.875rem; }

  p {
    margin-bottom: var(--spacing-md);
    color: var(--color-text-secondary);
  }

  /* ===== LINKS ===== */
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-primary-dark);
  }

  /* ===== BOTÕES ===== */
  button {
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    border: none;
    background: none;
    transition: all var(--transition-base);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ===== FORMULÁRIOS ===== */
  input, textarea, select {
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  input::placeholder {
    color: var(--color-text-disabled);
  }

  /* ===== SCROLLBAR ===== */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-full);
    transition: background var(--transition-fast);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-dark);
  }

  /* ===== UTILITÁRIOS ===== */
  .text-primary { color: var(--color-text-primary); }
  .text-secondary { color: var(--color-text-secondary); }
  .text-tertiary { color: var(--color-text-tertiary); }
  .text-success { color: var(--color-success); }
  .text-warning { color: var(--color-warning); }
  .text-danger { color: var(--color-danger); }
  .text-info { color: var(--color-info); }

  .bg-primary { background-color: var(--color-bg-primary); }
  .bg-secondary { background-color: var(--color-bg-secondary); }
  .bg-tertiary { background-color: var(--color-bg-tertiary); }
  .bg-success { background-color: var(--color-success-bg); }
  .bg-warning { background-color: var(--color-warning-bg); }
  .bg-danger { background-color: var(--color-danger-bg); }
  .bg-info { background-color: var(--color-info-bg); }

  /* Margens */
  .m-0 { margin: 0; }
  .mt-1 { margin-top: var(--spacing-xs); }
  .mt-2 { margin-top: var(--spacing-sm); }
  .mt-3 { margin-top: var(--spacing-md); }
  .mt-4 { margin-top: var(--spacing-lg); }
  .mt-5 { margin-top: var(--spacing-xl); }

  .mb-1 { margin-bottom: var(--spacing-xs); }
  .mb-2 { margin-bottom: var(--spacing-sm); }
  .mb-3 { margin-bottom: var(--spacing-md); }
  .mb-4 { margin-bottom: var(--spacing-lg); }
  .mb-5 { margin-bottom: var(--spacing-xl); }

  /* Paddings */
  .p-0 { padding: 0; }
  .p-1 { padding: var(--spacing-xs); }
  .p-2 { padding: var(--spacing-sm); }
  .p-3 { padding: var(--spacing-md); }
  .p-4 { padding: var(--spacing-lg); }
  .p-5 { padding: var(--spacing-xl); }

  /* Flex */
  .d-flex { display: flex; }
  .flex-row { flex-direction: row; }
  .flex-col { flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }
  .flex-1 { flex: 1; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .items-end { align-items: flex-end; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-start { justify-content: flex-start; }
  .justify-end { justify-content: flex-end; }
  .gap-1 { gap: var(--spacing-xs); }
  .gap-2 { gap: var(--spacing-sm); }
  .gap-3 { gap: var(--spacing-md); }
  .gap-4 { gap: var(--spacing-lg); }

  /* Texto */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .text-uppercase { text-transform: uppercase; }
  .text-capitalize { text-transform: capitalize; }

  /* Bordas */
  .rounded-sm { border-radius: var(--radius-sm); }
  .rounded-md { border-radius: var(--radius-md); }
  .rounded-lg { border-radius: var(--radius-lg); }
  .rounded-xl { border-radius: var(--radius-xl); }
  .rounded-full { border-radius: var(--radius-full); }

  /* Sombras */
  .shadow-sm { box-shadow: var(--shadow-sm); }
  .shadow-md { box-shadow: var(--shadow-md); }
  .shadow-lg { box-shadow: var(--shadow-lg); }
  .shadow-xl { box-shadow: var(--shadow-xl); }

  /* Largura total */
  .w-full { width: 100%; }
  .h-full { height: 100%; }

  /* Ocultar elementos */
  .hidden { display: none; }

  @media (max-width: 768px) {
    .hidden-mobile { display: none; }
  }

  @media (min-width: 769px) {
    .hidden-desktop { display: none; }
  }
`;