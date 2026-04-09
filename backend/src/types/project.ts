// プロジェクトのステータス
export type ProjectStatus = 'created' | 'uploaded' | 'analyzing' | 'completed' | 'failed';

// プロジェクトエンティティ (spec.md §18.1)
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  active_version_id: string | null;
}

// プロジェクトバージョン (spec.md §18.2)
export interface ProjectVersion {
  id: string;
  project_id: string;
  label: string;
  upload_path: string;
  created_at: string;
}

// 解析ジョブ (spec.md §18.3)
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type JobPhase =
  | 'ingest'
  | 'detect'
  | 'analyze_structure'
  | 'analyze_db'
  | 'synthesize_doc'
  | 'generate_diagrams'
  | 'review'
  | 'complete';

export interface AnalysisJob {
  id: string;
  project_id: string;
  version_id: string;
  status: JobStatus;
  started_at: string | null;
  finished_at: string | null;
  current_phase: JobPhase | null;
  summary: string | null;
}

// 成果物 (spec.md §18.4)
export type ArtifactFormat = 'md' | 'puml' | 'svg' | 'json';
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
  | 'db_update_spec';

export interface Artifact {
  id: string;
  project_id: string;
  version_id: string;
  type: ArtifactType;
  path: string;
  format: ArtifactFormat;
  created_at: string;
}

// チャットメッセージ (spec.md §18.5)
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  project_id: string;
  role: ChatRole;
  message: string;
  related_job_id: string | null;
  created_at: string;
}

// 推定根拠 (spec.md §18.6 / §13.4.4)
export type EvidenceType = 'naming' | 'annotation' | 'import' | 'code_pattern' | 'llm_inference';

export interface Evidence {
  id: string;
  project_id: string;
  source_path: string;
  symbol_name: string;
  evidence_type: EvidenceType;
  summary: string;
  confidence: number;
}

// プロジェクト一覧インデックス (spec.md §18.7)
export interface ProjectIndex {
  projects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    updated_at: string;
  }>;
}
