import React, { useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "./Dashboard";
import Loading from "./pages/Loading";
import SignUp from "./pages/auth/SignUp";
import LinkStale from "./pages/auth/LinkStale";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEMail from "./pages/auth/VerifyEMail";
import MakeTransfer from "./pages/Transactions/MakeTransfer";
import Join from "./pages/auth/Join";
import VerifyingEmail from "./pages/auth/VerifyingEmail";
import TransferStatus from "./pages/Transactions/TransaferStatus";
import ChangePassword from "./pages/auth/ChangesPassword";
import CompleteForm from "./pages/Transactions/CompleteForm";
import Repeated from "./pages/Transactions/Repeated";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PasswordReset from "./pages/auth/PasswordReset";
import ProtectedRoute from "./components/ProtectedRoute";
import Save from "./pages/auth/Save";
import LoginTemp from "./pages/auth/loginTemp";
import { Layout } from "./components/layout/Layout";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useIntercom } from "react-use-intercom";

const Navigation: React.FC<any> = () => {
  const {
    auth: { user, lang },
  } = useAppSelector((state) => state.persistedReducer);

  const { boot } = useIntercom();
  const bootWithProps = React.useCallback(
    () => boot({ name: user?.first_name || "" }),
    [boot]
  );

  useEffect(() => {
    bootWithProps();
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Loading} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/loginTemp" component={LoginTemp} />
        <Route exact path="/verify" component={VerifyEMail} />
        <Route exact path="/verifyingEmail" component={VerifyingEmail} />
        <Route exact path="/stale" component={LinkStale} />
        <Route exact path="/join" component={Join} />
        <Route path="/changePassword" component={ChangePassword} />
        <Route exact path="/forgotpassword" component={ForgotPassword} />
        <Route exact path="/register" component={SignUp} />
        <ProtectedRoute path="/make_transfer" component={MakeTransfer} />
        {/* <ProtectedRoute path="/dashboard" component={Dashboard} /> */}
        <ProtectedRoute path="/payment_status" component={TransferStatus} />
        <Route path="/complete_form" component={CompleteForm} />
        <ProtectedRoute path="/repeat/:id" component={Repeated} />
        <Route path="/help" component={Help} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/passwordReset" component={PasswordReset} />
        <ProtectedRoute path="/save" component={Save} />
        <Route path="/dashboard" component={Layout} />
      </Switch>
    </Router>
  );
};

export default Navigation;
