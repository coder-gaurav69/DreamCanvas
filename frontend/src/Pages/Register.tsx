import React, { useContext, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { FaMicrosoft } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../ContextApi/globalVariable";

const Register = () => {
  const navigate = useNavigate();
  const { mode,authenticated,setAuthenticated,setActive } = useContext(GlobalContext);

  type field = {
    userName?: string;
    userEmail?: string;
    userPassword?: string;
  };

  const [field, setField] = useState<field>({
    userName: "",
    userEmail: "",
    userPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setField((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("form submitted");
  };

  useEffect(() => {
    console.log(message);
  }, [message]);


  const register = async (): Promise<void> => {
    try {
      setMessage("");
      setError("");
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/register`;
      const payload = {
        name: field.userName,
        email: field.userEmail,
        password: field.userPassword,
      };
      const result = await axios.post(url, payload ,{
        withCredentials:true
      });
      setAuthenticated(true);
      setActive({
        Create:true,
        Gallery:false
      })
      setMessage(result.data.message);
      (document.getElementById("regUserName") as HTMLInputElement).value = "";
      (document.getElementById("regUserEmail") as HTMLInputElement).value = "";
      (document.getElementById("regUserPassword") as HTMLInputElement).value =
        "";
      navigate("/");
    } catch (error: any) {
      const errMessage =
        error?.response?.data?.message || "An error occurred during Register.";
      setError(errMessage);
      console.error("Register Error:", errMessage);
    }
  };

  const isDark = mode === "Dark";
  const inputBase =
    "p-2 mt-2 rounded-lg outline-none transition-all duration-200";
  const inputShadow = isDark
    ? "bg-[#0e0e0e] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)] focus:shadow-[0_0_0_2px_rgba(109,40,217,1)]"
    : "bg-white text-black shadow-[0_0_0_1px_rgba(0,0,0,0.1)] focus:shadow-[0_0_0_2px_rgba(109,40,217,1)]";


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

  return (
    <div
      className={`w-full max-w-[480px] pt-[80px] px-4 pb-10 mx-auto flex flex-col justify-center items-center ${
        isDark ? "text-white" : "text-black"
      }`}
    >
      {/* heading */}
      <div className="flex flex-col mb-10 text-center px-2">
        <h1 className="colorAnimation text-3xl sm:text-4xl font-bold">
          Create Your Account
        </h1>
        <p
          className={`mt-4 font-semibold text-base sm:text-lg ${
            isDark ? "text-white/70" : "text-black/70"
          }`}
        >
          Join DreamCanvas and start creating beautiful AI-generated images
        </p>
      </div>

      {/* form */}
      <form
        className={`w-full p-6 sm:p-8 rounded-xl text-sm sm:text-base transition-all duration-300 ${
          isDark
            ? "bg-black/30 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
            : "bg-white/70 backdrop-blur-lg shadow-lg"
        }`}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <input type="text" name="hidden" autoComplete="username" hidden />
        <input
          type="password"
          name="hiddenPass"
          autoComplete="new-password"
          hidden
        />

        <div className="flex flex-col">
          <label htmlFor="regUserName">UserName</label>
          <input
            type="text"
            id="regUserName"
            name="userName"
            value={field.userName}
            placeholder="Choose a UserName"
            className={`${inputBase} ${inputShadow}`}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col mt-6">
          <label htmlFor="regUserEmail">Email</label>
          <input
            type="email"
            id="regUserEmail"
            name="userEmail"
            value={field.userEmail}
            placeholder="Enter your email"
            className={`${inputBase} ${inputShadow}`}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col mt-6">
          <label htmlFor="regUserPassword">Password</label>
          <input
            type="password"
            id="regUserPassword"
            name="userPassword"
            value={field.userPassword}
            placeholder="Create a password"
            className={`${inputBase} ${inputShadow}`}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <button
          type="button"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white w-full mt-6 py-2 rounded-lg font-medium transition-all duration-200"
          onClick={register}
        >
          Create Account
        </button>

        <div className="flex items-center justify-center gap-2 my-6 text-sm">
          <hr className="grow border-gray-500" />
          <p className="shrink-0 text-[rgba(255,255,255,0.5)] dark:text-gray-300">
            or sign up with
          </p>
          <hr className="grow border-gray-500" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-xl">
          <div className="border border-white/20 dark:border-gray-700 flex items-center justify-center rounded-lg py-2 hover:bg-white/10 transition" onClick={handle0AuthGoogleLogin}>
            <FcGoogle />
          </div>
          <div className="border border-white/20 dark:border-gray-700 flex items-center justify-center rounded-lg py-2 hover:bg-white/10 transition" onClick={handle0AuthFacebookLogin}>
            <FaFacebook className="text-[#2563EB]" />
          </div>
          <div className="border border-white/20 dark:border-gray-700 flex items-center justify-center rounded-lg py-2 hover:bg-white/10 transition" onClick={handle0AuthGithubLogin}>
            <FaMicrosoft className="text-[#00A4EF]" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
