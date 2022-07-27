import React, { useState, useLayoutEffect, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Link, useHistory } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { IconButton, Drawer } from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Avatar from "react-avatar";
import "./style.css";
import "../../helpers/i18n";
import Home from "../../pages/Home";
import Apps from "../../pages/developer/Apps";
import History from "../../pages/History";
import Profile from "../../pages/auth/Profile";
import Settings from "../../pages/Settings";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import MakeTransfer from "../../pages/Transactions/MakeTransfer";
import {
  editUser,
  resetAuth,
  saveUserFavorites,
  setAccounts,
  setActiveMenu,
  updateBalance,
  updateCompanyState,
  updateDanaPayBankAccounts,
} from "../../store/features/Auth/AuthSlice";
import { broadcastingAuth, logout } from "../../store/features/Auth/Auth";
import { setPaymentButtonState } from "../../store/features/Transfer/TransferSlice";

import TransferSlice, {
  addLoggedInUserCountry,
  closeModal,
  fetchTransferRecords,
  resetTransfer,
  setFetchState,
  setIsFetching,
  updateCountries,
  updateTransaction,
} from "../../store/features/Transfer/TransferSlice";
import { resetDeveloper } from "../../store/features/Developer/DeveloperSlice";
import {
  currentBalance,
  getAccounts,
  getDanapayBanks,
  getTransferCountries,
  getTransfers,
} from "../../store/features/Transfer/Transfer";
import { getFavorites } from "../../store/features/Auth/Auth";
import CurrencySwitch from "../CurrencySwitch";
import LangSwitch from "../LangSwitch";
import TransactionDetails from "../TransactionDetails/TransactionDetails";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { toast } from "material-react-toastify";
import { TransitionProps } from "@material-ui/core/transitions";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";

var laravelEcho: any = null;
declare global {
  interface Window {
    Pusher: any;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Layout = () => {
  const { t } = useTranslation();
  const {
    transfer: {
      isModalOpened,
      selectedTransfer,
      page,
      fetching,
      paymentButtonState,
    },
    auth: { access_token, user, lang, isLoggedIn, active_menu },
  } = useAppSelector((state) => state.persistedReducer);

  const dispatch = useAppDispatch();
  const history = useHistory();

  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [menus, setMenu] = useState([
    {
      name: t("menuHome"),
      icon: "fa fa-home",
      path: "home",
    },
    {
      name: t("menuHistory"),
      icon: "fa fa-bookmark",
      path: "history",
    },
    {
      name: t("profile"),
      icon: "fa fa-user",
      path: "profile",
    },
    // {
    //   name: t("menuDeveloper"),
    //   icon: "fa fa-code-fork",
    //   path: "developer",
    // },
  ]);

  const handleClose = () => {
    dispatch(setPaymentButtonState({}));
  };

  const checkLoggedIn = () => {
    if (!isLoggedIn) {
      history.push("/login");
    }
  };

  const handleLogout = () => {
    confirmAlert({
      title: t("loggingOut"),
      message: t("loggingOutSure"),
      overlayClassName: "zIndexClass",
      closeOnEscape: true,
      closeOnClickOutside: true,
      buttons: [
        {
          label: t("yes"),
          onClick: () => {
            logout().then((response: any) => {
              dispatch(resetAuth());
              dispatch(resetTransfer());
              dispatch(resetDeveloper());
              history.push("/login");
            });
          },
        },
        {
          label: t("no"),
          onClick: () => {},
        },
      ],
    });
  };

  const fetchCurrentUserState = () => {
    dispatch(setIsFetching(true));
    currentBalance().then((res: any) => {
      dispatch(setIsFetching(false));
      dispatch(updateBalance(res.client.euro_balance));
      dispatch(editUser(res));
    });
  };

  const fetchAllRequired = async () => {
    dispatch(setIsFetching(true));
    try {
      const result: any = await Promise.all([
        getFavorites(),
        getTransfers(page),
        getTransferCountries(),
        getAccounts(),
        getDanapayBanks(user?.country_code),
      ]);
      dispatch(fetchTransferRecords(result[1].data));
      dispatch(saveUserFavorites(result[0]));
      dispatch(updateCountries([result[2].data, []]));
      dispatch(
        addLoggedInUserCountry(
          result[2].data.find(
            (cc: any) => cc.country_code === user?.country_code
          )
        )
      );
      dispatch(setAccounts(result[3].data));
      dispatch(updateDanaPayBankAccounts(result[4].bank_accounts));
    } catch (error: any) {
      const { status } = error;
      dispatch(setIsFetching(false));
      if (status == 401) {
        fetchAllRequired();
      }
    }
  };

  useLayoutEffect(() => {
    dispatch(
      setPaymentButtonState({
        ...paymentButtonState,
        type: "",
        transferData: "",
      })
    );
    function updateSize() {
      setWidth(window.innerWidth);
      if (window.innerWidth < 800) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    }
    checkLoggedIn();
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    currentBalance().then((response: any) => {
      dispatch(editUser({ is_individual: response?.is_individual }));
    });
    fetchAllRequired();
    fetchCurrentUserState();
  }, []);

  useEffect(() => {
    const {
      REACT_APP_WSHOST,
      REACT_APP_WSPORT,
      REACT_APP_WSSPORT,
      REACT_APP_FORCE_TLS,
    } = process.env;
    if (laravelEcho == null) {
      laravelEcho = new Echo({
        broadcaster: "pusher",
        key: "1ec7db3d-24ad-62a0-b0d1-0242ac110002",
        wsHost: REACT_APP_WSHOST,
        wsPort: REACT_APP_WSPORT,
        wssPort: REACT_APP_WSSPORT,
        forceTLS: REACT_APP_FORCE_TLS,
        encrypted: true,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        cluster: "mt1",
        authorizer: (channel: any, options: any) => {
          return {
            authorize: (socketId: any, callback: any) => {
              broadcastingAuth(socketId, channel)
                .then((response: any) => {
                  callback(false, response);
                })
                .catch((error: any) => {
                  callback(true, error);
                });
            },
          };
        },
      });

      laravelEcho
        .private(`Users.Models.Company.${user?.company?.id}`)
        .listen("CompanyActivityStatusChange", (e: any) => {
          toast.info(
            t(
              `${e.message
                .trim()
                .toLowerCase()
                .replaceAll(".", "")
                .replaceAll(" ", "_")}`
            )
          );
          fetchCurrentUserState();
        });

      laravelEcho
        .private(`User.${user?.id}`)
        .listen("PayinStatusChange", (e: any) => {
          if (e.message) {
            toast.info(
              t(
                `${e.message
                  .trim()
                  .toLowerCase()
                  .replaceAll(".", "")
                  .replaceAll(" ", "_")}`
              )
            );
            fetchAllRequired();
          }
        });

      laravelEcho
        .private(`User.${user?.id}`)
        .listen("CashoutStatusChange", (e: any) => {
          if (e.title) {
            toast.info(
              t(
                `${e.message
                  .trim()
                  .toLowerCase()
                  .replaceAll(".", "")
                  .replaceAll(" ", "_")}`
              )
            );
            fetchAllRequired();
          }
        });

      laravelEcho
        .private(`User.${user?.id}`)
        .listen("TransferStatusChange", (e: any) => {
          if (e.title) {
            toast.info(
              t(
                `${e.message
                  .trim()
                  .toLowerCase()
                  .replaceAll(".", "")
                  .replaceAll(" ", "_")}`
              )
            );
            fetchAllRequired();
          }
        });

      laravelEcho
        .private(`User.${user?.id}`)
        .listen("UserActivityStatusChange", (e: any) => {
          if (e.title) {
            fetchCurrentUserState();
            toast.info(
              t(
                `${e.message
                  .trim()
                  .toLowerCase()
                  .replaceAll(".", "")
                  .replaceAll(" ", "_")}`
              )
            );
          }
        });
    }
  }, []);

  return (
    <>
      <div
        className="bg-white shadow-sm fixed w-screen flex flex-row justify-between"
        style={{ height: 56 }}
      >
        <div
          className="flex flex-row justify-between items-center px-3"
          style={{ width: visible ? 200 : 60 }}
        >
          {visible && width > 814 && (
            <img src="/images/logofull.png" style={{ height: 20 }} />
          )}
          <button onClick={() => setVisible((prev) => !prev)}>
            <i
              className={visible ? "fa fa-times" : "fa fa-bars"}
              style={{ fontSize: 18 }}
            ></i>
          </button>
        </div>
        <div className="flex flex-1 flex-row justify-between px-3 items-center">
          <div className="flex flex-row">
            <Avatar name={user?.full_name} size="40" round />
            <div
              className="ml-4 flex flex-row justify-between items-center"
              style={{ width: 250 }}
            >
              <p className="flex flex-col">
                <b className="username">{user?.full_name}</b>
                {user?.is_individual ? (
                  <small>{t("Individual_Account")}</small>
                ) : (
                  <small>{user?.company?.name} </small>
                )}
              </p>
              {/* {user?.company && !user?.company?.is_active && (
                <p className="flex flex-col text-right text-sm">
                  <b>
                    <small>{t("not_verified")}</small>
                  </b>
                  <a href="#" className="underline">
                    <small>{t("verify_my_account")}</small>
                  </a>
                </p>
              )} */}
            </div>
          </div>
          {visible && (
            <div className="flex flex-row items-center">
              <div className="mr-4">
                <CurrencySwitch />
              </div>
              <div className="mr-4">
                <LangSwitch />
              </div>
              <a
                className="mr-4 cursor-pointer bg-gray-200 flex justify-center items-center"
                onClick={() => handleLogout()}
                style={{ height: 40, width: 40, borderRadius: 20 }}
              >
                <span>
                  <i className="fa fa-sign-out m-0 p-0"></i>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row overflow-hidden">
        <div
          className={
            visible
              ? "menu conHeight flex flex-col justify-between"
              : "iconsMenu conHeight flex flex-col justify-between"
          }
        >
          <ul>
            {menus.map((menu) => (
              <li
                onClick={() => {
                  dispatch(setActiveMenu(menu.path));
                  history.push(`/dashboard/${menu.path}`);
                }}
                key={menu.name}
                className={`${
                  active_menu === menu.path ? "active_menu" : "in_active_menu"
                }`}
              >
                <i className={`${menu.icon}`}></i>
                {visible && <small>{menu.name}</small>}
              </li>
            ))}
            {!visible && (
              <>
                <li
                  className={
                    visible
                      ? "p-3"
                      : " flex flex-col justify-center items-center p-3"
                  }
                >
                  <CurrencySwitch />
                </li>
                <li
                  className={
                    visible
                      ? "p-3"
                      : " flex flex-col justify-center items-center p-3"
                  }
                >
                  <LangSwitch />
                </li>
              </>
            )}
          </ul>
          <ul>
            <li className="in_active_menu">
              <a target="_blank" href="https://www.danapay.com/company/cgu-cgv">
                <i className="fa fa-globe"></i>
                {visible && <small>{t("menuTerms")}</small>}
              </a>
            </li>
            <li onClick={() => handleLogout()} className="in_active_menu">
              <i className="fa fa-sign-out"></i>
              {visible && <small>Logout</small>}
            </li>
          </ul>
        </div>
        <div
          className={
            visible
              ? "withMenu conHeight bgContent"
              : "conHeight withIconsMenu bgContent"
          }
        >
          {fetching ? (
            <>
              <div className="container">
                <b className="text-gray-400">
                  <small>{t("Your_current_balance")}</small>
                </b>
                <Skeleton height={80} />
                <br />
                <b className="text-gray-400">
                  <small>{t("Contacts")}</small>
                </b>
                <Skeleton height={140} />
                <br />
                <b className="text-gray-400">
                  <small>{t("Latest_Transactions")}</small>
                </b>
                <Skeleton height={300} />
              </div>
            </>
          ) : (
            <>
              <Route path="/dashboard/home">
                <Home />
              </Route>
              <Route path="/dashboard/developer">
                <Apps />
              </Route>
              <Route path="/dashboard/history">
                <History />
              </Route>
              <Route path="/dashboard/profile">
                <Profile />
              </Route>
              <Route path="/dashboard/settings">
                <Settings />
              </Route>
            </>
          )}
        </div>
      </div>
      <Drawer
        anchor="right"
        open={isModalOpened}
        variant="temporary"
        elevation={20}
      >
        <div className="overflow-y-hidden h-screen">
          <div
            className="flex flex-row items-center py-2 px-2"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
          >
            <button
              onClick={() => dispatch(closeModal())}
              className="btn rounded-md shadow-md"
              style={{ backgroundColor: "rgba(60, 115, 117, .6)" }}
            >
              <small className="font-bold text-white">{t("close")}</small>
            </button>
            <p className="mx-5 text-white font-bold">
              {t("TransactionDetails")}
            </p>
          </div>
          <div className="overflow-y-auto bg-green-200"></div>
          <TransactionDetails selectedTransfer={selectedTransfer} />
        </div>
      </Drawer>

      {paymentButtonState?.type && (
        <Dialog
          fullScreen
          keepMounted
          open={paymentButtonState?.type == "" ? false : true}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <div
            className=" py-2 flex flex-row px-4 items-center justify-between"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
          >
            <span className="text-white">{t("start_Transfer")}</span>
            <button
              className="btn rounded-lg   shadow-lg px-4"
              style={{ backgroundColor: "rgba(3, 115, 117, .6)" }}
              onClick={handleClose}
            >
              <b className="text-white">{t("close")}</b>
            </button>
          </div>
          <MakeTransfer />
        </Dialog>
      )}
    </>
  );
};
