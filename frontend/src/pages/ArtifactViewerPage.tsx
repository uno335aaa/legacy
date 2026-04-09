import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { ArtifactDetailResponse } from '../types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatArtifactContent(content: string, format: string) {
  // JSON は見やすく整形しておく。壊れた JSON はそのまま見せる。
  if (format !== 'json') {
    return content
  }

  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}

export function ArtifactViewerPage() {
  const { projectId = '', artifactId = '' } = useParams()
  const [artifactDetail, setArtifactDetail] = useState<ArtifactDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadArtifact() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.getProjectArtifact(projectId, artifactId)
        setArtifactDetail(response)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load artifact')
      } finally {
        setIsLoading(false)
      }
    }

    void loadArtifact()
  }, [artifactId, projectId])

  if (isLoading) {
    return <p className="feedback">Loading artifact...</p>
  }

  if (error) {
    return <p className="feedback feedback--error">{error}</p>
  }

  if (!artifactDetail) {
    return <p className="feedback">Artifact not found.</p>
  }

  const { artifact, content } = artifactDetail

  return (
    <div className="page-grid">
      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Artifact viewer</p>
            <h2>{artifact.type}</h2>
          </div>
          <div className="inline-actions">
            <Link className="button button--ghost" to={`/projects/${projectId}`}>
              Back to detail
            </Link>
            <Link className="button button--ghost" to={`/projects/${projectId}/prompts`}>
              Prompt lab
            </Link>
          </div>
        </div>

        <div className="detail-grid">
          <article className="info-card">
            <span className="info-card__label">Format</span>
            <strong>{artifact.format}</strong>
          </article>
          <article className="info-card">
            <span className="info-card__label">Version</span>
            <strong>{artifact.version_id}</strong>
          </article>
          <article className="info-card">
            <span className="info-card__label">Created</span>
            <strong>{formatDate(artifact.created_at)}</strong>
          </article>
        </div>

        <div className="artifact-meta-block">
          <span className="meta-text">Stored path</span>
          <code>{artifact.path}</code>
        </div>
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Content</p>
            <h3>生成されたドラフト</h3>
          </div>
        </div>

        <div className="result-block result-block--viewer">
          <pre>{formatArtifactContent(content, artifact.format)}</pre>
        </div>
      </section>
    </div>
  )
}
