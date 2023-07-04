export const arrayToMap =
  <A, B = A>(id: (t: A) => string) =>
  (f: (a: A) => B) =>
  (arr: Array<A>): Map<string, B> =>
    new Map(arr.map((el) => [id(el), f(el)]));
