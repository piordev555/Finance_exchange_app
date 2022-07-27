import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  data: any;
  setData: any;
  value: any;
  width?: boolean;
  label?: string;
}

const SelectField: React.FC<Props> = ({
  data,
  setData,
  value,
  width = false,
  label = "",
}) => {
  const { t } = useTranslation();
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setData(event.target.value as string);
  };

  return (
    <div className="form-group">
      <label className="mb-2 text-sm text-gray-600">{label}</label>
      <select
        className={`border-b-2 rounded bg-white ${width ? "w-full" : " mx-2"}`}
        value={value}
        onChange={handleChange}
      >
        <option>{t("select")}</option>
        {data &&
          data.map((val: any) => (
            <option value={val.type}>{t(`${val.type}`)}</option>
          ))}
      </select>
    </div>
  );
};

export default SelectField;
