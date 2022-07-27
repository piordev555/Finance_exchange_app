import React from "react";
import "./style.css";
import Rating from "@material-ui/lab/Rating";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";

const Beneficiary: React.FC = () => {
  const showModal = (e: any) => {
    e.preventDefault();
    alert(90);
  };

  return (
    <section className="beneficiaries shadow-sm-sm">
      <h2>Beneficiaries</h2>
      <div className="beneficiariesList">
        <div className="btn rounded-lg Box">
          <a
            onClick={(e) => showModal(e)}
            className="addBtn shadow-sm-sm"
            href="#"
          >
            <span>+</span>
          </a>
          <h3>Add user</h3>
          <p style={{ color: "#fff" }}>Add</p>
        </div>
        <div className="list">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((user, index) => (
            <div className="user">
              <div className="shadow-sm-lg imgBox">
                <img src="../images/user?.png" alt="user profile" />
              </div>
              <h3>Name User</h3>
              <Rating name="read-only" size="small" value={4} readOnly />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Beneficiary;
