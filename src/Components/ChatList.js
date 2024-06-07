import React, { useState, useEffect } from "react";
import searchImg from "../Images/search.png";
import profileImg from "../Images/user.png";
import AddNewUser from "./AddNewUser";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { chatActions, fetchUserInfo } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";

export default function ChatList() {
  const dispatch = useDispatch();
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const userId = localStorage.getItem("chatId");

  const [userData, setUserData] = useState(null);
  const [reciever, setReciever] = useState(null);

  const [search, setSearch] = useState("")

  const isReceiverBlocked = useSelector(
    (state) => state.chats.isReceiverBlocked
  );
  const isCurrentUserBlocked = useSelector(
    (state) => state.chats.isCurrentUserBlocked
  );

  const handleSelect = async (chat) => {
    const receiverId = chat.recieverId;
  
    if (!receiverId) {
      console.error("Receiver ID is missing.");
      return;
    }
  
    setReciever(receiverId);
  
    if (!userData) {
      console.error("User data is missing.");
      return;
    }

    dispatch(
      chatActions.changeChat({
        chatId: chat.chatId,
        user: chat.user,
        currUser: userData,
      })
    );
  
    try {
      const userChatsRef = doc(db, "userchats", userId);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const chatData = userChatsSnapshot.data().chats; 
  
      if (userChatsSnapshot.exists()) {
        const updatedChats = chatData.map((c) =>
          c.chatId === chat.chatId ? { ...c, isSeen: true } : c
        );
        await updateDoc(userChatsRef, { chats: updatedChats });
      }
    } catch (error) {
      console.error("Error updating user chats:", error);
    }
  };
  

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserInfo(userId))
        .then((userInfo) => {
          setUserData(userInfo.payload);
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
        });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (reciever) {
      dispatch(fetchUserInfo(reciever))
        .then((userInfo) => {
          if (userInfo.payload) {
            setReciever(userInfo.payload);
          }
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
        });
    }
  }, [dispatch, reciever,handleSelect]);

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
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub();
  }, [userId]);

 

  const handleToggleAddMode = () => {
    setAddMode((prev) => !prev);
  };

  const scrollbarStyle = {
    maxHeight: "65vh",
    overflowY: "auto",
    padding: "4px",
    marginTop: "20px",
    marginBottom: "20px",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "thin", 
    scrollbarColor: "lightblue transparent",
  };

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(search.toLowerCase()));


  return (
    <>
      <div className="searchbar flex items-center justify-between w-full p-2">
        <div className="flex w-full items-center border-2 border-white-500 rounded-xl">
          <img
            className="w-8 h-8 mr-2 sm:mr-4"
            src={searchImg}
            alt="searchIcon"
          />
          <input
            className="h-8 px-2 rounded-md focus:outline-none bg-transparent cursor-pointer"
            type="text"
            placeholder="Search"
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleToggleAddMode}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 4C12.2652 4 12.5196 4.10536 12.7071 4.29289C12.8946 4.48043 13 4.73478 13 5V11H19C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13H13V19C13 19.2652 12.8946 19.5196 12.7071 19.7071C12.5196 19.8946 12.2652 20 12 20C11.7348 20 11.4804 19.8946 11.2929 19.7071C11.1054 19.5196 11 19.2652 11 19V13H5C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11H11V5C11 4.73478 11.1054 4.48043 11.2929 4.29289C11.4804 4.10536 11.7348 4 12 4Z"
            fill="#fff"
          />
        </svg>
      </div>

      <hr className="border-1 border-gray-300 my-2" />

      <div className="chatscroll" style={{ ...scrollbarStyle }}>
        {filteredChats?.map((chat) => (
          <div
            key={chat.recieverId}
            onClick={() => handleSelect(chat)}
            className="chat-message flex mb-6"
            style={{
              borderBottom: "1px solid #dddddd35",
              borderRadius: "20px",
              padding: "4px",
              backgroundColor: chat?.isSeen ? "transparent" : "#D3D3D3",
            }}
          >
            <img
              className="w-12 h-12 rounded-full mr-4"
              src={
                userData?.blocked?.includes(chat.recieverId) 
                  ? profileImg
                  : chat.user.avatar
              }
              alt="User Profile"
            />
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mb-1">
                { userData?.blocked?.includes(chat.recieverId) 
                  ? "User"
                  : chat.user.username}
              </h3>
              <p className="text-gray-600">
              {userData?.blocked?.includes(chat.recieverId) 
                  ? "blocked"
                  : chat.lastMessage ||
                    "No messages yet. Start a conversation now..."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {addMode && <AddNewUser toOpen={addMode} />}
    </>
  );
}
