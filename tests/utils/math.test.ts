import { add } from "../../utils/helpers";

describe("Math Utils", () => {
  test("should add two numbers", () => {
    const result = add(4, 6);
    expect(result).toBe(10);
  });
});
