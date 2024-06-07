
import { initializeApp } from "firebase/app";
import {getAuth ,GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC5awBdiLI6jQdI0YRaV9g0bRznsxp-xIA",
  authDomain: "chitchat-a5da2.firebaseapp.com",
  projectId: "chitchat-a5da2",
  storageBucket: "chitchat-a5da2.appspot.com",
  messagingSenderId: "1072350772559",
  appId: "1:1072350772559:web:36f54f727487b50e5e593a"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider =new GoogleAuthProvider();
const db = getFirestore();
const storage = getStorage() ;


export {auth,provider,db,storage};