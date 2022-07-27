import React from "react";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import Avatar from "react-avatar";

const BeneficiaryCard: React.FC<{ beneficiary: any }> = ({ beneficiary }) => {
  const { t } = useTranslation();

  return (
    <div className="border-1 shadow-md my-4">
      {beneficiary?.is_individual || beneficiary.company === null ? (
        <div className="py-2 px-3">
          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">Type</b> <small>{t("Individual")}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("FirstName")}</b>{" "}
            <small>{beneficiary?.first_name}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("LastName")}</b>{" "}
            <small>{beneficiary?.last_name}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("email")}</b>{" "}
            <small>{beneficiary?.email}</small>
          </div>
        </div>
      ) : (
        <div className="p-2">
          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">Type</b> <small>{t("company")}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("company_name")}</b>{" "}
            <small>{beneficiary?.company?.name}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("registration_id")}</b>{" "}
            <small>{beneficiary?.company?.registered_id}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("Country")}</b>{" "}
            <small>{beneficiary?.company?.country}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("City")}</b>{" "}
            <small>{beneficiary?.company?.city}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("contact_first_name")}</b>{" "}
            <small>{beneficiary?.first_name}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("contact_last_name")}</b>{" "}
            <small>{beneficiary?.last_name}</small>
          </div>

          <div className="flex  my-2  flex-row justify-between items-center border-b pb-2">
            <b className="text-sm">{t("contact_email")}</b>{" "}
            <small>{beneficiary?.email}</small>
          </div>
        </div>
      )}
      <div className="p-2">
        <small className="text-red-500">{t("NotReceiver")}</small>
      </div>
    </div>
  );
};

export default BeneficiaryCard;
