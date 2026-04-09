import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Artifact, Project, ProjectFile, ProjectVersion } from '../types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [versions, setVersions] = useState<ProjectVersion[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true)
        setError(null)

        const detail = await api.getProject(projectId)
        setProject(detail.project)
        setVersions(detail.versions)
        const artifactResponse = await api.getProjectArtifacts(projectId)
        setArtifacts(artifactResponse.artifacts)

        const activeVersionId = detail.project.active_version_id ?? detail.versions.at(-1)?.id
        setSelectedVersionId(activeVersionId ?? undefined)

        if (activeVersionId) {
          const fileResponse = await api.getProjectFiles(projectId, activeVersionId)
          setFiles(fileResponse.files)
        } else {
          setFiles([])
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProject()
  }, [projectId])

  async function handleVersionChange(versionId: string) {
    setSelectedVersionId(versionId)

    try {
      const fileResponse = await api.getProjectFiles(projectId, versionId)
      setFiles(fileResponse.files)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load files')
    }
  }

  if (isLoading) {
    return <p className="feedback">Loading project...</p>
  }

  if (error) {
    return <p className="feedback feedback--error">{error}</p>
  }

  if (!project) {
    return <p className="feedback">Project not found.</p>
  }

  return (
    <div className="page-grid">
      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Project detail</p>
            <h2>{project.name}</h2>
          </div>
          <div className="inline-actions">
            <Link className="button button--ghost" to="/projects">
              Back
            </Link>
            <Link className="button button--ghost" to={`/projects/${project.id}/prompts`}>
              Prompt lab
            </Link>
            <Link className="button button--primary" to={`/projects/${project.id}/upload`}>
              Upload
            </Link>
          </div>
        </div>

        <div className="detail-grid">
          <article className="info-card">
            <span className="info-card__label">Status</span>
            <strong>{project.status}</strong>
          </article>
          <article className="info-card">
            <span className="info-card__label">Active version</span>
            <strong>{project.active_version_id ?? 'none'}</strong>
          </article>
          <article className="info-card">
            <span className="info-card__label">Updated</span>
            <strong>{formatDate(project.updated_at)}</strong>
          </article>
        </div>

        <p className="description-block">{project.description || '説明はまだありません。'}</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Versions</p>
            <h3>アップロード履歴</h3>
          </div>
        </div>

        {versions.length === 0 ? (
          <div className="empty-state">
            <h4>version がまだありません</h4>
            <p>Upload 画面からファイルを送ると、ここに履歴が表示されます。</p>
          </div>
        ) : (
          <div className="list-stack">
            {versions.map((version) => (
              <button
                className={`version-item ${selectedVersionId === version.id ? 'version-item--active' : ''}`}
                key={version.id}
                onClick={() => void handleVersionChange(version.id)}
                type="button"
              >
                <strong>{version.label}</strong>
                <span>{formatDate(version.created_at)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Files</p>
            <h3>保存済みファイル一覧</h3>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <h4>ファイルがありません</h4>
            <p>選択中の version にはまだ保存済みファイルがありません。</p>
          </div>
        ) : (
          <div className="file-table">
            <div className="file-table__head">
              <span>Path</span>
              <span>Size</span>
            </div>
            {files.map((file) => (
              <div className="file-table__row" key={file.path}>
                <code>{file.path}</code>
                <span>{file.size.toLocaleString()} bytes</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Artifacts</p>
            <h3>生成済みドラフト</h3>
          </div>
        </div>

        {artifacts.length === 0 ? (
          <div className="empty-state">
            <h4>成果物はまだありません</h4>
            <p>Prompt lab から保存すると、ここにドラフトが増えていきます。</p>
          </div>
        ) : (
          <div className="list-stack">
            {artifacts.map((artifact) => (
              <Link
                className="artifact-item artifact-item--link"
                key={artifact.id}
                to={`/projects/${projectId}/artifacts/${artifact.id}`}
              >
                <strong>{artifact.type}</strong>
                <span>{artifact.format}</span>
                <code>{artifact.path}</code>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
