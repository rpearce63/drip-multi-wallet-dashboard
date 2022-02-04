import Web3 from "web3";
import {
  FAUCET_ABI,
  FAUCET_ADDR,
  FOUNTAIN_ABI,
  FOUNTAIN_ADDR,
  BR34P_ABI,
  BR34P_ADDRESS,
  BASIC_TOKEN_ABI,
} from "./dripconfig";
//import { calcBNBPrice } from "./tokenPriceApi";
const flatten = require("flat").flatten;

export const getConnection = async () => {
  const web3 = await new Web3(
    Web3.givenProvider || "https://bsc-dataseed.binance.org/"
  );
  return web3;
};

export const getAccounts = async (web3) => {
  return await web3.eth.getAccounts();
};

export const getContract = async (web3) => {
  const contract = await new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
  return contract;
};

export const claimsAvailable = async (contract, account) => {
  try {
    const available = await contract.methods.claimsAvailable(account).call();
    return available;
  } catch (err) {
    console.log(err.message);
  }
};

export const getAirdrops = async (contract, account) => {
  try {
    return await contract.methods.airdrops(account).call();
  } catch (err) {
    console.log(err.message);
  }
};

export const getUserInfo = async (contract, account) => {
  try {
    return await contract.methods.users(account).call();
  } catch (err) {
    console.log(err.message);
  }
};

// export const getDripBalance = async (web3, account) => {
//   const contract = new web3.eth.Contract(DRIP_TOKEN_ABI, DRIP_TOKEN_ADDR);
//   const tokenBalance = await contract.methods.balanceOf(account).call();
//   return tokenBalance / 10e17;
// };

export const getBr34pBalance = async (web3, account) => {
  const contract = new web3.eth.Contract(BR34P_ABI, BR34P_ADDRESS);
  const tokenBalance = await contract.methods.balanceOf(account).call();
  return tokenBalance / 10e7;
};

// export const getREVBalance = async (web3, account) => {
//   const contract = new web3.eth.Contract(REV_ABI, REV_TOKEN_ADDRESS);
//   const tokenBalance = await contract.methods.balanceOf(account).call();
//   return tokenBalance / 10e17;
// };

export const getBnbBalance = async (web3, account) => {
  const balance = await web3.eth.getBalance(account);
  return balance / 10e17;
};

// export const getPL2Balance = async (web3, account) => {
//   const contract = new web3.eth.Contract(BASIC_TOKEN_ABI, PL2_TOKEN_ADDRESS);
//   const tokenBalance = await contract.methods.balanceOf(account).call();
//   return tokenBalance / 10e17;
// };

// export const getBUSDBalance = async (web3, account) => {
//   const contract = new web3.eth.Contract(
//     BASIC_TOKEN_ABI,
//     "0xe9e7cea3dedca5984780bafc599bd69add087d56"
//   );
//   const tokenBalance = await contract.methods.balanceOf(account).call();
//   return tokenBalance / 10e17;
// };

export const getTokenBalance = async (web3, account, tokenAddress) => {
  const contract = new web3.eth.Contract(BASIC_TOKEN_ABI, tokenAddress);
  const tokenBalance = await contract.methods.balanceOf(account).call();
  return tokenBalance / 10e17;
};

export const getDripPrice = async (web3) => {
  const contract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
  try {
    const dripBnbRatio = await contract.methods
      .getTokenToBnbInputPrice(1000000000000000000n)
      .call();

    const tokenBalance = await contract.methods.tokenBalance().call();

    const fetchBnbPrice = async () =>
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd"
      )
        .then((response) => response.json())
        .then((data) => data.wbnb.usd);
    const bnbPrice = await fetchBnbPrice();

    // const dripPcsPrice = await getDripPcsPrice();
    // const dripDexPrice = (dripBnbRatio * bnbPrice) / 10e17;
    // console.log("best price ", Math.max(dripPcsPrice, dripDexPrice));
    // console.log(dripBnbRatio, (dripPcsPrice / bnbPrice) * 10e17);
    // const bestDripPrice =
    //   dripDexPrice > dripPcsPrice
    //     ? dripBnbRatio
    //     : (dripPcsPrice / bnbPrice) * 10e17;
    //const bestPrice = await getBestDripPrice(web3);
    return [bnbPrice, dripBnbRatio, tokenBalance];
  } catch (err) {
    console.log(err.message);
  }
};

export const getBestDripPrice = async (web3) => {
  const pcsPrice = await getDripPcsPrice();
  const [bnbPrice, dripBnbRatio, tokenBalance] = await getDripPrice(web3);
  const dexPrice = (dripBnbRatio * bnbPrice) / 10e17;
  console.log(pcsPrice, dexPrice);
};

export const getUplineCount = async (contract, wallet) => {
  let upline = wallet,
    count = 0,
    stop = false;
  do {
    const uplineInfo = await getUserInfo(contract, upline);
    upline = uplineInfo.upline;
    if (upline.startsWith("0x000")) {
      stop = true;
    }
    count++;
  } while (!stop);

  return count - 1;
};

export const roll = async (account) => {
  console.log(account);
  const web3 = await getConnection();
  const contract = await getContract(web3);
  await contract.methods.roll().send({ from: account });
};

export const getDownline = async (account) => {
  const fetchDownline = async (account) =>
    fetch(`https://api.drip.community/org/${account}`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  const downline = await fetchDownline(account);
  return downline;
};

export const getBr34pPrice = async () => {
  const fetchBr34PPrice = async () =>
    fetch("https://api.coinpaprika.com/v1/tickers/br34p-br34p/")
      .then((response) => response.json())
      .then((data) => data);

  const br34pData = await fetchBr34PPrice();
  return br34pData.quotes.USD.price;
};

export const getBnbprice = async () => {
  const fetchBnbPrice = async () =>
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd"
    )
      .then((response) => response.json())
      .then((data) => data.wbnb.usd);
  const bnbPrice = await fetchBnbPrice();
  return bnbPrice;
};

export const getDownlineDepth = async (account) => {
  const obj = await getDownline(account);

  if (typeof obj !== "object" || obj === null) {
    return 0;
  }

  const flat = flatten(obj);
  const keys = Object.keys(flat);
  if (keys.length === 0) {
    return 1;
  }

  const depthOfKeys = keys.map((key) => (key.match(/children/g) || []).length);

  return Math.max(...depthOfKeys);
};

export const getDripPcsPrice = async () => {
  const fetchDripPcsPrice = async () =>
    fetch(
      "https://api.pancakeswap.info/api/v2/tokens/0x20f663cea80face82acdfa3aae6862d246ce0333"
    )
      .then((response) => response.json())
      .then((data) => data.data.price);
  const dripPcsPrice = await fetchDripPcsPrice();
  return dripPcsPrice;
};

export const getJoinDate = async (account) => {
  const fetchBuddyDate = async () =>
    fetch(
      `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`
    )
      .then((response) => response.json())
      .then((data) => data.result);

  const txHistory = await fetchBuddyDate();
  const buddyDate = txHistory.find((tx) => tx.input?.startsWith("0x17fed96f"));
  return buddyDate.timeStamp;
};
