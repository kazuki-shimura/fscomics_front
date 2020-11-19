import React, { useEffect } from 'react';
import Auth from '../auth/Auth';
import Review from '../review/Review';

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles } from "@material-ui/core/styles";
import { Button, Grid, Avatar, Badge, CircularProgress } from "@material-ui/core"
//カメラマークの絵文字なのであとでレビューように変えておく必要がある
import { MdAddAPhoto } from "react-icons/md";

import {
    editNickName, selectProfile, selectIsLoadingAuth,
    setOpenLogin, setCloseLogin, 
    setOpenSignup, setCloseSignup, 
    setOpenProfile, setCloseProfile,
    fetchAsyncGetMyProf, fetchAsyncGetProfs, selectOpenProfile,
} from "../auth/authSlice";

import {
    selectReviews, 
    selectIsLoadingReview,
    setOpenNewReview, setCloseNewReview,
    fetchAsyncGetReviews, fetchAsyncGetComments
} from "../review/reviewSlice";


const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }))(Badge);
  

const Core: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const profile = useSelector(selectProfile);
    const reviews = useSelector(selectReviews);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    const isLoadingReview = useSelector(selectIsLoadingReview);

    // ブラウザが起動した際に処理するuseEffectを記載
    useEffect(() => {
        const fetchBootLoader = async () => {
            if (localStorage.localJWT) {
                dispatch(setCloseLogin());
                const result = await dispatch(fetchAsyncGetMyProf());
                if (fetchAsyncGetMyProf.rejected.match(result)) {
                    dispatch(setOpenLogin());
                    return null;
                }
                await dispatch(fetchAsyncGetReviews());
                await dispatch(fetchAsyncGetProfs());
                await dispatch(fetchAsyncGetComments());
            }
        };
        fetchBootLoader();
    }, [dispatch]);

    return (
        <div>
            <Auth />
            <div className={styles.core_header}>
                <h1 className={styles.core_title}>FSComics</h1>
                {
                    //三項演算子
                    profile?.nickName ?
                    (
                        <>
                            <button
                                className={styles.core_btnModal}
                                onClick={() => {
                                    dispatch(setOpenNewReview());
                                    dispatch(setCloseProfile());
                                }}
                            >
                                <MdAddAPhoto />
                            </button>
                            <div className={styles.core_logout}>
                                {( isLoadingReview || isLoadingAuth ) && <CircularProgress />}
                                <Button
                                    onClick={() => {
                                        localStorage.removeItem("localJWT");
                                        dispatch(editNickName(""));
                                        dispatch(setCloseProfile());
                                        dispatch(setCloseNewReview());
                                        dispatch(setOpenLogin());
                                    }}
                                >
                                    ログアウト
                                </Button>
                                <button
                                    className={styles.core_btnModal}
                                    onClick={() => {
                                        dispatch(setOpenProfile());
                                        dispatch(setCloseNewReview());
                                    }}
                                >
                                    <StyledBadge
                                        overlap="circle"
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        variant="dot"
                                    >
                                        <Avatar alt="who" src={profile.avatar} />{" "}
                                    </StyledBadge>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <Button
                                onClick={() => {
                                    dispatch(setOpenLogin());
                                    dispatch(setCloseSignup());
                                }}
                            >
                                ログイン
                            </Button>
                            <Button
                                onClick={() => {
                                    dispatch(setOpenSignup());
                                    dispatch(setCloseLogin());
                                }}
                            >
                                新規登録
                            </Button>
                        </div>
                    )
                }
            </div>
            {/* ログインしている人だけ見れるようにプロフィールのnickName属性を取ってきて
            この属性が存在すれば表示するようにする */}
            {
                profile?.nickName && (
                    <>
                        <div className={styles.core_reviews}>
                            <Grid container spacing={4}>
                                {
                                    reviews.slice(0).reverse().map((review) => (
                                        <Grid key={review.id} item xs={12} md={4}>
                                            <Review
                                                reviewId={review.id}
                                                title={review.title}
                                                bookName={review.bookName}
                                                content={review.content}
                                                loginId={profile.userProfile}
                                                userReview={review.userReview}
                                                imageUrl={review.img}
                                                likedUser={review.likedUser}
                                            />
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default Core;