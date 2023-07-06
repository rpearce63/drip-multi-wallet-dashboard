function calculateDaysToMaxDeposits(initialDeposits, initialClaimed) {
  let deposits = Number(initialDeposits);
  let claimed = Number(initialClaimed);

  let days = 0;

  while (deposits < 27398) {
    days++;
    const dailyInterest = deposits * 0.01;
    let available = deposits * 0.01; // Initial available is the daily interest earned

    // Apply Whale Tax based on Claimed + Available
    if (claimed + available >= 30000) {
      const whaleTax = available * 0.15;
      available -= whaleTax;
    } else if (claimed + available >= 20000) {
      const whaleTax = available * 0.1;
      available -= whaleTax;
    } else if (claimed + available >= 10000) {
      const whaleTax = available * 0.05;
      available -= whaleTax;
    }

    const compoundAmount = available * 0.95;
    claimed += dailyInterest;
    deposits += compoundAmount;
  }

  return days;
}

const initialDeposits = Number(process.argv[2]);
const initialClaimed = Number(process.argv[3]);
const daysToMaxDeposits = calculateDaysToMaxDeposits(
  initialDeposits,
  initialClaimed
);
console.log(daysToMaxDeposits); // Output: Number of days until Deposits reaches or exceeds 27,398
