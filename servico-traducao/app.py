from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

@app.route('/translate', methods=['POST'])
def translate_text():
    
    data = request.get_json()

    if not data or 'text' not in data:
        app.logger.error("Requisição inválida: 'text' não encontrado no corpo.")
        return jsonify({"error": "O campo 'text' é obrigatório."}), 400

    text_to_translate = data['text']
    source_lang = data.get('source', 'pt') 
    target_lang = data.get('target', 'en') 

    try:
        app.logger.info(f"Traduzindo texto: '{text_to_translate}' de {source_lang} para {target_lang}")
        translated_text = GoogleTranslator(source=source_lang, target=target_lang).translate(text_to_translate)

        return jsonify({"translatedText": translated_text})

    except Exception as e:
        app.logger.error(f"Erro durante a tradução: {e}")
        return jsonify({"error": "Ocorreu um erro interno ao traduzir o texto."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)