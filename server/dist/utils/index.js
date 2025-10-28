// src/utils/index.ts
/**
 * Returns a random element from an array.
 */
export function pickRandom(arr) {
    if (arr.length === 0)
        return undefined;
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}
