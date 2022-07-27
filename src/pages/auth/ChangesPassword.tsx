import React, { useLayoutEffect, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import { HashLink as Link } from "react-router-hash-link";
import Footer from "../../components/Footer";
import { changePassword } from "../../store/features/Auth/Auth";
import InputField from "../../components/forms/InputField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, editUser } from "../../store/features/Auth/AuthSlice";
import LangSwitch from "../../components/LangSwitch";
import { Formik, Form } from "formik";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import * as yup from "yup";
import PasswordField from "../../components/forms/PasswordField";
import { currentBalance } from "../../store/features/Transfer/Transfer";

const style = {
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

const validationSchema = yup.object().shape({
  oldPassword: yup.string().required("password_required"),
  newPassword: yup
    .string()
    .required("password_required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?\-_])[A-Za-z\d#$@!%&*?\-_]{8,30}$/g,
      "P_REG"
    ),
  newPassword_confirmation: yup
    .string()
    .required("password_required")
    .oneOf([yup.ref("newPassword"), null], "PSM"),
});

const ChangePassword = () => {
  const { auth, transfer } = useAppSelector((state) => state.persistedReducer);
  const [error, setError] = useState("");
  const [size, setSize] = useState([0, 0]);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {}, []);

  return (
    <div className="row w-screen h-screen overflow-hidden">
      <div className="col-md-5 p-0">
        <div className="flex flex-row justify-between p-4 shadow-md">
          <div />
          <div>
            <Link to="/login" className="py-2 px-8 mx-2 rounded">
              {t("login")}
            </Link>
            <LangSwitch />
          </div>
        </div>
        <div
          style={{ minHeight: 800 }}
          className="flex justify-center items-center"
        >
          <div
            className="shadow-lg  m-auto p-4 rounded-lg"
            style={{ width: "80%" }}
          >
            <img src="images/logofull.png" style={{ height: 20 }} alt="" />{" "}
            <br />
            <h2 className="text-2xl font-bold"> {t("changePass")}</h2>
            <p className="my-2">{t("changePassSub")}</p>
            <Formik
              initialValues={{
                newPassword_confirmation: "",
                oldPassword: "",
                newPassword: "",
              }}
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                setError("");
                changePassword(data)
                  .then((res: any) => {
                    setSubmitting(false);
                    if (res.access_token) {
                      localStorage.setItem("user:key", res.access_token);
                      dispatch(loginUser(res));
                      currentBalance()
                        .then((result: any) => {
                          dispatch(editUser(result));

                          if (
                            result.client.type.toLowerCase() ===
                            "temporary_customer"
                          ) {
                            history.push("/register");
                            // check if user added company
                          } else if (result.company === null) {
                            history.push("/register");
                          } else {
                            // check if user was from external APi
                            if (transfer.transferFromType === "internal") {
                              history.push("/dashboard/home");
                            } else {
                              history.push("/complete_form");
                            }
                          }
                        })
                        .catch((error) => {});
                    } else {
                    }
                  })
                  .catch((error) => {
                    setSubmitting(false);
                    setError(error.data.message);
                  });
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
                  <PasswordField
                    name="oldPassword"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.oldPassword}
                    label={t("oldPass")}
                    error={t(`${errors.oldPassword}`)}
                    type="password"
                    touched={touched.oldPassword}
                  />

                  <PasswordField
                    name="newPassword"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.newPassword}
                    label={t("newPass")}
                    error={t(`${errors.newPassword}`)}
                    type="password"
                    touched={touched.newPassword}
                  />

                  <PasswordField
                    name="newPassword_confirmation"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.newPassword_confirmation}
                    label={t("confirmPass")}
                    error={t(`${errors.newPassword_confirmation}`)}
                    type="password"
                    touched={touched.newPassword_confirmation}
                  />

                  <div className="flex flex-row justify-between mt-10 items-center">
                    <button
                      className="btn rounded-lg"
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      <small className="text-white">
                        <b> {t("Change_Password")}</b>
                      </small>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
            {error !== "" && (
              <div className="bg-red-100 p-2 my-2">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-7 p-0 h-screen" style={{ ...style.image }}></div>
    </div>
  );
};

export default ChangePassword;
