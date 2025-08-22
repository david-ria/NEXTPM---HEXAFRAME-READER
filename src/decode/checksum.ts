/** NextPM simple protocol checksum:
 * sum all bytes except checksum, then (0x100 - (sum % 256)) & 0xFF
 */
export function sum8Complement(bytes: Uint8Array, withoutLast = true): number {
  const end = withoutLast ? bytes.length - 1 : bytes.length;
  let sum = 0;
  for (let i = 0; i < end; i++) {
    sum = (sum + bytes[i]) & 0xFF;
  }
  return (0x100 - (sum & 0xFF)) & 0xFF;
}
