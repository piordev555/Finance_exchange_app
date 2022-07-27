import React from "react";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";
import { HashLink as Link } from "react-router-hash-link";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center justify-start mx-3">
      <span className="mr-3 text-xs">CopyRight DanaPay 2021</span>
      <span className="mr-3 text-xs">
        <Link to="/terms">{t("ftTerms")}</Link>
      </span>
      <span className="mr-3 text-xs">
        <Link to="/policy">{t("ftPolicy")}</Link>
      </span>
      <span className="mr-3 text-xs">
        <Link to="/help">{t("ftHelp")}</Link>
      </span>
    </div>
  );
};

export default Footer;
