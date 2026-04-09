import fs from 'fs';
import path from 'path';

/**
 * 汎用JSONファイルストア
 * spec.md §18に基づき、RDBを使用せずJSONファイルでデータを永続化する
 */
export class JsonStore<T> {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * JSONファイルからデータを読み込む
   */
  read(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[JsonStore] 読み込みエラー: ${this.filePath}`, error);
      return null;
    }
  }

  /**
   * JSONファイルにデータを書き込む（アトミック書き込み）
   */
  write(data: T): void {
    try {
      // 親ディレクトリを作成
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // アトミック書き込み: 一時ファイルに書いてからリネーム
      const tmpPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (error) {
      console.error(`[JsonStore] 書き込みエラー: ${this.filePath}`, error);
      throw error;
    }
  }

  /**
   * ファイルが存在するか
   */
  exists(): boolean {
    return fs.existsSync(this.filePath);
  }
}

/**
 * 配列ベースのJSONストア（一覧管理用）
 */
export class JsonArrayStore<T extends { id: string }> {
  private store: JsonStore<T[]>;

  constructor(filePath: string) {
    this.store = new JsonStore<T[]>(filePath);
  }

  /**
   * 全件取得
   */
  findAll(): T[] {
    return this.store.read() ?? [];
  }

  /**
   * IDで検索
   */
  findById(id: string): T | undefined {
    const items = this.findAll();
    return items.find(item => item.id === id);
  }

  /**
   * 条件で検索
   */
  findBy(predicate: (item: T) => boolean): T[] {
    return this.findAll().filter(predicate);
  }

  /**
   * 追加
   */
  create(item: T): T {
    const items = this.findAll();
    items.push(item);
    this.store.write(items);
    return item;
  }

  /**
   * 更新
   */
  update(id: string, updates: Partial<T>): T | null {
    const items = this.findAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.store.write(items);
    return items[index];
  }

  /**
   * 削除
   */
  delete(id: string): boolean {
    const items = this.findAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;

    this.store.write(filtered);
    return true;
  }
}
