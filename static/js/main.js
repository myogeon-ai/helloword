class AppState {  
    // constructor() {  
    //     this.selectedTopic = '';  
    //     this.selectedCharacter = '';  
    //     this.currentWord = '';  
    //     this.score = 0;  
    //     this.totalAttempts = 0;  
    //     this.isRecording = false;  
    //     this.mediaRecorder = null;  
    //     this.audioChunks = [];  
    //     this.isInitialized = false;  
    // }
    // 카테고리, 캐릭터 디폴트
    constructor() {  
        this.reset();  
    }  

    reset() {  
        this.selectedTopic = '';  
        this.selectedCharacter = '';  
        this.currentWord = '';  
        this.score = 0;  
        this.totalAttempts = 0;  
        this.isRecording = false;  
        this.mediaRecorder = null;  
        this.audioChunks = [];  
        this.isInitialized = false;  
    }  
}  

class WordFriendsApp {  
    constructor() {  
        this.state = new AppState();  
        this.initialize();  
    }  

    // async initialize() {  
    //     try {  
    //         const response = await $.get('/api/check_initialization');  
    //         if (response.selected_topic) {  
    //             this.state.selectedTopic = response.selected_topic;  
    //             $(`.topic-btn[data-topic="${response.selected_topic}"]`).addClass('active');  
    //             this.updateSelectedTopic(response.selected_topic);  
    //         }  
    //         if (response.selected_character) {  
    //             this.state.selectedCharacter = response.selected_character;  
    //             $(`.character-btn[data-gender="${response.selected_character}"]`).addClass('active');  
    //             this.updateSelectedCharacter(response.selected_character);  
    //         }  
    //         this.state.isInitialized = response.is_initialized;  
    //     } catch (error) {  
    //         console.error('초기화 중 오류 발생:', error);  
    //     }  

    //     this.setupEventListeners();  
    //     this.updateUI();  
    // }


    async initialize() {  
        try {  
            const response = await $.get('/api/check_initialization');  
            
            // 초기 상태 설정  
            this.state.selectedTopic = response.selected_topic || '';  
            this.state.selectedCharacter = response.selected_character || '';  
            this.state.score = response.score || 0;  
            this.state.totalAttempts = response.total_attempts || 0;  
            this.state.isInitialized = response.is_initialized || false;  
    
            // UI 업데이트  
            if (this.state.selectedTopic) {  
                $(`.topic-btn[data-topic="${this.state.selectedTopic}"]`).addClass('active');  
                this.updateSelectedTopic(this.state.selectedTopic);  
            }  
            
            if (this.state.selectedCharacter) {  
                $(`.character-btn[data-gender="${this.state.selectedCharacter}"]`).addClass('active');  
                this.updateSelectedCharacter(this.state.selectedCharacter);  
            }  
    
            this.updateScore();  
            this.setupEventListeners();  
            this.updateUI();  
    
            // 초기화가 완료되었다면 단어 카드 표시  
            if (this.state.isInitialized) {  
                this.getNewWord();  
            }  
        } catch (error) {  
            console.error('초기화 중 오류 발생:', error);  
            this.showError('앱 초기화 중 오류가 발생했습니다.');  
        }  
    }


    setupEventListeners() {  
        // 주제 선택 이벤트  
        $('.topic-btn, .topic-image-container').on('click', (e) => {  
            const $button = $(e.target).closest('.topic-item').find('.topic-btn');  
            const topic = $button.data('topic');  
            this.handleTopicSelection(topic, $button);  
        });  

        // 캐릭터 선택 이벤트  
        $('.character-btn, .character-image-container').on('click', (e) => {  
            const $button = $(e.target).closest('.character-item').find('.character-btn');  
            const character = $button.data('gender');  
            this.handleCharacterSelection(character, $button);  
        });  

        // 새 단어 받기 이벤트 (스페이스바)  
        $(document).on('keydown', (e) => {  
            if (e.code === 'Space' && !this.state.isRecording) {  
                e.preventDefault();  
                this.getNewWord();  
            }  
        });  
    }  

    // async handleTopicSelection(topic, $button) {  
    //     try {  
    //         const response = await $.ajax({  
    //             url: '/api/set_topic',  
    //             method: 'POST',  
    //             contentType: 'application/json',  
    //             data: JSON.stringify({ topic })  
    //         });  

    //         if (response.success) {  
    //             $('.topic-btn').removeClass('active');  
    //             $button.addClass('active');  
    //             this.state.selectedTopic = topic;  
    //             this.updateSelectedTopic(topic);  
    //             this.updateWord(response.word);  
    //             this.updateUI();  
    //             this.showFeedback(`'${topic}' 주제가 선택되었습니다.`);  
    //         }  
    //     } catch (error) {  
    //         this.showError('주제 선택 중 오류가 발생했습니다.');  
    //     }  
    // }


    async handleTopicSelection(topic, $button) {  
        try {  
            if (!topic) {  
                throw new Error('유효하지 않은 주제입니다.');  
            }  
    
            const response = await $.ajax({  
                url: '/api/set_topic',  
                method: 'POST',  
                contentType: 'application/json',  
                data: JSON.stringify({ topic })  
            });  
    
            if (response.success) {  
                $('.topic-btn').removeClass('active');  
                $button.addClass('active');  
                this.state.selectedTopic = topic;  
                this.updateSelectedTopic(topic);  
                if (response.word) {  
                    this.updateWord(response.word);  
                }  
                this.updateUI();  
                this.showFeedback(`'${topic}' 주제가 선택되었습니다.`);  
            } else {  
                throw new Error(response.error || '주제 선택에 실패했습니다.');  
            }  
        } catch (error) {  
            this.showError(error.message || '주제 선택 중 오류가 발생했습니다.');  
            $button.removeClass('active');  
            this.state.selectedTopic = '';  
            this.updateUI();  
        }  
    }
    
    async handleCharacterSelection(character, $button) {  
        try {  
            const response = await $.ajax({  
                url: '/api/set_character',  
                method: 'POST',  
                contentType: 'application/json',  
                data: JSON.stringify({ character })  
            });  

            if (response.success) {  
                $('.character-btn').removeClass('active');  
                $button.addClass('active');  
                this.state.selectedCharacter = character;  
                this.updateSelectedCharacter(character);  
                this.updateUI();  
                this.showFeedback(`'${character}' 캐릭터가 선택되었습니다.`);  
            }  
        } catch (error) {  
            this.showError('캐릭터 선택 중 오류가 발생했습니다.');  
        }  
    }  


    
    async resetApp() {  
        try {  
            const response = await $.ajax({  
                url: '/api/reset_session',  
                method: 'POST'  
            });  

            if (response.success) {  
                this.state.reset();  
                $('.topic-btn, .character-btn').removeClass('active');  
                $('#word-cards-container').empty();  
                this.updateUI();  
                this.showFeedback('앱이 초기화되었습니다.');  
            }  
        } catch (error) {  
            this.showError('초기화 중 오류가 발생했습니다.');  
        }  
    }  


    updateSelectedTopic(topic) {  
        $('#selected-topic').text(`선택된 주제: ${topic}`);  
    }  

    updateSelectedCharacter(character) {  
        $('#selected-gender').text(`선택된 캐릭터: ${character}`);  
    }  

    updateWord(word) {  
        this.state.currentWord = word;  
        this.createOrUpdateWordCard(word);  
        $('#feedback-message').removeClass('success error').text('');  
    }  

    createOrUpdateWordCard(word) {  
        const $container = $('#word-cards-container');  
        $container.empty();  

        const cardHtml = `  
            <div class="word-card bg-white rounded-lg shadow-md p-6 text-center">  
                <h3 class="text-2xl font-bold mb-4">${word}</h3>  
                <div class="flex justify-center space-x-4">  
                    <button class="play-btn px-4 py-2 bg-blue-500 text-white rounded-lg">  
                        <i class="fas fa-play"></i> Play  
                    </button>  
                    <button class="mic-btn px-4 py-2 bg-red-500 text-white rounded-lg">  
                        <i class="fas fa-microphone"></i> Record  
                    </button>  
                </div>  
                <div class="result-container mt-4"></div>  
            </div>  
        `;  

        $container.html(cardHtml);  
        
        // 버튼 이벤트 리스너 추가  
        const $card = $container.find('.word-card');  
        $card.find('.play-btn').on('click', () => this.playWord());  
        $card.find('.mic-btn').on('click', () => this.toggleRecording($card[0]));  
    }  

    async playWord() {  
        if (!this.validateSelections()) return;  
        
        try {  
            const response = await fetch('/play_word', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                },  
                body: JSON.stringify({  
                    word: this.state.currentWord,  
                    gender: this.state.selectedCharacter  
                })  
            });  

            if (!response.ok) throw new Error('음성 재생에 실패했습니다.');  

            const blob = await response.blob();  
            const audio = new Audio(URL.createObjectURL(blob));  
            audio.play();  
        } catch (error) {  
            this.showError('음성 재생 중 오류가 발생했습니다.');  
        }  
    }  

    showFeedback(message, isError = false) {  
        const $feedback = $('#feedback-message');  
        $feedback.removeClass('success error')  
            .addClass(isError ? 'error' : 'success')  
            .text(message);  

        setTimeout(() => {  
            $feedback.removeClass('success error').text('');  
        }, 3000);  
    }  

    validateSelections() {  
        if (!this.state.selectedTopic || !this.state.selectedCharacter) {  
            this.showFeedback('주제와 캐릭터를 먼저 선택해주세요.', true);  
            return false;  
        }  
        return true;  
    }  

    async getNewWord() {  
        if (!this.validateSelections()) return;  

        try {  
            const response = await $.ajax({  
                url: '/api/get_random_word',  
                method: 'POST',  
                contentType: 'application/json',  
                data: JSON.stringify({ topic: this.state.selectedTopic })  
            });  

            this.updateWord(response.word);  
            this.showFeedback('새로운 단어가 선택되었습니다.');  
        } catch (error) {  
            this.showError('새 단어를 가져오는데 실패했습니다.');  
        }  
    }  

    showError(message) {  
        this.showFeedback(message, true);  
    }  

    // updateUI() {  
    //     const isReady = this.state.selectedTopic && this.state.selectedCharacter;  
    //     $('.play-btn, .mic-btn').prop('disabled', !isReady)  
    //         .toggleClass('disabled', !isReady);  
    // }


    updateUI() {  
        const isReady = this.state.selectedTopic && this.state.selectedCharacter;  
        
        // 학습 섹션 표시/숨김  
        $('#learning-section').toggleClass('hidden', !isReady);  
        $('#word-cards-container').toggleClass('hidden', !isReady);  
        
        // 버튼 상태 업데이트  
        $('.play-btn, .mic-btn').prop('disabled', !isReady)  
            .toggleClass('disabled', !isReady);  
            
        // 선택 정보 업데이트  
        this.updateSelectedTopic(this.state.selectedTopic || '주제를 선택해주세요');  
        this.updateSelectedCharacter(this.state.selectedCharacter || '캐릭터를 선택해주세요');  
        
        // 점수 업데이트  
        this.updateScore();  
    }  

    updateScore() {  
        $('#score').text(this.state.score);  
        $('#total-attempts').text(this.state.totalAttempts);  
    }  
}  

// 앱 초기화  
$(document).ready(() => {  
    window.app = new WordFriendsApp();  
});  

// 스타일 추가  
$('head').append(`  
    <style>  
        .topic-btn.active, .character-btn.active {  
            background-color: #4F46E5;  
            color: white;  
        }  

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

        #feedback-message {  
            min-height: 24px;  
            transition: all 0.3s ease;  
        }  

        #feedback-message.success {  
            color: #10B981;  
        }  

        #feedback-message.error {  
            color: #EF4444;  
        }  

        @keyframes fadeIn {  
            from { opacity: 0; transform: translateY(-10px); }  
            to { opacity: 1; transform: translateY(0); }  
        }  

        #feedback-message:not(:empty) {  
            animation: fadeIn 0.3s ease-out;  
        }  
    </style>  
`);