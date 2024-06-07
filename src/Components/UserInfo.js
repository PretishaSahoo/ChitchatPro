import React, { useEffect, useState } from 'react';
import profileImg from "../Images/user.png";
import { useDispatch } from 'react-redux';
import { fetchUserInfo } from '../redux/store';

export default function UserInfo() {
  
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const userId = localStorage.getItem('chatId');

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

  return (
    <>
      {userData && (
        <div className="UserInfo flex items-center justify-between px-2">
          {/* User Information */}
          <div className="user flex items-center">
            <img
              className="w-12 h-12 mr-2 bg-slate-100 cursor-pointer"
              src={userData.avatar || profileImg}
              alt="Profile"
              style={{ borderRadius: "50%" }}
            />
            <h2 className="text-lg font-bold">{userData.username || 'User Name'}</h2>
          </div>
          {/* Action Icons */}
          <div className="icons flex items-center">
          <svg
            width="20"
            height="5"
            viewBox="0 0 20 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2.5" cy="2.5" r="2.5" fill="#fff" />
            <circle cx="10" cy="2.5" r="2.5" fill="#fff" />
            <circle cx="17.5" cy="2.5" r="2.5" fill="#fff" />
          </svg>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.364 4.05C18.7575 3.6565 19.2925 3.6565 19.686 4.05L20.946 5.31C21.3395 5.7035 21.3395 6.2385 20.946 6.632L9.7795 17.7985C9.6985 17.8795 9.5985 17.945 9.487 17.99L5.5 19.5L7.008 15.515C7.053 15.4035 7.1185 15.3015 7.1985 15.2205L18.364 4.05ZM17.1345 5.2795L18.5 6.645V5.5L17.1345 5.2795ZM8.331 17.1905L16.8085 8.713L15.287 7.1915L6.8095 15.668L8.331 17.1905Z"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
            />
          </svg>
          </div>
        </div>
      )}
    </>
  );
}
