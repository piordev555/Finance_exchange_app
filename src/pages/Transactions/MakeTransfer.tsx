import React, { useEffect, useLayoutEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import BeneficiaryCard from "../../components/BeneficiaryCard/BeneficiaryCard";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import { Alert } from "@material-ui/lab";
import {
  getAppliedFeesForTransfers,
  initTransfer,
} from "../../store/features/Transfer/Transfer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addBeneficiary,
  addTransferCountry,
  addTransferResult,
  setPaymentButtonState,
} from "../../store/features/Transfer/TransferSlice";
import { CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import { addContact, checkIfUserExists } from "../../store/features/Auth/Auth";
import BankDetails from "../../components/BankDetails";
import { toast } from "material-react-toastify";
import CashLayout from "../../components/CashLayout";
import { useHistory } from "react-router";
import { extractError } from "../../utility";
import {
  getCashInMethod,
  getPreferredComChannel,
  getCountryByCode,
  getSendingCountry,
  buildSelectInputData,
  checkCashInLimit,
  buildLimitError,
  applyRate,
  getReceivingCountryID,
  translateError,
  getLoggedInUserReceivingCountries,
} from "../../utilities/help";
import BeneficiarySummary from "../../components/BeneficiarySumary";

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

const RATE = 655.957;

const MakeTransfer = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    transfer,
    auth: { user, currency, rate, lang, userBalance, dana_pay_bank_accounts },
  } = useAppSelector((state) => state.persistedReducer);
  const classes = useStyles();
  const paymentButtonType = transfer.paymentButtonState.type;

  const [activeStep, setActiveStep] = React.useState(
    paymentButtonType === "instant" ? 0 : 1
  );
  const [firstName, setFirstName] = React.useState(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.destination_user.first_name
  );
  const [lastName, setLastName] = React.useState(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.destination_user.last_name
  );
  const [fullPhoneNumber, setFullPhoneNumber] = React.useState(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.destination_user
          .full_phone_number
  );
  const [fees, setFees] = React.useState(
    paymentButtonType === "instant"
      ? 0
      : transfer.paymentButtonState.transferData.applied_fees.value
  );
  const [feesCalculated, setFeesCalculated] = React.useState<boolean>(false);
  const [country, setCountry] = React.useState({ dialCode: "" });
  const [phoneValue, setPhoneValue] = React.useState("");
  const [reason, setReason] = React.useState(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.reason
  );
  const [email, setEmail] = React.useState(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.destination_user.email
  );
  const [phone, setPhone] = React.useState("");
  const [amountInCFA, setAmountInCFA] = React.useState<any>(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.local_amount
  );
  const [amountInEuros, setAmountInEuros] = React.useState<any>(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.amount_in_euros
  );
  const [amountWithoutFee, setAmountWithoutFee] = React.useState<any>(
    paymentButtonType === "instant"
      ? ""
      : transfer.paymentButtonState.transferData.amount_without_fee
  );
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [userCheck, setUserCheck] = React.useState<boolean>(false);
  const [steps, setSteps] = React.useState([
    t("beneficiary"),
    t("Amount"),
    t("payment"),
    t("Confirmation"),
  ]);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [limitError, setLimitError] = React.useState<any>(null);
  const [size, setSize] = React.useState<any>([0, 0]);
  const [errorGot, setErrorGot] = React.useState<any>("");
  const [response, setResponse] = React.useState<any>(null);
  const [selectedBank, setSelectedBank] = React.useState(null);
  const [fetchingFees, setFetchingFees] = React.useState(false);
  const [bankIndex, setBankIndex] = React.useState<any>(null);
  const [receivingCountries, setReceivingCountries] = React.useState<any>([]);
  const [beneFind, setBeneFind] = React.useState<boolean>(false);
  const [emailError, setEmailError] = React.useState("");
  const [preComChannel, setPreComChannel] = React.useState(null);

  const history = useHistory();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const submitTransaction = () => {
    if (parseFloat(amountInCFA) <= 0) {
      toast.error(t("enterCfa"));
      return;
    }
    if (parseFloat(amountInEuros) <= 0) {
      toast.error(t("enterEuros"));
      return;
    }

    if (!paymentMethod) {
      toast.error(t("selectCashIn"));
      return;
    }

    if (!reason) {
      toast.error(t("reasonError"));
      return;
    }

    const selectedCashInMethodArray = getCashInMethod(transfer, paymentMethod);
    const amount_in_euros = +amountInEuros + 0;

    if (
      selectedCashInMethodArray.cash_in_method.payment_type.name.toLowerCase() ===
        "balance" &&
      amount_in_euros > userBalance
    ) {
      toast.error(t("insufficient"));
      return;
    }

    setProcessingPayment(true);

    const receivingId = getReceivingCountryID(
      transfer,
      transfer.beneficiary?.country_code
    );
    if (!receivingId) {
      setErrorGot(t("no_receiving_country"));
    }

    const sending_country_id = getSendingCountry(transfer);
    if (!sending_country_id) {
      toast.error(t("insufficient"));
      return;
    }

    const transactionData = {
      cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
      amount_without_fees_in_euro:
        paymentButtonType === "instant" ? amount_in_euros : amountWithoutFee,
      payment_delivery: false,
      is_escrowed: false,
      sending_country_id: sending_country_id,
      receiving_country_id: receivingId,
      phone_number: transfer.beneficiary?.phone_number,
      country_code: transfer.beneficiary?.country_code,
      reason,
      is_payment_on_demand: false,
    };

    initTransfer(transactionData)
      .then((res: any) => {
        dispatch(addTransferResult(res));
        setProcessingPayment(false);
        setResponse(res);
        if (
          selectedCashInMethodArray.cash_in_method.payment_type.name.toLowerCase() ===
          "bank_transfer"
        ) {
          setActiveStep(3); // if its bank transfer used
        } else if (
          selectedCashInMethodArray.cash_in_method.payment_type.name.toLowerCase() ===
          "balance"
        ) {
          setActiveStep(3); // if its bank transfer used
        } else {
          handleNext(); // normal flow
        }
      })
      .catch((error) => {
        setProcessingPayment(false);
        toast.error(extractError(error));
      });
  };

  const setPhoneNumber = (value: any, data: any) => {
    let rawPhone = value.slice(data.dialCode.length);
    setCountry(data);
    setPhoneValue(phoneValue);
    setPhone(rawPhone);
  };

  const createNewContact = () => {
    if (lastName.length === 0 || firstName.length === 0) {
      toast.error(t("fields_required"));
      return;
    }

    if (preComChannel === "mail" && !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError(t("email_not_valid"));
      return;
    } else {
      setEmailError("");
    }

    const payload_data: payloadData = {
      last_name: lastName,
      first_name: firstName,
      email,
      country_code: country["dialCode"],
      phone_number: phone.replaceAll(" ", ""),
    };

    if (!payload_data["email"]) {
      delete payload_data["email"];
    }

    addContact(payload_data)
      .then((data: any) => {
        dispatch(addBeneficiary(data.beneficiary));
        dispatch(addTransferCountry(data.transferCountry));
        handleNext();
      })
      .catch((error) => {
        if (error.status === 422 || error.status === 500) {
          const err: any = Object.values(error.data.errors)[0];
          toast.error(err[0]);
        }
      });
  };

  const fetchBene = () => {
    if (phone === "") return;
    const selectedPhone = `+${country["dialCode"]}${phone}`;
    if (selectedPhone === user?.full_phone_number) {
      toast.error(t("cantSendToSelf"));
      return;
    }
    dispatch(addBeneficiary(null));
    setUserCheck(true);
    checkIfUserExists({
      country_code: country["dialCode"],
      phone_number: phone.replaceAll(" ", ""),
    })
      .then((result: any) => {
        setUserCheck(false);
        setBeneFind(true);
        setPreComChannel(
          getPreferredComChannel(
            transfer.danaPayCountries,
            transfer.beneficiary?.country_code
          ) //sms mail
        );
        const beneficiary_country = getCountryByCode(
          transfer.danaPayCountries,
          country["dialCode"]
        );
        if (result.exists) {
          dispatch(addBeneficiary(result.customer));
        }
        dispatch(addTransferCountry(beneficiary_country));
      })
      .catch((error: any) => {
        setUserCheck(false);
        if (error.status === 422 || error.status === 500) {
          const err: any = Object.values(error.data.errors)[0];
          toast.error(err[0]);
        }
      });
  };

  const removeBeneficiary = () => {
    dispatch(addBeneficiary(null));
    dispatch(addTransferCountry(null));
    setBeneFind(false);
    setPhone("");
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="bg-white flex flex-col justify-center items-center">
            <div className="row mt-20">
              <div className="col-12">
                {transfer.beneficiary === null && !beneFind && (
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold my-3 text-center">
                      {t("beneficiary")}
                    </h3>
                    <p className="text-center">{t("enterPhoneNumber")}</p>
                    <div className="mb-2 m-auto w-200 mt-3">
                      {receivingCountries.length > 0 ? (
                        <PhoneInput
                          country={receivingCountries[0]}
                          value={phoneValue}
                          onChange={(value, data) => {
                            setPhoneNumber(value, data);
                          }}
                          inputClass="PhoneInput"
                          onlyCountries={receivingCountries}
                          countryCodeEditable={false}
                          masks={{ ci: ".. .. .. .. .." }}
                        />
                      ) : (
                        <div className="bg-red-100 p-3 text-center">
                          <small className="text-red-500">
                            {t("try_refresh")}
                          </small>
                        </div>
                      )}

                      {userCheck ? (
                        <Button disabled>{t("processing")}</Button>
                      ) : (
                        <button
                          onClick={fetchBene}
                          className="btn rounded-lg my-6 px-10 w-full"
                          style={{ backgroundColor: "rgb(3, 115, 117)" }}
                        >
                          {activeStep === steps.length - 1 ? (
                            <span className="text-white capitalize">
                              {t("finish")}
                            </span>
                          ) : (
                            <span className="text-white capitalize">
                              {t("next")}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {transfer.beneficiary === null && beneFind && (
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="flex flex-col justify-center items-center">
                      <h3 className="text-2xl font-bold my-3">
                        {t("beneficiary")}
                      </h3>
                      <p className="text-center">
                        cc
                        <b>+{`${country["dialCode"]}${phone}`}</b>{" "}
                        {t("text_tell_us_more")}
                      </p>
                    </div>

                    <div className="border-1 shadow-md p-4 my-4">
                      <label>
                        <small>{t("FirstName")}</small>
                      </label>
                      <input
                        type="text"
                        className="form-control mb-1"
                        onChange={(e: any) => setFirstName(e.target.value)}
                        value={firstName}
                      />
                      <label>
                        <small>{t("LastName")}</small>
                      </label>
                      <input
                        type="text"
                        className="form-control mb-1"
                        onChange={(e: any) => setLastName(e.target.value)}
                        value={lastName}
                      />

                      <label>
                        <small>
                          {t("email")}{" "}
                          {preComChannel === "sms" && (
                            <span>[{t("optional")} ]</span>
                          )}
                        </small>
                      </label>
                      <input
                        type="email"
                        className="form-control mb-1"
                        onChange={(e: any) => {
                          setEmail(e.target.value);
                        }}
                        value={email}
                      />
                      {emailError.length > 0 && (
                        <small className="text-red-600">{emailError}</small>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <button
                          className="btn rounded-lg  btn-dark w-full"
                          onClick={() => removeBeneficiary()}
                        >
                          {t("cancel")}
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          className="btn rounded-lg w-full"
                          style={{ backgroundColor: "rgb(3, 115, 117)" }}
                          onClick={() => createNewContact()}
                        >
                          <span className="text-white capitalize">
                            {t("continue")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {transfer.beneficiary && (
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold my-3 text-center">
                      {t("beneficiary")}
                    </h3>
                    <p className="text-center">
                      {t("text_bene_details")}:{" "}
                      <b>{transfer.beneficiary.full_phone_number}</b>{" "}
                    </p>
                    <BeneficiaryCard beneficiary={transfer.beneficiary} />
                    <button
                      className="btn rounded-lg  btn-dark w-1/3 mr-4"
                      onClick={() => removeBeneficiary()}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className="btn rounded-lg w-1/3"
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      onClick={() => handleNext()}
                    >
                      <span className="text-white capitalize">
                        {t("continue")}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="container ">
            <div className="bg-white w-full py-3 mb-10">
              {size[0] < 900 && <h3>{steps[1]}</h3>}
            </div>
            <div className="flex justify-center items-center h-full">
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-10">
                  <div className="row shadow-lg">
                    <div className="col-md-12 border-b-2 text-center p-3">
                      <span>{t("Balance")}</span>
                      <br />
                      <span className="text-2xl">
                        <CashLayout cash={userBalance} />
                      </span>
                    </div>
                    <div className="flex p-3">
                      {" "}
                      <div className="col-md-5 p-0">
                        <div className="p-4">
                          <div className="mb-3">
                            <InputField
                              handleChange={(e: any) =>
                                setReason(e.target.value)
                              }
                              value={reason}
                              label={t("reason")}
                              type="text"
                              name="reason"
                            />
                          </div>

                          <div className="mb-3">
                            <SelectField
                              value={paymentMethod}
                              data={buildSelectInputData(transfer)}
                              setData={(value: string) =>
                                setPaymentMethod(value)
                              }
                              width={true}
                              label={t("selectCashinMethod")}
                            />
                          </div>

                          <div className="mb-1">
                            <InputField
                              name="Sent amount (EUR)"
                              label={t("Sent_amount_EUR")}
                              handleChange={(e: any) => {
                                if (paymentButtonType === "instant") {
                                  setLimitError(null);
                                  if (checkCashInLimit(transfer, "min", e)) {
                                    setLimitError(
                                      buildLimitError(transfer, "min", t)
                                    );
                                  }
                                  if (checkCashInLimit(transfer, "min", e)) {
                                    setLimitError(
                                      buildLimitError(transfer, "min", t)
                                    );
                                  }
                                  setAmountInEuros(e.target.value);
                                  setAmountInCFA(applyRate(e, RATE, "EUR"));
                                } else if (paymentButtonType === "repeat") {
                                  return null;
                                } else {
                                  return;
                                }
                              }}
                              value={
                                paymentButtonType === "instant"
                                  ? amountInEuros
                                  : Number(amountInEuros) -
                                    Number(
                                      transfer.paymentButtonState.transferData
                                        .applied_fees.value
                                    )
                              }
                              type="number"
                            />
                          </div>
                          {errorGot && (
                            <small className="text-red-500">{errorGot}</small>
                          )}

                          {limitError && (
                            <Alert severity="error">{limitError}</Alert>
                          )}

                          <div className="mb-3">
                            <InputField
                              name="Amount received (CFA)"
                              label={t("Sent_amount_Cfa")}
                              handleChange={(e: any) => {
                                paymentButtonType === "instant" &&
                                  setAmountInEuros(applyRate(e, RATE, "CFA"));
                              }}
                              value={amountInCFA}
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-1"></div>
                      <div className="col-md-6 px-5 py-2 shadow-md rounded-lg">
                        {paymentButtonType === "instant" ? (
                          <BeneficiarySummary
                            name={transfer?.beneficiary?.full_name}
                            company={
                              transfer?.beneficiary?.company?.name ||
                              transfer?.beneficiary?.email
                            }
                          />
                        ) : (
                          <div className="flex flex-row py-2">
                            <img
                              src="/images/user.png"
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                              }}
                            />
                            <div className="ml-4">
                              <h3 className="font-bold text-2xl">
                                {firstName && firstName} {lastName && lastName}
                              </h3>
                              <p className="text-sm">
                                {email && email} |
                                {fullPhoneNumber && fullPhoneNumber}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="px-4">
                          <div className="flex flex-row my-6 justify-between items-center">
                            <small>{t("amount")}</small>
                            <CashLayout
                              cash={parseFloat(
                                paymentButtonType === "instant"
                                  ? amountInEuros
                                  : Number(amountInEuros) - Number(fees)
                              ).toFixed(3)}
                            />
                          </div>

                          <div className="flex flex-row my-6 justify-between">
                            <small>{t("fees")}</small>
                            {fetchingFees ? (
                              <CircularProgress size={14} />
                            ) : (
                              <small>
                                <CashLayout cash={fees} />
                              </small>
                            )}
                          </div>

                          <div
                            className="flex flex-row my-6 justify-between "
                            style={{ color: "rgb(3, 115, 117)" }}
                          >
                            <small>{t("total")}</small>
                            <CashLayout
                              cash={
                                paymentButtonType === "instant"
                                  ? Number(amountInEuros) + Number(fees)
                                  : amountInEuros
                              }
                            />
                          </div>

                          <div className="flex flex-row my-6 justify-between">
                            <small>{t("exchange_rate")}</small>
                            <b className="font-bold">1 EUR = {RATE} CFA</b>
                          </div>

                          <div className="flex flex-row my-6 justify-between">
                            <small>{t("PaymentMode")}</small>
                            <b className="font-bold">{t(paymentMethod)}</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          className="btn rounded-lg  btn-dark px-10"
                        >
                          {t("back")}
                        </button>
                        {processingPayment ? (
                          <button
                            disabled
                            className="btn rounded-lg px-10 mx-3"
                            style={{ backgroundColor: "rgb(3, 115, 117)" }}
                          >
                            {t("processing")}
                          </button>
                        ) : (
                          <button
                            className="btn rounded-lg px-10 mx-3"
                            style={{ backgroundColor: "rgb(3, 115, 117)" }}
                            onClick={submitTransaction}
                            disabled={feesCalculated || errorGot !== ""}
                          >
                            {activeStep === steps.length - 1 ? (
                              <span className="text-white capitalize">
                                {t("finish")}
                              </span>
                            ) : (
                              <span className="text-white capitalize">
                                {t("continue")}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-1"></div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ height: 700, width: "100%" }}>
            <div className="bg-white w-full py-3 mb-10">
              {size[0] < 900 && <h3>{steps[2]}</h3>}
            </div>
            <iframe
              src={transfer.transferResult.connect_url}
              width="100%"
              height="100%"
              title="description"
            ></iframe>
          </div>
        );
      case 3:
        return (
          <div className="h-full pt-10">
            {paymentMethod.toLowerCase() === "balance" ? (
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
                            ? parseFloat(amountInEuros).toFixed(2)
                            : parseFloat(amountInEuros) * rate
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
                        ? parseFloat(amountInEuros).toFixed(2)
                        : parseFloat(amountInEuros) * rate}{" "}
                    </b>{" "}
                    à{" "}
                    <b>
                      {transfer.beneficiary && transfer.beneficiary.full_name}{" "}
                    </b>
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
            ) : (
              <div className="row pt-10">
                <div className="col-md-1" />
                <div className="col-md-10  p-4">
                  {selectedBank ? (
                    <div className="shadow-lg p-4">
                      <BankDetails
                        accountDetails={selectedBank}
                        payment_id={response.details.id}
                        amount={`${parseInt(amountInEuros) + fees}`}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-3"></div>
                        <div className="col-md-6 shadow-lg p-10">
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
                            {dana_pay_bank_accounts.map(
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
                        <div className="col-md-3"></div>
                      </div>
                    </>
                  )}
                </div>
                <div className="col-md-1" />
              </div>
            )}
          </div>
        );
      default:
        return "Unknown stepIndex";
    }
  };

  const fetchAppliesFees = () => {
    if (!paymentMethod) {
      return;
    }
    if (!country) {
      return;
    }
    setFeesCalculated(true);
    setFetchingFees(true);

    //get array of cash_in method...
    const selectedCashInMethodArray = getCashInMethod(transfer, paymentMethod);
    if (!selectedCashInMethodArray) {
      return;
    }

    const receivingId = getReceivingCountryID(
      transfer,
      transfer.beneficiary?.country_code
    );
    if (!receivingId) {
      setErrorGot(t("no_receiving_country"));
      setFeesCalculated(false);
      return;
    }

    getAppliedFeesForTransfers(
      {
        euro_amount: amountInEuros,
        sending_country_id: transfer.loggedInUserCountry.id,
        receiving_country_id: receivingId,
        cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
      },
      user?.id
    )
      .then((response: any) => {
        setErrorGot("");
        setFees(0);
        setFees(response.fee);
        setFeesCalculated(false);
        setFetchingFees(false);
      })
      .catch((error) => {
        setFeesCalculated(false);
        setFetchingFees(false);
        const err = extractError(error);
        setErrorGot(translateError(err, t));
      });
  };

  useEffect(() => {
    fetchAppliesFees();
  }, [paymentMethod, amountInEuros]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    setReceivingCountries(getLoggedInUserReceivingCountries(transfer, user));
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className={classes.root}>
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
          <div className="w-full m-auto md:w-1/2 p-10 flex flex-col justify-center "></div>
        ) : (
          <>{getStepContent(activeStep)}</>
        )}
      </div>
    </div>
  );
};

export default MakeTransfer;
