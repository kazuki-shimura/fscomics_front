import React, { useState } from 'react';
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
    editNickName,
    selectProfile, selectOpenProfile, setCloseProfile, 
    fetchCredStart, fetchCredEnd, fetchAsyncUpdateProf,
} from "../auth/authSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

const customStyles = {
    content: {
        top: "55%",
        left: "50%",
        width: 280,
        height: 220,
        padding: "50px",
        transform: "translate(-50%, -50%)",
    }
}

const EditProfile: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const openProfile = useSelector(selectOpenProfile);
    const profile = useSelector(selectProfile);
    const [image, setImage] = useState<File | null>(null);

    const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const packet = { id: profile.id, nickName: profile.nickName, avatar: image};
        
        await dispatch(fetchCredStart());
        await dispatch(fetchAsyncUpdateProf(packet));
        await dispatch(fetchCredEnd());
        await dispatch(setCloseProfile());
    };

    const handlerEditPicture = () => {
        const fileInput = document.getElementById("imageInput");
        fileInput?.click();
    }


    return (
        <>
            <Modal
                isOpen={openProfile}
                onRequestClose={async () => {
                    await dispatch(setCloseProfile());
                }}
                style={customStyles}
            >
                <form className={styles.core_signUp}>
                    <h1 className={styles.core_title}>FSComics</h1>

                    <br />
                    <TextField
                        placeholder="ニックネーム"
                        type="text"
                        value={profile?.nickName}
                        onChange={(e) => dispatch(editNickName(e.target.value))}
                    />

                    <input
                        type="file"
                        id="imageInput"
                        hidden={true}
                        onChange={(e) => setImage(e.target.files![0])}
                    />
                    <br />
                    <IconButton onClick={handlerEditPicture}>
                        <MdAddAPhoto />
                    </IconButton>
                    <br />
                    <Button
                        disabled={!profile?.nickName}
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={updateProfile}
                    >
                        Update
                    </Button>
                </form>


            </Modal>
        </>
    )
}

export default EditProfile
