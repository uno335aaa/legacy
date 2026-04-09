import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Project } from '../types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadProjects() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getProjects()
      setProjects(response)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      await api.createProject({
        name,
        description,
      })

      setName('')
      setDescription('')
      await loadProjects()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-grid">
      <section className="panel panel--hero">
        <div className="hero-copy">
          <p className="eyebrow">Project intake</p>
          <h2>レガシー解析の入口を先に整える</h2>
          <p className="hero-text">
            プロジェクトを登録すると、バックエンド側で `meta/` と `input/working/output`
            の基本構造が作られます。まずは登録とアップロード導線を安定させて、後続の解析処理を乗せやすくします。
          </p>
        </div>

        <div className="stat-strip">
          <article>
            <span className="stat-strip__label">Projects</span>
            <strong>{projects.length}</strong>
          </article>
          <article>
            <span className="stat-strip__label">Latest status</span>
            <strong>{projects[0]?.status ?? 'empty'}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Create project</p>
            <h3>新しい解析対象を追加</h3>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Project name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例: 会計システム v1"
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="対象システムの概要や補足を記録します"
              rows={4}
            />
          </label>

          <button className="button button--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating...' : 'Create project'}
          </button>
        </form>
      </section>

      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Project list</p>
            <h3>登録済みプロジェクト</h3>
          </div>
          <button className="button button--ghost" onClick={() => void loadProjects()} type="button">
            Refresh
          </button>
        </div>

        {error ? <p className="feedback feedback--error">{error}</p> : null}
        {isLoading ? <p className="feedback">Loading projects...</p> : null}

        {!isLoading && projects.length === 0 ? (
          <div className="empty-state">
            <h4>まだプロジェクトがありません</h4>
            <p>まずは上のフォームから 1 件作成すると、詳細画面とアップロード画面へ進めます。</p>
          </div>
        ) : null}

        <div className="card-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card__header">
                <span className={`status-pill status-pill--${project.status}`}>{project.status}</span>
                <span className="meta-text">{formatDate(project.updated_at)}</span>
              </div>

              <div className="project-card__body">
                <h4>{project.name}</h4>
                <p>{project.description || '説明はまだありません。'}</p>
              </div>

              <div className="project-card__footer">
                <Link className="button button--ghost" to={`/projects/${project.id}`}>
                  Details
                </Link>
                <Link className="button button--primary" to={`/projects/${project.id}/upload`}>
                  Upload files
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
