// TYPE
// type AddFn = (a: number, b: number) => number;

// INTERFACE (alternative)
interface AddFn {
  (a: number, b: number): number; // no method name, same as above
}

let add: AddFn;

add = (n1: number, n2: number) => {
  return n1 + n2;
};