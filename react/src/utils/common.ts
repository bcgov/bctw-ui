/** 
 * @param {K} key
 * @param {T} object of type T
 * given a property name of an object T, return its type.
 * let x = { foo: 10, bar: "hello!" };
 * getProperty(x, "foo"); // number
**/
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]; // Inferred type is T[K]
}

export {
  getProperty,
}