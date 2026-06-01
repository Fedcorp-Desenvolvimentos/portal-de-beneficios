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
  
//   const processUpload = async (file) => {
//     setStatus('processando')
//     setMessage('Processando arquivo...')
//     setFileName(file.name)

//     try {
//       startLoading('Fazendo upload do arquivo...')

//  // Primeiro detecta o formato
//     const deteccao = await detectarFormato(file)
    
//     let result
    
//     if (deteccao.formato === 'nova_planilha') {
//         // Converte o resultado para o formato esperado pelo backend
//         const dadosConvertidos = {
//           data_to_backend: {
//             movimentacoes_detalhada: deteccao.data.movimentacoes,
//             summary: {
//               total_por_beneficiario: agregarPorBeneficiario(deteccao.data.movimentacoes),
//               total_registros: deteccao.data.total_registros,
//               total_funcionarios: deteccao.data.total_funcionarios,
//             }
//           },
//           detail: 'Arquivo processado com sucesso',
//           success: true,
//           file_upload_id: Date.now(),
//         }
        
//         result = { success: true, ...dadosConvertidos }
//       } else {
//         // Usa o backend normalmente
//         result = await onUpload?.({ status: 'processando', file })
//       }

//       if (result?.success) {
//         setStatus('sucesso')
//         setMessage(result.message || 'Arquivo processado com sucesso.')
//       } else {
//         setStatus('erro')
//         setMessage(result?.message || 'Não foi possível processar o arquivo.')
//       }
//     } catch (error) {
//       setStatus('erro')
//       setMessage('Falha na comunicação: ' + error.message)
//     } finally {
//       stopLoading()
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

//     processUpload(file)
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()

//     const file = e.dataTransfer.files?.[0]
//     if (!file) return

//     if (!validarArquivo(file)) return

//     processUpload(file)
//   }

//   const handleDragOver = (e) => {
//     e.preventDefault()
//   }

//   const handleBaixarValeTransporte = () => {
//     baixarModeloValeTransporte()
//     setModelosOpen(false)
//   }

//   const handleBaixarBeneficios = () => {
//     baixarModeloBeneficios()
//     setModelosOpen(false)
//   }

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