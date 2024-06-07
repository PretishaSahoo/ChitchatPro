import { createSlice, combineReducers ,configureStore ,createAsyncThunk} from '@reduxjs/toolkit'
import { doc, getDoc } from "firebase/firestore";
import {db} from '../firebase.js'



export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (uid, thunkAPI) => {
  if (!uid) {
    thunkAPI.dispatch(authActions.logout()); 
    return null;
  }

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    //console.log(docSnap.data())
    return docSnap.data();  
  } else {
    throw new Error('No such document!');
  }
});


const authSlice = createSlice({
    name: 'auth',
    initialState: {user:null, isLoggedIn:false },
    reducers: {
      login(state){
        state.isLoggedIn = true
      }
      ,
      logout(state){
        state.isLoggedIn = false
      },
  }
})


const chatSlice = createSlice({
  name: 'chats',
  initialState: { chatId: null, user: null, isCurrentUserBlocked: false, isReceiverBlocked: false },
  reducers: {
      changeChat: (state, action) => {
          const { chatId, user , currUser } = action.payload;

          if (user.blocked.includes(currUser.id)) {
            console.log(user)
            console.log(currUser)
              return { ...state, chatId, user: null, isCurrentUserBlocked: true, isReceiverBlocked: false };
          }

          else if (currUser.blocked.includes(user.id)) {
            console.log(user)
            console.log(currUser)
              return { ...state, chatId, user:user, isCurrentUserBlocked: false, isReceiverBlocked: true };
          }

          return { ...state, chatId, user:user, isCurrentUserBlocked: false, isReceiverBlocked: false };
      },
      toggleBlock: (state) => {
        return { ...state, isReceiverBlocked: state.isReceiverBlocked ? false : true };
      }    
  }
});


export const authActions = authSlice.actions;
export const chatActions = chatSlice.actions;

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  chats: chatSlice.reducer,
});

// Configure store with combined reducer
export const store = configureStore({
  reducer: rootReducer,
});
