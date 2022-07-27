const getSendingCountry = (transfer: any) => {
  return transfer.loggedInUserCountry.id;
};

const getCashInMethod = (transfer: any, paymentMethod: string) => {
  if (!transfer) return;
  if (!paymentMethod) return;
  const { loggedInUserCountry } = transfer;
  const { cash_in_methods } = loggedInUserCountry;
  return cash_in_methods.find(
    (value: any) =>
      value.cash_in_method.payment_type.name.toLowerCase() ===
      paymentMethod.toLowerCase()
  );
};

const getReceivingCountry = (transfer: any, country_code: string) => {
  if (!transfer) return;
  if (!country_code) return;
  const { transferCountry } = transfer;
  const { receiving_countries } = transferCountry;
  return receiving_countries.find(
    (value: any) => value.receiving_country.country_code === country_code
  );
};

const getPreferredComChannel = (countries: any, code: any) => {
  if (!countries) return;
  if (!code) return;
  const country = countries.find((item: any) => item.country_code === code);
  if (!country) return null;
  return country.preferred_notification_channel;
};

const getSelectedCashIbMethodId = (transfer: any, selectedMethod: string) => {
  if (!transfer) return;
  if (!selectedMethod) return;
  const found = transfer.loggedInUserCountry.cash_in_methods.find(
    (value: any) =>
      value.cash_in_method.payment_type.name.toLowerCase() ===
      selectedMethod.toLowerCase()
  );
  return found.cash_in_method.id;
};

const getReceivingCountryID = (transfer: any, country_code: string) => {
  if (!transfer) return;
  if (!country_code) return;
  const receiving = transfer.loggedInUserCountry.receiving_countries.find(
    (value: any) => value.receiving_country.country_code === country_code
  );
  return receiving.receiving_country.id;
};

const buildSelectInputData = (transfer: any) => {
  if (!transfer) return;
  return transfer.loggedInUserCountry?.cash_in_methods
    ?.filter(
      (data: any) =>
        data.cash_in_method.payment_type.name.toLowerCase() ===
          "bank_transfer" ||
        data.cash_in_method.payment_type.name.toLowerCase() === "balance"
    )
    .map((value: any) => {
      return {
        name: value.cash_in_method.name,
        type: value.cash_in_method.payment_type.name,
      };
    });
};

const checkCashInLimit = (transfer: any, type: string, value: string) => {
  if (!transfer) return;
  if (!type) return;
  if (!value) return;
  if (type === "max") {
    return parseFloat(value) > transfer.loggedInUserCountry.sending_max_amount;
  } else {
    return parseFloat(value) < transfer.loggedInUserCountry.sending_min_amount;
  }
};

const buildLimitError = (transfer: any, type: string, t: any) => {
  if (!transfer) return;
  if (!type) return;
  if (!t) return;
  if (type === "max") {
    return `${t("You_can_send_between")} ${
      transfer.loggedInUserCountry.sending_min_amount
    } & ${transfer.loggedInUserCountry.sending_max_amount}`;
  } else {
    return `${t("You_can_send_between")} ${
      transfer.loggedInUserCountry.sending_min_amount
    } & ${transfer.loggedInUserCountry.sending_max_amount}`;
  }
};

const applyRate = (value: any, rate: any, fromCurrency: any) => {
  if (!value) return;
  if (!rate) return;
  if (!fromCurrency) return;
  return fromCurrency === "EUR"
    ? parseFloat(value.target.value) * rate + ""
    : parseFloat(value.target.value) / rate + "";
};

const getCountryByCode = (countries: any, code: any) => {
  const country = countries.find((item: any) => item.country_code === code);
  return country;
};

const translateError = (text: string, t: any) => {
  if (!text) return;
  return t(text.toLowerCase().trim().replaceAll(" ", "_").replaceAll(".", ""));
};

const getLoggedInUserReceivingCountries = (
  transfer: any,
  user: any,
  names = false
) => {
  if (!user) return;
  if (!transfer) return;
  const countries = transfer.danaPayCountries.find(
    (res: any) => res.name.toLowerCase() === user?.country.toLowerCase()
  );

  const all_receiving_countries =
    countries?.receiving_countries.map((cc: any) => {
      if (names) {
        // only return thr full country name
        return cc.receiving_country.name;
      } else {
        // only return thr full country codes
        return cc.receiving_country.code.toLowerCase();
      }
    }) || [];

  return all_receiving_countries;
};

const getCountryNameFromCode = (transfer: any, code: string) => {
  const country = transfer.danaPayCountries.find(
    (countryObject: any) => countryObject.country_code === code
  );
  if (!country) return;
  return country.name;
};

export {
  getSendingCountry,
  getReceivingCountry,
  getCashInMethod,
  getPreferredComChannel,
  getCountryByCode,
  getSelectedCashIbMethodId,
  getReceivingCountryID,
  buildSelectInputData,
  checkCashInLimit,
  buildLimitError,
  applyRate,
  translateError,
  getLoggedInUserReceivingCountries,
  getCountryNameFromCode,
};
