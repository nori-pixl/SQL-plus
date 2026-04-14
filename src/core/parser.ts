export interface ParsedCommand {
  type: 'list' | 'js' | 'file' | 'system';
  target?: string;    // list名など
  action: string;     // add, read, if, mkdir など
  args: string[];     // 引数の配列
  raw: string;        // 元の命令文字列
}

export class SQLPlusParser {
  /**
   * 文字列の命令を解析してオブジェクトに変換する
   */
  public static parse(command: string): ParsedCommand {
    const raw = command.trim();

    // 1. JS系命令の判定 (js.if, js.run など)
    if (raw.startsWith('js.')) {
      const dotIndex = raw.indexOf('.');
      const parenIndex = raw.indexOf('(');
      const action = raw.substring(dotIndex + 1, parenIndex);
      const argsString = raw.substring(parenIndex + 1, raw.lastIndexOf(')'));
      
      return {
        type: 'js',
        action,
        args: this.splitArgs(argsString),
        raw
      };
    }

    // 2. File系命令の判定 (file.mkdir, file.write など)
    if (raw.startsWith('file.')) {
      const dotIndex = raw.indexOf('.');
      const parenIndex = raw.indexOf('(');
      const action = raw.substring(dotIndex + 1, parenIndex);
      const argsString = raw.substring(parenIndex + 1, raw.lastIndexOf(')'));

      return {
        type: 'file',
        action,
        args: this.splitArgs(argsString),
        raw
      };
    }

    // 3. List系命令の判定 (list.users.add など)
    if (raw.startsWith('list.')) {
      const parts = raw.split('.');
      const target = parts[1]; // リスト名
      const actionWithArgs = parts[2];
      const parenIndex = actionWithArgs.indexOf('(');
      
      const action = parenIndex !== -1 
        ? actionWithArgs.substring(0, parenIndex) 
        : actionWithArgs;
      
      const argsString = parenIndex !== -1 
        ? actionWithArgs.substring(parenIndex + 1, actionWithArgs.lastIndexOf(')')) 
        : "";

      return {
        type: 'list',
        target,
        action,
        args: this.splitArgs(argsString),
        raw
      };
    }

    throw new Error(`Invalid command format: ${command}`);
  }

  /**
   * 引数文字列をカンマで分割する。
   * ただし、カッコ内のカンマは無視する (js.if 等の入れ子対応)
   */
  private static splitArgs(argsString: string): string[] {
    if (!argsString.trim()) return [];

    const args: string[] = [];
    let current = "";
    let depth = 0;

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      if (char === '(') depth++;
      if (char === ')') depth--;

      if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    args.push(current.trim());
    return args;
  }
}
