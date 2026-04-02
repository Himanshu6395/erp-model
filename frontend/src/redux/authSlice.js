import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("authUser")
      ? JSON.parse(localStorage.getItem("authUser"))
      : null,

    token: localStorage.getItem("token") || null
};


const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        setCredential:(state,action)=>{
            state.user=action.payload.user;
            state.token=action.payload.token;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem('authUser', JSON.stringify(action.payload.user));
        },
        logout:(state)=>{
            state.user=null,
            state.token=null,
            localStorage.removeItem("token");
        }
    }
})
export const {setCredential,logout}=authSlice.actions;
export default authSlice.reducer;