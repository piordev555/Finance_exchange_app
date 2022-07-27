import React, { useState, useEffect, useLayoutEffect } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { getKYCSumSubToken } from "../store/features/Auth/Auth";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../store/hooks";

type Props = {
  finish?: any;
  phone: string;
};

const SumSub = ({ finish, phone }: Props) => {
  const { t } = useTranslation();
  const {
    auth: { user, lang },
  } = useAppSelector((state) => state.persistedReducer);

  const [sumSubConfig, setSumSubConfig] = useState<any>({
    token: null,
  });
  const [activeLang, setActiveLang] = useState<string>("fr");

  const getSumSUbToken = async () => {
    try {
      const tkn: any = await getKYCSumSubToken();
      if (tkn) {
        const newConfig = { ...sumSubConfig, token: tkn?.token };
        setSumSubConfig(newConfig);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getSumSUbToken();
  }, []);

  useLayoutEffect(() => {
    const userLang = lang === "en" ? "en" : "fr";
    setActiveLang(userLang);
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold">{t("sumSubTitle")}</h2>
      <p>{t("sumSubDescription")}</p>
      {sumSubConfig.token !== null && (
        <SumsubWebSdk
          accessToken={sumSubConfig.token}
          expirationHandler={() => sumSubConfig.token}
          config={{
            lang: activeLang,
            email: user?.email,
            phone,
            i18n: {
              document: {
                subTitles: {
                  IDENTITY: t("sumsubText"),
                },
              },
            },
            uiConf: {
              customCssStr:
                ":root {\n  --black: rgb(3, 115, 117);\n   --grey: #F5F5F5;\n  --grey-darker: #B2B2B2;\n  --border-color: #DBDBDB;\n}\n\np {\n  color: var(--black);\n  font-size: 16px;\n  line-height: 24px;\n}\n\nsection {\n  margin: 40px auto;\n}\n\ninput {\n  color: var(--black);\n  font-weight: 600;\n  outline: none;\n}\n\nsection.content {\n  background-color: var(--grey);\n  color: var(--black);\n  padding: 40px 40px 16px;\n  box-shadow: none;\n  border-radius: 6px;\n}\n\nbutton.submit,\nbutton.back {\n  text-transform: capitalize;\n  border-radius: 6px;\n  height: 48px;\n  padding: 0 30px;\n  font-size: 16px;\n  background-image: none !important;\n  transform: none !important;\n  box-shadow: none !important;\n  transition: all 0.2s linear;\n}\n\nbutton.submit {\n  min-width: 132px;\n  background: none;\n  background-color: var(--black);\n}\n\n.round-icon {\n  background-color: var(--black) !important;\n  background-image: none !important;\n}",
            },
          }}
          options={{ addViewportTag: false, adaptIframeHeight: true }}
          onMessage={(type: any, payload: any) => {}}
          onError={(data: any) => null}
          className="mb-5"
        />
      )}
      <button className="btn btn-light" onClick={() => finish()}>
        <small className="font-bold mx-10">{t("finish")}</small>
      </button>
    </>
  );
};

export default SumSub;
