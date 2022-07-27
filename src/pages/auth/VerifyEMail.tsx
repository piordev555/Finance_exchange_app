import React, { useLayoutEffect, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import bg from "../../images/bgImg.jpeg";
import { HashLink as Link } from "react-router-hash-link";
import Footer from "../../components/Footer";
import { resendEmail } from "../../store/features/Auth/Auth";
import { useAppSelector } from "../../store/hooks";
import LangSwitch from "../../components/LangSwitch";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import { toast } from "material-react-toastify";

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

const VerifyEMail = () => {
  const user = useAppSelector((state) => state.persistedReducer.auth.user) || {
    email: "",
  };
  const [processing, setProcessing] = useState(false);
  const [size, setSize] = useState([0, 0]);
  const classes = useStyles();
  const { t } = useTranslation();

  const HandleBtnClick = () => {
    setProcessing(true);
    resendEmail({ email: user?.email })
      .then((result: any) => {
        setProcessing(false);
        const text = result.message
          .trim()
          .toLowerCase()
          .replaceAll(".", "")
          .replaceAll(" ", "_");
        toast.success(t(text));
      })
      .catch((error) => {
        setProcessing(false);
        if (error.status === 422 || error.status === 500) {
          const err: any = Object.values(error.data.errors)[0];
          toast.error(err[0]);
        }
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
    <div className="row w-screen h-screen overflow-hidden ">
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
            <h2 className="text-2xl font-bold w-2/3">{t("sent_code")}</h2>
            <p className="my-2 mb-4">{t("click_to_continue")}</p>
            {processing ? (
              <p>{t("Please_wait")}...</p>
            ) : (
              <button
                className="btn"
                onClick={HandleBtnClick}
                disabled={processing}
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <span className="text-white capitalize">
                  {t("Send_New_Link")}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-7 p-0  h-screen" style={{ ...style.image }}></div>
    </div>
  );
};

export default VerifyEMail;
