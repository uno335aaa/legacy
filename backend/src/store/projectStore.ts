import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { JsonStore } from './jsonStore.js';
import { projectPaths } from './projectPaths.js';
import type { Project, ProjectIndex } from '../types/project.js';

/**
 * 一覧画面用 index.json。
 * project.json を全部なめなくても一覧が出せるように分けている。
 */
const indexStore = new JsonStore<ProjectIndex>(projectPaths.projectIndexFile());

/**
 * Project 本体を扱うストア。
 * 1 プロジェクト = 1 ディレクトリ + 複数の JSON ファイル、という構成にしている。
 */
export const projectStore = {
  /**
   * 一覧取得。
   */
  findAll(): Project[] {
    const index = indexStore.read();
    if (!index || !index.projects.length) return [];

    return index.projects
      .map((entry) => {
        const store = new JsonStore<Project>(projectPaths.projectFile(entry.id));
        return store.read();
      })
      .filter((project): project is Project => project !== null);
  },

  /**
   * ID で 1 件取得。
   */
  findById(id: string): Project | null {
    const store = new JsonStore<Project>(projectPaths.projectFile(id));
    return store.read();
  },

  /**
   * プロジェクト作成。
   * spec.md 13.2 のディレクトリ構成と 18 章の JSON ファイルひな形も同時に作る。
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

    const projectDir = projectPaths.projectRoot(id);
    const dirs = [
      'input',
      'working/index',
      'working/chunks',
      'working/ast',
      'working/callgraph',
      'working/ui-analysis',
      'working/db-analysis',
      'working/drafts',
      'output/md',
      'output/puml',
      'output/svg',
      'output/json',
      'chat',
      'meta',
    ];

    for (const dir of dirs) {
      fs.mkdirSync(`${projectDir}/${dir}`, { recursive: true });
    }

    new JsonStore<Project>(projectPaths.projectFile(id)).write(project);
    new JsonStore(projectPaths.versionsFile(id)).write([]);
    new JsonStore(projectPaths.jobsFile(id)).write([]);
    new JsonStore(projectPaths.artifactsFile(id)).write([]);
    new JsonStore(projectPaths.evidencesFile(id)).write([]);
    new JsonStore(projectPaths.chatMessagesFile(id)).write([]);

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
   * プロジェクト更新。
   */
  update(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'status' | 'active_version_id'>>): Project | null {
    const store = new JsonStore<Project>(projectPaths.projectFile(id));
    const project = store.read();
    if (!project) return null;

    const updated: Project = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    store.write(updated);

    const index = indexStore.read();
    if (index) {
      const entry = index.projects.find((item) => item.id === id);
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
   * プロジェクト削除。
   */
  delete(id: string): boolean {
    const projectDir = projectPaths.projectRoot(id);
    if (!fs.existsSync(projectDir)) return false;

    fs.rmSync(projectDir, { recursive: true, force: true });

    const index = indexStore.read();
    if (index) {
      index.projects = index.projects.filter((item) => item.id !== id);
      indexStore.write(index);
    }

    return true;
  },
};
