import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'

interface PendingUploadFile {
  path: string
  content: string
  encoding: 'base64'
}

// ArrayBuffer を base64 へ変換して、テキスト以外のファイルも壊れにくくする。
function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

export function UploadPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const [label, setLabel] = useState('')
  const [files, setFiles] = useState<PendingUploadFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalBytes = useMemo(() => {
    return files.reduce((sum, file) => sum + file.content.length, 0)
  }, [files])

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      setFiles([])
      return
    }

    const nextFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const buffer = await file.arrayBuffer()
        return {
          path: file.webkitRelativePath || file.name,
          content: arrayBufferToBase64(buffer),
          encoding: 'base64' as const,
        }
      }),
    )

    setFiles(nextFiles)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      await api.uploadProjectFiles(projectId, {
        label: label || `upload-${new Date().toISOString()}`,
        files,
      })

      navigate(`/projects/${projectId}`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to upload files')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-grid">
      <section className="panel panel--wide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Upload files</p>
            <h2>version を作って入力ファイルを保存</h2>
          </div>
          <Link className="button button--ghost" to={`/projects/${projectId}`}>
            Back to detail
          </Link>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Version label</span>
            <input
              onChange={(event) => setLabel(event.target.value)}
              placeholder="例: initial-import"
              value={label}
            />
          </label>

          <label className="upload-dropzone">
            <span className="upload-dropzone__title">ファイルまたはフォルダを選択</span>
            <span className="upload-dropzone__body">
              `webkitdirectory` を使ってフォルダ構成ごと送れます。複数ファイル選択でも動きます。
            </span>
            <input multiple onChange={handleFileSelection} type="file" {...({ webkitdirectory: 'true' } as Record<string, string>)} />
          </label>

          <div className="upload-summary">
            <div>
              <span className="upload-summary__label">Selected files</span>
              <strong>{files.length}</strong>
            </div>
            <div>
              <span className="upload-summary__label">Payload size</span>
              <strong>{totalBytes.toLocaleString()} chars</strong>
            </div>
          </div>

          {files.length > 0 ? (
            <div className="file-table">
              <div className="file-table__head">
                <span>Path</span>
                <span>Encoding</span>
              </div>
              {files.slice(0, 12).map((file) => (
                <div className="file-table__row" key={file.path}>
                  <code>{file.path}</code>
                  <span>{file.encoding}</span>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <p className="feedback feedback--error">{error}</p> : null}

          <button
            className="button button--primary"
            disabled={files.length === 0 || isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Uploading...' : 'Create version and upload'}
          </button>
        </form>
      </section>
    </div>
  )
}
