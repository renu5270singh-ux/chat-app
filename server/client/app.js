// 🔌 Connect to Socket.IO
const socket = io();

// 👤 User state
let myEmail = "";
let selectedUser = "";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaQswbaEHAjvn90JuFc8xs7ZE3Z3749WM",
  authDomain: "chat-app-chatex.firebaseapp.com",
  projectId: "chat-app-chatex",
  storageBucket: "chat-app-chatex.firebasestorage.app",
  messagingSenderId: "922683934516",
  appId: "1:922683934516:web:2a4e396febbc16f8398761",
  measurementId: "G-XW89SYZMKC"
};

// 🔥 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ================= LOGIN =================
window.login = function () {
    const email = document.getElementById('email').value.trim();

    if (!email || !email.includes("@")) {
        alert("Enter valid email");
        return;
    }

    myEmail = email;

    socket.emit("join", myEmail);

    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
};


// ================= USER LIST =================
socket.on("user list", (users) => {
    const list = document.getElementById("users");
    list.innerHTML = "";

    users.forEach(user => {
        if (user !== myEmail) {
            const div = document.createElement("div");
            div.innerHTML = `🟢 ${user}`;
            div.onclick = () => selectUser(user);
            list.appendChild(div);
        }
    });
});


// ================= SELECT USER =================
function selectUser(user) {
    selectedUser = user;
    document.getElementById("messages").innerHTML = "";
    loadMessages(); // 🔥 load history
}


// ================= SEND MESSAGE =================
function sendMessage() {
    const input = document.getElementById("msg");
    const message = input.value.trim();

    if (!message || !selectedUser) return;

    const msgData = {
        from: myEmail,
        to: selectedUser,
        message: message,
        time: Date.now()
    };

    // 🔌 Real-time send
    socket.emit("private message", msgData);

    // 🔥 Save to Firebase
    db.collection("messages").add(msgData);

    input.value = "";
}


// ================= RECEIVE MESSAGE =================
socket.on("private message", (data) => {
    if (
        data.from === selectedUser ||
        data.from === myEmail
    ) {
        addMessage(data.message, data.from, data.time);
    }
});


// ================= LOAD CHAT HISTORY =================
function loadMessages() {
    db.collection("messages")
      .orderBy("time")
      .onSnapshot(snapshot => {

          const container = document.getElementById("messages");
          container.innerHTML = "";

          snapshot.forEach(doc => {
              const data = doc.data();

              if (
                  (data.from === myEmail && data.to === selectedUser) ||
                  (data.from === selectedUser && data.to === myEmail)
              ) {
                  addMessage(data.message, data.from, data.time);
              }
          });
      });
}


// ================= ADD MESSAGE TO UI =================
function addMessage(message, sender, time) {
    const div = document.createElement("div");
    div.classList.add("message");

    if (sender === myEmail) {
        div.classList.add("me");
    } else {
        div.classList.add("other");
    }

    const date = new Date(time).toLocaleTimeString();

    div.innerHTML = `
        <div>${message}</div>
        <small>${date}</small>
    `;

    document.getElementById("messages").appendChild(div);

    // auto scroll
    div.scrollIntoView();
}
