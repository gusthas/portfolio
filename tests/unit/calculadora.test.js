const calculadora = require("../../models/calculadora.js");

test("Somar 2 + 2 deve retornar 4", () => {
  const result = calculadora.somar(2, 2);
  console.log(result);
  expect(result).toBe(4);
});
