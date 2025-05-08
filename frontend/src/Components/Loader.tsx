import React from "react";

const Loader = () => {
  return (
    <div className="w-[215.48px] h-[44px] flex justify-center items-center">
      <div
        className="w-[30px] h-[30px] flex justify-center items-center rounded-full animate-spin "
        style={{
          background: "conic-gradient(white 0deg 150deg, #6D28D9 50deg 360deg)",
        }}
      >
        <div className="w-[25px] h-[25px] bg-[#6D28D9] rounded-full "></div>
      </div>
    </div>
  );
};

export default Loader;
