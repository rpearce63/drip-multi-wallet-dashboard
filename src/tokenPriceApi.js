let pancakeSwapAbi = [
  {
    inputs: [
      { internalType: "address", name: "_factory", type: "address" },
      { internalType: "address", name: "_WETH", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint256", name: "amountADesired", type: "uint256" },
      { internalType: "uint256", name: "amountBDesired", type: "uint256" },
      { internalType: "uint256", name: "amountAMin", type: "uint256" },
      { internalType: "uint256", name: "amountBMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "amountB", type: "uint256" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountTokenDesired", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "addLiquidityETH",
    outputs: [
      { internalType: "uint256", name: "amountToken", type: "uint256" },
      { internalType: "uint256", name: "amountETH", type: "uint256" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "reserveIn", type: "uint256" },
      { internalType: "uint256", name: "reserveOut", type: "uint256" },
    ],
    name: "getAmountIn",
    outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "reserveIn", type: "uint256" },
      { internalType: "uint256", name: "reserveOut", type: "uint256" },
    ],
    name: "getAmountOut",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
    ],
    name: "getAmountsIn",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
    ],
    name: "getAmountsOut",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "reserveA", type: "uint256" },
      { internalType: "uint256", name: "reserveB", type: "uint256" },
    ],
    name: "quote",
    outputs: [{ internalType: "uint256", name: "amountB", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountAMin", type: "uint256" },
      { internalType: "uint256", name: "amountBMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "removeLiquidity",
    outputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "amountB", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "removeLiquidityETH",
    outputs: [
      { internalType: "uint256", name: "amountToken", type: "uint256" },
      { internalType: "uint256", name: "amountETH", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "removeLiquidityETHSupportingFeeOnTransferTokens",
    outputs: [{ internalType: "uint256", name: "amountETH", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bool", name: "approveMax", type: "bool" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "removeLiquidityETHWithPermit",
    outputs: [
      { internalType: "uint256", name: "amountToken", type: "uint256" },
      { internalType: "uint256", name: "amountETH", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bool", name: "approveMax", type: "bool" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
    outputs: [{ internalType: "uint256", name: "amountETH", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint256", name: "liquidity", type: "uint256" },
      { internalType: "uint256", name: "amountAMin", type: "uint256" },
      { internalType: "uint256", name: "amountBMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bool", name: "approveMax", type: "bool" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "removeLiquidityWithPermit",
    outputs: [
      { internalType: "uint256", name: "amountA", type: "uint256" },
      { internalType: "uint256", name: "amountB", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapETHForExactTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETH",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "amountInMax", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapTokensForExactETH",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "amountInMax", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
// let tokenAbi = [
//   {
//     inputs: [
//       { internalType: "string", name: "_name", type: "string" },
//       { internalType: "string", name: "_symbol", type: "string" },
//       { internalType: "uint256", name: "_decimals", type: "uint256" },
//       { internalType: "uint256", name: "_supply", type: "uint256" },
//       { internalType: "uint256", name: "_txFee", type: "uint256" },
//       { internalType: "uint256", name: "_burnFee", type: "uint256" },
//       { internalType: "uint256", name: "_charityFee", type: "uint256" },
//       { internalType: "address", name: "_FeeAddress", type: "address" },
//       { internalType: "address", name: "tokenOwner", type: "address" },
//     ],
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "owner",
//         type: "address",
//       },
//       {
//         indexed: true,
//         internalType: "address",
//         name: "spender",
//         type: "address",
//       },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "value",
//         type: "uint256",
//       },
//     ],
//     name: "Approval",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "previousOwner",
//         type: "address",
//       },
//       {
//         indexed: true,
//         internalType: "address",
//         name: "newOwner",
//         type: "address",
//       },
//     ],
//     name: "OwnershipTransferred",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, internalType: "address", name: "from", type: "address" },
//       { indexed: true, internalType: "address", name: "to", type: "address" },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "value",
//         type: "uint256",
//       },
//     ],
//     name: "Transfer",
//     type: "event",
//   },
//   {
//     inputs: [],
//     name: "FeeAddress",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "_BURN_FEE",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "_CHARITY_FEE",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "_TAX_FEE",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "_owner",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "owner", type: "address" },
//       { internalType: "address", name: "spender", type: "address" },
//     ],
//     name: "allowance",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "spender", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" },
//     ],
//     name: "approve",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
//     name: "burn",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "decimals",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "spender", type: "address" },
//       { internalType: "uint256", name: "subtractedValue", type: "uint256" },
//     ],
//     name: "decreaseAllowance",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "tAmount", type: "uint256" }],
//     name: "deliver",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "excludeAccount",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "includeAccount",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "spender", type: "address" },
//       { internalType: "uint256", name: "addedValue", type: "uint256" },
//     ],
//     name: "increaseAllowance",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "isCharity",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "isExcluded",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "account", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" },
//     ],
//     name: "mint",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "name",
//     outputs: [{ internalType: "string", name: "", type: "string" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "owner",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint256", name: "tAmount", type: "uint256" },
//       { internalType: "bool", name: "deductTransferFee", type: "bool" },
//     ],
//     name: "reflectionFromToken",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "renounceOwnership",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "setAsCharityAccount",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "symbol",
//     outputs: [{ internalType: "string", name: "", type: "string" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "rAmount", type: "uint256" }],
//     name: "tokenFromReflection",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "totalBurn",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "totalCharity",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "totalFees",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "totalSupply",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "recipient", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" },
//     ],
//     name: "transfer",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "sender", type: "address" },
//       { internalType: "address", name: "recipient", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" },
//     ],
//     name: "transferFrom",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
//     name: "transferOwnership",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint256", name: "_txFee", type: "uint256" },
//       { internalType: "uint256", name: "_burnFee", type: "uint256" },
//       { internalType: "uint256", name: "_charityFee", type: "uint256" },
//     ],
//     name: "updateFee",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
// ];
const Web3 = require("web3");

/*
Required Node.js
-- Usage --
1. Make a directory on your pc
2. Open a terminal 
3. go inside the created directory
4. run : npm init
5. run : npm i --save web3
6. Create a file: tokenPrice.js
7. Copy this text inside that file
8. run: node tokenPrice.js
-- Direct contact --
https://www.reddit.com/user/Linch-1
*/

let pancakeSwapContract =
  "0x10ED43C718714eb63d5aA57B78B54704E256024E".toLowerCase();

// async function calcSell(tokensToSell, tokenAddres) {
//   const web3 = new Web3("https://bsc-dataseed1.binance.org");
//   const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //BNB

//   let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddres);
//   let tokenDecimals = await tokenRouter.methods.decimals().call();

//   tokensToSell = setDecimals(tokensToSell, tokenDecimals);
//   let amountOut;
//   try {
//     let router = await new web3.eth.Contract(
//       pancakeSwapAbi,
//       pancakeSwapContract
//     );
//     amountOut = await router.methods
//       .getAmountsOut(tokensToSell, [tokenAddres, BNBTokenAddress])
//       .call();
//     amountOut = web3.utils.fromWei(amountOut[1]);
//   } catch (error) {}

//   if (!amountOut) return 0;
//   return amountOut;
// }
export async function calcBNBPrice() {
  const web3 = new Web3("https://bsc-dataseed1.binance.org");
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //BNB
  const USDTokenAddress = "0x55d398326f99059fF775485246999027B3197955"; //USDT
  let bnbToSell = web3.utils.toWei("1", "ether");
  let amountOut;
  try {
    let router = await new web3.eth.Contract(
      pancakeSwapAbi,
      pancakeSwapContract
    );
    amountOut = await router.methods
      .getAmountsOut(bnbToSell, [BNBTokenAddress, USDTokenAddress])
      .call();
    amountOut = web3.utils.fromWei(amountOut[1]);
    //console.log(`amountOut=${amountOut}`);
  } catch (error) {
    console.log(error);
  }
  if (!amountOut) return 0;
  return amountOut;
}
// function setDecimals(number, decimals) {
//   number = number.toString();
//   let numberAbs = number.split(".")[0];
//   let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
//   while (numberDecimals.length < decimals) {
//     numberDecimals += "0";
//   }
//   return numberAbs + numberDecimals;
// }
/*
How it works?
This script simply comunicates with the smart contract deployed by pancakeswap and calls the main
function that was build to retrive the token prices
*/
// (async () => {
//   const tokenAddres = "0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333"; // change this with the token addres that you want to know the
//   let bnbPrice = await calcBNBPrice(); // query pancakeswap to get the price of BNB in USDT
//   console.log(`CURRENT BNB PRICE: ${bnbPrice}`);
//   // Them amount of tokens to sell. adjust this value based on you need, you can encounter errors with high supply tokens when this value is 1.
//   let tokens_to_sell = 1;
//   let priceInBnb =
//     (await calcSell(tokens_to_sell, tokenAddres)) / tokens_to_sell; // calculate TOKEN price in BNB
//   console.log(
//     "SHIT_TOKEN VALUE IN BNB : " + priceInBnb + " | Just convert it to USD "
//   );
//   console.log(`SHIT_TOKEN VALUE IN USD: ${priceInBnb * bnbPrice}`); // convert the token price from BNB to USD based on the retrived BNB value
// })();

module.exports = { calcBNBPrice };
