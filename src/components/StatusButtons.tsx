import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";
import { If, Then } from "react-if";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toast } from "material-react-toastify";
import {
  revokeExecutionConfirmation,
  revokeRefundConfirmation,
  confirmRefund,
  confirmTransaction,
  cancelWithdraw,
  cancelTransfer,
  getTransfers,
  getPaymentById,
  fetchBeneficiary,
} from "../store/features/Transfer/Transfer";
import {
  fetchTransferRecords,
  updateActedOn,
  setPaymentButtonState,
  addTransferCountry,
} from "../store/features/Transfer/TransferSlice";
import { useHistory } from "react-router";
import { CircularProgress } from "@material-ui/core";
import { confirmAlert } from "react-confirm-alert"; // Import

interface Props {
  transfer: any;
}

type Params = {
  id: string;
};

const StatusButtons: React.FC<Props> = ({ transfer }) => {
  const { t } = useTranslation();
  const {
    auth: { user },
    transfer: { actedOn },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const isSender = user?.id === transfer?.source_user?.id;
  const { transaction_id, status, payment_id, operation_type } = transfer || {};
  const statusHistory = transfer?.history;
  const history = useHistory();
  const [asking, setAsking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [fetching, setFetching] = React.useState<any>(false);

  const hasStatusChanged =
    actedOn && actedOn[transaction_id] && status === actedOn[transaction_id];

  const refund = () => {
    setAsking(true);
    confirmRefund(transaction_id)
      .then((response: any) => {
        setAsking(false);
        toast.success(response.message);
        dispatch(updateActedOn({ id: transaction_id, status }));
      })
      .catch((error: any) => {
        toast.error(error.message);
        setAsking(false);
      });
  };

  const releaseFund = () => {
    setAsking(true);
    confirmTransaction(transaction_id)
      .then((response: any) => {
        setAsking(false);
        toast.success(response.message);
        dispatch(updateActedOn({ id: transaction_id, status }));
      })
      .catch((error) => {
        setAsking(false);
        toast.error(error.message);
      });
  };

  const handleRevokeConfirmExecution = () => {
    setAsking(true);
    revokeExecutionConfirmation(transaction_id)
      .then((response: any) => {
        setAsking(false);
        dispatch(updateActedOn({ id: transaction_id, status }));
      })
      .catch((error: any) => {
        setAsking(false);
      });
  };

  const handleRevokeRefundConfirm = () => {
    setAsking(true);
    revokeRefundConfirmation(transaction_id)
      .then((res: any) => {
        setAsking(false);
        dispatch(updateActedOn({ id: transaction_id, status }));
      })
      .then((error) => {
        setAsking(false);
      });
  };

  const pay = () => {
    history.push(`/login?paiment_external_id=${payment_id}`);
  };

  const fetchBene = (data: any) => {
    fetchBeneficiary({
      country_code: data.destination_user?.country_code,
      phone_number: data.destination_user?.phone_number,
    })
      .then((res: any) => {
        dispatch(addTransferCountry(res.transferCountry));
      })
      .catch((error) => null);
  };

  const repeat = () => {
    getPaymentById(payment_id)
      .then((res) => {
        dispatch(
          setPaymentButtonState({
            ...transfer.paymentButtonState,
            type: "repeat",
            transferData: res,
          })
        );
        // calculate_fees();
      })
      .catch((error) => {
        console.log(error);
      });
    fetchBene(transfer);

    // history.push(`/repeat/${payment_id}`);
  };

  const cancel = (type: string, id: string) => {
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
                  getTransfers(1).then((res: any) => {
                    dispatch(fetchTransferRecords(res.data));
                    setCancelling(false);
                  });
                })
                .catch((err) => {
                  setCancelling(false);
                });
            } else {
              cancelTransfer(id)
                .then((res) => {
                  setCancelling(false);
                  getTransfers(1).then((res: any) => {
                    dispatch(fetchTransferRecords(res.data));
                    setCancelling(false);
                  });
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

  const buttonToShow = () => {
    if (!transfer) return;
    const operationStatus = transfer.status.toLowerCase();
    const id = transfer.transaction_id;
    const payment_id = transfer.payment_id;
    if (isSender) {
      return (
        <>
          <If condition={operationStatus === "funds_escrowed"}>
            <Then>
              <button
                onClick={() => releaseFund()}
                className="btn rounded-lg   btn-success mr-2 btn-block"
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
                disabled={hasStatusChanged}
              >
                <i className="fa fa-paper-plane-o text-white mr-2" />
                <small className="text-white  font-bold">{t("Release")}</small>
              </button>
              <button
                onClick={() => refund()}
                className="btn rounded-lg   btn-danger mr-2 btn-block"
                disabled={hasStatusChanged}
              >
                <small className="text-white  font-bold">
                  {t("AskRefund")}
                </small>
              </button>
            </Then>
          </If>

          <If condition={operationStatus === "release_warning"}>
            <Then>
              <button
                onClick={() => releaseFund()}
                className="btn rounded-lg   mr-2 btn-block"
                disabled={hasStatusChanged}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="text-white font-bold">
                  {t("Validate_Release")}
                </small>
              </button>
            </Then>
          </If>

          {/* <If
            condition={
              operationStatus === "released" || operationStatus === "refunded"
            }
          >
            <Then> */}
          <button
            onClick={() => repeat()}
            className="btn rounded-lg  mr-2 btn-block"
            disabled={hasStatusChanged}
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
          >
            <small className="text-white  font-bold">{t("Repeat")}</small>
          </button>
          {/* </Then>
          </If> */}

          <If condition={operationStatus === "payment_pending"}>
            <Then>
              <If condition={operation_type === "pay_out"}>
                {cancelling ? (
                  <small>{t("cancelling")}...</small>
                ) : (
                  <button
                    className="btn rounded-lg   mr-2 bg-red-600"
                    onClick={() => cancel("w", id)}
                  >
                    <small className="mx-3 text-white">{t("cancel")}</small>
                  </button>
                )}
              </If>
              <If condition={operation_type === "instant"}>
                {cancelling ? (
                  <small>{t("cancelling")}...</small>
                ) : (
                  <button
                    className="btn rounded-lg   mr-2 bg-red-600"
                    onClick={() => cancel("i", payment_id)}
                  >
                    <small className="mx-3 text-white">{t("cancel")}</small>
                  </button>
                )}
              </If>
              <If condition={operation_type === "payment_pending"}>
                <button
                  onClick={() => pay()}
                  className="btn rounded-lg  mr-2"
                  disabled={hasStatusChanged}
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                >
                  <small className="text-white  font-bold">{t("Pay")}</small>
                </button>
              </If>
            </Then>
          </If>

          <If condition={operationStatus === "waiting_refund_validation"}>
            <Then>
              <button
                onClick={() => handleRevokeRefundConfirm()}
                className="btn rounded-lg  mr-2"
                disabled={hasStatusChanged}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="text-white  font-bold">
                  {t("Revoke_Refund")}
                </small>
              </button>
            </Then>
          </If>

          <If
            condition={
              operationStatus === "escrowing" ||
              operationStatus === "payment_started" ||
              operationStatus === "releasing" ||
              operationStatus === "refunding" ||
              operationStatus === "revoking_release_confirmation" ||
              operationStatus === "revoking_refund_confirmation"
            }
          >
            <Then>
              <button
                className="btn rounded-lg   mr-2 btn-block"
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <span className="mx-3">
                  <i className="fa fa-ellipsis-h  text-white"></i>{" "}
                </span>
              </button>
            </Then>
          </If>
        </>
      );
    } else {
      return (
        <>
          <If condition={operationStatus === "funds_escrowed"}>
            <Then>
              <button
                onClick={() => refund()}
                className="btn rounded-lg   btn-danger mr-2 btn-block"
                disabled={hasStatusChanged}
              >
                <small className="text-white  font-bold">{t("Refund")}</small>
              </button>
              <button
                onClick={() => releaseFund()}
                className="btn rounded-lg   mr-2 btn-block"
                disabled={hasStatusChanged}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="text-white  font-bold">
                  {t("AskRelease")}
                </small>
              </button>
            </Then>
          </If>

          <If
            condition={
              operationStatus === "release_submitted" ||
              operationStatus === "releasing"
            }
          >
            <Then>
              <button
                onClick={() => handleRevokeRefundConfirm()}
                className="btn rounded-lg  btn-danger btn-block"
                disabled={hasStatusChanged}
              >
                <small className="text-white  font-bold">
                  {t("RevokeRefund")}
                </small>
              </button>
            </Then>
          </If>

          <If
            condition={
              operationStatus === "released" || operationStatus === "refunded"
            }
          >
            <Then></Then>
          </If>

          <If condition={operationStatus === "waiting_release_validation"}>
            <Then>
              <button
                className="btn rounded-lg  mr-2 btn-block"
                onClick={() => handleRevokeConfirmExecution()}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="mx-3 text-white">Revoke release</small>
              </button>
            </Then>
          </If>

          <If condition={operationStatus === "refund_warning"}>
            <Then>
              <button
                className="btn rounded-lg  mr-2 btn-block"
                onClick={() => refund()}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="mx-3 text-white">
                  {t("validate_refund")}
                </small>
              </button>
            </Then>
          </If>

          <If
            condition={
              operationStatus === "escrowing" ||
              operationStatus === "payment_started" ||
              operationStatus === "releasing" ||
              operationStatus === "refunding" ||
              operationStatus === "revoking_release_confirmation" ||
              operationStatus === "revoking_refund_confirmation"
            }
          >
            <Then>
              <button
                className="btn rounded-lg  mr-2 btn-block"
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
                disabled
              >
                <span className="mx-3">
                  <i className="fa fa-ellipsis-h  text-white"></i>{" "}
                </span>
              </button>
            </Then>
          </If>
        </>
      );
    }
  };
  return (
    <div>
      {asking ? (
        <div className="flex justify-center items-center">
          <CircularProgress color={"secondary"} size={20} />
        </div>
      ) : (
        // buttonToShow()
        <>
          {operation_type === "instant" && (
            <>
              <button
                onClick={() => repeat()}
                className="btn rounded-lg  mr-2 btn-block"
                disabled={hasStatusChanged}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="text-white  font-bold">{t("Repeat")}</small>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StatusButtons;
