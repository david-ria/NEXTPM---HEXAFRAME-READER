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
    hasStatusByte: true,
  },
  {
    id: "nextpm@0x17@1.0.0",
    label: "0x17 – Concentrations µg/m³ (PM1, PM2.5, PM10)",
    startByte: 0x81,
    command: 0x17,
    payload: [
      { name: "PM1", type: "uint16", unit: "µg/m³", scale: 0.1 },
      { name: "PM2.5", type: "uint16", unit: "µg/m³", scale: 0.1 },
      { name: "PM10", type: "uint16", unit: "µg/m³", scale: 0.1 },
    ],
    hasStatusByte: false,
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
      { name: "Bin4", type
