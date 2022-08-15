import Web3 from "web3";
import {
  FAUCET_ABI,
  FAUCET_ADDR,
  FOUNTAIN_ABI,
  FOUNTAIN_ADDR,
  BR34P_ABI,
  BR34P_ADDRESS,
  BASIC_TOKEN_ABI,
  DROPS_ADDRESS,
} from "../configs/dripconfig";

import LRU from "lru-cache";
// import { add } from "lodash";

const RESERVOIR_CONTRACT = require("../configs/reservoir_contract.json");

const axios = require("axios");
const rax = require("retry-axios");
// eslint-disable-next-line no-unused-vars
const interceptorId = rax.attach();

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

export const getConnection = () => {
  const web3 = new Web3("https://bsc-dataseed.binance.org/");
  return web3;
};

export const getAccounts = async (web3) => {
  return await web3.eth.getAccounts();
};

export const getContract = (web3) => {
  const contract = new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
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

export const getBr34pBalance = async (web3, account) => {
  const contract = new web3.eth.Contract(BR34P_ABI, BR34P_ADDRESS);
  const tokenBalance = await contract.methods.balanceOf(account).call();
  return tokenBalance / 10e7;
};

export const getBnbBalance = async (web3, account) => {
  const balance = await web3.eth.getBalance(account);
  return balance / 10e17;
};

export const getTokenBalance = async (web3, account, tokenAddress) => {
  const contract = new web3.eth.Contract(BASIC_TOKEN_ABI, tokenAddress);
  const tokenBalance = await contract.methods.balanceOf(account).call();
  return tokenBalance / 10e17;
};

export const getReservoirBalance = async (web3, account) => {
  const contract = new web3.eth.Contract(RESERVOIR_CONTRACT, DROPS_ADDRESS);
  const dropsBalance = await contract.methods.balanceOf(account).call();
  return dropsBalance / 10e17;
};

export const getDripPrice = async (web3) => {
  const contract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
  try {
    const dripBnbRatio = await contract.methods
      .getTokenToBnbInputPrice(1000000000000000000n)
      .call();

    const tokenBalance = await contract.methods.tokenBalance().call();

    const fetchBnbPrice = async () =>
      axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd"
        )
        //.then((response) => response.json())
        .then((response) => response.data.wbnb.usd);
    const bnbPrice = await fetchBnbPrice();

    return [bnbPrice, dripBnbRatio, tokenBalance];
  } catch (err) {
    console.log(err.message);
  }
};

export const getPigPrice = async () => {
  const fetchPigPrice = async () =>
    axios
      .get(
        "https://api.pancakeswap.info/api/v2/tokens/0x3A4C15F96B3b058ab3Fb5FAf1440Cc19E7AE07ce"
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
        "https://api.pancakeswap.info/api/v2/tokens/0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e"
      )
      // .then((response) => response.json())
      .then((response) => response.data.data.price);
  const dogPrice = await fetchDogPrice();
  return dogPrice;
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
    axios
      .get(`https://api.drip.community/org/${account}`)
      //.then((response) => response.json())
      .then((response) => response.data)
      .catch((err) => console.log(`Error getting downline: ${err.message}`));
  const downline = await fetchDownline(account);
  return downline;
};

export const getBr34pPrice = async () => {
  const fetchBr34PPrice = async () =>
    axios
      .get("https://api.coinpaprika.com/v1/tickers/br34p-br34p/")
      // .then((response) => response.json())
      .then((response) => response.data);

  const br34pData = await fetchBr34PPrice();
  return br34pData.quotes.USD.price;
};

export const getBnbprice = async () => {
  const fetchBnbPrice = async () =>
    axios
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=wbnb&vs_currencies=usd"
      )
      // .then((response) => response.json())
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
        "https://api.pancakeswap.info/api/v2/tokens/0x20f663cea80face82acdfa3aae6862d246ce0333"
      )
      .then((result) => result.data.data.price)
      .catch((err) => {
        console.log(`Error getting Drip price from PCS: ${err.message}`);
        return 0;
      });
  const dripPcsPriceBNB = await fetchDripPcsPrice();
  //const bnbPrice = await getBnbprice();
  return dripPcsPriceBNB; //* bnbPrice;
};

export const getJoinDate = async (account) => {
  const fetchBuddyDate = async () =>
    axios
      .get(
        `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`
      )
      // .then((response) => response.json())
      .then((response) => response.data.result);

  const txHistory = await fetchBuddyDate();
  const buddyDate = txHistory.find((tx) => tx.input?.startsWith("0x17fed96f"));
  return buddyDate.timeStamp;
};

export const getStartBlock = async () => {
  const latestBlockHex = await axios
    .get(
      "https://api.bscscan.com/api?module=proxy&action=eth_blockNumber&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY"
    )
    .then((response) => response.data.result);

  const latestBlock = parseInt(latestBlockHex, 16);
  return latestBlock;
};

export const getLastAction = async (startBlock, address) => {
  if (cache.has(address)) {
    //console.log(`returning cached value for ${address}`);
    return cache.get(address);
  }
  const transactions = await axios
    .get(
      `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=${startBlock}}&endblock=99999999&sort=asc&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`
    )
    .then((response) => response.data.result)
    .catch((err) => {
      console.log(`error getting last action: ${err.message}`);
      return null;
    });
  if (!Array.isArray(transactions)) {
    console.log(`transactions is not an array: ${transactions}`);
    return null;
  }
  const lastActionHex =
    transactions
      .filter((tx) => tx.to === "0xffe811714ab35360b67ee195ace7c10d93f89d8c")
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
  //console.log(`setting cached value: ${lastAction} for ${address}`);
  cache.set(address, lastAction);
  return lastAction;
};

export const getBigDripBuys = async () => {
  const startBlock = await getStartBlock();
  const response = await axios.get(
    `https://api.bscscan.com/api?module=account&action=txlist&address=0x4fe59adcf621489ced2d674978132a54d432653a&startblock=${
      startBlock - 29000
    }&endblock=999999999&sort=desc&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`
  );
  const buyTransactions = response.data.result;

  const bigBuys = buyTransactions
    .filter((tx) => tx.input.startsWith("0xb5695026") && tx.isError !== "1")
    .filter((tx) => tx.value >= 20000000000000000000)
    .map((tx, index) => ({
      id: index,
      blockNumber: tx.blockNumber,
      from: tx.from,
      amount: parseFloat(tx.value / 10e17).toFixed(2),
      date: new Date(tx.timeStamp * 1000).toLocaleString(),
      transaction: tx.hash,
      recent: new Date() - new Date(tx.timeStamp * 1000) <= 60 * 60 * 1000,
    }));

  const bigBuysWithDripAmt = await Promise.all(
    bigBuys.map(async (bb) => {
      const dripAmtRsp = await getDripAmtFromLogs(
        bb.transaction,
        bb.blockNumber,
        bb.from
      );
      const dripAmt = dripAmtRsp.dripAmt
        ? parseFloat(dripAmtRsp.dripAmt).toFixed(2)
        : null;
      return {
        ...bb,
        dripAmt,
      };
    })
  );

  return bigBuysWithDripAmt;
};

const getDripAmtFromLogs = async (
  transaction,
  blockNumber,
  address,
  attempt = 0
) => {
  await delay(1000);
  const txLog = await axios.get(
    `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=${blockNumber}&toBlock=${blockNumber}&address=0x20f663cea80face82acdfa3aae6862d246ce0333&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY&topic2=0x000000000000000000000000${address.substr(
      2
    )}`
  );

  if (txLog.data.status === "0" && attempt < 3) {
    console.log(`retrying getDripAmtFromLogs. Attempt ${attempt + 1}`);
    return await getDripAmtFromLogs(
      transaction,
      blockNumber,
      address,
      attempt + 1
    );
  }
  const amount = txLog.data.result[0].data;
  //console.log(amount);
  return { transaction, dripAmt: parseInt(amount, 16) / 10e17 };
};

function delay(delayInms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}
