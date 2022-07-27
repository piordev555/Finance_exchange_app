import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";

const VerifyingEmail = () => {
  const search = useLocation().search;
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  const performVerification = (query: any) => {
    fetch(query, {
      headers: {
        "Content-Type": "application/json",
        "X-API-SECRET": `${process.env.REACT_APP_X_REQUEST_SECRET}`,
      },
    })
      .then((res) => {
        if (res.status === 422) {
          setVerified(true);
        }
        return res.json();
      })
      .then((response) => {
        setMsg(response.message);
        if (response.verified) {
          setVerified(true);
        }
      })
      .catch((error) => {
        setVerified(false);
      });
  };

  useEffect(() => {
    const queryURL = new URLSearchParams(search).get("queryURL");
    performVerification(queryURL);
  }, [search]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          {!verified ? (
            <div className="text-center shadow-sm-lg p-20 rounded-xl bg-white">
              <img
                src="/images/loading.gif"
                alt=""
                className="m-auto"
                style={{ height: "20%" }}
              />
              <br />
              <h2 className="font-bold text-3xl mb-3 text-blue-500">
                {t("Verifying_your_Email")}
              </h2>
              <p>{t("Please_wait")}... </p>
            </div>
          ) : (
            <div className="text-center shadow-sm-lg p-20 rounded-xl bg-white">
              <img
                src="/images/email.png"
                className="m-auto"
                style={{ height: "20%" }}
              />
              <br />
              <h2 className="font-bold text-2xl mb-3 text-blue-500">
                {t("EMail_Verification")}
              </h2>
              <p style={{ textAlign: "center" }}>{t("email_validated")}</p>
              <p style={{ textAlign: "center", marginBottom: 5 }}>
                <Link to="/login" className="text-blue-400 font-bold">
                  {t("login_here")}
                </Link>
              </p>
              <br />
              <p>
                <small className="text-gray-600">Danapay</small>
              </p>
            </div>
          )}
        </div>
        <div className="col-md-6"></div>
      </div>
    </div>
  );
};

export default VerifyingEmail;
