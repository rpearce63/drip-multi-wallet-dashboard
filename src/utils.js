export const convertDrip = (drip) => {
  return parseFloat(
    Math.round((drip / Math.pow(10, 18)) * 1000) / 1000
  ).toFixed(3);
};

export const formatCurrency = (amt) => {
  return parseFloat(Math.round(amt * 100) / 100).toFixed(2);
};

export const formatPercent = (amt) => {
  return parseFloat(Math.round(amt * 10000) / 100).toFixed(2);
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
