import openai
from flask import Flask, request, jsonify

app = Flask(__name__)

# SQL+から動的に上書きされる設定
ai_config = {
    "model": "gpt-4o",
    "temperature": 0.7,
    "system": "あなたはSQL+の専門家です。指示をSQL+のコマンドのみに変換して返してください。"
}

@app.route('/config', methods=['POST'])
def update_config():
    data = request.json
    ai_config.update(data)
    print(f"AI Config Updated: {ai_config}")
    return jsonify({"status": "success"})

@app.route('/ask', methods=['POST'])
def ask_ai():
    user_input = request.json.get("prompt")
    client = openai.OpenAI(api_key="YOUR_API_KEY") # 実際のキーを入れてください

    response = client.chat.completions.create(
        model=ai_config["model"],
        temperature=ai_config["temperature"],
        messages=[
            {"role": "system", "content": ai_config["system"]},
            {"role": "user", "content": user_input}
        ]
    )
    commands = response.choices[0].message.content.strip()
    return jsonify({"commands": commands})

if __name__ == "__main__":
    app.run(port=5000)
