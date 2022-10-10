import Web3 from "web3";
import {
  BASIC_TOKEN_ABI,
  DRIP_TOKEN_ADDR,
  BUSD_TOKEN_ADDRESS,
  DRIP_BUSD_LP_ADDRESS, FURIO_TOKEN_ADDR,
} from "../configs/dripconfig";
import {BSCSCAN_URL, findFibIndex} from "./utils";
import {Wallet} from "../types/types";
import {
  claimsAvailable,
  getDripAirdrops,
  getBr34pBalance,
  getDownlineDepth,
  getDripUserInfo,
  getUplineCount, getReservoirBalance
} from "./dripAPI";
import {
  getFurioAutoCompoundEnabled,
  getFurioAutoCompoundsLeft,
  getFurioAvailable,
  getFurioParticipantStatus,
  getFurioRewardRate,
  getFurioTotalAutoCompounds,
  getFurioVaultBalance
} from "./furioAPI";
//const DMWDAPI = "https://api.drip-mw-dashboard.com";
//const DMWDAPI = "https://drip-mw-dashboard-api.glitch.me";

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
      resolve(null);
    }, config.retryDelay || 1000);
  });
  return delayRetryRequest.then(() => axios(config));
});

const web3 = new Web3("https://bsc-dataseed.binance.org/");

//let startBlock;

export const getConnection = () => {
  return new Web3("https://bsc-dataseed.binance.org/");
};

export const getAccounts = async (web3) => {
  return web3.eth.getAccounts();
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



export const getJoinDate = async (account) => {
  const fetchBuddyDate = async () =>
    axios
      .get(
        `${BSCSCAN_URL}/api?module=account&action=txlist&address=${account}&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`
      )
      // .then((response) => response.json())
      .then((response) => response.data.result);

  const txHistory = await fetchBuddyDate();
  const buddyDate = txHistory.find((tx) => tx.input?.startsWith("0x17fed96f"));
  return buddyDate.timeStamp;
};

export const getBigBuysFromAWS = async () => {
  try {
    const bigBuys = await axios.get(
      "https://8kltnjdcw2.execute-api.us-east-1.amazonaws.com/default/getDripBigBuys",
      { timeout: 5000 }
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
      { timeout: 5000 }
    );
    return bigBuys.data;
  } catch (err) {
    console.log(`error getting big buys from glitch: ${err.message}`);
  }
};


export const fetchWalletData = async (wallet, index): Promise<Wallet> => {
  //console.log("fetchWalletData");
  // const web3 = await getConnection();
  //const dripContract = await getContract(web3);
  const userInfo = await getDripUserInfo(wallet.addr);
  if (!userInfo) return;
  const available = await claimsAvailable(wallet.addr);
  const dripBalance = await getTokenBalance(web3, wallet.addr, DRIP_TOKEN_ADDR);
  const furioBalance = await getTokenBalance(web3, wallet.addr, FURIO_TOKEN_ADDR);
  const furioVaultBalance = await getFurioVaultBalance(wallet.addr);
  const furioAvailable = await getFurioAvailable(wallet.addr);
  const furioReward = await getFurioRewardRate(wallet.addr);
  const furioParticipantStatus = await getFurioParticipantStatus(wallet.addr);
  const furioAutoCompoundEnabled = await getFurioAutoCompoundEnabled(wallet.addr);
  const furioAutoCompoundsLeft = await getFurioAutoCompoundsLeft(wallet.addr);
  const furioTotalAutoCompounds = await getFurioTotalAutoCompounds(wallet.addr);
  const uplineCount = await getUplineCount(wallet.addr);
  const br34pBalance = await getBr34pBalance(web3, wallet.addr);
  const bnbBalance = await getBnbBalance(web3, wallet.addr);

  const busdBalance = await getTokenBalance(
    web3,
    wallet.addr,
    BUSD_TOKEN_ADDRESS
  );
  const dripBusdLpBalance = await getTokenBalance(
    web3,
    wallet.addr,
    DRIP_BUSD_LP_ADDRESS
  );

  const coveredDepth = findFibIndex(br34pBalance);
  const teamDepth =
    userInfo.referrals > 0 && (await getDownlineDepth(wallet.addr));

  const { airdrops } = await getDripAirdrops(wallet.addr);
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
  const dropsBalance = await getReservoirBalance(web3, wallet.addr);
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
    valid,
    dripBalance,
    br34pBalance,
    uplineCount,
    bnbBalance,
    coveredDepth,
    furioBalance,
    furioVaultBalance: furioVaultBalance / 10e17,
    furioAvailable: furioAvailable / 10e17,
    furioRewardRate: furioReward / 10000,
    furioStatus: furioParticipantStatus === '3' ? 'enabled' : 'disabled',
    furioAutoCompoundEnabled,
    furioAutoCompoundsLeft,
    furioTotalAutoCompounds,
    teamDepth,
    ndv,
    busdBalance,
    dripBusdLpBalance,
    //lastAction,
    r,
    dropsBalance,
    referrals: parseInt(userInfo.referrals),
  } as Wallet;
};

export const getAllWalletData = async (myWallets: Wallet[]) => {
  const start = new Date().getMilliseconds();
  console.log("getting wallet data");
  //const startBlock = await getStartBlock();
  const walletCache = await Promise.all(
    myWallets.map(async (wallet, index) => {
      return fetchWalletData(wallet, index);
    })
  );
  const end = new Date().getMilliseconds();
  console.log(`got wallet data in ${(end - start) / 1000} seconds`);
  return walletCache;
};
