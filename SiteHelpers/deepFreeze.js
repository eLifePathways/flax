function deepFreeze(obj) {
  Object.freeze(obj);
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const propValue = obj[prop];
  
    if (
      propValue !== null &&
      (typeof propValue === 'object' || typeof propValue === 'function') &&
      !Object.isFrozen(propValue)
    ) {
      deepFreeze(propValue);
    }
  });
  
  return obj;
}
  
module.exports = deepFreeze
  