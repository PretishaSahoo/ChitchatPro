import React, { useEffect, useState } from "react";
import Details from "./Details";
import Chat from "./Chat";
import List from "./List";
import Page from "./Page";
import { useSelector } from "react-redux";

export default function FullChat() {
  const [toggle, setToggle] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth <= 768);
  const [showChatList, setShowChatList] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const currChatId = useSelector((state) => state.chats.chatId);

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  const handleBackClickFromChat = () => {
    setShowChat(false);
    setShowChatList(true);
  };


  const handleBackClickFromDetails = () => {
    setShowDetails(false);
    setShowChat(true);
  };

  const handleInfoClick = () => {
    if (mobileView) {
      setShowChat(false);
      setShowDetails(true);
    } else {
      setToggle(!toggle); // Assuming `toggle` controls the view in desktop
    }
  };

  useEffect(() => {
    if (currChatId) {
      setShowChat(true);
      setShowChatList(false);
      setShowDetails(false);
    } else {
      setShowChat(false);
      setShowChatList(true);
      setShowDetails(false);
    }
  }, [currChatId]);

  return (
    <div className="App rounded-xl flex flex-col sm:flex-row">
      {!mobileView && (
        <div className="w-full sm:w-1/4 px-2">
          <List />
        </div>
      )}

      {currChatId && !toggle && !mobileView && (
        <div className="w-full sm:w-3/4 px-2">
          <Chat
            toggle={toggle}
            setToggle={setToggle}
            mobileView={mobileView}
            setMobileView={setMobileView}
            handleInfoClick={handleInfoClick} 
          />
        </div>
      )}

      {currChatId && toggle && !mobileView && (
        <>
          <div className="w-full sm:w-1/2 px-2">
            <Chat
              toggle={toggle}
              setToggle={setToggle}
              mobileView={mobileView}
              setMobileView={setMobileView}
              handleInfoClick={handleInfoClick} 
            />
          </div>
          <div className="w-full sm:w-1/4 px-2">
            <Details mobileView={mobileView} setMobileView={setMobileView} />
          </div>
        </>
      )}

      {!currChatId && !mobileView && (
        <div className="w-full sm:w-3/4 ">
          <Page />
        </div>
      )}

      {mobileView && showChatList && (
        <div className="w-full sm:w-1/1 px-2">
          <List />
        </div>
      )}

      {mobileView && showChat && (
        <div className="w-full sm:w-1/1 px-2">
          <Chat
            toggle={toggle}
            setToggle={setToggle}
            mobileView={mobileView}
            setMobileView={setMobileView}
            handleBackClick={handleBackClickFromChat}
            handleInfoClick={handleInfoClick} 
          />
        </div>
      )}

      {mobileView && showDetails && (
        <div className="w-full sm:w-1/1 px-2">
          <Details
            mobileView={mobileView}
            setMobileView={setMobileView}
            handleBackClick={handleBackClickFromDetails}
          />
        </div>
      )}
    </div>
  );
}
