# Brain Surfless 🧠

> SNSのフィードを脳にサーフィンさせない、習慣づくりの集中アプリ

---

## なぜ作ったか

SNSをやっていない自分でも、AIツールをなんとなく開いて時間が溶けていることに気づいた。問題はSNSそのものじゃなく、**注意を奪われる設計そのもの**だった。

既存の集中アプリは「木が枯れる（罰ゲーム型）」か「時間制限（強制型）」ばかり。でもSNSをやめられない本当の理由は意志が弱いからじゃなく、**やめた後に何をすればいいかわからない不安**と**ドーパミンの仕組み**にある。

Brain Surflessは、強制せずに自然と集中できる習慣を作る。

---

## 差別化ポイント

| アプリ | アプローチ |
|---|---|
| Forest | 木が枯れる → 罰ゲーム型 |
| iOSフォーカスモード | 自分で設定 → 手間がかかる |
| ポモドーロ系 | タイマーをスタートするだけ |
| **Brain Surfless** | **通知オフを優しく提案（ナッジ）+ スマホを伏せると自動でタイマー進行** |

**最大の新しさ：** 集中開始直前に「通知をオフにしますか？（おすすめ）」と一言だけ聞くUIは、現時点で他のアプリに存在しない。強制しないから続く。

---

## 主な機能

- **タスクセット** — やることと集中時間（25 / 45 / 60分）を選ぶだけ
- **ナッジUI** — 通知オフを優しく提案。強制しない、毎回聞くことで習慣になる
- **センサー連動タイマー** — スマホを伏せると進む、持ち上げると止まる
- **統計ダッシュボード** — 今日・今週・今月の集中時間、曜日別グラフ、よく集中した時間帯、連続日数

---

## 技術スタック

```
フロントエンド  : React Native
センサー       : 加速度センサー / 近接センサー（iOS & Android）
バックエンド   : Azure Functions（サーバーレスAPI）
DB            : Azure Cosmos DB（セッション履歴）
ホスティング   : Azure Static Web Apps（統計Webビュー）
オプション     : Azure OpenAI（週次パターン分析コメント）
```

---

## アーキテクチャ

```
[スマホアプリ]
     │
     │ セッション記録（REST API）
     ▼
[Azure Functions]
     │
     ├──▶ [Cosmos DB] — 集中セッション履歴
     │
     └──▶ [Azure OpenAI] — 週次分析コメント生成（オプション）
                │
                ▼
        [Static Web Apps] — 統計ダッシュボード
```

---

## 画面フロー

```
タスク入力 → 通知オフ誘導（ナッジ）→ 集中タイマー → 完了 → 統計
```

---

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourname/brain-surfless.git
cd brain-surfless

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env に Azure の接続情報を記入

# 開発サーバーを起動
npm run start
```

### 環境変数

```env
AZURE_COSMOS_ENDPOINT=your_cosmos_endpoint
AZURE_COSMOS_KEY=your_cosmos_key
AZURE_OPENAI_ENDPOINT=your_openai_endpoint   # オプション
AZURE_OPENAI_KEY=your_openai_key             # オプション
```

---

## ディレクトリ構成

```
brain-surfless/
├── src/
│   ├── screens/
│   │   ├── TaskInput.tsx        # タスク入力画面
│   │   ├── NudgeModal.tsx       # 通知オフ誘導UI
│   │   ├── FocusTimer.tsx       # 集中タイマー画面
│   │   ├── Complete.tsx         # 完了画面
│   │   └── Stats.tsx            # 統計画面
│   ├── hooks/
│   │   ├── useSensor.ts         # センサー制御
│   │   └── useSession.ts        # セッション管理
│   ├── api/
│   │   └── sessions.ts          # Azure Functions API
│   └── components/
│       ├── BarChart.tsx
│       └── StreakBadge.tsx
├── azure/
│   └── functions/
│       └── recordSession/       # Azure Functions
├── .env.example
├── package.json
└── README.md
```

---

## 工夫したこと・詰まったこと

### センサー制御
iOSとAndroidでセンサーのAPIが異なり、バックグラウンド動作の制限も違う。特にiOSはバックグラウンドでのセンサー取得に制約があり、〇〇という方法で対処した。（実装後に追記予定）

### ナッジUIの設計
「おすすめ」という言葉と、ボタンの配色・順番だけで誘導する。ダイアログを出す「タイミング」が重要で、タスクセット直後・集中開始直前という文脈があるからこそ受け入れられやすい。

### Azureコスト管理
$300のクレジット内で収めるため、Cosmos DBはサーバーレス課金モードを選択。Azure Functionsは無料枠（月100万リクエスト）内に収まるよう設計した。

---

## 今後の展開

- [ ] Androidセンサー対応の精度改善
- [ ] ウィジェット対応（ホーム画面から即スタート）
- [ ] SNSトレンドダイジェスト機能（1日1回、アカウント不要で閲覧）
- [ ] Apple Watch / Wear OS 連携

---

## 作者

高校生。電子工作（UIAPduino / CH32V003）とWebアプリ開発が好き。情報系大学進学を目指してポートフォリオとして制作。

---

## ライセンス

MIT
