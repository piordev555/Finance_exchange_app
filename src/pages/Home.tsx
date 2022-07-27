import React from "react";
import MiniProfile from "../components/MiniProfile/MiniProfile";
import TransactionsCard from "../components/TransactionsCard/TransactionsCard";
import { useAppSelector } from "../store/hooks";
import Contacts from "../components/Contacts";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { transfer } = useAppSelector((state) => state.persistedReducer);

  return (
    <div className="h-screen truncate px-2">
      <MiniProfile />
      <div className="mt-4">
        <p className="font-bold text-gray-600">
          <small>{t("Contacts")}</small>
        </p>
        <Contacts reloadContacts={() => null} />
      </div>
      {transfer.transfers && transfer.transfers.length > 0 && (
        <>
          <div className="mt-2">
            <br />
            <p className="font-bold mb-3 text-gray-600">
              <small>{t("Latest_Transactions")}</small>
            </p>
            <TransactionsCard
              showLess={true}
              transactions={transfer.transfers.slice(0, 6)}
              getAllUserTransfer={() => {}}
              fetchNext={() => {}}
              fetchPrevious={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
