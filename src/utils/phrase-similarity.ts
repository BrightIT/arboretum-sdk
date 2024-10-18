import { stringSimilarity } from "./string-similarity";

export const phraseSimilarity = (phrase: string, value: string): number => {
  const s1 = stringSimilarity(phrase, value);
  const s2 = stringSimilarity(phrase, value.slice(0, phrase.length));
  return s1 > s2 ? s1 : s2;
};
