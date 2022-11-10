import { React, useState, useEffect } from "react";
import { getWalletTokens } from "../api/Contract.js";

const WalletTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [addToMM, setAddToMM] = useState([]);

  const fetchTokens = async () => {
    const tokens = await getWalletTokens(
      "0x1ff661243cb97384102a69a466c887b4cC12d72a"
    );
    setTokens(tokens);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const updateTokenList = (e) => {
    const contractAddress = e.target.value;
    if (addToMM.includes(contractAddress)) {
      setAddToMM(addToMM.filter((a) => a !== contractAddress));
    } else {
      setAddToMM([...addToMM, contractAddress]);
    }
  };

  useEffect(() => {
    console.log(addToMM);
  }, [addToMM]);

  return (
    <div className="container">
      <div className="main">
        {tokens?.map((token) => (
          <div key={token.tokenSymbol}>
            <input
              type="checkbox"
              value={token.contractAddress}
              onChange={(e) => updateTokenList(e)}
            />
            {token.tokenSymbol} - {token.tokenBalance}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletTokens;
