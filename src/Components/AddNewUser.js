import React, { useState } from 'react';
import profileImg from "../Images/user.png";
import { db } from '../firebase';
import { collection, query, where , getDocs,doc,setDoc,updateDoc, serverTimestamp, arrayUnion} from 'firebase/firestore';

export default function AddNewUser({toOpen}) {

  const [open, setOpen] = useState(toOpen);
  const [searchedUser , setSearchedUser] = useState(null);

  const userId = localStorage.getItem('chatId')

  const handleCloseModal = () => {
    setOpen(false); 
  };

  const handleSearch = async(e) =>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username")
    try {
      const userRef = collection(db,"users");
      const q = query(userRef , where("username" ,"==" , username));

      const querySnapShot = await getDocs(q);

      if(!querySnapShot.empty){
        setSearchedUser(querySnapShot.docs[0].data())
        console.log(searchedUser)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleAdd = async()=>{

    const chatRef = collection(db,"chats")

    try {

      const newChatRef = doc(chatRef)

      await setDoc(newChatRef ,{
        createdAt:serverTimestamp(),
        messages:[],
      })

      const userChatsSenderRef = doc(db,"userchats",userId)
      const userChatsRecieverRef = doc(db,"userchats",searchedUser.id)

      await updateDoc(userChatsRecieverRef,{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          recieverId:userId,
          updatedAt:Date.now(),
        })
      })  

      await updateDoc(userChatsSenderRef ,{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          recieverId:searchedUser.id,
          updatedAt:Date.now(),
        })
      })

    } catch (error) {
      console.log(error.message)
    }
  }

  const scrollbarStyle = {
    maxHeight: '35vh',
    overflowY: 'auto',
    padding: '4px',
    marginTop: '20px', 
    marginBottom: '20px', 
    WebkitOverflowScrolling: 'touch', 
    scrollbarWidth: 'thin', 
    scrollbarColor: 'lightblue transparent',
  };


  return (
    (open===true && 
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-35 z-50">
      <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-lg shadow-lg w-96">
      <button
            className="absolute top-2 right-2 text-white hover:text-gray-300 transition duration-300"
            onClick={handleCloseModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        <div className="p-6">
          <form className="mb-4 flex items-center" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              className="w-full bg-transparent border border-gray-300 bg-gray-100 rounded-md p-2 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              className="bg-purple-300 text-white rounded-md py-2 px-4 ml-2 hover:bg-purple-400 transition duration-300 ease-in-out"
            >
              Search
            </button>
          </form>
          <div  style={{ ...scrollbarStyle }}>

          
          {searchedUser && <div className="user flex items-center p-2 mb-4"  style ={{borderBottom:"1px solid #dddddd35"}}>
            <img
              src={searchedUser.avatar||profileImg}
              alt=""
              className="w-12 h-12 rounded-full mr-3"
            />
            <span className="text-lg font-medium">{searchedUser.username}</span>
            <button onClick = {handleAdd}
              className="bg-purple-300 text-white rounded-md py-2 px-4 ml-auto hover:bg-purple-400 transition duration-300 ease-in-out"
            >
              Add User
            </button>
          </div>}
          </div>
        </div>
      </div>
    </div>
    )
  );
}


