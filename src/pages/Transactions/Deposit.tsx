import React, { useEffect } from "react";
import { toast } from "material-react-toastify";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import BankDetails from "../../components/BankDetails";
import InputField from "../../components/forms/InputField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  depositOnAccount,
  getAppliedFeesForDeposits,
} from "../../store/features/Transfer/Transfer";
import { Alert } from "@material-ui/lab";
import { CircularProgress } from "@material-ui/core";
import { addTransferResult } from "../../store/features/Transfer/TransferSlice";
import SelectField from "../../components/forms/SelectField";
import CashLayout from "../../components/CashLayout";
import { extractError } from "../../utility";
import BeneficiarySummary from "../../components/BeneficiarySumary";
import { getCashInMethod } from "../../utilities/help";

const RATE = 655.957;

const Deposit: React.FC<any> = ({ setDepositOpen }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    transfer,
    auth: {
      user: { full_name, company, id, email, dana_pay_bank_accounts },
      userBalance,
    },
  } = useAppSelector((state) => state.persistedReducer);
  const [paymentMethod, setPaymentMethod] = React.useState<any>("");
  const [amountInCfa, setAmountInCfa] = React.useState<number>(0);
  const [amountInEURos, setAmountInEURos] = React.useState<number>(0);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [limitError, setLimitError] = React.useState<any>(null);
  const [fees, setFees] = React.useState<number>(0);
  const [feesCalculated, setFeesCalculated] = React.useState<boolean>(false);
  const [nextStep, setNextStep] = React.useState("first");
  const [errorGot, setErrorGot] = React.useState("");
  const [selectedBank, setSelectedBank] = React.useState<any>(null);
  const [payInResponse, setPayInResponse] = React.useState<any>(null);
  const [fetchingFees, setFetchingFees] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  // const [transferCountry, setTransferCountry] = useSate(null);

  const steps = [
    t("Amount"),
    t("complete_payment"),
    t("select_bank"),
    t("bank_details"),
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAppliesFees = () => {
    if (!paymentMethod) return;

    setFees(0);
    setFeesCalculated(true);
    setFetchingFees(true);

    const selectedCashInMethodArray =
      transfer.loggedInUserCountry?.cash_in_methods.find(
        (value: any) =>
          value.cash_in_method.payment_type.name.toLowerCase() ===
          paymentMethod.toLowerCase()
      );

    if (!amountInEURos) return;
    if (!selectedCashInMethodArray) return;
    setErrorGot("");

    getAppliedFeesForDeposits(
      {
        euro_amount: amountInEURos,
        sending_country_id: transfer.loggedInUserCountry.id,
        cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
      },
      id
    )
      .then((response: any) => {
        setFees(response.fee);
        setFeesCalculated(false);
        setFetchingFees(false);
      })
      .catch((error) => {
        setFeesCalculated(false);
        const err = extractError(error);
        setErrorGot(err);
        setFetchingFees(false);
      });
  };

  const getCountry = () => {
    const pp = transfer.loggedInUserCountry?.cash_in_methods?.find(
      (data: any) =>
        data.cash_in_method.payment_type.name.toLowerCase() === "bank_transfer"
    );
    if (pp) {
      setPaymentMethod(pp.cash_in_method.payment_type.name);
    }
  };

  const makePayIn = () => {
    if (paymentMethod === "") return;
    const selectedCashInMethodArray = getCashInMethod(transfer, paymentMethod);
    if (!selectedCashInMethodArray) return;

    if (
      selectedCashInMethodArray.cash_in_method.payment_type.name.toLowerCase() ===
      "balance"
    ) {
      toast.error(t("cant_use_balance"));
      return;
    }

    if (amountInEURos <= 0) {
      toast.error(t("cant_deposit_zero"));
      return;
    }

    const cashin_method_id =
      selectedCashInMethodArray?.cash_in_method?.id || null;

    if (!cashin_method_id) {
      toast.error(t("Please_select_cashin_Method"));
      return;
    }

    const transactionData = {
      cashin_method_id,
      amount_without_fees_in_euro: amountInEURos,
      country_id: transfer.loggedInUserCountry.id,
    };

    depositOnAccount(transactionData)
      .then((res: any) => {
        setProcessingPayment(false);
        dispatch(addTransferResult(res));
        setPayInResponse(res);
        if (
          selectedCashInMethodArray.cash_in_method.payment_type.name.toLowerCase() ===
          "bank_transfer"
        ) {
          // setActiveStep(3); // if its bank transfer used
          if (selectedBank) {
            setNextStep("bank");
            setActiveStep(3);
          } else {
            setNextStep("selectBank");
            setActiveStep(2);
          }
        } else {
          // handleNext(); // normal flow
          setNextStep("web");
          setActiveStep(1);
        }
      })
      .catch((error) => {
        setProcessingPayment(false);
        toast.error(extractError(error));
      });
  };

  const renderSteps = () => {
    return (
      <>
        {nextStep === "first" && (
          <div className="row shadow-lg  rounded-lg p-3">
            <div className="col-md-12 border-b-2 text-center p-3">
              <span>{t("Balance")}</span>
              <br />
              <span className="text-2xl">
                <CashLayout cash={userBalance} />
              </span>
            </div>
            <div className="col-md-6 pt-4">
              <div className="form-group mt-2 mb-3">
                <SelectField
                  value={paymentMethod}
                  data={transfer.loggedInUserCountry?.cash_in_methods
                    ?.filter(
                      (data: any) =>
                        data.cash_in_method.payment_type.name.toLowerCase() ===
                        "bank_transfer"
                    )
                    .map((value: any) => {
                      return {
                        name: value.cash_in_method.name,
                        type: value.cash_in_method.payment_type.name,
                      };
                    })}
                  setData={(value: any) => {
                    setPaymentMethod(value);
                  }}
                  width={true}
                  label={t("Payment_Mode")}
                />
              </div>
              <InputField
                name="Sent amount (EUR)"
                label={t("Sent_amount_EUR")}
                handleChange={(value: any) => {
                  setLimitError(null);
                  if (
                    parseInt(value.target.value) >
                    transfer.transferCountry?.sending_max_amount
                  ) {
                    setLimitError(
                      `${"You_can_send_between"} ${
                        transfer.transferCountry?.sending_min_amount
                      } and ${transfer.transferCountry?.sending_max_amount}`
                    );
                  }
                  if (
                    parseInt(value.target.value) <
                    transfer.transferCountry?.sending_min_amount
                  ) {
                    setLimitError(
                      `${"You_can_send_between"}  ${
                        transfer.transferCountry?.sending_min_amount
                      } and ${transfer.transferCountry?.sending_max_amount}`
                    );
                  }
                  setAmountInEURos(value.target.value);
                  if (value.target.value) {
                    const totalAmount = parseFloat(value.target.value) * RATE;
                    setAmountInCfa(totalAmount);
                  } else {
                    setAmountInCfa(0);
                  }
                }}
                value={amountInEURos}
                type="number"
              />
              {errorGot && (
                <small className="text-red-500 text-xs">{errorGot}</small>
              )}
              <div>
                {limitError && <Alert severity="error">{limitError}</Alert>}
              </div>
              <br />

              <InputField
                name="Amount received (Cfa)"
                label={t("Sent_amount_Cfa")}
                handleChange={(value: any) => {
                  setAmountInCfa(value.target.value);
                  if (value.target.value) {
                    const totalAmount = parseFloat(value.target.value) / RATE;
                    setAmountInEURos(totalAmount);
                  } else {
                    setAmountInEURos(0);
                  }
                }}
                value={amountInCfa}
                type="number"
              />
            </div>
            <div className="col-md-6">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-row items-center ">
                  <BeneficiarySummary
                    name={full_name}
                    company={company?.name || email}
                  />
                </div>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small>{t("amount")}</small>
                </p>
                <p>
                  <small>
                    <CashLayout cash={amountInEURos} />
                  </small>
                </p>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small>{t("fees")}</small>
                </p>
                <p>
                  {fetchingFees ? (
                    <CircularProgress size={14} />
                  ) : (
                    <small>
                      <CashLayout cash={fees} />
                    </small>
                  )}
                </p>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small style={{ color: "rgb(3, 115, 117)" }}>
                    {t("total")}
                  </small>
                </p>
                <p>
                  <b style={{ color: "rgb(3, 115, 117)" }}>
                    <CashLayout cash={+amountInEURos + fees} />
                  </b>
                </p>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small>{t("ExchangeRate")}</small>
                </p>
                <p>
                  <small>
                    <b>1EUR = {RATE} Cfa</b>
                  </small>
                </p>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small>{t("PaymentMode")}</small>
                </p>
                <p>
                  <small>
                    <b>{t(paymentMethod)}</b>
                  </small>
                </p>
              </div>

              <div className="flex flex-row justify-between items-center p-2">
                <p>
                  <small>{t("TransactionType")}</small>
                </p>
                <p>
                  <small>
                    <b>{t("Deposit")}</b>
                  </small>
                </p>
              </div>
            </div>
            <div className="col-md-6">
              {!processingPayment ? (
                <button
                  className="btn mt-3"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  onClick={() => makePayIn()}
                  disabled={feesCalculated || errorGot !== ""}
                >
                  <small className="text-white px-10 font-bold">
                    {t("continue")}
                  </small>
                </button>
              ) : (
                <button
                  className="btn mt-3"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  disabled
                >
                  <small className="text-white px-10 font-bold">
                    {t("processing")}
                  </small>
                </button>
              )}
            </div>
          </div>
        )}

        {nextStep === "web" && (
          <div className="container shadow-lg">
            <iframe
              src={transfer.transferResult.connect_url}
              width="100%"
              height="100%"
              title="description"
            ></iframe>
          </div>
        )}

        {nextStep === "selectBank" && (
          <div className="container">
            <div className="row">
              <div className="col-md-4"></div>
              <div className="col-md-4 p-4 shadow-lg rounded-lg">
                <div className="my-4 text-center mb-4">
                  <h3 className="font-bold text-2xl">
                    {t("payment_instruction")}
                  </h3>
                  <p>{t("pi_text")}</p>
                </div>
                <select
                  className={`border-b-2 rounded bg-white w-full mb-4 my-4 py-2`}
                  onChange={(event: any) =>
                    setSelectedBank(dana_pay_bank_accounts[event.target.value])
                  }
                >
                  <option>{t("select_bank")}</option>
                  {dana_pay_bank_accounts.map((bank: any, index: number) => (
                    <option value={index} className="py-2">
                      {bank.bank_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setNextStep("bank");
                    setActiveStep(3);
                  }}
                  className="btn rounded-md w-full"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  disabled={selectedBank === null}
                >
                  <small className="font-bold text-white mx-10">
                    {t("continue")}
                  </small>
                </button>
              </div>
              <div className="col-md-4"></div>
            </div>
          </div>
        )}

        {nextStep === "bank" && (
          <div className="container">
            <div className="row">
              <div className="col-md-2"></div>
              <div className="col-md-8 p-4 shadow-lg">
                <BankDetails
                  accountDetails={selectedBank}
                  payment_id={payInResponse.details.id}
                />
              </div>
              <div className="col-md-2"></div>
            </div>
          </div>
        )}
      </>
    );
  };

  useEffect(() => {
    fetchAppliesFees();
  }, [paymentMethod, amountInEURos]);

  useEffect(() => {
    getCountry();
  }, []);

  return (
    <>
      <div style={{ backgroundColor: "rgb(3, 115, 117)" }}>
        <div
          className="container"
          style={{ backgroundColor: "rgb(3, 115, 117)" }}
        >
          <div
            className="py-2 flex flex-row items-center justify-between"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
          >
            <span className="text-white font-bold">{t("MakeDeposit")}</span>
            <div>
              <button
                className="btn  shadow-lg px-4"
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
                onClick={() => setDepositOpen(false)}
              >
                <b className="text-white">{t("close")}</b>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      <div className="container flex justify-center items-center pt-20">
        {renderSteps()}
      </div>
    </>
  );
};

export default Deposit;
