import instance from "../../../apis/axiosInstance";

export const fetchBeneficiary = (obj: any) => {
  return instance.post("/users/getBeneficiary", JSON.stringify(obj));
};

export const initTransfer = (obj: any) => {
  return instance.post("/payments", JSON.stringify(obj));
};

export const getPaymentById = (id: string) => {
  return instance.get(`/operations/${id}`);
};

export const initFinForExternalPayment = (id: string) => {
  return instance.put(`/payments/${id}/confirm`);
};

export const getTransfers = (page: any) => {
  if (page === 0) {
    page = 1;
  }
  return instance.get("/operations?page=" + page);
};

export const getTransferDetails = (id: any) => {
  return instance.get("/operations/" + id);
};

export const confirmTransaction = (id: string) => {
  return instance.post(`/escrowTransactions/${id}/confirmExecution`);
};

export const confirmRefund = (id: string) => {
  return instance.post(`/escrowTransactions/${id}/confirmRefund`);
};

export const getTransferCountries = () => {
  return instance.get(`/transactions/transferCountries`);
};

export const getDanaPayCountries = () => {
  return instance.get("/get-countries");
};

export const revokeExecutionConfirmation = (id: any) => {
  return instance.post(`/escrowTransactions/${id}/revokeExecutionConfirmation`);
};

export const revokeRefundConfirmation = (id: any) => {
  return instance.post(`/escrowTransactions/${id}/revokeRefundConfirmation`);
};

//add accounts
export const createAccount = (account: any) => {
  return instance.post(`/userBankAccounts`, JSON.stringify(account));
};

//get accounts
export const getAccounts = () => {
  return instance.get(`/userBankAccounts/all`);
};

//edit accounts
export const editAccount = (account_id: any) => {
  // return instance.post(`/userBankAccounts/${account_id}`);
};

//delete accounts
export const deleteAccount = (account_id: any) => {
  return instance.delete(`/userBankAccounts/${account_id}`);
};

//cash out routes

export const initiateCashOut = (payload: any) => {
  return instance.post(`/initiatePayout`, JSON.stringify(payload));
};

export const confirmCashOut = (payload: any) => {
  return instance.post(`/verifyPayout`, JSON.stringify(payload));
};


export const resendCashOutCode = (cashOutId: string) => {
  return instance.post(`/cashout/${cashOutId}/resendCode`);
};

export const getCashOutMethods = () => {
  return instance.get(`/transactions/transferCashoutMethods`);
};

export const currentBalance = () => {
  return instance.get(`/auth/current`);
};

export const fetchBankDetails = () => {
  return instance.get(`/payments/bankdetails`);
};

// export const currentBalance = () => {
//   return instance.get(`/auth/current`);
// };

export const getAppliedFeesForTransfers = (data: any, user_id: any) => {
  return instance.post(
    `/payments/getEuroAppliedFees/transfer/${user_id}`,
    JSON.stringify(data)
  );
};

export const getAppliedFeesForWithdraws = (data: any, user_id: any) => {
  return instance.post(
    `/payments/getEuroAppliedFees/withdraw/${user_id}`,
    JSON.stringify(data)
  );
};

export const getAppliedFeesForDeposits = (data: any, user_id: any) => {
  return instance.post(
    `/payments/getEuroAppliedFees/deposit/${user_id}`,
    JSON.stringify(data)
  );
};

export const depositOnAccount = (data: any) => {
  return instance.post(`/payin`, JSON.stringify(data));
};

export const getDanapayBanks = (country_calling_code: any) => {
  return instance.get(`/danapayBankDetails/country/${country_calling_code}`);
};

export const getBankDetails = (bank_id: any, payment_id = "", amount = "") => {
  let urlBody = `id=${bank_id}`;
  if (amount !== "") {
    urlBody = `${urlBody}&amount=${amount}`;
  }
  if (payment_id !== "") {
    urlBody = `${urlBody}&payment_id=${payment_id}`;
  }
  return instance.get(`notifications/danapayBankDetails?${urlBody}`);
};

export const completeOnDemandPayment = (payment_id: string) => {
  return instance.post(`/payments/onDemand/${payment_id}/accept`);
};

export const cancelWithdraw = (id: string) => {
  return instance.delete(`cashout/${id}`);
};

export const cancelTransfer = (id: string) => {
  return instance.delete(`payments/${id}`);
};
