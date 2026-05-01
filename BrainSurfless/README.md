This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

## 認証（ログイン）について

現時点ではログイン機能は未実装です。セッションの `userId` はローカル固定値で動いていて、バックエンド（Azure Functions）も匿名アクセス前提です。

## APK を作る（Android）

### Debug APK（まずはこれでOK）

```sh
npm run android:apk:debug
```

生成物: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK（署名未設定なら debug 署名でビルドされます）

```sh
npm run android:apk:release
```

生成物: `android/app/build/outputs/apk/release/app-release.apk`

### Play配布向け（AAB）

```sh
npm run android:aab:release
```

生成物: `android/app/build/outputs/bundle/release/app-release.aab`

### リリース署名（任意）

`android/keystore.properties` が存在する場合のみ release 署名が有効になります（git 追跡しない設定にしてあります）。

例:

```properties
storeFile=app/my-release-key.keystore
storePassword=********
keyAlias=********
keyPassword=********
```

## 注意: Functions の URL

開発時は `src/config/apiBaseUrl.ts` で URL を解決しています。

### Android 実機でローカルFunctionsに繋ぐ

Azure Functions Core Tools は `localhost:7071` にバインドされるため、Android実機からはそのままだと到達できません。
USB接続している場合は `adb reverse` が一番簡単です。

```sh
adb reverse tcp:7071 tcp:7071
```

（必要なら Metro 用に `adb reverse tcp:8081 tcp:8081` も）

### Release（配布）ビルド

Release で使う Functions URL は `src/config/apiBaseUrl.ts` の `PROD_API_BASE_URL` に設定してください。
未設定の場合、アプリは起動しますが同期通信は失敗します。

なお現在は「端末だけで完結するローカル版」を優先し、Releaseビルドではリモート同期（Functions呼び出し）をデフォルトでOFFにしています。
同期を有効にしたい場合は `src/config/remoteSync.ts` を変更してください。

## Web化（react-native-web）

最低限のWebビルド（Vite）を追加しています。

```sh
npm run web
```

iOS Safari ではモーションセンサーの利用にユーザー操作が必要なため、`集中をはじめる` のタップ後に許可ダイアログが出ます。

## Azure Static Web Apps へデプロイ（PWA公開）

このリポジトリには、SWA 向けの GitHub Actions workflow を追加済みです。

- Workflow: [/.github/workflows/azure-static-web-apps.yml](../.github/workflows/azure-static-web-apps.yml)
- SWA設定: [web/public/staticwebapp.config.json](web/public/staticwebapp.config.json)

### 1. Azure 側で Static Web App を作成

1. Azure Portal で **Static Web Apps** を新規作成
2. デプロイソースに GitHub を選択
3. 対象リポジトリ: `Brain-Surfless`
4. Build presets は Custom を選択（workflowを使うため）

作成後、Azure から `AZURE_STATIC_WEB_APPS_API_TOKEN` を取得します。

### 2. GitHub Secrets を設定

GitHub リポジトリの Settings -> Secrets and variables -> Actions で以下を登録:

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Azure で取得したデプロイトークン

`GITHUB_TOKEN` は GitHub Actions 既定のトークンを利用するため追加不要です。

### 3. デプロイ実行

`main` ブランチへ push すると自動でデプロイされます。

```sh
git add .
git commit -m "Add SWA deployment config for PWA"
git push origin main
```

### 4. 確認項目（公開後）

SWA の URL で以下を確認してください。

- `/` が表示される（SPA ルーティングが壊れていない）
- `/manifest.json` が 200 で返る
- `/sw.js` が 200 で返る
- DevTools の Application タブで Service Worker が有効

### 補足

- 現在の workflow は `BrainSurfless` 配下で `npm ci && npm run web:build` を実行し、`dist-web` を配信します。
- `staticwebapp.config.json` は `web/public/` に置いてあるため、ビルド成果物に同梱されます。
- `main` 以外の運用にしたい場合は [/.github/workflows/azure-static-web-apps.yml](../.github/workflows/azure-static-web-apps.yml) の `on.push.branches` を変更してください。

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
