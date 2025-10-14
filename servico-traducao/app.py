from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import logging

# Configura o logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

@app.route('/translate', methods=['POST'])
def translate_text():
    # 1. Pega o JSON enviado na requisição
    data = request.get_json()

    # 2. Valida se o texto foi enviado
    if not data or 'text' not in data:
        app.logger.error("Requisição inválida: 'text' não encontrado no corpo.")
        return jsonify({"error": "O campo 'text' é obrigatório."}), 400

    text_to_translate = data['text']
    source_lang = data.get('source', 'pt') # Padrão 'pt'
    target_lang = data.get('target', 'en') # Padrão 'en'

    try:
        # 3. Realiza a tradução
        app.logger.info(f"Traduzindo texto: '{text_to_translate}' de {source_lang} para {target_lang}")
        translated_text = GoogleTranslator(source=source_lang, target=target_lang).translate(text_to_translate)

        # 4. Retorna o resultado como JSON
        return jsonify({"translatedText": translated_text})

    except Exception as e:
        app.logger.error(f"Erro durante a tradução: {e}")
        return jsonify({"error": "Ocorreu um erro interno ao traduzir o texto."}), 500

if __name__ == '__main__':
    # Roda o servidor em uma porta diferente da sua API Node.js, por exemplo, 5001
    app.run(debug=True, port=5001)