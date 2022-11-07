import React from "react";

const ConfigValueSelector = ({
  label,
  decrementAction,
  valueThreshold,
  incrementAction,
}) => {
  return (
    <label className="form-check-label input-spinner-label">
      {label}
      <div className="inputSpinner">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={decrementAction}
        >
          -
        </button>
        <input
          className="inputSpinner-control"
          type="number"
          value={valueThreshold}
          onChange={() => {}}
          size={4}
          disabled={false}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={incrementAction}
        >
          +
        </button>
      </div>
      <span className="warning"> - yellow</span>
    </label>
  );
};

export default ConfigValueSelector;
