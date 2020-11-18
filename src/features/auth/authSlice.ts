import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from '../types';

// Djangoで作成したApiエンドポイントのURLを定数で定義
// Reactの環境変数に格納(.envファイルに記載)
// process.env.と記載することで環境変数を取得する事ができる
const apiUrl = process.env.REACT_APP_DEV_API_URL;


export const authSlice = createSlice({
  name: 'auth',
  initialState: {
        //モーダルを制御する為にT/Fで定義している
        openLogin: true,
        openSignup: false,
        //Profileを押した際にプロフィールを更新するためのモーダル
        openProfile: false,
        // backEndのAPIにアクセスして処理をしている最中にTrueになる
        isLoadingAuth: false,
        // Djangoで作成したProfileModelの内容に基づいている
        myprofile: {
            id: 0,
            nickName: "",
            userProfile: 0,
            created_at: "",
            avatar: "",
        },
        //   プロフィールの一覧を取得して保持、管理するためstateを定義
        // Djangoで作成したProfileModelの内容に基づいている
        profiles: [
            {
                id: 0,
                nickName: "",
                userProfile: 0,
                created_at: "",
                avatar: "",
            },
        ],
    },
    reducers: {
        // APIにフェッチをした時に呼ぶアクションで上で定義した
        // isLoadingAuthをTrueつまりローディングを開始または終了させる
        fetchCredStart(state) {
            state.isLoadingAuth = true;
        },
        fetchCredEnd(state) {
            state.isLoadingAuth = false;
        },
        // このアクションが呼ばれた時にLoginのモーダルを表示、非表示にする関数
        setOpenLogin(state) {
            state.openLogin = true;
        },
        setCloseLogin(state) {
            state.openLogin = false;
        },
        // このアクションが呼ばれた時にSignup(新規登録)のモーダルを表示、非表示にする関数
        setOpenSignup(state) {
            state.openSignup = true;
        },
        setCloseSignup(state) {
            state.openSignup = false;
        },
        // ログインした後の自分のプロフィールを変更するためのモーダルの表示、非表示のためのアクション
        setOpenProfile(state) {
            state.openProfile = true;
        },
        setCloseProfile(state) {
            state.openProfile = false;
        },
        // ニックネームを編集するためのアクションの定義（Profile変更の際の）
        // ユーザーが入力した文字列を受け取りaction.payloadでないようにアクセスして入力された文字列を
        // myprofile.nickNameに上書きする
        editNickName(state, action) {
            state.myprofile.nickName = action.payload;
        },
    },
});

//Reducerで定義したacrionをReactで使えるよにexportする
export const { 
    fetchCredStart, fetchCredEnd, 
    setOpenLogin, setCloseLogin,
    setOpenSignup, setCloseSignup,
    setOpenProfile, setCloseProfile,
    editNickName,
} = authSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default authSlice.reducer;


// ①　createAsyncThunkは非同期関数を作成するもの
// ②　import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from '../types';
// 　　はデータ型を使用するためにimportする