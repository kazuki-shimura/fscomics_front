
// ファイルオブジェクトを使用する際、元々持っているデータ型があるので定義しておく
export interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
}



// ーーーーーーauthSlice.tsで使用するデータ型ーーーーーーー

// ログインする時に使用するemail/passwordの値
export interface PROPS_AUTHEN {
    email: string;
    password: string;
}

// Profileに関するデータ型　(avatarは使用しない場合もあるのでTypescript
// のユニオンタイプを使用してnull型も許容しておくこと)
export interface PROPS_PROFILE {
    id: number;
    nickName: string;
    avatar: File | null;
}

// nickNameに特化したデータ型
export interface PROPS_NICKNAME {
    nickName: string;
}


// ーーーーーーreviewSlice.tsで使用するデータ型ーーーーーーー

// 新規レビューをする時に使用するデータ型
export interface PROPS_NEWREVIEW {
    title: string;
    bookName: string;
    content: string;
    img: File | null;
}

// いいねボタンを押した際に使用するデータ型
// currentは現在いいねを押しているUserIdを格納して、newはいいねボタンを押したUserId
export interface PROPS_LIKED {
    id: number;
    title: string;
    current: number[];
    new: number;
}

// コメント投稿する時のデータ型(reviewはどのReviewにコメントしたか)
export interface PROPS_COMMENT {
    text: string;
    review: number;
}


// ーーーーーーReview.tsxで使用するデータ型ーーーーーーー
export interface PROPS_REVIEW {
    reviewId: number;
    LoginId: number;
    userReview: number;
    title: string;
    bookName: string;
    content: string;
    imageURL: string | null;
    likedUser: number[];
}

