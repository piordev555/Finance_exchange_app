import React from "react";
import "./style.css";
import Rating from "@material-ui/lab/Rating";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";

interface Props {
  beneficiary: Beneficiary;
}

const BeneListItem: React.FC<Props> = ({ beneficiary }) => {
  return (
    <a
      className="beneficiaryListItem"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        alert(90);
      }}
    >
      <div className="name">{beneficiary.name}</div>
      <div className="company">{beneficiary.company}</div>
      <div className="email">{beneficiary.email}</div>
      <div className="phone">{beneficiary.phone}</div>
      <div className="country">{beneficiary.country}</div>
      <div className="verification">
        <b>{beneficiary.verification ? "Verified" : "Not Verified"}</b>
      </div>
      <div className="rating">
        <Rating
          name="read-only"
          value={beneficiary.rating}
          size="small"
          readOnly
        />
      </div>
    </a>
  );
};

const BeneListItemHeader: React.FC = () => {
  return (
    <div className="beneficiaryListItem">
      <div className="name">
        <b> Full Name</b>
      </div>
      <div className="company">
        <b>Company</b>
      </div>
      <div className="email">
        <b>Email</b>
      </div>
      <div className="phone">
        <b>Phone</b>
      </div>
      <div className="country">
        <b>Country</b>
      </div>
      <div className="verification">
        <b>Verified</b>
      </div>
      <div className="rating">
        <b>Rating</b>
      </div>
    </div>
  );
};

export { BeneListItem, BeneListItemHeader };
