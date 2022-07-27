import React, { useState, useLayoutEffect } from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import BankDetails from "./BankDetails";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import CashLayout from "./CashLayout";
import {
  currentBalance,
  getAppliedFeesForTransfers,
  getDanapayBanks,
  getTransferCountries,
  initTransfer,
} from "../store/features/Transfer/Transfer";
import { extractError } from "../utility";
import SelectField from "./forms/SelectField";
import { toast } from "material-react-toastify";
import { getFavorites } from "../store/features/Auth/Auth";
import Avatar from "react-avatar";
import { addTransferResult } from "../store/features/Transfer/TransferSlice";
import { CircularProgress } from "@material-ui/core";
import { countries_code } from "../utilities/country";
import InputField from "./forms/InputField";
import BeneficiarySummary from "./BeneficiarySumary";
import { useHistory } from "react-router";
import {
  getCashInMethod,
  getLoggedInUserReceivingCountries,
} from "../utilities/help";

const RATE = 655.957;

const BulkPayment: React.FC<any> = ({ setBulkPaymentModal, t }) => {
  const dispatch = useAppDispatch();
  const {
    transfer,
    auth: { user, currency, lang, rate, dana_pay_bank_accounts },
  } = useAppSelector((state) => state.persistedReducer);
  const [steps, setSteps] = useState([
    t("beneficiary"),
    t("Amount"),
    t("payment"),
    t("Confirmation"),
  ]);
  const [size, setSize] = useState([0, 0]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [fees, setFees] = useState(0);
  const [reason, setReason] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [amountEuro, setAmountEuro] = useState(0);
  const [amountCfa, setAmountCfa] = useState(0);
  const [feesCalculated, setFeesCalculated] = React.useState<boolean>(false);
  const [errorGot, setErrorGot] = React.useState("");
  const [euroBalance, setEuroBalance] = React.useState(0);
  const [selectedBank, setSelectedBank] = React.useState("");
  const [favorites, setFavorites] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = React.useState<any>("");
  const [toCountries, setToCountries] = React.useState<any>([]);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<any>([]);
  const [fetchingFees, setFetchingFees] = React.useState(false);
  const [receivingCountries, setReceivingCountries] = React.useState<any>([]);
  const [wasBalance, setWasBalance] = React.useState<any>(false);
  const history = useHistory();

  const calculateFees = () => {
    setErrorGot("");
    setFetchingFees(true);

    const selectedCashInMethodArray = getCashInMethod(transfer, payMethod);

    if (!selectedCashInMethodArray) {
      return;
    }

    const receiving = transfer.loggedInUserCountry?.receiving_countries.find(
      (receiving_country_data: any) =>
        receiving_country_data.receiving_country.name.toLowerCase() ===
        selectedCountry.toLowerCase()
    );

    if (!receiving) return;

    getAppliedFeesForTransfers(
      {
        euro_amount: amountEuro,
        sending_country_id: transfer.loggedInUserCountry.id,
        receiving_country_id: receiving.receiving_country.id,
        cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
      },
      user?.id
    )
      .then((response: any) => {
        setErrorGot("");
        setFees(response.fee);
        setFeesCalculated(false);
        setFetchingFees(false);
      })
      .catch((error) => {
        setFeesCalculated(false);
        setFetchingFees(false);
        if (error) {
          const err = extractError(error);
          setErrorGot(err);
        }
      });
  };

  const getUserContacts = () => {
    getFavorites()
      .then((res: any) => {
        setFavorites(res);
        const cc = new Set(
          res.map((response: any) => response.favorite.country)
        );
        setToCountries(Array.from(cc));
      })
      .catch((error) => null);
  };

  const submitRequest = () => {
    const selectedCashInMethodArray = getCashInMethod(transfer, payMethod);
    if (!selectedCashInMethodArray) return;
    const receiving = transfer.loggedInUserCountry?.receiving_countries.find(
      (receiving_country_data: any) =>
        receiving_country_data.receiving_country.name.toLowerCase() ===
        selectedCountry.toLowerCase()
    );
    if (!receiving) {
      toast.error(t("country_not_configured"));
      return;
    }

    setProcessingPayment(true);
    for (let i = 0; i < selectedUsers.length; i++) {
      const dd: any = favorites.find(
        (res: any) => res.favorite.id === selectedUsers[i]
      );

      const transactionData = {
        cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
        amount_without_fees_in_euro: amountEuro,
        payment_delivery: false,
        is_escrowed: false,
        sending_country_id: transfer.loggedInUserCountry?.id,
        receiving_country_id: receiving.receiving_country.id,
        phone_number: dd["favorite"]["phone_number"].replace(
          dd["country_code"],
          ""
        ),
        country_code: dd["favorite"]["country_code"],
        reason,
        is_payment_on_demand: false,
      };

      initTransfer(transactionData)
        .then((res: any) => {
          dispatch(addTransferResult(res));
          setProcessingPayment(false);
          setSentTo((prev: any) => [...prev, selectedUsers[i]]);
          if (selectedUsers.length - 1 === i) {
            if (payMethod.toLowerCase() === "balance") {
              setActiveStep(3);
              setWasBalance(true);
            } else {
              setActiveStep(2);
            }
          }
        })
        .catch((error) => {
          setProcessingPayment(false);
          toast.error(extractError(error));
        });
    }
  };

  const getBalance = async () => {
    try {
      const balance: any = await currentBalance();
      const bal = balance?.client.euro_balance;
      setEuroBalance(bal);
    } catch (error) {}
  };

  const getStepContent = () => {
    if (activeStep === 0) {
      return (
        <div className="h-full w-full justify-center items-center">
          <div className="row mt-10">
            <div className="col-md-2  col-sm-12 col-xs-12"></div>
            <div className="col-md-8 col-sm-12 col-xs-12 py-10">
              <div className="shadow-lg p-4 m-auto flex flex-col justify-center items-center rounded-lg">
                <div className="my-4 w-full ">
                  <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-4">
                      <h2 className="text-2xl text-center font-bold mb-2">
                        {t("Select_Beneficiaries")}
                      </h2>
                      <p className="text-center mb-3">{t("select_country")}</p>
                      <select
                        onChange={(text: any) => {
                          setSelectedCountry(text.target.value);
                          setSelectedUsers([]);
                        }}
                        className={`border-b-2 rounded bg-white w-full mb-4 py-1`}
                      >
                        {receivingCountries.map((name: any) => (
                          <option value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4"></div>
                  </div>

                  <div className="flex flex-row p-2 my-4 overflow-x-scroll w-full justify-center ">
                    {favorites
                      .filter(
                        (userObj: any) => userObj?.favorite?.full_name !== " "
                      )
                      .map((user: any) => {
                        if (
                          user?.favorite.country.toLowerCase() ===
                          selectedCountry.toLowerCase()
                        ) {
                          return (
                            <div
                              className="flex justify-center items-center flex-col px-3"
                              onClick={() => {
                                if (
                                  selectedCountry !== "" &&
                                  user?.favorite.country.toLowerCase() ===
                                    selectedCountry.toLowerCase()
                                ) {
                                  setSelectedUsers((prev: any) => {
                                    if (
                                      selectedUsers.includes(user?.favorite.id)
                                    ) {
                                      return selectedUsers.filter(
                                        (u: any) => u !== user?.favorite.id
                                      );
                                    } else {
                                      return [...prev, user?.favorite.id];
                                    }
                                  });
                                }
                              }}
                            >
                              <div
                                style={{ height: 60, width: 60 }}
                                className={`rounded-full mx-2 cursor-pointer flex justify-center items-center shadow-md mb-2 ${
                                  selectedUsers.includes(user?.favorite.id)
                                    ? "bg-green-400"
                                    : "bg-gray-200 "
                                }`}
                              >
                                <Avatar
                                  name={user?.favorite?.full_name}
                                  size="50"
                                  round
                                />
                              </div>
                              <small className="text-center">
                                {user?.favorite.first_name}
                              </small>
                              <small>{user?.favorite.country}</small>
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
                <button
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="btn rounded-md  px-10"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  disabled={selectedUsers.length === 0}
                >
                  <small className="font-bold text-white mx-10">
                    {t("continue")}
                  </small>
                </button>
                <br />
                <br />
              </div>
            </div>
            <div className="col-md-2 col-sm-12 col-xs-12"></div>
          </div>
        </div>
      );
    }

    if (activeStep === 1) {
      return (
        <div className="h-full w-full justify-center items-center">
          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-10">
              <div className="row shadow-lg mt-20">
                <div className="col-md-12 border-b-2 text-center p-3">
                  <span>{t("Balance")}</span>
                  <br />
                  <span className="text-2xl">
                    <CashLayout cash={euroBalance} />
                  </span>
                </div>

                <div className="col-md-6 p-4">
                  <div className="mb-3">
                    <InputField
                      handleChange={(text: any) => setReason(text.target.value)}
                      value={reason}
                      label={t("reason")}
                      type="text"
                      name="reason"
                    />
                  </div>

                  <div className="mb-3">
                    <SelectField
                      value={payMethod}
                      data={transfer.loggedInUserCountry?.cash_in_methods
                        ?.filter(
                          (data: any) =>
                            data.cash_in_method.payment_type.name.toLowerCase() ===
                              "bank_transfer" ||
                            data.cash_in_method.payment_type.name.toLowerCase() ===
                              "balance"
                        )
                        .map((value: any) => {
                          return {
                            name: value.cash_in_method.name,
                            type: value.cash_in_method.payment_type.name,
                          };
                        })}
                      setData={(value: any) => {
                        setPayMethod(value);
                      }}
                      width={true}
                      label={t("selectCashinMethod")}
                    />
                  </div>

                  <div className="mb-3">
                    <InputField
                      handleChange={(text: any) => {
                        setAmountEuro(parseFloat(text.target.value));
                        const cfaProduct = parseFloat(text.target.value) * RATE;
                        setAmountCfa(cfaProduct);
                      }}
                      value={amountEuro}
                      label={t("eur_amount")}
                      type="number"
                      name="eur_amount"
                      error={errorGot}
                    />
                  </div>

                  <div className="mb-3">
                    <InputField
                      handleChange={(text: any) => {
                        setAmountCfa(parseFloat(text.target.value));
                        const euroProduct =
                          parseFloat(text.target.value) / RATE;
                        setAmountEuro(euroProduct);
                      }}
                      value={amountCfa}
                      label={t("cfa_amount")}
                      type="number"
                      name="cfa_amount"
                      error={errorGot}
                    />
                  </div>

                  <div className="py-3">
                    <button
                      onClick={() => setActiveStep((prev) => prev - 1)}
                      className="btn rounded-md  px-10 bg-gray-600"
                    >
                      <small className="font-bold text-white mx-2">
                        {t("Back")}
                      </small>
                    </button>
                    <button
                      onClick={() => submitRequest()}
                      className="btn rounded-md  px-10 mx-3"
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      disabled={processingPayment}
                    >
                      <small className="font-bold text-white mx-2">
                        {t("continue")}
                      </small>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="flex flex-row justify-between items-center">
                    <BeneficiarySummary
                      name={`${selectedUsers.length} ${t("People_selected")}`}
                      company={selectedCountry}
                    />
                  </div>

                  <div>
                    <div className="flex flex-row justify-between my-4">
                      <small>{t("amount")}</small>
                      <b>
                        {selectedUsers.length} *{" "}
                        <CashLayout cash={amountEuro} />
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <small>{t("fees")}</small>
                      <b>
                        {fetchingFees ? (
                          <CircularProgress size={14} />
                        ) : (
                          <span>
                            {selectedUsers.length} * <CashLayout cash={fees} />
                          </span>
                        )}
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <small style={{ color: "rgb(3, 115, 117)" }}>
                        {t("total")}
                      </small>
                      <b style={{ color: "rgb(3, 115, 117)" }}>
                        <CashLayout
                          cash={selectedUsers.length * (amountEuro + fees)}
                        />
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <small>{t("exchange_rate")}</small>
                      <b>1EUR = {RATE} CFA</b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <small>{t("PaymentMode")}</small>
                      <b>{t(payMethod)}</b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <small>{t("transaction_type")}</small>
                      <b>{t("Instant")}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-1"></div>
          </div>
        </div>
      );
    }

    if (activeStep === 2) {
      return (
        <div className="container">
          <div className="row pt-10">
            <div className="col-md-4"></div>
            <div className="col-md-4 flex flex-col justify-center items-center p-4 shadow-lg">
              <div className="my-4 text-center">
                <h3 className="font-bold text-2xl mb-3">
                  {t("payment_instruction")}
                </h3>
                <p>{t("pi_text")}</p>
              </div>

              <select
                className={`border-b-2 rounded bg-white w-full mb-4 my-4 py-2`}
                onChange={(v: any) =>
                  setSelectedBank(dana_pay_bank_accounts[v.target.value])
                }
              >
                <option>{t("select_bank")}</option>
                {dana_pay_bank_accounts.map((bank: any, index: number) => (
                  <option value={index}>{bank.bank_name}</option>
                ))}
              </select>
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="btn rounded-md"
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
      );
    }

    if (activeStep === 3) {
      return (
        <div className="pt-20">
          <div className="row">
            <div className="col-md-2" />
            <div className="col-md-8 shadow-lg py-4">
              {wasBalance ? (
                <div className="bg-white flex flex-col justify-center items-center text-center p-4">
                  <img
                    src="./images/checked.png"
                    style={{ height: 50, width: 50, margin: 20 }}
                  />
                  {lang === "en" ? (
                    <p>
                      We are sending{" "}
                      <b>
                        {currency === "EUR"
                          ? (selectedUsers.length * amountEuro).toFixed(2)
                          : selectedUsers.length * amountEuro * rate}{" "}
                        {currency}
                      </b>{" "}
                      <br />. Your beneficiaries will receive a message with the
                      necessary details for the withdrawal.
                    </p>
                  ) : (
                    <p>
                      Nous envoyons{" "}
                      <b>
                        <CashLayout
                          cash={
                            currency === "EUR"
                              ? (selectedUsers.length * amountEuro).toFixed(2)
                              : selectedUsers.length * amountEuro * rate
                          }
                        />
                      </b>{" "}
                      <br />
                      Vos bénéficiaires recevront un message avec les détails
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
              ) : (
                <BankDetails
                  accountDetails={selectedBank}
                  amount={
                    selectedUsers.length * amountEuro +
                    fees * selectedUsers.length
                  }
                />
              )}
            </div>
            <div className="col-md-2" />
          </div>
        </div>
      );
    }
  };

  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    getUserContacts();
    getBalance();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  React.useEffect(() => {
    calculateFees();
  }, [amountEuro, payMethod]);

  React.useEffect(() => {
    const countries = getLoggedInUserReceivingCountries(transfer, user, true);
    if (countries.length > 0) {
      setReceivingCountries(countries);
      setSelectedCountry(countries[0]);
    }
  }, []);

  return (
    <div>
      <div
        className="shadow-md"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      >
        <div className="container flex flex-row justify-between items-center py-2 text-white">
          <p className="font-bold">{t("Bulk_Payments")}</p>
          <button
            onClick={() => setBulkPaymentModal()}
            className="btn rounded-lg   shadow-lg px-4"
            style={{ backgroundColor: "rgba(3, 115, 117, .6)" }}
          >
            <small className="font-bold text-white">{t("close")}</small>
          </button>
        </div>
      </div>
      <div className="container">
        {size[0] < 900 ? null : (
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {activeStep === steps.length ? (
          <div className="w-full m-auto md:w-1/2 p-10 flex flex-col justify-center ">
            <p>All steps completed</p>
          </div>
        ) : (
          <div>{getStepContent()}</div>
        )}
      </div>
    </div>
  );
};

export default BulkPayment;
