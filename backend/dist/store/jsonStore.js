import fs from 'fs';
import path from 'path';
/**
 * 1 つの JSON ファイルをそのまま読み書きする小さなストア。
 * Project 本体のような「単一オブジェクト」を扱うときに使う。
 */
export class JsonStore {
    filePath;
    constructor(filePath) {
        this.filePath = filePath;
    }
    /**
     * JSON ファイルを読み込む。
     * ファイルがまだなければ null を返して、呼び出し側で初期値を決められるようにする。
     */
    read() {
        try {
            if (!fs.existsSync(this.filePath)) {
                return null;
            }
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`[JsonStore] Failed to read: ${this.filePath}`, error);
            return null;
        }
    }
    /**
     * JSON ファイルへ保存する。
     * いったん tmp に書いてから rename することで、中途半端な書き込みを避けやすくする。
     */
    write(data) {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const tmpPath = `${this.filePath}.tmp`;
            fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
            fs.renameSync(tmpPath, this.filePath);
        }
        catch (error) {
            console.error(`[JsonStore] Failed to write: ${this.filePath}`, error);
            throw error;
        }
    }
    /**
     * ファイルが存在するかだけを知りたい場面用。
     */
    exists() {
        return fs.existsSync(this.filePath);
    }
}
/**
 * JSON 配列を CRUD するための薄いラッパー。
 * versions.json や jobs.json のような「配列ファイル」を扱うときに使う。
 */
export class JsonArrayStore {
    store;
    constructor(filePath) {
        this.store = new JsonStore(filePath);
    }
    /**
     * 全件取得。ファイルがない場合は空配列を返す。
     */
    findAll() {
        return this.store.read() ?? [];
    }
    /**
     * id で 1 件取得。
     */
    findById(id) {
        const items = this.findAll();
        return items.find((item) => item.id === id);
    }
    /**
     * 条件で絞り込み。
     */
    findBy(predicate) {
        return this.findAll().filter(predicate);
    }
    /**
     * 1 件追加して保存する。
     */
    create(item) {
        const items = this.findAll();
        items.push(item);
        this.store.write(items);
        return item;
    }
    /**
     * 部分更新。対象がなければ null。
     */
    update(id, updates) {
        const items = this.findAll();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1)
            return null;
        items[index] = { ...items[index], ...updates };
        this.store.write(items);
        return items[index];
    }
    /**
     * 1 件削除。削除対象がなければ false。
     */
    delete(id) {
        const items = this.findAll();
        const filtered = items.filter((item) => item.id !== id);
        if (filtered.length === items.length)
            return false;
        this.store.write(filtered);
        return true;
    }
}
//# sourceMappingURL=jsonStore.js.map