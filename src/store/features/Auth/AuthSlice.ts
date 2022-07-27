import { createSlice } from "@reduxjs/toolkit";
import Accounts from "../../../components/Accounts";

interface StateProps {
  user: any;
  isTokenFresh: boolean;
  access_token: any;
  isLoggedIn: boolean;
  company: any;
  lang: string;
  fcmToken: any;
  currency: string;
  rate: number;
  favorites: any;
  userBalance: any;
  active_menu: string;
  bank_accounts: any;
  selected_account: any;
  mobile_accounts: any;
  dana_pay_bank_accounts: any;
}

const initialState: StateProps = {
  user: null,
  isTokenFresh: false,
  access_token: null,
  isLoggedIn: false,
  company: null,
  lang: "fr",
  fcmToken: null,
  currency: "EUR",
  rate: 1,
  favorites: [],
  userBalance: 0,
  active_menu: "home",
  bank_accounts: [],
  mobile_accounts: [],
  selected_account: null,
  dana_pay_bank_accounts: [],
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser(state, actions) {
      state.user = actions.payload.user;
      state.access_token = actions.payload.access_token;
      state.isLoggedIn = true;
    },
    editUser(state, actions: any) {
      state.user = { ...state.user, ...actions.payload };
    },
    addCompanyToState(state, actions) {
      state.user.company = actions.payload;
    },
    setLanguage(state, actions) {
      state.lang = actions.payload;
    },
    setFCMToken(state, actions) {
      state.fcmToken = actions.payload;
    },
    updateCompanyState(state) {
      state.user.company.is_active = !state.user?.company.is_active;
    },
    resetAuth(state) {
      state.user = null;
      state.isTokenFresh = false;
      state.access_token = null;
      state.isLoggedIn = false;
      state.company = {};
      state.fcmToken = null;
      state.favorites = [];
      state.userBalance = 0;
      state.bank_accounts = [];
      state.mobile_accounts = [];
      state.selected_account = null;
    },
    changeCurrency(state, actions) {
      state.currency = actions.payload;
    },
    setRate(state, actions) {
      state.rate = actions.payload;
    },
    saveUserFavorites(state, actions: any) {
      state.favorites = actions.payload;
    },
    updateBalance(state, actions) {
      state.userBalance = actions.payload;
    },
    setActiveMenu(state, actions) {
      state.active_menu = actions.payload;
    },
    deleteBankAccount(state, actions) {
      state.bank_accounts = state.bank_accounts.filter(
        (account: any) => account.id !== actions.payload
      );
    },
    setSelectedBank(state, actions) {
      state.selected_account = actions.payload;
    },
    setAccounts(state, actions) {
      state.bank_accounts = actions.payload;
    },
    setMMAccounts(state, actions) {
      state.mobile_accounts = actions.payload;
    },
    deleteMMAccount(state, actions) {
      state.mobile_accounts = state.mobile_accounts.filter(
        (account: any) => account.id !== actions.payload
      );
    },
    updateDanaPayBankAccounts(state, actions) {
      state.dana_pay_bank_accounts = actions.payload;
    },
  },
});

export const {
  loginUser,
  editUser,
  addCompanyToState,
  setLanguage,
  setFCMToken,
  resetAuth,
  updateCompanyState,
  changeCurrency,
  setRate,
  saveUserFavorites,
  updateBalance,
  setActiveMenu,
  deleteBankAccount,
  setSelectedBank,
  setAccounts,
  setMMAccounts,
  deleteMMAccount,
  updateDanaPayBankAccounts,
} = AuthSlice.actions;
export default AuthSlice.reducer;
