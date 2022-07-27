import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";
interface Props {
  onClick: any;
  btnText: string;
  icon: any;
  borderRadius?: boolean;
  color?: any;
  disabled?: any;
}

const ButtonComponent: React.FC<Props> = ({
  onClick,
  btnText,
  icon,
  borderRadius = false,
  color = "primary",
  disabled = false,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="contained"
      onClick={onClick}
      color={color}
      style={{
        marginRight: 10,
        color: "#fff",
        fontSize: 13,
        textTransform: "capitalize",
      }}
      startIcon={icon}
      className={borderRadius ? "rounded-3xl" : "rounded-none"}
      disabled={disabled}
    >
      {t(btnText)}
    </Button>
  );
};

export default ButtonComponent;
