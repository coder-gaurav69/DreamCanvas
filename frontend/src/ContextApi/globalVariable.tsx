import axios from "axios";
import React, { createContext, useState, ReactNode, useEffect } from "react";

// Create the context
const GlobalContext = createContext<any>(null);

// Provider component
const GlobalProvider = ({ children }: { children: ReactNode }) => {
  
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [profileImage,setProfileImage] = useState<string>();

  type Active = {
      Create: boolean;
      Gallery: boolean;
    };

  const [active, setActive] = useState<Active>({
      Create: true,
      Gallery: false,
  });

  type Mode = 'Light' | "Dark" | 'System';

  const [mode,setMode] = useState<Mode>("Light");


  useEffect(() => {
    let intervalId:any;

    const checkValidation = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/validate`;
        const response = await axios.post(url, null, {
          withCredentials: true,
        });
        setProfileImage(response?.data?.profileImage);
        console.log(response?.data)
        console.log("User is authenticated");
        setAuthenticated(true);
      } catch (error) {
        console.error("User is NOT authenticated", error);
        setAuthenticated(false);
      }
    };

    // Run once on load
    checkValidation();
    
    if(authenticated == true){

      intervalId = setInterval(() => {
        checkValidation();
      }, 30000);
       
    }

    return () => clearInterval(intervalId);
  }, [authenticated]);


  return (
    <GlobalContext.Provider value={{ authenticated, setAuthenticated,loginStatus,setLoginStatus ,active,setActive , mode,setMode , profileImage }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };
