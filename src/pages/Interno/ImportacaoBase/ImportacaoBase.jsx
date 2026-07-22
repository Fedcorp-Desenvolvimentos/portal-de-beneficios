import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FiUpload, FiSearch, FiX, FiCheck } from 'react-icons/fi'
import { toast } from 'react-toastify'

import { listarTodasAdministradoras } from '../../../services/administradoraService.js'
import { entebenService } from '../../../services/entebenService.js'
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx'

import './ImportacaoBase.css'

export default function ImportacaoBase() {
  const [administradoras, setAdministradoras] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [recentes, setRecentes] = useState([])

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const getNomeAdm = (adm) =>
    adm?.nome ||
    adm?.razao_social ||
    adm?.razaoSocial ||
    adm?.nome_fantasia ||
    adm?.nomeFantasia ||
    adm?.fantasia ||
    adm?.apelido ||
    ''

  const getCnpjAdm = (adm) =>
    adm?.cnpj ||
    adm?.documento ||
    adm?.cpf_cnpj ||
    adm?.cpfCnpj ||
    ''

  const getIdAdm = (adm) =>
    adm?.id ||
    adm?.uuid ||
    adm?.administradora_id ||
    adm?.administradoraId ||
    adm?.codigo ||
    adm?.cod_administradora

  const carregarAdministradoras = useCallback(async () => {
    setLoading(true)

    try {
      const response = await listarTodasAdministradoras()

      console.log('ImportacaoBase - retorno bruto:', response)

      const payload = response?.data ?? response

      const lista =
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.administradoras)
                ? payload.administradoras
                : Array.isArray(payload?.items)
                  ? payload.items
                  : []

      console.log('ImportacaoBase - payload tratado:', payload)
      console.log('ImportacaoBase - lista processada:', lista)

      setAdministradoras(lista)
    } catch (error) {
      console.error('ImportacaoBase - erro ao carregar:', error)
      toast.error('Erro ao carregar lista de administradoras.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarAdministradoras()
  }, [carregarAdministradoras])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const administradorasFiltradas = administradoras.filter((adm) => {
    const termo = search.trim().toLowerCase()

    const nome = getNomeAdm(adm).toLowerCase()
    const cnpj = getCnpjAdm(adm).toLowerCase()
    const apelido = String(adm?.apelido || '').toLowerCase()

    if (!termo) return true

    return (
      nome.includes(termo) ||
      cnpj.includes(termo) ||
      apelido.includes(termo)
    )
  })

  const selecionarAdministradora = (adm) => {
    const admId = getIdAdm(adm)

    setSelectedAdmin(adm)
    setSearch(getNomeAdm(adm))
    setShowDropdown(false)
    setUploadResult(null)

    setRecentes((prev) => {
      const semDuplicado = prev.filter((a) => getIdAdm(a) !== admId)
      return [adm, ...semDuplicado].slice(0, 5)
    })
  }

  const limparSelecao = () => {
    setSelectedAdmin(null)
    setSearch('')
    setUploadResult(null)
    setShowDropdown(false)
  }

  const handleExcluirBase = async () => {
    if (!selectedAdmin) return

    const adminId = getIdAdm(selectedAdmin)
    const nomeAdm = getNomeAdm(selectedAdmin)

    if (!window.confirm(`Excluir toda a base de condomínios e funcionários de "${nomeAdm}"?`)) {
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const response = await entebenService.excluirBase(adminId)

      setUploadResult({
        success: true,
        message: response?.detail || 'Base excluída com sucesso.',
        data: response,
      })

      toast.success(response?.detail || 'Base excluída com sucesso.')
    } catch (error) {
      console.error('ImportacaoBase - erro ao excluir base:', error)

      const msg = error.response?.data?.detail || 'Erro ao excluir base.'

      setUploadResult({
        success: false,
        message: msg,
        data: error.response?.data,
      })

      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!selectedAdmin) {
      toast.warning('Selecione uma administradora antes de importar o arquivo.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    await processUpload(file)
  }

  const processUpload = async (file) => {
    const administradoraId = getIdAdm(selectedAdmin)

    if (!administradoraId) {
      toast.error('Não foi possível identificar o ID da administradora selecionada.')
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      console.log('ImportacaoBase - administradora selecionada:', selectedAdmin)
      console.log('ImportacaoBase - arquivo selecionado:', file)

      const response = await entebenService.importarBase(file, administradoraId)

      console.log('ImportacaoBase - retorno importação:', response)

      const msg = response?.detail || 'Base importada com sucesso.'

      setUploadResult({
        success: true,
        message: msg,
        data: response,
      })

      toast.success(msg)
    } catch (error) {
      console.error('ImportacaoBase - erro importação:', error)

      const data = error.response?.data

      const msg =
        data?.detail ||
        data?.error ||
        data?.message ||
        error.message ||
        'Erro ao importar base.'

      setUploadResult({
        success: false,
        message: msg,
        data,
      })

      toast.error(msg)
    } finally {
      setUploading(false)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <PageLayout
      title="Importação de Base"
      subtitle="Importe planilhas de base, condomínio e taxa vinculadas à administradora."
    >
      <div className="importacao-base-container">
        <div className="ib-card">
          <div className="ib-card-header">
            <h3>Selecionar Administradora</h3>
          </div>

          <div className="ib-search-wrapper" ref={dropdownRef}>
            <div className="ib-search-input-wrapper">
              <FiSearch className="ib-search-icon" size={18} />

              <input
                type="text"
                className="ib-search-input"
                placeholder="Digite o nome da administradora..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setShowDropdown(true)

                  if (selectedAdmin) {
                    setSelectedAdmin(null)
                  }
                }}
                onFocus={() => setShowDropdown(true)}
              />

              {(selectedAdmin || search) && (
                <button
                  className="ib-clear-btn"
                  onClick={limparSelecao}
                  type="button"
                  title="Limpar seleção"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="ib-dropdown">
                {loading ? (
                  <div className="ib-dropdown-empty">
                    Carregando...
                  </div>
                ) : administradorasFiltradas.length === 0 ? (
                  <div className="ib-dropdown-empty">
                    Nenhuma administradora encontrada.
                  </div>
                ) : (
                  administradorasFiltradas.map((adm, index) => {
                    const admId = getIdAdm(adm)
                    const nomeAdm = getNomeAdm(adm)
                    const cnpjAdm = getCnpjAdm(adm)
                    const isSelected = getIdAdm(selectedAdmin) === admId

                    return (
                      <div
                        key={admId || `${nomeAdm}-${index}`}
                        className={`ib-dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => selecionarAdministradora(adm)}
                      >
                        <div className="ib-dropdown-item-info">
                          <strong>{nomeAdm || 'Administradora sem nome'}</strong>

                          {cnpjAdm && (
                            <small>CNPJ: {cnpjAdm}</small>
                          )}
                        </div>

                        {isSelected && (
                          <FiCheck size={16} className="ib-check-icon" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {selectedAdmin && (
            <div className="ib-selected-admin">
              <div className="ib-selected-admin-info">
                <strong>
                  {getNomeAdm(selectedAdmin) || 'Administradora sem nome'}
                </strong>

                {getCnpjAdm(selectedAdmin) && (
                  <span>CNPJ: {getCnpjAdm(selectedAdmin)}</span>
                )}
              </div>

              <button
                className="ib-delete-base-btn"
                onClick={handleExcluirBase}
                disabled={uploading}
                title="Excluir base importada desta administradora"
              >
                Excluir Base
              </button>
            </div>
          )}
        </div>

        {recentes.length > 0 && !selectedAdmin && (
          <div className="ib-card">
            <div className="ib-card-header">
              <h3>Administradoras recentes</h3>
            </div>

            <div className="ib-recentes-list">
              {recentes.map((adm, index) => {
                const admId = getIdAdm(adm)
                const nomeAdm = getNomeAdm(adm)
                const cnpjAdm = getCnpjAdm(adm)

                return (
                  <div
                    key={admId || `${nomeAdm}-${index}`}
                    className="ib-recente-item"
                    onClick={() => selecionarAdministradora(adm)}
                  >
                    <strong>{nomeAdm || 'Administradora sem nome'}</strong>

                    {cnpjAdm && (
                      <small>CNPJ: {cnpjAdm}</small>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedAdmin && (
          <div className="ib-card">
            <div className="ib-card-header">
              <h3>Upload de Arquivo</h3>

              <small>
                Formatos aceitos: .txt, .csv, .xlsx, .xls, .xlsm
              </small>
            </div>

            <div className="ib-upload-area">
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.csv,.xlsx,.xls,.xlsm"
                onChange={handleFileChange}
                hidden
                id="ib-file-input"
                disabled={uploading}
              />

              <label htmlFor="ib-file-input" className="ib-upload-label">
                <FiUpload size={40} className="ib-upload-icon" />

                <strong>
                  {uploading ? 'Processando...' : 'Clique para selecionar'}
                </strong>

                <span>ou arraste o arquivo aqui</span>
              </label>
            </div>

            {uploading && (
              <div className="ib-upload-status processing">
                <div className="ib-spinner" />
                <span>Processando arquivo...</span>
              </div>
            )}

            {uploadResult && !uploading && (
              <div
                className={`ib-upload-status ${uploadResult.success ? 'success' : 'error'
                  }`}
              >
                <span className="ib-status-icon">
                  {uploadResult.success ? (
                    <FiCheck size={20} />
                  ) : (
                    <FiX size={20} />
                  )}
                </span>

                <div className="ib-status-content">
                  <strong>
                    {uploadResult.success ? 'Sucesso' : 'Erro'}
                  </strong>

                  <p>{uploadResult.message}</p>

                  {uploadResult.success && uploadResult.data && (
                    <div className="ib-import-summary">
                      {uploadResult.data.condominios_criados > 0 && (
                        <p>Condomínios criados: <strong>{uploadResult.data.condominios_criados}</strong></p>
                      )}
                      {uploadResult.data.condominios_atualizados > 0 && (
                        <p>Condomínios atualizados: <strong>{uploadResult.data.condominios_atualizados}</strong></p>
                      )}
                      {uploadResult.data.funcionarios_criados > 0 && (
                        <p>Funcionários criados: <strong>{uploadResult.data.funcionarios_criados}</strong></p>
                      )}
                      {uploadResult.data.funcionarios_atualizados > 0 && (
                        <p>Funcionários atualizados: <strong>{uploadResult.data.funcionarios_atualizados}</strong></p>
                      )}
                      {uploadResult.data.total_erros > 0 && (
                        <details className="ib-error-details">
                          <summary>Ver erros ({uploadResult.data.total_erros})</summary>
                          <div className="ib-error-list">
                            {uploadResult.data.erros.map((erro, index) => (
                              <div key={index} className="ib-error-item">{erro}</div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {!uploadResult.success && uploadResult.data?.detail && (
                    <p className="ib-error-text">{uploadResult.data.detail}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}