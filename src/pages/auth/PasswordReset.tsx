import React, { useLayoutEffect, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import bg from "../../images/bgImg.jpeg";
import { HashLink as Link } from "react-router-hash-link";
import Footer from "../../components/Footer";
import { changePassword, passwordReset } from "../../store/features/Auth/Auth";
import InputField from "../../components/forms/InputField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser } from "../../store/features/Auth/AuthSlice";
import LangSwitch from "../../components/LangSwitch";
import { Formik, Form } from "formik";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import * as Yup from "yup";
import { toast } from "material-react-toastify";
import { extractError } from "../../utility";
import PasswordField from "../../components/forms/PasswordField";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("password_required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?\-_])[A-Za-z\d#$@!%&*?\-_]{8,30}$/g,
      "P_REG"
    ),
  password_confirmation: Yup.string()
    .required("password_required")
    .oneOf([Yup.ref("password"), null], "PSM"),
});

const style = {
  form: {
    height: "100vh",
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

const PasswordReset = () => {
  const { auth, transfer } = useAppSelector((state) => state.persistedReducer);
  const [error, setError] = useState("");
  const [size, setSize] = useState([0, 0]);
  const classes = useStyles();
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

  const search = useLocation().search;
  const token = new URLSearchParams(search).get("token");
  const email = new URLSearchParams(search).get("email");

  return (
    <div className="row w-screen h-screen overflow-hidden m-0">
      <div className="col-md-5 p-0 h-screen">
        <div className="flex flex-row justify-between p-4 shadow-md">
          <img src="images/logofull.png" style={{ height: 20 }} alt="" />
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
            <br />
            <h2 className="text-2xl font-bold"> {t("changePass")}</h2>
            <p className="my-2">{t("changePassSub")}</p>
            <Formik
              initialValues={{
                password_confirmation: "",
                password: "",
              }}
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                const passwordData = {
                  token,
                  email,
                  password: data.password,
                  password_confirmation: data.password_confirmation,
                };
                passwordReset(passwordData)
                  .then((response: any) => {
                    setSubmitting(false);
                    history.push("/");
                  })
                  .catch((error: any) => {
                    setSubmitting(false);
                    toast.error(extractError(error));
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
                    name="password"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    label={t("newPass")}
                    error={t(`${errors.password}`)}
                    type="password"
                    touched={touched.password}
                  />

                  <PasswordField
                    name="password_confirmation"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password_confirmation}
                    label={t("confirmPass")}
                    error={t(`${errors.password_confirmation}`)}
                    type="password"
                    touched={touched.password_confirmation}
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
      <div
        className="col-md-7 p-0 h-screen"
        style={{ ...style.image, height: size[0] < 800 ? 0 : "100%" }}
      ></div>
    </div>
  );
};

export default PasswordReset;
