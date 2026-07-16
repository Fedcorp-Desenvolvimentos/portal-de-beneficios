import React, { useRef, useState } from 'react';
import { FiUpload, FiDownload, FiX } from 'react-icons/fi';
import { useSnackbar } from 'notistack';
import StatusBadge from './StatusBadge';
import {
  baixarModeloValeTransporte,
  baixarModeloBeneficios,
} from '../../utils/modelo_planilha.js';
import { useLoading } from '../../hooks/useLoading';
import { useAuth } from '../../context/AuthContext.jsx';

import { isNovaPlanilhaValeTransporte, parseNovaPlanilhaValeTransporte } from '../../utils/parser_nova_planilha';
import { detectarTipoArquivo, isValeTransporteFile } from '../../utils/detectorTipoArquivo';
import { vtService } from '../../services/vtService';
import { uploadService } from '../../services/uploadService';
import { downloadService } from '../../services/downloadService.js';

import * as S from './FileUploadStyles';

function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalCard onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h3>{title}</h3>
          <S.GhostButton onClick={onClose}>
            <FiX size={18} />
          </S.GhostButton>
        </S.ModalHeader>
        <S.ModalBody>{children}</S.ModalBody>
      </S.ModalCard>
    </S.ModalOverlay>
  );
}

export default function FileUpload({ onUpload }) {
  const inputRef = useRef();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [modelosOpen, setModelosOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { startLoading, stopLoading } = useLoading();
  const { user } = useAuth();

  const handlePick = () => inputRef.current?.click();

  const detectarFormato = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        
        if (isNovaPlanilhaValeTransporte(arrayBuffer)) {
          try {
            const parsed = parseNovaPlanilhaValeTransporte(arrayBuffer);
            resolve({ formato: 'nova_planilha', data: parsed });
          } catch (error) {
            reject(error);
          }
        } else {
          resolve({ formato: 'padrao', data: null });
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  const processUpload = async (file, userAdministradoraId) => {
    setStatus('processando');
    setMessage('Processando arquivo...');
    setFileName(file.name);

    try {
      startLoading('Fazendo upload do arquivo...');

      let tipoArquivo;
      try {
        tipoArquivo = await detectarTipoArquivo(file);
        // console.log('Tipo de arquivo detectado:', tipoArquivo);
      } catch (detectError) {
        console.error('Erro na detecção automática:', detectError);
        const isVT = isValeTransporteFile(file);
        tipoArquivo = { tipo: isVT ? 'VT' : 'BENEFICIOS', sheets: [] };
        // console.log('Fallback por nome do arquivo:', tipoArquivo);
      }
      
      let uploadResult;
      
      if (tipoArquivo.tipo === 'VT') {
        // console.log('Processando como Vale Transporte');
        const vtResponse = await vtService.uploadVTFile(file, userAdministradoraId);
        
        uploadResult = {
          success: true,
          ...vtResponse,
          tipo_processamento: 'VT',
          dados_validados: vtResponse.dados_validados || vtResponse.movimentacoes_detalhada || [],
          summary: {
            ...vtResponse.summary,
            total_por_beneficiario: vtResponse.summary?.total_por_beneficiario || [],
            total_registros: vtResponse.summary?.total_registros || vtResponse.summary?.total_movimentacoes || 0,
            total_funcionarios: vtResponse.summary?.total_funcionarios || 0,
            valor_total_vt: vtResponse.summary?.valor_total_beneficios || vtResponse.summary?.valor_total_vt || 0
          }
        };
        
        // console.log('Resultado VT processado:', uploadResult);
        
      } else if (tipoArquivo.tipo === 'BENEFICIOS') {
        try {
          const deteccao = await detectarFormato(file);
          
          if (deteccao.formato === 'nova_planilha') {
            const dadosConvertidos = {
              data_to_backend: {
                movimentacoes_detalhada: deteccao.data.movimentacoes,
                summary: {
                  total_por_beneficiario: agregarPorBeneficiario(deteccao.data.movimentacoes),
                  total_registros: deteccao.data.total_registros,
                  total_funcionarios: deteccao.data.total_funcionarios,
                }
              },
              detail: 'Arquivo processado com sucesso',
              success: true,
              file_upload_id: Date.now(),
              tipo_processamento: 'BENEFICIOS'
            };
            
            uploadResult = { success: true, ...dadosConvertidos };
          } else {
            const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
            uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
          }
        } catch (parseError) {
          console.error('Erro no parse do formato:', parseError);
          const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
          uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
        }
      } else {
        if (tipoArquivo.sheets && tipoArquivo.sheets.includes('USUARIOS')) {
          // console.log('Arquivo com aba USUARIOS, tentando como Vale Transporte');
          const vtResponse = await vtService.uploadVTFile(file, userAdministradoraId);
          uploadResult = {
            success: true,
            ...vtResponse,
            tipo_processamento: 'VT',
            dados_validados: vtResponse.dados_validados || vtResponse.movimentacoes_detalhada || [],
            summary: {
              ...vtResponse.summary,
              total_por_beneficiario: vtResponse.summary?.total_por_beneficiario || [],
              valor_total_vt: vtResponse.summary?.valor_total_beneficios || 0
            }
          };
        } else {
          console.warn('Tipo de arquivo desconhecido, tentando como Benefícios');
          const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
          uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
        }
      }

      let resultadoHandle = { success: true };
      if (onUpload && typeof onUpload === 'function') {
        resultadoHandle = await onUpload({ file, result: uploadResult }) || { success: true };
      }

      const errosInternos = uploadResult?.data_to_backend?.errors;
      const statusErro = uploadResult?.status === 'ERRO';
      const temErrosInternos = Array.isArray(errosInternos) && errosInternos.length > 0;

      if (!resultadoHandle.success || statusErro || temErrosInternos) {
        setStatus('erro');
        const msgErro =
          (Array.isArray(errosInternos) ? errosInternos.join('; ') : null) ||
          uploadResult?.detail ||
          uploadResult?.error ||
          'Erro ao processar o arquivo.';
        setMessage(msgErro);
        enqueueSnackbar(msgErro, { variant: 'error' });
      } else {
        setStatus('sucesso');
        setMessage(uploadResult.detail || uploadResult.message || 'Arquivo processado com sucesso.');
        enqueueSnackbar(uploadResult.detail || uploadResult.message || 'Arquivo processado com sucesso.', { variant: 'success' });
      }
    } catch (error) {
      console.error('Erro no processamento:', error);
      setStatus('erro');
      const data = error.response?.data;
      const errorMsg =
        data?.detail ||
        data?.error ||
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        error.message ||
        'Erro desconhecido ao processar o arquivo.';
      setMessage(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      stopLoading();
    }
  };

  function agregarPorBeneficiario(movimentacoes) {
    const mapa = new Map();
    
    for (const mov of movimentacoes) {
      const key = `${mov.cpf_funcionario}`;
      
      if (!mapa.has(key)) {
        mapa.set(key, {
          ...mov,
          valor_total: 0,
          quantidade_dias: 0,
        });
      }
      
      const atual = mapa.get(key);
      atual.valor_total += mov.valor_beneficio_total;
      atual.quantidade_dias += mov.quantidade_dias || 0;
    }
    
    return Array.from(mapa.values());
  }

  const validarArquivo = (file) => {
    if (!/\.(csv|txt|xlsx|xls|xlsm)$/i.test(file.name)) {
      setStatus('erro');
      setMessage('Formato inválido. Selecione um arquivo .txt, .csv, .xlsx ou .xlsm');
      setFileName('');
      enqueueSnackbar('Formato inválido. Selecione um arquivo .txt, .csv, .xlsx ou .xlsm', { variant: 'error' });
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validarArquivo(file)) return;
    const userAdministradoraId = user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa || null;
    processUpload(file, userAdministradoraId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!validarArquivo(file)) return;
    const userAdministradoraId = user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa || null;
    processUpload(file, userAdministradoraId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBaixarValeTransporte = () => {
    downloadService.downloadExcelVT();
    setModelosOpen(false);
    enqueueSnackbar('Download do modelo de Vale Transporte iniciado', { variant: 'info' });
  };

  const handleBaixarBeneficios = () => {
    downloadService.downloadExcelBeneficios();
    setModelosOpen(false);
    enqueueSnackbar('Download do modelo de Benefícios iniciado', { variant: 'info' });
  };

  return (
    <>
      <S.UploadCard>
        <S.UploadHeader>
          <S.UploadHeaderMain>
            <S.UploadIconWrapper>
              <FiUpload size={24} />
            </S.UploadIconWrapper>
            <div>
              <S.UploadTitle>Upload de Arquivo</S.UploadTitle>
              <S.UploadSubtitle>Importe arquivos .txt, .csv, .xlsx ou .xlsm</S.UploadSubtitle>
              <S.UploadHint>
                <small>O sistema detecta automaticamente se é Vale Transporte ou Benefícios</small>
              </S.UploadHint>
            </div>
          </S.UploadHeaderMain>
          <S.ModelButton onClick={() => setModelosOpen(true)}>
            <FiDownload size={16} />
            Baixar modelos de excel
          </S.ModelButton>
        </S.UploadHeader>

        <S.UploadArea
          onClick={handlePick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.csv,.xlsx,.xls,.xlsm"
            onChange={handleChange}
            hidden
          />
          <S.UploadIconLarge>
            <FiUpload size={48} />
          </S.UploadIconLarge>
          <S.UploadText>Clique para selecionar ou arraste o arquivo aqui</S.UploadText>
          <S.UploadFormats>Formatos aceitos: .txt, .csv, .xlsx, .xlsm</S.UploadFormats>
        </S.UploadArea>

        {status && (
          <S.UploadStatus $status={status} data-status={status}>
            <StatusBadge status={status} />
            <S.UploadStatusContent>
              <S.UploadStatusMessage>{message}</S.UploadStatusMessage>
              {fileName && <S.UploadStatusFile>{fileName}</S.UploadStatusFile>}
            </S.UploadStatusContent>
          </S.UploadStatus>
        )}
      </S.UploadCard>

      <Modal open={modelosOpen} title="Modelos de importação" onClose={() => setModelosOpen(false)}>
        <S.ModelosContainer>
          <S.ModelosText>
            Escolha qual modelo deseja baixar para preencher a importação.
          </S.ModelosText>
          <S.ModelosActions>
            <S.PrimaryButton onClick={handleBaixarValeTransporte}>
              <FiDownload size={16} />
              Modelo de Vale-Transporte
            </S.PrimaryButton>
            <S.PrimaryButton onClick={handleBaixarBeneficios}>
              <FiDownload size={16} />
              Modelo de Benefícios
            </S.PrimaryButton>
          </S.ModelosActions>
        </S.ModelosContainer>
      </Modal>
    </>
  );
}