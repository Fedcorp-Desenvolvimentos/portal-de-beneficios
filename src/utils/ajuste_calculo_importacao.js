// src/utils/ajuste_calculo_importacao.js

/**
 * ATUALIZA O DATA_TO_BACKEND COM OS VALORES ATUAIS DO LOTE
 * @param {Object} loteAtual - Objeto do lote com rows atualizadas
 * @param {Object} dataToBackendOriginal - Objeto original do backend
 * @returns {Object} - Novo objeto data_to_backend sincronizado
 */
export function atualizarDataToBackend(loteAtual, dataToBackendOriginal) {
  // Criar uma cópia profunda
  const dataToBackendAtualizado = JSON.parse(JSON.stringify(dataToBackendOriginal));
  
  // Mapa de funcionários atualizados por CPF
  const funcionariosAtualizados = {};
  loteAtual.rows.forEach(funcionario => {
    if (funcionario.cpf) {
      funcionariosAtualizados[funcionario.cpf] = funcionario;
    }
  });
  
  // Mapa de condomínios por nome
  const condominiosMap = {};
  if (dataToBackendAtualizado.condominios) {
    dataToBackendAtualizado.condominios.forEach(cond => {
      condominiosMap[cond.nome || cond.condominio] = cond;
    });
  }
  
  // Atualizar funcionários em todos os condomínios
  if (dataToBackendAtualizado.condominios && Array.isArray(dataToBackendAtualizado.condominios)) {
    dataToBackendAtualizado.condominios.forEach(condominio => {
      if (condominio.funcionarios && Array.isArray(condominio.funcionarios)) {
        condominio.funcionarios.forEach(funcionario => {
          const funcionarioAtualizado = funcionariosAtualizados[funcionario.cpf];
          
          if (funcionarioAtualizado) {
            // Atualizar valor total
            const valorTotal = typeof funcionarioAtualizado.valor_total === 'string' 
              ? parseFloat(funcionarioAtualizado.valor_total) 
              : funcionarioAtualizado.valor_total;
            funcionario.valor_total = valorTotal;
            
            // Atualizar benefícios
            if (funcionarioAtualizado.beneficios && Array.isArray(funcionarioAtualizado.beneficios)) {
              funcionario.beneficios = funcionarioAtualizado.beneficios.map(b => ({
                codigo: b.codigo,
                nome: b.nome || b.nome_beneficio || b.produto_nome || b.produto,
                valor: typeof b.valor === 'number' ? b.valor : parseFloat(b.valor) || 0
              }));
            }
          }
        });
      }
    });
  }
  
  // RECALCULAR SUMMARY COMPLETO
  if (dataToBackendAtualizado.summary) {
    let novoTotalBeneficios = 0;
    let totalMovimentacoes = 0;
    const novoTotalPorBeneficiario = [];
    
    loteAtual.rows.forEach(funcionario => {
      const valorTotal = typeof funcionario.valor_total === 'string' 
        ? parseFloat(funcionario.valor_total) 
        : funcionario.valor_total;
      
      novoTotalBeneficios += valorTotal;
      
      // Contar movimentações (benefícios individuais)
      if (funcionario.beneficios && Array.isArray(funcionario.beneficios)) {
        totalMovimentacoes += funcionario.beneficios.length;
      }
      
      novoTotalPorBeneficiario.push({
        nome_funcionario: funcionario.nome_funcionario,
        cpf: funcionario.cpf,
        valor_total: valorTotal.toFixed(2),
        condominio: funcionario.condominio,
        cep: funcionario.cep || ''
      });
    });
    
    dataToBackendAtualizado.summary.valor_total_beneficios = novoTotalBeneficios.toFixed(2);
    dataToBackendAtualizado.summary.total_funcionarios = loteAtual.rows.length;
    dataToBackendAtualizado.summary.total_por_beneficiario = novoTotalPorBeneficiario;
    dataToBackendAtualizado.summary.total_movimentacoes = totalMovimentacoes;
  }
  
  // Atualizar movimentacoes_detalhada se existir
  if (dataToBackendAtualizado.movimentacoes_detalhada && Array.isArray(dataToBackendAtualizado.movimentacoes_detalhada)) {
    const novasMovimentacoes = [];
    
    loteAtual.rows.forEach(funcionario => {
      if (funcionario.beneficios && Array.isArray(funcionario.beneficios)) {
        funcionario.beneficios.forEach(beneficio => {
          novasMovimentacoes.push({
            nome_funcionario: funcionario.nome_funcionario,
            cpf: funcionario.cpf,
            condominio: funcionario.condominio,
            cep: funcionario.cep || '',
            produto_codigo: beneficio.codigo,
            produto: beneficio.nome,
            valor_recarga_bene: beneficio.valor,
            quantidade: 1
          });
        });
      }
    });
    
    dataToBackendAtualizado.movimentacoes_detalhada = novasMovimentacoes;
  }
  
  return dataToBackendAtualizado;
}

/**
 * CALCULA O TOTAL DO LOTE ATUAL
 */
export function calcularTotalLote(loteAtual) {
  let total = 0;
  loteAtual.rows.forEach(funcionario => {
    const valor = typeof funcionario.valor_total === 'string' 
      ? parseFloat(funcionario.valor_total) 
      : funcionario.valor_total;
    total += valor;
  });
  return total;
}

/**
 * APLICA AJUSTES NOS BENEFÍCIOS PARA RESPEITAR O LIMITE
 */
export function aplicarAjusteLimiteBeneficios(loteAtual, limiteMaximo = 2500) {
  const loteAjustado = JSON.parse(JSON.stringify(loteAtual));
  const ajustesRealizados = [];
  
  loteAjustado.rows.forEach(funcionario => {
    let valorTotal = typeof funcionario.valor_total === 'string' 
      ? parseFloat(funcionario.valor_total) 
      : funcionario.valor_total;
    
    if (valorTotal > limiteMaximo) {
      const excesso = valorTotal - limiteMaximo;
      let valorParaReduzir = excesso;
      
      // Ordenar benefícios do maior para o menor
      if (funcionario.beneficios && Array.isArray(funcionario.beneficios)) {
        const beneficiosOrdenados = [...funcionario.beneficios].sort((a, b) => b.valor - a.valor);
        
        for (let i = 0; i < beneficiosOrdenados.length && valorParaReduzir > 0.01; i++) {
          const beneficioOriginal = funcionario.beneficios.find(b => b.codigo === beneficiosOrdenados[i].codigo);
          
          if (beneficioOriginal && beneficioOriginal.valor > 0) {
            const reducaoPossivel = Math.min(beneficioOriginal.valor, valorParaReduzir);
            beneficioOriginal.valor = parseFloat((beneficioOriginal.valor - reducaoPossivel).toFixed(2));
            valorParaReduzir = parseFloat((valorParaReduzir - reducaoPossivel).toFixed(2));
          }
        }
        
        // Recalcular valor total
        let novoValorTotal = 0;
        funcionario.beneficios.forEach(b => {
          novoValorTotal += b.valor;
        });
        funcionario.valor_total = parseFloat(novoValorTotal.toFixed(2));
        
        ajustesRealizados.push({
          nome: funcionario.nome_funcionario,
          cpf: funcionario.cpf,
          valor_original: valorTotal,
          valor_ajustado: funcionario.valor_total,
          reducao: (valorTotal - funcionario.valor_total).toFixed(2)
        });
      }
    }
  });
  
  if (ajustesRealizados.length > 0) {
    // console.log('✅ Ajustes aplicados:', ajustesRealizados);
  }
  
  return loteAjustado;
}

/**
 * PREPARA DADOS PARA ENVIO - SINCRONIZA TUDO
 */
export function prepararDadosParaEnvio(loteAtual, dataToBackendOriginal, limiteMaximo = 2500) {
  // Aplicar ajustes de limite
  const loteComAjustes = aplicarAjusteLimiteBeneficios(loteAtual, limiteMaximo);
  
  // Sincronizar com backend
  const dataToBackendSincronizado = atualizarDataToBackend(loteComAjustes, dataToBackendOriginal);
  
  return dataToBackendSincronizado;
}

/**
 * VERIFICA SE DADOS ESTÃO SINCRONIZADOS
 */
export function verificarSincronizacao(loteAtual, dataToBackend) {
  let totalLote = calcularTotalLote(loteAtual);
  
  let totalBackend = 0;
  if (dataToBackend?.summary?.valor_total_beneficios) {
    totalBackend = parseFloat(dataToBackend.summary.valor_total_beneficios);
  }
  
  const diferenca = Math.abs(totalLote - totalBackend);
  const sincronizado = diferenca < 0.01;
  
  return {
    sincronizado,
    total_lote: totalLote.toFixed(2),
    total_backend: totalBackend.toFixed(2),
    diferenca: diferenca.toFixed(2)
  };
}

/**
 * OBTEM DADOS DO MODAL CORRETOS
 */
export function obterDadosModalCorretos(loteAtual, dataToBackendOriginal) {
  const dataSincronizada = prepararDadosParaEnvio(loteAtual, dataToBackendOriginal);
  
  let totalMovimentacoes = 0;
  loteAtual.rows.forEach(func => {
    if (func.beneficios) totalMovimentacoes += func.beneficios.length;
  });
  
  const totalValor = calcularTotalLote(loteAtual);
  
  return {
    totalFuncionarios: loteAtual.rows.length,
    totalMovimentacoes: totalMovimentacoes,
    valorTotalBeneficios: totalValor,
    dataToBackendSincronizado: dataSincronizada
  };
}