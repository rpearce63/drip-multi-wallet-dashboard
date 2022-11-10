import React, { useState } from "react";
let repeatInterval;

const ConfigValueSelector = ({
  label,
  decrementAction,
  valueThreshold,
  incrementAction,
}) => {
  const repeatFunc = (func) => {
    repeatInterval = setInterval(() => {
      func();
    }, 500);
  };
  const stopRepeatFunc = () => clearInterval(repeatInterval);

  return (
    <label className="form-check-label input-spinner-label">
      {label}
      <div className="inputSpinner">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={decrementAction}
          onMouseDown={() => repeatFunc(decrementAction)}
          onMouseUp={stopRepeatFunc}
        >
          -
        </button>
        <input
          className="inputSpinner-control"
          type="number"
          value={valueThreshold}
          onChange={() => {}}
          size={5}
          disabled={false}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={incrementAction}
          onMouseDown={() => repeatFunc(incrementAction)}
          onMouseUp={stopRepeatFunc}
        >
          +
        </button>
      </div>
      <span className="warning"> - yellow</span>
    </label>
  );
};

export default ConfigValueSelector;
