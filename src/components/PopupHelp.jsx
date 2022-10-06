import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

const PopupHelp = () => (
  <Popup
    content="Edit the Label column and add one or more group names, separated by a comma. 
    Then filter the list by selecting a group.  Ex:  [Mine] or [Mine,Family]"
    trigger={<Icon circular name="help" size="small" />}
  />
);

export default PopupHelp;
