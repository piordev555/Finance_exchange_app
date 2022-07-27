import React, { useLayoutEffect, useState } from "react";
import "./style.css";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSelected } from "../../store/features/Transfer/TransferSlice";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import StatusButtons from "../StatusButtons";
import CashLayout from "../CashLayout";

// import moment
interface Props {
  transaction: any;
}

const colors: any = {
  warning: { bg: "#fff0b3", text: "#8F7200" },
  pending: { bg: "#fff0b3", text: "#8F7200" },
  started: { bg: "#fff0b3", text: "#8F7200" },
  funds_escrowed: { bg: "#fff0b3", text: "#8F7200" },
  transfered: { bg: "#e3fcef", text: "#0E8145" },
  released: { bg: "#e3fcef", text: "#0E8145" },
  escrowing: { bg: "#eee", text: "#777" },
  transfering: { bg: "#eee", text: "#777" },
  releasing: { bg: "#feeae6", text: "#9D2007" },
  paying_in: { bg: "#fff0b3", text: "#8F7200" },
  paying_out: { bg: "#fff0b3", text: "#8F7200" },
  payment_failed: { bg: "#feeae6", text: "#9D2007" },
  payment_started: { bg: "#fff0b3", text: "#8F7200" },
  revoking_refund_confirmation: { bg: "#fff0b3", text: "#8F7200" },
  payment_pending: { bg: "#fff0b3", text: "#8F7200" },
  payed_out: { bg: "#e3fcef", text: "#0E8145" },
  completed: { bg: "#e3fcef", text: "#0E8145" },
  payed_in: { bg: "#e3fcef", text: "#0E8145" },
  validated: { bg: "orange", text: "#333" },
};

const TransactionListItem: React.FC<Props> = ({ transaction }) => {
  const { source_user, destination_user } = transaction;
  const [size, setSize] = useState([0, 0]);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    auth: { user },
  } = useAppSelector((state) => state.persistedReducer);
  const isSender = user?.id === source_user?.id;

  const OpenModal = () => {
    dispatch(setSelected(transaction));
  };

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <>
      {size[0] > 700 ? (
        <TableRow className="cursor-pointer hover:bg-gray-100">
          <TableCell onClick={() => OpenModal()}>
            {isSender ? (
              <div className="sender_circle">
                {transaction.operation_type === "escrow" && (
                  <i className="fa fa-arrow-up"></i>
                )}
                {transaction.operation_type === "instant" && (
                  <i className="fa fa-arrow-up"></i>
                )}
                {transaction.operation_type === "pay_out" && (
                  <b>
                    <small style={{ color: "rgb(23, 186, 8)" }}>PO</small>
                  </b>
                )}
                {transaction.operation_type === "deposit" && (
                  <b>
                    <small style={{ color: "rgb(23, 186, 8)" }}>DO</small>
                  </b>
                )}
              </div>
            ) : (
              <div className="receiver_circle">
                {transaction.operation_type === "escrow" && (
                  <i className="fa fa-arrow-down "></i>
                )}
                {transaction.operation_type === "instant" && (
                  <i className="fa fa-arrow-down"></i>
                )}
              </div>
            )}
          </TableCell>

          <TableCell onClick={() => OpenModal()}>
            {transaction.operation_type === "escrow" && <>{t("Escrow")}</>}
            {transaction.operation_type === "instant" && <>{t("instant")}</>}
            {transaction.operation_type === "pay_out" && <>{t("payout")}</>}
            {transaction.operation_type === "deposit" && <>{t("Deposit")}</>}
          </TableCell>

          <TableCell onClick={() => OpenModal()}>
            {transaction.created_at?.split(" ")[0]}
          </TableCell>

          <TableCell onClick={() => OpenModal()}>
            {!isSender ? (
              <span>{source_user?.country}</span>
            ) : (
              <span>{destination_user?.country}</span>
            )}
          </TableCell>

          <TableCell onClick={() => OpenModal()}>
            {!isSender ? (
              <Avatar name={source_user?.full_name} size="40" round />
            ) : (
              <Avatar name={destination_user?.full_name} size="40" round />
            )}
          </TableCell>

          <TableCell
            onClick={() => OpenModal()}
            style={{ textTransform: "capitalize" }}
            className="capitalize"
          >
            {!isSender ? (
              <p>
                {source_user?.first_name
                  ? `${source_user?.first_name.toLowerCase()} ${source_user?.last_name.toLowerCase()}`
                  : "Name"}
              </p>
            ) : (
              <p>
                {destination_user?.first_name
                  ? `${destination_user?.first_name.toLowerCase()} ${destination_user?.last_name.toLowerCase()}`
                  : "Name"}
              </p>
            )}
          </TableCell>

          <TableCell onClick={() => OpenModal()}>
            <CashLayout cash={transaction.amount_without_fee} />
          </TableCell>

          <TableCell>
            <span
              className="badge badge-danger rounded-full  px-4 py-2"
              style={{
                backgroundColor:
                  colors[transaction.status.toLowerCase()] &&
                  colors[transaction.status.toLowerCase()]?.bg,
              }}
            >
              <small
                style={{
                  fontSize: 8,
                  color:
                    colors[transaction.status.toLowerCase()] &&
                    colors[transaction.status.toLowerCase()]?.text,
                }}
              >
                {t(transaction.status)}
              </small>
            </span>
          </TableCell>

          <TableCell>
            <div className="flex flex-row">
              <StatusButtons transfer={transaction} />
            </div>
          </TableCell>
        </TableRow>
      ) : (
        <div
          onClick={() => OpenModal()}
          className="cursor-pointer flex flex-row border-b px-2 py-4 my-2"
        >
          <div>
            {isSender ? (
              <div className="sender_circle">
                {transaction.operation_type === "escrow" && (
                  <i className="fa fa-arrow-up"></i>
                )}
                {transaction.operation_type === "instant" && (
                  <i className="fa fa-arrow-up"></i>
                )}
                {transaction.operation_type === "pay_out" && (
                  <b>
                    <small style={{ color: "rgb(23, 186, 8)" }}>PO</small>
                  </b>
                )}
                {transaction.operation_type === "deposit" && (
                  <b>
                    <small style={{ color: "rgb(23, 186, 8)" }}>DO</small>
                  </b>
                )}
              </div>
            ) : (
              <div className="receiver_circle">
                {transaction.operation_type === "escrow" && (
                  <i className="fa fa-arrow-down "></i>
                )}
                {transaction.operation_type === "instant" && (
                  <i className="fa fa-arrow-down"></i>
                )}
              </div>
            )}
          </div>
          <div className="mx-2 flex-1">
            {!isSender ? (
              <small className="font-bold">
                {source_user?.first_name
                  ? `${source_user?.first_name} ${source_user?.last_name}`
                  : "Name"}
              </small>
            ) : (
              <small className="font-bold">
                {destination_user?.first_name
                  ? `${destination_user?.first_name} ${destination_user?.last_name}`
                  : "Name"}
              </small>
            )}
            <div className="flex flex-row">
              <small>
                {!isSender ? (
                  <span>{source_user?.country}</span>
                ) : (
                  <span>{destination_user?.country}</span>
                )}
              </small>
              <small className="mx-2">
                {transaction.created_at?.split(" ")[0]}
              </small>
            </div>
          </div>
          <div className="text-right">
            <CashLayout
              cash={transaction.amount_without_fee}
              size="text-sm font-Bold"
            />
            <br />
            <span
              className="badge badge-danger rounded-full px-4 py-2 "
              style={{
                backgroundColor:
                  colors[transaction.status.toLowerCase()] &&
                  colors[transaction.status.toLowerCase()]?.bg,
              }}
            >
              <small
                style={{
                  fontSize: 8,
                  color:
                    colors[transaction.status.toLowerCase()] &&
                    colors[transaction.status.toLowerCase()]?.text,
                }}
              >
                {t(transaction.status)}
              </small>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionListItem;
