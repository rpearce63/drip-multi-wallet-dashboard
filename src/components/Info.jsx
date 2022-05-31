const Info = ({ backupData }) => {
  return (
    <div className="alert alert-info">
      <ul>
        <li>Click on a wallet to see upline detail</li>
        <li>Click on Team to see downline</li>
        <li>Back up addresses and labels to a file.</li>
        <ul>
          <li>
            You can then reload the data from the back up file if you clear the
            list or clear cache.
          </li>
        </ul>
      </ul>

      <p>
        <button className="btn btn-secondary" onClick={backupData}>
          Back Up
        </button>
      </p>
      <ul>
        <li>Click on row number to remove a single row</li>

        <li>
          Br34p: Amount/Levels covered. RED when not enough to cover team depth
        </li>
        <li>
          Team: displays # of Direct referrals / Total team size / Max depth of
          team
        </li>

        <li>
          Ref Pos: This value shows which upline wallet is next to receive
          rewards on the next action via the Round Robin cycle. 0 means your
          buddy is next. If you have a parent/child wallet setup, you could use
          this value to time when you want to make a new deposit in your child
          wallet so that your parent wallet gets the reward.
        </li>
      </ul>
    </div>
  );
};

export default Info;
