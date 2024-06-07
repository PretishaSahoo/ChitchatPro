import React, { useEffect, useRef, useState } from 'react'
import profileImg from "../Images/user.png";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import {db} from '../firebase.js'
import { chatActions, fetchUserInfo } from '../redux/store.js';
import { useDispatch, useSelector } from 'react-redux';
import upload from './upload.js';

export default function Chat({setToggle,mobileView , handleBackClick, handleInfoClick}) {
  
  const dispatch = useDispatch()
  const currChatId = useSelector((state)=>state.chats.chatId)
  const userId = localStorage.getItem('chatId');
  const[reciever ,setReciever] = useState(null)
  const [fullChat,setFullChats] = useState(null)
  const [chat, setChat] = useState([])
  const [userData, setUserData] = useState(null);


  const isReceiverBlocked = useSelector((state)=>state.chats.isReceiverBlocked)
  const isCurrentUserBlocked = useSelector((state)=>state.chats.isCurrentUserBlocked)


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

    return () =>{
      unsub()
    }
  }, [currChatId ])


  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", userId), async (res) => {
      const items = await res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.recieverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();
        return { ...item, user };
      });
      const chatData = await Promise.all(promises);
      //console.log(chatData);
      setFullChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub();
  }, [userId]);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  
  const handleEmoji =(e) =>{
    const emoji = e.emoji 
    setText(text+emoji);
  }

  const handleText = (e) =>{
    setText(e.target.value);
  }

  const [img, setImg] = useState(
    {
      file:null,
      url:"",
    }
  )
  const[loading,setLoading] = useState(false);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend =async () =>{
    setLoading(true)
    if(text==='' && img.file===null){
      return;
    }

    let imgUrl = null ;

    try {

      if(img.file){
        imgUrl = await upload(img.file)
        console.log(imgUrl)
      }
      await updateDoc(doc(db,"chats",currChatId),{
        messages:arrayUnion({
          senderId:userId,
          ...(text!=="" && {text : text}) ,
          createdAt:new Date(),
          ...(imgUrl && {img:imgUrl}),
        })
      })

      const chatIndex = fullChat.findIndex(c=> c.chatId === currChatId)
      const userIDs = [userId,fullChat[chatIndex ].recieverId]

      //console.log(userIDs)

      userIDs.forEach( async(id)=>{

        const userChatsRef = doc(db,"userchats",id)
        const userChatsSnapshot = await getDoc(userChatsRef)

        if(userChatsSnapshot.exists()){

          const UserChatsData = userChatsSnapshot.data()

          //console.log( UserChatsData)

          const chatIndex = await UserChatsData.chats.findIndex(c=> c.chatId === currChatId)

          UserChatsData.chats[chatIndex].lastMessage = text 
          if(img.file){
             UserChatsData.chats[chatIndex].lastMessage = "image"
          }
          UserChatsData.chats[chatIndex].isSeen = id===userId?true:false
          UserChatsData.chats[chatIndex].updatedAt = Date.now()

          await updateDoc(userChatsRef ,{chats:UserChatsData.chats})
        }
      })

    } catch (error) {
      console.log(error.message)
    }
    setText("");
    setImg({
      file:null,
      url:"",
    })
    setLoading(false)
  }

const scrollbarStyle = {
  maxHeight: '65vh',
  overflowY: 'auto',
  padding: '4px',
  marginTop: '20px', 
  marginBottom: '20px', 
  WebkitOverflowScrolling: 'touch', 
  scrollbarWidth: 'thin', 
  scrollbarColor: 'lightblue transparent',
};

const messageStylesReceived = {
  backgroundColor:"grey",  
  borderRadius: '20px',
  padding: '10px 15px',
  maxWidth: '60%',
  position: 'relative',
  marginBottom: '10px',
  color: 'white',
  wordWrap: 'break-word',
  marginRight: 'auto',  
  marginLeft: '10px', 
};

const messageStylesSent= {
  background: 'linear-gradient(to right, #E6E6FA, #D8BFD8)',
  borderRadius: '20px',
  padding: '10px 15px',
  maxWidth: '60%',
  position: 'relative',
  marginBottom: '10px',
  color: '#fff', 
  wordWrap: 'break-word',
  marginLeft: 'auto',  
  marginRight: '10px', 
};

const imgSendStyle={
  maxWidth: '60%',
  position: 'relative',
  marginBottom: '10px',
  marginLeft: 'auto',  
  marginRight: '10px',
}

const imgReceiveStyle ={
  maxWidth: '60%',
  position: 'relative',
  marginBottom: '10px',
  marginRight: 'auto',  
  marginLeft: '10px', 
}

  return (
    <>
    <div className="chat "  
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '90vh',
        borderLeft: '3px solid #dddddd35',
        borderRight: '3px solid #dddddd35'
      }}>
      <div className="top UserInfo flex items-center justify-between px-2" style ={{borderBottom:"3px solid #dddddd35"}}>
        {mobileView && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" onClick={handleBackClick} >
          <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/>
        </svg>
        }
        <div className="user flex items-center">
          <img className="w-12 h-12 mr-2 bg-slate-100 cursor-pointer" src={ (isReceiverBlocked||isCurrentUserBlocked)?  profileImg:  fullChat?.filter(doc => doc.chatId === currChatId)[0]?.user.avatar ||  profileImg} alt="Profile" style={{borderRadius:"50%"}} />
          <h2 className="text-lg font-bold">{(isReceiverBlocked||isCurrentUserBlocked)?  "user" :  fullChat?.filter(doc => doc.chatId === currChatId)[0]?.user.username}</h2>
        </div>
        <div className="icons flex items-center info">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" onClick={handleInfoClick}>
          <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm1 9h-2v-6h2v6z"/>
        </svg>
        </div>
      </div>


      <div className="center flex flex-col" style={{flexGrow: 1, ...scrollbarStyle}}>
      {chat?.messages?.map((message) => (<>
        {message.text &&<div className='flex' key={message.createdAt} style={message.senderId === userId ? messageStylesSent : messageStylesReceived}>
          {message.text && <div className="mssg">
            {message.text}
            {/* {message.type === 'sender' && message.seen && (
              <span  style={{ fontSize: '0.6rem', color: 'grey', position: 'absolute', bottom: '2px', right: '10px' }}>Seen</span>
            )} */}
          </div>}
        </div>}

        <div style={message.senderId===userId ? imgSendStyle:imgReceiveStyle }>
          {message.img && <img  className="rounded-xl" src={message.img} alt=""/>}
        </div>

        </>
      ))}

      <div ref={endRef}></div>

           <EmojiPicker  open={open}  onEmojiClick={handleEmoji} 
           style={{
            position: 'absolute',
            zIndex: 9999,
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            backgroundColor:"grey"
          }}
           />
      </div>


      <div className="bottom w-full p-2" style={{borderTop:"1px solid #dddddd35" }}>
        <div className="icons flex w-full p-2">
          <div className="messagebar w-4/5 flex items-center border-2 border-white-500 rounded-xl">
            <div className="emoji" onClick={()=>setOpen((prev)=>!(prev))}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="4vh" width="4vw" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
            </div>
            <input
              className="h-8 w-full px-2 rounded-md focus:outline-none bg-transparent cursor-pointer"
              type="text"
              placeholder={isCurrentUserBlocked||isReceiverBlocked?"You cannot send messages to this chat...":"Type a message..."}
              value = {text} 
              onChange={handleText}
            />
          </div>  
          <div className=" flex w-2/5">
            <div className="attachment">
              <label htmlFor="file">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="4vh" width="4vw"  viewBox="0 0 512 512"><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>
              </label>
              <input type="file"  id='file' style={{display:"none"}} onChange={handleImg}/>
            </div>

            {img.url && <div className="message flex">
              <img style={{height:"40px",width:"100px"}} src={img.url} alt="" />
              {!loading && <svg onClick={() => setImg({file: null, url: ""})} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="white"/>
                  <path fill="none" stroke="black" strokeWidth="2" d="M8 8l8 8M16 8l-8 8" />
              </svg>}
            </div>}

           { !loading && !isCurrentUserBlocked && !isReceiverBlocked &&  <div className="send button" onClick={handleSend}>
              <svg xmlns="http://www.w3.org/2000/svg" width="4vw" height="4vh" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </div>}
            {
              (loading || isCurrentUserBlocked || isReceiverBlocked) &&  <div className="send button" >
              <svg xmlns="http://www.w3.org/2000/svg" width="4vw" height="4vh" viewBox="0 0 24 24" fill="grey"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/><line x1="1" y1="1" x2="23" y2="23" stroke="red" strokeWidth="2" /></svg>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
    </>
  )
}



