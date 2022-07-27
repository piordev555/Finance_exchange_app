import instance from "../../../apis/axiosInstance";

export const login = (obj: any) => {
  return instance.post("/auth/byEmail", JSON.stringify(obj));
};

export const checkIfUserExists = (obj: any) => {
  return instance.get(
    `/customers/exists?phone_number=${obj.phone_number}&country_code=${obj.country_code}`
  );
};

export const signUp = (obj: any) => {
  return instance.post("/users/new", JSON.stringify(obj)); //needs changes
};

export const changePassword = (obj: any) => {
  return instance.post("/changePassword", JSON.stringify(obj));
};

export const resendEmail = (obj: any) => {
  return instance.get(`/email/resend?email=${obj.email}`);
};

export const addUser = (obj: any, userType: string) => {
  if (userType === "business") {
    return instance.post("/users/companyOwner/register", JSON.stringify(obj));
  } else {
    return instance.post("/users/register", JSON.stringify(obj));
  }
};

export const addCompany = (obj: any) => {
  return instance.post("/companies", JSON.stringify(obj));
};

export const editCompany = (obj: any, company_id: string) => {
  return instance.put("/companies/" + company_id, JSON.stringify(obj));
};

export const addDocuments = (obj: any) => {
  return instance.post("/users/companyOwner/new", JSON.stringify(obj));
};

export const uploadFiles = (formData: any, company_id: any) => {
  return instance.post(`/companies/${company_id}/documents`, formData);
};

export const saveFCMToken = (fcmToken: any, token: string) => {
  return instance.put(
    "auth/fcmToken",
    JSON.stringify({
      fcm_token: fcmToken,
      platform: "web",
      application: "Danapay webpro app",
    })
  );
};

export const editContact = async (data: any, id: string) => {
  return instance.put(`/auth/contacts/${id}`, JSON.stringify(data));
};

export const requestPasswordResetLink = (data: any) => {
  return instance.post("/password/email", JSON.stringify(data));
};

export const passwordReset = (data: any) => {
  return instance.post("/password/reset", JSON.stringify(data));
};

export const getCountryData = (key: any) => {
  return fetch(`https://api.ipdata.co?api-key=${key}`).then((res) =>
    res.json()
  );
};

export const broadcastingAuth = (socketId: any, channel: any) => {
  return instance.post(`${process.env.REACT_APP_BASE_URL}/broadcasting/auth`, {
    socket_id: socketId,
    channel_name: channel.name,
  });
};

//fetch generated access token for sumsub functionality
export const getKYCSumSubToken = async () => {
  return instance.post(`/userKYC/accessToken`);
};

//adding and fetching users added contacts...
export const getFavorites = async () => {
  return instance.get(`transactions/favorites`);
};

export const addContact = async (data: any) => {
  //
  return instance.post("/auth/contacts", JSON.stringify(data));
};

export const fetchUserData = () => {
  return instance.get(`/auth/current`);
};

export const addUserBankAccount = async (data: any) => {
  return instance.post("/userBankAccounts", JSON.stringify(data));
};

export const updateUserBankAccount = async (data: any, id: any) => {
  return instance.put(`/userBankAccounts/${id}`, JSON.stringify(data));
};

export const deleteUserBankAccount = async (id: any) => {
  return instance.delete(`/userBankAccounts/${id}`);
};

export const fetchUserBankAccounts = () => {
  return instance.get(`/userBankAccounts/all`);
};

export const addMMAccount = async (data: any) => {
  return instance.post("/userMMAccounts", JSON.stringify(data));
};

export const updateUserMMAccount = async (data: any, id: any) => {
  return instance.put(`/userMMAccounts/${id}`, JSON.stringify(data));
};

export const deleteUserMMAccount = async (id: any) => {
  return instance.delete(`/userMMAccounts/${id}`);
};

export const fetchMMAccounts = () => {
  return instance.get(`/userMMAccounts/all`);
};

export const logout = () => {
  return instance.post(`/auth/logout`, {});
};
