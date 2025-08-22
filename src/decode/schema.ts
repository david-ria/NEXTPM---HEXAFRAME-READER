export type Field = {
  name: string;
  type: "uint8" | "uint16";
  unit?: string;
  scale?: number; // multiplier appliqué après décodage (ex: 0.1)
};

export type Schema = {
  id: string;
  label: string;
  startByte: number;   // ex: 0x81
  command: number;     // ex: 0x17
  payload: Field[];    // champs numériques du payload
  hasStatusByte?: boolean; // protocole simple: 1 octet avant le checksum
};

function u16be(b0: number, b1: number): number {
  return (b0 << 8) | b1;
}

export function decodeWithSchema(bytes: Uint8Array, schema: Schema) {
  if (bytes.length < 3) throw new Error("Frame too short.");
  if (bytes[0] !== schema.startByte) throw new Error("Invalid start byte.");
  if (bytes[1] !== schema.command) throw new Error("Unexpected command byte.");

  // Calcul de la longueur attendue: start(1) + cmd(1) + payload + status? + checksum(1)
  let expected = 2;
  let payloadLen = 0;
  for (const f of schema.payload) {
    payloadLen += f.type === "uint8" ? 1 : 2;
  }
  expected += payloadLen;
  if (schema.hasStatusByte) expected += 1;
  expected += 1; // checksum

  if (bytes.length !== expected) {
    throw new Error(`Unexpected frame length. Got ${bytes.length}, expected ${expected}.`);
  }

  // Décodage du payload
  let offset = 2;
  const fields: Record<string, string | number> = {};
  for (const f of schema.payload) {
    let raw: number;
    if (f.type === "uint8") {
      raw = bytes[offset];
      offset += 1;
    } else {
      raw = u16be(bytes[offset], bytes[offset + 1]);
      offset += 2;
    }
    const val = (f.scale ?? 1) * raw;
    fields[f.name] = f.unit ? `${val} ${f.unit}` : val;
  }

  const status = schema.hasStatusByte ? bytes[offset++] : undefined;
  const checksum = bytes[offset];

  return { fields, status, checksum };
}
