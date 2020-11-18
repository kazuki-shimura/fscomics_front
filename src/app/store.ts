import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// TypeScriptはDispatchに対しても型を定義する必要があるのでstoreからexportできるようにしておく
export type AppDispatch = typeof store.dispatch;

