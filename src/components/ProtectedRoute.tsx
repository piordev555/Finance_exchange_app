import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const ProtectedRoute: React.FC<RouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { auth } = useAppSelector((state) => state.persistedReducer);

  if (auth.isLoggedIn) {
    if (!auth.user?.has_temporary_password) {
      return <Route path={path} component={Component} />;
    } else {
      return <Redirect to={{ pathname: "/changePassword" }} />;
    }
  } else {
    return <Redirect to={{ pathname: "/login" }} />;
  }
};

export default ProtectedRoute;
