export const groupBy =
  <T>(key: (t: T) => string) =>
  (xs: Array<T>): Map<string, Array<T>> => {
    const seed: Map<string, Array<T>> = new Map();
    return xs.reduce((acc, x) => {
      const k = key(x);
      const empty: Array<T> = [];
      const v = acc.get(k) || empty;
      v.push(x);
      acc.set(k, v);
      return acc;
    }, seed);
  };
