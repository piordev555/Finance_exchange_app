import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import InputField from "../../components/forms/InputField";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
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
import PasswordField from "../../components/forms/PasswordField";

const validationSchema = yup.object().shape({
  password: yup.string().required("password_required"),
  email: yup.string().email("email_not_valid").required("email_required"),
});

const style = {
  form: {
    backgroundColor: "#fff",
  },
  image: {
    backgroundImage: "url(" + bg + ")",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
};

const useStyles = makeStyles({
  root: {
    width: "100wv)",
    height: "100vh",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
  form__header: {
    backgroundColor: "#fff",
    height: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  form__body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "calc(100vh - 140px)",
  },
  form__footer: {
    padding: 10,
    height: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  footSPan: {
    fontSize: 13,
    marginRight: 20,
    fontWeight: "bold",
    color: "#666",
  },
  logo: {
    height: 40,
    width: 40,
  },
  form__header_brand: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  form__header_links: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  brandName: {
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 5,
  },
  btn: {
    textTransform: "capitalize",
    marginRight: 15,
    paddingLeft: 20,
    paddingRight: 20,
  },

  formBox: {
    marginBottom: 40,
    marginTop: 10,
  },
  formField: {
    width: "70%",
  },
});

const Login = () => {
  const { t } = useTranslation();
  const {
    auth: { user, access_token, isLoggedIn },
    transfer: { transferFromType },
  } = useAppSelector((state) => state.persistedReducer);
  const [errorMessage, showErrorMessage] = useState<string[]>([]);
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const search = useLocation().search;
  const queryURL = new URLSearchParams(search).get("payment_id");

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
    <div className="row w-screen h-screen overflow-hidden m-0">
      <div className="col-md-5 h-full p-0">
        <div className="flex flex-row justify-between p-4 shadow-md">
          <img
            src="images/logofull.png"
            style={{ height: 20 }}
            alt="DanaPay Logo"
          />
          <div>
            <Link to="/join" className="py-2 px-8 mx-2 rounded font-bold">
              {t("register")}
            </Link>
            <LangSwitch />
          </div>
        </div>
        <div className="flex justify-center items-center py-10 h-screen">
          <div
            className="m-auto  mx-10 p-4 shadow-lg bg-white rounded-lg"
            style={{ width: "95%" }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ width: "80%" }}>
              {t("welcome")}
            </h2>
            <p className="mb-8 text-base">{t("loginText")}</p>
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={(data, { setSubmitting }) => {
                try {
                  setSubmitting(true);
                  showErrorMessage([]);
                  // login user data
                  login(data)
                    .then((result: any) => {
                      setSubmitting(false);
                      // if the response hasa token [user exists]
                      if (result.access_token) {
                        // store the user data in redux store
                        localStorage.setItem("user:key", result.access_token);
                        dispatch(loginUser(result));

                        //if user email is verified
                        if (result.user?.email_verified_at !== null) {
                          //check if user has temporary password
                          if (result.user?.has_temporary_password) {
                            history.push("/changePassword");
                          } else {
                            if (
                              result.user?.client.type === "temporary-customer"
                            ) {
                              history.push("/register");
                              // check if user added company
                            } else if (
                              result.user?.company === null &&
                              !result.user?.is_individual
                            ) {
                              history.push("/register");
                            } else {
                              // check if user was
                              if (transferFromType === "internal") {
                                history.push("/dashboard/home");
                              } else {
                                // if not temporary and was redirect from client website
                                history.push("/complete_form");
                              }
                            }
                          }
                        } else {
                          // if email is not verified go to verify email screen
                          history.push("/verify");
                        }
                      } else {
                        toast.warning(JSON.stringify(result));
                      }
                    })
                    .catch((error) => {
                      setSubmitting(false);
                      const err = extractErrorMessage(error);
                      const errorArray = err.map((errorText: string) =>
                        errorText
                          .toLowerCase()
                          .trim()
                          .replaceAll(".", "")
                          .replaceAll(" ", "_")
                      );
                      showErrorMessage(errorArray);
                    });
                } catch (error: any) {
                  showErrorMessage((err) => [...err, error.message]);
                }
              }}
              validationSchema={validationSchema}
            >
              {({
                values,
                handleChange,
                handleBlur,
                errors,
                touched,
                isSubmitting,
              }) => (
                <Form className={classes.formBox}>
                  <InputField
                    name="email"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    label={t("Email_Address")}
                    error={t(`${errors.email}`)}
                    touched={touched.email}
                  />

                  <PasswordField
                    name="password"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    label={t("password")}
                    error={t(`${errors.password}`)}
                    touched={touched.password}
                    type="password"
                  />
                  <div className="flex flex-row justify-between mt-10 items-center">
                    <button
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      type="submit"
                      disabled={isSubmitting}
                      className="btn rounded-lg px-10"
                    >
                      <span className="text-white capitalize">
                        {t("login")}
                      </span>
                    </button>
                    <Link to="/forgotpassword">
                      <small>{t("forgotPass")}</small>
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
            {errorMessage.length > 0 && (
              <div className="mb-4">
                <Alert severity="error">
                  {errorMessage.map((errorText: string, index: number) => (
                    <p>
                      <small key={index}>{t(errorText)}</small>
                    </p>
                  ))}
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-7 h-full p-0" style={{ ...style.image }}></div>
    </div>
  );
};

export default Login;
