import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../ContextApi/globalVariable";
import { HiOutlineDotsVertical } from "react-icons/hi";

const Gallery = () => {
  const { authenticated, setActive, mode, setLoginStatus, images, setImages , handleGetAllImages} =
    useContext(GlobalContext);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  // for deleting images
  const handleDelete = async (publicId: string): Promise<void> => {
    try {
      // console.log(publicId);
      const url = `${import.meta.env.VITE_BACKEND_URL}/delete-image`;

      const config = {
        data: {
          public_id: publicId,
        },
        withCredentials: true,
      };

      const response = await axios.delete(url, config);

      setImages(images.filter((e: any, index: any) => e.publicId != publicId));
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // function for download
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = (await axios.get(imageUrl, {
        responseType: "blob",
      })) as any;

      const blob = new Blob([response.data]);

      // Generate random file name with correct extension
      const extension = imageUrl.split(".").pop()?.split(/\#|\?/)[0] || "jpg";
      const randomName = `image-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}.${extension}`;

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
  useEffect(() => {
    //on mounting i will set the
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
    setActive({
      Create: false,
      Gallery: true,
    });

    const close = () => {
      setClickedIndex(null);
    };

    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  return (
    <div className="pt-[120px] px-4 pb-[80px] sm:px-6 flex flex-col items-center justify-center w-full lg:w-5xl m-auto">
      <div className="mb-[48px] flex flex-col justify-center items-center w-full">
        <h1 className="colorAnimation text-4xl lg:text-5xl mb-[16px] leading-[50px] text-center">
          Your Gallery
        </h1>
        <p
          className={`font-semibold text-center text-[16px] sm:text-[20px] ${
            mode === "Light"
              ? "text-[rgba(0,0,0,0.7)]"
              : "text-[rgba(255,255,255,0.5)] "
          }`}
        >
          View, download, and manage all your AI-generated images. Create
          stunning new visuals or variations to expand your collection.
        </p>
      </div>

      {/*Gallery container */}
      <div
        className={`p-[32px] w-full ${
          mode == "Light"
            ? "shadow-[0_0_0_1px_rgb(23,13,41)]"
            : "shadow-[0_0_0_2px_rgb(23,13,41)]"
        } rounded-[10px] hover:translate-y-[-5px] transition-all duration-400`}
      >
        {!authenticated && (
          <div
            className={`h-[200px] ${
              mode == "Light"
                ? "shadow-[0_0_0_1px_rgb(23,13,41)]"
                : "shadow-[0_0_0_2px_rgb(23,13,41)]"
            } rounded-[10px] p-[32px] justify-center flex flex-col items-center`}
          >
            <p
              className={`text-md mb-[16px] text-center ${
                mode === "Light"
                  ? "text-[rgba(0,0,0,0.7)]"
                  : "text-[rgba(255,255,255,0.5)] "
              }`}
            >
              Please login to view your generated images
            </p>
            <p
              className="text-[#8740E5] cursor-pointer"
              onClick={() => setLoginStatus(true)}
            >
              Login Now
            </p>
          </div>
        )}

        {authenticated && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-5">
            {images.map(({ imageUrl, publicId }, index) => (
              <div key={index} className="relative">
                <img
                  className="rounded-[10px]"
                  src={imageUrl}
                  alt={`Image ${index}`}
                />

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
                  <div className="absolute top-10 right-[-50px] shadow-[0_0_0_0.3px_#6D28D9] p-[3px] rounded-[10px] bg-[black] z-10 flex flex-col ">
                    <button
                      className="hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
                      onClick={() => handleDownload(imageUrl)}
                    >
                      Download
                    </button>

                    <button
                      className="hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
                      onClick={() => handleDelete(publicId)}
                    >
                      Delete
                    </button>
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
