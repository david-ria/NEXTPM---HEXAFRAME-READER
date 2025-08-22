export function normalizeHexToBytes(input: string): Uint8Array {
  // Accepte "81 17 00 F0", "0x81,0x17,...", "811700F0"
  const cleaned = input
    .replace(/0x/gi, "")
    .replace(/[^0-9a-fA-F]/g, "")
    .toLowerCase();

  if (cleaned.length % 2 !== 0) {
    throw new Error("Hex string has odd length after normalization.");
  }

  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}
