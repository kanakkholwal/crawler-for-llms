/**
 * Truncates a string to a specified number of bytes.
 *
 * @param {string} str - The string to truncate.
 * @param {number} bytes - The number of bytes to truncate the string to.
 * @returns {string} - The truncated string.
 */
export const truncateStringByBytes = (str: string, bytes: number): string => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

/**
 * Splits an array into chunks of a specified size.
 *
 * @template T
 * @param {T[]} arr - The array to split into chunks.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {T[][]} - An array of chunks.
 */
export const sliceIntoChunks = <T>(arr: T[], chunkSize: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};