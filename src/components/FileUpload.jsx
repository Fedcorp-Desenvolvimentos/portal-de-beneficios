import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import StatusBadge from './StatusBadge'
import { Upload } from './icons/Upload.jsx'
import { baixarModeloImportacao } from '../utils/modelo_planilha.js'

export default function FileUpload({ onUpload }) {
  const inputRef = useRef()
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState('')

  const handlePick = () => inputRef.current?.click()

  const processUpload = async (file) => {
    setStatus('processando')
    setMessage('Processando arquivo...')
    setFileName(file.name)

    try {
      const result = await onUpload?.({ status: 'processando', file })

      if (result?.success) {
        setStatus('sucesso')
        setMessage(result.message)
      } else {
        setStatus('erro')
        setMessage(result?.message || 'Não foi possível processar o arquivo.')
      }
    } catch (error) {
      setStatus('erro')
      setMessage('Falha na comunicação: ' + error.message)
    }
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(csv|txt|xlsx|xls)$/i.test(file.name)) {
      setStatus('erro')
      setMessage('Formato inválido. Selecione um arquivo .txt, .csv ou .xlsx')
      setFileName('')
      return
    }

    processUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!/\.(csv|txt|xlsx|xls)$/i.test(file.name)) {
      setStatus('erro')
      setMessage('Formato inválido. Selecione um arquivo .txt, .csv ou .xlsx')
      setFileName('')
      return
    }

    processUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="upload-card">
      <div className="upload-header upload-header-between">
        <div className="upload-header-main">
          <div className="upload-icon-wrapper">
            <Upload size={24} />
          </div>

          <div>
            <h2 className="upload-title">Upload de Arquivo</h2>
            <p className="upload-subtitle">Importe arquivos .txt, .csv ou .xlsx</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-outline upload-model-button"
          onClick={baixarModeloImportacao}
        >
          Baixar modelo Excel
        </button>
      </div>

      <div
        className="upload-area"
        onClick={handlePick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,.xlsx,.xls"
          onChange={handleChange}
          hidden
        />

        <div className="upload-icon-large">
          <Upload size={48} />
        </div>

        <p className="upload-text">Clique para selecionar ou arraste o arquivo aqui</p>
        <p className="upload-formats">Formatos aceitos: .txt, .csv, .xlsx</p>
      </div>

      {status && (
        <div className={`upload-status ${status}`}>
          <StatusBadge status={status} />
          <div className="upload-status-content">
            <p className="upload-status-message">{message}</p>
            {fileName && <p className="upload-status-file">{fileName}</p>}
          </div>
        </div>
      )}
    </div>
  )
}