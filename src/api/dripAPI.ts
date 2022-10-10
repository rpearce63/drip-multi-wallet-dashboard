import Web3 from "web3";
import {BR34P_ABI, BR34P_ADDRESS, DROPS_ADDRESS, FAUCET_ABI, FAUCET_ADDR} from "../configs/dripconfig";
import {getConnection} from "./Contract";
import axios from "axios";
import {flatten} from "flat";
import {BSCSCAN_URL} from "./utils";
import LRU from "lru-cache";


const web3 = new Web3("https://bsc-dataseed.binance.org/");
const RESERVOIR_CONTRACT = require("../configs/reservoir_contract.json");

export function getDRIPContract(web3:Web3) {
    return new web3.eth.Contract(FAUCET_ABI, FAUCET_ADDR);
}
export const dripContract = getDRIPContract(web3);

export const getBr34pBalance = async (web3, account) => {
    const contract = new web3.eth.Contract(BR34P_ABI, BR34P_ADDRESS);
    const tokenBalance = await contract.methods.balanceOf(account).call();
    return tokenBalance / 10e7;
};

export const claimsAvailable = async (account) => {
    try {
        return dripContract.methods.claimsAvailable(account).call();
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const getDripAirdrops = async (account) => {
    try {
        return dripContract.methods.airdrops(account).call();
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const getDripUserInfo = async (account) => {
    try {
        return await dripContract.methods.users(account).call();
    } catch (err) {
        console.log("Error getting UserInfo: ", err.message);
        return {};
    }
};

export const getReservoirBalance = async (web3, account) => {
    const contract = new web3.eth.Contract(RESERVOIR_CONTRACT, DROPS_ADDRESS);
    const dropsBalance = await contract.methods.balanceOf(account).call();
    return dropsBalance / 10e17;
};

export const getUplineCount = async (wallet) => {
    let upline = wallet,
        count = 0,
        stop = false;
    do {
        const uplineInfo = await getDripUserInfo(upline);
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
    const web3 = await getConnection();
    const contract = await getDRIPContract(web3);
    await contract.methods.roll().send({ from: account });
};

export const getDownline = async (account) => {
    try {
        return await (
            await fetch(`https://api.drip.community/org/${account}`)
        ).json();
    } catch (err) {
        console.log(`Error getting downline: ${err.message}`);
        return {};
    }
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

const ROLL_HEX = "0xcd5e3c5d";
const CLAIM_HEX = "0x4e71d92d";
const DEPOSIT_HEX = "0x47e7ef24";

const cache = new LRU({
    max: 500,
    ttl: 1000 * 60 * 5,
});
export const getLastAction = async (startBlock, address) => {
    if (cache.has(address)) {
        console.log(`returning cached value for ${address}`);
        return cache.get(address);
    }

    const url = `${BSCSCAN_URL}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=9Y2EB28QQ14REAGZCK56PY2P5REW2NQGIY`;
    const transactions = await axios
        // @ts-ignore
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
    return lastActionHex === ROLL_HEX
        ? "Hydrate"
        : lastActionHex === CLAIM_HEX
            ? "Claim"
            : lastActionHex.startsWith(DEPOSIT_HEX)
                ? "Deposit"
                : "";
};
