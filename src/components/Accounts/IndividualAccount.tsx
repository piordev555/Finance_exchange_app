import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "material-react-toastify";
import {
  deleteUserBankAccount,
  deleteUserMMAccount,
} from "../../store/features/Auth/Auth";
import {
  deleteBankAccount,
  setSelectedBank,
  deleteMMAccount,
} from "../../store/features/Auth/AuthSlice";
import "./style.css";
import { getCountryNameFromCode } from "../../utilities/help";

type Props = {
  account: any;
  setEditModalOpen: any;
  type: string;
};

const IndividualAccount = ({ account, setEditModalOpen, type }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    transfer,
    auth: { selected_account },
  } = useAppSelector((state) => state.persistedReducer);

  const useStyles = makeStyles({
    title: {
      color: "#037375",
      fontWeight: 500,
    },
  });
  const classes = useStyles();

  return (
    <div
      className="w-full p-3 text-gray-600 cursor-pointer"
      style={{
        maxWidth: "650px",
      }}
    >
      <div
        className="bg-white pl-8 pr-8 pt-3 pb-8 flex flex-column shadow-md rounded-lg mr-3"
        style={{
          borderWidth: selected_account?.id === account?.id ? 2 : 0,
          borderColor: "rgb(3, 115, 117)",
        }}
        onClick={() => {
          dispatch(setSelectedBank(account));
        }}
      >
        <div className="flex justify-end">
          <button
            className="pr-8"
            onClick={(e) => {
              dispatch(setSelectedBank(account));
              setEditModalOpen(true);
            }}
          >
            {t("edit")}
          </button>
          <button
            onClick={(e) => {
              const selectedId = account.id;
              dispatch(setSelectedBank(account));
              confirmAlert({
                title: t("confirm"),
                message: t("Are_you_want_to_delete"),
                overlayClassName: "overlay-custom-class-name",
                closeOnEscape: true,
                closeOnClickOutside: true,
                buttons: [
                  {
                    label: t("yes"),
                    onClick: () => {
                      type == "bank"
                        ? deleteUserBankAccount(account.id).then(() => {
                            toast.error(t("Deleted_successfully"));
                            dispatch(deleteBankAccount(account.id));
                          })
                        : deleteUserMMAccount(account.id).then(() => {
                            toast.error(t("Deleted_successfully"));
                            dispatch(deleteMMAccount(account.id));
                          });
                    },
                  },
                  {
                    label: t("no"),
                    onClick: () => {},
                  },
                ],
              });
            }}
          >
            {t("delete")}
          </button>
        </div>
        <div className="w-full flex contentContainer">
          {type == "bank" ? (
            <div className="w-2/3">
              <div>
                <small className={classes.title}>{t("title")}</small>
                <h4>{account.title}</h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>{t("owner_name")}</small>
                <h4>
                  {account.owner} {type}
                </h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>IBAN</small>
                <h4 className="ibanNumber">{account.iban}</h4>
              </div>
            </div>
          ) : (
            <div className="w-2/3">
              <div className="pt-2">
                <small className={classes.title}>{t("Country")}</small>
                <h4>
                  {getCountryNameFromCode(
                    transfer,
                    account.account.country_code
                  )}
                </h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>{t("title")}</small>
                <h4>{account.account.title}</h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>{t("Operator")}</small>
                <h4>{account.operator}</h4>
              </div>
            </div>
          )}

          {type == "bank" ? (
            <div className="w-1/3 mt-12 rightPart">
              <div>
                <small className={classes.title}>{t("Country")}</small>
                <h4>{account.country}</h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>BIC</small>
                <h4>{account.bic}</h4>
              </div>
            </div>
          ) : (
            <div className="w-1/3 mt-12 rightPart">
              <div>
                <small className={classes.title}>{t("Owner_Name")}</small>
                <h4>{account.account.owner_name}</h4>
              </div>
              <div className="pt-2">
                <small className={classes.title}>{t("Phone_Number")}</small>
                <h4>{account.phone_number}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualAccount;
