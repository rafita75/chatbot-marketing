import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBUAotK-cYnFBZ5EIlIAr6sPiyLalRar4g",
    authDomain: "marketing-ai-chatbot.firebaseapp.com",
    projectId: "marketing-ai-chatbot",
    storageBucket: "marketing-ai-chatbot.firebasestorage.app",
    messagingSenderId: "121540215603",
    appId: "1:121540215603:web:8a91c804a9b47f6c4f7446"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
