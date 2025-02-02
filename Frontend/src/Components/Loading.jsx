// src/components/Loader.js
import React from "react";

const Loader = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-100">
      <div className="w-[20vh] h-[20vh] border-16 border-t-8 border-blue-500 border-solid  rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
