import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { JsonArrayStore, JsonStore } from './jsonStore.js';
import type { Project, ProjectIndex } from '../types/project.js';

// プロジェクトデータのベースディレクトリ
const PROJECTS_BASE = process.env.PROJECTS_DIR || path.join(process.cwd(), '..', 'projects');

/**
 * プロジェクト一覧インデックスのストア
 */
const indexStore = new JsonStore<ProjectIndex>(
  path.join(PROJECTS_BASE, 'index.json')
);

/**
 * プロジェクトストア
 * 各プロジェクトの meta/project.json を操作する
 */
export const projectStore = {
  /**
   * 全プロジェクト一覧を取得
   */
  findAll(): Project[] {
    const index = indexStore.read();
    if (!index || !index.projects.length) return [];

    return index.projects.map(entry => {
      const store = new JsonStore<Project>(
        path.join(PROJECTS_BASE, entry.id, 'meta', 'project.json')
      );
      return store.read();
    }).filter((p): p is Project => p !== null);
  },

  /**
   * IDでプロジェクトを取得
   */
  findById(id: string): Project | null {
    const store = new JsonStore<Project>(
      path.join(PROJECTS_BASE, id, 'meta', 'project.json')
    );
    return store.read();
  },

  /**
   * プロジェクトを新規作成
   * spec.md §13.2 に準拠したディレクトリ構造も作成する
   */
  create(name: string, description: string): Project {
    const id = uuidv4();
    const now = new Date().toISOString();

    const project: Project = {
      id,
      name,
      description,
      status: 'created',
      created_at: now,
      updated_at: now,
      active_version_id: null,
    };

    // spec.md §13.2 準拠のディレクトリ構造を作成
    const projectDir = path.join(PROJECTS_BASE, id);
    const dirs = ['input', 'working/index', 'working/chunks', 'working/ast', 'working/callgraph',
      'working/ui-analysis', 'working/db-analysis', 'working/drafts',
      'output/md', 'output/puml', 'output/svg', 'output/json',
      'chat', 'meta'];
    for (const dir of dirs) {
      fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
    }

    // プロジェクトメタ情報を保存
    const store = new JsonStore<Project>(
      path.join(projectDir, 'meta', 'project.json')
    );
    store.write(project);

    // インデックスを更新
    const index = indexStore.read() ?? { projects: [] };
    index.projects.push({
      id,
      name,
      status: 'created',
      updated_at: now,
    });
    indexStore.write(index);

    return project;
  },

  /**
   * プロジェクトを更新
   */
  update(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>): Project | null {
    const store = new JsonStore<Project>(
      path.join(PROJECTS_BASE, id, 'meta', 'project.json')
    );
    const project = store.read();
    if (!project) return null;

    const updated: Project = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    store.write(updated);

    // インデックスも更新
    const index = indexStore.read();
    if (index) {
      const entry = index.projects.find(p => p.id === id);
      if (entry) {
        entry.name = updated.name;
        entry.status = updated.status;
        entry.updated_at = updated.updated_at;
        indexStore.write(index);
      }
    }

    return updated;
  },

  /**
   * プロジェクトを削除
   */
  delete(id: string): boolean {
    const projectDir = path.join(PROJECTS_BASE, id);
    if (!fs.existsSync(projectDir)) return false;

    // ディレクトリごと削除
    fs.rmSync(projectDir, { recursive: true, force: true });

    // インデックスから削除
    const index = indexStore.read();
    if (index) {
      index.projects = index.projects.filter(p => p.id !== id);
      indexStore.write(index);
    }

    return true;
  },
};
