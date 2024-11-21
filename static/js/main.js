// 상태 관리를 위한 클래스  
class AppState {  
    constructor() {  
        this.selectedTopic = '';  
        this.selectedGender = '';  
        this.currentWord = '';  
        this.score = 0;  
        this.totalAttempts = 0;  
        this.isRecording = false;  
        this.mediaRecorder = null;  
        this.audioChunks = [];  
    }  
}  

// 앱의 주요 기능을 관리하는 클래스  
class WordFriendsApp {  
    constructor() {  
        this.state = new AppState();  
        this.initializeElements();  
        this.addEventListeners();  
        this.updateUI();  
    }  

    // DOM 요소 초기화  
    initializeElements() {  
        this.topicButtons = document.querySelectorAll('.topic-btn');  
        this.characterButtons = document.querySelectorAll('.character-btn');  
        this.wordCardsContainer = document.getElementById('word-cards-container');  
        this.selectedTopicDisplay = document.getElementById('selected-topic');  
        this.selectedGenderDisplay = document.getElementById('selected-gender');  
        this.scoreDisplay = document.getElementById('score');  
        this.totalAttemptsDisplay = document.getElementById('total-attempts');  
    }  

    // 이벤트 리스너 설정  
    addEventListeners() {  
        // 주제 선택 이벤트  
        this.topicButtons.forEach(button => {  
            button.addEventListener('click', (e) => this.handleTopicSelection(e));  
        });  

        // 캐릭터 선택 이벤트  
        this.characterButtons.forEach(button => {  
            button.addEventListener('click', (e) => this.handleCharacterSelection(e));  
        });  

        // 키보드 단축키  
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));  
    }  

    // 주제 선택 처리  
    handleTopicSelection(e) {  
        const button = e.currentTarget;  
        this.topicButtons.forEach(btn => btn.classList.remove('selected'));  
        button.classList.add('selected');  
        this.state.selectedTopic = button.dataset.topic;  
        this.selectedTopicDisplay.textContent = `선택된 주제: ${this.state.selectedTopic}`;  
        this.updateUI();  
        this.getNewWord();  
    }  

    // 캐릭터 선택 처리  
    handleCharacterSelection(e) {  
        const button = e.currentTarget;  
        this.characterButtons.forEach(btn => btn.classList.remove('selected'));  
        button.classList.add('selected');  
        this.state.selectedGender = button.dataset.gender;  
        this.selectedGenderDisplay.textContent = `선택된 캐릭터: ${this.state.selectedGender}`;  
        this.updateUI();  
    }  

    // 키보드 단축키 처리  
    handleKeyboardShortcuts(e) {  
        if (e.code === 'Space' && !this.state.isRecording) {  
            e.preventDefault();  
            this.getNewWord();  
        }  
    }  

    // 새 단어 가져오기  
    async getNewWord() {  
        if (!this.validateSelections()) return;  

        try {  
            const response = await fetch('/get_word', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                },  
                body: JSON.stringify({ topic: this.state.selectedTopic })  
            });  

            if (!response.ok) throw new Error('단어를 가져오는데 실패했습니다.');  

            const data = await response.json();  
            this.state.currentWord = data.word;  
            this.createWordCard(data);  
        } catch (error) {  
            this.showError(error.message);  
        }  
    }  

    // 단어 카드 생성  
    createWordCard(data) {  
        const cardHTML = `  
            <div class="word-card" data-word="${data.word}">  
                <div class="grid grid-cols-2 gap-6 p-6">  
                    <div class="word-image-container">  
                        <img src="${data.image_url}"   
                             alt="${data.word}"   
                             class="word-image rounded-lg shadow-md">  
                    </div>  
                    <div class="word-content flex flex-col justify-between">  
                        <div>  
                            <h3 class="text-2xl font-bold mb-2">${data.word}</h3>  
                            <p class="text-gray-600 mb-4">${data.korean_meaning}</p>  
                        </div>  
                        <div class="button-group space-y-3">  
                            <button class="play-btn flex items-center justify-center gap-2">  
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">  
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />  
                                </svg>  
                                Play  
                            </button>  
                            <button class="mic-btn flex items-center justify-center gap-2">  
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">  
                                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />  
                                </svg>  
                                Record  
                            </button>  
                        </div>  
                        <div class="result-container mt-4"></div>  
                    </div>  
                </div>  
            </div>  
        `;  

        this.wordCardsContainer.insertAdjacentHTML('afterbegin', cardHTML);  
        this.addCardEventListeners(this.wordCardsContainer.firstChild);  
    }  

    // 카드 이벤트 리스너 추가  
    addCardEventListeners(card) {  
        const playBtn = card.querySelector('.play-btn');  
        const micBtn = card.querySelector('.mic-btn');  
        const word = card.dataset.word;  

        playBtn.addEventListener('click', () => this.playWord(word));  
        micBtn.addEventListener('click', () => this.toggleRecording(card));  
    }  

    // 단어 재생  
    async playWord(word) {  
        try {  
            const response = await fetch('/create_audio', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                },  
                body: JSON.stringify({   
                    text: word,  
                    gender: this.state.selectedGender  
                })  
            });  

            if (!response.ok) throw new Error('오디오 생성에 실패했습니다.');  

            const blob = await response.blob();  
            const audio = new Audio(URL.createObjectURL(blob));  
            audio.play();  
        } catch (error) {  
            this.showError(error.message);  
        }  
    }  

    // 녹음 토글  
    async toggleRecording(card) {  
        const micBtn = card.querySelector('.mic-btn');  
        
        if (!this.state.isRecording) {  
            try {  
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });  
                this.startRecording(stream, card, micBtn);  
            } catch (error) {  
                this.showError('마이크 접근이 거부되었습니다.');  
            }  
        } else {  
            this.stopRecording(card, micBtn);  
        }  
    }  

    // 녹음 시작  
    startRecording(stream, card, micBtn) {  
        this.state.isRecording = true;  
        this.state.audioChunks = [];  
        micBtn.classList.add('recording');  
        micBtn.textContent = 'Recording...';  

        this.state.mediaRecorder = new MediaRecorder(stream);  
        this.state.mediaRecorder.addEventListener('dataavailable', (e) => {  
            this.state.audioChunks.push(e.data);  
        });  

        this.state.mediaRecorder.addEventListener('stop', () => {  
            this.processRecording(card);  
        });  

        this.state.mediaRecorder.start();  
    }  

    // 녹음 중지  
    stopRecording(card, micBtn) {  
        this.state.isRecording = false;  
        micBtn.classList.remove('recording');  
        micBtn.textContent = 'Record';  
        this.state.mediaRecorder.stop();  
    }  

    // 녹음 처리  
    async processRecording(card) {  
        const audioBlob = new Blob(this.state.audioChunks);  
        const formData = new FormData();  
        formData.append('audio', audioBlob);  
        formData.append('target_word', this.state.currentWord);  

        try {  
            const response = await fetch('/check_pronunciation', {  
                method: 'POST',  
                body: formData  
            });  

            if (!response.ok) throw new Error('발음 체크에 실패했습니다.');  

            const result = await response.json();  
            this.showResult(card, result);  
        } catch (error) {  
            this.showError(error.message);  
        }  
    }  

    // 결과 표시  
    showResult(card, result) {  
        const resultContainer = card.querySelector('.result-container');  
        const isCorrect = result.similarity > 0.8;  
        
        this.state.totalAttempts++;  
        if (isCorrect) this.state.score++;  

        resultContainer.innerHTML = `  
            <div class="${isCorrect ? 'success-message' : 'error-message'}">  
                <p>인식된 단어: ${result.spoken_text}</p>  
                <p>정확도: ${Math.round(result.similarity * 100)}%</p>  
                <p>${isCorrect ? '정답입니다!' : '다시 시도해보세요.'}</p>  
            </div>  
        `;  

        this.updateScore();  
    }  

    // 점수 업데이트  
    updateScore() {  
        this.scoreDisplay.textContent = this.state.score;  
        this.totalAttemptsDisplay.textContent = this.state.totalAttempts;  
    }  

    // 에러 표시  
    showError(message) {  
        alert(message);  
    }  

    // 선택 유효성 검사  
    validateSelections() {  
        if (!this.state.selectedTopic || !this.state.selectedGender) {  
            this.showError('주제와 캐릭터를 먼저 선택해주세요.');  
            return false;  
        }  
        return true;  
    }  

    // UI 업데이트  
    updateUI() {  
        const isReady = this.state.selectedTopic && this.state.selectedGender;  
        document.querySelectorAll('.word-card').forEach(card => {  
            const playBtn = card.querySelector('.play-btn');  
            const micBtn = card.querySelector('.mic-btn');  
            playBtn.disabled = !isReady;  
            micBtn.disabled = !isReady;  
        });  
    }  
}  

// 앱 초기화  
document.addEventListener('DOMContentLoaded', () => {  
    window.app = new WordFriendsApp();  
});  

// 스타일 관련 CSS 클래스 추가  
document.head.insertAdjacentHTML('beforeend', `  
    <style>  
        .recording {  
            animation: pulse 1.5s infinite;  
            background-color: #EF4444 !important;  
        }  

        @keyframes pulse {  
            0% { opacity: 1; }  
            50% { opacity: 0.5; }  
            100% { opacity: 1; }  
        }  

        .disabled {  
            opacity: 0.5;  
            cursor: not-allowed;  
        }  
    </style>  
`);