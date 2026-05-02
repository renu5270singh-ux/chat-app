const socket = io();

let myEmail = '';
let selectedUser = '';

window.login = function () {
    myEmail = document.getElementById('email').value.trim();

    if (!myEmail) {
        alert('Enter email');
        return;
    }

    socket.emit('join', myEmail);

    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'flex';
};

window.sendMessage = function () {
    const input = document.getElementById('msg');
    const message = input.value.trim();

    if (!message) return;

    if (!selectedUser) {
        alert('Select a user first');
        return;
    }

    socket.emit('private message', {
        to: selectedUser,
        message: message,
        from: myEmail
    });

    addMessage(message, myEmail);
    input.value = '';
};

socket.on('user list', (users) => {
    const list = document.getElementById('users');
    list.innerHTML = '';

    users.forEach(user => {
        if (user !== myEmail) {
            const div = document.createElement('div');
            div.textContent = user;
            div.className = 'user';

            div.onclick = () => {
                selectedUser = user;

                document.getElementById('chatWith').textContent = user;
                document.getElementById('messages').innerHTML = '';

                socket.emit('load messages', {
                    to: selectedUser,
                    from: myEmail
                });
            };

            list.appendChild(div);
        }
    });
});

socket.on('private message', ({ message, from }) => {
    addMessage(message, from);
});

socket.on('chat history', (msgs) => {
    msgs.forEach(m => {
        addMessage(m.message, m.from);
    });
});

function addMessage(message, sender) {
    const messagesDiv = document.getElementById('messages');

    const div = document.createElement('div');
    div.classList.add('message');

    if (sender === myEmail) {
        div.classList.add('me');
    } else {
        div.classList.add('other');
    }

    div.textContent = message;

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}