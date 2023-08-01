function calculateDaysToMaxDeposits(
  initialDeposits,
  initialClaimed,
  buddyIsTeamWallet = false
) {
  let deposits = initialDeposits;
  let claimed = initialClaimed;
  let days = 0;

  while (deposits < 27398) {
    days++;
    let available = deposits * 0.01;
    const whaleTier = Math.floor((claimed + available) / 10000);
    const netAvailable = (1 - 0.05 * whaleTier) * available;
    claimed += available;
    const netCompoundPct = buddyIsTeamWallet ? 0.9625 : 0.95;
    const compoundAmount = netAvailable * netCompoundPct;

    deposits += compoundAmount;
    available = 0;
  }

  return [days, deposits, claimed];
}

const initialDeposits = Number(process.argv[2]);
const initialClaimed = Number(process.argv[3]);
const buddyIsTeamWallet = !!process.argv[4];
const [days, deposits, claimed] = calculateDaysToMaxDeposits(
  initialDeposits,
  initialClaimed,
  buddyIsTeamWallet
);
console.log(days, deposits, claimed); // Output: Number of days until Deposits reaches or exceeds 27,398
