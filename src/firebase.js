// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_-o9KNjA7jbvU57q7hcEm1tQnUJa-XEc",
  authDomain: "inventoryhomeapp.firebaseapp.com",
  projectId: "inventoryhomeapp",
  storageBucket: "inventoryhomeapp.firebasestorage.app",
  messagingSenderId: "247687436276",
  appId: "1:247687436276:web:4c3c618fd4be354a62cba1",
  measurementId: "G-GVD0NRD99Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
