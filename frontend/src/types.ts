export type ProjectStatus =
  | 'created'
  | 'uploaded'
  | 'analyzing'
  | 'completed'
  | 'failed'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  created_at: string
  updated_at: string
  active_version_id: string | null
}

export interface ProjectVersion {
  id: string
  project_id: string
  label: string
  upload_path: string
  created_at: string
}

export interface ProjectDetailResponse {
  project: Project
  versions: ProjectVersion[]
}

export interface ProjectFile {
  path: string
  size: number
}

export interface ProjectFilesResponse {
  project_id: string
  version_id: string | null
  files: ProjectFile[]
}

export interface PromptSummary {
  id: string
  purpose: string
}

export interface PromptListResponse {
  prompts: PromptSummary[]
}

export interface RenderPromptResponse {
  promptId: string
  system: string
  user: string
}

export interface GeneratePromptResponse {
  promptId: string
  purpose: string
  systemPrompt: string
  userPrompt: string
  rawText: string
  parsed: unknown | null
  provider: string
  modelId: string
}

export type ArtifactFormat = 'md' | 'puml' | 'svg' | 'json'

export type ArtifactType =
  | 'overview'
  | 'class_list'
  | 'class_diagram'
  | 'class_spec'
  | 'method_list'
  | 'method_spec'
  | 'flowchart'
  | 'sequence'
  | 'screen_transition'
  | 'screen_spec'
  | 'screen_event'
  | 'screen_layout'
  | 'crud_table'
  | 'db_update_spec'

export interface Artifact {
  id: string
  project_id: string
  version_id: string
  type: ArtifactType
  path: string
  format: ArtifactFormat
  created_at: string
}

export interface ArtifactListResponse {
  artifacts: Artifact[]
}

export interface ArtifactDetailResponse {
  artifact: Artifact
  content: string
}

export interface GenerateArtifactResponse {
  artifact: Artifact
  content: string
}
