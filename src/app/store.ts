import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";
import reviewReducer from '../features/review/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    review: reviewReducer,
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

