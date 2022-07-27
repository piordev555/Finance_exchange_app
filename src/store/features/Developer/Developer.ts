import axios from "axios";

const {
  REACT_APP_FUSIO_APP_CLIENT,
  REACT_APP_FUSIO_APP_SECRET,
  REACT_APP_FUSIO_BASE_URL,
} = process.env;

const instance = axios.create({
  baseURL: REACT_APP_FUSIO_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const DeveloperApi = {
  getAuthToken() {
    const obj = {
      grant_type: "client_credentials",
      scope: "backend.user",
    };
    instance.defaults.headers.common["Authorization"] =
      "Basic " +
      btoa(`${REACT_APP_FUSIO_APP_CLIENT}:${REACT_APP_FUSIO_APP_SECRET}`);

    return instance.post("/authorization/token", JSON.stringify(obj));
  },

  loginDeveloper(obj: any) {
    if (instance.defaults.headers.common["Authorization"]) {
      delete instance.defaults.headers.common["Authorization"];
    }
    return instance.post("/consumer/login", JSON.stringify(obj));
  },

  signUpDeveloper(obj: any, token: string) {
    instance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return instance.post("/backend/user", JSON.stringify(obj));
  },

  createApp(obj: any, token: any) {
    instance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return instance.post("/consumer/app", JSON.stringify(obj));
  },

  editWebHook(id: any, obj: any, token: any) {
    instance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return instance.put(`/app/${id}`, JSON.stringify(obj));
  },

  GetAppDetails(id: any, token: any) {
    instance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return instance.get(`/consumer/app/${id}`);
  },

  getAllUserApps(token: any) {
    instance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return instance.get(`/consumer/app`);
  },
};
