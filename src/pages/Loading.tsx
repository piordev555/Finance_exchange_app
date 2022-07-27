import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";
import { getToken } from "../firebaseInit";
import { saveFCMToken } from "../store/features/Auth/Auth";
import { resetAuth } from "../store/features/Auth/AuthSlice";
import { resetTransfer } from "../store/features/Transfer/TransferSlice";
import { resetDeveloper } from "../store/features/Developer/DeveloperSlice";

const Loading: React.FC = () => {
  const { t } = useTranslation();
  const authObj = useAppSelector((state) => state.persistedReducer.auth) || {};
  const history = useHistory();
  const dispatch = useAppDispatch();

  const getFCMToken = async (token: any) => {
    //get user FCM Token
    const theFCMToken = await getToken();
    if (theFCMToken) {
      saveFCMToken(theFCMToken, token);
    }
  };

  useEffect(() => {
    //check if user is already logged in
    if (authObj.isLoggedIn && authObj.access_token && authObj.user) {
      const first_name = authObj.user["first_name"];
      //check if user has first name filled {Edited their profile and Verified email}
      if (first_name !== null) {
        //get and save users FCM token
        getFCMToken(authObj.access_token);
        //move to dashboard
        history.push("/dashboard/home");
      } else {
        // move to verify email page user is not verified delete user data nd load login page.
        dispatch(resetAuth());
        dispatch(resetTransfer());
        dispatch(resetDeveloper());
        history.push("/login");
      }
    } else {
      //Load login page user is not logged in
      history.push("/login");
    }
  }, []);
  return (
    <div className="loading" style={{ backgroundColor: "rgb(3, 115, 117)" }}>
      <h1>{t("welcome")}</h1>
      <small>{t("version")} 3.0.0</small>
    </div>
  );
};

export default Loading;
