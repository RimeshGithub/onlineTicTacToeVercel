import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCnf5ZfNajCiZo4xJ2osVN2-GJNyThif-M",
  authDomain: "nonsenseproject2061.firebaseapp.com",
  databaseURL: "https://nonsenseproject2061-default-rtdb.firebaseio.com",
  projectId: "nonsenseproject2061",
  storageBucket: "nonsenseproject2061.firebasestorage.app",
  messagingSenderId: "155104953307",
  appId: "1:155104953307:web:5a00a11765773214f2ddfe"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app)
