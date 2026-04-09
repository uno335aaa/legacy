import type { ModelAdapter } from './modelAdapter.js';
/**
 * 環境変数から adapter を選ぶ factory。
 * 未設定時は mock に倒して、開発初期でも詰まらないようにする。
 */
export declare function createModelAdapterFromEnv(): ModelAdapter;
//# sourceMappingURL=modelAdapterFactory.d.ts.map