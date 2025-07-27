import React, { useContext, useEffect, useState } from 'react'
import { PiMagicWandDuotone } from "react-icons/pi";
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Components/Loader';
import { GlobalContext } from '../ContextApi/globalVariable';

const Create = () => {
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loader,setLoader] = useState<boolean>(false);
  const {authenticated,setLoginStatus , mode }  = useContext(GlobalContext);
  const [imageUrl, setImageUrl] = useState<string | null>(null);


  // generate api call
  const handleGenerate = async () => {
    if (input.trim().length < 5) {
      setError('Prompt must be at least 5 characters');
    } 
    else {
      try {
        setError('');
        setLoader(true);
        const url = `${import.meta.env.VITE_BACKEND_URL}/generate-image`;
        const payload = {
          input:input
        }
        const result = await axios.post(url,payload,{
          headers:{
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }) as any;
        console.log(result);
        setImageUrl(result.data.fileName);
        console.log(result.data.fileName)
        setLoader(false);
      } catch (error:any) {
        const errMessage = error?.response?.data?.message || "An error occurred during Regiter.";
        setError(errMessage);
        setLoader(false);

        console.error("Login Error:", errMessage);
      }
        
      }
  };

  useEffect(() => {
    const h1Element = document.querySelector('.h1') as HTMLElement | null;
    if (h1Element) {
      if (input.trim().length >= 5) {
        h1Element.style.color = 'white';
        setError(''); // clear error when input is valid
      } else if (error) {
        h1Element.style.color = 'red';
      }
    }
  }, [input, error]);


  return (
    <div className='pt-[95px] pb-[40px] w-full lg:w-5xl m-auto flex flex-col items-center justify-center px-4 sm:px-[32px]'>

      {/* heading */}
      <div className='flex flex-col mb-[40px] text-center m-auto'>
        <h1 className='h1 colorAnimation text-4xl lg:text-5xl mb-[16px] leading-tight'>
          Create stunning images with AI
        </h1>
        <p className={`text-[20px] font-semibold ${mode === 'Light'?'text-[rgba(0,0,0,0.7)]':'text-[rgba(255,255,255,0.5)]'}`}>
          Transform your ideas into beautiful visuals with our powerful text-to-image generator.
        </p>
      </div>

      <div className={`p-6 w-full flex flex-col items-center justify-center hover:translate-y-[-5px] transition-all duration-400 ${mode =='Light'? "shadow-[0_0_0_0.5px_rgb(23,13,41)]":"shadow-[0_0_0_1px_rgb(23,13,41)]"} rounded-[10px] mb-[40px]`}>


        <h1 className={`text-[18px] w-full ${error ? 'text-[#7E1C1C]' : mode === 'Light'?'text-[rgba(0,0,0,0.8)]':'text-white'} font-medium `}>
          Describe your image
        </h1>
        <textarea
          placeholder='A serene lake surrounded by mountains at sunset....'
          className={`w-full p-[8px_12px] mt-[8px] min-h-[100px] outline-none focus:shadow-[inset_0_0_0_2px_#8740E5] rounded-[10px] ${mode === 'Light'?'text-black shadow-[0_0_0_0.5px_rgb(23,13,41)]':'text-white shadow-[0_0_0_1px_rgb(23,13,41)]'}`}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        {error && <h1 className='text-[#7E1C1C] mt-[8px] font-medium w-full'>{error}</h1>}

        <div className='w-full grid grid-cols-1 md:grid-cols-3 mt-[24px] gap-5'>
          {/* Style */}
          <div>
            <p className={`font-medium ${mode === 'Light'?'text-black':'text-white'}`}>Style</p>
            <select className={`focus:shadow-[inset_0_0_0_2px_#8740E5] rounded-[10px] p-[8px_12px] mt-[8px] outline-none w-full ${mode === 'Light'?'text-black shadow-[0_0_0_0.5px_rgb(23,13,41)]':'bg-black text-white shadow-[0_0_0_1px_rgb(23,13,41)]'}`}>
              <option value="Realistic">Realistic</option>
              <option value="Artistic">Artistic</option>
              <option value="3D Render">3D Render</option>
              <option value="Cartoon">Cartoon</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <p className={`font-medium ${mode === 'Light'?'text-black':'text-white'}`}>Size</p>

            <select className={`focus:shadow-[inset_0_0_0_2px_#8740E5] rounded-[10px] p-[8px_12px] mt-[8px] outline-none w-full  ${mode === 'Light'?'text-black shadow-[0_0_0_0.5px_rgb(23,13,41)]':'bg-black text-white shadow-[0_0_0_1px_rgb(23,13,41)]'}`}>
              <option value="Square (1:1)">Square (1:1)</option>
              <option value="Landscape (16:9)">Landscape (16:9)</option>
              <option value="Portrait (9:16)">Portrait (9:16)</option>
              <option value="Standard (4:3)">Standard (4:3)</option>
            </select>
          </div>

          {/* Quality */}
          <div>
            <p className={`font-medium ${mode === 'Light'?'text-black':'text-white'}`}>Quality</p>
            <select className={`focus:shadow-[inset_0_0_0_2px_#8740E5] rounded-[10px] p-[8px_12px] mt-[8px] outline-none w-full ${mode === 'Light'?'text-black shadow-[0_0_0_0.5px_rgb(23,13,41)]':'bg-black text-white shadow-[0_0_0_1px_rgb(23,13,41)]'}`}>
              <option value="Standard">Standard</option>
              <option value="HD">HD</option>
              <option value="Ultra">Ultra</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button className='bg-[#6D28D9] hover:bg-[rgba(109,40,217,0.8)] rounded-[10px] mt-[24px]' onClick={handleGenerate}>
          {!loader && <div className='flex items-center gap-3 p-[10px_25px] sm:p-[10px_32px]'>
            <PiMagicWandDuotone className='font-bold text-[20px]' />
            <p className='font-bold'>Generate Image</p>
          </div>}
          {loader && <Loader/>}
        </button>
      </div>

      <hr className='text-[#170D29] w-full border-0.5' />

      {/* Gallery */}
      <div className='py-10 w-full '>
       
          <h1 className='colorAnimation text-[24px] mb-[24px]'>Your Recent Creations</h1>
          <div className={`p-[24px] ${mode=='Light'?'shadow-[0_0_0_0.5px_rgb(23,13,41)]':'shadow-[0_0_0_1px_rgb(23,13,41)]'} rounded-[10px] min-h-[200px] flex items-center justify-center`}>

            {!authenticated && <div className={`${mode=='Light'?'shadow-[0_0_0_0.5px_rgb(23,13,41)]':'shadow-[0_0_0_1px_rgb(23,13,41)]'} rounded-[10px] p-[32px] justify-center flex flex-col items-center w-full`}>
              <p className={`mb-[16px] ${mode === 'Light'?'text-[rgba(0,0,0,0.6)]':'text-[rgba(255,255,255,0.5)]'}`}>Please login to view your generated images</p>
              <p  className='text-[#8740E5]' onClick={()=>setLoginStatus(true)}>Login Now</p>
            </div>}

            {authenticated && imageUrl && <img src={imageUrl} alt="Image" className='sm:w-[400px] sm:h-[400px] rounded-2xl' />}


          </div>
      </div>
    </div>
  )
}

export default Create;
