from flask import Flask, render_template, request, jsonify, send_file  
import speech_recognition as sr  
from gtts import gTTS  
import os  
import random  
import difflib  
from googletrans import Translator  
import sounddevice as sd  
import numpy as np  
import requests  
import tempfile  

app = Flask(__name__)  

# 단어 목록  
WORDS = {  
    'School': ['teacher', 'student', 'classroom', 'book', 'pencil',   
              'desk', 'blackboard', 'homework', 'library', 'exam',  
              'notebook', 'eraser', 'pen', 'ruler', 'calculator'],  
    'Family': ['mother', 'father', 'sister', 'brother', 'grandmother',   
               'grandfather', 'aunt', 'uncle', 'cousin', 'baby',   
               'parents', 'daughter', 'son', 'wife', 'husband'],  
    'Animals': ['dog', 'cat', 'elephant', 'lion', 'tiger',   
                'monkey', 'giraffe', 'penguin', 'kangaroo', 'bear',   
                'rabbit', 'snake', 'bird', 'fish', 'dolphin'],  
    'Weather': ['sunny', 'rainy', 'cloudy', 'windy', 'snowy',   
                'storm', 'rainbow', 'thunder', 'fog', 'hail',   
                'hurricane', 'tornado', 'breeze', 'humid', 'dry'],  
    'Food': ['pizza', 'hamburger', 'spaghetti', 'sushi', 'rice',   
             'chicken', 'salad', 'fruit', 'ice cream', 'bread',   
             'sandwich', 'soup', 'noodle', 'cake', 'chocolate']  
}  

@app.route('/')  
def index():  
    return render_template('index.html')  

@app.route('/get_word', methods=['POST'])  
def get_word():  
    topic = request.json.get('topic')  
    if topic not in WORDS:  
        return jsonify({'error': 'Invalid topic'}), 400  
    
    word = random.choice(WORDS[topic])  
    
    # Pexels API를 사용하여 이미지 가져오기  
    headers = {  
        "Authorization": "YOUR_PEXELS_API_KEY"  
    }  
    search_url = f"https://api.pexels.com/v1/search?query={word}&per_page=1"  
    response = requests.get(search_url, headers=headers)  
    image_url = response.json()['photos'][0]['src']['original'] if response.ok else None  

    # 단어 번역  
    translator = Translator()  
    try:  
        korean_meaning = translator.translate(word, src='en', dest='ko').text  
    except:  
        korean_meaning = "번역 불가"  

    return jsonify({  
        'word': word,  
        'image_url': image_url,  
        'korean_meaning': korean_meaning  
    })  

@app.route('/create_audio', methods=['POST'])  
def create_audio():  
    text = request.json.get('text')  
    gender = request.json.get('gender')  
    
    if not text or not gender:  
        return jsonify({'error': 'Missing parameters'}), 400  

    tld = 'co.uk' if gender == 'Boy' else 'com'  
    tts = gTTS(text=text, lang='en', tld=tld)  
    
    # 임시 파일로 저장  
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')  
    tts.save(temp_file.name)  
    
    return send_file(temp_file.name, mimetype='audio/mp3')  

@app.route('/check_pronunciation', methods=['POST'])  
def check_pronunciation():  
    if 'audio' not in request.files:  
        return jsonify({'error': 'No audio file'}), 400  

    audio_file = request.files['audio']  
    target_word = request.form.get('target_word')  

    r = sr.Recognizer()  
    try:  
        with sr.AudioFile(audio_file) as source:  
            audio_data = r.record(source)  
            text = r.recognize_google(audio_data, language='en-US').lower()  
            similarity = difflib.SequenceMatcher(None, target_word, text).ratio()  

            return jsonify({  
                'success': True,  
                'spoken_text': text,  
                'similarity': similarity,  
                'is_correct': similarity > 0.8  
            })  
    except:  
        return jsonify({'error': 'Speech recognition failed'}), 400  

if __name__ == '__main__':  
    app.run(debug=True)