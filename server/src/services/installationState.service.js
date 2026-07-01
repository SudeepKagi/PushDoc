import crypto from "crypto";
import InstallationState from "../models/installationState.model.js";

export const createState = async (userId) => {

    const state = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await InstallationState.create({
        state,
        user: userId,
        expiresAt,
    });

    return state;
};

export const getState = async (state) => {

    return await InstallationState.findOne({
        state,
    }).populate("user");

};

export const deleteState = async (state) => {

    await InstallationState.deleteOne({
        state,
    });

};