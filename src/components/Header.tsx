import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import LangSwitch from "./LangSwitch";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetAuth } from "../store/features/Auth/AuthSlice";
import { useHistory } from "react-router";
import { resetTransfer } from "../store/features/Transfer/TransferSlice";
import { resetDeveloper } from "../store/features/Developer/DeveloperSlice";

// import moment
interface Props {
  page: any;
}

const Header: React.FC<Props> = ({ page }) => {
  const {
    auth: { user },
    developer: { developerTokens, apps, app, session },
  } = useAppSelector((state: any) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const history = useHistory();

  const handleLogout = () => {
    dispatch(resetAuth());
    dispatch(resetTransfer());
    dispatch(resetDeveloper());
    history.push("/");
  };

  return (
    <>
      <header className="header flex flex-row  justify-between items-center bg-white p-2">
        <div className="flex flex-row items-center">
          <div className="developer-image mr-5">
            <img
              src="../images/user?.png"
              alt="developer-profile"
              style={{ height: 40 }}
            />
          </div>
          <div>
            <h2 className="dev-name font-bold">{user?.full_name}</h2>
            <small className="dev-company">{user?.company.name}</small>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <LangSwitch />
          <div className="ml-4">
            <IconButton aria-label="delete" onClick={handleLogout}>
              <ExitToAppIcon fontSize="large" />
            </IconButton>
          </div>
        </div>
      </header>
      <div className="p-1">
        <b>{page}</b>
      </div>
    </>
  );
};

export default Header;
