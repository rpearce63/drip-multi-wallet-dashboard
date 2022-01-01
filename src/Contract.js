import Web3 from "web3";
import {
  FAUCET_ABI,
  FAUCET_ADDR,
  DRIP_TOKEN_ABI,
  DRIP_TOKEN_ADDR,
  FOUNTAIN_ABI,
  FOUNTAIN_ADDR,
} from "./dripconfig";
import { calcBNBPrice } from "./tokenPriceApi";

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

export const getUserInfo = async (contract, account) => {
  try {
    return await contract.methods.users(account).call();
  } catch (err) {
    console.log(err.message);
  }
};

export const getDripBalance = async (web3, account) => {
  const contract = new web3.eth.Contract(DRIP_TOKEN_ABI, DRIP_TOKEN_ADDR);
  const tokenBalance = await contract.methods.balanceOf(account).call();
  return tokenBalance;
};

export const getDripPrice = async (web3) => {
  const contract = new web3.eth.Contract(FOUNTAIN_ABI, FOUNTAIN_ADDR);
  try {
    const dripPrice = await contract.methods
      .getTokenToBnbInputPrice(1000000000000000000n)
      .call();

    const bnbPrice = await calcBNBPrice();
    //console.log("bnb: " + bnbPrice);

    return bnbPrice * dripPrice;
  } catch (err) {
    console.log(err.message);
  }
};
