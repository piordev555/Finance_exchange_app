import React from "react";
import InputField from "../forms/InputField";
import SelectField from "../forms/SelectField";
import { Form } from "formik";

type Props = {
  type: string;
  countries?: any;
  values: any;
  errors: any;
  handleChange: any;
  handleBlur: any;
  touched: any;
  t: any;
};

const EditForm = ({
  type,
  values,
  errors,
  handleChange,
  handleBlur,
  touched,
  t,
}: Props) => {
  const countries = [{ type: "ddd" }, { type: "ddd" }, { type: "ddd" }];

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

        <select
          name="country"
          value={values.country}
          onChange={(e) => {
            handleChange(e);
          }}
          className="w-full py-1 bg-white border-b border-b-slate-400"
        >
          <option value="" className="text-black"></option>
          <option value="ug">{t("ug")}</option>
          <option value="ke">{t("ke")}</option>
        </select>
        {errors.userType && touched.userType && (
          <small className="text-red-500">{t(`${errors.userType}`)}</small>
        )}

        <InputField
          name="title"
          handleChange={handleChange}
          onBlur={handleBlur}
          value={values.title}
          label={t("Account Title")}
          error={t(`${errors.title}`)}
          touched={touched.title}
        />

        <InputField
          name="owner"
          handleChange={handleChange}
          onBlur={handleBlur}
          value={values.owner}
          label={t("Owner Name")}
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
              label={t("Bank Name")}
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
              label={t("phone_number")}
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
            <span className="text-white capitalize">Add</span>
          </button>
        </div>
      </Form>
    </>
  );
};

export default EditForm;
