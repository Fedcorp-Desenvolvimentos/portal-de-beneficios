import * as XLSX from 'xlsx';

/**
 * Detecta se o arquivo é do tipo Vale Transporte ou Benefícios
 */
export function detectarTipoArquivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheets = workbook.SheetNames;
        console.log('Abas encontradas:', sheets);
        
        // Verifica se é planilha de Vale Transporte
        // Pode ter: 'EMPRESA' e 'USUARIOS' ou apenas 'USUARIOS'
        const temAbaEmpresa = sheets.includes('EMPRESA');
        const temAbaUsuarios = sheets.includes('USUARIOS');
        const temAbaProdutos = sheets.includes('PRODUTOS');
        
        // Se tem USUARIOS, verifica o cabeçalho
        if (temAbaUsuarios) {
          const sheet = workbook.Sheets['USUARIOS'];
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          
          // Procura pelo cabeçalho específico do VT
          let isVT = false;
          for (let i = 0; i < Math.min(data.length, 10); i++) {
            const row = data[i];
            if (row && row[0] === 'CNPJ*') {
              isVT = true;
              break;
            }
          }
          
          if (isVT) {
            console.log('Detectado: Planilha de Vale Transporte (encontrado cabeçalho CNPJ*)');
            resolve({ tipo: 'VT', sheets: sheets });
            return;
          }
        }
        
        // Se não identificou como VT, verifica se é Benefícios
        // Pega a primeira aba disponível
        const primeiraAba = sheets[0];
        const sheet = workbook.Sheets[primeiraAba];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (data && data.length > 0) {
          const headers = (data[0] || []).map(h => String(h || '').toLowerCase());
          console.log('Cabeçalhos encontrados:', headers);
          
          // Verifica colunas de benefícios
          const hasBeneficioCols = headers.some(h => 
            h.includes('cpf_funcionario') || 
            h.includes('codigo_produto') || 
            h.includes('valor_beneficio') ||
            h.includes('valor_recarga_bene') ||
            h.includes('nome_produto')
          );
          
          if (hasBeneficioCols) {
            console.log('Detectado: Planilha de Benefícios');
            resolve({ tipo: 'BENEFICIOS', sheets: sheets });
            return;
          }
        }
        
        // Se chegou aqui, tenta identificar pelo nome da aba
        if (temAbaUsuarios) {
          console.log('Detectado: Planilha de Vale Transporte (apenas pela aba USUARIOS)');
          resolve({ tipo: 'VT', sheets: sheets });
          return;
        }
        
        console.log('Detectado: Tipo desconhecido');
        resolve({ tipo: 'DESCONHECIDO', sheets: sheets });
        
      } catch (error) {
        console.error('Erro ao detectar tipo:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erro ao ler arquivo:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Valida se o arquivo é compatível com VT
 */
export function isValeTransporteFile(file) {
  const nomeArquivo = file.name.toLowerCase();
  // Verifica pelo nome
  return nomeArquivo.includes('vt') || 
         nomeArquivo.includes('vale') || 
         nomeArquivo.includes('transporte');
}

/**
 * Versão síncrona para verificar por extensão/nome
 */
export function isValeTransporteByFileName(fileName) {
  const nome = fileName.toLowerCase();
  return nome.includes('vt') || nome.includes('vale') || nome.includes('transporte');
}