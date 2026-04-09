// Project の状態。spec.md の 18.1 に合わせて管理する。
export type ProjectStatus = 'created' | 'uploaded' | 'analyzing' | 'completed' | 'failed';

// プロジェクト本体。1 プロジェクト = 1 つの解析単位。
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  active_version_id: string | null;
}

// 取り込んだソース一式のスナップショット情報。
export interface ProjectVersion {
  id: string;
  project_id: string;
  label: string;
  upload_path: string;
  created_at: string;
}

// 解析ジョブの状態。
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

// 生成物の拡張子。
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

// チャットの発言種別。
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  project_id: string;
  role: ChatRole;
  message: string;
  related_job_id: string | null;
  created_at: string;
}

// 推論の根拠。confidence は 0.0 - 1.0 を想定する。
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

// 一覧画面用の軽量データ。project.json 全体を毎回読まなくてよいように分けている。
export interface ProjectIndexEntry {
  id: string;
  name: string;
  status: ProjectStatus;
  updated_at: string;
}

// projects/index.json の中身。
export interface ProjectIndex {
  projects: ProjectIndexEntry[];
}
