import React from "react";
import "react-app-polyfill/stable";
import Navigation from "./Navigation";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
import { IntercomProvider } from "react-use-intercom";
const INTERCOM_APP_ID = "xuz76by7";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#4BBEE7",
    },
  },
  typography: {
    fontFamily: "Poppins",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {},
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              window.location.href = "/";
            }}
          >
            <IntercomProvider appId={INTERCOM_APP_ID}>
              <Navigation />
            </IntercomProvider>
          </ErrorBoundary>
        </PersistGate>
      </ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
      />
    </Provider>
  );
};

export default App;
