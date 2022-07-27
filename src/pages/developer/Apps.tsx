import React, { useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import AddApp from "./AddApp";
import { DeveloperApi } from "../../store/features/Developer/Developer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchApps,
  logDeveloper,
  setDeveloperTokens,
} from "../../store/features/Developer/DeveloperSlice";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: "relative",
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
      color: "#fff",
    },
  })
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Apps = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    auth: { user },
    developer: { apps, session },
  } = useAppSelector((state) => state.persistedReducer);
  const [open, setOpen] = useState(false);
  const [env, setEnv] = useState("sandbox");
  const dispatch = useAppDispatch();
  const [logingIn, setLoginIn] = useState("");

  const switchEnvironment = (env: any) => {
    setEnv(env);
  };

  const openAddAppModal = () => {
    setOpen(true);
  };

  const loginDeveloperUser = () => {
    setLoginIn("logging In");
    const external_id = user?.external_user_id || "external_user_id";
    const payload = {
      username: user?.email || `${new Date().getTime()}@danapay.io`,
      password: external_id,
      scopes: [
        "authorization",
        "consumer.user",
        "consumer.event",
        "consumer.subscription",
        "consumer.grant",
        "consumer.app",
        "app_configure",
      ],
    };
    DeveloperApi.loginDeveloper(payload)
      .then((res: any) => {
        if ("token" in res.data) {
          setLoginIn("user found");
          fetchUserApp(res.data.token);
          dispatch(logDeveloper(res.data));
        } else {
          setLoginIn("user not found");
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          createDeveloperUser();
        }
        setLoginIn("error login user");
      });
  };

  const createDeveloperUser = () => {
    DeveloperApi.getAuthToken()
      .then((res: any) => {
        if ("access_token" in res.data) {
          dispatch(setDeveloperTokens(res.data));
          setLoginIn("creating new user");
          const external_id = user?.external_user_id || "external_user_id";
          const payload = {
            name: "Developer" + new Date().getTime(),
            email: user?.email || `${new Date().getTime()}@danapay.io`,
            password: external_id,
            roleId: 5,
            status: 1,
          };
          DeveloperApi.signUpDeveloper(payload, res.data.access_token)
            .then((res: any) => {
              setLoginIn("New user created");
              loginDeveloperUser();
            })
            .catch((error) => {
              setLoginIn(
                "Error creating  new user " + JSON.stringify(error.response)
              );
            });
        } else {
          setLoginIn("if part of creating new user");
        }
      })
      .catch((error) => null);
  };

  const fetchUserApp = (token: any) => {
    DeveloperApi.getAllUserApps(token)
      .then((response: any) => {
        if ("entry" in response.data) {
          dispatch(fetchApps(response.data.entry));
        }
      })
      .catch((error: any) => null);
  };

  useEffect(() => {
    loginDeveloperUser();
  }, []);
  return (
    <>
      <section className="controls p-3 m-2 bg-white">
        <div className="">
          <button
            className="btn rounded-lg"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
            onClick={() => switchEnvironment("sandbox")}
            disabled={env === "sandbox"}
          >
            <span className="text-white">{t("SandBox")}</span>
          </button>
          <button
            className="btn rounded-lg   mx-2"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
            onClick={() => switchEnvironment("production")}
            disabled={env === "production"}
          >
            <span className="text-white">{t("production")}</span>
          </button>
        </div>
      </section>

      <section>
        <div className="bg-white m-2">
          <div className="p-3 flex flex-row items-center mb-0 px-2">
            <button
              className=" flex justify-center items-center rounded-lg mr-2"
              style={{
                backgroundColor: "rgb(3, 115, 117)",
                height: 40,
                width: 40,
              }}
              disabled={session === null}
              onClick={openAddAppModal}
            >
              <i
                className="fa fa-plus text-white ml-2"
                style={{ fontSize: 18 }}
              ></i>
            </button>
            <small>{t("newApp")}</small>
          </div>

          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{t("App_ID")}</TableCell>
                  <TableCell align="left">{t("App_Icon")}</TableCell>
                  <TableCell align="left">{t("App_Name")}</TableCell>
                  <TableCell align="left">{t("Api_Key")}</TableCell>
                  <TableCell align="left">{t("Date_Created")} </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps &&
                  apps.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell align="left">{row.id}</TableCell>
                      <TableCell align="left">
                        <div
                          className="bg-gray-800"
                          style={{ height: 30, width: 30, borderRadius: 12 }}
                        />
                      </TableCell>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">{row.appKey}</TableCell>
                      <TableCell align="left">{row.date}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </section>
      <Dialog
        fullScreen
        open={open}
        onClose={openAddAppModal}
        TransitionComponent={Transition}
      >
        <div
          className="py-2 flex flex-row px-4 items-center justify-between"
          style={{ backgroundColor: "rgb(3, 115, 117)" }}
        >
          <span className="text-white font-bold">{t("AddApplication")}</span>
          <button
            className="btn rounded-lg  shadow-lg px-4"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
            onClick={() => setOpen(false)}
          >
            <b className="text-white">{t("close")}</b>
          </button>
        </div>

        <AddApp
          handleClose={() => {
            setOpen(false);
            loginDeveloperUser();
          }}
        />
      </Dialog>
    </>
  );
};

export default Apps;
