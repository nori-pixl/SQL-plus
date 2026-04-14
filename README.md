# SQL+

AIと連携し、JavaScriptで動的にデータを生成・操作するための言語エンジンです。

## 特徴
- **JSONベース**: 保存と可視化が容易
- **JS統合**: ロジックにJavaScriptをそのまま利用可能
- **多言語連携**: マイクラ(Java)やUnity(C#)など、外部ソフトと連携
- **自動履歴**: すべての操作をファイルとログに自動記録

## 基本コマンド
- `list.users.add(Taro, 25)` - データの追加
- `js.if(ddt.count('users') > 0, ...)` - 条件分岐
- `file.mkdir(data)` - フォルダ生成

SQL+ コマンドリファレンス
SQL+は、SQLの直感的なデータ操作に、JavaScriptの動的なロジックを融合させた言語です。
1. リスト操作 (List Operations)
データの集合を管理します。
コマンド	説明	例
list.[名].add([名前], [値])	リストに要素を追加します。	list.users.add(Taro, 25)
list.[名].read(all)	リストの内容を 1.名前:値 形式で読み出します。	list.users.read(all)
list.[名].read(name, value)	1.name="名前",value="順番" 形式で読み出します。	list.users.read(name, value)
list.[名].count()	リスト内の項目数を返します。	list.users.count()
list.[名].delete(all)	リストを空にします。	list.users.delete(all)
list.[名].delete(index=[N])	指定した順番の項目を削除します。	list.users.delete(index=1)
list.[名].unique()	重複した名前を削除します。	list.users.unique()
2. 動的ロジック (JS & Logic)
JavaScriptを利用して複雑な判断やループを行います。ddt オブジェクトを介してデータにアクセスします。
コマンド	説明	例
js.run([JSコード])	JSを直接実行します。	js.run(ddt.exec('list.a.add(x,1)'))
js.if([条件], [True命令], [False命令])	条件分岐を行います。	js.if(ddt.count('a') > 0, list.b.add(ok), list.b.add(ng))
js.switch([対象], [値:命令], ...)	多分岐を行います。	js.switch(ddt.count('a'), 0:list.log.add(0), default:list.log.add(N))
js.try([命令], [catch:命令])	エラーハンドリングを行います。	js.try(file.write(...), catch:list.err.add(fs))
3. ファイル・システム操作 (FileSystem)
OSのファイルやフォルダを操作します。
コマンド	説明	例
file.mkdir([パス])	フォルダを再帰的に作成します。	file.mkdir(data/backups)
file.write([パス], [内容])	履歴メタデータ付きでJSONを保存します。	file.write(data/save.json, ddt.read(all))
