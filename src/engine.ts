import * as fs from 'fs';
import * as path from 'path';

export type ListItem = { name: string; value: any; [key: string]: any };

export class SQLPlusEngine {
  private lists: Map<string, ListItem[]> = new Map();
  private classes: Map<string, string[]> = new Map(); // クラス設計図
  private instances: Map<string, Record<string, any>> = new Map(); // オブジェクト実体
  private history: string[] = [];
  private viewSettings = { type: "bar" };

  constructor(private logFilePath: string = 'sqlplus_activity.log') {
    this.logAction("SQL+ Engine (SQLP) Initialized");
  }

  // JS実行環境 (JSの中から 'sqlp' オブジェクトとして利用可能)
  private get sqlpContext() {
    return {
      read: (name: string) => this.lists.get(name) || [],
      count: (name: string) => (this.lists.get(name) || []).length,
      instance: (name: string) => this.instances.get(name),
      exec: (cmd: string) => this.execute(cmd)
    };
  }

  public execute(command: string): any {
    this.logAction(`Execute: ${command}`);

    // --- 1. オブジェクト指向 (OOP) ---
    // obj.class(Tower, [height|material])
    if (command.startsWith("obj.class(")) {
      const [className, propsRaw] = this.parseCSVArgs(command);
      const props = propsRaw.replace(/[\[\]]/g, "").split("|").map(p => p.trim());
      this.classes.set(className, props);
      return `Class '${className}' defined`;
    }
    // obj.new(Tower, NorthTower)
    if (command.startsWith("obj.new(")) {
      const [className, instName] = this.parseCSVArgs(command);
      if (!this.classes.has(className)) return `Error: Class ${className} not found`;
      this.instances.set(instName, { _type: className });
      return `Instance '${instName}' created`;
    }
    // obj.NorthTower.set(height, 50)
    if (command.startsWith("obj.") && command.includes(".set(")) {
      const parts = command.split(".");
      const instName = parts[1];
      const [prop, val] = this.parseCSVArgs(command);
      const inst = this.instances.get(instName);
      if (inst) {
        inst[prop] = isNaN(Number(val)) ? val : Number(val);
        return `${instName}.${prop} = ${val}`;
      }
    }

    // --- 2. JS連携 & 条件分岐 ---
    if (command.startsWith("js.if(")) {
      const [cond, tCmd, fCmd] = this.parseCSVArgs(command);
      const isTrue = new Function('sqlp', `return ${cond}`)(this.sqlpContext);
      return isTrue ? this.execute(tCmd) : (fCmd ? this.execute(fCmd) : null);
    }
    if (command.startsWith("js.run(")) {
      const code = this.extractArgs(command);
      return new Function('sqlp', code)(this.sqlpContext);
    }

    // --- 3. SQL風リスト操作 ---
    const tokens = command.split(".");
    if (tokens[0] === "list") {
      const listName = tokens[1];
      const action = tokens[2];
      if (!this.lists.has(listName)) this.lists.set(listName, []);
      const list = this.lists.get(listName)!;

      if (action.startsWith("add(")) {
        const [n, v] = this.parseCSVArgs(action);
        list.push({ name: n, value: isNaN(Number(v)) ? v : Number(v) });
        return "Added";
      }
      if (action.startsWith("read(")) {
        const opts = this.extractArgs(action);
        return list.map((item, i) => {
          const order = i + 1;
          if (opts.includes("name") || opts.includes("value")) {
            return `${order}.name="${item.name}",value="${order}"`;
          }
          return `${order}.${item.name}:${item.value}`;
        });
      }
    }

    // --- 4. 可視化・システム ---
    if (command.startsWith("view.chart(")) {
      const [type] = this.parseCSVArgs(command);
      this.viewSettings.type = type.replace(/['"]/g, "");
      return `View Mode: ${this.viewSettings.type}`;
    }

    if (command.startsWith("file.write(")) {
      const [filePath, content] = this.parseCSVArgs(command);
      const out = { data: content, view_config: this.viewSettings };
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
      return `File Written: ${filePath}`;
    }

    return "Command unknown";
  }

  private logAction(msg: string) {
    fs.appendFileSync(this.logFilePath, `[${new Date().toISOString()}] ${msg}\n`);
  }

  private extractArgs(cmd: string): string {
    return cmd.match(/\((.*)\)/s)?.[1] || "";
  }

  private parseCSVArgs(cmd: string): string[] {
    return this.extractArgs(cmd).split(/,(?![^\(]*\))/).map(s => s.trim());
  }
}
