import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Modal from "@material-ui/core/Modal";
import { toast } from "material-react-toastify";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { addContact, getFavorites } from "../store/features/Auth/Auth";
import { extractError } from "../utility";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";
import "../helpers/i18n";
import { saveUserFavorites } from "../store/features/Auth/AuthSlice";
import { getPreferredComChannel } from "../utilities/help";

const Contacts: React.FC<any> = ({ contacts, reloadContacts }) => {
  const {
    transfer,
    auth: { user, favorites },
  } = useAppSelector((state) => state.persistedReducer);
  const dispatch = useAppDispatch();
  const [open, setIsOPen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("fr");
  const [preComChannel, setPreComChannel] = useState(null);
  const { t } = useTranslation();
  const [receivingCountries, setReceivingCountries] = React.useState<any>([]);

  const refreshContacts = () => {
    getFavorites()
      .then((response) => {
        dispatch(saveUserFavorites(response));
      })
      .catch((error) => {});
  };

  useEffect(() => {
    const countries = transfer.danaPayCountries?.find(
      (res: any) => res.name?.toLowerCase() === user?.country?.toLowerCase()
    );
    const ARC =
      countries?.receiving_countries.map((cc: any) =>
        cc.receiving_country?.code?.toLowerCase()
      ) || [];
    setReceivingCountries(ARC);
  }, []);

  return (
    <>
      <div className="py-3 flex flex-row overflow-x-scroll rounded-lg">
        <div
          style={{ minHeight: 100, width: 100 }}
          className="flex justify-center items-start flex-col cursor-pointer"
          onClick={() => setIsOPen(!open)}
        >
          <div
            style={{ height: 55, width: 55, borderRadius: 50 }}
            className="bg-gray-200 flex justify-center items-center"
          >
            <i className="fa fa-plus font-bold m-0 text-3xl text-gray-700" />
          </div>
          <small
            className="text-center font-SemiBold"
            style={{ fontSize: 11, marginTop: 5, textTransform: "uppercase" }}
          >
            {t("add_user")}
          </small>
        </div>

        {favorites
          ?.filter((user: any) => user?.favorite.full_name !== " ")
          .map((contact: any, index: number) => (
            <div
              key={index}
              style={{ minHeight: 90, width: 90 }}
              className="flex justify-center items-center flex-col px-3 cursor-pointer"
            >
              <Avatar
                name={contact?.favorite?.full_name}
                size="55"
                round
                textSizeRatio={3}
              />
              <small
                className="text-center font-SemiBold capitalize"
                style={{ fontSize: 11, marginTop: 5 }}
              >
                {contact?.favorite.first_name?.toUpperCase()}
              </small>
            </div>
          ))}
      </div>
      <Modal open={open} onClose={() => setIsOPen(!open)}>
        <div className="row m-auto">
          <div className="col-md-4"></div>
          <div className="col-md-4 mt-20">
            <div className="bg-white p-3 rounded-md py-4">
              <div className="flex flex-row items-center justify-between border-b mb-3">
                <div>
                  <b>{t("Add_Contact")}</b>
                </div>
                <button
                  type="button"
                  className="btn  btn-light shadow-sm"
                  onClick={() => setIsOPen(!open)}
                >
                  {t("close")}
                </button>
              </div>
              <Formik
                initialValues={{
                  first_name: "",
                  last_name: "",
                  email: "",
                }}
                onSubmit={async (data, { setSubmitting }) => {
                  setAdding(true);
                  const newContact: {
                    first_name: string;
                    last_name: string;
                    email?: string;
                    phone_number: string;
                    country_code: any;
                  } = {
                    ...data,
                    phone_number: phone
                      .slice(country.length)
                      .replaceAll(" ", ""),
                    country_code: country,
                  };

                  if (!data.email) {
                    delete newContact.email;
                  }

                  setSubmitting(true);
                  addContact(newContact)
                    .then((res: any) => {
                      setAdding(false);

                      toast.success(t("contact_added"));
                      refreshContacts();
                      setIsOPen(false);
                      setSubmitting(false);
                    })
                    .catch((error: any) => {
                      setSubmitting(false);
                      setAdding(false);

                      toast.error(extractError(error));
                    });
                }}
                validationSchema={yup.object().shape({
                  last_name: yup.string().required("LNR"),
                  first_name: yup.string().required("FNR"),
                  email:
                    preComChannel === "mail"
                      ? yup.string().required("ERQ").email("email_not_valid")
                      : yup.string(),
                })}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <Form>
                    <div className="mb-4">
                      <label className="form-label">{t("FirstName")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.first_name && touched.first_name && (
                        <div className="text-red-700">
                          <small>{t(errors.first_name)}</small>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">{t("LastName")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="last_name"
                        value={values.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.last_name && touched.last_name && (
                        <div className="text-red-700">
                          <small>{t(errors.last_name)}</small>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">{t("Phone_Number")}</label>
                      <div className="mb-6">
                        {receivingCountries.length > 0 ? (
                          <>
                            <PhoneInput
                              country={receivingCountries[0]}
                              value={phone}
                              onChange={(pho: string, cou: any) => {
                                setPhone(pho);
                                setCountry(cou["dialCode"]);
                                setPreComChannel(
                                  getPreferredComChannel(
                                    transfer.danaPayCountries,
                                    cou["dialCode"]
                                  )
                                );
                              }}
                              inputClass="PhoneInput"
                              onlyCountries={receivingCountries}
                              countryCodeEditable={false}
                              masks={{ ci: ".. .. .. .. .." }}
                            />

                            {phone.length <= 7 && (
                              <small className="text-red-600">
                                {t("validPhone")}
                              </small>
                            )}
                          </>
                        ) : (
                          <div className="bg-red-100 p-3 text-center">
                            <small className="text-red-500">
                              {t("try_refresh")}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        {t("Email_Address")}{" "}
                        {preComChannel !== "mail" && (
                          <span>[{t("optional")}]</span>
                        )}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.email && touched.email && (
                        <div className="text-red-700">
                          <small>{t(errors.email)}</small>
                        </div>
                      )}
                    </div>

                    {adding ? (
                      <button
                        className="btn rounded-lg rounded-lg  rounded-lg-primary w-full bg-gray-700"
                        type="submit"
                        disabled={true}
                      >
                        <small className="text-white font-bold">
                          Please waiting...
                        </small>
                      </button>
                    ) : (
                      <button
                        className="btn rounded-lg rounded-lg  rounded-lg-primary w-full"
                        style={{ backgroundColor: "rgb(3, 115, 117)" }}
                        type="submit"
                      >
                        <small className="text-white font-bold">
                          {t("Add_Contact")}
                        </small>
                      </button>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
          <div className="col-md-4"></div>
        </div>
      </Modal>
    </>
  );
};

export default Contacts;
