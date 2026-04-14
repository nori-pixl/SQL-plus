import { SQLPlusEngine } from '../src/engine';
import * as fs from 'fs';
import * as path from 'path';

describe('SQLPlusEngine Comprehensive Tests', () => {
  let engine: SQLPlusEngine;
  const testLog = 'test_activity.log';

  beforeEach(() => {
    engine = new SQLPlusEngine(testLog);
  });

  afterAll(() => {
    // テスト後に生成されたログやファイルを削除（クリーンアップ）
    if (fs.existsSync(testLog)) fs.unlinkSync(testLog);
    if (fs.existsSync('test_output')) {
      fs.rmSync('test_output', { recursive: true, force: true });
    }
  });

  // 1. 基本的なリスト操作のテスト
  test('should add items and count them correctly', () => {
    engine.execute("list.users.add(Taro, 25)");
    engine.execute("list.users.add(Hanako, 30)");
    const count = engine.execute("list.users.count()");
    expect(count).toBe(2);
  });

  // 2. JS連携と条件分岐(SQL+)のテスト
  test('should evaluate js.if conditions correctly', () => {
    engine.execute("list.data.add(Test, 100)");
    const result = engine.execute(
      "js.if(ddt.count('data') > 0, list.result.add(Success, 1), list.result.add(Fail, 0))"
    );
    const successCount = engine.execute("list.result.count()");
    expect(successCount).toBe(1);
  });

  // 3. ファイル生成と履歴メタデータのテスト
  test('should create directory and write file with meta data', () => {
    const filePath = 'test_output/save.json';
    engine.execute("file.mkdir(test_output)");
    engine.execute(`file.write(${filePath}, {"test": "data"})`);

    expect(fs.existsSync(filePath)).toBe(true);
    
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(fileContent).toHaveProperty('_sqlplus_meta');
    expect(fileContent._sqlplus_meta.source_command).toContain('file.write');
  });

  // 4. SQL風 read(name, value) フォーマットのテスト
  test('should output correct read format', () => {
    engine.execute("list.items.add(Apple, 150)");
    const output = engine.execute("list.items.read(name, value)");
    // 期待値: ["1.name=\"Apple\",value=\"1\""]
    expect(output[0]).toContain('name="Apple"');
    expect(output[0]).toContain('value="1"');
  });
});
