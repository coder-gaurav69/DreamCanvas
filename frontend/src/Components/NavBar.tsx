import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaRegMoon } from "react-icons/fa";
import { HiMiniComputerDesktop } from "react-icons/hi2";
import { MdOutlineDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../ContextApi/globalVariable";
import { FaUserCircle } from "react-icons/fa";

const NavBar = () => {
  const navigate = useNavigate();
  const { loginStatus, setLoginStatus } = useContext(GlobalContext);
  const { authenticated, setAuthenticated } = useContext(GlobalContext);
  const [userIconBtn, setUserIconBtn] = useState<Boolean>(false);
  const { active, setActive, mode, setMode } = useContext(GlobalContext);

  const handleActive = (e: React.SyntheticEvent<HTMLAnchorElement>): void => {
    const value = e.currentTarget.dataset.key;
    setActive({
      Create: value === "Create",
      Gallery: value === "Gallery",
    });
  };

  const [toggleBtn, setToggleBtn] = useState<Boolean>(false);
  const [toggleMenu, setToggleMenu] = useState<Boolean>(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setToggleBtn(false);
      setToggleMenu(false);
      setUserIconBtn(false);
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // logout function
  const handleLogout = async (): Promise<void> => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`;

      const response = await axios.post(url, null, {
        withCredentials: true,
      });

      console.log(response.data.message);
      setAuthenticated(false);
      setLoginStatus(false);
    } catch (error: any) {
      console.error(error?.response?.data?.message);
    }
  };

  // function for  mode change
  const handleMode = (value: string): void => {
    switch (value) {
      case "Light":
        setMode("Light")
        break;
      case "Dark":
        setMode(
         "Dark"
        );
        break;
      default:
        setMode(
          "System"
        );
        break;
    }
  };

  useEffect(() => {
    console.log(mode);
  }, [mode]);

  return (
    <nav className={`w-full h-[64px] px-[16px] sm:px-[32px] flex justify-between items-center cursor-pointer shadow-[0_1px_10px_1px_#19202B] fixed backdrop-blur-2xl z-10 ${
            mode === "Light"
              ? "bg-white"
              :mode === "Dark"
              ?"bg-black"
              :"bg-green-200"
          }`}>
      <h1 className="colorAnimation text-[24px]">DreamCanvas</h1>

      {/* for larger devices */}
      <div className="hidden md:flex flex items-center justify-center">
        {/* Create Button */}
        <Link
          to={"/"}
          className={`py-[8px] px-[12px] ml-[32px] ${
            !active.Create ? mode === "Light"
              ? "bg-white"
              :mode === "Dark"
              ?"hover:bg-[#18181A]"
              :"bg-green-200":''
          }
           hover:text-[#6D28D9] ${
            active.Create ? "text-[#6D28D9]" :
              mode === "Light"
                ? "text-black"
                :mode === "Dark"
                ?"text-white"
                :"bg-green-200"
            }
          } ${
            active.Create ? "[box-shadow:0px_2px_0px_#6D28D9]" : ""
          } rounded-[10px]`}
          data-key="Create"
          onClick={handleActive}
        >
          Create
        </Link>

        {/* Gallery Button */}
        <Link
          to={"/gallery"}
          className={`py-[8px] px-[12px] ml-[32px] ${
            !active.Gallery ? mode === "Light"
              ? "bg-white"
              :mode === "Dark"
              ?"hover:bg-[#18181A]"
              :"bg-green-200":''
          }
          } rounded-[10px] hover:text-[#6D28D9] ${
            active.Gallery ? "[box-shadow:0px_2px_0px_#6D28D9]" : ""
          } ${
            active.Gallery ? "text-[#6D28D9]" :
              mode === "Light"
                ? "text-black"
                :mode === "Dark"
                ?"text-white"
                :"bg-green-200"
            }`}
          data-key="Gallery"
          onClick={handleActive}
        >
          Gallery
        </Link>

        {/* Theme Toggle */}
        <div
          className={`flex items-center justify-center w-[32px] h-[32px] ml-[30px] rounded-full shadow-[0_0_0_0.3px_#6D28D9]
           ${mode === "Light"
                ? "text-black hover:bg-[rgba(0,0,0,0.1)]"
                :mode === "Dark"
                ?"text-white hover:bg-[#18181A]"
                :"bg-green-200"
            } hover:text-[#6D28D9] transition-all duration-500 text-[12px]`}
          onClick={(e) => {
            e.stopPropagation();
            setToggleBtn((prev) => !prev);
            setToggleMenu(false);
            setUserIconBtn(false);
          }}
        >
          {mode == 'Light'?<CiLight className="text-lg" />:mode=='Dark'?<MdOutlineDarkMode className="text-lg"/>:<HiMiniComputerDesktop className="text-lg"/>}
          {/* <FaRegMoon /> */}
        </div>

        {toggleBtn && (
          <div
            className={`flex flex-col absolute top-[70px] ${
              !authenticated ? "right-[190px]" : "right-10"
            } text-white shadow-[0_0_0_0.3px_#6D28D9] p-[3px] rounded-[10px] bg-[black] z-10`}
          >
            <div
              className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
              onClick={() => handleMode("Light")}
            >
              <CiLight />
              <p>Light</p>
            </div>
            <div
              className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
              onClick={() => handleMode("Dark")}
            >
              <MdOutlineDarkMode />
              <p>Dark</p>
            </div>
            <div
              className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
              onClick={() => handleMode("System")}
            >
              <HiMiniComputerDesktop />
              <p>System</p>
            </div>
          </div>
        )}

        {!authenticated && (
          <div className="flex">
            {/* Login Button */}
            <div
              className={`py-[8px] px-[16px] ml-[32px] ${mode === "Light"
                ? "bg-white text-black"
                :mode === "Dark"
                ?"bg-[#18181A] text-white"
                :"bg-green-200 text-green"
            }   rounded-[10px] hover:text-[#6D28D9]`}
              onClick={() => setLoginStatus(true)}
            >
              Login
            </div>

            {/* Register Button */}
            <div
              className="py-[8px] px-[16px] ml-[8px] bg-[#6D28D9] text-white rounded-[10px] hover:bg-[#6c28d9e8]"
              onClick={() => {
                setActive({ Create: false, Gallery: false });
                navigate("/register");
              }}
            >
              Register
            </div>
          </div>
        )}

        {/* user icon when authenticated */}
        {authenticated && (
          <div
            className="flex flex-col justify-center items-center ml-[30px] mr-[10px] text-[30px]"
            onClick={(e) => {
              e.stopPropagation();
              setUserIconBtn(!userIconBtn);
              setToggleMenu(false);
              setToggleBtn(false);
            }}
          >
            <FaUserCircle className={`${mode === "Light"
                ? "text-black"
                :mode === "Dark"
                ?"text-white"
                :"bg-green-200"
            }`} />
          </div>
        )}

        {/* option for user icon btn */}
        {userIconBtn && (
          <div className="flex flex-col absolute top-[70px] right-2 w-[150px] shadow-[0_0_0_0.3px_#6D28D9] p-[3px] rounded-[10px] bg-[black] z-10">
            <div className="flex gap-3 items-center justify-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]">
              Profile
            </div>
            <div
              className="flex gap-3 items-center justify-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]"
              onClick={handleLogout}
            >
              Log Out
            </div>
          </div>
        )}
      </div>

      {/* for smaller devices */}
      <div className="md:hidden flex items-center">
        {/* Theme Toggle */}
        <div
          className={`flex items-center justify-center w-[36px] h-[36px] ml-[32px] rounded-full border-[1px] border-[#6D28D9] hover:text-[#6D28D9] ${mode === "Light"
                ? "text-black hover:bg-[rgba(0,0,0,0.1)]"
                :mode === "Dark"
                ?"text-white hover:bg-[#18181A]"
                :"bg-green-200"
            } transition-all duration-500 text-[12px]}`}
          onClick={(e) => {
            e.stopPropagation();
            setToggleBtn((prev) => !prev);
            setToggleMenu(false);
          }}
        >
          {mode == 'Light'?<CiLight className="text-lg" />:mode=='Dark'?<MdOutlineDarkMode className="text-lg"/>:<HiMiniComputerDesktop className="text-lg"/>}
          {/* <FaRegMoon /> */}
        </div>

        {toggleBtn && (
          <div className="flex flex-col  w-full absolute top-[65px] right-0 text-white shadow-[0_0_0_0.3px_#6D28D9] p-[3px] bg-[black] z-10">

            <div className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]" onClick={() => handleMode("Light")}>
              <CiLight />
              <p>Light</p>
            </div>
            <div className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]" onClick={() => handleMode("Dark")}>
              <MdOutlineDarkMode />
              <p>Dark</p>
            </div>
            <div className="flex gap-3 items-center hover:bg-[rgba(255,255,255,0.2)] py-2 pr-8 pl-2 rounded-[10px]" onClick={() => handleMode("System")}>
              <HiMiniComputerDesktop />
              <p>System</p>
            </div>
          </div>
        )}

        {/* Hamburger Menu */}
        <div
          className={`flex items-center p-[8px] ml-[8px] text-[24px] ${mode === "Light"
                ? "text-black"
                :mode === "Dark"
                ?"text-white"
                :"text-green"
            }`}
          onClick={(e) => {
            e.stopPropagation();
            setToggleMenu((prev) => !prev);
            setToggleBtn(false);
          }}
        >
          <GiHamburgerMenu />
        </div>
      </div>

      {/* Hamburger Dropdown Menu */}
      {toggleMenu && (
        <div className={`flex flex-col absolute top-[60px] left-0 w-[100%] p-[8px_8px_12px_8px] md:hidden text-white bg-black`}>
          <Link
            to={"/"}
            className={`py-[8px] px-[12px] mt-[4px] rounded-[10px] hover:text-[rgb(109,40,217)] ${
              active.Create ? "bg-[rgb(24,24,26)]" : ""
            }
            ${!active.Create ? "hover:bg-[rgba(24,24,26,0.5)]" : ""}`}
            onClick={handleActive}
            data-key="Create"
          >
            Create
          </Link>

          <Link
            to={"/gallery"}
            className={`py-[8px] px-[12px] mt-[4px] rounded-[10px] hover:text-[rgb(109,40,217)] ${
              active.Gallery ? "bg-[rgb(24,24,26)]" : ""
            }
             ${!active.Gallery ? "hover:bg-[rgba(24,24,26,0.5)]" : ""}`}
            data-key="Gallery"
            onClick={handleActive}
          >
            Gallery
          </Link>

          {!authenticated && (
            <div className="p-[8px] mt-[4px] text-center font-bold">
              <div
                className="py-[8px] px-[12px] bg-[rgb(24,24,26)] rounded-[10px] mt-[4px] hover:text-[rgb(109,40,217)]"
                onClick={() => {
                  setLoginStatus(true);
                  // navigate("/login");
                }}
              >
                Login
              </div>
              <div
                className="py-[8px] px-[12px] bg-[rgb(109,40,217)] hover:bg-[rgba(109,40,217,0.8)] mt-[8px] rounded-[10px]"
                onClick={() => {
                  setActive({ Create: false, Gallery: false });
                  navigate("/register");
                }}
              >
                Register
              </div>
            </div>
          )}

          {authenticated && (
            <div className="p-[8px] mt-[4px] text-center font-bold">
              <div className="py-[8px] px-[12px] bg-[rgb(24,24,26)] rounded-[10px] mt-[4px] hover:text-[rgb(109,40,217)]">
                Profile
              </div>
              <div
                className="py-[8px] px-[12px] bg-[rgb(109,40,217)] hover:bg-[rgba(109,40,217,0.8)] mt-[8px] rounded-[10px]"
                onClick={handleLogout}
              >
                Log out
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
