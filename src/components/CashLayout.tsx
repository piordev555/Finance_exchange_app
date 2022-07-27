import React from "react";
import { useAppSelector } from "../store/hooks";
const CashLayout: React.FC<any> = ({ cash, size = "text-base" }) => {
  const { currency, rate } = useAppSelector(
    (state) => state.persistedReducer.auth
  );

  return (
    <>
      {currency === "EUR" ? (
        <span className={`font-bold ${size} text-right`}>{`${(
          parseFloat(cash) * rate || 0
        )
          .toFixed(2)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${
          currency === "EUR" ? "€" : "CFA"
        }`}</span>
      ) : (
        <span className={`font-bold ${size} text-right`}>{`${(
          parseFloat(cash) * rate || 0
        )
          .toFixed(0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${
          currency === "EUR" ? "€" : "CFA"
        }`}</span>
      )}
    </>
  );
};
export default CashLayout;
