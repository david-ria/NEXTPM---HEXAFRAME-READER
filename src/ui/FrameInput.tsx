import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onDecode: () => void;
};

export default function FrameInput({ value, onChange, onDecode }: Props) {
  return (
    <div className="space-y-2">
      <label className="font-semibold">Paste your hex frame</label>
      <textarea
        className="w-full h-28 p-3 rounded border border-gray-300 focus:outline-none"
        placeholder="Example: 81 17 00 F0 01 2C 69"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="px-4 py-2 rounded bg-black text-white"
        onClick={onDecode}
      >
        Decode
      </button>
    </div>
  );
}
