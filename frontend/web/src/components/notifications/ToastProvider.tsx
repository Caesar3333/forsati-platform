"use client";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToastProviderProps {
  locale: "ar" | "en";
}

export default function ToastProvider({ locale }: ToastProviderProps) {
  const isRTL = locale === "ar";

  return (
    <ToastContainer
      position={isRTL ? "top-left" : "top-right"}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={isRTL}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Slide}
      toastClassName="!rounded-lg !shadow-lg"
      bodyClassName="!text-sm !font-medium"
      progressClassName="!bg-white/30"
    />
  );
}
