import {
  configureStore,
  combineReducers,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import AuthSlice from "./features/Auth/AuthSlice";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import TransferSlice from "./features/Transfer/TransferSlice";
import DeveloperSlice from "./features/Developer/DeveloperSlice";

const rootReducer = combineReducers({
  auth: AuthSlice,
  transfer: TransferSlice,
  developer: DeveloperSlice,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: {
    persistedReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
  // devTools: true,
});
const persistor = persistStore(store);

export { store, persistor };
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
