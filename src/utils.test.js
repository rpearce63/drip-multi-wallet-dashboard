import { findFibIndex, calculateTime } from "./api/utils";
import Web3 from "web3";

const web3 = new Web3("");

test("should find the fib index", () => {
  expect(findFibIndex(1)).toBe(0);
  expect(findFibIndex(2)).toBe(1);
  expect(findFibIndex(2.1)).toBe(1);
  expect(findFibIndex(2.9)).toBe(1);
  expect(findFibIndex(3)).toBe(2);
  expect(findFibIndex(3.5)).toBe(2);
  expect(findFibIndex(4)).toBe(2);
  expect(findFibIndex(4.5)).toBe(2);
  expect(findFibIndex(5)).toBe(3);
  expect(findFibIndex(8)).toBe(4);
  expect(findFibIndex(13)).toBe(5);
  expect(findFibIndex(33)).toBe(6);
  expect(findFibIndex(89)).toBe(9);
  expect(findFibIndex(376.999)).toBe(11);
  expect(findFibIndex(1598)).toBe(15);
});

test("should convert large numbers", () => {
  const amount = 1000;
  const wei = web3.utils.toWei(amount + "");
  expect(web3.utils.fromWei(wei) === 1000);
});

test("should format date", () => {
  formatDatestamp();
});
const formatDatestamp = () => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getTime()}`;
  console.log(formattedDate);
};

test("should calculate the max wallet days", () => {
  const result = calculateTime(8053.88, 27398, 0.01);
  console.log(result);
});
