
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

