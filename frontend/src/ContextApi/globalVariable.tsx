import axios from "axios";
import { createContext, useState, ReactNode, useEffect } from "react";

const GlobalContext = createContext<any>(null);

type ImageObject = {
  imageUrl: string;
  publicId: string;
  timeStamp: Date;
};

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [images, setImages] = useState<ImageObject[]>([]);

  const [active, setActive] = useState({
    Create: true,
    Gallery: false,
  });

  const [mode, setMode] = useState<"Light" | "Dark">("Dark");

  // ============================
  // 🔥 FETCH IMAGES FUNCTION
  // ============================
  const handleGetAllImages = async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/getImages`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      const imagesList = (response as any)?.data?.data?.imagesList ?? [];
      console.log(response)

      if (!Array.isArray(imagesList)) return;

      const sortedImages = [...imagesList].sort(
        (a, b) =>
          new Date(b.timeStamp).getTime() -
          new Date(a.timeStamp).getTime()
      );

      setImages(sortedImages);
    } catch (error) {
      console.error("⚠ Error fetching images:", error);
    }
  };

  // ============================
  // 🔥 VALIDATE USER AUTH
  // ============================
  useEffect(() => {
    let intervalId: any;

    const checkValidation = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/validate`;

        const response = await axios.post(url, null, {
          withCredentials: true,
        });

        setProfileImage((response as any)?.data?.profileImage);
        setAuthenticated(true);
      } catch (error) {
        setAuthenticated(false);
      }
    };

    // run immediately on load
    checkValidation();

    // keep session alive every 5 mins only if logged in
    if (authenticated) {
      intervalId = setInterval(checkValidation, 300000);
    }

    return () => clearInterval(intervalId);
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    handleGetAllImages();
  }, [authenticated,active.Gallery]);

  return (
    <GlobalContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        loginStatus,
        setLoginStatus,
        active,
        setActive,
        mode,
        setMode,
        profileImage,
        imageUrl,
        setImageUrl,
        images,
        setImages,
        handleGetAllImages,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };
