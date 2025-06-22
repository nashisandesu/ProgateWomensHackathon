# 🕹️ To Do Quest

Progate Women's Hackathonで2日間4人で作成しました。
Pixel アートで **"タスク管理 × RPG"** を楽しむミニ Web アプリです。  
タスクをクリアして経験値を稼ぎ、レベルを上げながらさまざまなキャラクターを育てましょう！

<p align="center">
  <img src="public/cat-animation.gif" width="200" alt="Collection Icon">
</p>

---

## ✨ 主な機能

### 🎮 RPG要素
- **レベルアップシステム**: タスク完了で経験値を獲得し、レベルアップ
- **キャラクターコレクション**: レベルアップで新しいキャラクターをアンロック
- **HPシステム**: 期限切れタスクでHPが減少
- **アニメーション**: レベルアップ時の特別なアニメーション

### 📝 タスク管理
- **タスクの追加・編集・削除**: 簡単なタスク管理
- **期限設定**: タスクに期限を設定可能
- **ポイントシステム**: タスクごとに経験値ポイントを設定
- **期限切れ通知**: 期限切れタスクの自動通知
- **タスク検索**: タスクの検索機能

### 🔐 認証・セキュリティ
- **Google OAuth**: Googleアカウントでのログイン

### 🎨 UI/UX (スマホでの使用を推奨します。)
- **8-bit風デザイン**: レトロゲーム風のUI
- **リアルタイム更新**: タスク状態の即座反映

---

## 📦 Tech Stack

| Layer      | Tech / Library | Version | Why |
| ---------- | -------------- | ------- | --- |
| Frontend   | **React 19** + **TypeScript** | 19.1.0 | 最新のReact機能 / 型安全 |
| Build      | **Vite**       | 6.3.5 | 超高速 HMR / 0-config で TS & JSX |
| Styling    | **Tailwind CSS** + **NES.css** | - | 8-bit 風 UI をユーティリティで素早く調整 |
| State Mgmt | React Hooks (`useState`, `useReducer`) | - | 規模に適した状態管理 |
| Auth       | **Google OAuth** (`@react-oauth/google`) | 0.12.2 | 安全で簡単な認証 |
| AI         | **Google Generative AI** | 0.24.1 | AI機能の拡張性 |
| Utils      | **UUID** | 11.1.0 | ユニークID生成 |

---

## 🚀 Getting Started

```bash
# 1. クローン
git clone https://github.com/nashisandesu/ProgateWomensHackathon.git
cd ProgateWomensHackathon

# 2. 依存をインストール
npm install

# 3. 環境変数の設定
# .env.local ファイルを作成し、以下を追加：
# VITE_GOOGLE_CLIENT_ID=your_google_client_id
# VITE_GEMINI_API_KEY=your_gemini_api_key

# 4. 開発サーバー起動
npm run dev   # → http://localhost:5173
```

---

## 🎯 使い方

1. **ログイン**: Googleアカウントでログイン
2. **キャラクター選択**: 最初にキャラクターを選択
3. **タスク追加**: 右下の「+」ボタンでタスクを追加
4. **タスク完了**: タスクをクリックして完了マーク
5. **レベルアップ**: 経験値を貯めてレベルアップ
6. **コレクション**: 左下のコレクションボタンで獲得キャラクターを確認

---

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── AddTaskForm.tsx  # タスク追加フォーム
│   ├── CatCharacter.tsx # キャラクター表示
│   ├── CollectionScreen.tsx # コレクション画面
│   ├── LoginPage.tsx    # ログインページ
│   ├── TaskList.tsx     # タスク一覧
│   └── ...
├── hooks/              # カスタムフック
├── utils/              # ユーティリティ関数
├── types.ts            # TypeScript型定義
└── App.tsx             # メインアプリケーション
```

---

## 🔧 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint実行
```

---
