import Web3 from "web3";
import { DRIP_ABI, DRIP_ADDR } from "./dripconfig";

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
  const contract = await new web3.eth.Contract(DRIP_ABI, DRIP_ADDR);
  return contract;
};

export const claimsAvailable = async (contract, account) => {
  const available = await contract.methods.claimsAvailable(account).call();
  return available;
};

export const getUserInfo = async (contract, account) => {
  return await contract.methods.users(account).call();
};
