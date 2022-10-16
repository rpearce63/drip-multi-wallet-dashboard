import Web3 from "web3";
import {
  FAUCET_ABI,
  FAUCET_ADDR,
  FOUNTAIN_ABI,
  FOUNTAIN_ADDR,
  BR34P_ABI,
  BR34P_ADDRESS,
  BASIC_TOKEN_ABI,
  RESERVOIR_ADDRESS,
  DRIP_TOKEN_ADDR,
  BUSD_TOKEN_ADDRESS,
  DRIP_BUSD_LP_ADDRESS,
} from "../configs/dripconfig";
import ERC20_ABI from "../configs/erc20_abi.json";

import { findFibIndex } from "./utils";

import LRU from "lru-cache";
//const DMWDAPI = "https://api.drip-mw-dashboard.com";
//const DMWDAPI = "https://drip-mw-dashboard-api.glitch.me";
const BSCSCAN_URL = "https://api.bscscan.com";
const RESERVOIR_CONTRACT = require("../configs/reservoir_contract.json");

const axios = require("axios");
//const rax = require("retry-axios");
// eslint-disable-next-line no-unused-vars
//const interceptorId = rax.attach();
axios.interceptors.response.use(undefined, (err) => {
  const { config, message } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  // retry while Network timeout or Network Error
  if (
    !(
      message.includes("timeout") ||
      message.includes("Network Error") ||
      message.includes("retry")
    )
  ) {
    return Promise.reject(err);
  }
  config.retry -= 1;
  const delayRetryRequest = new Promise((resolve) => {
    setTimeout(() => {
      console.log("retry the request", config.url);
      resolve();
    }, config.retryDelay || 1000);
  });
  return delayRetryRequest.then(() => axios(config));
});
const flatten = require("flat").flatten;

const options = {
  max: 500,
  ttl: 1000 * 60 * 5,
};
const cache = new LRU(options);
//console.log("creating new cache");
const ROLL_HEX = "0xcd5e3c5d";
const CLAIM_HEX = "0x4e71d92d";
const DEPOSIT_HEX = "0x47e7ef24";

const web3 = new Web3("https://bsc-dataseed.binance.org/");
const faucetContract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
const fountainContract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
//let startBlock;

// export const getConnection = () => {
//   const web3 = new Web3("https://bsc-dataseed.binance.org/");
//   return web3;
// };

// export const getAccounts = async (web3) => {
//   return await web3.eth.getAccounts();
// };

// export const getContract = (web3) => {
//   const contract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
//   return contract;
// };

export const claimsAvailable = async (account) => {
  try {
    const available = await faucetContract.methods
      .claimsAvailable(account)
      .call();
    return available;
  } catch (err) {
    console.log(err.message);
    return 0;
  }
};

export const getAirdrops = async (account) => {
  try {
    return await faucetContract.methods.airdrops(account).call();
  } catch (err) {
    console.log(err.message);
    return 0;
  }
};

export const getUserInfo = async (account, isRetry = false) => {
  try {
    return await faucetContract.methods.users(account).call();
  } catch (err) {
    console.log("Error getting UserInfo: ", err.message);
    if (isRetry) return {};
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(1);
      }, 1000)
    );
    console.log("retrying getUserInfo");
    return getUserInfo(account, true);
  }
};

export const getBr34pBalance = async (account) => {
  const br34pContract = new web3.eth.Contract(BR34P_ABI, BR34P_ADDRESS);
  const tokenBalance = await br34pContract.methods.balanceOf(account).call();
  return tokenBalance / 10e7;
};

export const getBnbBalance = async (account) => {
  const balance = await web3.eth.getBalance(account);
  return balance / 10e17;
};

export const getTokenBalance = async (account, tokenAddress) => {
  const tokenContract = new web3.eth.Contract(BASIC_TOKEN_ABI, tokenAddress);
  const tokenBalance = await tokenContract.methods.balanceOf(account).call();
  return tokenBalance / 10e17;
};

export const getReservoirBalance = async (account) => {
  const reservoirContract = new web3.eth.Contract(
    RESERVOIR_CONTRACT,
    RESERVOIR_ADDRESS
  );
  const dropsBalance = await reservoirContract.methods
    .balanceOf(account)
    .call();
  return dropsBalance / 10e17;
};

export const getDripPrice = async () => {
  try {
    const dripBnbRatio = await fountainContract.methods
      .getTokenToBnbInputPrice(1000000000000000000n)
      .call();

    const tokenBalance = await fountainContract.methods.tokenBalance().call();

    const fetchBnbPrice = async () =>
      axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd",
          { retry: 2, retryDelay: 1000 }
        )
        //.then((response) => response.json())
        .then((response) => response.data.wbnb.usd);
    const bnbPrice = await fetchBnbPrice();

    return [bnbPrice, dripBnbRatio, tokenBalance];
  } catch (err) {
    console.log(err.message);
    return [0, 0, 0];
  }
};

export const getPigPrice = async () => {
  const fetchPigPrice = async () =>
    axios
      .get(
        "https://api.pancakeswap.info/api/v2/tokens/0x3A4C15F96B3b058ab3Fb5FAf1440Cc19E7AE07ce",
        { retry: 2, retryDelay: 1000 }
      )
      //.then((response) => response.json())
      .then((response) => response.data.data.price);
  const pigPrice = await fetchPigPrice();
  return pigPrice;
};

export const getDogPrice = async () => {
  const fetchDogPrice = async () =>
    axios
      .get(
        "https://api.pancakeswap.info/api/v2/tokens/0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e",
        { retry: 2, retryDelay: 1000 }
      )
      // .then((response) => response.json())
      .then((response) => response.data.data.price);
  const dogPrice = await fetchDogPrice();
  return dogPrice;
};

export const getUplineCount = async (wallet) => {
  let upline = wallet,
    count = 0,
    stop = false;
  do {
    const uplineInfo = await getUserInfo(upline);
    upline = uplineInfo.upline;
    if (!upline || upline.startsWith("0x000")) {
      stop = true;
    }
    count++;
  } while (!stop);

  return count - 1;
};

export const roll = async (account) => {
  console.log(account);
  //const web3 = await getConnection();
  //const faucetContract = await getContract(web3);
  await faucetContract.methods.roll().send({ from: account });
};

export const getDownline = async (account) => {
  try {
    return await await axios.get(`https://api.drip.community/org/${account}`, {
      retry: 2,
      retryDelay: 1000,
    });
  } catch (err) {
    console.log(`Error getting downline: ${err.message}`);
    return {};
  }
};

export const getBr34pPrice = async () => {
  const fetchBr34PPrice = async () =>
    axios
      .get("https://api.coinpaprika.com/v1/tickers/br34p-br34p/", {
        retry: 2,
        retryDelay: 1000,
      })
      .then((response) => response.data);

  const br34pData = await fetchBr34PPrice();
  return br34pData.quotes.USD.price;
};

export const getBnbprice = async () => {
  const fetchBnbPrice = async () =>
    axios
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd",
        { retry: 2, retryDelay: 1000 }
      )
      .then((response) => response.data.wbnb.usd);
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
    axios
      .get(
        "https://api.pancakeswap.info/api/v2/tokens/0x20f663cea80face82acdfa3aae6862d246ce0333",
        { retry: 2, retryDelay: 1000 }
      )
      .then((result) => result.data.data.price)
      .catch((err) => {
        console.log(`Error getting Drip price from PCS: ${err.message}`);
        return 0;
      });
  const dripPcsPriceBNB = await fetchDripPcsPrice();
  return dripPcsPriceBNB; //* bnbPrice;
};

export const getJoinDate = async (account) => {
  const fetchBuddyDate = async () =>
    axios
      .get(
        `${BSCSCAN_URL}/api?module=account&action=txlist&address=${account}&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`,
        { retry: 2, retryDelay: 1000 }
      )
      // .then((response) => response.json())
      .then((response) => response.data.result);

  const txHistory = await fetchBuddyDate();
  const buddyDate = txHistory.find((tx) => tx.input?.startsWith("0x17fed96f"));
  return buddyDate.timeStamp;
};

export const getStartBlock = async () => {
  const url = `${BSCSCAN_URL}/api?module=proxy&action=eth_blockNumber&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`;
  const latestBlockHex = await axios
    .get(url, { retry: 2, retryDelay: 1000 })
    .then((response) => response.data.result);

  // const url = `${BSCSCAN_URL}/api?module=proxy&action=eth_blockNumber&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`;
  // const latestBlockHex = await axios
  //   .get(url)
  //   .then((response) => response.data.result);

  // const latestBlock = parseInt(latestBlockHex, 16);
  // console.log(`latest block: ${currentBlock}, ${latestBlock}`);
  return latestBlock;
};

export const getLastAction = async (startBlock, address) => {
  if (cache.has(address)) {
    console.log(`returning cached value for ${address}`);
    return cache.get(address);
  }

  const url = `${BSCSCAN_URL}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`;
  const transactions = await axios
    .get(url, { retry: 3, retryDelay: 1000 })
    .then((response) => response.data.result)
    .catch((err) => {
      console.log(`error getting last action: ${err.message}`);
      return null;
    });
  if (!Array.isArray(transactions)) {
    console.log(`transactions is not an array: ${transactions}`);
    return "error";
  }
  const lastActionHex =
    transactions
      .filter((tx) => tx.to.toLowerCase() === FAUCET_ADDR.toLowerCase())
      .filter((result) =>
        [ROLL_HEX, CLAIM_HEX, DEPOSIT_HEX].some((a) =>
          result.input.startsWith(a)
        )
      )
      .sort((t1, t2) => t2.timeStamp - t1.timeStamp)[0]?.input ?? "";
  const lastAction =
    lastActionHex === ROLL_HEX
      ? "Hydrate"
      : lastActionHex === CLAIM_HEX
      ? "Claim"
      : lastActionHex.startsWith(DEPOSIT_HEX)
      ? "Deposit"
      : "";

  // if (lastAction) {
  //   cache.set(address, lastAction);
  // }
  return lastAction;
};

export const getBigBuysFromAWS = async () => {
  try {
    const bigBuys = await axios.get(
      "https://8kltnjdcw2.execute-api.us-east-1.amazonaws.com/default/getDripBigBuys",
      { timeout: 5000, retry: 2, retryDelay: 1000 }
    );
    return bigBuys.data;
  } catch (err) {
    console.log(`error getting big buys from AWS: ${err.message}`);
  }
};

export const getBigBuysFromGlitch = async () => {
  try {
    const bigBuys = await axios.get(
      "https://drip-mw-dashboard-api.glitch.me/bigBuys",
      { timeout: 5000, retry: 2, retryDelay: 1000 }
    );
    return bigBuys.data;
  } catch (err) {
    console.log(`error getting big buys from glitch: ${err.message}`);
  }
};

export const getDripPriceData = async () => {
  const dripPriceData = await axios.get(
    "https://drip-mw-dashboard-api.glitch.me/prices",
    { retry: 2, retryDelay: 1000 }
  );
  return { ...dripPriceData.data };
};

export const fetchWalletData = async (wallet, index) => {
  //console.log("fetchWalletData");
  // const web3 = await getConnection();
  //const contract = await getContract(web3);
  const userInfo = await getUserInfo(wallet.addr);
  if (!userInfo) return;
  const available = await claimsAvailable(wallet.addr);
  const dripBalance = await getTokenBalance(wallet.addr, DRIP_TOKEN_ADDR);
  const uplineCount = await getUplineCount(wallet.addr);
  const br34pBalance = await getBr34pBalance(wallet.addr);
  const bnbBalance = await getBnbBalance(wallet.addr);

  const busdBalance = await getTokenBalance(wallet.addr, BUSD_TOKEN_ADDRESS);
  const dripBusdLpBalance = await getTokenBalance(
    wallet.addr,
    DRIP_BUSD_LP_ADDRESS
  );

  const coveredDepth = findFibIndex(br34pBalance);
  const teamDepth =
    userInfo.referrals > 0 && (await getDownlineDepth(wallet.addr));

  const { airdrops } = await getAirdrops(wallet.addr);
  const a = parseFloat(web3.utils.fromWei(airdrops));
  const d = parseFloat(web3.utils.fromWei(userInfo.deposits));
  const r = parseFloat(web3.utils.fromWei(userInfo.rolls));
  const c = parseFloat(web3.utils.fromWei(userInfo.payouts));

  const ndv = d + a + r - c;
  const valid = !!userInfo;
  const referral_bonus =
    parseFloat(userInfo.direct_bonus) + parseFloat(userInfo.match_bonus);
  //const startBlock = await getStartBlock();
  //console.log("startBlock: " + startBlock);
  //const lastAction = await getLastAction(startBlock - 200000, wallet.addr);
  const dropsBalance = await getReservoirBalance(wallet.addr);
  return {
    index,
    ...userInfo,
    deposits: userInfo.deposits / 10e17,
    available: available / 10e17,
    payouts: userInfo.payouts / 10e17,
    maxPayout: (userInfo.deposits * 3.65) / 10e17,
    direct_bonus: referral_bonus / 10e17,

    address: wallet.addr,
    label: wallet.label,
    group: wallet.group,
    valid,
    dripBalance,
    br34pBalance,
    uplineCount,
    bnbBalance,
    coveredDepth,
    teamDepth,
    ndv,
    busdBalance,
    dripBusdLpBalance,
    //lastAction,
    r,
    dropsBalance,
    referrals: parseInt(userInfo.referrals),
  };
};

export const getAllWalletData = async (myWallets) => {
  const start = new Date();
  console.log("getting wallet data");
  //const startBlock = await getStartBlock();
  const walletCache = await Promise.all(
    myWallets.map(async (wallet, index) => {
      const walletData = await fetchWalletData(wallet, index);
      return walletData;
    })
  );
  const end = new Date();
  console.log(`got wallet data in ${(end - start) / 1000} seconds`);
  return walletCache;
};

// run this multiple times by putting in its own function
export async function getTokenInfo(addressOfToken) {
  // run this just once, as part of initialisation
  const tokenContract = new web3.eth.Contract(ERC20_ABI, addressOfToken);

  const symbol = await tokenContract.methods.symbol().call();
  const decimals = await tokenContract.methods.decimals().call();
  const name = await tokenContract.methods.name().call();

  return { decimals, name, symbol };
}

export const getWalletTokens = async (address) => {
  const response = await axios.get(
    "https://api.bscscan.com/api?module=account&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY&action=tokentx&address=0x1ff661243cb97384102a69a466c887b4cC12d72a&startblock=0&endblock=999999999&sort=asc"
  );
  const allTokens = response.data;
  const tokens = allTokens.result
    .map((tx) => ({
      tokenSymbol: tx.tokenSymbol,
      contractAddress: tx.contractAddress,
    }))
    .filter((token) => !token.tokenSymbol.includes("."));
  let symbols = [];
  let uniq = [];
  tokens.forEach((token) => {
    if (!symbols.includes(token.tokenSymbol)) {
      symbols.push(token.tokenSymbol);
      uniq.push(token);
    }
  });
  let tokensWithBalance = [];
  for (const token of uniq) {
    const tokenBalance = await getTokenBalance(
      web3,
      address,
      token.contractAddress
    );
    tokensWithBalance.push({ ...token, tokenBalance });
  }

  return tokensWithBalance;
};

export const getUplineTree = async (address, upline = []) => {
  //console.log("getting upline for ", address);
  const userInfo = await getUserInfo(address);
  const uplineAddress = userInfo.upline;

  const isEligible = await faucetContract.methods.isNetPositive(address).call();
  const balanceLevel = await faucetContract.methods
    .balanceLevel(address)
    .call();
  const updatedUpline = [
    ...upline,
    {
      address,
      isEligible,
      balanceLevel,
      referrals: userInfo.referrals,
      total_structure: userInfo.total_structure,
    },
  ];
  if (uplineAddress.startsWith("0x000")) {
    return updatedUpline;
  }
  return getUplineTree(uplineAddress, updatedUpline);
};
