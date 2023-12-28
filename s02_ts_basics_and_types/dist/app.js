"use strict";
const hobbies = ['Sports', 'Cooking'];
const activeHobbies = ['Hiking'];
activeHobbies.push(...hobbies);
// const activeHobbies = ['Hiking', ...hobbies];
const person = {
    name: 'Max',
    age: 30,
};
// We're copying the pointer/reference of the person object in memory to this copiedPerson constant
const copiedPersonShallow = person;
// To create a real copy
const copiedPersonDeep = Object.assign({ car: "Ford" }, person);
console.log(copiedPersonDeep);
//# sourceMappingURL=app.js.map