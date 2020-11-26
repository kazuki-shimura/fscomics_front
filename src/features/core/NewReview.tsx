import React, { useState } from 'react';
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import styles from "./Core.module.css";
import { File } from "../types";

import {
    selectOpenNewReview, setCloseNewReview,
    fetchReviewStart, fetchReviewEnd, fetchAsyncNewReview,
} from "../review/reviewSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import RateReviewIcon from '@material-ui/icons/RateReview';


const customStyles = {
    content: {
        top: "55%",
        left: "50%",
        width: 280,
        height: 430,
        padding: "50px",
        transform: "translate(-50%, -50%)",
    },
};

const NewReview: React.FC = () => {

    const dispatch: AppDispatch = useDispatch();
    const openNewPost = useSelector(selectOpenNewReview);

    const [title, setTitle] = useState("");
    const [bookName, setBookName] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handlerEditPicture = () => {
        const fileInput = document.getElementById("imageInput");
        fileInput?.click();
    };

    const newReview = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const packet = {
            title: title,
            bookName: bookName,
            content: content,
            img: image,
        };
        await dispatch(fetchReviewStart());
        await dispatch(fetchAsyncNewReview(packet));
        await dispatch(fetchReviewEnd());
        setTitle("");
        setBookName("");
        setContent("");
        setImage(null);
        dispatch(setCloseNewReview());
    };


    return (
        <>
            <Modal
                isOpen={openNewPost}
                onRequestClose={async () => {
                    await dispatch(setCloseNewReview());
                }}
                style={customStyles}
            >
                <form className={styles.core_signUp}>
                    <h1 className={styles.core_title}>FSComics</h1>
                    <h1 className={styles.core_title}>新規レビュー</h1>

                    <br />
                    <TextField
                        placeholder="レビュータイトル"
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <br />
                    <TextField
                        placeholder="レビューする本"
                        type="text"
                        onChange={(e) => setBookName(e.target.value)}
                    />

                    <br />
                    <TextField
                        placeholder="レビュー内容"
                        type="text"
                        multiline
                        rows={4}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <input
                        type="file"
                        id="imageInput"
                        hidden={true}
                        onChange={(e) => setImage(e.target.files![0])}
                    />

                    <br />
                    <IconButton onClick={handlerEditPicture}>
                        <RateReviewIcon />
                    </IconButton>

                    <br />
                    <Button
                        disabled={!title || !bookName || !content}
                        variant="contained"
                        color="primary"
                        onClick={newReview}
                    >
                        review
                    </Button>
                </form>
            </Modal>
        </>
    )
}

export default NewReview
