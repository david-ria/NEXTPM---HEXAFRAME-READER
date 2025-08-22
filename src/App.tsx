import React, { useState } from "react";
import FrameInput from "./ui/FrameInput";
import ResultTable from "./ui/ResultTable";
import Errors from "./ui/Errors";
import { normalizeHexToBytes } from "./decode/hex";
import { sum8Complement } from "./decode/checksum";
import { decodeWithSchema, type Schema } from "./decode/schema";

// Schémas supportés (protocole simple NextPM)
const SCHEMAS: Schema[] = [
  {
    id: "nextpm@0x16@1.0.0",
    label: "0x16 – Status (simple protocol, 1 byte)",
    startByte: 0x81,
    command: 0x16,
    payload: [],
    hasStatusByte: true
  },
  {
    id: "nextpm@0x17@1.0.0",
    label: "0x17 – Concentrations µg/m³ (PM1, PM2.5, PM10)",
    startByte: 0x81,
    command: 0x17,
    payload: [
      { name: "PM1", type: "uint16", unit: "µg/m³", scale: 0.1 },
      { name: "PM2.5", type: "uint16", unit: "µg/m³", scale: 0.1 },
      { name: "PM10", type: "uint16", unit: "µg/m³", scale: 0.1 }
    ],
    hasStatusByte: false
  },
  {
    id: "nextpm@0x25@1.0.0",
    label: "0x25 – 5 bins (Nb/L)",
    startByte: 0x81,
    command: 0x25,
    payload: [
      { name: "Bin1", type: "uint16", unit: "Nb/L" },
      { name: "Bin2", type: "uint16", unit: "Nb/L" },
      { name: "Bin3", type: "uint16", unit: "Nb/L" },
      { name: "Bin4", type: "uint16", unit: "Nb/L" },
      { name: "Bin5", type: "uint16", unit: "Nb/L" }
    ],
    hasStatusByte: false
  }
];

function findSchema(cmd: number): Schema | undefined {
  return SCHEMAS.find((s) => s.command === cmd);
}

export default function App() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<{ name: string; value: string | number }[]>(
    []
  );
  const [meta, setMeta] = useState<{
    command?: string;
    status?: string;
    checksum?: string;
  }>({});

  function decode() {
    setError(null);
    setRows([]);
    setMeta({});
    try {
      const bytes = normalizeHexToBytes(input);
      if (bytes.length < 3) throw new Error("Frame too short.");
      if (bytes[0] !== 0x81) throw new Error("Invalid start byte (expected 0x81).");

      const cmd = bytes[1];
      const schema = findSchema(cmd);
      if (!schema) throw new Error("Unknown command: 0x" + cmd.toString(16));

      const expected = sum8Complement(bytes, true);
      const provided = bytes[bytes.length - 1];
      if (expected !== provided)
        throw new Error(
          `Checksum mismatch (expected 0x${expected.toString(
            16
          )}, got 0x${provided.toString(16)}).`
        );

      const dec = decodeWithSchema(bytes, schema);

      const out: { name: string; value: string | number }[] = [];
      Object.entries(dec.fields).forEach(([k, v]) =>
        out.push({ name: k, value: v })
      );

      let statusText: string | undefined;
      if (typeof dec.status === "number") {
        const b = dec.status;
        const flags: string[] = [];
        if (b & 0x01) flags.push("Default/Sleep");
        if (b & 0x04) flags.push("Not Ready");
        statusText = `0x${b.toString(16).padStart(2, "0")} (${
          flags.join(", ") || "OK"
        })`;
      }

      setRows(out);
      setMeta({
        command: `0x${cmd.toString(16)}`,
        status: statusText,
        checksum: `0x${provided.toString(16).padStart(2, "0")}`
      });
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  const example = "81 17 00 7B 00 F0 01 2C DO";

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-900">{/* << ajouté */}
      <h1 className="text-2xl font-bold mb-4">Hex Frame Decoder (NextPM – MVP)</h1>
      <p className="mb-4 text-sm text-gray-900">{/* << remplacé */}
        Paste a simple-protocol frame (start=0x81). Supported: 0x16 (status), 0x17
        (PM µg/m³), 0x25 (5 bins Nb/L).
      </p>
      <button
        className="text-xs underline mb-2 text-gray-600"
        onClick={() => setInput(example)}
      >
        Load example
      </button>
      <FrameInput value={input} onChange={setInput} onDecode={decode} />
      <Errors message={error} />
      {!error && (
        <>
          <ResultTable title="Decoded fields" rows={rows} />
          <ResultTable
            title="Meta"
            rows={[
              ...(meta.command ? [{ name: "Command", value: meta.command }] : []),
              ...(meta.status ? [{ name: "Status", value: meta.status }] : []),
              ...(meta.checksum
                ? [{ name: "Checksum", value: meta.checksum }]
                : [])
            ]}
          />
        </>
      )}
      <div className="mt-8 text-xs text-gray-500">
        Checksum rule: (0x100 - (sum(bytes except checksum) % 256)) & 0xFF.
      </div>
    </div>
  );
}
