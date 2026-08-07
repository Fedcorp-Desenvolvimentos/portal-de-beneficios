/**
 * Modo de cobrança da taxa de administração.
 *
 * O modo é persistido em `Administradora.taxa_modo`. Não tente deduzi-lo das
 * TaxaConfig gravadas: "por produto" e "por condomínio" gravam na mesma tabela,
 * então a presença de registros não distingue um do outro.
 */
export const MODO_TAXA_FORM_PARA_API = {
  padrao: 'PADRAO',
  produto: 'PRODUTO',
  condominio: 'CONDOMINIO',
}

export const MODO_TAXA_API_PARA_FORM = {
  PADRAO: 'padrao',
  PRODUTO: 'produto',
  CONDOMINIO: 'condominio',
}
