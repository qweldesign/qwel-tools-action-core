# QWEL Action Core (Navigation Core)

[QWEL.DESIGN](https://qwel.design/) のweb開発のための最小 UI/UX コンポーネント集

▶ Sample DEMO: [https://tools.qwel.design/action-core/]

---

## 概要 | Overview

- QWEL Action Core (Navigation Core) は、Web開発のための最小 UI/UX コンポーネントを集めたライブラリです
- あらゆるWebサイト/ランディングページに必要な「読む, 迷わない, 戻れる」という行為を支えるための最小構成です
- 外部に依存関係を持たない Vanilla JS のみで稼働する, 下記の機能が含まれます
- MITライセンスで提供しており, 商用/非商用問わず自由に利用可能です

---

## 機能 | Features

- **ScrollToAnchor**: header高さをCSS変数にセットし, アンカーリンクのスクロール位置を補正する機能
- **ScrollSpy**: スクロール位置 (セクション) に応じてナビゲーションの状態を更新する機能
- **ReadableOnScroll**: 画面内を出入りする要素のクラスを切り替える機能
- **ShrinkHeader**: header要素の縮小をスクロールで制御する機能
- **BackToTop**: トップへ戻るボタンを自動生成し, 制御する機能
- **DrawerMenu**: ドロワーメニューを自動生成し, 制御する機能

---

## 使い方 | How To Use

- GitHub リポジトリページの緑色のボタンからソースコードをダウンロードしてください
- ダウンロードした ZIP ファイルを解凍し, action-core.css と js/action-core.js を取り出し, 任意の場所に配置してください
- JSコード内で ActionCore を import して使用します (サンプルでは init.js 内に記載がありますので参考にしてください)
- グローバル名前空間 ActionCore から, 各クラスのインスタンスを生成 (new 演算子を使用) すれば, 機能が有効になります
- 詳細な使用方法 (データ属性の設定, オプション等) は, ソースコード内にコメントを記載してありますので参照してください

---

## 設計メモ | Design Notes

- Action Core が扱うUIは, 視覚的な演出や印象操作を目的とせず, **ユーザーの行動と理解を支える最小限の介入**を行います
- 命名は, 設計者のポートフォリオ "[QWEL in Action](https://qwel.design)" に由来しています
- ユーザーの「読む, 迷わない, 戻れる」という行為を支えるという内容から, **Navigation Core** という副題を添えました
- 既存の情報構造 (HTML) にdata属性を記述する以外には, **構造に介入せず, 構造を再利用し, 振る舞いだけを提供**します
- **インスタンス化すれば自動で動きます**が, DOM操作を前提とする SPA 等で使う場合には, **必要なら初期化や破棄を制御できます**
- 設計者自身の学習用途も兼ねて, **ソースコード内のコメントはなるべく丁寧に記載しました**
- 本プロジェクトはフレームワークではなく, ただのライブラリであり, **設計者自身の判断を前提にした半完成の道具箱**です

---

## ライセンス | License

MIT License

このプロジェクトは, webサイトやランディングページの基本となるUIユーティリティとして自由に使用できることを目的としています。  
This project is intended to be freely used as a core UI utility for websites and landing pages.  

詳しくは LICENSE ファイルをご覧ください。  
See the LICENSE file for details.  

---

## 制作者 | Author

[QWEL.DESIGN](https://qwel.design)  
福井を拠点に活動するフロントエンド開発者  
Front-end developer based in Fukui, Japan  
