import { createSlice } from "@reduxjs/toolkit";

interface StateProps {
  apps: any;
  session: any;
  app: any;
  developerTokens: any;
}

const initialState: StateProps = {
  apps: [],
  session: {},
  app: null,
  developerTokens: null,
};

const DeveloperSlice = createSlice({
  name: "developer",
  initialState,
  reducers: {
    logDeveloper(state, actions) {
      state.session = actions.payload;
    },
    fetchApps(state, actions) {
      state.apps = actions.payload;
    },
    setDeveloperTokens(state, actions) {
      state.developerTokens = actions.payload;
    },
    setSelectedApp(state, actions) {
      state.app = actions.payload;
    },
    resetDeveloper(state) {
      state.apps = [];
      state.session = {};
      state.app = null;
      state.developerTokens = null;
    },
  },
});

export const {
  logDeveloper,
  fetchApps,
  setDeveloperTokens,
  setSelectedApp,
  resetDeveloper,
} = DeveloperSlice.actions;
export default DeveloperSlice.reducer;
