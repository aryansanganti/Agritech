
import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sarvamai import SarvamAI

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Sarvam Client
api_key = os.getenv("VITE_SARVAM_API_KEY") or os.getenv("SARVAM_API_KEY")
if not api_key:
    print("WARNING: SARVAM_API_KEY not found in environment variables")

client = SarvamAI(api_subscription_key=api_key)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "Sarvam Python Backend"}), 200


def get_system_prompt(language_code):
    lang_name = "English"
    if language_code == 'hi':
        lang_name = "Hindi"
    elif language_code == 'bn':
        lang_name = "Bengali"
    elif language_code == 'or':
        lang_name = "Odia"
    
    return f"""You are Bhumi, a wise and friendly agricultural expert friend. 
- Your Goal: Help farmers with practical, empathetic advice.
- Personality: Warm, human-like, encouraging. Avoid being robotic. Speak like a knowledgeable neighbor.
- Language Rule: You MUST strictly respond in {lang_name} ONLY.
- Capabilities: Provide advice on crops, weather, soil, market prices, and farming practices.
- Formatting: Keep paragraphs short. Be concise and helpful."""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Get raw messages from frontend (no system prompt yet)
        raw_messages = data.get('messages', [])
        language = data.get('language', 'en')
        
        # Construct system prompt
        system_prompt = get_system_prompt(language)
        
        # Prepend system message
        messages = [{"role": "system", "content": system_prompt}] + raw_messages
        
        # Correct SDK usage: directly call completions method
        response = client.chat.completions(
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
        
        # Access data directly from response object (pydantic model usually)
        if hasattr(response, 'json'):
           return response.json()
        if hasattr(response, 'dict'):
           return jsonify(response.dict())
           
        # Fallback dump
        return jsonify(response)

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    try:
        data = request.json
        text = data.get('text')
        target_lang_code = data.get('target_language_code', 'hi-IN')
        speaker = data.get('speaker', 'anushka')
        model = data.get('model', 'bulbul:v2')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400

        # Correct SDK usage: client.text_to_speech.convert
        response = client.text_to_speech.convert(
            text=text,
            target_language_code=target_lang_code,
            speaker=speaker,
            pitch=0,
            pace=1.0,
            loudness=1.5,
            speech_sample_rate=8000,
            enable_preprocessing=True,
            model=model
        )
        
        if hasattr(response, 'dict'):
           return jsonify(response.dict())
        return jsonify(response)

    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        temp_filename = "temp_audio.wav"
        file.save(temp_filename)
        
        try:
            # Correct SDK usage: client.speech_to_text.transcribe
            # 'file' expects a file-like object or path? 
            # SDK usually takes open file handle for 'file' parameter typed as core.File
            
            with open(temp_filename, "rb") as f:
                response = client.speech_to_text.transcribe(
                    file=f,
                    model="saarika:v2.5",
                    language_code="unknown" # Auto-detect
                )
            
            if hasattr(response, 'dict'):
                return jsonify(response.dict())
            return jsonify(response)

        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    except Exception as e:
        print(f"STT Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
