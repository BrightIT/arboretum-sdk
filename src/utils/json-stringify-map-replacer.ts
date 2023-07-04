export const jsonStrigifyMapReplacer = (_: any, value: any) => {
  if (value instanceof Map) {
    return { __type: 'Map', value: Object.fromEntries(value) };
  }
  return value;
};
