// DOM 요소 참조
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const char_nick = document.getElementById('char_nick');
const user_nick = document.getElementById('user_nick');
const sendBtn = document.getElementById('send-btn');
const chatBtn = document.getElementById('chat_btn');


// 세션 ID 생성
let sessionId = Date.now().toString();

// 메시지 전송 함수
async function sendMessage() { 
    var message = ''

    if (chatBtn.value == 'first_input'){
        message = "안녕";
        message = "first_input";
    }else{
        message = userInput.value.trim();
        if (!message) return;
    }
    
    
    try {
        
        if(user_nick.value == ''){
            user_name = '우리 친구';
        }else{
            user_name = user_nick.value;
        }
        if(char_nick.value == ''){
            system_name = '영어 친구';
        }else{
            system_name = char_nick.value;
        }


        if (chatBtn.value == 'first_input'){
            chatBtn.value = 'second_input'
            chatBtn.disabled = true;
        }else{
        // 메시지 전송 전 UI 업데이트
            addMessage(message, user_name);
            userInput.value = '';
        }
        sendBtn.disabled = true;  // 전송 중 버튼 비활성화

        const response = await axios.post('/chat', { 
            message, 
            session_id: sessionId 
        });

        if (response.data.error) {
            // 서버에서 반환된 에러 처리
            console.error('Server error:', response.data.error);
            addMessage(`Error: ${response.data.error}`, 'System');
        } else {
            // 정상 응답 처리
            addMessage(response.data.message, system_name);
            sessionId = response.data.session_id;
        }
    } catch (error) {
        // 네트워크 또는 기타 에러 처리
        console.error('Chat error:', error);
        let errorMessage = 'An error occurred while processing your request.';
        
        if (error.response) {
            // 서버 응답이 있는 경우
            errorMessage = error.response.data.error || errorMessage;
        }
        
        addMessage(errorMessage, 'System');
    } finally {
        sendBtn.disabled = false;  // 버튼 다시 활성화
    }
}

// 메시지 추가 함수
function addMessage(message, sender) {

    const messageEl = document.createElement('div');


    if (sender == 'Kevin' || sender == 'Sue'){
        messageEl.id = "div_right";
        messageEl.className = "div_right_Class";
    }else{
        messageEl.id = "div_left";
        messageEl.className = "div_left_Class";
    }

    messageEl.textContent = `${sender}: ${message}`;
    
    // 에러 메시지 스타일링
    if (sender === 'System') {
        messageEl.classList.add('system-message');
    }
    if (message.startsWith('Error:')) {
        messageEl.classList.add('error-message');
    }
    

    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    }


// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    // Enter 키 이벤트 처리
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 전송 버튼 클릭 이벤트 처리
    sendBtn.addEventListener('click', sendMessage);
    chatBtn.addEventListener('click', sendMessage);
});