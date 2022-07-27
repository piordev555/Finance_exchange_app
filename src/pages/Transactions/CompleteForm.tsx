import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Paper } from "@material-ui/core";
import "react-phone-input-2/lib/style.css";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import Switch from "@material-ui/core/Switch";
import {
  completeOnDemandPayment,
  getPaymentById,
} from "../../store/features/Transfer/Transfer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import "../../helpers/i18n";
import {
  setExternalApiPaymentId,
  setTransferFromType,
} from "../../store/features/Transfer/TransferSlice";
import { toast } from "material-react-toastify";
import CashLayout from "../../components/CashLayout";
import { extractError } from "../../utility";

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
  return ["Beneficiary", "Amount", "Payment"];
}

const CompleteForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { transfer, auth } = useAppSelector((state) => state.persistedReducer);
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(1);
  const [processing, setProcessing] = React.useState(false);
  const steps = getSteps();
  const [counter, setCounter] = React.useState<number>(0);
  const [transferData, setTransfer] = React.useState<any>({});
  const [fetching, setFetching] = React.useState<any>(false);
  const history = useHistory();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const initiateFin = () => {
    completeOnDemandPayment(transferData.payment_id)
      .then((response) => {
        dispatch(setTransferFromType("internal_api"));
        dispatch(setExternalApiPaymentId(null));
        toast.success("Payment Request Successful");
        handleNext();
      })
      .catch((error) => {
        toast.error(extractError(error));
      });
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <Paper className="w-full md:m-auto md:w-1/2 p-2 flex flex-col justify-center"></Paper>
        );
      case 1:
        return (
          <Paper className="w-full">
            {fetching ? (
              <div
                className="h-full w-full flex flex-col justify-center items-center"
                style={{ height: 400 }}
              >
                <p> {t("fetchingTransfer")}</p>
                <p>...{t("Please_wait")}</p>
              </div>
            ) : (
              <div className="w-full md:m-auto md:w-2/3 flex flex-row">
                <div className="flex-1 p-4">
                  <SelectField
                    value={transferData.type}
                    data={[]}
                    setData={(value: any) => null}
                    width={true}
                    label={t("payMethod")}
                  />
                  <InputField
                    name="Sent amount (EUR)"
                    label={t("Sent_amount_EUR")}
                    value={transferData.amount_without_fee}
                    handleChange={(e: any) => null}
                  />

                  <InputField
                    name="Amount received (CFA)"
                    label={t("Sent_amount_Cfa")}
                    value={transferData.local_amount}
                    handleChange={(e: any) => null}
                  />

                  <div className="my-5">
                    {processing ? (
                      <button
                        className="btn rounded-lg"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                        disabled
                      >
                        <span className="text-white capitalize">
                          {t("processing")}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => initiateFin()}
                        className="btn rounded-lg"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      >
                        <span className="text-white capitalize">
                          {t("accept_payment")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 px-10">
                  {transferData.destination_user && (
                    <div className="flex flex-row bg-gray-100 py-2 px-2 shadow-sm">
                      <img
                        src="/images/user?.png"
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                      />
                      <div className="ml-4">
                        <h3 className="font-bold text-2xl">
                          {`${transferData.destination_user?.first_name}`}{" "}
                          {`${transferData.destination_user?.last_name}`}
                        </h3>
                        <p className="text-sm">
                          {transferData.destination_user?.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-row my-6 justify-between items-center">
                    <small>{t("amount")}</small>
                    <h2 className="font-bold">
                      <CashLayout cash={transferData.amount_without_fee} />
                    </h2>
                  </div>

                  <div className="flex flex-row my-6 justify-between">
                    <small>{t("fees")}</small>
                    <h2 className="font-bold">
                      <CashLayout
                        cash={
                          transferData.amount_in_euros -
                          transferData.amount_without_fee
                        }
                      />
                    </h2>
                  </div>

                  <div className="flex flex-row my-6 justify-between">
                    <small>{t("total")}</small>
                    <h2 className="font-bold">
                      {transferData.local_amount} EUR
                    </h2>
                  </div>

                  <div className="flex flex-row my-6 justify-between">
                    <small>{t("exchange_rate")}</small>
                    <h2 className="font-bold">1 EUR = 665.6 CFA</h2>
                  </div>
                </div>
              </div>
            )}
          </Paper>
        );
      case 2:
        return (
          <div className="container">
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-6 flex flex-col justify-center items-center shadow-lg p-4">
                <i
                  className="fa fa-check-circle text-green-600 mb-3"
                  style={{ fontSize: 100 }}
                />
                <br />
                <h1 className="text-2xl font-bold text-center mb-3">
                  Payment Request Successful
                </h1>
                <p className="text-center">
                  We have sent you an email to complete the payment.
                </p>
                <hr />

                <button onClick={() => history.push("/dashboard")}>
                  {t("BackHome")}
                </button>
              </div>
              <div className="col-md-3"></div>
            </div>
          </div>
        );
      default:
        return "Unknown stepIndex";
    }
  };

  const getDetails = () => {
    setFetching(true);
    getPaymentById(transfer.transferId)
      .then((res) => {
        setFetching(false);
        setTransfer(res);
      })
      .catch((error) => {
        setCounter(counter + 1);
        setFetching(false);
      });
  };

  React.useEffect(() => {
    getDetails();
  }, []);

  return (
    <div className={classes.root}>
      <div
        className="flex flex-row justify-between  items-center p-2"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      >
        <h1 className="text-white font-bold">{t("CompleteTransfer")}</h1>
        <button
          className=" btn text-white font-bold"
          style={{ backgroundColor: "rgb(3, 115, 117)" }}
          onClick={() => history.push("/")}
        >
          {t("Back_To_website")}
        </button>
      </div>
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
            <div>
              <div className="form">{getStepContent(activeStep)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteForm;
