import React, { useLayoutEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import InputField from "../../components/forms/InputField";
import { useHistory } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";
import { Formik, Form } from "formik";
import { signUp } from "../../store/features/Auth/Auth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser } from "../../store/features/Auth/AuthSlice";
import { extractErrorMessage } from "../../helpers";
import { Alert } from "@material-ui/lab";
import LangSwitch from "../../components/LangSwitch";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import * as Yup from "yup";
import PasswordField from "../../components/forms/PasswordField";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("password_required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?\-_])[A-Za-z\d#$@!%&*?\-_]{8,30}$/g,
      "P_REG"
    ),
  email: Yup.string().email("email_not_valid").required("email_required"),
  confirmPassword: Yup.string()
    .required("password_required")
    .oneOf([Yup.ref("password"), null], "PSM"),
});

const style = {
  form: {
    backgroundColor: "#fff",
    height: "100vh",
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

const Join = () => {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.persistedReducer.auth.lang);
  const [size, setSize] = useState([0, 0]);
  const [errorMessage, showErrorMessage] = useState<string[]>([]);
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="row w-screen h-screen overflow-hidden m-0">
      <div className="col-md-5 p-0">
        <div className="flex flex-row justify-between p-4 shadow-md">
          <img src="images/logofull.png" style={{ height: 20 }} alt="" />
          <div>
            <Link to="/login" className="py-2 px-8 mx-2 rounded font-bold">
              {t("login")}
            </Link>
            <LangSwitch />
          </div>
        </div>
        <div className="flex justify-center items-center py-4 h-screen">
          <div
            className="m-auto mx-10 p-4 shadow-lg bg-white rounded-lg"
            style={{ width: "95%" }}
          >
            <h2 className="text-2xl font-bold mb-2">{t("sutitile")}</h2>
            <p className="mb-8 text-base">{t("suSubtitle")}</p>
            <Formik
              initialValues={{ email: "", password: "", confirmPassword: "" }}
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                showErrorMessage([]);
                signUp({
                  ...data,
                  password_confirmation: data.confirmPassword,
                })
                  .then((result) => {
                    setSubmitting(false);
                    dispatch(loginUser(result));
                    history.push("verify");
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
                  <PasswordField
                    name="confirmPassword"
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmPassword}
                    label={t("confirmPass")}
                    error={t(`${errors.confirmPassword}`)}
                    touched={touched.confirmPassword}
                    type="password"
                  />

                  <div className="flex flex-row justify-between mt-10 items-center">
                    <button
                      className="px-12 btn rounded-lg "
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <span className="text-white capitalize">
                        {t("register")}
                      </span>
                    </button>
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

            {lang === "en" ? (
              <>
                <small className="my-4">
                  By clicking on Register, you agree to our{" "}
                  <a
                    className="font-bold"
                    style={{ color: "rgb(3, 115, 117)" }}
                    target="_blank"
                    href="https://www.danapay.com/company/cgu-cgv"
                  >
                    privacy policy
                  </a>
                  applicable to the processing of your personal data and to our{" "}
                  <a
                    className="font-bold"
                    style={{ color: "rgb(3, 115, 117)" }}
                    target="_blank"
                    href="https://www.danapay.com/company/cgu-cgv"
                  >
                    Terms and Conditions
                  </a>
                </small>
              </>
            ) : (
              <>
                <small className="my-4">
                  En cliquant sur S’inscrire, vous acceptez notre{" "}
                  <a
                    className="font-bold"
                    style={{ color: "rgb(3, 115, 117)" }}
                    target="_blank"
                    href="https://www.danapay.com/company/cgu-cgv"
                  >
                    politique de confidentialité
                  </a>{" "}
                  applicable au traitement de vos données personnelles ainsi que
                  nos conditions{" "}
                  <a
                    className="font-bold"
                    style={{ color: "rgb(3, 115, 117)" }}
                    target="_blank"
                    href="https://www.danapay.com/company/cgu-cgv"
                  >
                    Conditions générales
                  </a>
                </small>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-7 p-0" style={{ ...style.image }}></div>
    </div>
  );
};

export default Join;
