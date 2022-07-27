import { createSlice } from "@reduxjs/toolkit";

interface StateProps {
  beneficiary: any;
  transferResult: any;
  fetchingBeneficiary: any;
  makingTransfer: any;
  transferCountry: any;
  transfers: any;
  selectedTransfer: any;
  isModalOpened: boolean;
  transferFromType: string;
  transferId: any;
  fetchingData: boolean;
  escrowState: boolean;
  actedOn: any;
  page: number;
  danaPayCountries: any;
  allCountries: any;
  fetching: boolean;
  loggedInUserCountry: any;
  paymentButtonState: any;
}

const initialState: StateProps = {
  transferResult: null,
  beneficiary: null,
  transferCountry: null,
  fetchingBeneficiary: "",
  makingTransfer: "",
  transfers: [],
  selectedTransfer: null,
  isModalOpened: false,
  transferFromType: "internal",
  transferId: null,
  fetchingData: true,
  escrowState: false,
  actedOn: {},
  page: 1,
  danaPayCountries: [],
  allCountries: [],
  fetching: false,
  loggedInUserCountry: null,
  paymentButtonState: {},
};

const TransferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    addBeneficiary(state, actions: any) {
      state.beneficiary = actions.payload;
    },
    addTransferCountry(state, actions: any) {
      if (actions.payload) {
        state.transferCountry = actions.payload;
      }
    },
    addLoggedInUserCountry(state, actions) {
      state.loggedInUserCountry = actions.payload;
    },
    addTransferResult(state, actions: any) {
      state.transferResult = actions.payload;
    },
    fetchTransferRecords(state, actions) {
      state.transfers = actions.payload;
      state.fetchingData = false;
    },
    setSelected(state, actions) {
      state.selectedTransfer = actions.payload;
      state.isModalOpened = true;
    },
    closeModal(state) {
      state.isModalOpened = false;
      state.selectedTransfer = null;
    },
    setTransferFromType(state, actions) {
      state.transferFromType = actions.payload;
    },
    setExternalApiPaymentId(state, actions) {
      state.transferId = actions.payload;
    },
    setFetchState(state) {
      state.fetchingData = true;
    },
    resetTransfer(state) {
      state.transferResult = null;
      state.beneficiary = null;
      state.transferCountry = null;
      state.fetchingBeneficiary = "";
      state.makingTransfer = "";
      state.transfers = [];
      state.selectedTransfer = null;
      state.isModalOpened = false;
      state.transferFromType = "internal";
      state.transferId = null;
      state.fetchingData = false;
      state.danaPayCountries = [];
      state.allCountries = [];
      state.page = 1;
      state.danaPayCountries = [];
      state.allCountries = [];
      state.loggedInUserCountry = null;
      state.paymentButtonState = {};
    },
    updateEscrowState(state, action) {
      state.escrowState = action.payload;
    },
    updateActedOn(state, action) {
      state.actedOn = {
        ...state.actedOn,
        [action.payload.id]: action.payload.status,
      };
    },
    updatePage(state, action) {
      state.page = action.payload;
    },
    updateTransaction(state, action) {
      state.transfers = state.transfers.map((transfer: any) => {
        if (transfer.transaction_id === action.payload.id) {
          return { ...transfer, status: action.payload.status };
        } else {
          return transfer;
        }
      });
    },

    updateCountries(state, actions) {
      state.danaPayCountries = actions.payload[0];
      state.allCountries = actions.payload[1];
    },

    setIsFetching(state, actions) {
      state.fetching = actions.payload;
    },

    setPaymentButtonState(state, actions) {
      state.paymentButtonState = actions.payload;
    },
  },
});

export const {
  addBeneficiary,
  addTransferCountry,
  addTransferResult,
  fetchTransferRecords,
  setSelected,
  closeModal,
  setTransferFromType,
  setExternalApiPaymentId,
  setFetchState,
  resetTransfer,
  updateEscrowState,
  updateActedOn,
  updatePage,
  updateTransaction,
  updateCountries,
  setIsFetching,
  addLoggedInUserCountry,
  setPaymentButtonState,
} = TransferSlice.actions;
export default TransferSlice.reducer;
