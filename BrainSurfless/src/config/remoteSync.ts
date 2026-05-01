// Release（配布）ビルドを「端末だけで完結」させるため、デフォルトでリモート同期を無効化する。
// Debug（開発）ビルドでは Functions を起動していれば同期できる。
export const REMOTE_SYNC_ENABLED = __DEV__;
