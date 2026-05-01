// Web (iOS Safari) ではユーザージェスチャー起点で許可ダイアログが必要。
// DOM lib を tsconfig に入れていないので、型はゆるめに扱う。
export async function ensureMotionPermission(): Promise<boolean> {
  try {
    const DeviceMotionEventAny = (globalThis as any)?.DeviceMotionEvent;
    const requestPermission = DeviceMotionEventAny?.requestPermission;

    if (typeof requestPermission === 'function') {
      const state = await requestPermission.call(DeviceMotionEventAny);
      return state === 'granted';
    }

    // Android Chrome などは requestPermission が無い（=そのまま購読できる）
    return true;
  } catch {
    return false;
  }
}
