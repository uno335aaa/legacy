import type { Project } from '../types/project.js';
/**
 * Project 本体を扱うストア。
 * 1 プロジェクト = 1 ディレクトリ + 複数の JSON ファイル、という構成にしている。
 */
export declare const projectStore: {
    /**
     * 一覧取得。
     */
    findAll(): Project[];
    /**
     * ID で 1 件取得。
     */
    findById(id: string): Project | null;
    /**
     * プロジェクト作成。
     * spec.md 13.2 のディレクトリ構成と 18 章の JSON ファイルひな形も同時に作る。
     */
    create(name: string, description: string): Project;
    /**
     * プロジェクト更新。
     */
    update(id: string, updates: Partial<Pick<Project, "name" | "description" | "status" | "active_version_id">>): Project | null;
    /**
     * プロジェクト削除。
     */
    delete(id: string): boolean;
};
//# sourceMappingURL=projectStore.d.ts.map