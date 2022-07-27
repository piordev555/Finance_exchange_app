import React from "react";
import "./style.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import MakeTransfer from "../../pages/Transactions/MakeTransfer";
import {
  addBeneficiary,
  addTransferCountry,
  addTransferResult,
  setExternalApiPaymentId,
  setTransferFromType,
  updateEscrowState,
} from "../../store/features/Transfer/TransferSlice";
import Cashout from "../../pages/Transactions/Cashout";
import Deposit from "../../pages/Transactions/Deposit";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import CashLayout from "../CashLayout";
import BulkPayment from "../BulkPayment";
import PayByLink from "../PayByLink";
import NotActiveComp from "../NotActiveComp";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MiniProfile = () => {
  const [open, setOpen] = React.useState(false);
  const [withDrawOpen, setWithDrawOpen] = React.useState(false);
  const [deposit, setDepositOpen] = React.useState(false);
  const [bulkPaymentModal, setBulkPaymentModal] = React.useState(false);
  const [payByLink, openPayByLink] = React.useState(false);
  const [size, setSize] = React.useState([0, 0]);
  const {
    auth: { user, userBalance },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
  };

  const startTransfer = (type: any) => {
    dispatch(setTransferFromType("internal"));
    dispatch(setExternalApiPaymentId(null));
    dispatch(addBeneficiary(null));
    dispatch(addTransferCountry(null));
    dispatch(addTransferResult(null));
    setOpen(true);
    if (type === "escrow") {
      dispatch(updateEscrowState(true));
    } else {
      dispatch(updateEscrowState(false));
    }
  };

  const startBulkPayments = () => {
    setBulkPaymentModal(true);
  };

  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <>
      <section className="profile rounded-lg">
        <small className="font-bold text-gray-600">
          {t("Your_current_balance")}
        </small>

        <div className="balance">
          <div className="flex">
            <div
              className={
                size[0] > 700
                  ? `balanceBox mr-10 flex-row w-full`
                  : `flex justify-center items-center text-center flex-col w-full`
              }
            >
              <h1 className="font-bold text-gray-600">
                <CashLayout cash={userBalance} size="text-xl" />
              </h1>
              <br />
              <NotActiveComp
                t={t}
                setWithDrawOpen={setWithDrawOpen}
                startBulkPayments={startBulkPayments}
                startTransfer={startTransfer}
                size={size}
              />
            </div>
          </div>
        </div>

        <Dialog
          fullScreen
          open={withDrawOpen}
          onClose={() => setWithDrawOpen(false)}
          TransitionComponent={Transition}
        >
          <Cashout setWithDrawOpen={setWithDrawOpen} />
        </Dialog>

        <Dialog
          fullScreen
          open={deposit}
          onClose={() => setDepositOpen(false)}
          TransitionComponent={Transition}
        >
          <Deposit setDepositOpen={setDepositOpen} />
        </Dialog>

        <Dialog
          fullScreen
          open={bulkPaymentModal}
          onClose={() => setBulkPaymentModal(false)}
          TransitionComponent={Transition}
        >
          <BulkPayment setBulkPaymentModal={setBulkPaymentModal} t={t} />
        </Dialog>

        <Dialog
          fullScreen
          open={payByLink}
          onClose={() => openPayByLink(false)}
        >
          <PayByLink closePayByLInk={() => openPayByLink(false)} t={t} />
        </Dialog>
      </section>
    </>
  );
};

export default MiniProfile;
