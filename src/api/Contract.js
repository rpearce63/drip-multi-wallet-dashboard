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
import faucetReaderAbi from "../configs/faucet-reader-abi";
import { findFibIndex } from "./utils";
import RESERVOIR_CONTRACT from "../configs/reservoir_contract.json";

import LRU from "lru-cache";
import axios from "axios";

const DRIP_API = "https://drip.herokuapp.com";

//const DMWDAPI = "https://api.drip-mw-dashboard.com";
const DMWDAPI = "https://drip-mw-dashboard-api.glitch.me";

const BSCSCAN_URL = "https://api.bscscan.com";
export const RPC_URL =
  // list of rpcs
  //"https://blissful-frequent-asphalt.bsc.quiknode.pro/bbb0a627b2e3e833221d1b083ef0c84c48e1c84f/";
  //"https://proportionate-late-market.bsc.quiknode.pro/ec5804f94e01a2e6d2f463ef5943cd1c5adfb1da/";
  //"https://bscrpc.com";
  //"https://bsc-mainnet.public.blastapi.io";
  //"https://nd-545-991-262.p2pify.com/26d4d56490e1d55a2a05b198dbca102d";
  // "https://bsc-mainnet-rpc.allthatnode.com";
  //"https://bsc-dataseed1.defibit.io";
  //"https://knowing-west-stingray.glitch.me/https://bsc-rpc.gateway.pokt.network";
  "https://bsc-dataseed.binance.org/";
//"https://fragrant-alien-pine.bsc.discover.quiknode.pro/5ab734bf3a5066d920f3996c8b28ecfdbe3c88bf/";

const RPCs = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bscrpc.com",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc-dataseed2.defibit.io",
  "https://binance.nodereal.io",
  "https://bsc-dataseed1.binance.org",
];
const flatten = require("flat").flatten;

const options = {
  max: 500,
  ttl: 1000 * 60 * 5,
};
const cache = new LRU(options);
const downlineCache = new LRU({
  max: 500,
  ttl: 1000 * 60 * 10,
});
//console.log("creating new cache");
const ROLL_HEX = "0xcd5e3c5d";
const CLAIM_HEX = "0x4e71d92d";
const DEPOSIT_HEX = "0x47e7ef24";

//const web3 = new Web3(RPC_URL);
const rpcOptions = {
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};

export const web3wss = new Web3(
  new Web3.providers.WebsocketProvider(
    "wss://fragrant-alien-pine.bsc.discover.quiknode.pro/5ab734bf3a5066d920f3996c8b28ecfdbe3c88bf/",
    //"wss://ws-nd-545-991-262.p2pify.com/26d4d56490e1d55a2a05b198dbca102d",
    rpcOptions
  )
);
const randomRPC = Math.floor(Math.random() * RPCs.length);
console.log(randomRPC, RPCs[randomRPC]);
export let web3 = new Web3(RPCs[randomRPC]);

let faucetContract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
let fountainContract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);

// const setWssContracts = () => {
//   console.log("switching to wss");
//   faucetContract = new web3wss.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
//   fountainContract = new web3wss.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
// };
const setBscContracts = async () => {
  const randomRPC = Math.floor(Math.random() * RPCs.length);
  web3 = new Web3(RPCs[randomRPC]);
  //console.log("switched to ", RPCs[randomRPC]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  // faucetContract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
  // fountainContract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
};

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

export const getUserInfo = async (account, isRetry = true) => {
  try {
    return await faucetContract.methods.users(account).call();
  } catch (err) {
    console.log("Error getting UserInfo: ", err.message);
    if (isRetry) throw new Error("retry failure");
    await setBscContracts();
    // await new Promise((resolve) =>
    //   setTimeout(() => {
    //     resolve(1);
    //   }, 1000)
    // );
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

export const getTokenBalance = async (
  account,
  tokenAddress,
  tokenDecimal = 18
) => {
  const tokenContract = new web3.eth.Contract(BASIC_TOKEN_ABI, tokenAddress);
  const tokenBalance = await tokenContract.methods.balanceOf(account).call();
  return Number(tokenBalance / Math.pow(10, tokenDecimal)).toFixed(6);
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

export const getReservoirDailyBnb = async (account) => {
  const reservoirContract = new web3.eth.Contract(
    RESERVOIR_CONTRACT,
    RESERVOIR_ADDRESS
  );

  const dailyEstimateBnb = await reservoirContract.methods
    .dailyEstimateBnb(account)
    .call()
    .catch((err) => 0);

  return dailyEstimateBnb ? parseFloat(dailyEstimateBnb / 10e17).toFixed(4) : 0;
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
  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  console.log("accounts: ", accounts);
  if (accounts[0].toLowerCase() === account.toLowerCase()) {
    const contract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);

    await contract.methods.roll().send({ from: accounts[0] });
  } else {
    alert("Switch accounts in MetaMask");
  }
};

export const getDownline = async (account) => {
  // if (downlineCache.has(account)) {
  //   return downlineCache.get(account);
  // }
  try {
    const downline = await axios.get(`${DRIP_API}/org/bsc/${account}`, {
      timeout: 2000,
      retry: 1,
      retryDelay: 500,
    });
    downlineCache.set(account, downline.data);
    return { downline: downline.data };
  } catch (err) {
    console.log(`Error getting downline for ${account}: ${err.message}`);
    downlineCache.delete(account);
    return { downline: {}, error: err.message };
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

  if (typeof obj !== "object" || obj === null || obj.error) {
    return 0;
  }

  const flat = flatten(obj);
  const keys = Object.keys(flat);
  if (keys.length === 0) {
    return 1;
  }

  const depthOfKeys = keys.map(
    (key) => (key.match(/children/g) || []).length - 1
  );
  try {
    return Math.max(...depthOfKeys, 0);
  } catch (err) {
    console.log("error getting downline depth: ", err.message);
    return 0;
  }
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
  const joinTransaction = txHistory.find((tx) =>
    tx.input?.startsWith(DEPOSIT_HEX)
  );

  const buddyDate = joinTransaction.timeStamp;
  const amount = web3.utils.hexToNumberString(
    "0x" + joinTransaction.input.slice(-64)
  );

  return {
    buddyDate: buddyDate,
    originalDeposit: web3.utils.fromWei(amount),
  };
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

  const latestBlock = parseInt(latestBlockHex, 16);
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
    const bigBuys = await axios.get(`${DMWDAPI}/bigBuys`, {
      timeout: 5000,
      retry: 2,
      retryDelay: 1000,
    });
    return bigBuys.data;
  } catch (err) {
    console.log(`error getting big buys from glitch: ${err.message}`);
  }
};

export const getDripPriceData = async () => {
  const dripPriceData = await axios.get(`${DMWDAPI}/prices`, {
    retry: 2,
    retryDelay: 1000,
  });
  return { ...dripPriceData.data };
};

export const fetchWalletData = async (wallet, index, retry = false) => {
  //await setBscContracts();
  //setWssContracts();
  // const web3 = await getConnection();
  try {
    //const contract = await getContract(web3);
    const userInfo = await getUserInfo(wallet.addr);
    if (!userInfo) return {};
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
    const dailyBnb = await getReservoirDailyBnb(wallet.addr);
    const whaleTax = calculateWhaleTax(available, userInfo.payouts);

    return {
      index,
      ...userInfo,
      deposits: userInfo.deposits / 10e17,
      available: available / 10e17,
      payouts: userInfo.payouts / 10e17,
      maxPayout: Math.min((userInfo.deposits * 3.65) / 10e17, 100000),
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
      dailyBnb,
      referrals: parseInt(userInfo.referrals),
      whaleTax,
    };
  } catch (err) {
    if (!retry) {
      //await setBscContracts();
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      return await fetchWalletData(wallet, index, true);
    }
    throw err;
  }
};

export const chunk = (xs, n) =>
  xs.length <= n ? [[...xs]] : [xs.slice(0, n)].concat(chunk(xs.slice(n), n));

export const getAllWalletData = async (myWallets, index) => {
  await setBscContracts();
  let walletCache = [];
  try {
    walletCache = await Promise.all(
      myWallets.map(async (wallet) => {
        const walletData = await fetchWalletData(wallet, index++);
        return walletData;
      })
    );
    return [...new Set(walletCache)];
  } catch (err) {
    // if (retryCount < 2) {
    //   console.log("retry getAllWalletData");
    //   return await getAllWalletData(myWallets, retryCount + 1);
    // }
    console.log("error fetching wallets. Partial return: ", err.message);
    //return [...new Set(walletCache)];
    throw new Error("failed rpc");
    // if (retryCount < 3) {
    //   setWssContracts();
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    //   walletCache = await getAllWalletData(myWallets, retryCount + 1);
    //   setBscContracts();
    //   return walletCache;
    // } else {
    //   setBscContracts();
    //   //return fetchWalletDataSynchronously(myWallets);
    //   return new Error("rpc failure");
    // }
  }
};

export const fetchWalletDataSynchronously = async (myWallets) => {
  console.log("fetching wallets individually.");
  const walletData = [];
  try {
    let index = 0;
    for (const wallet of myWallets) {
      try {
        //await new Promise((resolve) => setTimeout(resolve, 100));
        const data = await fetchWalletData(wallet, index);
        console.log("got data for ", wallet.addr);
        walletData.push(data);
        index++;
      } catch (error) {
        console.log("error getting data for: ", wallet.addr);
        index++;
      }
    }
    return walletData;
  } catch (error) {
    console.log("error fetching synchronously: ", error.message);
    return walletData;
  }
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
  const response = await axios
    .get(
      `https://api.bscscan.com/api?module=account&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc`,
      { timeout: 5000 }
    )
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
  const allTokens = response.data;
  const tokens = allTokens.result
    .map((tx) => ({
      tokenSymbol: tx.tokenSymbol,
      contractAddress: tx.contractAddress,
      tokenDecimal: tx.tokenDecimal,
    }))
    .filter((token) => !token.tokenSymbol.includes("."));
  let symbols = [];
  let uniq = [];
  tokens.forEach((token) => {
    if (!symbols.includes(token.tokenSymbol)) {
      symbols.push(token.tokenSymbol);
      uniq.push({ ...token, count: 1 });
    } else {
      uniq = uniq.map((u) =>
        u.tokenSymbol === token.tokenSymbol ? { ...u, count: u.count + 1 } : u
      );
    }
  });
  let tokensWithBalance = [];
  for (const token of uniq) {
    const tokenBalance = await getTokenBalance(
      address,
      token.contractAddress,
      token.tokenDecimal
    );
    tokensWithBalance.push({ ...token, tokenBalance });
  }
  return tokensWithBalance.sort((a, b) => b.count - a.count);
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
      ref_claim_pos: userInfo.ref_claim_pos,
    },
  ];
  if (uplineAddress.startsWith("0x000")) {
    return updatedUpline;
  }
  return getUplineTree(uplineAddress, updatedUpline);
};
const fromWei = (n) => Web3.utils.fromWei(n.toString());
const parse = (v) => parseFloat(fromWei(v)).toFixed(2);

export const getPlayerStats = async (address) => {
  const ADDRESS = "0xF93994c76411C3c47bb0AB99835e8593F511b020";
  const playerContract = new web3.eth.Contract(faucetReaderAbi, ADDRESS);
  try {
    const raw = await playerContract.methods
      .getFullPlayerDetail(address)
      .call();

    const detail = {};
    detail.address = address;
    detail.uplines = raw.uplines.filter(
      (p) => p !== "0x0000000000000000000000000000000000000000"
    );
    detail.br34pBalance = (parseFloat(raw.br34pBalance) / 1e8).toFixed(2);
    detail.uplinesRewardsAllowed = raw.uplinesRewardsAllowed;
    detail.claimsAvailable = parse(raw.claimsAvailable);
    detail.deposits = parse(raw.userStats[0]);
    detail.payouts = parse(raw.userStats[1]);
    detail.direct_bonus = parse(raw.userStats[2]);
    detail.match_bonus = parse(raw.userStats[3]);
    detail.rewards = (
      parseFloat(fromWei(raw.userStats[2])) +
      parseFloat(fromWei(raw.userStats[3]))
    ).toFixed(2);
    detail.last_airdrop = parseFloat(raw.userStats[4]);
    detail.deposit_time = parseFloat(raw.userStats[5]);
    detail.referrals = parseInt(raw.userStats[6], 10);
    detail.total_structure = parseInt(raw.userStats[7], 10);
    detail.airdrops_total = parse(raw.userStats[8]);
    detail.airdrops_received = parse(raw.userStats[9]);
    detail.rolls = parse(raw.userStats[10]);
    detail.max_payouts = parse(raw.userStats[11]);
    detail.net_deposits = (
      parseFloat(fromWei(raw.userStats[0])) +
      parseFloat(fromWei(raw.userStats[10])) +
      parseFloat(fromWei(raw.userStats[8])) -
      parseFloat(fromWei(raw.userStats[1]))
    ).toFixed(2);

    detail.nextUplineRewarded = raw.nextUplineRewarded;
    detail.bnbBalance = parse(raw.bnbBalance);
    return detail;
  } catch (e) {
    console.error(e.message);
  }
};

export const getIndividualStats = async (address) => {
  const stats = await axios.get(
    `https://faucetapi.dripnetwork.ca/getFaucetPlayerIndividualStats?address=${address}`
  );
  const statsRaw = Object.fromEntries(
    Object.entries(stats.data).map(([key, value]) => [key, value[0]?.value])
  );
  const individualStats = {
    ...statsRaw,
    actualClaim: parseFloat(statsRaw.actualClaim).toFixed(2),
    actualDeposit: parseFloat(statsRaw.actualDeposit).toFixed(2),
    firstDepositDate: new Date(
      statsRaw.firstDepositDate * 1000
    ).toLocaleDateString(),
  };

  return individualStats;
};

export const calculateWhaleTax = (available, claimed) => {
  const total = claimed / 10e17 + available / 10e17;

  if (total < 10000) return 0;
  const level = Math.floor(parseInt((total / 100000 / 2) * 100) / 5) * 5;

  return level;
};
