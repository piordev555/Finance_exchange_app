import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Paper } from "@material-ui/core";
import "react-phone-input-2/lib/style.css";
import BeneficiaryCard from "../../components/BeneficiaryCard/BeneficiaryCard";
import InputField from "../../components/forms/InputField";
import InputText from "../../components/forms/InputText";
import SelectField from "../../components/forms/SelectField";
import Switch from "@material-ui/core/Switch";
import {
  getAppliedFeesForTransfers,
  getPaymentById,
  initFinForExternalPayment,
} from "../../store/features/Transfer/Transfer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import "../../helpers/i18n";
import {
  addTransferCountry,
  setExternalApiPaymentId,
  setTransferFromType,
} from "../../store/features/Transfer/TransferSlice";
import {
  fetchBeneficiary,
  initTransfer,
} from "../../store/features/Transfer/Transfer";
import CashLayout from "../../components/CashLayout";
import { extractError } from "../../utility";
import { translateError } from "../../utilities/help";
import BankDetails from "../../components/BankDetails";

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

type Params = {
  id: string;
};

function getSteps() {
  return ["Beneficiary", "Amount", "Payment", "Confirmation"];
}

const Repeated = () => {
  const { t } = useTranslation();
  const { id } = useParams<Params>();
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(1);
  const dispatch = useAppDispatch();
  const steps = getSteps();
  const [calculating, setCalculating] = React.useState<boolean>(false);
  const [transferData, setTransfer] = React.useState<any>({});
  const [fees, setFees] = React.useState(0);
  const [payMethod, setPayMethod] = React.useState("");
  const [fetching, setFetching] = React.useState<any>(false);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [bankIndex, setBankIndex] = React.useState<any>(null);
  const [selectedBank, setSelectedBank] = React.useState(null);
  const history = useHistory();
  const {
    transfer,
    auth: { user, dana_pay_bank_accounts, currency, lang, rate },
  } = useAppSelector((state: any) => state.persistedReducer);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const calculate_fees = () => {
    setCalculating(true);
    const cashinid = transfer.transferCountry?.cash_in_methods.find(
      (value: any) =>
        value?.cash_in_method.name.toLowerCase() ===
        transferData?.type.split("_").join(" ").toLowerCase()
    );

    setPayMethod(transferData?.type.split("_").join(" "));

    const receiving = transfer.transferCountry?.receiving_countries.find(
      (value: any) =>
        value.receiving_country.country_code ===
        transferData?.destination_user?.country_code
    );

    const payload = {
      euro_amount: transferData?.amount_in_euros,
      sending_country_id: transfer.loggedInUserCountry.id,
      receiving_country_id: receiving?.receiving_country.id,
      cashin_method_id: cashinid?.cash_in_method.id,
    };

    getAppliedFeesForTransfers(payload, user?.id)
      .then((response: any) => {
        setFees(response.fee);
        setCalculating(false);

        console.log("===>", response);
      })
      .catch((error: any) => {
        const err = extractError(error);
        setCalculating(false);
        console.log(err);
      });
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <div></div>;
      case 1:
        return (
          <div className="w-full">
            {fetching ? (
              <div
                className="h-full w-full flex flex-col justify-center items-center"
                style={{ height: 400 }}
              >
                <p>{t("fetchingTransfer")}</p>
                <p>...{t("Please_wait")} </p>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-10">
                  <div className="row mx-10 shadow-lg p-4">
                    <div className="col-md-6">
                      <br />
                      <InputField
                        name="reason"
                        placeholder={t("Reason")}
                        value={transferData?.reason}
                        handleChange={(e: any) => null}
                      />
                      <br />

                      <SelectField
                        value={payMethod}
                        data={[{ type: payMethod }]}
                        setData={(value: string) => []}
                        width={true}
                        label={t("selectCashinMethod")}
                      />

                      <br />
                      <InputField
                        name="Sent amount (EUR)"
                        label={t("Amount_received_EUR")}
                        value={transferData?.amount_in_euros}
                        handleChange={(e: any) => null}
                      />
                      <br />

                      <InputField
                        name="Amount received (CFA)"
                        label={t("Amount_received_CFA")}
                        value={transferData?.local_amount}
                        handleChange={(e: any) => null}
                      />
                      <br />

                      <div>
                        <h5 style={{ color: "rgb(3, 115, 117)" }}>
                          {t("Payout_delays_in_mali")}
                        </h5>
                        <small>{t("instant_transfer_text")}</small>

                        <div></div>
                      </div>

                      <div className="my-5">
                        {processingPayment ? (
                          <p>{t("Processing")}</p>
                        ) : (
                          <button
                            className="btn rounded-lg  px-10 w-full"
                            style={{ backgroundColor: "rgb(3, 115, 117)" }}
                            onClick={submitTransaction}
                          >
                            <small className="text-white capitalize font-bold">
                              {t("continue")}
                            </small>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      {transferData?.destination_user && (
                        <div className="flex flex-row py-2">
                          <img
                            src="/images/user.png"
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                          />
                          <div className="ml-4">
                            <h3 className="font-bold text-2xl">
                              {`${transferData?.destination_user?.first_name}`}{" "}
                              {`${transferData?.destination_user?.last_name}`}
                            </h3>
                            <p className="text-sm">
                              {transferData?.destination_user?.email} |
                              {
                                transferData?.destination_user
                                  ?.full_phone_number
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-row my-6 justify-between items-center">
                        <small>{t("amount")}</small>
                        <h2 className="font-bold">
                          <CashLayout cash={transferData?.amount_in_euros} />
                        </h2>
                      </div>

                      <div className="flex flex-row my-6 justify-between">
                        <small>{t("fees")}</small>
                        <h2 className="font-bold">
                          {calculating ? (
                            <small>{t("calculating")} ...</small>
                          ) : (
                            <CashLayout cash={fees} />
                          )}
                        </h2>
                      </div>

                      <div className="flex flex-row my-6 justify-between">
                        <small>{t("total")}</small>
                        <h2 className="font-bold">
                          <CashLayout cash={transferData?.local_amount} />
                        </h2>
                      </div>

                      <div className="flex flex-row my-6 justify-between">
                        <small>{t("exchange_rate")}</small>
                        <h2 className="font-bold">1 EUR = 665.6 CFA</h2>
                      </div>

                      <div className="flex flex-row my-6 justify-between">
                        <small>{t("PaymentMode")}</small>
                        <h2 className="font-bold">
                          {transferData?.paymentMethod}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-1"></div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            {transferData?.type === "bank_transfer" ? (
              <div className="row mt-10">
                {selectedBank ? (
                  <>
                    <div className="col-md-2" />
                    <div className="col-md-8 flex justify-center items-center">
                      <div className="shadow-lg p-4">
                        <BankDetails
                          accountDetails={selectedBank}
                          payment_id={transferData?.id}
                          amount={`${
                            parseInt(transferData?.amount_in_euros) + fees
                          }`}
                        />
                      </div>
                    </div>
                    <div className="col-md-2" />
                  </>
                ) : (
                  <>
                    <div className="col-md-2" />

                    <div className="col-md-8 flex justify-center items-center">
                      <div className="shadow-lg p-10">
                        <div className="my-4 text-center mb-4">
                          <h3 className="font-bold text-2xl">
                            {t("payment_instruction")}
                          </h3>
                          <p>{t("pi_text")}</p>
                        </div>
                        <select
                          className={`border-b-2 rounded bg-white w-full mb-4`}
                          onChange={(v: any) => setBankIndex(v.target.value)}
                        >
                          <option>{t("select_bank")}</option>
                          {dana_pay_bank_accounts?.map(
                            (bank: any, index: number) => (
                              <option value={index}>{bank.bank_name}</option>
                            )
                          )}
                        </select>
                        <button
                          onClick={() => {
                            if (bankIndex) {
                              setSelectedBank(
                                dana_pay_bank_accounts[bankIndex]
                              );
                            }
                          }}
                          className="btn rounded-md w-full"
                          style={{ backgroundColor: "rgb(3, 115, 117)" }}
                        >
                          <small className="font-bold text-white mx-10">
                            {t("continue")}
                          </small>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="shadow-lg bg-white flex flex-col justify-center items-center text-center p-4">
                <img
                  src="./images/checked.png"
                  style={{ height: 50, width: 50, margin: 20 }}
                />

                {lang === "en" ? (
                  <p>
                    We are sending{" "}
                    <b>
                      <CashLayout
                        cash={
                          currency === "EUR"
                            ? parseFloat(transferData?.amount_in_euros).toFixed(
                                2
                              )
                            : parseFloat(transferData?.amount_in_euros) * rate
                        }
                      />
                    </b>{" "}
                    to{" "}
                    <b>
                      {transfer.beneficiary && transfer.beneficiary.full_name}
                    </b>
                    <br />. Your beneficiary will receive a message with the
                    necessary details for the withdrawal.
                  </p>
                ) : (
                  <p>
                    Nous envoyons{" "}
                    <b>
                      {currency === "EUR"
                        ? parseFloat(transferData?.amount_in_euros).toFixed(2)
                        : parseFloat(transferData?.amount_in_euros) * rate}{" "}
                    </b>{" "}
                    à <b>{transferData?.destination_user?.full_name}</b>
                    <br />
                    Votre bénéficiaire recevra un message avec les détails
                    nécessaires pour le retrait.
                  </p>
                )}
                <button
                  onClick={() => history.push("/")}
                  className="btn my-4"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                >
                  <small className="text-white font-bold ">
                    {t("BackHome")}
                  </small>
                </button>
              </div>
            )}
          </div>
        );
      case 3:
        return <div></div>;

      default:
        return "Unknown stepIndex";
    }
  };

  const fetchBene = (data: any) => {
    fetchBeneficiary({
      country_code: data.destination_user?.country_code,
      phone_number: data.destination_user?.phone_number,
    })
      .then((res: any) => {
        dispatch(addTransferCountry(res.transferCountry));
      })
      .catch((error) => null);
  };

  const submitTransaction = () => {
    const cashinid = transfer.transferCountry?.cash_in_methods.find(
      (value: any) =>
        value?.cash_in_method.name.toLowerCase() ===
        transferData?.type.split("_").join(" ").toLowerCase()
    );
    const receiving = transfer.transferCountry?.receiving_countries.find(
      (value: any) =>
        value.receiving_country.country_code ===
        transferData?.destination_user?.country_code
    );

    const transactionData = {
      amount_without_fees_in_euro: transferData?.amount_in_euros,
      amount_in_euros: transferData?.amount_in_euros,
      fee: transferData?.applied_fees.value,
      payment_delivery: false,
      is_escrowed: transferData?.escrow_id !== "",
      phone_number: transferData?.destination_user?.phone_number,
      country_code: transferData?.destination_user?.country_code,
      sending_country_id: transfer.loggedInUserCountry?.id,
      receiving_country_id: receiving?.receiving_country.id,
      cashin_method_id: cashinid?.cash_in_method.id,
    };

    initTransfer(transactionData)
      .then((res: any) => {
        setProcessingPayment(false);
        handleNext();
      })
      .catch((error) => {
        setProcessingPayment(false);
      });
  };

  React.useEffect(() => {
    setFetching(true);
    getPaymentById(id)
      .then((res) => {
        setFetching(false);
        setTransfer(res);
        fetchBene(res);
        calculate_fees();
      })
      .catch((error) => setFetching(false));
  }, []);

  return (
    <div className={classes.root}>
      <div
        className="flex flex-row justify-between  items-center px-6 py-4"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      >
        <h1 className="text-white font-bold">{t("repeating_transfer")}</h1>
        <Link to="/dashboard/home" className="text-white font-bold">
          {t("close")}
        </Link>
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

export default Repeated;
