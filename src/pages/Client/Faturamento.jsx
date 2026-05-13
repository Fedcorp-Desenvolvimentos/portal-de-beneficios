import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Download,
  FileText,
  CalendarDays,
  Receipt,
  Files,
} from 'lucide-react'

import { entebenService } from '../../services/entebenService'
import '../../styles/Faturamento.css'

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })

const formatDateBR = (value) => {
  if (!value) return '—'

  const onlyDate = String(value).split('T')[0]
  const [year, month, day] = onlyDate.split('-')

  if (!year || !month || !day) return value

  return `${day}/${month}/${year}`
}

const getDateOnly = (value) => {
  if (!value) return ''
  return String(value).split('T')[0]
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data)) return value.data
  return []
}

const getStatusLabel = (status) => {
  const normalized = String(status || '').toLowerCase()

  const map = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    sucesso: 'Concluído',
    processado: 'Concluído',
    concluido: 'Concluído',
    concluído: 'Concluído',
    aguardando_faturamento: 'Aguardando faturamento',
  }

  return map[normalized] || status || '—'
}

const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase()

  if (
    normalized === 'completed' ||
    normalized === 'sucesso' ||
    normalized === 'processado' ||
    normalized === 'concluido' ||
    normalized === 'concluído'
  ) {
    return 'success'
  }

  if (normalized === 'failed') return 'danger'

  if (
    normalized === 'processing' ||
    normalized === 'aguardando_faturamento'
  ) {
    return 'warning'
  }

  return 'info'
}

const isStatusConcluido = (status) => {
  const normalized = String(status || '').toLowerCase()

  return [
    'completed',
    'sucesso',
    'processado',
    'concluido',
    'concluído',
    'faturado',
  ].includes(normalized)
}

const getCompetencia = (item) => {
  if (item?.competencia) return formatDateBR(item.competencia)

  if (item?.faturamento_competencia) {
    return String(item.faturamento_competencia)
  }

  if (item?.vigencia_inicio) {
    const [year, month] = String(item.vigencia_inicio).split('-')

    if (year && month) {
      return `${month}/${year}`
    }
  }

  return '—'
}

const getCondominiosImportacao = (item) => {
  if (Array.isArray(item?.condominios)) {
    return item.condominios
  }

  if (Array.isArray(item?.dados_requisicao?.condominios)) {
    return item.dados_requisicao.condominios
  }

  return []
}

const getFuncionariosImportacao = (item) =>
  getCondominiosImportacao(item).flatMap((condo) =>
    Array.isArray(condo?.funcionarios)
      ? condo.funcionarios
      : []
  )

const getMovimentacoesImportacao = (item) =>
  getFuncionariosImportacao(item).flatMap((func) =>
    Array.isArray(func?.movimentacoes)
      ? func.movimentacoes
      : []
  )

const getValorTotal = (item) => {
  const movimentacoesDiretas =
    item?.movimentacoes_detalhada ||
    item?.dados_requisicao?.movimentacoes_detalhada ||
    item?.data_to_backend?.movimentacoes_detalhada ||
    []

  const totalMovimentacoesDiretas = Array.isArray(movimentacoesDiretas)
    ? movimentacoesDiretas.reduce((sum, mov) => {
        return (
          sum +
          Number(
            mov?.valor_recarga_bene ||
              mov?.valor_total ||
              mov?.valor ||
              0
          )
        )
      }, 0)
    : 0

  const totalMovimentacoesAninhadas =
    getMovimentacoesImportacao(item).reduce(
      (sum, mov) =>
        sum +
        Number(
          mov?.valor ||
            mov?.valor_total ||
            mov?.valor_recarga_bene ||
            0
        ),
      0
    )

  return Number(
    totalMovimentacoesDiretas ||
      totalMovimentacoesAninhadas ||
      item?.valor_total ||
      item?.total ||
      item?.valor_total_beneficios ||
      item?.summary?.valor_total_beneficios ||
      item?.summary?.valor_total ||
      item?.dados_requisicao?.summary?.valor_total_beneficios ||
      item?.dados_requisicao?.summary?.valor_total ||
      item?.dados_requisicao?.valor_total_beneficios ||
      item?.dados_requisicao?.valor_total ||
      item?.dados_requisicao?.total ||
      item?.dados_requisicao?.total_geral ||
      item?.dados_requisicao?.resumo?.valor_total_beneficios ||
      item?.dados_requisicao?.resumo?.valor_total ||
      item?.dados_requisicao?.resumo?.total ||
      0
  )
}

const getQuantidade = (item) =>
  Number(
    item?.registros_processados ||
      item?.total_registros ||
      item?.total_movimentacoes ||
      item?.summary?.total_movimentacoes ||
      0
  )

export default function Faturamento() {
  const [search, setSearch] = useState('')

  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCompetencia, setFiltroCompetencia] =
    useState('')
  const [filtroVigencia, setFiltroVigencia] =
    useState('')
  const [filtroVencimento, setFiltroVencimento] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [importacoes, setImportacoes] = useState([])

  const [paginaAtual, setPaginaAtual] = useState(1)

  const itensPorPagina = 5

  useEffect(() => {
    carregarFaturamentos()
  }, [])

  useEffect(() => {
    setPaginaAtual(1)
  }, [
    search,
    filtroStatus,
    filtroCompetencia,
    filtroVigencia,
    filtroVencimento,
  ])

  async function carregarFaturamentos() {
    try {
      setLoading(true)
      setError('')

      const [ultimaImportacao, historicoData] =
        await Promise.all([
          entebenService.getUltimaImportacao(),
          entebenService.getImportacoes(),
        ])

      const historico = toArray(historicoData)

      const historicoComUltimaCompleta =
        historico.map((item, index) => {
          const isPrimeira = index === 0

          if (isPrimeira && ultimaImportacao) {
            return {
              ...item,
              ...ultimaImportacao,
              id: item.id || ultimaImportacao.id,
              faturamento_id:
                item.faturamento_id ||
                ultimaImportacao.faturamento_id,
            }
          }

          return item
        })

      const comStatus = await Promise.all(
        historicoComUltimaCompleta.map(async (item) => {
          try {
            const statusData =
              await entebenService.getFaturamentoStatus(
                item.id
              )

            return {
              ...item,
              faturamento_status:
                statusData?.status || item.status,
              faturamento_progresso:
                statusData?.progresso,
              faturamento_competencia:
                statusData?.competencia,
              criado_em: statusData?.criado_em,
            }
          } catch {
            return {
              ...item,
              faturamento_status: item.status,
            }
          }
        })
      )

      setImportacoes(comStatus)
    } catch (err) {
      console.error(
        'Erro ao carregar faturamentos:',
        err
      )

      setError(
        'Não foi possível carregar os faturamentos.'
      )
    } finally {
      setLoading(false)
    }
  }

async function baixarDocumento(faturamentoId, tipo = '') {
  try {
    const blob = await entebenService.downloadDocumentoFaturamento(
      faturamentoId,
      tipo
    )

    const fileURL = window.URL.createObjectURL(blob)

    const nomeArquivo = tipo
      ? `${tipo.replaceAll('/', '').replaceAll('-', '_')}-${faturamentoId}.pdf`
      : `faturamento-${faturamentoId}.pdf`

    const a = document.createElement('a')

    a.href = fileURL
    a.download = nomeArquivo

    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(fileURL)
  } catch (err) {
    console.error('Erro ao baixar documento:', err)
    alert('Não foi possível baixar o documento.')
  }
}

  const opcoesStatus = useMemo(() => {
    return [
      ...new Set(
        importacoes
          .map(
            (item) =>
              item.faturamento_status ||
              item.status
          )
          .filter(Boolean)
      ),
    ]
  }, [importacoes])

  const opcoesCompetencia = useMemo(() => {
    return [
      ...new Set(
        importacoes
          .map((item) =>
            getCompetencia(item)
          )
          .filter(
            (value) =>
              value && value !== '—'
          )
      ),
    ].sort((a, b) =>
      String(b).localeCompare(String(a))
    )
  }, [importacoes])

  const opcoesVigencia = useMemo(() => {
    return [
      ...new Set(
        importacoes
          .map((item) =>
            getDateOnly(
              item.vigencia_inicio
            )
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(b).localeCompare(String(a))
    )
  }, [importacoes])

  const opcoesVencimento = useMemo(() => {
    return [
      ...new Set(
        importacoes
          .map((item) =>
            getDateOnly(
              item.data_vencimento
            )
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(b).localeCompare(String(a))
    )
  }, [importacoes])

  const gruposFiltrados = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    return importacoes
      .map((item) => {
        const key =
          item.id ||
          item.faturamento_id ||
          item.faturamento?.id

        const downloadId =
          item.file_upload_id ||
          item.importacao_id ||
          item.id

        const label = `Importação ${item.id}`

        const status =
          item.faturamento_status ||
          item.status

        const total = getValorTotal(item)

        const quantidadeBeneficios =
          getQuantidade(item)

        const dataImportacao = getDateOnly(
          item.data_importacao
        )

        const dataVigenciaInicio =
          getDateOnly(item.vigencia_inicio)

        const dataVencimento = getDateOnly(
          item.data_vencimento
        )

        const competencia =
          getCompetencia(item)

        return {
          ...item,
          key,
          downloadId,
          importacaoLabel: label,
          importacaoDate: formatDateBR(
            item.data_importacao
          ),
          dataImportacao,
          dataVigenciaInicio,
          dataVencimento,
          competencia,
          status,
          total,
          quantidadeBeneficios,
          beneficios: [
            `Registros processados: ${
              item.registros_processados || 0
            }`,
            `Vigência: ${formatDateBR(
              item.vigencia_inicio
            )} até ${formatDateBR(
              item.vigencia_fim
            )}`,
            `Vencimento: ${formatDateBR(
              item.data_vencimento
            )}`,
          ],
        }
      })
      .filter((group) => {
        const textoBusca = [
          group.importacaoLabel,
          group.key,
          group.downloadId,
          group.competencia,
          group.status,
          group.nome_usuario,
          ...group.beneficios,
        ]
          .join(' ')
          .toLowerCase()

        const matchSearch =
          !query ||
          textoBusca.includes(query)

        const matchStatus =
          !filtroStatus ||
          String(
            group.status || ''
          ).toLowerCase() ===
            String(
              filtroStatus
            ).toLowerCase()

        const matchCompetencia =
          !filtroCompetencia ||
          group.competencia ===
            filtroCompetencia

        const matchVigencia =
          !filtroVigencia ||
          group.dataVigenciaInicio ===
            filtroVigencia

        const matchVencimento =
          !filtroVencimento ||
          group.dataVencimento ===
            filtroVencimento

        return (
          matchSearch &&
          matchStatus &&
          matchCompetencia &&
          matchVigencia &&
          matchVencimento
        )
      })
  }, [
    importacoes,
    search,
    filtroStatus,
    filtroCompetencia,
    filtroVigencia,
    filtroVencimento,
  ])

  const totalPaginas = Math.ceil(
    gruposFiltrados.length /
      itensPorPagina
  )

  const gruposPaginados = useMemo(() => {
    const inicio =
      (paginaAtual - 1) *
      itensPorPagina

    const fim =
      inicio + itensPorPagina

    return gruposFiltrados.slice(
      inicio,
      fim
    )
  }, [
    gruposFiltrados,
    paginaAtual,
  ])

  const limparFiltros = () => {
    setSearch('')
    setFiltroStatus('')
    setFiltroCompetencia('')
    setFiltroVigencia('')
    setFiltroVencimento('')
  }

  return (
    <div className="fatv2-page">
      <section className="fatv2-hero">
        <div>
          <p className="fatv2-eyebrow">
            Faturamento
          </p>

          <h1 className="fatv2-title">
            Documentos por importação
          </h1>

          <p className="fatv2-subtitle">
            Cada importação reúne os
            benefícios faturados e
            seus documentos vinculados.
          </p>
        </div>
      </section>

      <section className="fatv2-toolbar">
        <div className="fatv2-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Buscar por importação, competência ou status..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="fatv2-filters">
          <label>
            <span>Status</span>

            <select
              value={filtroStatus}
              className="status"
              onChange={(e) =>
                setFiltroStatus(
                  e.target.value
                )
              }
            >
              <option value="">
                Todos
              </option>

              {opcoesStatus.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(
                      status
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>Vigência</span>

            <select
              value={filtroVigencia}
              onChange={(e) =>
                setFiltroVigencia(
                  e.target.value
                )
              }
              className="vig"
            >
              <option value="">
                Todas
              </option>

              {opcoesVigencia.map(
                (data) => (
                  <option
                    key={data}
                    value={data}
                  >
                    {formatDateBR(
                      data
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Vencimento
            </span>

            <select
              value={
                filtroVencimento
              }
              onChange={(e) =>
                setFiltroVencimento(
                  e.target.value
                )
              }
              className="venc"
            >
              <option value="">
                Todos
              </option>

              {opcoesVencimento.map(
                (data) => (
                  <option
                    key={data}
                    value={data}
                  >
                    {formatDateBR(
                      data
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <button
            type="button"
            className="fatv2-btn fatv2-clear-btn"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {error && (
        <div className="fatv2-empty">
          {error}
        </div>
      )}

      {loading ? (
        <div className="fatv2-empty">
          Carregando faturamentos...
        </div>
      ) : (
        <>
          <section className="fatv2-list">
            {gruposPaginados.length ===
              0 ? (
              <div className="fatv2-empty">
                Nenhum faturamento
                encontrado para os
                filtros selecionados.
              </div>
            ) : (
              gruposPaginados.map(
                (group) => {
                  const podeBaixar =
                    isStatusConcluido(
                      group.status
                    )

                  return (
                    <article
                      key={group.key}
                      className="fatv2-card"
                    >
                      <div className="fatv2-card-top">
                        <div className="fatv2-card-main">
                          <div className="fatv2-icon">
                            <FileText
                              size={
                                18
                              }
                            />
                          </div>

                          <div className="fatv2-main-text">
                            <h2>
                              {
                                group.importacaoLabel
                              }
                            </h2>

                            <p>
                              ID/Faturamento:{' '}
                              {
                                group.key
                              }
                            </p>
                          </div>
                        </div>

                        <div className="fatv2-summary">
                          <div className="fatv2-summary-item">
                            <span>
                              <CalendarDays
                                size={
                                  14
                                }
                              />{' '}
                              Importação
                            </span>

                            <strong>
                              {
                                group.importacaoDate
                              }
                            </strong>
                          </div>

                          <div className="fatv2-summary-item">
                            <span>
                              <Download
                                size={
                                  14
                                }
                              />{' '}
                              Competência
                            </span>

                            <strong>
                              {
                                group.competencia
                              }
                            </strong>
                          </div>

                          <div className="fatv2-summary-item">
                            <span>
                              <Files
                                size={
                                  14
                                }
                              />{' '}
                              Registros
                            </span>

                            <strong>
                              {
                                group.quantidadeBeneficios
                              }
                            </strong>
                          </div>

                          <div className="fatv2-summary-item">
                            <span>
                              <Receipt
                                size={
                                  14
                                }
                              />{' '}
                              Total
                            </span>

                            <strong>
                              R${' '}
                              {formatMoney(
                                group.total
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="fatv2-card-body">
                        <div className="fatv2-benefits">
                          <span className="fatv2-label">
                            Resumo
                          </span>

                          <div className="fatv2-benefit-tags">
                            <span
                              className={`fatv2-tag ${getStatusClass(
                                group.status
                              )}`}
                            >
                              {getStatusLabel(
                                group.status
                              )}

                              {group.faturamento_progresso !=
                                null
                                ? ` - ${group.faturamento_progresso}%`
                                : ''}
                            </span>

                            {group.beneficios.map(
                              (
                                beneficio,
                                index
                              ) => (
                                <span
                                  key={`${beneficio}-${index}`}
                                  className="fatv2-tag"
                                >
                                  {
                                    beneficio
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="fatv2-docs">
                          <button
                            className="fatv2-btn"
                            disabled={
                              !podeBaixar
                            }
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() =>
                              baixarDocumento(
                                group.downloadId,
                                'boleto-original/'
                              )
                            }
                          >
                            <Download
                              size={
                                14
                              }
                            />
                            Boleto
                          </button>

                          <button
                            className="fatv2-btn"
                            disabled={
                              !podeBaixar
                            }
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() =>
                              baixarDocumento(
                                group.downloadId,
                                'nota-fiscal-original/'
                              )
                            }
                          >
                            <Download
                              size={
                                14
                              }
                            />
                            NF
                          </button>

                          <button
                            className="fatv2-btn"
                            disabled={
                              !podeBaixar
                            }
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={() =>
                              baixarDocumento(
                                group.downloadId,
                                'nota-debito-original/'
                              )
                            }
                          >
                            <Download
                              size={
                                14
                              }
                            />
                            Nota
                            Débito
                          </button>

                          <button
                            className="fatv2-btn fatv2-btn-primary"
                            disabled={
                              !podeBaixar
                            }
                            title={
                              !podeBaixar
                                ? 'Documento disponível apenas quando o faturamento estiver concluído'
                                : ''
                            }
                            onClick={async () => {
                              try {
                                await baixarDocumento(
                                  group.downloadId,
                                  'boleto-original/'
                                )

                                await baixarDocumento(
                                  group.downloadId,
                                  'nota-fiscal-original/'
                                )

                                await baixarDocumento(
                                  group.downloadId,
                                  'nota-debito-original/'
                                )
                              } catch (e) {
                                console.error(e)
                              }
                            }}
                          >
                            <Download
                              size={
                                14
                              }
                            />
                            Baixar
                            todos
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                }
              )
            )}
          </section>

          {totalPaginas > 1 && (
            <div className="fatv2-pagination">
              <button
                type="button"
                className="fatv2-btn"
                disabled={
                  paginaAtual === 1
                }
                onClick={() =>
                  setPaginaAtual(
                    (prev) =>
                      prev - 1
                  )
                }
              >
                Anterior
              </button>

              <span>
                Página{' '}
                {paginaAtual} de{' '}
                {totalPaginas}
              </span>

              <button
                type="button"
                className="fatv2-btn"
                disabled={
                  paginaAtual ===
                  totalPaginas
                }
                onClick={() =>
                  setPaginaAtual(
                    (prev) =>
                      prev + 1
                  )
                }
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}