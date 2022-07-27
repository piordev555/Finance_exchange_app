import React, { useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import { useTranslation } from "react-i18next";
import {
  cancelTransfer,
  cancelWithdraw,
} from "./../store/features/Transfer/Transfer";

const withCancel = (WrappedComponent) => {
  const WithCancel = ({ props }) => {
    const [cancelling, setCancelling] = useState(false);
    const { t } = useTranslation();

    const cancel = (type, id) => {
      confirmAlert({
        title: t("cancelTitle"),
        message: t("cancelMessage"),
        overlayClassName: "bg-teal-600 z-[1000]",
        buttons: [
          {
            label: t("yes"),
            onClick: () => {
              setCancelling(true);
              if (type === "w") {
                cancelWithdraw(id)
                  .then((res) => {
                    setCancelling(false);
                  })
                  .catch((err) => {
                    setCancelling(false);
                  });
              } else {
                cancelTransfer(id)
                  .then((res) => {
                    setCancelling(false);
                  })
                  .catch((err) => {
                    setCancelling(false);
                  });
              }
            },
          },
          {
            label: t("no"),
            onClick: () => {},
          },
        ],
      });
    };

    return (
      <WrappedComponent cancel={cancel} cancelling={cancelling} {...props} />
    );
  };
  return WithCancel;
};

export default withCancel;
