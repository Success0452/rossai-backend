import { NextFunction, Request, Response } from "express";
import {customResponse} from "../functions/controllers";
import {StatusCodes} from "http-status-codes";

export const getMyProfile = async (req: Request, res: Response) => {
    const user = req.headers;
    customResponse(res, StatusCodes.OK, 'profile fetched', user);
}

