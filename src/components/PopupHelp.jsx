import React from "react";
import { Button, Popup, Icon } from "semantic-ui-react";

const PopupHelp = ({ message, trigger }) => (
  <Popup
    content={message}
    trigger={
      trigger || (
        <Button>
          <Icon name="question circle outline" />{" "}
        </Button>
      )
    }
    basic
  />
);

export default PopupHelp;
