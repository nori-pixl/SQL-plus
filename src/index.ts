import { SQLPlusEngine } from './engine';

// エンジンのインスタンスを作成
const sqlp = new SQLPlusEngine();

/**
 * 1. 直接コマンドを実行する例
 */
console.log("--- SQL+ Execution Start ---");

// リストの作成と追加
sqlp.execute("list.buildings.add(CastleTower, 100)");
sqlp.execute("list.buildings.add(Wall, 50)");

// JSロジックとの連携（条件分岐）
sqlp.execute(`
  js.if(
    ddt.count('buildings') >= 2,
    file.write(build_plans/plan.json, ddt.read(name, value)),
    list.system.add(status, 'waiting')
  )
`);

// データの読み取りと可視化
const output = sqlp.execute("list.buildings.read(name, value)");
console.log("Current Plan:", output);


/**
 * 2. 他の言語やAIからの入力を受け付ける関数（拡張用）
 */
export const runSQLPlus = (cmd: string) => {
  return sqlp.execute(cmd);
};

/**
 * 3. マイクラ等の外部連携用（将来的なサーバー化の土台）
 * ここを Express 等でラップすれば HTTP 経由で操作可能になります。
 */
console.log("--- SQL+ Logged Activity ---");
console.log("Check 'sqlplus_activity.log' for details.");
