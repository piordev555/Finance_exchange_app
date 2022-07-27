import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";

interface Props {
  name: string;
  handleChange: any;
  value: any;
  label?: string;
  onBlur?: any;
  error?: string;
  disabled?: boolean;
  type?: string;
  touched?: any;
  placeholder?: string;
}

const InputField: React.FC<Props> = ({
  label,
  name,
  value,
  handleChange,
  onBlur,
  error = "",
  disabled = false,
  type = "text",
  touched = false,
  placeholder,
}) => {
  const isError = error === "" || error === "undefined" ? false : true;
  return (
    <>
      <div className="w-full mb-3">
        <label className="mb-2 text-sm text-gray-600">{label}</label>
        <input
          type={type}
          className="w-full border-b-2"
          id="validationCustom05"
          // required
          value={value}
          name={name}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
        {isError && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>
    </>
  );
};

export default InputField;
