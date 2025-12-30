from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import os, io, logging
from dotenv import load_dotenv
import openai


load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = api_key

@app.route("/extract_pdf", methods=["POST"])
def extract_pdf():
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"success": False, "error": "No file selected"}), 400
        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"success": False, "error": "File must be PDF"}), 400

        pdf_bytes = file.read()
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        return jsonify({"success": True, "text": text, "pages": len(pdf.pages)}), 200

    except Exception as e:
        logger.error(str(e))
        return jsonify({"success": False, "error": str(e)}), 500



@app.route("/ask_question", methods=["POST"])
def ask_question():
    try:
        data = request.get_json()
        if not data or "question" not in data or "context" not in data:
            return jsonify({"success": False, "error": "Question and PDF text required"}), 400

        question = data["question"]
        context = data["context"]

        messages = [
            {"role": "system", "content": "Answer only from given PDF text, be concise."},
            {"role": "user", "content": f"PDF Text:\n{context[:3000]}\n\nQuestion: {question}"}
        ]

       
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0
        )

    
        answer = response.choices[0].message['content'] if 'message' in response.choices[0] else response.choices[0].text

        return jsonify({"success": True, "answer": answer}), 200

    except Exception as e:
        logger.error(str(e))
        return jsonify({"success": False, "error": str(e)}), 500



@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"}), 200


if __name__ == "__main__":
    logger.info("Starting backend on port 5001...")
    app.run(debug=True, port=5001)
