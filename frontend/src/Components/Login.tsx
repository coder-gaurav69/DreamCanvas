import React, { useContext, useEffect, useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { FaMicrosoft } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';
import axios from 'axios'
import { GlobalContext } from '../ContextApi/globalVariable';


const Login = () => {

  const {loginStatus,setLoginStatus,setAuthenticated} = useContext(GlobalContext);
  const {mode} = useContext(GlobalContext);


  type field = {
    email?: string;
    userPassword?: string;
  };

  const [field, setField] = useState<field>({
    email: "",
    userPassword: "",
  });

  const [isClosing, setIsClosing] = useState(false); // New state for smooth closing

  const [message,setMessage] = useState('');

  const [error,SetError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("form submitted");
  };

  // Modified close handler to allow animation before closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setLoginStatus(false);
    }, 500); // matches animation duration
  };

  // login api
  const login = async (): Promise<void> => {
    try {
      setMessage('');
      SetError('');
      const payload = {
        email: field.email,
        password: field.userPassword,
      };
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
      const response = await axios.post(url, payload,{
        withCredentials:true
      });
      setMessage(response.data.message);
  
      const emailInput = document.getElementById('email') as HTMLInputElement | null;
      const passwordInput = document.getElementById('userPassword') as HTMLInputElement | null;
  
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
      
      handleClose();
      setAuthenticated(true)

    } catch (error: any) {
      const errMessage = error?.response?.data?.message || "An error occurred during login.";
      SetError(errMessage);
      console.error("Login Error:", errMessage);
    }
  };
  
  
  useEffect(()=>{
    console.log(message)
  },[message])

  const handle0AuthGoogleLogin = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    window.open(url, "_self");
  };
  
  const handle0AuthFacebookLogin = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/facebook`;
    window.open(url, "_self");
  };

  const handle0AuthGithubLogin = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
    window.open(url, "_self");
  };
  // bg-[#09090B]
  
  return (
    <div
      className={`w-full h-screen ${
        loginStatus || isClosing ? "flex" : "hidden"
      } justify-center items-center fixed bg-[rgba(0,0,0,0.7)] ${mode=='Light'?"backdrop-blur-[7px]":"backdrop-blur-[2px]"} z-10 top-0 left-0 px-[30px]`}
    >
      <div
        className={`${
          isClosing ? "zoomOut" : "zoomIn"
        } w-full max-w-[450px] py-8 px-6 mx-auto flex flex-col justify-center items-center shadow-[0_0_0_0.3px_rgba(255,255,255,0.5)] z-20 rounded-[10px] ${mode == 'Light'?"bg-[rgba(255,255,255,0.2)] backdrop-blur-[1px]":"bg-[#09090B]"} relative`}
      >
        {/* cross btn */}
        <div
          className="absolute right-[10px] top-[10px] text-2xl text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)]"
          onClick={handleClose}
        >
          <IoClose />
        </div>

        {/* Heading */}
        <div className="flex flex-col mb-[32px] text-center">
          <h1 className="colorAnimation text-2xl font-semibold">Welcome back</h1>
          <p className="mt-[8px] text-base text-[rgba(255,255,255,0.5)]">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form
          className="w-full text-sm sm:text-base"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <input type="text" name="hidden" autoComplete="email" style={{ display: "none" }} />
          <input type="password" name="hiddenPass" autoComplete="new-password" style={{ display: "none" }} />

          {/* email field */}
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={field.email}
              placeholder="Choose a email"
              className={`p-2 mt-2 focus:shadow-[0_0_0_1px_rgba(109,40,217,1)] rounded-lg outline-none shadow-[0_0_0_0.5px_rgba(109,40,217,0.3)] ${mode=='Light'?"bg-[rgba(255,255,255,0.1)]":"bg-black"}`}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          {/* password field */}
          <div className="flex flex-col mt-6">
            <label htmlFor="userPassword">Password</label>
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              placeholder="Create a password"
              className={`p-2 mt-2 focus:shadow-[0_0_0_1px_rgba(109,40,217,1)] rounded-lg outline-none shadow-[0_0_0_0.5px_rgba(109,40,217,0.3)] ${mode=='Light'?"bg-[rgba(255,255,255,0.1)]":"bg-black"}`}
              value={field.userPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* submit btn */}
          <button className="bg-[#6D28D9] w-full mt-6 py-2 rounded-lg font-medium" onClick={login}>
            Sign in
          </button>

          {/*or*/}
          <div className="flex items-center justify-center gap-2 my-6 text-sm">
            <hr className="grow border-gray-500" />
            <p className="shrink-0 text-[rgba(255,255,255,0.5)]">or sign up with</p>
            <hr className="grow border-gray-500" />
          </div>

          {/* other login option */}
          <div className="grid grid-cols-3 gap-4 text-xl mb-[24px]">
            <div className="shadow-[0_0_0_0.5px_rgba(255,255,255,0.2)] flex items-center justify-center rounded-lg py-2 hover:bg-[rgba(255,255,255,0.05)]" onClick={handle0AuthGoogleLogin}>
              <FcGoogle />
            </div>
            <div className="shadow-[0_0_0_0.5px_rgba(255,255,255,0.2)] flex items-center justify-center rounded-lg py-2 hover:bg-[rgba(255,255,255,0.05)]" onClick={handle0AuthFacebookLogin}>
              <FaFacebook className="text-[#2563EB]" />
            </div>
            <div className="shadow-[0_0_0_0.5px_rgba(255,255,255,0.2)] flex items-center justify-center rounded-lg py-2 hover:bg-[rgba(255,255,255,0.05)]" onClick={handle0AuthGithubLogin}>
              <FaMicrosoft className="text-[#00A4EF]" />
            </div>
          </div>

          {/* signup */}
          <div className='text-center text-[rgba(255,255,255,0.5)] text-[14px] mb-[5px]'>
            Don't have an account? <Link to={'/register'} className='text-[#6B27D5]' onClick={() => setLoginStatus(false)}>Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
