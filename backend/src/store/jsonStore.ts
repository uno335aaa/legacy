import fs from 'fs';
import path from 'path';

/**
 * 1 つの JSON ファイルをそのまま読み書きする小さなストア。
 * Project 本体のような「単一オブジェクト」を扱うときに使う。
 */
export class JsonStore<T> {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * JSON ファイルを読み込む。
   * ファイルがまだなければ null を返して、呼び出し側で初期値を決められるようにする。
   */
  read(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }

      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[JsonStore] Failed to read: ${this.filePath}`, error);
      return null;
    }
  }

  /**
   * JSON ファイルへ保存する。
   * いったん tmp に書いてから rename することで、中途半端な書き込みを避けやすくする。
   */
  write(data: T): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tmpPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (error) {
      console.error(`[JsonStore] Failed to write: ${this.filePath}`, error);
      throw error;
    }
  }

  /**
   * ファイルが存在するかだけを知りたい場面用。
   */
  exists(): boolean {
    return fs.existsSync(this.filePath);
  }
}

/**
 * JSON 配列を CRUD するための薄いラッパー。
 * versions.json や jobs.json のような「配列ファイル」を扱うときに使う。
 */
export class JsonArrayStore<T extends { id: string }> {
  private store: JsonStore<T[]>;

  constructor(filePath: string) {
    this.store = new JsonStore<T[]>(filePath);
  }

  /**
   * 全件取得。ファイルがない場合は空配列を返す。
   */
  findAll(): T[] {
    return this.store.read() ?? [];
  }

  /**
   * id で 1 件取得。
   */
  findById(id: string): T | undefined {
    const items = this.findAll();
    return items.find((item) => item.id === id);
  }

  /**
   * 条件で絞り込み。
   */
  findBy(predicate: (item: T) => boolean): T[] {
    return this.findAll().filter(predicate);
  }

  /**
   * 1 件追加して保存する。
   */
  create(item: T): T {
    const items = this.findAll();
    items.push(item);
    this.store.write(items);
    return item;
  }

  /**
   * 部分更新。対象がなければ null。
   */
  update(id: string, updates: Partial<T>): T | null {
    const items = this.findAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.store.write(items);
    return items[index];
  }

  /**
   * 1 件削除。削除対象がなければ false。
   */
  delete(id: string): boolean {
    const items = this.findAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;

    this.store.write(filtered);
    return true;
  }
}
