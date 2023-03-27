import React from "react";
import { Button, Popup } from "semantic-ui-react";

const PopupHelp = ({ message }) => (
  <Popup
    content={message}
    trigger={<Button size="mini" icon="help small" />}
    basic
  />
);

export default PopupHelp;
