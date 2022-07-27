export const extractErrorMessage = (errorObject: any) => {
  const { data } = errorObject;
  if (data === undefined) return [];
  if (data["errors"] === undefined) {
    if (data.message) {
      return [data.message];
    } else {
      return [];
    }
  }
  const errors = data?.errors;
  const allErrors = Object.values(errors);
  return allErrors.map((err: any) => `${err[0]}`);
};
