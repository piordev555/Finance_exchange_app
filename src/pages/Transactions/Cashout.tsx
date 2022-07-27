import * as React from "react";
import Box from "@material-ui/core/Box";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "@material-ui/lab";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import {
  getCashOutMethods,
  initiateCashOut,
  confirmCashOut,
  currentBalance,
  getAppliedFeesForWithdraws,
  resendCashOutCode,
} from "../../store/features/Transfer/Transfer";
import { toast } from "material-react-toastify";
import { extractError } from "../../utility";
import { useHistory } from "react-router";
import CashLayout from "../../components/CashLayout";
import Accounts from "../../components/Accounts";
import { translateError } from "../../utilities/help";

const RATE = 655.957;

const Cashout: React.FC<any> = ({ setWithDrawOpen }) => {
  const { t } = useTranslation();
  const {
    auth: { user, userBalance, selected_account },
    transfer: { danaPayCountries, loggedInUserCountry },
  } = useAppSelector((state) => state.persistedReducer);

  const [steps, setSteps] = React.useState([
    t("amount"),
    t("PaymentMode"),
    t("verification"),
    t("Confirmation"),
  ]);
  const [toWithDraw, setToWithDraw] = React.useState<any>(0);
  const [loading, setLoading] = React.useState(false);
  const [otp, setOTP] = React.useState(0);
  const [fees, setFees] = React.useState(0);
  const [type, setType] = React.useState("");
  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [cashoutResponse, setCashoutResponse] = React.useState<any>(null);
  const [cashoutMethod, setCashoutMethod] = React.useState<any[]>([]);
  const [method, setMethod] = React.useState<any>(null);
  const [euro_balance, setEuroBalance] = React.useState<any>(0);
  const [size, setSize] = React.useState<any>([0, 0]);
  const [resending, setResending] = React.useState<boolean>(false);
  const history = useHistory();

  const {
    auth: {
      user: { country_code, phone_number },
      currency,
      rate,
    },
  } = useAppSelector((state) => state.persistedReducer);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handlePrev = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const showToast = (message: string, type = "error") => {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const getMethods = async () => {
    try {
      const methods = await getCashOutMethods();
      setCashoutMethod(methods.data);
      const activeMethod = methods.data.find(
        (pp: any) => pp.name.toLowerCase() === "bank payout"
      );
      if (activeMethod) {
        setMethod(activeMethod.id);
        setType("bank");
      }
    } catch (error) {}
  };

  const startCashOut = () => {
    setError(null);
    if (method === "") {
      showToast(t("select_cashOut"));
      return;
    }
    if (selected_account === null) {
      showToast(t("select_account"));
      return;
    }
    if (parseFloat(euro_balance) <= 0) {
      showToast(t("balance_zero"));
      return;
    }
    const amount_in_euros = currency === "CFA" ? toWithDraw / rate : toWithDraw;
    const local_amount = currency === "CFA" ? toWithDraw : toWithDraw * RATE;

    if (amount_in_euros > parseFloat(euro_balance)) {
      showToast(t("Withdrawal_amount"));
      return;
    }

    setLoading(true);
    const payload = {
      amount_without_fees_in_euro: amount_in_euros,
      cashout_method_id: method,
      bank_account_id: selected_account.id,
      local_amount,
      local_currency: "CFA",
      country_id: loggedInUserCountry.id,
    };

    initiateCashOut(payload)
      .then((response: any) => {
        setCashoutResponse(response);
        setLoading(false);
        handleNext();
      })
      .catch((error) => {
        setLoading(false);
        toast.error(translateError(extractError(error), t));
      });
  };

  const resendCode = (e: any) => {
    e.preventDefault();
    setResending(true);
    resendCashOutCode(cashoutResponse.cashout.id)
      .then((res: any) => {
        setResending(false);
        toast.info(t("code_sent"));
      })
      .catch((error: any) => {
        setResending(false);
        toast.error(translateError(extractError(error), t));
      });
  };

  const confirmOTP = () => {
    setLoading(true);
    confirmCashOut({
      key_code: otp,
      id: cashoutResponse?.cashout.id,
    })
      .then((res: any) => {
        setLoading(false);
        handleNext();
      })
      .catch((error) => {
        setLoading(false);
        toast.error(translateError(extractError(error), t));
      });
  };

  const showBalanceError = () => {
    const balance = parseFloat(euro_balance) * rate;
    let cash = toWithDraw;

    if (currency !== "CFA") {
      cash = parseFloat(toWithDraw) * rate;
    }

    if (balance === 0) {
      return (
        <small className="text-red-600" style={{ fontSize: 10 }}>
          {t("with_0_balance")}
        </small>
      );
    } else if (cash > balance) {
      return (
        <small className="text-red-600" style={{ fontSize: 10 }}>
          {t("expectAmount")} {(parseFloat(euro_balance) * rate).toFixed(2)}
        </small>
      );
    }
  };

  const calculatedFees = () => {
    getAppliedFeesForWithdraws(
      {
        euro_amount: currency === "EUR" ? toWithDraw : toWithDraw / RATE,
        country_id: loggedInUserCountry?.id,
        cashout_method_id: method,
      },
      user?.id
    )
      .then((response: any) => {
        setFees(response.fee);
      })
      .catch((error: any) => null);
  };

  const renderSection = () => {
    if (activeStep === 0) {
      return (
        <div className="container">
          <div className="row">
            {size[0] < 900 && (
              <div className="col-md-12 py-4">
                <h2>{steps[0]}</h2>
              </div>
            )}
            <div className="col-md-3"></div>
            <div className="col-md-6 text-center">
              <div className="shadow-lg p-10" style={{ marginTop: 30 }}>
                <div className="my-2">
                  <small> {t("Available_outstanding_balance")}</small>
                  <h1 className="font-bold text-2xl">
                    <CashLayout cash={userBalance} />
                  </h1>
                </div>

                <h2 className="font-regular text-sm mb-4">
                  {t("type_withdraw_amount")}
                </h2>
                <div className="row">
                  <div className="col-md-6 col-sm-12 col-xs-12">
                    <button
                      className="btn rounded-lg mb-3 px-4 border w-full bg-gray-200 shadow-md"
                      onClick={() => {
                        const value = parseFloat(euro_balance) * rate;
                        setToWithDraw(value);
                      }}
                    >
                      <small className="font-bold text-black">
                        {t("Withdraw_All")}
                      </small>
                    </button>
                  </div>
                  <div className="col-md-6  col-sm-12 col-xs-12 text-left">
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Amount in Euro"
                      onChange={(e: any) => setToWithDraw(e.target.value)}
                      onBlur={(e: any) => setToWithDraw(e.target.value)}
                      value={toWithDraw}
                    />
                    {showBalanceError()}
                    <div className="flex flex-row justify-between my-2 pt-2">
                      <small>{t("fees")}</small>
                      <small>
                        {(fees * rate).toFixed(2)} {currency}
                      </small>
                    </div>
                    <hr />

                    <div className="flex flex-row justify-between my-2">
                      <p>{t("total")}</p>
                      <p>
                        <b style={{ color: "rgb(3, 115, 117)" }}>
                          {(fees * rate + parseInt(toWithDraw)).toFixed(2)}{" "}
                          {currency}
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  className="btn rounded-lg  mt-3 mb-4 px-10"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  onClick={() => {
                    const userHas =
                      currency === "CFA"
                        ? parseFloat(euro_balance) * rate
                        : parseFloat(euro_balance);
                    const convertedFee =
                      currency === "CFA" ? fees * rate : fees;
                    const withdrawing = parseInt(toWithDraw) + convertedFee;

                    if (userHas >= withdrawing) {
                      handleNext();
                    } else {
                      toast.error(t("insufficient"));
                    }
                  }}
                  disabled={parseFloat(toWithDraw) <= 0 || toWithDraw === ""}
                >
                  <small className="text-white font-bold">
                    {t("ConfirmCashout")}
                  </small>
                </button>
              </div>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      );
    }

    if (activeStep === 1) {
      return (
        <div className="container">
          <div className="row shadow-lg py-4">
            {size[0] < 900 && (
              <div className="col-md-12 py-4">
                <h2>{steps[1]}</h2>
              </div>
            )}
            <div className="col-md-3"></div>
            <div className="col-md-6 text-center">
              <h2 className="font-semibold text-xl">
                {t("Enter_withdraw_Details")}
              </h2>
              <div className="row g-3 py-2">
                <div className="col-md-3"></div>
                <div className="col-md-6 col-sm-12 col-xs-12">
                  <select
                    className={`border-b-2 rounded bg-white w-full mb-4 py-2`}
                    onChange={(text) => {
                      setMethod(text.target.value);
                      if (text.target.value == "bank_payout") {
                        setType("bank");
                      } else {
                        setType("mobile");
                      }
                    }}
                  >
                    {cashoutMethod.map((opt: any) => (
                      <option value={opt.id}>
                        {t(opt.name.replace(" ", "_").toLowerCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3"></div>
              </div>
            </div>
            <div className="col-md-3"></div>
            <div className="col-md-12">
              {type !== "" && (
                <Accounts type={type} selected_account={selected_account} />
              )}
            </div>
            <div className="col-md-4"></div>
            <div className="col-md-4">
              <button
                className="btn rounded-lg  mt-3 mb-4 px-4 mx-3 border"
                onClick={handlePrev}
              >
                <small className="text-black font-bold">{t("back")}</small>
              </button>
              {loading ? (
                <button
                  className="btn rounded-lg  mt-3 mb-4 px-4"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                >
                  <small className="text-white font-bold">
                    <p>{t("processing")}</p>
                  </small>
                </button>
              ) : (
                <button
                  className="btn rounded-lg  mt-3 mb-4 px-4"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  onClick={startCashOut}
                >
                  <small className="text-white font-bold">
                    {t("Send_and_Continue")}
                  </small>
                </button>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      );
    }

    if (activeStep === 2) {
      return (
        <div className="container">
          <div className="row">
            {size[0] < 900 && (
              <div className="col-md-12 py-4">
                <h2>{steps[2]}</h2>
              </div>
            )}
            <div className="col-md-4"></div>
            <div className="col-md-4 text-center">
              <div style={{ marginTop: 10 }} className="shadow-lg p-10">
                <h2 className="font-semibold text-xl">
                  {t("Type_verification_code")}
                </h2>
                <small>
                  {t("TVCText")} {`+${country_code} ${phone_number}`}.
                </small>
                <input
                  type="number"
                  className="form-control my-4"
                  id="inputPassword2"
                  required
                  maxLength={6}
                  onChange={(e: any) => setOTP(e.target.value)}
                  placeholder={t("EnterOTP")}
                />

                {resending ? (
                  <div className="flex justify-center items-center p-4">
                    <small className="font-bold">{t("resending")}...</small>
                  </div>
                ) : (
                  <>
                    <div>
                      <button
                        className="btn rounded-lg  mt-3 mb-4 px-4 mx-3 border"
                        onClick={handlePrev}
                      >
                        <small className="text-black font-bold">
                          {t("back")}
                        </small>
                      </button>
                      <button
                        className="btn rounded-lg  mt-3 mb-4 px-4"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                        onClick={() => confirmOTP()}
                      >
                        <small className="text-white font-bold">
                          {t("ConfirmCashout")}
                        </small>
                      </button>
                    </div>

                    <div>
                      <a
                        className="underline cursor-pointer"
                        onClick={(e) => resendCode(e)}
                      >
                        <small className="font-bold">
                          {t("send_the_code_again")}
                        </small>
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      );
    }

    if (activeStep === 3) {
      return (
        <div>
          <div className="row">
            {size[0] < 900 && (
              <div className="col-md-12 py-4">
                <h2>{steps[3]}</h2>
              </div>
            )}

            <div className="col-md-4"></div>
            <div className="col-md-4 text-center">
              <div style={{ marginTop: 30 }} className="shadow-lg p-10">
                <h1 className="font-bold text-3xl py-4">{t("onTheWay")}</h1>
                <p>{t("onTheWayDesc")}</p>

                <button
                  className="btn rounded-lg  mt-3 mb-4 px-4"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  onClick={() => {
                    history.push("/");
                  }}
                >
                  <small className="text-white font-bold">{t("GOBACK")}</small>
                </button>
              </div>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      );
    }
  };

  const getBalance = async () => {
    try {
      const balance: any = await currentBalance();
      const bal = balance?.client.euro_balance;
      setEuroBalance(bal);
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  React.useEffect(() => {
    getBalance();
    getMethods();
  }, []);

  React.useEffect(() => {
    calculatedFees();
  }, [toWithDraw]);

  return (
    <>
      <div
        className="py-2 px-1 overflow-y-scroll"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      >
        <div className="container  flex flex-row items-center justify-between">
          <span className="text-white font-bold">
            {t("Enter_Withdraw_details")}
          </span>
          <button
            className="btn  shadow-md px-4"
            style={{ backgroundColor: "rgb(3, 115, 117)" }}
            onClick={() => setWithDrawOpen(false)}
          >
            <b className="text-white">{t("close")}</b>
          </button>
        </div>
      </div>
      <Box style={{ width: "100%" }}>
        {size[0] > 900 ? (
          <div className="container my-4">
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </div>
        ) : null}

        {activeStep === steps.length ? (
          <React.Fragment />
        ) : (
          <React.Fragment>{renderSection()}</React.Fragment>
        )}
      </Box>
    </>
  );
};

export default Cashout;
