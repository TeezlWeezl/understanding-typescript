// const userInput = null; // "DEFAULT"
const userInput = undefined; // "DEFAULT"
// const userInput = ''; // ''
const storedFalsyData = userInput || 'DEFAULT'; // ?? null, undefined and empty string
const storedNullishData = userInput ?? 'DEFAULT'; // ?? only null and undefined

console.log("Stored Falsy Data: " + storedFalsyData);
console.log("Stored Nullish Data: " + storedNullishData);