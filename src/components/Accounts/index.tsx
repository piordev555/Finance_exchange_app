import React from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import IndividualAccount from "./IndividualAccount";
import Modal from "@material-ui/core/Modal";
import { Formik } from "formik";
// import * as yup from "yup";
import FormComp from "./form";
import { useTranslation } from "react-i18next";
import { toast } from "material-react-toastify";
import {
  addUserBankAccount,
  updateUserBankAccount,
  fetchUserBankAccounts,
  addMMAccount,
  updateUserMMAccount,
  fetchMMAccounts,
} from "../../store/features/Auth/Auth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setAccounts,
  setMMAccounts,
} from "../../store/features/Auth/AuthSlice";
import { extractErrorMessage } from "../../helpers";
import yup from "@raisin/yup-validations";
import { ContactlessOutlined } from "@material-ui/icons";

type Props = {
  selected_account: any;
  type?: string;
  show?: any;
};

const responsive = {
  768: { items: 1 },
  1024: { items: 2 },
};

const Accounts = ({ selected_account, type = "bank", show }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { bank_accounts, mobile_accounts } = useAppSelector(
    (state) => state.persistedReducer.auth
  );

  const [index, setIndex] = React.useState(0);
  const [editModalOpen, setEditModalOpen] = React.useState<boolean>(false);
  const [addFormOpen, setAddFormOpen] = React.useState<boolean>(false);

  const fetchBankAccount = () => {
    fetchUserBankAccounts()
      .then((response: any) => {
        dispatch(setAccounts(response.data));
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const fetchMMAccount = () => {
    fetchMMAccounts()
      .then((response: any) => {
        dispatch(setMMAccounts(response.data));
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  return (
    <>
      <div className="mx-4">
        <div className="flex flex-row justify-between items-center mx-10">
          {type === "bank" ? (
            <p style={{ color: "rgb(3, 115, 117)" }} className="font-bold">
              {bank_accounts?.length} {t("bank_accounts")}
            </p>
          ) : (
            <p style={{ color: "rgb(3, 115, 117)" }} className="font-bold">
              {mobile_accounts?.length} {t("mobile_money_accounts")}
            </p>
          )}
          <button
            className="btn btn-md"
            style={{ backgroundColor: "rgb(3, 115, 117)", color: "#fff" }}
            onClick={() => setAddFormOpen(true)}
          >
            {type === "bank" ? (
              <small>{t("Add_bank_account")}</small>
            ) : (
              <small>{t("Add_Mobile_account")}</small>
            )}
          </button>
        </div>
        <div className="bg-white p-3 flex flex-row overflow-x-scroll">
          {type === "bank" ? (
            <>
              {bank_accounts?.length !== 0 && (
                <AliceCarousel
                  activeIndex={index}
                  mouseTracking
                  responsive={responsive}
                  controlsStrategy="alternate"
                  disableDotsControls
                  renderPrevButton={() => {
                    return (
                      <div className="p-2 absolute -bottom-3 right-12 rounded-md border-1 cursor-pointer">
                        <i className="fa fa-arrow-left m-0"></i>
                      </div>
                    );
                  }}
                  renderNextButton={() => {
                    return (
                      <div className="p-2 absolute right-0 -bottom-3 rounded-md border-1 cursor-pointer">
                        <i className="fa fa-arrow-right m-0"></i>
                      </div>
                    );
                  }}
                >
                  {bank_accounts?.map((value: any, id: any) => {
                    return (
                      <IndividualAccount
                        account={value}
                        setEditModalOpen={setEditModalOpen}
                        type={type}
                      />
                    );
                  })}
                </AliceCarousel>
              )}
            </>
          ) : (
            <>
              {mobile_accounts?.length !== 0 && (
                <AliceCarousel
                  activeIndex={index}
                  mouseTracking
                  responsive={responsive}
                  controlsStrategy="alternate"
                  disableDotsControls
                  renderPrevButton={() => {
                    return (
                      <div className="p-2 absolute -bottom-3 right-12 rounded-md border-1 cursor-pointer">
                        <i className="fa fa-arrow-left m-0"></i>
                      </div>
                    );
                  }}
                  renderNextButton={() => {
                    return (
                      <div className="p-2 absolute right-0 -bottom-3 rounded-md border-1 cursor-pointer">
                        <i className="fa fa-arrow-right m-0"></i>
                      </div>
                    );
                  }}
                >
                  {mobile_accounts?.map((value: any, id: any) => {
                    return (
                      <IndividualAccount
                        account={value}
                        setEditModalOpen={setEditModalOpen}
                        type={type}
                      />
                    );
                  })}
                </AliceCarousel>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="flex justify-center items-center h-screen">
          <div className="row w-screen">
            <div className="col-md-4"></div>
            <div className="col-md-4 bg-white p-3 rounded">
              <div className="flex flex-row justify-between items-center">
                <h3>{t("Edit_Account")}</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={{ height: 40, width: 40, borderRadius: 20 }}
                  className="shadow-lg flex justify-center items-center"
                >
                  <i className="fa fa-close m-0"></i>
                </button>
              </div>
              <Formik
                initialValues={{
                  title: selected_account?.account.title || "",
                  bank_name: selected_account?.bank_name || "",
                  bic: selected_account?.bic || "",
                  iban: selected_account?.iban || "",
                  owner: selected_account?.account.owner_name || "",
                  phone_number: selected_account?.phone_number || "",
                  operator: selected_account?.operator || "",
                  country: "",
                }}
                onSubmit={(data: any) => {
                  let selected_country = null;
                  if (data.country.length === 0) {
                    selected_country = {
                      name: selected_account.country,
                      country_code: selected_account.country_code,
                    };
                  } else {
                    selected_country = JSON.parse(data.country);
                  }

                  if (type === "bank") {
                    delete data.operator;
                    delete data.phone_number;

                    const account = {
                      title: data.title,
                      country: selected_country.name,
                      iban: data.iban,
                      bic: data.bic,
                      owner_name: data.owner,
                      bank_name: data.bank_name,
                      country_code: selected_country.country_code,
                    };
                    updateUserBankAccount(account, selected_account.id)
                      .then((response: any) => {
                        toast.success(t("Added_successfully"));
                        setEditModalOpen(false);
                        fetchBankAccount();
                      })
                      .catch((error) => {
                        const err = extractErrorMessage(error);
                        const errorArray = err.map((errorText: string) =>
                          errorText
                            .toLowerCase()
                            .trim()
                            .replaceAll(".", "")
                            .replaceAll(" ", "_")
                        );
                        toast.error(errorArray);
                      });
                  } else {
                    delete data.bic;
                    delete data.iban;
                    delete data.bank_name;
                    const account = {
                      title: data.title,
                      country: selected_country.name,
                      owner_name: data.owner,
                      operator: data.operator,
                      phone_number: data.phone_number,
                      country_code: selected_country.country_code,
                    };
                    updateUserMMAccount(account, selected_account.id)
                      .then((response: any) => {
                        toast.success(t("Changed_successfully"));
                        setEditModalOpen(false);
                        fetchMMAccount();
                      })
                      .catch((error) => {
                        const err = extractErrorMessage(error);
                        const errorArray = err.map((errorText: string) =>
                          errorText
                            .toLowerCase()
                            .trim()
                            .replaceAll(".", "")
                            .replaceAll(" ", "_")
                        );
                        toast.error(errorArray);
                      });
                  }
                }}
                validationSchema={yup.object().shape({
                  title: yup.string().required("title_required"),
                  bank_name:
                    type === "bank"
                      ? yup.string().required("bank_name_required")
                      : yup.string().nullable(),
                  bic:
                    type === "bank"
                      ? yup.string().required("bic_required")
                      : yup.string().nullable(),
                  iban:
                    type === "bank"
                      ? yup.string().iban()
                      : yup.string().nullable(),
                  owner: yup.string().required("owner_required"),
                  phone_number:
                    type === "bank"
                      ? yup.string().nullable()
                      : yup.string().required("phone_number_required"),
                  operator:
                    type === "bank"
                      ? yup.string().nullable()
                      : yup.string().required("operator_required"),
                  country: yup.string().nullable(),
                })}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <FormComp
                    values={values}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                    type={type}
                    t={t}
                    action="edit"
                  />
                )}
              </Formik>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      </Modal>
      <Modal open={addFormOpen} onClose={() => setAddFormOpen(false)}>
        <div className="flex justify-center items-center h-screen">
          <div className="row w-screen">
            <div className="col-md-4"></div>
            <div className="col-md-4 bg-white p-3 rounded mx-2">
              <div className="flex flex-row justify-between items-center">
                <h3>{t("Add_New_Account")}</h3>
                <button
                  onClick={() => setAddFormOpen(false)}
                  style={{ height: 40, width: 40, borderRadius: 20 }}
                  className="shadow-lg flex justify-center items-center"
                >
                  <i className="fa fa-close m-0"></i>
                </button>
              </div>
              <Formik
                initialValues={{
                  title: "",
                  bank_name: "",
                  bic: "",
                  iban: "",
                  owner: "",
                  phone_number: "",
                  operator: "",
                  country: "",
                }}
                onSubmit={(data: any) => {
                  const selected_country = JSON.parse(data.country);
                  if (type === "bank") {
                    delete data.operator;
                    delete data.phone_number;

                    const newAccount = {
                      title: data.title,
                      country: selected_country.name,
                      iban: data.iban,
                      bic: data.bic,
                      owner_name: data.owner,
                      bank_name: data.bank_name,
                      country_code: selected_country.country_code,
                    };
                    addUserBankAccount(newAccount)
                      .then((response: any) => {
                        toast.success("Add success");
                        setAddFormOpen(false);
                        fetchBankAccount();
                      })
                      .catch((error) => {
                        const err = extractErrorMessage(error);
                        const errorArray = err.map((errorText: string) =>
                          errorText
                            .toLowerCase()
                            .trim()
                            .replaceAll(".", "")
                            .replaceAll(" ", "_")
                        );
                        toast.error(t(errorArray.join(" ")));
                      });
                  } else {
                    delete data.bic;
                    delete data.iban;
                    delete data.bank_name;
                    const newAccount = {
                      title: data.title,
                      country: selected_country.name,
                      owner_name: data.owner,
                      country_code: selected_country.country_code,
                      operator: data.operator,
                      phone_number: data.phone_number,
                    };

                    addMMAccount(newAccount)
                      .then((response: any) => {
                        toast.success("Add success");
                        setAddFormOpen(false);
                        fetchMMAccount();
                      })
                      .catch((error) => {
                        const err = extractErrorMessage(error);
                        const errorArray = err.map((errorText: string) =>
                          errorText
                            .toLowerCase()
                            .trim()
                            .replaceAll(".", "")
                            .replaceAll(" ", "_")
                        );
                        toast.error(t(errorArray.join(" ")));
                      });
                  }
                }}
                validationSchema={yup.object().shape({
                  title: yup.string().required("title_required"),
                  bank_name:
                    type === "bank"
                      ? yup.string().required("bank_name_required")
                      : yup.string().nullable(),
                  bic:
                    type === "bank"
                      ? yup.string().required("bic_required")
                      : yup.string().nullable(),
                  iban:
                    type === "bank"
                      ? yup.string().iban()
                      : yup.string().nullable(),
                  owner: yup.string().required("owner_required"),
                  phone_number:
                    type === "bank"
                      ? yup.string().nullable()
                      : yup.string().required("phone_number_required"),
                  operator:
                    type === "bank"
                      ? yup.string().nullable()
                      : yup.string().required("operator_required"),
                  country: yup.string().required(),
                })}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <FormComp
                    values={values}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                    type={type}
                    t={t}
                    action="add"
                  />
                )}
              </Formik>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Accounts;
