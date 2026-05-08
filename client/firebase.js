// FIREBASE CONFIG

const firebaseConfig = {
    apiKey: "AIzaSyCaQswbaEHAjvn90JuFc8xs7ZE3Z3749WM",
    authDomain: "chat-app-chatex.firebaseapp.com",
    projectId: "chat-app-chatex",
    storageBucket: "chat-app-chatex.firebasestorage.app",
    messagingSenderId: "922683934516",
    appId: "1:922683934516:web:2a4e396febbc16f8398761",
    measurementId: "G-XW89SYZMKC"
};

// INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);

// FIRESTORE DATABASE
const db = firebase.firestore();