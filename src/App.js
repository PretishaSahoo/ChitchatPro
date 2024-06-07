import React, { useEffect } from 'react';
import './App.css';
import Login from './Components/Login'
import AddNewUser from './Components/AddNewUser';
import FullChat from './Components/FullChat';
import {useDispatch, useSelector} from 'react-redux'
import {authActions} from './redux/store'
import { ToastContainer } from 'react-toastify';

function App() {

  const dispatch = useDispatch()
  const isloggedIn = useSelector((state)=>state.auth.isLoggedIn)

  useEffect(() => {
    if(localStorage.getItem('chatId')){
      try {
        dispatch(authActions.login());
      } catch (error) {
        console.error('Error during login dispatch:', error);
      }
    }
  }, [dispatch])
  
  

  return (
    <>
    {isloggedIn? <>
    <ToastContainer/>
    <FullChat/>
    </>
    :
    <>
     <Login/>
    </>
    }
    <AddNewUser/>
    </>
  );
}

export default App;
