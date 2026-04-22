# SQL+ (SQLP) 
**SQL-like Syntax + JavaScript Dynamics + Object-Oriented Data.**

SQL+（エスキューエル・プラス）は、AI時代のデータ操作とシステム連携のために設計された、**「動くデータ」を定義するプログラミング言語**です。

---

##  プロジェクト構成
```text
sql-plus/
├── src/            # TypeScript：SQLP実行エンジン（核心）
├── ai_brain/       # Python A：AI思考エンジン（GPT連携）
├── monitor/        # Python B：リアルタイム可視化モニター（GUI）
├── docs/           # 命令リファレンス・AI連携ガイド
├── examples/       # マイクラ建築・データ分析サンプル
└── start_all.bat   # 1クリック全起動スクリプト
```

---

## 主な特徴
- **SQL風リスト操作**: 直感的な構文でデータの追加・抽出・集計が可能。
- **JS統合（Dynamic Data）**: リストの中にJavaScriptロジックを直接組み込み、動的な評価を実現。
- **オブジェクト指向 (OOP)**: クラスとインスタンスの概念により、複雑なデータ構造を整理。
- **AI・多言語連携**: Python製のAI（思考）と可視化ウィンドウ（表示）、マイクラ等の外部ゲームを一つのハブで統合。
- **自動履歴 (Activity Log)**: すべての操作をメタデータとして自動記録。

---

##  基本コマンド

### 1. リスト操作
```sql
list.users.add(Taro, 25)           -- データの追加
list.users.read(name, value)      -- 1.name="Taro",value="1" 形式で読込
list.users.count()                 -- 件数取得
```

### 2. オブジェクト指向 (OOP)
```sql
obj.class(Tower, [height|material]) -- 設計図の作成
obj.new(Tower, NorthTower)          -- 実体の生成
obj.NorthTower.set(height, 50)      -- プロパティの設定
```

### 3. 動的ロジック & AI連携
```sql
js.if(sqlp.count('users') > 0, ai.ask("要約して"), list.log.add(empty))
ai.config(model="gpt-4o", temp=0.8) -- AIの挙動を動的に変更
view.chart(type="pie")              -- グラフ形式を円グラフに変更
```

---

##  はじめかた

### 1. インストール
```bash
# TypeScriptエンジンの準備
npm install

# Python AI & モニターの準備
pip install -r requirements.txt
```

### 2. 起動
```bash
# 全システムを一斉起動
./start_all.bat
```

---

## 📄 ライセンス
MIT License - 自由に使用、改造、配布が可能です。
