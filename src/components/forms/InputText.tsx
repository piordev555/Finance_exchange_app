import React, { Component } from "react";
interface Props {
  type: string;
  name: string;
  label: string;
}
const style = {
  input__label: {
    display: "block",
    marginTop: 5,
    marginBottom: 5,
  },
  input: {},
  input__box: {
    display: "block",
  },
  input__label: {
    display: "block",
    marginTop: 5,
    marginBottom: 5,
  },
};
const InputText: React.FC<Props> = ({ type, name, label }) => {
  return (
    <div style={style.input}>
      <label style={style.input__label}>{label}</label>
      <input style={style.input__box} type={type} name={name} />
    </div>
  );
};

export default InputText;
