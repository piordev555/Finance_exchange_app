import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import InputField from "../../components/forms/InputField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import "../../helpers/i18n";
import { DeveloperApi } from "../../store/features/Developer/Developer";
import { setSelectedApp } from "../../store/features/Developer/DeveloperSlice";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    backButton: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

function getSteps() {
  return ["General", "Api Scope", "Configuration", "App Information"];
}

const AddApp: React.FC<any> = ({ handleClose }) => {
  const { t } = useTranslation();
  const {
    auth: { user },
    developer: { session, app },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [general, setGeneral] = React.useState({
    app_name: "",
    app_description: "",
  });
  const [configuration, setConfiguration] = React.useState({
    redirect_url: "",
    webhook: "",
  });
  const [selectedOption, setSelectedOption] = React.useState("marketPlace");
  const [processing, setProcessing] = React.useState(false);

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleFinish = () => {
    handleClose();
  };

  const createDeveloperApp = () => {
    setProcessing(true);
    const payload = {
      name: general.app_name.trim(),
      scopes: [
        "authorization",
        "consumer.user",
        "consumer.event",
        "consumer.subscription",
        "consumer.grant",
      ],
      url: "https://www.handsomeapp.com",
    };
    //create new application

    DeveloperApi.createApp(payload, session.token)
      .then(async (res: any) => {
        if (res.data.success) {
          //fetch all application for a user logged
          const apps = await DeveloperApi.getAllUserApps(session.token);
          const allApps = apps.data.entry;
          //filter all apps to get the recently created application.
          const createdApp = allApps.find(
            (appData: any) => appData.name === payload.name
          );
          //got application from fetch
          //the payload to edit application
          const payloadEdit = {
            description: general.app_description,
            redirection_url: configuration.redirect_url,
            webhook: configuration.webhook,
          };
          const response = await DeveloperApi.editWebHook(
            createdApp.id,
            payloadEdit,
            session.token
          );

          const currentAppDetails = await DeveloperApi.GetAppDetails(
            createdApp.id,
            session.token
          );
          dispatch(setSelectedApp(currentAppDetails.data));
          handleNext();
          setProcessing(false);
        } else {
        }
      })
      .catch((error: any) => {
        setProcessing(false);
      });
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-2/5 md:w-1/2 w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-lg min-w-full">
                <h1 className="font-bold my-4">
                  {t("App_General_Information")}
                </h1>
                <InputField
                  name="app_name"
                  handleChange={(text: any) =>
                    setGeneral((prev) => {
                      return { ...prev, app_name: text.target.value };
                    })
                  }
                  value={general.app_name}
                  label={t("Application_Name")}
                />

                <InputField
                  name="app_description"
                  handleChange={(text: any) =>
                    setGeneral((prev) => {
                      return { ...prev, app_description: text.target.value };
                    })
                  }
                  value={general.app_description}
                  label={t("Application_Description")}
                />

                <button
                  className="btn rounded-lg  px-12 my-4"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  type="submit"
                  onClick={handleNext}
                >
                  <small className="text-white capitalize font-bold">
                    {t("continue")}
                  </small>
                </button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-4/5 md:w-1/2 w-2/3">
              <div className="bg-white rounded-lg shadow-lg w-full p-8">
                <h1 className="font-bold my-4">{t("API_Scope")}</h1>

                <div className="flex flex-row mt-6 mb-4">
                  <div
                    className="mr-10 rounded-md"
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedOption === "marketPlace" ? "#93c5fd" : "#eee",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedOption("marketPlace")}
                  >
                    <div
                      className=" rounded-md mb-3"
                      style={{
                        backgroundColor: "rgb(3, 115, 117)",
                        height: 200,
                        width: 300,
                      }}
                    ></div>
                    <div className="p-4">
                      <h2 className="font-bold">{t("Market_Place")}</h2>
                      <p>{t("Market_Place_Desc")}</p>
                    </div>
                  </div>

                  <div
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedOption === "merchant" ? "#6ee7b7" : "#eee",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedOption("merchant")}
                    className="rounded-md"
                  >
                    <div
                      className="bg-green-300 rounded-md mb-3"
                      style={{ height: 200, width: 300 }}
                    ></div>
                    <div className="p-4">
                      <h2 className="font-bold">{t("Merchant")}</h2>
                      <p>{t("Merchant_Desc")}</p>
                    </div>
                  </div>
                </div>

                <button
                  className="btn rounded-lg  bg-blue-400 px-12"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  type="submit"
                  onClick={handleNext}
                >
                  <small className="text-white capitalize font-bold">
                    {t("continue")}
                  </small>
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-2/5 md:w-1/2 w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-lg min-w-full">
                <h1 className="font-bold my-4">{t("Configuration")}</h1>
                <InputField
                  name="redirect_url"
                  handleChange={(text: any) => {
                    setConfiguration((prev) => {
                      return { ...prev, redirect_url: text.target.value };
                    });
                  }}
                  value={configuration.redirect_url}
                  label={t("Redirect_URL")}
                />

                <InputField
                  name="webhook"
                  handleChange={(text: any) => {
                    setConfiguration((prev) => {
                      return { ...prev, webhook: text.target.value };
                    });
                  }}
                  value={configuration.webhook}
                  label={t("Webhook")}
                />

                {processing ? (
                  <small>{t("Creating_App")}</small>
                ) : (
                  <button
                    className="px-12 btn  my-4"
                    style={{ backgroundColor: "rgb(3, 115, 117)" }}
                    type="submit"
                    onClick={() => createDeveloperApp()}
                  >
                    <small className="text-white capitalize font-bold">
                      {t("continue")}
                    </small>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-4/5 md:w-1/2 w-2/3">
              <div className="bg-white rounded-lg shadow-lg w-full p-4">
                <h1 className="font-bold my-4">{t("AppInfo")}</h1>

                <p className="mt-4">{t("AppInfoDesc")}</p>

                <div className="mt-4 my-10">
                  <div className="flex flex-row w-full justify-between p-2 border-1">
                    <span className="mr-4 font-bold">AppKey</span>
                    {app !== null && <span>{app["appKey"]}</span>}
                  </div>
                  <div className="flex flex-row w-full justify-between p-2 border-1 mb-4">
                    <span className="mr-4 font-bold">{t("App_Secret")}</span>
                    {app !== null && <span>{app["appSecret"]}</span>}
                  </div>
                  <button
                    className="px-8 btn btn-danger"
                    type="submit"
                    onClick={handleNext}
                  >
                    <small className="text-white capitalize font-bold">
                      {t("Download_Private_Key")}
                    </small>
                  </button>
                </div>

                <div className="mb-3"></div>
                <button
                  className="px-12 btn "
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  type="submit"
                  onClick={handleFinish}
                >
                  <small className="text-white capitalize font-bold">
                    {t("finish")}
                  </small>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return "Unknown stepIndex";
    }
  };

  return (
    <div className={classes.root}>
      <div className="p-3">
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <div className="w-full m-auto md:w-1/2 p-10 flex flex-col justify-center ">
              <Typography className={classes.instructions}>
                All steps completed
              </Typography>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          ) : (
            <div>{getStepContent(activeStep)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddApp;
