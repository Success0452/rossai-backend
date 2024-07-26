import {userModel} from "../database/models/user.model";
import {NextFunction, Request, Response} from "express";
import {compare, genSalt, hash} from 'bcryptjs';
import { sign, verify, decode } from 'jsonwebtoken';
import {StatusCodes} from "http-status-codes";

export const checkExistingUser = async (email:string): Promise<boolean> => {
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return false;
    }else {
        return true;
    }
}

export const customResponse = (res:Response, status:number, message:string, data?:any) => {
    return res.status(status).json({
        message: message,
        statusCode: status,
        data:data,
    })
}

export const hashPassword = async(password:string) => {
    const salt = await genSalt(10);
    return hash(password, salt);
}

export const comparePassword = async(password:string, hashed:string) => {
    return await compare(password, hashed);
}

export const generateToken = (id:string) => {
    return sign(id, process.env.JWT_SECRET!, {expiresIn: '30D'});
}

export const verifyToken = async(req: Request, res: Response, next: NextFunction) => {
    let token:string;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        customResponse(res, StatusCodes.BAD_REQUEST, 'Invalid authorization format')
    }

    token = auth!.split(" ")[1];

    const decode = verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.headers = await userModel.findById(decode.id).select("-password");

    next();
}
