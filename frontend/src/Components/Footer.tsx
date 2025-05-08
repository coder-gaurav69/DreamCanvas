import React from "react";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaRegImage } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { MdOutlineLineStyle } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { HiOutlineDocument } from "react-icons/hi2";
import { FaPenFancy } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { BsFillPassportFill } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full h-fit text-white bg-[#111827] py-[48px] px-[16px] sm:px-[32px]">
      <div className="flex flex-col items-center mb-[40px]">
        <h1 className="animi text-[30px] sm:text-[36px] text-transparent pb-[4px] font-extrabold bg-linear-to-r from-[#6D28D9] to-[#A252F0] bg-clip-text">
          DreamCanvas
          <div className="line" />
        </h1>
        <p className="mt-[12px] text-center text-[14px] sm:text-[16px] text-[rgba(255,255,255,0.5)]">
          Transform your imagination into stunning visuals with our AI-powered
          image generation platform.
        </p>
        <div className="flex gap-5 sm:gap-8 text-[20px] mt-[24px]">
          <div className="p-[10px] bg-[#1F2937] rounded-full hover:shadow-[inset_0_0_0_0.3px_#6D28D9] hover:text-[#6D28D9] transition-colors duration-500 delay-75">
            <FaTwitter />
          </div>
          <div className="p-[10px] bg-[#1F2937] rounded-full hover:shadow-[inset_0_0_0_0.3px_#6D28D9] hover:text-[#6D28D9] transition-colors duration-500 delay-75">
            <FaInstagram />
          </div>
          <div className="p-[10px] bg-[#1F2937] rounded-full hover:shadow-[inset_0_0_0_0.3px_#6D28D9] hover:text-[#6D28D9] transition-colors duration-500 delay-75">
            <FaGithub />
          </div>
        </div>
      </div>

      <div className="mt-[40px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-[#8F8F9A]">
        <div className="p-5 flex flex-col gap-3 shadow-[0_0_0_1px_#27272A] bg-[#151D2C] rounded-[15px]">
          <h1 className="text-[#6D28D9] font-bold text-xl text-xl">Features</h1>
          <div className="flex items-center gap-3  hover:text-[#6D28D9] ">
            <IoDocumentTextOutline />
            <p>Text to Image</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <MdOutlineLineStyle />
            <p>Style Options</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaRegImage />
            <p>Image Gallery</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 shadow-[0_0_0_1px_#27272A] bg-[#151D2C] rounded-[15px]">
          <h1 className="text-[#6D28D9] font-bold text-xl text-xl">Support</h1>
          <div className="flex items-center gap-3  hover:text-[#6D28D9] ">
            <FaBookOpen />
            <p>Documentation</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaEye />
            <p>Guides</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaRegCircleQuestion />
            <p>FAQs</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 shadow-[0_0_0_1px_#27272A] bg-[#151D2C] rounded-[15px]">
          <h1 className="text-[#6D28D9] font-bold text-xl text-xl">Company</h1>
          <div className="flex items-center gap-3  hover:text-[#6D28D9] ">
            <HiOutlineDocument />
            <p>About</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaPenFancy />
            <p>Blog</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaBriefcase />
            <p>Jobs</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 shadow-[0_0_0_1px_#27272A] bg-[#151D2C] rounded-[15px]">
          <h1 className="text-[#6D28D9] font-bold text-xl text-xl">Legal</h1>
          <div className="flex items-center gap-3  hover:text-[#6D28D9] ">
            <FaLock />
            <p>Privacy</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <BsFillPassportFill />
            <p>Terms</p>
          </div>
          <div className="flex items-center gap-3  hover:text-[#6D28D9]">
            <FaVideo />
            <p>Licensing</p>
          </div>
        </div>
      </div>

      <div className="mt-[48px] flex flex-col justify-center items-center pt-[32px]">
        {/* <div className="h-[1px] w-[50px] shadow-[inset_2px_0px_0px_2px_#6D28D9] rounded-l-[30px]"></div> */}
        <div className="flex items-center justify-center mb-[32px]">
          <div className="relative w-[80%] h-[1px]">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#6D28D9] to-transparent"></div>
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#6D28D9] to-transparent"></div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm text-center">
          © 2025&nbsp;
          <span className="text-[#6D28D9]">
            DreamCanvas AI
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
