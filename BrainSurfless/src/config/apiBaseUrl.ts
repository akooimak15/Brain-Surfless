import { NativeModules, Platform } from 'react-native';

// TODO: リリースで使う Functions URL を設定する（例: https://<your-app>.azurewebsites.net/api）
const PROD_API_BASE_URL = '';

function getMetroHost(): string | null {
  const scriptURL: unknown = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptURL !== 'string') {
    return null;
  }

  const match = scriptURL.match(/^https?:\/\/([^:/]+)(?::\d+)?\//);
  return match?.[1] ?? null;
}

export function getApiBaseUrl() {
  if (__DEV__) {
    // Azure Functions Core Tools は基本的に localhost にバインドされるため、
    // 実機Androidは `adb reverse` 前提で localhost を使うのが安定。
    // Androidエミュレータは host の解決が特殊なので 10.0.2.2 を優先する。
    if (Platform.OS === 'android') {
      const metroHost = getMetroHost();
      if (metroHost === '10.0.2.2') {
        return 'http://10.0.2.2:7071/api';
      }
      return 'http://localhost:7071/api';
    }

    // iOS Simulator / dev 環境
    return 'http://localhost:7071/api';
  }

  // release の本番URLが未設定でもアプリを起動できるようにする。
  // 未設定の場合は通信が失敗するだけ（同期はキューに積まれる）。
  return PROD_API_BASE_URL || 'http://localhost:7071/api';
}
