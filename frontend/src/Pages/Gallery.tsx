import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GlobalContext } from "../ContextApi/globalVariable";
import { HiOutlineDotsVertical } from "react-icons/hi";

const Gallery = () => {
  const { authenticated ,setActive , active , mode ,setLoginStatus} = useContext(GlobalContext);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  type imageObject = {
    imageUrl: string;
    publicId: string;
  };

  const [images, setImages] = useState<imageObject[]>([]);

  useEffect(() => {
    const handleGetAllImages = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/getImages`;

        const response = await axios.get(url, {
          withCredentials: true,
        });

        setImages(response.data.data.images);
      } catch (error) {
        console.log(error);
      }
    };

    handleGetAllImages();
  }, []);

  // for deleting images
  const handleDelete = async (publicId: string):Promise<void>=> {
    try {
      console.log(publicId);
      const url = `${import.meta.env.VITE_BACKEND_URL}/delete-image`;

      const payload = {
        public_id: publicId,
      };

      const response = await axios.delete(url, {
        data: payload,
        withCredentials: true,
      });

      setImages(images.filter((e,index)=>e.publicId != publicId));
      console.log('chl gaya function');
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  // function for download
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "blob",
      });
  
      const blob = new Blob([response.data]);
  
      // Generate random file name with correct extension
      const extension = imageUrl.split(".").pop()?.split(/\#|\?/)[0] || "jpg";
      const randomName = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
  
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = randomName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  
  // for close the states
  useEffect(()=>{
    
    //on mounting i will set the
    setActive({
      Create:false,
      Gallery:true
    })

    const close = ()=>{
      setClickedIndex(null);
    }

    window.addEventListener('click',close);

    return ()=>{
      window.removeEventListener('click',close);
    }
  },[])

  return (
    <div className="pt-[120px] px-4 pb-[80px] sm:px-6 flex flex-col items-center justify-center w-full lg:w-5xl m-auto">
      <div className="mb-[48px] flex flex-col justify-center items-center w-full">
        <h1 className="colorAnimation text-4xl lg:text-5xl mb-[16px] leading-[50px] text-center">
          Your Gallery
        </h1>
        <p className={`font-semibold text-center text-[16px] sm:text-[20px] ${mode === 'Light'?'text-[rgba(0,0,0,0.7)]':mode === "Dark"?'text-[rgba(255,255,255,0.5)] ':'text-black'}`}>
          View, download, and manage all your AI-generated images. Create
          stunning new visuals or variations to expand your collection.
        </p>
      </div>

      {/*Gallery container */}
      <div className={`p-[32px] w-full ${mode=="Light"?"shadow-[0_0_0_1px_rgb(23,13,41)]":"shadow-[0_0_0_2px_rgb(23,13,41)]"} rounded-[10px] hover:translate-y-[-5px] transition-all duration-400`}>
        {!authenticated && (
          <div className={`h-[200px] ${mode=="Light"?"shadow-[0_0_0_1px_rgb(23,13,41)]":"shadow-[0_0_0_2px_rgb(23,13,41)]"} rounded-[10px] p-[32px] justify-center flex flex-col items-center`}>
            <p className={`text-md mb-[16px] text-center ${mode === 'Light'?'text-[rgba(0,0,0,0.7)]':mode === "Dark"?'text-[rgba(255,255,255,0.5)] ':'text-black'}`}>
              Please login to view your generated images
            </p>
            <p className="text-[#8740E5]" onClick={()=>setLoginStatus(true)}>
              Login Now
            </p>
          </div>
        )}

        {authenticated && (images.length>0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-5">
            {images.map(({ imageUrl,publicId }, index) => (
              <div key={index} className="relative">
                <img className="rounded-[10px]" src={imageUrl} alt={`Image ${index}`} />

                {/* Dots icon */}
                <div
                  className="absolute right-0 top-2 text-2xl text-black cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedIndex(index === clickedIndex ? null : index);
                  }}
                >
                  <HiOutlineDotsVertical />
                </div>

                {/* Options menu */}
                {clickedIndex === index && (
                  <div className="absolute top-10 right-[-50px] shadow-[0_0_0_0.3px_#6D28D9] p-[3px] rounded-[10px] bg-[black] z-10">

                      <div className="hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]" onClick={() => handleDownload(imageUrl)}>
                        Download
                      </div>

                      <div className="hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"  onClick={()=>handleDelete(publicId)}>
                        Delete
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
