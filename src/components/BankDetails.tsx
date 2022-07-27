import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "material-react-toastify";

import "../helpers/i18n";
import { getBankDetails } from "../store/features/Transfer/Transfer";
import { useHistory } from "react-router";
import { useAppSelector } from "../store/hooks";

const BankDetails: React.FC<any> = ({
  accountDetails,
  payment_id = "",
  amount = "",
}) => {
  const { lang, currency, rate } = useAppSelector(
    (state) => state.persistedReducer.auth
  );
  const { t } = useTranslation();
  const [details, setDetails] = React.useState<any>(null);
  const history = useHistory();

  React.useEffect(() => {
    if (accountDetails !== null) {
      getBankDetails(accountDetails.id, payment_id, amount)
        .then((res: any) => {
          setDetails(res.user_payment_details);
        })
        .catch((error) => {
          // toast.error(error?.data?.message);
        });
    }
  }, []);

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="font-bold text-3xl my-2">{t("bankDetailsTitle")}</h1>
        {lang === "en" ? (
          <p>
            Your transaction will be finalized once you receive the funds.
            Please transfer{" "}
            <b>
              {parseInt(amount) * rate} {currency}
            </b>{" "}
            to our {details?.bank_name} account.
          </p>
        ) : (
          <p>
            Votre opération sera finalisée une fois que vous recevrons les
            fonds. Veuillez à présent effectuer un virement d’un montent de{" "}
            <b>
              {parseInt(amount) * rate} {currency}
            </b>{" "}
            sur notre compte {details?.bank_name}.
          </p>
        )}
      </div>

      {details && (
        <table className="table w-full">
          <tbody>
            <tr className="py-2">
              <th scope="row">{t("Reference")}</th>
              <td>{details?.reference_number}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.reference_number);
                    toast.dark("Reference number copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
            <tr className="py-2">
              <th scope="row">{t("Bank_Name")}</th>
              <td>{details?.bank_name}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.bank_name);
                    toast.dark("bank name  copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
            <tr className="py-2">
              <th scope="row">{t("name")}</th>
              <td>{details?.owner_name}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.owner_name);
                    toast.dark("Owner name  copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
            <tr className="py-2">
              <th scope="row">{t("Address")}</th>
              <td>{details?.country}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.country);
                    toast.dark("Address copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
            <tr className="py-2">
              <th scope="row">IBAN</th>
              <td>{details?.iban}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.iban);
                    toast.dark("IBAN copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
            <tr className="py-2">
              <th scope="row">BIC</th>
              <td>{details?.bic}</td>
              <td className="text-right">
                <span
                  className="badge bg-gray-200 p-2 text-gray-600 cursor-pointer rounded-lg px-4"
                  onClick={() => {
                    navigator.clipboard.writeText(details?.bic);
                    toast.dark("BIC copied");
                  }}
                >
                  {t("copy")}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="flex flex-col justify-center items-center p-10">
        <button
          className="btn rounded-lg   mr-2 btn-block"
          style={{ backgroundColor: "rgb(3, 115, 117)" }}
          onClick={() => history.push("/")}
        >
          <small className="text-white font-bold">{t("backHome")}</small>
        </button>
      </div>
    </div>
  );
};

export default BankDetails;
