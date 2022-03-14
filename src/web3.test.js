const Web3 = require("web3");
const web3 = new Web3(
  Web3.givenProvider || "https://bsc-dataseed.binance.org/"
);

test("it should convert to wei and back", () => {
  const amount = ".05";
  const weiAmt = web3.utils.toWei(amount, "ether");
  expect(weiAmt).toBe("50000000000000000");
  expect(web3.utils.fromWei(weiAmt)).toBe("0.05");
});
