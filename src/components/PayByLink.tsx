import React, { useState, useEffect } from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  fetchBeneficiary,
  getAppliedFeesForTransfers,
  initTransfer,
} from "../store/features/Transfer/Transfer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import CashLayout from "./CashLayout";
import { CircularProgress } from "@material-ui/core";
import SelectField from "./forms/SelectField";
import { addContact, editContact } from "../store/features/Auth/Auth";
import { toast } from "material-react-toastify";
import { extractError } from "../utility";
import BeneficiaryCard from "./BeneficiaryCard/BeneficiaryCard";
import {
  addBeneficiary,
  addTransferCountry,
} from "../store/features/Transfer/TransferSlice";
import InputField from "./forms/InputField";

const RATE = 655.957;

const PayByLink: React.FC<any> = ({ closePayByLInk, t }) => {
  const {
    transfer: { danaPayCountries, transferCountry },
    auth: { user, lang },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [receivingCountries, setReceivingCountries] = useState([]);
  const [phone, setPhone] = useState<any>(null);
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [countryObject, setCountryObject] = useState<any>(null);
  const [amountEuro, setAmountEuro] = useState(0);
  const [amountCfa, setAmountCfa] = useState(0);
  const [payMethod, setPayMethod] = useState("");
  const [reason, setReason] = useState("");
  const [errorGot, setErrorGot] = React.useState("");
  const [fees, setFees] = useState(0);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [fetchingFees, setFetchingFees] = React.useState(false);
  const [feesCalculated, setFeesCalculated] = React.useState<boolean>(false);
  const [userExists, setUseExists] = React.useState<boolean>(true);
  const [userObject, setUseObject] = React.useState<any>({});

  const [steps, setSteps] = useState([
    t("Beneficiaries"),
    t("Amount"),
    t("Confirmation"),
  ]);

  const calculateFees = () => {
    if (!payMethod) {
      setFeesCalculated(false);
      return;
    }
    setFees(0);
    setErrorGot("");
    setFeesCalculated(true);
    setFetchingFees(true);

    if (!beneficiary) {
      setFeesCalculated(false);
      return;
    }

    const selectedCashInMethodArray = transferCountry.cash_in_methods.find(
      (value: any) =>
        value.cash_in_method.name.toLowerCase() === payMethod.toLowerCase()
    );

    // get the beneficiary sending country...

    const receiving = transferCountry.receiving_countries.find(
      (value: any) =>
        value.receiving_country.country_code === countryObject["dialCode"]
    );

    if (!receiving) {
      setFeesCalculated(false);
      return;
    }

    getAppliedFeesForTransfers(
      {
        euro_amount: amountEuro,
        sending_country_id: receiving.receiving_country.id,
        receiving_country_id: transferCountry.id,
        cashin_method_id: selectedCashInMethodArray.cash_in_method.id,
      },
      beneficiary.id
    )
      .then((response: any) => {
        setFees(response.fee);
        setFeesCalculated(false);
        setFetchingFees(false);
        setErrorGot("");
      })
      .catch((error) => {
        setFeesCalculated(false);
        const err = extractError(error);
        setErrorGot(err);
        setFetchingFees(false);
      });
  };

  const fetchBeneficiary = () => {
    const selectedPhone = `+${countryObject["dialCode"]}${phone}`;
    if (selectedPhone === user?.full_phone_number) {
      toast.error(t("cantSendToSelf"));
      return;
    }
    addContact({
      country_code: countryObject["dialCode"],
      phone_number: phone.replace(countryObject["dialCode"], ""),
    })
      .then((result: any) => {
        if (result.beneficiary.email === null) {
          setUseExists(false);
        }
        setBeneficiary(result.beneficiary);
        dispatch(addTransferCountry(result.transferCountry));
      })
      .catch((error) => {
        toast.error(extractError(error));
      });
  };

  const submitRequest = () => {
    const receiving = transferCountry.receiving_countries.find(
      (value: any) =>
        value.receiving_country.country_code === countryObject["dialCode"]
    );

    if (!receiving) return;
    const payload = {
      cashin_method_id: 1,
      amount_without_fees_in_euro: amountEuro,
      payment_delivery: false,
      country_code: countryObject["dialCode"],
      phone_number: phone.replace(countryObject["dialCode"], ""),
      sending_country_id: receiving.receiving_country.id,
      receiving_country_id: transferCountry.id,
      is_escrowed: false,
      is_payment_on_demand: true,
    };
    initTransfer(payload)
      .then((response) => {
        setActiveStep((prev) => prev + 1);
      })
      .catch((error) => {});
  };

  const renderForms = () => {
    if (activeStep === 0) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-md-4"></div>
            <div className="col-md-4 shadow-lg rounded-lg mt-20 p-4 ">
              <h3 className="text-2xl font-bold my-3 text-center">
                {t("beneficiary")}
              </h3>
              <p className="text-center">{t("enterPhoneNumber")}</p>
              <br />
              <div className="mb-3">
                {receivingCountries.length > 0 ? (
                  <PhoneInput
                    country={receivingCountries[0]}
                    value={phone}
                    onChange={(pho: string, cou: any) => {
                      setPhone(pho);
                      setCountryObject(cou);
                    }}
                    inputClass="PhoneInput"
                    onlyCountries={receivingCountries}
                    masks={{ ci: ".. .. .. .. .." }}
                  />
                ) : (
                  <div>
                    {user?.country} {t("not_config")}
                  </div>
                )}
              </div>
              {beneficiary === null ? (
                <>
                  {receivingCountries.length > 0 && (
                    <button
                      onClick={fetchBeneficiary}
                      className="btn rounded-lg my-2 px-10"
                      style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      disabled={phone === null}
                    >
                      <small className="text-white">{t("continue")}</small>
                    </button>
                  )}
                </>
              ) : (
                <div>
                  {!userExists ? (
                    <div className="border-1 p-4">
                      <p className="py-2">{t("beneInfo")}</p>

                      <div className="form-group mb-3">
                        <small>{t("FirstName")}</small>
                        <input
                          type="text"
                          className="form-control"
                          id="formGroupExampleInput"
                          onChange={(event) =>
                            setUseObject((prev: any) => {
                              return {
                                ...prev,
                                first_name: event.target.value,
                              };
                            })
                          }
                        />
                      </div>
                      <div className="form-group mb-3">
                        <small>{t("LastName")}</small>
                        <input
                          type="text"
                          className="form-control"
                          id="formGroupExampleInput2"
                          onChange={(event) =>
                            setUseObject((prev: any) => {
                              return {
                                ...prev,
                                last_name: event.target.value,
                              };
                            })
                          }
                        />
                      </div>
                      <div className="form-group mb-3">
                        <small>{t("Email_Address")}</small>
                        <input
                          type="text"
                          className="form-control"
                          id="formGroupExampleInput2"
                          onChange={(event) =>
                            setUseObject((prev: any) => {
                              return {
                                ...prev,
                                email: event.target.value,
                              };
                            })
                          }
                        />
                      </div>
                      <button
                        className="btn rounded-lg my-2 px-10 mr-4"
                        style={{ backgroundColor: "#000" }}
                        onClick={() => {
                          setUseExists(true);
                          setBeneficiary(null);
                          setPhone(null);
                        }}
                      >
                        <small className="text-white">Cancel</small>
                      </button>
                      <button
                        onClick={() => {
                          editContact(userObject, beneficiary.id)
                            .then((data: any) => {
                              if (
                                !userObject.first_name ||
                                !userObject.last_name ||
                                !userObject.email
                              ) {
                                dispatch(
                                  addBeneficiary({
                                    full_name: `${userObject.first_name} ${userObject.last_name}`,
                                    client: { type: "customer" },
                                  })
                                );
                                setActiveStep((prev) => prev + 1);
                              } else {
                                toast.error("All fields are required.");
                              }
                            })
                            .catch((error) => {
                              if (
                                error.status === 422 ||
                                error.status === 500
                              ) {
                                const err: any = Object.values(
                                  error.data.errors
                                )[0];
                                toast.error(err[0]);
                              }
                            });
                        }}
                        className="btn rounded-lg my-2 px-10"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      >
                        <small className="text-white">{t("continue")}</small>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <BeneficiaryCard beneficiary={beneficiary} />
                      </div>
                      <button
                        onClick={() => setBeneficiary(null)}
                        className="btn rounded-lg my-2 px-10 mr-10"
                        style={{ backgroundColor: "#000" }}
                      >
                        <small className="text-white">{t("cancel")}</small>
                      </button>
                      <button
                        onClick={() => setActiveStep((prev) => prev + 1)}
                        className="btn rounded-lg my-2 px-10"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                      >
                        <small className="text-white">{t("continue")}</small>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      );
    }
    if (activeStep === 1) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-10 p-4">
              <div className="row pt-10 shadow-lg m-4">
                <div className="col-md-6 p-4">
                  <div className="mb-3">
                    <InputField
                      handleChange={(e: any) => setReason(e.target.value)}
                      value={reason}
                      label={t("reason")}
                      type="text"
                      name="reason"
                    />
                  </div>

                  <div className="mb-3">
                    <SelectField
                      value={payMethod}
                      data={transferCountry?.cash_in_methods
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
                      name=""
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
                      name=""
                      error=""
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
                <div className="col-md-6 p-4">
                  <div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("amount")}</p>
                      <b>
                        <CashLayout cash={amountEuro} />
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("fees")}</p>
                      <b>
                        {fetchingFees ? (
                          <CircularProgress size={14} />
                        ) : (
                          <small>
                            <CashLayout cash={fees} />
                          </small>
                        )}
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("total")}</p>
                      <b>
                        <CashLayout cash={amountEuro + fees} />
                      </b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("exchange_rate")}</p>
                      <b>1EUR = {RATE} CFA</b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("PaymentMode")}</p>
                      <b>{payMethod}</b>
                    </div>
                    <div className="flex flex-row justify-between my-4">
                      <p>{t("transaction_type")}</p>
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
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8 text-center flex  flex-col  shadow-md  my-10 py-20 justify-center items-center">
              <h1 className="text-3xl font-bold mb-2">{t("Sent")}!</h1>
              {lang === "en" && (
                <p>
                  Your payment request has been sent to{" "}
                  <b className="capitalize">{beneficiary.full_name}</b>. As soon
                  as he receives your email, he will be able to proceed with the
                  payment.
                </p>
              )}

              {lang === "fr" && (
                <p>
                  Votre demande de paiement a été envoyée à{" "}
                  <b className="capitalize">{beneficiary.full_name}</b>. Dès
                  qu'il aura reçu votre courriel, il pourra procéder au
                  paiement.
                </p>
              )}

              <button
                className="btn rounded-lg my-2 px-10 mr-10"
                style={{ backgroundColor: "rgb(3, 115, 117)" }}
              >
                <small className="text-white">{t("BackHome")}</small>
              </button>
            </div>
            <div className="col-md-2"></div>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    const receiverCountries = danaPayCountries.map((cc: any) => {
      if (cc.code) {
        return cc.code?.toLowerCase();
      }
    });
    setReceivingCountries(receiverCountries);
  }, []);

  useEffect(() => {
    calculateFees();
  }, [amountEuro]);

  return (
    <div>
      <div
        className="shadow-md"
        style={{ backgroundColor: "rgb(3, 115, 117)" }}
      >
        <div className="container flex flex-row justify-between items-center py-4 text-white">
          <p className="font-bold">{t("Pay_By_Link")}</p>
          <button onClick={() => closePayByLInk()}>
            <small className="font-bold">{t("close")}</small>
          </button>
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

        {activeStep === steps.length ? (
          <div className="w-full m-auto md:w-1/2 p-10 flex flex-col justify-center ">
            <p>All steps completed</p>
          </div>
        ) : (
          <div>{renderForms()}</div>
        )}
      </div>
    </div>
  );
};

export default PayByLink;
