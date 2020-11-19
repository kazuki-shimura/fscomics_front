import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from '../types';

// Djangoで作成したApiエンドポイントのURLを定数で定義
// Reactの環境変数に格納(.envファイルに記載)
// process.env.と記載することで環境変数を取得する事ができる
const apiUrl = process.env.REACT_APP_DEV_API_URL;


// ログインした際にJWTの認証トークンを返す非同期関数
export const fetchAsyncLogin = createAsyncThunk (
    "auth/post",
    //reactから引数を受け取り値をauthen格納する(types.tsで定義したデータ型とあっているかの確認を行う)
    async (authen: PROPS_AUTHEN) => {
        //バックエンドで作成したAPIのURLにPostメソッドを送って認証トークンを取得する
        const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
            //Postメソッドの場合headersに属性を記載する必要がある
            headers: {
                "Content-Type": "application/json",
            },
        });
        //認証トークンが返り値として渡される
        return res.data;
    }
);


// 新規登録を行う際のJWTトークンを取得してくる非同期関数
export const fetchAsyncRegister = createAsyncThunk (
    "auth/register",
    async (auth: PROPS_AUTHEN) => {
        const res = await axios.post(`${apiUrl}api/register/`, auth, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    }
);


// 新規登録を行う非同期関数
export const fetchAsyncCreateProf = createAsyncThunk (
    "profile/post",
    async (nickName: PROPS_NICKNAME) => {
        const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
            // JWTの認証トークンがないとプロフィールの更新ができない仕組みになっているのでMODヘッダーでやったように
            // ヘッダーにJWTの認証トークンを含めておく必要がある
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);


// ログイン後プロフィールを変更するための非同期関数
export const fetchAsyncUpdateProf = createAsyncThunk (
    "profile/put",
    async (profile: PROPS_PROFILE) => {
        //入力値を格納するuploadDataをFormDataから作成
        const uploadData = new FormData();
        //appendで入力された値をuploadDataに格納している
        uploadData.append("nickName", profile.nickName);
        // avatar画像はnullも許容するので入力されていれば格納する
        profile.avatar && uploadData.append("avatar", profile.avatar, profile.avatar.name);
        //更新なのでputメソッドを使用、どのUserのProfileを更新するかをURLに含める必要がある
        const res  = await axios.put(`${apiUrl}api/profile/${profile.id}/`, uploadData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);


// ログインしているユーザーの自身のProfileを取得する非同期関数
export const fetchAsyncGetMyProf = createAsyncThunk(
    "profile/get", async () => {
        const res = await axios.get(`${apiUrl}api/myprofile/`, {
            headers: {
                //自身のProfileの取得は認証が必要なのでヘッダーにJWTを渡している
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        //バックエンドのMyProfileListViewの方でfilterを使ってList形式で返しているので
        // 一つであっても配列状に帰ってきてしまうので一番初めの要素を取り出している
        return res.data[0];
    }
);


// 存在するプロフィールを全て取得する非同期関数
export const fetchAsyncGetProfs = createAsyncThunk(
    "profiles/get",
    async () => {
        const res = await axios.get(`${apiUrl}api/profile/`, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);



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
    //非同期関数が成功した場合の後処理をextraReducersとして追記しておく
    extraReducers: (builder) => {
        // fulfilledは正常終了なので非同期関数のfetchAsyncLoginが正常終了した場合中身が実行される
        builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
            //ログインが成功した時ローカルストレージにJWTを格納する
            //action.payloadは非同期関数で返していた内容を受け取る事ができる
            localStorage.setItem("localJWT", action.payload.access);
        });
        //新しく作ったプロフィールが渡されてくるのでpayloadに格納している
        builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
            state.myprofile = action.payload;
        });
        // ログインしているUserのProfileがaction.payloadに入っているのでmyprofileに上書きしている
        builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
            state.myprofile = action.payload;
        });
        //fetchAsyncGetProfsで取得したUser達の情報がaction.payloadに入っているのでをprofilesに入れている
        builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
            state.profiles = action.payload;
        });
        //プロフィールを更新した後の非同期間酢の後処理
        builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
            // 更新後のProfileのデータがaction.payloadに入っているのでmyprofileに入れている
            state.myprofile = action.payload;
            // SPAを実現するため今更新したプロフィールデータをProfilesデータをmapで展開して
            // 今更新したProfileのデータと一致するidのProfileを更新するようにする
            state.profiles = state.profiles.map((prof) => 
                prof.id === action.payload.id ? action.payload : prof
            );
        });
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

//authはstoreのなかに定義したもの
export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const selectOpenLogin = (state: RootState) => state.auth.openLogin;
export const selectOpenSignup = (state: RootState) => state.auth.openSignup;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;


// ①　createAsyncThunkは非同期関数を作成するもの
// ②　import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from '../types';
// 　　はデータ型を使用するためにimportする