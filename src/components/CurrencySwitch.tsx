import React from "react";
import { changeCurrency, setRate } from "../store/features/Auth/AuthSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const data = [
  { name: "EUR", code: "EUR" },
  { name: "CFA", code: "CFA" },
];

const CurrencySwitch = () => {
  const dispatch = useAppDispatch();
  const currency = useAppSelector(
    (state) => state.persistedReducer.auth.currency
  );

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    const currency = event.target.value;
    dispatch(changeCurrency(currency));
    if (currency === "EUR") {
      dispatch(setRate(1));
    } else {
      dispatch(setRate(655.957));
    }
  };

  return (
    <select
      className="rounded bg-white font-bold"
      value={currency}
      onChange={handleChange}
      style={{ fontSize: 11 }}
    >
      {data.map((val: any, index: number) => (
        <option
          value={val.code}
          key={index}
          className="font-bold"
          style={{ fontSize: 11 }}
        >
          {val.name}
        </option>
      ))}
    </select>
  );
};

export default CurrencySwitch;
