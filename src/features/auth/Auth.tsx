import React from 'react';
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import styles from './Auth.module.css';
import Modal from 'react-modal';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {TextField, Button, CircularProgress } from '@material-ui/core';

import { fetchAsyncGetReviews, fetchAsyncGetComments } from "../review/reviewSlice"

import {
    // useSelect関係
    selectIsLoadingAuth, selectOpenLogin, selectOpenSignup,
    // Reducer関係
    setOpenLogin, setCloseLogin, setOpenSignup, setCloseSignup,
    // 非同期関数
    fetchCredStart, fetchCredEnd, 
    fetchAsyncLogin, fetchAsyncRegister, 
    fetchAsyncGetMyProf, fetchAsyncGetProfs, fetchAsyncCreateProf,
} from './authSlice';


//モーダルで使用するstyleの設定
const customStyles = {
    overlay: {
        backgroundColor: "#777777",
    },
    content: {
        top: "55%",
        left: "50%",

        width: 280,
        height: 350,
        padding: "50px",

        transform: "translate(-50%, -50%)",
    },
};

const Auth: React.FC = () => {
    Modal.setAppElement("#root");
    // storeのなかのselectOpenLoginというステートを取得する事ができてopenLoginに代入している
    const openLogin = useSelector(selectOpenLogin);
    const openSignup = useSelector(selectOpenSignup);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    const dispatch: AppDispatch = useDispatch();

    return (
        <>
            <Modal
                //isOpenはT/Fで表示非表示を切り替える事ができる
                isOpen={openSignup}
                // モーダル以外の場所をクリックした際にモーダルを閉じる定義をしている（もしかしたらいらないかもしれない）
                onRequestClose={async () => {
                    await dispatch(setCloseSignup());
                }}
                style={customStyles}
            >
                <Formik
                    // 初期状態でのエラーのstateを定義する事ができる
                    initialErrors={{ email: "required" }}
                    initialValues={{ email: "", password: "" }}

                    // 登録ボタンが押された時の処理
                    // Formikではvaluesに入力された値(email,password)をObjectの形で格納できる
                    onSubmit={async (values) => {

                        //処理開始の合図としてローディングアイコンを表示させる
                        await dispatch(fetchCredStart());

                        // 入力された値をfetchAsyncRegisterの引数に渡してdispatch経由で非同期関数に渡して実行し、
                        // 帰ってきた値をresuleRegisterに代入している
                        const resuleRegister = await dispatch(fetchAsyncRegister(values));

                        // User新規登録が正常に完了した際の処理を記述
                        if (fetchAsyncRegister.fulfilled.match(resuleRegister)) {

                            // アクセストークンを取得する（また、extraReducerの後処理でlocalStorageにJWTを格納する）
                            await dispatch(fetchAsyncLogin(values));

                            // Profileをデフォルトで"モブキャラ"という名前で登録する
                            // ちなみにUserとProfileは結びついているが違うTableであることに注意
                            await dispatch(fetchAsyncCreateProf({ nickName: "モブキャラ"}));

                            // プロフィールの一覧を取得する
                            await dispatch(fetchAsyncGetProfs());

                            await dispatch(fetchAsyncGetReviews());
                            await dispatch(fetchAsyncGetComments());

                            // 自分のプロフィールを取得する
                            await dispatch(fetchAsyncGetMyProf());
                        }
                        // 処理が終了した合図としてローディングアイコンをしまう
                        await dispatch(fetchCredEnd());

                        // 新規登録のモーダルを閉じる
                        await dispatch(setCloseSignup());
                    }}
                    //バリデーションの設定
                    validationSchema={Yup.object().shape({
                        email: Yup.string()
                            .email("emailのフォーマットが間違っています")
                            .required("emailを入力してください"),
                        password: Yup.string()
                            .required("passwordを入力してください")
                            .min(4, "4文字以上で入力してください"),
                    })}
                >
                    {/* Formikの入力 */}
                    {({
                        handleSubmit, handleChange, handleBlur,
                        // 入力された値, エラー内容, 
                        // 入力フォームにフォーカスが当たった場合Trueとなる,
                        // バリデーションが問題なかった場合Trueを返す
                        values, errors, touched, isValid,
                    }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                    <h1 className={styles.auth_title}>FSComics</h1>
                                    <br />
                                    <div className={styles.auth_progress}>
                                        {/* fetchでデータを取得している時にローディングアイコンを表示させるTrueの時だけ */}
                                        { isLoadingAuth && <CircularProgress />}
                                    </div>
                                    <br />
                                    <TextField 
                                        placeholder="email"
                                        type="input"
                                        name="email"
                                        //入力したり削除をしたり変化を与えた時にバリデーションを走らせる
                                        onChange={handleChange}
                                        //formからフォーカスが外れた時にバリデーションの検証を走らせる
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    <br />
                                    {/* エラーメッセージの表示 */}
                                    { touched.email && errors.email ? (
                                        <div className={styles.auth_error}>{errors.email}</div>
                                    ) : null }
                                    <TextField 
                                        placeholder="password"
                                        type="password"
                                        name="password"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.password}
                                    />
                                    { touched.password && errors.password ? (
                                        <div className={styles.auth_error}>{errors.password}</div>
                                    ) : null }
                                    <br />
                                    <br />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!isValid}
                                        type="submit"
                                    >
                                        登録
                                    </Button>
                                    <br />
                                    <br />
                                    <span
                                        className={styles.auth_text}
                                        // 新規登録とログインのモーダルを入れ替える
                                        onClick={async () => {
                                            await dispatch(setOpenLogin());
                                            await dispatch(setCloseSignup());
                                        }}
                                    >
                                        ログインはこちらから！
                                    </span>
                                </div>
                            </form>
                        </div>
                    )}
                </Formik>
            </Modal>
            <Modal
                isOpen={openLogin}
                onRequestClose={async () => {
                    await dispatch(setCloseLogin());
                }}
                style={customStyles}
            >
                <Formik
                    initialErrors={{ email: "required" }}
                    initialValues={{ email: "", password: "" }}
                    onSubmit={async (values) => {
                        await dispatch(fetchCredStart());
                        const result = await dispatch(fetchAsyncLogin(values));
                        if (fetchAsyncLogin.fulfilled.match(result)) {
                            await dispatch(fetchAsyncGetProfs());

                            await dispatch(fetchAsyncGetReviews());
                            await dispatch(fetchAsyncGetComments());

                            await dispatch(fetchAsyncGetMyProf());
                        }
                        await dispatch(fetchCredEnd());
                        await dispatch(setCloseLogin());
                    }}
                    validationSchema={Yup.object().shape({
                        email: Yup.string()
                            .email("emailのフォーマットが間違っています")
                            .required("emailを入力してください"),
                        password: Yup.string()
                            .required("passwordを入力してください")
                            .min(4, "4文字以上で入力してください"),
                    })}
                >
                    {({
                        handleSubmit, handleChange, handleBlur,
                        values, errors, touched, isValid,
                    }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                    <h1 className={styles.auth_title}>FSComics</h1>
                                    <br />
                                    <div className={styles.auth_progress}>
                                        { isLoadingAuth && <CircularProgress />}
                                    </div>
                                    <br />
                                    <TextField 
                                        placeholder="email"
                                        type="input"
                                        name="email"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    <br />
                                    { touched.email && errors.email ? (
                                        <div className={styles.auth_error}>{errors.email}</div>
                                    ) : null }
                                    <TextField 
                                        placeholder="password"
                                        type="password"
                                        name="password"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.password}
                                    />
                                    { touched.password && errors.password ? (
                                        <div className={styles.auth_error}>{errors.password}</div>
                                    ) : null }
                                    <br />
                                    <br />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!isValid}
                                        type="submit"
                                    >
                                        ログイン
                                    </Button>
                                    <br />
                                    <br />
                                    <span
                                        className={styles.auth_text}
                                        onClick={async () => {
                                            await dispatch(setOpenSignup());
                                            await dispatch(setCloseLogin());
                                        }}
                                    >
                                        新規登録はこちらから！
                                    </span>
                                </div>
                            </form>
                        </div>
                    )}
                </Formik>
            </Modal>
        </>
    )
}

export default Auth
