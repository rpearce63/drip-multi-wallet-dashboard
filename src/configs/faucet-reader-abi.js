const faucetReaderAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "getFullPlayerDetail",
    outputs: [
      {
        internalType: "uint256",
        name: "claimsAvailable",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "br34pBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ref_claim_pos",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "userStats",
        type: "uint256[]",
      },
      {
        internalType: "address[]",
        name: "uplines",
        type: "address[]",
      },
      {
        internalType: "bool[]",
        name: "uplinesRewardsAllowed",
        type: "bool[]",
      },
      {
        internalType: "address",
        name: "nextUplineRewarded",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bnbBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default faucetReaderAbi;
