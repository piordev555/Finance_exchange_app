import React from "react";
import Avatar from "react-avatar";

const BeneficiarySummary: React.FC<any> = ({ name, company }) => {
  return (
    <div className="w-full flex flex-row p-3">
      <Avatar name={name} size="45" round />
      <div className="ml-2">
        <span className="font-bold capitalize">{name}</span>
        <br />
        <small className="text-sm">{company}</small>
      </div>
    </div>
  );
};

export default BeneficiarySummary;
