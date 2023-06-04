import { React, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getWalletTokens } from "../api/Contract.js";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const WalletTokens = () => {
  const { account } = useParams();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [isError, setIsError] = useState(false);

  const fetchTokens = useCallback(async () => {
    try {
      setIsError(false);
      setLoading(true);
      const tokens = await getWalletTokens(account);
      setLoading(false);
      setTokens(tokens);
    } catch (error) {
      setLoading(false);
      setIsError(true);
    }
  }, [account]);

  useEffect(() => {
    fetchTokens();
  }, [account, fetchTokens]);

  const updateTokenList = async (e) => {
    const { checked } = e.target;
    if (!checked) return;
    const tokenAddress = e.target.value;
    setSelectedTokens([...selectedTokens, tokenAddress]);
    const tokenToAdd = tokens.find((t) => t.contractAddress === tokenAddress);
    try {
      const connectedAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (connectedAccounts[0].toLowerCase() !== account.toLowerCase()) {
        alert(
          "Metamask is not connected to the selected account. Please switch accounts in Metamask and try again."
        );
        setSelectedTokens(selectedTokens.filter((t) => t !== tokenAddress));
        return false;
      }
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
      setSelectedTokens(selectedTokens.filter((t) => t !== tokenAddress));
    }
  };

  return (
    <div className="container" style={{ justifyContent: "center" }}>
      <div className="main" style={{ width: "75%" }}>
        <Stack spacing={2}>
          <Alert severity="info">
            Select the token you want to add to your wallet. The list shows the
            balance of each token and the number of transactions for each token,
            so the most used are likely ones you want. Once you select the
            desired token, you will be prompted to approve that token in
            MetaMask.
          </Alert>
          <Alert severity="warning">
            Be careful of unknown tokens. Scammers will often send tokens to
            your wallet tempting you to try to sell them. That can result in
            giving that contract permission to spend unlimited amounts of your
            other main tokens, like BUSD or BNB. Just ignore tokens you don't
            recognize.{" "}
          </Alert>
          {isError && (
            <Alert severity="error">
              An error ocurred while trying to retrieve your wallet tokens.
              &nbsp;
              <Button variant="contained" onClick={fetchTokens}>
                Retry
              </Button>
            </Alert>
          )}
        </Stack>
        {loading && <div className="loading">Loading...</div>}
        {loading || (
          <FormGroup>
            <ol
              style={{
                columns: `${Math.ceil(tokens.length / 50)}`,
              }}
            >
              {tokens?.map((token) => (
                <li key={token.tokenSymbol}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id={token.contractAddress}
                        value={token.contractAddress}
                        checked={selectedTokens.includes(token.contractAddress)}
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
                        &nbsp;- {token.tokenBalance} : {token.count}
                      </span>
                    }
                  />
                </li>
              ))}
            </ol>
          </FormGroup>
        )}
      </div>
    </div>
  );
};

export default WalletTokens;
