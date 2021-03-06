const chatBtn = document.querySelector('#chatBtn');
const chatPlace = document.querySelector('#chatPlace');
// const chat_userid = document.querySelector('#chat_userid');
// const chatHelp_box1 = document.querySelector('#chatHelp_box1');
let flag = undefined;

// chatHelp_box1.addEventListener('click',()=>{
//     window.location=`http://localhost:3000/user/chatBtn?${chat_userid.innerHTML}`
// })

chatBtn.addEventListener('click', () => {
    chatBtn.style.marginTop = "0px";
    chatBtn.style.transition = "0.5s ease-in-out";
    chatBtn.style.fontSize = "17px";

    switch (flag) {
        case true:
            flag = false;
            chatPlace.style.display = 'none';
            chatBtn.innerHTML = '채팅 시작하기';
            break;
        case false:
            flag = true;
            chatPlace.style.display = 'block';
            chatBtn.innerHTML = '환영합니다!';
            chatBtn.dataset.value = 0;
            break;
        case undefined:
            flag = true;
            getChatRoom('a');
            break;
    }
});

async function getChatRoom(type) {
    // chatRoom 으로 갈 때 auth 거침 / 그 전, chatBtn에서 login 여부 판별 
    let url = `http://localhost:3000/user/chatRoom`;
    let options = {
        method: 'get'
    }
    let response = await fetch(url, options);
    let res_result = await response.text();

    if (isJson(res_result)) {
        let { result, msg } = JSON.parse(res_result);
        console.log(res_result)
        if (result == false) {
            const msg_res = confirm(msg);
            if (msg_res == true) {
                opener.parent.location = '/user/login';
                window.close();
            } else {
                window.location.reload();
                return;
            }
        };
        return;
    } else {
        chatPlace.innerHTML = res_result;
        chatBtn.innerHTML = '환영합니다!';
        const time = document.querySelector('#time');
        let now = new Date();
        time.innerHTML = now.toLocaleString();
        if(type=='a'){socketChat();}

        //enter 로 메세지 보내기 
        const chatInput = document.querySelector('#msg');
        const chatSend = document.querySelector('.chatSend');
        chatInput.addEventListener('keydown', function (event) {
            if (event.keyCode == 13) {
                send();
                chatSend.style.backgroundColor = '#EEE';
                chatSend.style.color = '#9AA7B4';
            }
        })

        // inputbox에 글자 있으면 버튼 색 변화
        chatInput.addEventListener('input', () => {
            if (chatInput.value != '') {
                chatSend.style.backgroundColor = '#4D9DCB'
                chatSend.style.color = '#fff'
            } else {
                chatSend.style.backgroundColor = '#EEE'
                chatSend.style.color = '#9AA7B4'
            }
        })

        // send 버튼 클릭 시 버튼 색 돌아오기 
        chatSend.addEventListener('click', () => {
            chatSend.style.backgroundColor = '#EEE'
            chatSend.style.color = '#9AA7B4'
        })
    }
}

function isJson(str) {
    try {
        let json = JSON.parse(str)
        return (typeof json == 'object');
    } catch (e) { return false; }
}



//        s o c k e t s        //

// handshake 부분 

const socket = io();

async function socketChat() {
    socket.on('connect', () => { })
    //3. 서로가 서로한테 보낸다
    let chat_count = parseInt(chatBtn.dataset.value);
    socket.on('msg', data => {
        chat_count++;
        if (flag == false) {
            chatBtn.innerHTML = `답변이 도착했습니다! <span> ${chat_count}`;
        }
        msgAdd(data, 'you');
    });
};


function send() {
    const msg = document.querySelector('#msg');
    if (msg.value == '') {
        return;
    } else {
        // let id = socket.id
        // socket.to(id).emit('send', msg.value);
        // 메세지 보내기 -----------111111111
        let data = { msg: msg.value, socketID:socket.id,}
        //2. 자기가 쓴 글이 뜨게 한다 E
        socket.emit('send', data);
        //내가 쓴 글 나에게 보내기 
        msgAdd(msg.value, 'me');
        msg.value = '';
        let chat = document.querySelector('#chat');
        chat.scrollTop = chat.scrollHeight;
    }
}

//0-0. 일단 접속을 한다 
// 채팅 시작하는 user div append 
socket.on('Userin', data => {

    console.log(data)
    // 여기서 chatBtn.html 쏴야함. 
    let { socketID, userid } = data;
    let chat_ing = document.querySelector('#chat_ing');
    let div = document.createElement('div');
    div.classList.add('chat_ing_div')
    div.innerHTML = `${userid}님 채팅 대기 중`;
    chat_ing.appendChild(div)
    
    // 어떤 거를 클릭했을 때 되는거 수정 필요 ! 
    let chat_DIV = document.querySelector('.chat_ing_div')
    chat_DIV.addEventListener('click', () => {
        getChatRoom();
        //0-1. 클릭 시 정보를 보낸다 E
        socket.emit('Please',{userid, socketID})
    })

})


//4. 아직 안 되지만 채팅방을 나갈 때
// 채팅 나가는 user 삭제 
socket.on('sendForDelete', data => {
    let { socketID, userid } = data;
    let chat_ing = document.querySelector('#chat_ing');
    let chat_ing_div = document.querySelectorAll('.chat_ing_div');

    for (let i = 0; i < chat_ing_div.length; i++) {
        if (chat_ing_div[i].innerHTML == `${userid}님의 채팅 대기`) {
            chat_ing.removeChild(chat_ing_div[i])
        }
    }
});

function msgAdd(msgValue, who) {
    const ul_time = document.createElement('ul');
    const ul_msg = document.createElement('ul');
    const li_time = document.createElement('li');
    const li_msg = document.createElement('li');
    const div = document.createElement('div');
    const chat = document.querySelector('#chat');
    const B = document.querySelectorAll('.time_clocking');

    let T = new Date();
    let H = T.getHours();
    let M = ('00' + T.getMinutes()).slice(-2);
    let now = (H >= 12 && H <= 24) ? '오후' : '오전';
    H = H >= 12 ? H - 12 : H;
    H = ('00' + H).slice(-2);
    let clock = `${now} ${H}:${M}`

    div.innerHTML = msgValue;
    li_msg.appendChild(div);
    li_msg.classList.add(who);
    li_time.innerHTML = clock;
    li_time.classList.add('time_clocking');
    if (who == 'you') li_time.classList.add('time_you');
    else li_time.classList.add('time_me');
    if (B.length == 0 || B[B.length - 1].textContent != clock) {
        ul_time.appendChild(li_time);
        chat.appendChild(ul_time);
    }
    ul_msg.appendChild(li_msg);
    chat.appendChild(ul_msg);
}





