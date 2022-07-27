import React, { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import NotActiveComp from "../../components/NotActiveComp";
import "../../helpers/i18n";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { Formik, Form } from "formik";
import { toast } from "material-react-toastify";
import * as yup from "yup";
import { addUser } from "../../store/features/Auth/Auth";
import InputField from "../../components/forms/InputField";
import PhoneInput from "react-phone-input-2";
import { Alert } from "@material-ui/lab";
import { currentBalance } from "../../store/features/Transfer/Transfer";
import { editUser, updateBalance } from "../../store/features/Auth/AuthSlice";
import Accounts from "../../components/Accounts";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Profile = () => {
  const { t } = useTranslation();
  const { user, bank_accounts, mobile_accounts, selected_account } =
    useAppSelector((state) => state.persistedReducer.auth);
  const [size, setSize] = useState([0, 0]);
  const [errorsState, setErrorsState] = useState<any>([]);
  const [errorMessage, showErrorMessage] = useState<string[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [open, setOpen] = useState<any>(null);
  const [receivingCountries, setReceivingCountries] = useState<any>([]);
  const [phone, setPhone] = useState(() => {
    if (user?.full_phone_number) {
      return user?.full_phone_number;
    } else {
      return "";
    }
  });

  const [country, setCountry] = useState(() => {
    if (user?.country_code) {
      return user?.country_code;
    } else {
      return "";
    }
  });

  const dispatch = useAppDispatch();

  const fetchUser = () => {
    currentBalance()
      .then((response: any) => {
        dispatch(updateBalance(response.client.euro_balance));
        dispatch(editUser(response));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="py-2">
      <NotActiveComp
        t={t}
        setWithDrawOpen={null}
        startBulkPayments={null}
        startTransfer={null}
        size={size}
      />
      <br />

      <div className="row px-4">
        <div className="col-md-5">
          <p>{t("profile")}</p>
          <br />
          <Formik
            key="form"
            initialValues={{
              email: user?.email,
              firstname: user?.first_name,
              lastname: user?.last_name,
              userType: user?.is_individual ? "individual" : "business",
            }}
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              const json = {
                email: user?.email,
                phone_number: phone.slice(country.length).replaceAll(" ", ""),
                country_code: country,
                first_name: data.firstname,
                last_name: data.lastname,
              };
              addUser(json, data.userType)
                .then((result: any) => {
                  setSubmitting(false);
                  toast.success(t("Successfully updated"));
                  fetchUser();
                })
                .catch((error) => {
                  setSubmitting(false);
                });
            }}
            validationSchema={yup.object().shape({
              lastname: yup.string().required("LNR"),
              firstname: yup.string().required("FNR"),
              email: yup.string().required(""),
            })}
          >
            {({
              values,
              handleChange,
              handleBlur,
              errors,
              touched,
              isSubmitting,
            }) => (
              <Form>
                <InputField
                  name="firstname"
                  handleChange={handleChange}
                  onBlur={handleBlur}
                  value={values.firstname}
                  label={t("FirstName")}
                  error={t(`${errors.firstname}`)}
                  touched={touched.firstname}
                  disabled={user?.is_active || user?.is_verified ? true : false}
                />

                <InputField
                  name="lastname"
                  handleChange={handleChange}
                  onBlur={handleBlur}
                  label={t("LastName")}
                  value={values.lastname}
                  error={t(`${errors.lastname}`)}
                  touched={touched.lastname}
                  disabled={user?.is_active || user?.is_verified ? true : false}
                />

                <InputField
                  name="email"
                  handleChange={handleChange}
                  onBlur={handleBlur}
                  label={t("email")}
                  value={values.email}
                  error={t(`${errors.email}`)}
                  touched={touched.email}
                  disabled={user?.is_active || user?.is_verified ? true : false}
                />

                <div className="mt-6 mb-6">
                  {receivingCountries.length > 0 && (
                    <PhoneInput
                      country={country}
                      value={phone}
                      onChange={(pho: string, cou: any, e) => {
                        setPhone(pho);
                        setCountry(cou["dialCode"]);
                      }}
                      inputClass="PhoneInput"
                      onlyCountries={receivingCountries}
                      countryCodeEditable={false}
                      disabled={
                        user?.is_active || user?.is_verified ? true : false
                      }
                      disableDropdown
                    />
                  )}
                </div>

                <div>
                  {errorsState.length > 0 && (
                    <div className="mb-4">
                      <Alert severity="error">
                        {errorsState.map((errorText: string, index: number) => (
                          <p>
                            <small key={index}>
                              {errorText
                                .toLocaleUpperCase()
                                .replaceAll("_", " ")}
                            </small>
                          </p>
                        ))}
                      </Alert>
                    </div>
                  )}
                </div>

                <div className="flex flex-row justify-between mt-10 items-center">
                  <button
                    type="submit"
                    disabled={
                      user?.is_active || user?.is_verified ? true : false
                    }
                    className={`btn rounded-lg w-full`}
                    style={{
                      backgroundColor: user?.is_active
                        ? "#444"
                        : "rgb(3, 115, 117)",
                    }}
                  >
                    <span className="text-white capitalize">{t("update")}</span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="col-md-2 my-10" />
        <div className="col-md-5">
          <p>{t("manage_accounts")}</p>
          <br />
          <button
            className="border-b-2 w-full h-14 d-flex items-center justify-between"
            onClick={() => setOpen("mobile")}
          >
            <i
              className={`fa fa-mobile-phone text-4xl`}
              style={{ fontSize: 23 }}
            ></i>
            <b>{t("mobile_money_accounts")}</b>
          </button>

          <button
            className="border-b-2 w-full h-14 d-flex items-center justify-between mt-3"
            onClick={() => setOpen("bank")}
          >
            <i className={`fa fa-bank text-4xl`} style={{ fontSize: 23 }}></i>
            <b>{t("bank_accounts")}</b>
          </button>
        </div>
      </div>
      <Dialog
        fullScreen
        open={open === null ? false : true}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
      >
        {open === "bank" ? (
          <>
            <div className="flex flex-row justify-between items-center p-3 mb-20">
              <h2></h2>
              <button
                onClick={() => setOpen(null)}
                style={{ height: 50, width: 50, borderRadius: 25 }}
                className="shadow-lg flex justify-center items-center"
              >
                <i className="fa fa-close m-0"></i>
              </button>
            </div>
            <Accounts type="bank" selected_account={selected_account} />
          </>
        ) : (
          <>
            <div className="flex flex-row justify-between items-center p-3  mb-20">
              <h2></h2>
              <button
                onClick={() => setOpen(null)}
                style={{ height: 50, width: 50, borderRadius: 25 }}
                className="shadow-lg flex justify-center items-center"
              >
                <i className="fa fa-close m-0"></i>
              </button>
            </div>
            <Accounts type="mobile" selected_account={selected_account} />
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Profile;
