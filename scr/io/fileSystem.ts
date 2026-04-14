import * as fs from 'fs';
import * as path from 'path';

export class SQLPlusFileSystem {
  constructor(private logFilePath: string) {}

  /**
   * フォルダを再帰的に作成する
   */
  public makeDirectory(dirPath: string): string {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return `Success: Directory created at ${dirPath}`;
    }
    return `Info: Directory already exists at ${dirPath}`;
  }

  /**
   * メタデータ（履歴）付きでJSONファイルを保存する
   */
  public writeFileWithMeta(filePath: string, content: any, command: string): string {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);

    // 親フォルダがない場合は作成
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const output = {
      _sqlplus_meta: {
        timestamp: new Date().toISOString(),
        generator: "SQL+ Engine",
        source_command: command
      },
      data: content
    };

    fs.writeFileSync(fullPath, JSON.stringify(output, null, 2), 'utf-8');
    return `Success: File saved to ${fullPath}`;
  }

  /**
   * 実行履歴（ログ）をファイルに追記する
   */
  public appendLog(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFilePath, logEntry, 'utf-8');
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }

  /**
   * 既存のファイルを読み込む（テンプレート読み込み用）
   */
  public readFile(filePath: string): any {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      try {
        return JSON.parse(rawData);
      } catch {
        return rawData; // JSONでない場合は文字列として返す
      }
    }
    throw new Error(`File not found: ${filePath}`);
  }
}
