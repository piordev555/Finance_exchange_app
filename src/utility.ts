const extractError = (error: any) => {
  if (error?.data?.errors) {
    const Err = Object.values(error.data.errors);
    return Err.join(", ");
  } else {
    return error?.message || error?.data?.message;
  }
};

const getLoggedInUserCountryObject = () => {};

const getCashInMethodsForUserCountry = () => {};

const getCashOutMethodsForUserCountry = () => {};

export {
  extractError,
  getLoggedInUserCountryObject,
  getCashInMethodsForUserCountry,
  getCashOutMethodsForUserCountry,
};
