import { ParsedCommand } from './parser';
import * as fs from 'fs';
import * as path from 'path';

export class SQLPlusEvaluator {
  constructor(
    private lists: Map<string, any[]>,
    private logAction: (msg: string) => void
  ) {}

  /**
   * パースされたコマンドを実行する
   */
  public evaluate(parsed: ParsedCommand, execute: (cmd: string) => any): any {
    switch (parsed.type) {
      case 'js':
        return this.evalJs(parsed, execute);
      case 'list':
        return this.evalList(parsed);
      case 'file':
        return this.evalFile(parsed);
      default:
        throw new Error(`Unknown command type: ${parsed.type}`);
    }
  }

  // --- JS連携の評価 ---
  private evalJs(parsed: ParsedCommand, execute: (cmd: string) => any): any {
    const ctx = this.createJsContext(execute);

    if (parsed.action === 'if') {
      const [cond, tCmd, fCmd] = parsed.args;
      const result = new Function('sqlp', `return ${cond}`)(ctx);
      return result ? execute(tCmd) : (fCmd ? execute(fCmd) : null);
    }

    if (parsed.action === 'run') {
      const code = parsed.args[0];
      return new Function('sqlp', code)(ctx);
    }

    // Switch, Try などもここに追加
    return null;
  }

  // --- リスト操作の評価 ---
  private evalList(parsed: ParsedCommand): any {
    const listName = parsed.target!;
    if (!this.lists.has(listName)) this.lists.set(listName, []);
    const list = this.lists.get(listName)!;

    switch (parsed.action) {
      case 'add':
        const [name, val] = parsed.args;
        const item = { name, value: isNaN(Number(val)) ? val : Number(val) };
        list.push(item);
        return "Added";

      case 'read':
        const opts = parsed.args.join("");
        return list.map((item, i) => {
          const order = i + 1;
          if (opts.includes("name") || opts.includes("value")) {
            const res = [];
            if (opts.includes("name")) res.push(`name="${item.name}"`);
            if (opts.includes("value")) res.push(`value="${order}"`);
            return `${order}.${res.join(",")}`;
          }
          return `${order}.${item.name}:${item.value}`;
        });

      case 'count':
        return list.length;
      
      case 'delete':
        if (parsed.args[0] === 'all') { list.length = 0; return "Cleared"; }
        return "Unknown delete option";
    }
  }

  // --- ファイル操作の評価 ---
  private evalFile(parsed: ParsedCommand): any {
    if (parsed.action === 'mkdir') {
      const dir = parsed.args[0];
      fs.mkdirSync(dir, { recursive: true });
      return `Dir Created: ${dir}`;
    }

    if (parsed.action === 'write') {
      const [filePath, content] = parsed.args;
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ data: content }, null, 2));
      return `File Written: ${filePath}`;
    }
  }

  /**
   * JS実行時に注入する「sqlp」オブジェクト
   */
  private createJsContext(execute: (cmd: string) => any) {
    return {
      read: (name: string) => this.lists.get(name) || [],
      count: (name: string) => (this.lists.get(name) || []).length,
      exec: (cmd: string) => execute(cmd)
    };
  }
}
