import React from "react";
import InputField from "../forms/InputField";
import SelectField from "../forms/SelectField";
import { Form } from "formik";
import { useAppSelector } from "../../store/hooks";

type Props = {
  type: string;
  countries?: any;
  values: any;
  errors: any;
  handleChange: any;
  handleBlur: any;
  touched: any;
  t: any;
  action: string;
};

const FormComp = ({
  type,
  values,
  errors,
  handleChange,
  handleBlur,
  touched,
  t,
  action,
}: Props) => {
  const my_counties = useAppSelector(
    (state) => state.persistedReducer.transfer.danaPayCountries
  );

  return (
    <>
      <Form>
        <div className="mt-4"></div>
        {type === "bank" && (
          <InputField
            name="iban"
            handleChange={handleChange}
            onBlur={handleBlur}
            value={values.iban}
            label={t("IBAN")}
            error={t(`${errors.iban}`)}
            touched={touched.iban}
          />
        )}

        <div className="my-4">
          <label>{t("Country")}</label>
          <select
            name="country"
            value={values.country}
            onChange={(e) => {
              handleChange(e);
            }}
            className="w-full py-1 bg-white border-b border-b-slate-400"
          >
            <option>{t("select")}</option>
            {my_counties.map((country: any) => (
              <option value={JSON.stringify(country)}>{country.name}</option>
            ))}
          </select>
          {errors.userType && touched.userType && (
            <small className="text-red-500">{t(`${errors.userType}`)}</small>
          )}
        </div>
        <InputField
          name="title"
          handleChange={handleChange}
          onBlur={handleBlur}
          value={values.title}
          label={t("Account_Title")}
          error={t(`${errors.title}`)}
          touched={touched.title}
        />

        <InputField
          name="owner"
          handleChange={handleChange}
          onBlur={handleBlur}
          value={values.owner}
          label={t("Owner_Name")}
          error={t(`${errors.owner}`)}
          touched={touched.owner}
        />

        {type === "bank" ? (
          <>
            <InputField
              name="bank_name"
              handleChange={handleChange}
              onBlur={handleBlur}
              value={values.bank_name}
              label={t("Bank_Name")}
              error={t(`${errors.bank_name}`)}
              touched={touched.company}
            />
            <InputField
              name="bic"
              handleChange={handleChange}
              onBlur={handleBlur}
              value={values.bic}
              label={t("BIC")}
              error={t(`${errors.bic}`)}
              touched={touched.bic}
            />
          </>
        ) : (
          <>
            <InputField
              name="operator"
              handleChange={handleChange}
              onBlur={handleBlur}
              value={values.operator}
              label={t("operator")}
              error={t(`${errors.operator}`)}
              touched={touched.operator}
            />
            <InputField
              name="phone_number"
              handleChange={handleChange}
              onBlur={handleBlur}
              value={values.phone_number}
              label={t("Phone_Number")}
              error={t(`${errors.phone_number}`)}
              touched={touched.phone_number}
            />
          </>
        )}

        <div className="flex flex-row justify-between mt-10 items-center justify-content-center">
          <button
            type="submit"
            className={`btn text-center rounded-md bg-green-600`}
          >
            <span className="text-white capitalize">
              {action === "add" ? t("Add_Account") : t("Edit_Account")}
            </span>
          </button>
        </div>
      </Form>
    </>
  );
};

export default FormComp;
