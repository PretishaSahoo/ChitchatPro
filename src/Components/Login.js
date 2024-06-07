import React, { useEffect, useState } from "react";
import avatarimg from "../Images/user.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, provider, db } from "../firebase.js";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import upload from "./upload.js";
import {useDispatch} from 'react-redux'
import {authActions} from '../redux/store'
import messaging from '../Images/messaging.png'


export default function Login() {

  const [home, setHome] = useState(true)

  const dispatch = useDispatch();

  //for Login
  const [loginEmail, setLoginEmail] = useState("");
  const [LoginPassword, setLoginPassword] = useState("");

  //for Register
  const [reigsterUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  //for signIn with Google
  const [value, setValue] = useState("");

  const handleLoginEmailChange = (e) => {
    setLoginEmail(e.target.value);
  };
  const handleLoginPasswordChange = (e) => {
    setLoginPassword(e.target.value);
  };
  const handleRegisterEmailChange = (e) => {
    setRegisterEmail(e.target.value);
  };
  const handleRegisterPasswordChange = (e) => {
    setRegisterPassword(e.target.value);
  };
  const handleRegisterUsernameChange = (e) => {
    setRegisterUsername(e.target.value);
  };
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      setValue(result.user.email);
      const userChatsRef = doc(db, "userchats", result.user.uid);
      
      const userChatsDoc = await getDoc(userChatsRef);
      if (!userChatsDoc.exists()) {
        await setDoc(userChatsRef, {
          chats: [],
        });
      }
  
      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        username: result.user.displayName,
        avatar: result.user.photoURL,
        id: result.user.uid,
        blocked: [],
      });
  
      if (result) {
        dispatch(authActions.login())
        localStorage.setItem("chatId", result.user.uid);
        toast.success("Logged in Successfully!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  

  useEffect(() => {
    setValue(localStorage.getItem("chatId"));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        LoginPassword
      );
      if (result) {
        localStorage.setItem("chatId", result.user.uid);
        dispatch(authActions.login())
        toast.success("Loged in Successfully!");
        setLoginEmail("");
        setLoginPassword("");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );

      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", result.user.uid), {
        email: registerEmail,
        username: reigsterUsername,
        avatar: imgUrl,
        id: result.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", result.user.uid), {
        chats: [],
      });

      if (result) {
        localStorage.setItem("chatId", result.user.uid);
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterUsername("");
        setAvatar({
          file: null,
          url: "",
        });
        toast.success("Registered Successfully!");
        toast.success("You should Login now!")
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBackClick = () =>{
    setHome(true);
  }

  return (
    !home?( <div
      className="flex w-full h-full p-6"
      style={{ minHeight: "90vh", minWidth: "90vw" }}
    >
      <ToastContainer />
      { <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" onClick={handleBackClick} >
          <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/>
        </svg>
        }
      <div
        className=" grid grid-cols-1 md:grid-cols-2 gap-8 backdrop-blur-lg shadow-lg rounded-lg p-8 max-w-md text-white"
        style={{ minHeight: "90vh", minWidth: "90vw" }}
      >
        {/* Login Form */}
        <div
          className="flex flex-col justify-center border border-white/10 p-4"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <h2 className="text-2xl font-bold mb-6">Login to your Account</h2>
          <form type="submit" onSubmit={handleLogin}>
            <input
              className="w-full p-3 mb-4 rounded-lg bg-white/30 placeholder-gray-400 focus:bg-white/40 transition-colors required"
              type="text"
              placeholder="Enter your Email"
              value={loginEmail}
              onChange={handleLoginEmailChange}
            />
            <input
              className="w-full p-3 mb-6 rounded-lg bg-white/30 placeholder-gray-400 focus:bg-white/40 transition-colors required"
              type="password"
              placeholder="Enter your password"
              value={LoginPassword}
              onChange={handleLoginPasswordChange}
            />
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-colors">
              Login
            </button>
            <p className="font-bold text-center">or</p>
            <button
              className="text-lg flex justify-center w-full py-3 my-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-colors"
              onClick={handleSignInWithGoogle}
            >
              SignIn with
              <span className ="bg-slate-300 p-2 mx-2 " style={{borderRadius:"50%"}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" id="google"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path></svg>
              </span>
            </button>
          </form>
        </div>

        {/* Registration Form */}
        <div
          className="flex flex-col justify-center border border-white/10 p-4"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
          <form type="submit" onSubmit={handleRegister}>
            <input
              className="w-full p-3 mb-4 rounded-lg bg-white/30 placeholder-gray-400 focus:bg-white/40 transition-colors required"
              type="text"
              placeholder="Enter your Username"
              value={reigsterUsername}
              onChange={handleRegisterUsernameChange}
            />
            <input
              className="w-full p-3 mb-4 rounded-lg bg-white/30 placeholder-gray-400 focus:bg-white/40 transition-colors required"
              type="text"
              placeholder="Enter your Email"
              value={registerEmail}
              onChange={handleRegisterEmailChange}
            />
            <input
              className="w-full p-3 mb-6 rounded-lg bg-white/30 placeholder-gray-400 focus:bg-white/40 transition-colors required"
              type="password"
              placeholder="Enter your password"
              value={registerPassword}
              onChange={handleRegisterPasswordChange}
            />
            <div className="mb-6 flex items-center gap-2">
              <label
                htmlFor="file"
                className="cursor-pointer flex items-center"
              >
                <img
                  className="w-12 h-12 rounded-full border border-white/50"
                  src={avatar.url || avatarimg}
                  alt="Profile"
                />
                <span className="text-sm">Upload Profile Photo</span>
              </label>
              <input
                id="file"
                type="file"
                onChange={handleAvatar}
                className="hidden"
              />
            </div>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-400 hover:to-rose-400 transition-colors">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>): 
    (<>
        <div
          className="flex flex-col items-center justify-center w-full h-full p-6 m-4 text-white "
          style={{ minHeight: "100vh", minWidth: "100vw"  }}
        >
          <h1 className="text-8xl font-bold  ">ChitChat</h1>
          <img
            src={messaging}
            alt="ChitChat Image"
            className="p-2" 
            style={{width:"250px"}}
          />
          <h5 className=" mb-8 p-2">created by - Pretisha Sahoo</h5>
          <button className=" p-2  m-4" onClick={()=>{setHome(false)}}  style={{backgroundColor: "transparent" , width:"300px" ,boxShadow :"  0 0 4px 4px rgba(255, 255, 255, 0.4)" , borderRadius: "6px ", transition: "color 0.3s ease 0s", marginBottom:"50px"}}>See Chats!</button>
          {/* <h4 className="text-center w-2/5" style={{fontSize:"18px"}}>ChitChat connects you instantly with friends, family, and colleagues. Whether you're looking to catch up on daily events, coordinate with your team, or stay in touch with loved ones, ChitChat offers a seamless communication experience. Enjoy real-time messaging, share photos and videos, and create group chats to manage projects or plan events—all within a user-friendly interface. Dive into ChitChat and start connecting in a more meaningful way today!</h4> */}
         </div>
    </>)
  );
}
