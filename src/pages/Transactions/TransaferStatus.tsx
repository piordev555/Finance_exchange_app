import React from "react";
import queryString from "query-string";
import { useLocation, useHistory } from "react-router-dom";
import ButtonComponent from "../../components/ButtonComponent";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
const TransferStatus = () => {
  const { search } = useLocation();
  const history = useHistory();
  const values = queryString.parse(search);
  const { t } = useTranslation();

  const goBack = () => {
    history.push("/");
  };

  return (
    <div className="success__page">
      <div className="success__box">
        <img
          src="./images/checked.png"
          style={{ height: 70, width: 70, margin: 20 }}
        />
        <h2 className="success__title">{t("WellDone")}</h2>
        <p className="success_description">{t("WellDoneDesc")}</p>

        <button
          onClick={() => goBack()}
          className="btn rounded-lg   mr-2 btn-block"
          style={{ backgroundColor: "rgb(3, 115, 117)" }}
        >
          <small className="text-white  font-bold">{t("BackHome")}</small>
        </button>
        <div style={{ height: 50 }} />
        <div>
          <small style={{ textAlign: "center" }}>
            © 2021 , {t("successFooter")}
          </small>
        </div>
      </div>
    </div>
  );
};

export default TransferStatus;
