import customtkinter as ctk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import json, os, time
from threading import Thread

class SQLPlusVisualizer(ctk.CTk):
    def __init__(self, target_json):
        super().__init__()
        self.title("SQL+ Live Monitor")
        self.geometry("700x500")
        self.target_json = target_json
        self.last_mtime = 0
        self.fig, self.ax = plt.subplots()
        self.canvas = FigureCanvasTkAgg(self.fig, master=self)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)
        Thread(target=self.watch_file, daemon=True).start()

    def watch_file(self):
        while True:
            if os.path.exists(self.target_json):
                mtime = os.path.getmtime(self.target_json)
                if mtime > self.last_mtime:
                    self.last_mtime = mtime
                    self.after(100, self.update_graph)
            time.sleep(0.5)

    def update_graph(self):
        try:
            with open(self.target_json, 'r') as f:
                content = json.load(f)
                data = content.get('data', [])
                view_type = content.get('view_config', {}).get('type', 'bar')

                labels = [str(i['name']) for i in data]
                values = [float(i['value']) for i in data]

                self.ax.clear()
                if view_type == "bar": self.ax.bar(labels, values, color="#1f538d")
                elif view_type == "line": self.ax.plot(labels, values, marker='o')
                elif view_type == "pie": self.ax.pie(values, labels=labels, autopct='%1.1f%%')
                elif view_type == "scatter": self.ax.scatter(labels, values)
                
                self.ax.set_title(f"SQL+ Mode: {view_type}")
                self.canvas.draw()
        except: pass

if __name__ == "__main__":
    app = SQLPlusVisualizer("build_plans/plan.json")
    app.mainloop()
