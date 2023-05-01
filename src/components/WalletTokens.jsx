import { React, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getWalletTokens } from "../api/Contract.js";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

const WalletTokens = () => {
  const { account } = useParams();
  const [tokens, setTokens] = useState([]);
  const [addToMM, setAddToMM] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    const tokens = await getWalletTokens(account);
    setLoading(false);
    setTokens(tokens);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const updateTokenList = async (e) => {
    const { checked } = e.target;
    if (!checked) return;
    const tokenAddress = e.target.value;
    const tokenToAdd = tokens.find((t) => t.contractAddress === tokenAddress);
    console.log(tokenToAdd);
    try {
      const connectedAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(connectedAccounts, account);
      if (connectedAccounts[0].toLowerCase() !== account.toLowerCase()) {
        alert("please switch accounts");
        return false;
      }
      // wasAdded is a boolean. Like any RPC method, an error can be thrown.
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC-20 tokens, but eventually more!
          options: {
            address: tokenAddress, // The address of the token.
            symbol: tokenToAdd.tokenSymbol, // A ticker symbol or shorthand, up to 5 characters.
            decimals: tokenToAdd.tokenDecimal, // The number of decimals in the token.
            //image: tokenImage, // A string URL of the token logo.
          },
        },
      });
    } catch (err) {
      console.log(err.message);
    }

    // if (addToMM.includes(contractAddress)) {
    //   setAddToMM(addToMM.filter((a) => a !== contractAddress));
    // } else {
    //   setAddToMM([...addToMM, contractAddress]);
    // }
  };

  // useEffect(() => {
  //   console.log(addToMM);
  // }, [addToMM]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ justifyContent: "center" }}>
      <div className="main" style={{ width: "50%" }}>
        <div className="alert alert-info">
          Select the token you want to add to your wallet. The list shows the
          balance of each token and the number of transactions for each token,
          so the most used are likely ones you want. Once you select the disired
          token, you will be prompted to approve that token in MetaMask.
        </div>
        <Button variant="contained">Submit</Button>
        <FormGroup>
          {tokens?.map((token) => (
            <FormControlLabel
              key={token.tokenSymbol}
              control={
                <Checkbox
                  value={token.contractAddress}
                  onChange={(e) => updateTokenList(e)}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "white",
                    },
                  }}
                />
              }
              label={
                <span>
                  <a
                    href={`https://bscscan.com/token/${token.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {token.tokenSymbol}
                  </a>
                  &nbsp;- ${token.tokenBalance} : ${token.count}
                </span>
              }
            />
          ))}
        </FormGroup>
      </div>
    </div>
  );
};

export default WalletTokens;
