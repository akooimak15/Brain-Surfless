# Brain Surfless — Copilot Instructions

## プロジェクト概要
スマホを伏せると集中タイマーが進む、ナッジ型の集中習慣アプリ。
React Native + Azure Functions + Cosmos DB で構成。

## 技術スタック
- **フロントエンド**: React Native (TypeScript)
- **センサー**: `react-native-sensors` で加速度センサー制御
- **バックエンド**: Azure Functions (Node.js / TypeScript)
- **DB**: Azure Cosmos DB (セッション履歴)
- **オプション**: Azure OpenAI (週次分析コメント)

## ディレクトリ構成
```
src/
  screens/
    TaskInput.tsx       # タスク名・集中時間を入力
    NudgeModal.tsx      # 通知オフ誘導ダイアログ（★差別化ポイント）
    FocusTimer.tsx      # センサー連動タイマー
    Complete.tsx        # セッション完了・記録
    Stats.tsx           # 統計ダッシュボード
  hooks/
    useSensor.ts        # 加速度センサーでスマホの表裏を判定
    useSession.ts       # セッション開始・停止・記録
  api/
    sessions.ts         # Azure Functions へのPOST/GET
azure/
  functions/
    recordSession/      # セッション記録エンドポイント
    getStats/           # 統計取得エンドポイント
```

## コアロジック

### センサー判定（useSensor.ts）
- 加速度センサーのZ軸がマイナス → スマホが伏せられている → タイマー進行
- Z軸がプラス → スマホが表向き → タイマー停止
- サンプリングレート: 500ms

### NudgeModal の挙動
- タスクセット後、FocusTimerに遷移する直前に1回だけ表示
- 「オフにする（おすすめ）」→ `react-native` の DnD API を呼び出して通知オフ
- 「このままでいい」→ 何もせずタイマー画面へ
- **強制しない。ユーザーの選択を尊重する。**

### セッションデータ構造（Cosmos DB）
```typescript
interface Session {
  id: string           // uuid
  userId: string
  taskName: string
  startedAt: string    // ISO8601
  endedAt: string      // ISO8601
  focusDuration: number  // 実際に集中できた秒数（伏せていた時間の合計）
  interrupted: boolean   // 途中でスマホを持ち上げたか
}
```

## コーディング規約
- TypeScript strict モード
- コンポーネントは関数コンポーネント + hooks のみ
- スタイルは `StyleSheet.create` を使う
- Azure Functions は HTTP trigger、認証なし（ポートフォリオ用途のため）
- エラーハンドリングは try/catch で必ず書く
- コメントは日本語でOK

## 環境変数（.env）
```
AZURE_COSMOS_ENDPOINT=
AZURE_COSMOS_KEY=
AZURE_COSMOS_DB_NAME=brainsurfless
AZURE_COSMOS_CONTAINER=sessions
AZURE_OPENAI_ENDPOINT=        # オプション
AZURE_OPENAI_KEY=             # オプション
```

## やってはいけないこと
- 通知を強制オフにするコードを書かない（ユーザーが選択する設計）
- Cosmos DB への直接アクセスをフロントエンドから行わない（必ずFunctions経由）
