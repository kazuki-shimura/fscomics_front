import React, { useState } from 'react';
import styles from './Review.module.css';

import { makeStyles } from '@material-ui/core/styles';
import { Avatar, Divider, Checkbox } from "@material-ui/core";
import { Favorite, FavoriteBorder } from '@material-ui/icons';

import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';

import { selectProfiles } from '../auth/authSlice';

import {
    selectComments,
    fetchReviewStart, fetchReviewEnd,
    fetchAsyncNewComment, fetchAsyncPatchLiked,
} from './reviewSlice';

import { PROPS_REVIEW } from '../types';

const useStyles = makeStyles((theme) => ({
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginRight: theme.spacing(1),
    },
}))

const Review: React.FC<PROPS_REVIEW> = ({
    reviewId, title, bookName, content, loginId, userReview, imageUrl, likedUser,
}) => {
    const classes = useStyles();
    const dispatch: AppDispatch = useDispatch();
    const profiles = useSelector(selectProfiles);
    const comments = useSelector(selectComments);
    const [text, setText] = useState("");

    const commentsOnReview = comments.filter((com) => {
        return com.review === reviewId;
    })

    const prof = profiles.filter((prof) => {
        return prof.userProfile === userReview;
    })

    const reviewComment = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const packet = { text: text, review: reviewId };
        await dispatch(fetchReviewStart());
        await dispatch(fetchAsyncNewComment(packet));
        await dispatch(fetchReviewEnd());
        setText("");
    }

    const handlerLiked = async() => {
        const packet = {
            id: reviewId,
            title: title,
            bookName: bookName,
            content: content,
            current: likedUser,
            new: loginId,
        }
        await dispatch(fetchReviewStart());
        await dispatch(fetchAsyncPatchLiked(packet));
        await dispatch(fetchReviewEnd());
    };


    if (title) {
        return (
            <div className={styles.review}>
                <div className={styles.review_header}>
                    <Avatar className={styles.review_avatar} src={prof[0]?.avatar} />
                    <h3>{prof[0]?.nickName}</h3>
                </div>
                <div>
                    {title}
                </div>
                <Divider />
                <img className={styles.review_image} src={imageUrl} alt="" />
                <h4 className={styles.review_text}>
                    <Checkbox 
                        className={styles.review_checkBox}
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite />}
                        checked={likedUser.some((like) => like === loginId)}
                        onChange={handlerLiked}
                    />
                    <strong> {prof[0]?.nickName} </strong> 
                    <AvatarGroup max={7}>
                        {likedUser.map((like) => (
                            <Avatar
                                className={styles.review_avatarGroup}
                                key={like}
                                src={profiles.find((prof) => prof.userProfile === like)?.avatar}
                            />
                        ))}
                    </AvatarGroup>
                    <Divider />
                    <br />
                    <div>
                        漫画名：{bookName}
                        <br />
                        <br />
                        {content}
                    </div>
                </h4>
                <Divider />

                {/* コメントしたユーザーを表示する   OK */}
                <div className={styles.review_comments}>
                    コメント一覧
                    <br />
                    <br />
                    {commentsOnReview.map((comment) => (
                        <div key={comment.id} className={styles.review_comment}>
                            <Avatar src={
                                profiles.find((prof) => prof.userProfile === comment.userComment)?.avatar}
                                className={classes.small}
                            />
                            <p>
                                <strong className={styles.review_strong}>
                                    {
                                        profiles.find((prof) => prof.userProfile === comment.userComment)?.nickName
                                    }
                                </strong>
                                {comment.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* レビューに対してのコメントをする場所   OK */}
                <form className={styles.review_commentBox}>
                    <input
                        className={styles.review_input}
                        type="text"
                        placeholder="add a comment"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button
                        disabled={!text.length}
                        className={styles.review_button}
                        type="submit"
                        onClick={reviewComment}
                    >
                        Post
                    </button>
                </form>
            </div>
        );
    }
    return null;
}

export default Review;
