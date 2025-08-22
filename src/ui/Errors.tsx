import React from "react";

export default function Errors({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-4 p-3 rounded bg-red-50 text-red-800 border border-red-200">
      {message}
    </div>
  );
}
