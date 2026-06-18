// // FileUpload.jsx - versão corrigida
// import React, { useRef, useState } from 'react'
// import StatusBadge from './StatusBadge'
// import { Upload } from './icons/Upload.jsx'
// import {
//   baixarModeloValeTransporte,
//   baixarModeloBeneficios,
// } from '../utils/modelo_planilha.js'
// import { useLoading } from '../hooks/useLoading'
// import '../styles/FileUpload.css'

// import { isNovaPlanilhaValeTransporte, parseNovaPlanilhaValeTransporte } from '../utils/parser_nova_planilha'
// import { detectarTipoArquivo, isValeTransporteFile } from '../utils/detectorTipoArquivo'
// import { vtService } from '../services/vtService'
// import { uploadService } from '../services/uploadService'

// import { downloadService } from '../services/downloadService.js'

// function Modal({ open, title, onClose, children }) {
//   if (!open) return null

//   return (
//     <div className="modal-overlay">
//       <div className="modal-card">
//         <div className="modal-header">
//           <h3>{title}</h3>

//           <button
//             type="button"
//             className="btn-ghost"
//             onClick={onClose}
//           >
//             ✕
//           </button>
//         </div>

//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   )
// }

// export default function FileUpload({ onUpload }) {
//   const inputRef = useRef()
//   const [status, setStatus] = useState(null)
//   const [message, setMessage] = useState('')
//   const [fileName, setFileName] = useState('')
//   const [modelosOpen, setModelosOpen] = useState(false)

//   const { startLoading, stopLoading } = useLoading()

//   const handlePick = () => inputRef.current?.click()

//   const detectarFormato = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
      
//       reader.onload = (e) => {
//         const arrayBuffer = e.target.result
        
//         if (isNovaPlanilhaValeTransporte(arrayBuffer)) {
//           try {
//             const parsed = parseNovaPlanilhaValeTransporte(arrayBuffer)
//             resolve({ formato: 'nova_planilha', data: parsed })
//           } catch (error) {
//             reject(error)
//           }
//         } else {
//           resolve({ formato: 'padrao', data: null })
//         }
//       }
      
//       reader.onerror = reject
//       reader.readAsArrayBuffer(file)
//     })
//   }
  
//   const processUpload = async (file, userAdministradoraId) => {
//     setStatus('processando')
//     setMessage('Processando arquivo...')
//     setFileName(file.name)

//     try {
//       startLoading('Fazendo upload do arquivo...');

//       // Tenta detectar o tipo de arquivo
//       let tipoArquivo;
//       try {
//         tipoArquivo = await detectarTipoArquivo(file);
//         console.log('Tipo de arquivo detectado:', tipoArquivo);
//       } catch (detectError) {
//         console.error('Erro na detecção automática:', detectError);
//         const isVT = isValeTransporteFile(file);
//         tipoArquivo = { tipo: isVT ? 'VT' : 'BENEFICIOS', sheets: [] };
//         console.log('Fallback por nome do arquivo:', tipoArquivo);
//       }
      
//       let uploadResult;
      
//       if (tipoArquivo.tipo === 'VT') {
//         console.log('Processando como Vale Transporte');
//         const vtResponse = await vtService.uploadVTFile(file, userAdministradoraId);
        
//         // 🔥 CORREÇÃO: Monta o resultado no formato esperado pelo Importacao
//         uploadResult = {
//           success: true,
//           ...vtResponse,
//           tipo_processamento: 'VT',
//           dados_validados: vtResponse.dados_validados || vtResponse.movimentacoes_detalhada || [],
//           summary: {
//             ...vtResponse.summary,
//             total_por_beneficiario: vtResponse.summary?.total_por_beneficiario || [],
//             total_registros: vtResponse.summary?.total_registros || vtResponse.summary?.total_movimentacoes || 0,
//             total_funcionarios: vtResponse.summary?.total_funcionarios || 0,
//             valor_total_vt: vtResponse.summary?.valor_total_beneficios || vtResponse.summary?.valor_total_vt || 0
//           }
//         };
        
//         console.log('Resultado VT processado:', uploadResult);
//         console.log('dados_validados:', uploadResult.dados_validados?.length);
//         console.log('total_por_beneficiario:', uploadResult.summary?.total_por_beneficiario?.length);
        
//       } else if (tipoArquivo.tipo === 'BENEFICIOS') {
//         try {
//           const deteccao = await detectarFormato(file);
          
//           if (deteccao.formato === 'nova_planilha') {
//             const dadosConvertidos = {
//               data_to_backend: {
//                 movimentacoes_detalhada: deteccao.data.movimentacoes,
//                 summary: {
//                   total_por_beneficiario: agregarPorBeneficiario(deteccao.data.movimentacoes),
//                   total_registros: deteccao.data.total_registros,
//                   total_funcionarios: deteccao.data.total_funcionarios,
//                 }
//               },
//               detail: 'Arquivo processado com sucesso',
//               success: true,
//               file_upload_id: Date.now(),
//               tipo_processamento: 'BENEFICIOS'
//             };
            
//             uploadResult = { success: true, ...dadosConvertidos };
//           } else {
//             // 🔥 CORREÇÃO: Chama o onUpload com o resultado do uploadService, não com a função
//             const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
//             uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
//           }
//         } catch (parseError) {
//           console.error('Erro no parse do formato:', parseError);
//           const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
//           uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
//         }
//       } else {
//         if (tipoArquivo.sheets && tipoArquivo.sheets.includes('USUARIOS')) {
//           console.log('Arquivo com aba USUARIOS, tentando como Vale Transporte');
//           const vtResponse = await vtService.uploadVTFile(file, userAdministradoraId);
//           uploadResult = {
//             success: true,
//             ...vtResponse,
//             tipo_processamento: 'VT',
//             dados_validados: vtResponse.dados_validados || vtResponse.movimentacoes_detalhada || [],
//             summary: {
//               ...vtResponse.summary,
//               total_por_beneficiario: vtResponse.summary?.total_por_beneficiario || [],
//               valor_total_vt: vtResponse.summary?.valor_total_beneficios || 0
//             }
//           };
//         } else {
//           console.warn('Tipo de arquivo desconhecido, tentando como Benefícios');
//           const uploadResponse = await uploadService.uploadFile(file, userAdministradoraId);
//           uploadResult = { success: true, ...uploadResponse, tipo_processamento: 'BENEFICIOS' };
//         }
//       }

//       // 🔥 CORREÇÃO: Chama o onUpload com o resultado já processado
//       // Isso permite que o componente pai (Importacao) receba os dados corretamente
//       if (onUpload && typeof onUpload === 'function') {
//         await onUpload({ file, result: uploadResult });
//       }

//       if (uploadResult?.success) {
//         setStatus('sucesso');
//         setMessage(uploadResult.detail || uploadResult.message || 'Arquivo processado com sucesso.');
        
//         if (uploadResult.tipo_processamento === 'VT') {
//           console.log('Resumo do VT:', {
//             total_registros: uploadResult.summary?.total_registros,
//             total_funcionarios: uploadResult.summary?.total_funcionarios,
//             valor_total: uploadResult.summary?.valor_total_beneficios || uploadResult.summary?.valor_total_vt,
//             total_por_beneficiario: uploadResult.summary?.total_por_beneficiario?.length,
//             dados_validados: uploadResult.dados_validados?.length
//           });
//         }
//       } else {
//         setStatus('erro');
//         setMessage(uploadResult?.message || 'Não foi possível processar o arquivo.');
//       }
//     } catch (error) {
//       console.error('Erro no processamento:', error);
//       setStatus('erro');
//       setMessage('Falha na comunicação: ' + (error.response?.data?.detail || error.message));
//     } finally {
//       stopLoading();
//     }
//   }

//   function agregarPorBeneficiario(movimentacoes) {
//     const mapa = new Map()
    
//     for (const mov of movimentacoes) {
//       const key = `${mov.cpf_funcionario}`
      
//       if (!mapa.has(key)) {
//         mapa.set(key, {
//           ...mov,
//           valor_total: 0,
//           quantidade_dias: 0,
//         })
//       }
      
//       const atual = mapa.get(key)
//       atual.valor_total += mov.valor_beneficio_total
//       atual.quantidade_dias += mov.quantidade_dias || 0
//     }
    
//     return Array.from(mapa.values())
//   }

//   const validarArquivo = (file) => {
//     if (!/\.(csv|txt|xlsx|xls)$/i.test(file.name)) {
//       setStatus('erro')
//       setMessage('Formato inválido. Selecione um arquivo .txt, .csv ou .xlsx')
//       setFileName('')
//       return false
//     }

//     return true
//   }

//   const handleChange = (e) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     if (!validarArquivo(file)) return

//     const userAdministradoraId = localStorage.getItem('administradora_id') || '1'
//     processUpload(file, userAdministradoraId)
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()

//     const file = e.dataTransfer.files?.[0]
//     if (!file) return

//     if (!validarArquivo(file)) return

//     const userAdministradoraId = localStorage.getItem('administradora_id') || '1'
//     processUpload(file, userAdministradoraId)
//   }

//   const handleDragOver = (e) => {
//     e.preventDefault()
//   }


//   const handleBaixarValeTransporte = () => {
//     downloadService.downloadExcelVT()
//     // baixarModeloValeTransporte()
//     setModelosOpen(false)
//   }

//   const handleBaixarBeneficios = () => {
//     downloadService.downloadExcelBeneficios()
//     // baixarModeloBeneficios()
//     setModelosOpen(false)
//   }

//   // const handleBaixarValeTransporte = () => {
//   //   baixarModeloValeTransporte()
//   //   setModelosOpen(false)
//   // }

//   // const handleBaixarBeneficios = () => {
//   //   baixarModeloBeneficios()
//   //   setModelosOpen(false)
//   // }

//   return (
//     <>
//       <div className="upload-card">
//         <div className="upload-header upload-header-between">
//           <div className="upload-header-main">
//             <div className="upload-icon-wrapper">
//               <Upload size={24} />
//             </div>

//             <div>
//               <h2 className="upload-title">Upload de Arquivo</h2>
//               <p className="upload-subtitle">Importe arquivos .txt, .csv ou .xlsx</p>
//               <p className="upload-subtitle upload-hint">
//                 <small>O sistema detecta automaticamente se é Vale Transporte ou Benefícios</small>
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="btn-outline upload-model-button"
//             onClick={() => setModelosOpen(true)}
//           >
//             Baixar modelos de excel
//           </button>
//         </div>

//         <div
//           className="upload-area"
//           onClick={handlePick}
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//         >
//           <input
//             ref={inputRef}
//             type="file"
//             accept=".txt,.csv,.xlsx,.xls"
//             onChange={handleChange}
//             hidden
//           />

//           <div className="upload-icon-large">
//             <Upload size={48} />
//           </div>

//           <p className="upload-text">Clique para selecionar ou arraste o arquivo aqui</p>
//           <p className="upload-formats">Formatos aceitos: .txt, .csv, .xlsx</p>
//         </div>

//         {status && (
//           <div className={`upload-status ${status}`}>
//             <StatusBadge status={status} />

//             <div className="upload-status-content">
//               <p className="upload-status-message">{message}</p>
//               {fileName && <p className="upload-status-file">{fileName}</p>}
//             </div>
//           </div>
//         )}
//       </div>

//       <Modal
//         open={modelosOpen}
//         title="Modelos de importação"
//         onClose={() => setModelosOpen(false)}
//       >
//         <div className="modelos-importacao-modal">
//           <p className="modelos-importacao-text">
//             Escolha qual modelo deseja baixar para preencher a importação.
//           </p>

//           <div className="modelos-importacao-actions">
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleBaixarValeTransporte}
//             >
//               Modelo de Vale-Transporte
//             </button>

//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleBaixarBeneficios}
//             >
//               Modelo de Benefícios
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   )
// }