import React from "react";

export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-[9999]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[260px] px-4 py-3 rounded-lg shadow-lg text-sm animate-[fadeIn_0.3s_ease-out_forwards] transition-all duration-300
            ${
              toast.type === "success"
                ? "bg-[#3ce28a] text-white"
                : toast.type === "error"
                ? "bg-[#f05c74] text-white"
                : "bg-[#0d97fb] text-white"
            }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
