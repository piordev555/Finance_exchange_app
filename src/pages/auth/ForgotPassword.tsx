import React, { useLayoutEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import InputField from "../../components/forms/InputField";
import { HashLink as Link } from "react-router-hash-link";
import Footer from "../../components/Footer";
import LangSwitch from "../../components/LangSwitch";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import { requestPasswordResetLink } from "../../store/features/Auth/Auth";
import { toast } from "material-react-toastify";
import { extractError } from "../../utility";

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
    height: 30,
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

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [size, setSize] = useState([0, 0]);
  const [error, setError] = useState(" ");
  const classes = useStyles();

  const HandleBtnClick = () => {
    setProcessing(true);
    requestPasswordResetLink({ email })
      .then((response: any) => {
        setProcessing(false);
        toast.success(t("passwordLinkSent"));
      })
      .catch((error: any) => {
        setProcessing(false);
        toast.error(extractError(error));
      });
  };

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
      <div className="col-md-5 p-0 h-screen">
        <div className="flex flex-row justify-between p-4 shadow-md">
          <img src="images/logofull.png" style={{ height: 20 }} alt="" />
          <div>
            <Link to="/login" className="py-2 px-8 mx-2 rounded font-bold">
              {t("login")}
            </Link>
            <LangSwitch />
          </div>
        </div>
        <div className="flex justify-center items-center py-10  h-screen">
          <div
            className="m-auto p-4 mx-10 shadow-lg bg-white rounded-lg"
            style={{ width: "95%" }}
          >
            <br />
            <h2 className="text-2xl font-bold">{t("forgotPass")}</h2>
            <p className="mb-3 text-base">{t("fptext")}</p>
            <form className={classes.formBox}>
              <InputField
                name="Email Address"
                handleChange={(value: any) => {
                  setEmail(value.target.value);
                  if (!/^\S+@\S+\.\S+$/.test(email)) {
                    setError(t("email_not_valid"));
                  } else {
                    setError("");
                  }
                }}
                value={email}
                error={error}
              />

              <div className="flex flex-row justify-between mt-2 items-center">
                {processing ? (
                  <button
                    className="btn rounded-lg"
                    style={{ backgroundColor: "rgb(3, 115, 117)" }}
                    disabled
                  >
                    <small className="text-white font-bold">
                      {t("processing")}
                    </small>
                  </button>
                ) : (
                  <button
                    onClick={HandleBtnClick}
                    className="btn rounded-lg"
                    style={{ backgroundColor: "rgb(3, 115, 117)" }}
                    disabled={error.length !== 0}
                  >
                    <small className="text-white font-bold">
                      {t("RequestLink")}
                    </small>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      {}
      <div
        className="col-md-7 p-0 h-screen"
        style={{ ...style.image, height: size[0] < 800 ? 0 : "100%" }}
      ></div>
    </div>
  );
};

export default ForgotPassword;
