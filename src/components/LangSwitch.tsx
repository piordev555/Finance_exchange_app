import React from "react";
import { setLanguage } from "../store/features/Auth/AuthSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import i18n from "i18next";

const data = [
  { name: "EN", code: "en" },
  { name: "FR", code: "fr" },
];
const LangSwitch: React.FC<any> = () => {
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.persistedReducer.auth);

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    dispatch(setLanguage(event.target.value));
    const lang = event.target.value === "en" ? "en-GB" : "fr-FR";
    i18n.changeLanguage(lang);
  };


  return (
    <select
      className="rounded bg-white font-bold"
      value={lang}
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

export default LangSwitch;
