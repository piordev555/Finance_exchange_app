import React, { useState, useLayoutEffect, useEffect } from "react";
import MenuIcon from "@material-ui/icons/Menu";

import CloseBtn from "@material-ui/icons/Close";
import LangSwitch from "./components/LangSwitch";

import { IconButton, Drawer } from "@material-ui/core";
import { Route, Link, useHistory } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import Beneficiaries from "./pages/Beneficiaries";
import { Divider } from "@material-ui/core";
import TransactionDetails from "./components/TransactionDetails/TransactionDetails";
import Settings from "./pages/Settings";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  closeModal,
  fetchTransferRecords,
  resetTransfer,
  setFetchState,
  setIsFetching,
  updateCountries,
  updateTransaction,
} from "./store/features/Transfer/TransferSlice";
import {
  editUser,
  resetAuth,
  saveUserFavorites,
  updateBalance,
  updateCompanyState,
} from "./store/features/Auth/AuthSlice";
import { broadcastingAuth, getFavorites } from "./store/features/Auth/Auth";
import Apps from "./pages/developer/Apps";
import {
  getTransferCountries,
  currentBalance,
  getTransfers,
} from "./store/features/Transfer/Transfer";
import { toast } from "material-react-toastify";
import Avatar from "react-avatar";
import { resetDeveloper } from "./store/features/Developer/DeveloperSlice";
import { useTranslation } from "react-i18next";
import "./helpers/i18n";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import CurrencySwitch from "./components/CurrencySwitch";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Profile from "./pages/auth/Profile";

var laravelEcho: any = null;
declare global {
  interface Window {
    Pusher: any;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

const DRAWER_SIZE = 250;
const SMALL_DRAWER_SIZE = 60;

const Dashboard = () => {
  const { t } = useTranslation();
  const [isMenuSmall, setIsMenuSmall] = useState(false);
  const [size, setSize] = useState([0, 0]);
  const [menus, setMenu] = useState([
    {
      name: t("menuHome"),
      icon: "fa-home",
      path: "home",
    },
    {
      name: t("menuHistory"),
      icon: "fa-bookmark",
      path: "history",
    },
    {
      name: t("profile"),
      icon: "fa-user",
      path: "profile",
    },
    // {
    //   name: t("menuDeveloper"),
    //   icon: "fa-code-fork",
    //   path: "developer",
    // },
  ]);
  const {
    transfer: { isModalOpened, selectedTransfer, page, fetching },
    auth: { access_token, user, lang },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const history = useHistory();

  const fetchAllRequired = async () => {
    dispatch(setIsFetching(true));
    try {
      const result: any = await Promise.all([
        getFavorites(),
        getTransfers(page),
        currentBalance(),
        getTransferCountries(),
      ]);

      dispatch(editUser({ is_individual: result[2].is_individual }));
      dispatch(fetchTransferRecords(result[1].data));
      dispatch(saveUserFavorites(result[0]));
      dispatch(updateCountries([result[3].data, []]));
      dispatch(updateBalance(result[2].client.euro_balance));
      dispatch(setIsFetching(false));
    } catch (error: any) {
      const { status } = error;
      dispatch(setIsFetching(false));
      if (status == 401) {
        fetchAllRequired();
      }
    }
  };

  useEffect(() => {
    currentBalance().then((response: any) => {
      dispatch(editUser({ is_individual: response?.is_individual }));
    });
    fetchAllRequired();
  }, []);

  const toggleMenu = () => {
    setIsMenuSmall(!isMenuSmall);
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
            dispatch(resetAuth());
            dispatch(resetDeveloper());
            dispatch(resetTransfer());
            history.push("/login");
          },
        },
        {
          label: t("no"),
          onClick: () => {},
        },
      ],
    });
  };

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
      if (window.innerWidth < 700) {
        setIsMenuSmall(true);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
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

          if (e.data.notification_type === "company_verification_status") {
            dispatch(updateCompanyState());
          } else {
            dispatch(setFetchState());
            getTransfers(page).then((transfer) => {
              dispatch(fetchTransferRecords(transfer.data));
            });
          }
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

            dispatch(updateTransaction(e.data));
            getTransfers(1).then((transfer) => {
              dispatch(fetchTransferRecords(transfer.data));
            });
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

            dispatch(updateTransaction(e.data));
            getTransfers(1).then((transfer) => {
              dispatch(fetchTransferRecords(transfer.data));
            });
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

            dispatch(updateTransaction(e.data));
            getTransfers(1).then((transfer) => {
              dispatch(fetchTransferRecords(transfer.data));
            });
          }
        });

      laravelEcho
        .private(`User.${user?.id}`)
        .listen("UserActivityStatusChange", (e: any) => {
          if (e.title) {
            dispatch(editUser({ is_active: true }));
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
    <div style={{ display: "flex" }}>
      <Drawer anchor="left" open={true} variant="persistent" elevation={20}>
        <div
          className="menu shadow-sm flex flex-col justify-between"
          style={{
            width: isMenuSmall ? SMALL_DRAWER_SIZE : DRAWER_SIZE,
            overflowX: isMenuSmall ? "hidden" : "scroll",
            height: "100%",
          }}
        >
          <div>
            <div className="flex justify-between items-center py-2">
              {isMenuSmall ? null : (
                <div className="flex flex-row items-center">
                  <img
                    src="/images/logofull.png"
                    className="ml-4"
                    style={{ height: 22 }}
                  />
                </div>
              )}
              <div className="mr-4">
                {isMenuSmall ? (
                  <IconButton edge="end" onClick={() => toggleMenu()}>
                    <MenuIcon />
                  </IconButton>
                ) : (
                  <IconButton edge="end" onClick={() => toggleMenu()}>
                    <CloseBtn />
                  </IconButton>
                )}
              </div>
            </div>
            <Divider />
            <br />
            <ul className="divide-gray-300">
              {menus.map((listItem, index) => (
                <Link to={`/dashboard/${listItem.path}`} key={index}>
                  <li className="px-4 py-3 mb-1  cursor-pointer">
                    <i
                      className={`fa ${listItem.icon} text-gray-800 mr-2`}
                      style={{ fontSize: 18, color: "rgb(3, 115, 117)" }}
                    ></i>
                    <b className="mx-2">{!isMenuSmall && listItem.name}</b>
                  </li>
                </Link>
              ))}
              {size[0] <= 900 && (
                <>
                  <li className="py-3 px-4">
                    <i
                      className={`fa fa-money text-gray-800 mr-2`}
                      style={{ fontSize: 18, color: "rgb(3, 115, 117)" }}
                    ></i>

                    {!isMenuSmall && <CurrencySwitch />}
                  </li>
                  <li className="py-3 px-4">
                    <i
                      className={`fa fa-globe text-gray-800 mr-2`}
                      style={{ fontSize: 18, color: "rgb(3, 115, 117)" }}
                    ></i>
                    {!isMenuSmall && <LangSwitch />}
                  </li>

                  <li
                    className="px-4 py-3 flex-row mb-0"
                    onClick={() => handleLogout()}
                  >
                    <i
                      className="fa fa-sign-out text-gray-600 mr-4"
                      style={{ fontSize: 18, color: "rgb(3, 115, 117)" }}
                    ></i>
                    {!isMenuSmall && " Logout"}
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            {!isMenuSmall && (
              <div className="my-2">
                <ul className="divide-y divide-gray-300 mt-2">
                  {/* <li className="px-4 py-2 cursor-pointer">
                    <Link to="/help">
                      <small>
                        <b>{t("menuHelp")}</b>
                      </small>
                    </Link>
                  </li>*/}
                  {/* <li className="px-4 py-2 cursor-pointer">
                    <a
                      target="_blank"
                      href="https://www.danapay.com/company/cgu-cgv"
                    >
                      <small>
                        <b>{t("menuPolicy")}</b>
                      </small>
                    </a>
                  </li> */}
                  <li className="px-4 py-2 cursor-pointer">
                    <a
                      target="_blank"
                      href="https://www.danapay.com/company/cgu-cgv"
                    >
                      <small>
                        <b>{t("menuTerms")}</b>
                      </small>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Drawer>
      <div
        style={{
          marginLeft: isMenuSmall ? SMALL_DRAWER_SIZE : DRAWER_SIZE,
          width: isMenuSmall
            ? size[0] - SMALL_DRAWER_SIZE
            : size[0] - DRAWER_SIZE,
          backgroundColor: "#eee",
          height: "100vh",
        }}
      >
        <div
          className="bg-white py-2 px-4 shadow-md fixed "
          style={{
            width: isMenuSmall
              ? size[0] - SMALL_DRAWER_SIZE
              : size[0] - DRAWER_SIZE,
            zIndex: 100,
            paddingBottom: 3,
          }}
        >
          <div className="flex flex-row justify-between items-center">
            <div className=" flex-row flex">
              <Avatar name={user?.full_name} size="45" round />
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
                {user?.company && !user?.company?.is_active && (
                  <p className="flex flex-col text-right text-sm">
                    <b>
                      <small>{t("not_verified")}</small>
                    </b>
                    <a href="#" className="underline">
                      <small>{t("verify_my_account")}</small>
                    </a>
                  </p>
                )}
              </div>
            </div>
            {size[0] > 700 && (
              <div className="flex flex-row items-center">
                <span className="mx-4">
                  <CurrencySwitch />
                </span>
                <span className="mx-4">
                  <LangSwitch />
                </span>
                <button
                  onClick={() => handleLogout()}
                  className="btn rounded-md  bg-gray-600 py-2 px-3"
                >
                  <i
                    className="fa fa-sign-out text-white"
                    style={{ margin: 0, fontSize: 20 }}
                  ></i>
                </button>
              </div>
            )}
          </div>
        </div>
        {fetching ? (
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              paddingTop: 70,
              height: "100vh",
            }}
          >
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
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              marginTop: 60,
            }}
            className="p-3 h-full"
          >
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
          </div>
        )}
      </div>
      <Drawer
        anchor="right"
        open={isModalOpened}
        variant="temporary"
        elevation={20}
      >
        <div
          style={{ width: size[0] < 700 ? "90vw" : "40vw", height: "100vh" }}
          className="overflow-y-hidden"
        >
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
    </div>
  );
};

export default Dashboard;
