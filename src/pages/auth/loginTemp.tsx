import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import InputField from "../../components/forms/InputField";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import Footer from "../../components/Footer";
import * as yup from "yup";
import { login } from "../../store/features/Auth/Auth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser } from "../../store/features/Auth/AuthSlice";
import { Alert } from "@material-ui/lab";
import { extractErrorMessage } from "../../helpers";
import LangSwitch from "../../components/LangSwitch";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import { toast } from "material-react-toastify";
import {
  setTransferFromType,
  setExternalApiPaymentId,
} from "../../store/features/Transfer/TransferSlice";

const validationSchema = yup.object().shape({
  password: yup.string().required("Password is a required field"),
  email: yup.string().email(),
});

const styles = {
  form: {
    height: "100vh",
    backgroundColor: "#fff",
  },
  image: {
    height: "100vh",
    backgroundImage: "url(" + bg + ")",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
};

const LoginTemp = () => {
  const { t } = useTranslation();
  const {
    auth: { user, access_token, isLoggedIn },
    transfer: { transferFromType },
  } = useAppSelector((state) => state.persistedReducer);
  const [errorMessage, showErrorMessage] = useState<string[]>([]);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const search = useLocation().search;
  const queryURL = new URLSearchParams(search).get("paiment_external_id");

  useEffect(() => {
    if (queryURL) {
      dispatch(setTransferFromType("external_api"));
      dispatch(setExternalApiPaymentId(queryURL));
      if (isLoggedIn && access_token && user) {
        history.push("/complete_form");
      }
    }
  }, []);

  return (
    <div
      className="row h-screen w-screen p-0 overflow-y-scroll"
      style={{ ...styles.image }}
    >
      <div
        className="col-md-6 p-0 h-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="bg-white p-4"></div>
      </div>
      <div
        className="col-md-6"
        style={{ backgroundColor: "transparent" }}
      ></div>
    </div>
  );
};

export default LoginTemp;
