/**
 * 1 つの JSON ファイルをそのまま読み書きする小さなストア。
 * Project 本体のような「単一オブジェクト」を扱うときに使う。
 */
export declare class JsonStore<T> {
    private filePath;
    constructor(filePath: string);
    /**
     * JSON ファイルを読み込む。
     * ファイルがまだなければ null を返して、呼び出し側で初期値を決められるようにする。
     */
    read(): T | null;
    /**
     * JSON ファイルへ保存する。
     * いったん tmp に書いてから rename することで、中途半端な書き込みを避けやすくする。
     */
    write(data: T): void;
    /**
     * ファイルが存在するかだけを知りたい場面用。
     */
    exists(): boolean;
}
/**
 * JSON 配列を CRUD するための薄いラッパー。
 * versions.json や jobs.json のような「配列ファイル」を扱うときに使う。
 */
export declare class JsonArrayStore<T extends {
    id: string;
}> {
    private store;
    constructor(filePath: string);
    /**
     * 全件取得。ファイルがない場合は空配列を返す。
     */
    findAll(): T[];
    /**
     * id で 1 件取得。
     */
    findById(id: string): T | undefined;
    /**
     * 条件で絞り込み。
     */
    findBy(predicate: (item: T) => boolean): T[];
    /**
     * 1 件追加して保存する。
     */
    create(item: T): T;
    /**
     * 部分更新。対象がなければ null。
     */
    update(id: string, updates: Partial<T>): T | null;
    /**
     * 1 件削除。削除対象がなければ false。
     */
    delete(id: string): boolean;
}
//# sourceMappingURL=jsonStore.d.ts.map