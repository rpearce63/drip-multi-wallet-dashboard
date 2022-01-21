import Web3 from "web3";

export const convertDrip = (drip, dripPrice, showDollarValues) => {
  const priceOfDrip = dripPrice || 1;
  const converted = parseFloat(
    //new Web3().utils.fromWei(`${drip}`)
    (Math.round((drip / Math.pow(10, 18)) * 1000) / 1000) *
      (showDollarValues ? priceOfDrip : 1)
  ).toFixed(3);
  return showDollarValues ? formatCurrency(converted) : converted;
};

export const convertBnb = (bnbAmt, bnbPrice, showDollarValues) => {
  const converted = parseFloat(bnbAmt / 10e17).toFixed(3);

  return showDollarValues ? formatCurrency(converted * bnbPrice) : converted;
};

export const convertREV = (revAmt, revPrice, showDollarValues) => {
  return showDollarValues
    ? formatCurrency(revAmt * revPrice)
    : parseFloat(revAmt).toFixed(2);
};

export const convertTokenToUSD = (tokenAmt, tokenPrice, showDollarValues) => {
  return showDollarValues
    ? formatCurrency(tokenAmt * tokenPrice)
    : parseFloat(tokenAmt).toFixed(2);
};

export const formatCurrency = (amt) => {
  return (
    "$" +
    parseFloat(Math.round(amt * 100) / 100)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
};

export const formatPercent = (amt) => {
  return parseFloat(amt * 100).toFixed(2);
};

export const shortenAddress = (address) =>
  `${address.substr(0, 5)}...${address.slice(-4)}`;

export const backupData = () => {
  const data = localStorage.getItem("dripAddresses");
  const element = document.createElement("a");
  const file = new Blob([data], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = "dashboardAddresses.json";
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
};

export const findFibIndex = (n) => {
  if (n < 2) return 0;
  const num = n;

  const fibo = 2.078087 * parseFloat(Math.log(num)) + 1.672276;

  // Returning value of index adjusted for ignored fib values 0,1,1

  return parseInt(fibo) - 2;
};
