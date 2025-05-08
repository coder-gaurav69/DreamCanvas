import axios from "axios";
import React, { createContext, useState, ReactNode, useEffect } from "react";

// Create the context
const GlobalContext = createContext<any>(null);

// Provider component
const GlobalProvider = ({ children }: { children: ReactNode }) => {
  
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);

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
      // Periodic validation every 60 seconds
      intervalId = setInterval(() => {
        checkValidation();
      }, 300000); 
    }

    return () => clearInterval(intervalId);
  }, [authenticated]);


  return (
    <GlobalContext.Provider value={{ authenticated, setAuthenticated,loginStatus,setLoginStatus ,active,setActive , mode,setMode }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };
