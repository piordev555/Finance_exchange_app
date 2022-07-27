import React, { useState, useEffect, useLayoutEffect } from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import InputField from "../../components/forms/InputField";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addCompany,
  addUser,
  editCompany,
  fetchUserData,
  getCountryData,
} from "../../store/features/Auth/Auth";
import { Alert } from "@material-ui/lab";
import {
  editUser,
  addCompanyToState,
  resetAuth,
} from "../../store/features/Auth/AuthSlice";
import { useHistory } from "react-router";
import { extractErrorMessage } from "../../helpers";
import FileUploadComp from "../../components/FileUploadComp";
import {
  resetTransfer,
  updateCountries,
} from "../../store/features/Transfer/TransferSlice";
import { resetDeveloper } from "../../store/features/Developer/DeveloperSlice";
import { useTranslation } from "react-i18next";
import "../../helpers/i18n";
import LangSwitch from "../../components/LangSwitch";
import {
  getTransferCountries,
  getDanaPayCountries,
} from "../../store/features/Transfer/Transfer";
import SumSub from "../../components/Sumsub";

const validationSchema = Yup.object().shape({
  lastname: Yup.string().required("LNR"),
  firstname: Yup.string().required("FNR"),
});

const formSchema = Yup.object().shape({
  registration_id: Yup.string().required("RNE"),
  company_name: Yup.string().required("CNE"),
  address_information: Yup.string().required("AIE"),
  country: Yup.string().required("CE"),
  city: Yup.string().required("CIE"),
});

const styles = {
  header: {
    height: 70,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  main: {
    height: "100vh",
  },
  footer: {
    height: 70,
    display: "flex",
    alignItems: "center",
    padding: 20,
  },
  footerSpan: {
    fontSize: 13,
    marginRight: 20,
    fontWeight: 700,
    color: "#666",
  },
  body: {
    height: "calc(100vh - 150px)",
    width: "100%",
    margin: "auto",
    backgroundColor: "#fff",
  },
  brand: {
    display: "flex",
    flexDirection: "row",
  },
};

const SignUp = () => {
  const { t } = useTranslation();
  const {
    auth: { user, lang },
    transfer: { transferFromType },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [steps, getSteps] = useState<any>([
    "Personal_Information",
    "Company_Information",
    "Documents",
    "Verify_User",
  ]);
  const [errorsState, setErrorsState] = useState<any>([]);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState<any>(null);
  const [countryName, setCountryName] = useState("");
  const [receivingCountries, setReceivingCountries] = React.useState<any>([]);
  const history = useHistory();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const fetchImportantData = async () => {
    const [transferCountries, allCountries]: any = await Promise.all([
      getTransferCountries(),
      getDanaPayCountries(),
    ]);
    dispatch(updateCountries([transferCountries.data, allCountries]));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const finish = () => {
    if (transferFromType === "internal") {
      history.push("dashboard/home");
    } else {
      history.push("/complete_form");
    }
  };

  const updateUserOnLocal = () => {
    fetchUserData()
      .then((response) => {
        console.log("Response => ", response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const showError = (error: object) => {
    const err = extractErrorMessage(error);
    if (err) {
      const errorArray = err.map((errorText: string) =>
        errorText.toLowerCase().trim().replaceAll(".", "").replaceAll(" ", "_")
      );
      setErrorsState((prevState: any[]) => [...prevState, ...errorArray]);
    }
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="bg-white flex justify-center items-center py-4">
            <div className="lg:w-2/5 md:w-1/2 w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-lg min-w-full">
                <h2 className="text-1xl font-bold my-6 text-center">
                  {t("enterPerson")}
                </h2>
                <Formik
                  key="form1"
                  initialValues={{
                    lastname: user?.last_name ? user?.last_name : "",
                    firstname: user?.first_name ? user?.first_name : "",
                    userType: user?.is_individual ? "individual" : "business",
                  }}
                  onSubmit={(data, { setSubmitting }) => {
                    setErrorsState([]);
                    // setSubmitting(true);
                    const json = {
                      email: user?.email,
                      phone_number: phone
                        ?.slice(country.length)
                        .replaceAll(" ", ""),
                      country_code: country,
                      first_name: data.firstname,
                      last_name: data.lastname,
                    };
                    // if (phone.match(regexp)) {
                    addUser(json, data.userType)
                      .then((result: any) => {
                        setSubmitting(false);
                        if (result["user"]) {
                          updateUserOnLocal();
                          dispatch(editUser(result["user"]));
                          if (data.userType.toLowerCase() !== "individual") {
                            handleNext();
                          } else {
                            setActiveStep(3);
                          }
                        } else {
                        }
                      })
                      .catch((error) => {
                        setSubmitting(false);
                        showError(error);
                      });

                    // }
                  }}
                  validationSchema={validationSchema}
                >
                  {({
                    values,
                    handleChange,
                    handleBlur,
                    errors,
                    isSubmitting,
                    touched,
                  }) => (
                    <Form>
                      <div className="flex-1 mb-3">
                        <small className="text-gray-700">
                          {t("Account_Type")}
                        </small>
                        <select
                          name="userType"
                          value={values.userType}
                          onChange={(e) => {
                            handleChange(e);
                            setSelectedUserType(e.target.value);
                          }}
                          className="w-full py-1 bg-white border-b border-b-slate-400"
                        >
                          <option value="" className="text-black"></option>
                          <option value="individual">{t("Individual")}</option>
                          <option value="business">{t("Business")}</option>
                        </select>
                        {errors.userType && touched.userType && (
                          <small className="text-red-500">
                            {t(`${errors.userType}`)}
                          </small>
                        )}
                      </div>

                      <InputField
                        name="lastname"
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lastname}
                        label={t("LastName")}
                        error={t(`${errors.lastname}`)}
                        touched={touched.lastname}
                      />

                      <InputField
                        name="firstname"
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        value={values.firstname}
                        label={t("FirstName")}
                        error={t(`${errors.firstname}`)}
                        touched={touched.firstname}
                      />

                      <div className="mt-6 mb-6">
                        <small>
                          {t("is_number")} <b>+{phone.replaceAll("+", "")}</b>
                        </small>
                        <br />
                        {receivingCountries.length > 0 && (
                          <PhoneInput
                            country={
                              countryCode !== null
                                ? countryCode.code.toLowerCase()
                                : receivingCountries[0]
                            }
                            value={`${phone}`}
                            onChange={(pho: string, cou: any) => {
                              setPhone(pho);
                              setCountry(cou["dialCode"]);
                              setCountryName(cou.name);
                            }}
                            inputClass="PhoneInput"
                            onlyCountries={receivingCountries}
                            countryCodeEditable={false}
                            masks={{ ci: ".. .. .. .. .." }}
                          />
                        )}
                      </div>

                      <div>
                        {errorsState.length > 0 && (
                          <div className="mb-4">
                            <Alert severity="error">
                              {errorsState.map(
                                (errorText: string, index: number) => (
                                  <p>
                                    <small key={index}>
                                      {t(
                                        errorText
                                          .toLowerCase()
                                          .trim()
                                          .replaceAll(".", "")
                                          .replaceAll(" ", "_")
                                      )}
                                    </small>
                                  </p>
                                )
                              )}
                            </Alert>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center items-center">
                        <button
                          className="btn rounded-lg rounded-lg  rounded-lg-primary w-full"
                          style={{ backgroundColor: "rgb(3, 115, 117)" }}
                          type="submit"
                          disabled={isSubmitting}
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
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-2/5 md:w-1/2 w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-lg min-w-full">
                <h2 className="text-1xl font-bold my-3 text-center">
                  {t("coInfo")}
                </h2>
                <Formik
                  key="form2"
                  initialValues={{
                    registration_id: user?.company?.registered_id
                      ? user?.company?.registered_id
                      : "",
                    company_name: user?.company?.name
                      ? user?.company?.name
                      : "",
                    address_information: user?.company?.address
                      ? user?.company?.address
                      : "",
                    country: countryName,
                    city: user?.company?.city ? user?.company?.city : "",
                  }}
                  onSubmit={(data, { setSubmitting }) => {
                    setSubmitting(true);
                    setErrorsState([]);
                    const companyData = {
                      name: data.company_name,
                      location: data.address_information,
                      registered_id: data.registration_id,
                      city: data.city,
                      quarter: data.address_information,
                      address: data.address_information,
                      country_code: country,
                    };

                    if (user?.company !== null) {
                      //edit the company instead...
                      console.log("hasCompany", user?.company);
                      editCompany(companyData, user?.company.id)
                        .then((res: any) => {
                          setSubmitting(false);
                          updateUserOnLocal();
                          dispatch(addCompanyToState(res.company));
                          handleNext();
                        })
                        .catch((error) => {
                          setSubmitting(false);
                          const err = extractErrorMessage(error);
                          if (err) {
                            setErrorsState((prevState: any[]) => [
                              ...prevState,
                              ...err,
                            ]);
                          }
                        });
                    } else {
                      console.log("has no Company", user?.company);

                      addCompany(companyData)
                        .then((res: any) => {
                          setSubmitting(false);
                          updateUserOnLocal();
                          dispatch(addCompanyToState(res.company));
                          handleNext();
                        })
                        .catch((error) => {
                          setSubmitting(false);
                          const err = extractErrorMessage(error);
                          if (err) {
                            setErrorsState((prevState: any[]) => [
                              ...prevState,
                              ...err,
                            ]);
                          }
                        });
                    }
                  }}
                  validationSchema={formSchema}
                >
                  {({
                    values,
                    handleChange,
                    handleBlur,
                    errors,
                    isSubmitting,
                    touched,
                  }) => (
                    <Form>
                      <InputField
                        name="registration_id"
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        value={values.registration_id}
                        label={t("RegistrationID")}
                        error={t(`${errors.registration_id}`)}
                        touched={touched.registration_id}
                      />

                      <InputField
                        name="company_name"
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        value={values.company_name}
                        label={t("CompanyName")}
                        error={t(`${errors.company_name}`)}
                        touched={touched.company_name}
                      />

                      <InputField
                        name="address_information"
                        handleChange={handleChange}
                        onBlur={handleBlur}
                        value={values.address_information}
                        label={t("AddressInformation")}
                        error={t(`${errors.address_information}`)}
                        touched={touched.address_information}
                      />

                      <div className="flex">
                        <div className="flex-1 mr-4">
                          <small className="text-gray-700">
                            {t("Country")}
                          </small>
                          <select
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full py-1 bg-white border-b border-b-slate-400"
                          >
                            <option value={countryName}>{countryName}</option>
                            {/* {countries.map((pays: any) => (
                              <option value={pays.name}>{pays.name}</option>
                            ))} */}
                          </select>
                          {errors.country && touched.country && (
                            <small className="text-red-500">
                              {t(`${errors.country}`)}
                            </small>
                          )}
                        </div>
                        <div className="flex-1 ml-4">
                          <InputField
                            name="city"
                            handleChange={handleChange}
                            onBlur={handleBlur}
                            value={values.city}
                            label={t("City")}
                            error={t(`${errors.city}`)}
                            touched={touched.city}
                          />
                        </div>
                      </div>

                      <div>
                        {errorsState.length > 0 && (
                          <div className="mb-4">
                            <Alert severity="error">
                              {errorsState.join(" ,")}
                            </Alert>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          marginTop: 30,
                        }}
                      >
                        <button
                          className="px-12 btn rounded-lg mr-4"
                          style={{ backgroundColor: "#666" }}
                          disabled={activeStep === 0}
                          onClick={handleBack}
                        >
                          <span className="text-white capitalize">
                            {t("back")}
                          </span>
                        </button>

                        <button
                          className="px-12 btn rounded-lg"
                          style={{ backgroundColor: "rgb(3, 115, 117)" }}
                          disabled={isSubmitting}
                          type="submit"
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
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white flex justify-center items-center py-10">
            <div className="lg:w-4/5 md:w-1/2 w-2/3">
              <div className="bg-white rounded-lg shadow-lg w-full p-4">
                <h2 className="text-1xl font-bold my-3 text-center">
                  {t("docsTitle")}
                </h2>
                <p className="text-center">{t("docsReason")}</p>
                <FileUploadComp company_id={user?.company?.id} t={t} />
                <br />
                <br />
                <button
                  className="px-12 btn rounded-lg mr-4"
                  style={{ backgroundColor: "#666" }}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  <span className="text-white">{t("back")}</span>
                </button>
                <button
                  className="px-12 btn rounded-lg"
                  style={{ backgroundColor: "rgb(3, 115, 117)" }}
                  onClick={() => finish()}
                >
                  <span className="text-white">{t("finish")}</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="container text-center mt-20 shadow-lg p-4">
            <SumSub phone={phone} finish={finish} />
          </div>
        );
      default:
        return "Unknown stepIndex";
    }
  };

  const handleLogout = () => {
    dispatch(resetAuth());
    dispatch(resetTransfer());
    dispatch(resetDeveloper());
    history.push("/login");
  };

  useEffect(() => {
    if (
      user?.client?.type.toLowerCase() === "temporary-customer" ||
      !user?.client
    ) {
      setActiveStep(0);
    }
    //check user country to set the country for the company/ if you remove this if statement, the country input will be empty
    if (user) {
      setCountryName(user?.country?.toLowerCase());
    }
  }, []);

  useEffect(() => {
    fetchImportantData();
    navigator.geolocation.getCurrentPosition((position: any) => {
      getCountryData("a68a25776d8d3d0d1db334f72d190c08f64055b50b2124edc9d313a3")
        .then((res: any) => {
          setCountry(res?.country_code.toLowerCase());
        })
        .catch((error) => {});
    });
    getTransferCountries().then((response: any) => {
      console.log(response);
      setReceivingCountries(
        response?.data.map((cc: any) => {
          if (cc.code) {
            return cc?.code?.toLowerCase();
          }
        })
      );
      const count = response?.data.find(
        (ccc: any) => ccc?.name?.toLowerCase() === user?.country?.toLowerCase()
      );
      if (count) {
        setCountryCode(count);
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (user) {
      setPhone(user?.full_phone_number.replaceAll("+", ""));
      setCountry(user?.country_code);
    }
  }, []);

  return (
    <main style={styles.main}>
      <div
        className="flex flex-row items-center justify-between mb-3 px-4 shadow-md"
        style={{
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <div className="p-2">
          <img src="images/logofull.png" style={{ height: 20 }} />
        </div>
        <div>
          <LangSwitch />
          <button className="btn py-2 px-3 mx-4" onClick={handleLogout}>
            <i
              className="fa fa-sign-out text-green-600 text-3xl"
              style={{ fontSize: 23 }}
            />
          </button>
        </div>
      </div>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label: string) => (
          <Step key={label}>
            <StepLabel>{t(label)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div className="h-full flex justify-center flex-col">
            <h1 className="text-3xl font-bold mb-4 text-center">Thank You!</h1>
            <p className="text-sm  ml-4 text-center">
              We will process your application and <br /> you will receive a
              confirmation email within 24 hours.
            </p>
          </div>
        ) : (
          <div>{getStepContent(activeStep)}</div>
        )}
      </div>
    </main>
  );
};

export default SignUp;
