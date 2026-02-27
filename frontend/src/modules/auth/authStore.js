import { create } from "zustand";

/*
⭐ ENTERPRISE AUTH STORE
Central brain of SaaS permissions
*/

const authStore = create((set) => ({

  user: null,
  token: localStorage.getItem("token"),

  /* ================= SET USER ================= */

  setUser: (token) => {

    if(!token){
      set({ user:null, token:null });
      return;
    }

    try{

      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("token", token);
      localStorage.setItem("role", payload.role);
      localStorage.setItem("hotelId", payload.hotelId || "");

      set({
        user: payload,
        token
      });

    }catch(err){
      console.log("Invalid token");
    }
  },

  /* ================= LOGOUT ================= */

  logout: () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("hotelId");

    set({
      user:null,
      token:null
    });
  }

}));

export default authStore;