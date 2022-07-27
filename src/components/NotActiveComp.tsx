import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import SumSub from "./Sumsub";
import { setPaymentButtonState } from "../store/features/Transfer/TransferSlice";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  t: any;
  setWithDrawOpen: any;
  startTransfer: any;
  startBulkPayments: any;
  size?: any;
};

const NotActiveComp = ({
  t,
  setWithDrawOpen,
  startBulkPayments,
  startTransfer,
  size,
}: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.persistedReducer.auth);
  const { transfer } = useAppSelector((state) => state.persistedReducer);
  const [open, setOpen] = React.useState(false);

  const canPerformActions = () => {
    if (user?.is_individual) {
      if (user?.is_active) {
        return true;
      } else {
        return false;
      }
    } else {
      if (user?.is_active && user?.company.is_active) {
        return true;
      } else {
        return false;
      }
    }
  };

  return (
    <>
      {canPerformActions() ? (
        <>
          {setWithDrawOpen !== null && (
            <div
              className={
                size[0] > 500 ? "flex flex-row" : " flex flex-wrap flex-col"
              }
            >
              <button
                className={`btn bg-blue-400 ${
                  size[0] > 500 ? "mr-2 rounded-lg" : "mb-2  border-r-2"
                }`}
                onClick={() => {
                  dispatch(
                    setPaymentButtonState({
                      ...transfer.paymentButtonState,
                      type: "instant",
                    })
                  );

                  startTransfer("instant");
                }}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <i className="fa fa-paper-plane-o text-white mr-3" />
                <b className="text-white font-bold">
                  <small style={{ fontSize: 10 }}>{t("InstantPayment")}</small>
                </b>
              </button>

              {!user?.is_individual && (
                <button
                  className={`btn   bg-blue-400 ${
                    size[0] > 500 ? "mr-2 rounded-lg" : "mb-2 "
                  }`}
                  onClick={() => startBulkPayments()}
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                >
                  <i className="fa fa-flash text-white mr-3" />
                  <b className="text-white font-bold">
                    <small style={{ fontSize: 10 }}>{t("bulkPayment")}</small>
                  </b>
                </button>
              )}

              <button
                className={`btn  bg-blue-400 ${
                  size[0] > 500 ? "mr-2 rounded-lg" : "mb-2  "
                }`}
                onClick={() => setWithDrawOpen(true)}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <i className="fa fa-minus-circle text-white mr-3" />
                <b className="text-white font-bold">
                  <small style={{ fontSize: 10 }}>{t("Withdraws")}</small>
                </b>
              </button>
            </div>
          )}
        </>
      ) : (
        <div
          className="py-3 rounded shadow-sm px-3 flex flex-row justify-between items-center"
          style={{ backgroundColor: "#e09a01" }}
        >
          <p className="text-white text-wrap text-sm">
            {!user?.is_individual ? (
              <b>{t("InformationDesc")}</b>
            ) : (
              <b>
                {user?.is_verified ? t("userNotActive") : t("userNotVerify")}
              </b>
            )}
          </p>

          {user?.is_individual && !user?.is_verified && (
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="verifyBtn btn btn-sm text-white px-3"
              style={{ backgroundColor: "rgb(174, 120, 0)" }}
            >
              <small>{t("verify")}</small>
            </button>
          )}
        </div>
      )}

      <Dialog
        fullScreen
        open={open}
        onClose={() => {
          setOpen((prev) => !prev);
        }}
        TransitionComponent={Transition}
      >
        <div className=" py-2 flex flex-row px-4 items-center justify-between">
          <span className="text-white">{t("start_Transfer")}</span>
          <button
            className="btn rounded-lg shadow-lg px-4 flex justify-center items-center"
            onClick={() => setOpen((prev) => !prev)}
            style={{ height: 50, width: 50, borderRadius: 25 }}
          >
            <i className=" fa fa-close text-gray-600 m-0"></i>
          </button>
        </div>
        <>
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6 text-center">
              <SumSub
                phone={user?.full_phone_number}
                finish={() => setOpen((prev) => !prev)}
              />
            </div>
            <div className="col-md-3"></div>
          </div>
        </>
      </Dialog>
    </>
  );
};

export default NotActiveComp;
