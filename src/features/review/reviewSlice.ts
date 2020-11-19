import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from "axios";
import { PROPS_NEWREVIEW, PROPS_LIKED, PROPS_COMMENT } from '../types';

// Djangoで作成したApiエンドポイントのURLを定数で定義
// Reactの環境変数に格納(.envファイルに記載)
// process.env.と記載することで環境変数を取得する事ができる
const apiUrlReview = `${process.env.REACT_APP_DEV_API_URL}api/review/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;


//　レビューの一覧を取得する非同期関数
export const fetchAsyncGetReviews = createAsyncThunk (
    "review/get",
    async () => {
        //　成功するとresにレビューの一覧が入ってくる
        const res = await axios.get(apiUrlReview, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);

//　新規レビューをする非同期関数
export const fetchAsyncNewReview = createAsyncThunk (
    "review/post",
    // 入力された値をnewReviewとして受け取る引数を定義する
    async (newReview: PROPS_NEWREVIEW) => {
        const reviewData = new FormData();
        reviewData.append("title", newReview.title);
        reviewData.append("bookName", newReview.bookName);
        reviewData.append("content", newReview.content);
        // 新規レビューにimgがある場合だけreviewDataに追加する
        newReview.img && reviewData.append("img", newReview.img, newReview.img.name);
        const res = await axios.post(apiUrlReview, reviewData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);

// Reviewの中のlikedUserの値を変更する為の非同期関数
export const fetchAsyncPatchLiked = createAsyncThunk (
    "review/patch",
    async (liked: PROPS_LIKED) => {
        const currentLiked = liked.current;
        const likedData = new FormData();

        // いいねを解除したりいいねをする為に使用する変数
        // falseの時はいいねしたUserを足す、trueの時はいいねしたUserを外す
        let isOverlapped = false;

        currentLiked.forEach((current) => {
            // いいねしているUserを一人ずつ比べて同じIdを持つ人がいる場合、
            // 既にその人はいいねを押している人なのでいいねボタンを外す処理を行う
            if (current === liked.id) {
                isOverlapped = true;
            // いいねしているUserを一人ずつ比べて同じIdを持つ人がいない場合、
            // いいねをしているユーザーの中にいいねをしたUserを加える処理を行う
            } else {
                likedData.append("liked", String(current))
            }
        });

        // isOverlappedがfalseの時(まだいいねしていない時)
        // そのままいいねしたUserを加える
        if (!isOverlapped) {
            likedData.append("liked", String(liked.new));
        // isOverlappedがtrueの時(既にいいねしていていいねしているUserが１人の時)
        // （いいねUserが自分一人の時にいいねを押す（解除する）といいねしているUserがいなくなる）
        } else if (currentLiked.length === 1) {
            likedData.append("title", liked.title);
            const res = await axios.put(`${apiUrlReview}${liked.id}/`, likedData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `JWT ${localStorage.localJWT}`,
                },
            });
            return res.data;
        }
        // isOverlappedがtrueの時いいねしたUserをいいねUserからはずす
        const res = await axios.patch(`${apiUrlReview}${liked.id}`, likedData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);

// Commentの一覧を取得する非同期関数
export const fetchAsyncGetComments = createAsyncThunk (
    "comment/get",
    async () => {
        const res = await axios.get(apiUrlComment, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);

// Commentを新規作成する非同期関数
export const fetchAsyncNewComment = createAsyncThunk (
    "comment/post",
    async (comment: PROPS_COMMENT) => {
        const res = await axios.post(apiUrlComment, comment, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`,
            },
        });
        return res.data;
    }
);

export const reviewSlice = createSlice({
  name: 'review',
  initialState: {
        // T/FでApiとの接続最中にローディングをするstate
        isLoadingReview: false,
        // 新規レビューをする際にモーダルの開閉を行うstate
        openNewReview: false,
        // Djangoで作成したApiのReviewモデルに対応するようにしている
        reviews: [
            {
                id: 0,
                title: "",
                bookName: "",
                content: "",
                userReview: 0,
                createdAt: "",
                img: "",
                likedUser: [0],
            },
        ],
        // Djangoで作成したApiのCommentモデルに対応するようにしている
        comments: [
            {
                id: 0,
                text: "",
                userComment: 0,
                review: 0,
            },
        ],
    },
    reducers: {
        // Apiと通信をしている間ローディングアイコンの表示非表示のstateを変更するアクション
        fetchReviewStart(state) {
            state.isLoadingReview = true;
        },
        fetchReviewEnd(state) {
            state.isLoadingReview = false;
        },
        // 新規レビューのモーダルの表示非表示を変更するアクション
        setOpenNewReview(state) {
            state.openNewReview = true;
        },
        setCloseNewReview(state) {
            state.openNewReview = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAsyncGetReviews.fulfilled, (state, action) => {
            return {
                ...state, 
                reviews: action.payload,
            };
        });
        builder.addCase(fetchAsyncNewReview.fulfilled, (state, action) => {
            return {
                ...state, 
                reviews: [...state.reviews, action.payload],
            };
        });
        builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
            return {
                ...state,
                comments: action.payload,
            };
        });
        builder.addCase(fetchAsyncNewComment.fulfilled, (state, action) => {
            return {
                ...state,
                comments: [...state.comments, action.payload],
            };
        });
        builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
            return {
                ...state,
                reviews: state.reviews.map((review) => 
                    review.id === action.payload.id ? action.payload : review
                )
            }
        })
    },
});

//Reducerで定義したacrionをReactで使えるよにexportする
export const { 
    fetchReviewStart, fetchReviewEnd,
    setOpenNewReview, setCloseNewReview,
} = reviewSlice.actions;

//reviewはstoreのなかに定義したもの
//定義したstateを外でも使えるようにしておく
export const selectIsLoadingReview = (state: RootState) => state.review.isLoadingReview;
export const selectOpenNewReview = (state: RootState) => state.review.openNewReview;
export const selectReviews = (state: RootState) => state.review.reviews;
export const selectComments = (state: RootState) => state.review.comments;

export default reviewSlice.reducer;


// ①　createAsyncThunkは非同期関数を作成するもの
// ②　import { } from '../types'; はデータ型を使用するためにimportする