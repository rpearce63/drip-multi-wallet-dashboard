import {FOUNTAIN_ABI, FOUNTAIN_ADDR} from "../configs/dripconfig";
import axios from "axios";

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
        return [0, 0, 0];
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
    return fetchPigPrice();
};

export const getDogPrice = async () => {
    const fetchDogPrice = async () =>
        axios
            .get(
                "https://api.pancakeswap.info/api/v2/tokens/0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e"
            )
            // .then((response) => response.json())
            .then((response) => response.data.data.price);
    return fetchDogPrice();
};

export const getBr34pPrice = async () => {
    const fetchBr34PPrice = async () =>
        axios
            .get("https://api.coinpaprika.com/v1/tickers/br34p-br34p/")
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
            .then((response) => response.data.wbnb.usd);
    return fetchBnbPrice();
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
    return fetchDripPcsPrice();
};


export const getDripPriceData = async () => {
    const dripPriceData = await axios.get(
        "https://drip-mw-dashboard-api.glitch.me/prices"
    );
    return dripPriceData.data;
};
export const getFurioPriceData = async () => {
    const dripPriceData = await axios.get(
        "https://drip-mw-dashboard-api.glitch.me/prices"
    );
    return dripPriceData.data;
};