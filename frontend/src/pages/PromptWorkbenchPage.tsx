import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type {
  Artifact,
  GeneratePromptResponse,
  PromptSummary,
  RenderPromptResponse,
} from '../types'

const sampleVariablesByPromptId: Record<string, Record<string, string>> = {
  overview_document: {
    project_summary: 'Java + Spring Boot の販売管理システム。主要機能は受注、出荷、請求。',
    file_index: 'OrderController.java\nOrderService.java\nInvoiceBatch.java',
    entry_points: 'OrderController#createOrder\nInvoiceBatch#run',
    evidence_summary: 'Controller 命名、Spring annotation、batch entry method',
  },
  class_document: {
    class_info: 'UserService: Service layer, depends on UserRepository',
    method_summaries: 'createUser: validate and save\nfindUser: read by id',
    relationship_summary: 'UserService -> UserRepository -> users table',
    evidence_summary: 'class name, method names, repository field',
  },
  method_document: {
    method_signature: 'createUser(request: CreateUserRequest): User',
    method_body: 'validate request\ncheck duplicate email\nsave entity\nreturn mapped result',
    callee_summary: 'UserRepository.save\nEmailValidator.validate',
    evidence_summary: 'method body summary and callees',
  },
  crud_matrix: {
    table_definitions: 'users(id, name, email)\norders(id, user_id, total)',
    method_db_operations: 'createUser -> INSERT users\nfindUser -> SELECT users',
    sql_summary: 'INSERT INTO users ...\nSELECT * FROM users WHERE id = ?',
    evidence_summary: 'repository method names and sql mapping',
  },
  class_diagram_plantuml: {
    class_list: 'OrderController\nOrderService\nOrderRepository',
    relationships: 'OrderController --> OrderService\nOrderService --> OrderRepository',
  },
  plantuml_repair: {
    plantuml_source: '@startuml\nclass UserService\nUserService --> UserRepository\n@enduml',
    error_message: 'sample error message',
  },
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function PromptWorkbenchPage() {
  const { projectId = '' } = useParams()
  const [prompts, setPrompts] = useState<PromptSummary[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState('overview_document')
  const [variablesText, setVariablesText] = useState(
    prettyJson(sampleVariablesByPromptId.overview_document),
  )
  const [renderResult, setRenderResult] = useState<RenderPromptResponse | null>(null)
  const [generateResult, setGenerateResult] = useState<GeneratePromptResponse | null>(null)
  const [savedArtifact, setSavedArtifact] = useState<Artifact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRendering, setIsRendering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPrompts() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.getPrompts()
        setPrompts(response.prompts)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load prompts')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPrompts()
  }, [])

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId) ?? null,
    [prompts, selectedPromptId],
  )

  function parseVariables(): Record<string, string> {
    const parsed = JSON.parse(variablesText) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Variables must be a JSON object')
    }

    const entries = Object.entries(parsed)
    for (const [, value] of entries) {
      if (typeof value !== 'string') {
        throw new Error('All variable values must be strings')
      }
    }

    return Object.fromEntries(entries)
  }

  async function handleRender() {
    try {
      setIsRendering(true)
      setError(null)
      setRenderResult(null)

      const variables = parseVariables()
      const response = await api.renderPrompt({
        promptId: selectedPromptId,
        variables,
      })

      setRenderResult(response)
    } catch (renderError) {
      setError(renderError instanceof Error ? renderError.message : 'Failed to render prompt')
    } finally {
      setIsRendering(false)
    }
  }

  async function handleGenerate() {
    try {
      setIsGenerating(true)
      setError(null)
      setGenerateResult(null)

      const variables = parseVariables()
      const response = await api.generatePrompt({
        promptId: selectedPromptId,
        variables,
      })

      setGenerateResult(response)
      setSavedArtifact(null)
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate prompt output')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSaveArtifact() {
    try {
      setIsSaving(true)
      setError(null)

      const variables = parseVariables()
      const response = await api.generateProjectArtifact(projectId, {
        promptId: selectedPromptId,
        variables,
      })

      setSavedArtifact(response.artifact)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save artifact')
    } finally {
      setIsSaving(false)
    }
  }

  function handlePromptChange(promptId: string) {
    setSelectedPromptId(promptId)
    setVariablesText(prettyJson(sampleVariablesByPromptId[promptId] ?? {}))
    setRenderResult(null)
    setGenerateResult(null)
    setError(null)
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Prompt workbench</p>
            <h2>設計書プロンプトの確認</h2>
          </div>
          <Link className="button button--ghost" to={`/projects/${projectId}`}>
            Back to detail
          </Link>
        </div>

        <p className="description-block">
          prompt の組み立て結果と、mock adapter 経由の生成結果をここで確認できます。
          まずはテンプレートの抜け漏れや JSON Schema 指示の妥当性を見る用途です。
        </p>

        {isLoading ? <p className="feedback">Loading prompts...</p> : null}

        <div className="list-stack">
          {prompts.map((prompt) => (
            <button
              className={`version-item ${selectedPromptId === prompt.id ? 'version-item--active' : ''}`}
              key={prompt.id}
              onClick={() => handlePromptChange(prompt.id)}
              type="button"
            >
              <strong>{prompt.id}</strong>
              <span>{prompt.purpose}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Variables</p>
            <h3>{selectedPrompt?.purpose ?? selectedPromptId}</h3>
          </div>
          <div className="inline-actions">
            <button
              className="button button--ghost"
              disabled={isRendering}
              onClick={() => void handleRender()}
              type="button"
            >
              {isRendering ? 'Rendering...' : 'Render prompt'}
            </button>
            <button
              className="button button--primary"
              disabled={isGenerating}
              onClick={() => void handleGenerate()}
              type="button"
            >
              {isGenerating ? 'Generating...' : 'Generate output'}
            </button>
            <button
              className="button button--ghost"
              disabled={isSaving}
              onClick={() => void handleSaveArtifact()}
              type="button"
            >
              {isSaving ? 'Saving...' : 'Save as artifact'}
            </button>
          </div>
        </div>

        <label className="field">
          <span>Variables JSON</span>
          <textarea
            className="editor-textarea"
            onChange={(event) => setVariablesText(event.target.value)}
            rows={18}
            spellCheck={false}
            value={variablesText}
          />
        </label>

        {error ? <p className="feedback feedback--error">{error}</p> : null}
        {savedArtifact ? (
          <p className="feedback">
            Saved: <strong>{savedArtifact.type}</strong> / <code>{savedArtifact.path}</code>
          </p>
        ) : null}
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rendered prompt</p>
            <h3>system / user prompt</h3>
          </div>
        </div>

        {renderResult ? (
          <div className="result-stack">
            <div className="result-block">
              <h4>System</h4>
              <pre>{renderResult.system}</pre>
            </div>
            <div className="result-block">
              <h4>User</h4>
              <pre>{renderResult.user}</pre>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h4>まだ render 結果がありません</h4>
            <p>Render prompt を押すと、組み立てられた prompt を確認できます。</p>
          </div>
        )}
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Generated result</p>
            <h3>adapter の応答</h3>
          </div>
        </div>

        {generateResult ? (
          <div className="result-stack">
            <div className="result-meta">
              <span>Provider: {generateResult.provider}</span>
              <span>Model: {generateResult.modelId}</span>
            </div>
            <div className="result-block">
              <h4>Raw text</h4>
              <pre>{generateResult.rawText}</pre>
            </div>
            <div className="result-block">
              <h4>Parsed JSON</h4>
              <pre>{prettyJson(generateResult.parsed)}</pre>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h4>まだ generate 結果がありません</h4>
            <p>Generate output を押すと、現在の adapter で生成した結果を確認できます。</p>
          </div>
        )}
      </section>
    </div>
  )
}
