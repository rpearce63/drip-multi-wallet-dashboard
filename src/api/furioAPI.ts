import Web3 from "web3";
import {
    FURVaultContractAddress,
    furioAutoCompoundABI,
    furVaultABI,
    FURAutoCompoundContractAddress
} from "../configs/furioconfig";


const web3 = new Web3("https://bsc-dataseed.binance.org/");
const furVaultContract = new web3.eth.Contract(furVaultABI, FURVaultContractAddress);
const furAutoCompoundContract = new web3.eth.Contract(furioAutoCompoundABI, FURAutoCompoundContractAddress);

export const getFURIOVaultContract = (web3) => {
    return new web3.eth.Contract(furVaultABI, FURVaultContractAddress);
};

export const getFurioVaultBalance = async (account) => {
    try {
        return furVaultContract.methods.participantBalance(account).call();
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const getFurioAvailable = async (account) => {
    try {
        return furVaultContract.methods.availableRewards(account).call();
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const getFurioRewardRate = async (account) => {
    try {
        return furVaultContract.methods.rewardRate(account).call();
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const getFurioParticipant = async (account) => {
    try {
        return furVaultContract.methods.getParticipant(account).call();
    } catch (err) {
        console.log(err.message);
        return null;
    }
};

export const getFurioParticipantStatus = async (account): Promise<string | null> => {
    try {
        return furVaultContract.methods.participantStatus(account).call();
    } catch (err) {
        console.log(err.message);
        return null;
    }
};

export const getFurioAutoCompoundEnabled = async (account) => {
    try {
        return furAutoCompoundContract.methods.compounding(account).call();
    } catch (err) {
        console.log(err.message);
        return false;
    }
};

export const getFurioAutoCompoundsLeft = async (account) => {
    try {
        return furAutoCompoundContract.methods.compoundsLeft(account).call();
    } catch (err) {
        console.log(err.message);
        return null;
    }
};

export const getFurioTotalAutoCompounds = async (account) => {
    try {
        return furAutoCompoundContract.methods.compoundsLeft(account).call();
    } catch (err) {
        console.log(err.message);
        return null;
    }
};