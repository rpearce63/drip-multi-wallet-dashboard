import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

const PopupHelp = ({ message }) => (
  <Popup
    content={message}
    trigger={<Icon circular name="help" size="small" />}
  />
);

export default PopupHelp;
