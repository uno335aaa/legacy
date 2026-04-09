import type {
  ArtifactDetailResponse,
  ArtifactListResponse,
  GeneratePromptResponse,
  GenerateArtifactResponse,
  Project,
  ProjectDetailResponse,
  ProjectFilesResponse,
  PromptListResponse,
  RenderPromptResponse,
  ProjectVersion,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

interface CreateProjectInput {
  name: string
  description: string
}

interface UploadInputFile {
  path: string
  content: string
  encoding: 'base64'
}

interface UploadProjectInput {
  label: string
  files: UploadInputFile[]
}

interface UploadProjectResponse {
  project: Project | null
  version: ProjectVersion
  files: Array<{ path: string; size: number }>
}

interface PromptRequestInput {
  promptId: string
  variables: Record<string, string>
  modelId?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorBody.error ?? 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  getProjects(): Promise<Project[]> {
    return request<Project[]>('/projects')
  },

  createProject(input: CreateProjectInput): Promise<Project> {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  getProject(projectId: string): Promise<ProjectDetailResponse> {
    return request<ProjectDetailResponse>(`/projects/${projectId}`)
  },

  getProjectFiles(projectId: string, versionId?: string): Promise<ProjectFilesResponse> {
    const query = versionId ? `?version_id=${encodeURIComponent(versionId)}` : ''
    return request<ProjectFilesResponse>(`/projects/${projectId}/files${query}`)
  },

  uploadProjectFiles(projectId: string, input: UploadProjectInput): Promise<UploadProjectResponse> {
    return request<UploadProjectResponse>(`/projects/${projectId}/upload`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  getPrompts(): Promise<PromptListResponse> {
    return request<PromptListResponse>('/prompts')
  },

  renderPrompt(input: PromptRequestInput): Promise<RenderPromptResponse> {
    return request<RenderPromptResponse>('/prompts/render', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  generatePrompt(input: PromptRequestInput): Promise<GeneratePromptResponse> {
    return request<GeneratePromptResponse>('/prompts/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  getProjectArtifacts(projectId: string): Promise<ArtifactListResponse> {
    return request<ArtifactListResponse>(`/projects/${projectId}/artifacts`)
  },

  getProjectArtifact(projectId: string, artifactId: string): Promise<ArtifactDetailResponse> {
    return request<ArtifactDetailResponse>(`/projects/${projectId}/artifacts/${artifactId}`)
  },

  generateProjectArtifact(projectId: string, input: PromptRequestInput): Promise<GenerateArtifactResponse> {
    return request<GenerateArtifactResponse>(`/projects/${projectId}/artifacts/regenerate`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
}
