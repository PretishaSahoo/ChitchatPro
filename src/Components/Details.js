import React, { useEffect, useRef, useState } from "react";
import profileImg from "../Images/user.png";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../firebase.js";
import {signOut} from "firebase/auth";
import {useDispatch, useSelector} from 'react-redux'
import {authActions, chatActions, fetchUserInfo} from '../redux/store'
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export default function Details({mobileView , setMobileView ,handleBackClick}) {

  const dispatch = useDispatch()
  const userId = localStorage.getItem('chatId')
  const currChatId = useSelector((state)=>state.chats.chatId)
  const user = useSelector((state) => state.chats.user )
  const isReceiverBlocked = useSelector((state)=>state.chats.isReceiverBlocked)
  const isCurrentUserBlocked = useSelector((state)=>state.chats.isCurrentUserBlocked)
  const [userData, setUserData] = useState(null);

  const [chat, setChat] = useState([])

  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserInfo(userId))
        .then((userInfo) => {
          setUserData(userInfo.payload);
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
        });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db,"chats" , currChatId ) , (response) =>{
      setChat(response.data())
    })

    // console.log(chat)

    return () =>{
      unsub()
    }
  }, [currChatId ])

  const handleLogout = async() =>{
    try {
      await signOut(auth)
      dispatch(authActions.logout())
      localStorage.removeItem('chatId')
      toast.success ("Logged out successfully")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBlock = async () => {
    // console.log(user.id)
    // console.log(userData.id)
    if (!user) {
      return;
    }
    console.log(isCurrentUserBlocked)
    console.log(isReceiverBlocked)
    const userDocRef = doc(db, "users",userData.id );
    try {
      if (isReceiverBlocked) {
        // If the user is blocked, unblock them
        // console.log(user.id)
        // console.log(userId)
        await updateDoc(userDocRef, {
          blocked: arrayRemove(user.id)
        });
        // const userDocSnapshot = await getDoc(userDocRef); 
        // console.log(userDocSnapshot.data()); 
        dispatch(chatActions.toggleBlock());
        toast.success("User unblocked successfully");
      } else {
        // If the user is not blocked, block them
        console.log(user.id)
        console.log(userId)
        await updateDoc(userDocRef, {
          blocked: arrayUnion(user.id)
        });
        const userDocSnapshot = await getDoc(userDocRef); 
        console.log(userDocSnapshot.data()); 
        dispatch(chatActions.toggleBlock());
        toast.success("User blocked successfully");
      }
    } catch (error) {
      console.log(error.message);
      toast.error("An error occurred while processing the request");
    }
  };

  const handleImageDownload = (url) => {
    if (url) {
      console.log(url);
      window.open(url, '_blank');
    } else {
      console.error('Invalid image URL');
    }
  };
  
  
  const scrollbarStyle = {
    maxHeight: "55vh",
    overflowY: "auto",
    padding: "4px",
    marginTop: "20px",
    marginBottom: "20px",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "thin",
    scrollbarColor: "lightblue transparent",
  };

  return (
    <div className="detail flex-1">
      <div
        className="user p-2 flex flex-col items-center"
        style={{ borderBottom: "1px solid #dddddd35" }}
      >
        <div className="flex">
        {mobileView && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" onClick={handleBackClick}>
            <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/>
          </svg>
          }
          <img
            className="w-12 h-12 mr-2 cursor-pointer bg-violet-300"
            src={isCurrentUserBlocked|| isReceiverBlocked ?profileImg : user?.avatar}
            alt=""
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        </div>
        
        <h2>{isCurrentUserBlocked|| isReceiverBlocked ?"User" : user?.username}</h2>
        <p>~~~~~~~~~~</p>
      </div>
      <div
        className="info p-2 flex-1"
        style={{ flexGrow: 1,minHeight:"50vh", ...scrollbarStyle }}
      >
        <div className="option">
          <div className="shared_photos" >
            <span>Shared Photos</span>
          </div>
          <div className="photos">
          {chat?.messages?.map((mychat) => (
              mychat.img && <div key={mychat.createdAt}>
                <div
                  className="photoItem  p-2 flex"
                  style={{ borderBottom: "1px solid #dddddd35" }}
                  onClick={() => handleImageDownload(mychat.img)} 
                >
                  <img className="w-12 h-12 " src={mychat.img} alt=""  />
                  <span className="p-2">Photo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full cursor-pointer" onClick={handleBlock}>
        {isCurrentUserBlocked ? "You are Blocked" : isReceiverBlocked ? "Unblock" : "Block"}
      </button>

      <button className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded w-full cursor-pointer my-2" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
