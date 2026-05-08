const socket = io();

let myEmail = "";
let currentChat = "";

const CLOUD_NAME = "dbkmjvnx4";
const UPLOAD_PRESET = "chatapp";

const usersDiv = document.getElementById("users");
const messagesDiv = document.getElementById("messages");

function login() {
    myEmail = document.getElementById("email").value;

    if (!myEmail) return;

    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";

    socket.emit("join", myEmail);
}

socket.on("user list", (users) => {

    usersDiv.innerHTML = "";

    users.forEach(user => {

        if (user === myEmail) return;

        const div = document.createElement("div");

        div.className = "user";

        div.innerHTML = `
            <div class="avatar">${user[0].toUpperCase()}</div>
            <div>
                <div>${user}</div>
                <small class="online">Online</small>
            </div>
        `;

        div.onclick = () => {
            currentChat = user;
            document.getElementById("chatWith").innerText = user;
            loadMessages();
        };

        usersDiv.appendChild(div);
    });

});

async function sendMessage() {

    const input = document.getElementById("msg");

    const text = input.value;

    if (!text || !currentChat) return;

    const msg = {
        from: myEmail,
        to: currentChat,
        text,
        type: "text",
        time: new Date().toLocaleTimeString()
    };

    await saveMessage(msg);

    socket.emit("private message", msg);

    input.value = "";

    loadMessages();
}

socket.on("private message", async (msg) => {

    await saveMessage(msg);

    if (
        msg.from === currentChat ||
        msg.to === currentChat
    ) {
        loadMessages();
    }
});

async function saveMessage(msg) {

    await db.collection("messages").add(msg);
}

async function loadMessages() {

    messagesDiv.innerHTML = "";

    const snapshot = await db.collection("messages").get();

    snapshot.forEach(doc => {

        const msg = doc.data();

        const correctChat =
            (msg.from === myEmail && msg.to === currentChat) ||
            (msg.from === currentChat && msg.to === myEmail);

        if (!correctChat) return;

        const div = document.createElement("div");

        div.className =
            msg.from === myEmail
                ? "myMessage"
                : "otherMessage";

        if (msg.type === "image") {

            div.innerHTML = `
                <img src="${msg.text}" class="chatImage">
                <div class="time">${msg.time}</div>
            `;

        } else if (msg.type === "pdf") {

            div.innerHTML = `
                <a href="${msg.text}" target="_blank">
                    📄 Open PDF
                </a>
                <div class="time">${msg.time}</div>
            `;

        } else if (msg.type === "audio") {

            div.innerHTML = `
                <audio controls src="${msg.text}"></audio>
                <div class="time">${msg.time}</div>
            `;

        } else {

            div.innerHTML = `
                <div>${msg.text}</div>
                <div class="time">${msg.time}</div>
            `;
        }

        messagesDiv.appendChild(div);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function uploadFile(file, type) {

    const data = new FormData();

    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
            method: "POST",
            body: data
        }
    );

    const fileData = await res.json();

    const msg = {
        from: myEmail,
        to: currentChat,
        text: fileData.secure_url,
        type,
        time: new Date().toLocaleTimeString()
    };

    await saveMessage(msg);

    socket.emit("private message", msg);

    loadMessages();
}

document.getElementById("imageInput").addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {
        uploadFile(file, "image");
    }
});

document.getElementById("pdfInput").addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {
        uploadFile(file, "pdf");
    }
});

let mediaRecorder;
let audioChunks = [];

async function startRecording() {

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();

    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {

        const blob = new Blob(audioChunks, {
            type: "audio/mp3"
        });

        const file = new File(
            [blob],
            "voice.mp3"
        );

        uploadFile(file, "audio");
    };

    setTimeout(() => {
        mediaRecorder.stop();
    }, 5000);
}
