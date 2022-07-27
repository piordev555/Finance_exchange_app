import React, { useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
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
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    input: {
      marginBottom: 10,
      marginTop: 10,
    },
  })
);

const PasswordField: React.FC<Props> = ({
  label,
  name,
  value,
  handleChange,
  onBlur,
  error = null,
  disabled = false,
  type = "password",
  touched = false,
}) => {
  const isError = error === "" || error === "undefined" ? false : true;
  const [inputType, setInputType] = useState(type);

  return (
    <>
      <div className="w-full mb-3">
        <label className="mb-2 text-sm text-gray-600">{label}</label>
        <div className="flex flex-row">
          <input
            type={inputType}
            className="w-full border-b-2"
            id="validationCustom05"
            required
            value={value}
            name={name}
            onChange={handleChange}
            disabled={disabled}
          />
          <div
            onClick={() => {
              const value = inputType === "text" ? "password" : "text";
              setInputType(value);
            }}
            style={{ height: 40, width: 40 }}
            className="cursor-pointer bg-white flex justify-center items-center border-b-2"
          >
            {inputType === "text" ? (
              <i className="fa fa-eye-slash text-gray-400" />
            ) : (
              <i className="fa fa-eye text-gray-400" />
            )}
          </div>
        </div>

        {isError && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>
    </>
  );
};

export default PasswordField;
