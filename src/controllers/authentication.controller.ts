import { NextFunction, Request, Response } from "express";
import {StatusCodes} from "http-status-codes";
import {
    checkExistingUser,
    hashPassword,
    customResponse,
    comparePassword,
    generateToken
} from "../functions/controllers";
import {userModel} from "../database/models/user.model";
import {sendMail} from "../config/mailer";

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
    const {firstName, lastName, email, phoneNumber, country, password} = req.body;

    const missingFields:string[] = [];

    if (!email) missingFields.push("email");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!phoneNumber) missingFields.push("phoneNumber");
    if (!country) missingFields.push("country");
    if (!password) missingFields.push("password");

    if(missingFields.length > 0) {
        customResponse(res, StatusCodes.BAD_REQUEST, `Please enter a valid ${missingFields.join(',')}`);
      return;
    }

    if(await checkExistingUser(email)){
        customResponse(res, StatusCodes.BAD_REQUEST, 'email already a user');
        return;
    }

    await userModel.create({
        email,
        firstName,
        lastName,
        phoneNumber,
        country,
        password: hashPassword(password)
    }).then((result:any) => {
        sendMail(email, 'Account Creation', `Account Created Successfully`);
        customResponse(res, StatusCodes.CREATED, 'account created successfully');
    }).catch((err:any) => {
        console.error(err);
        customResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, `internal server error ${err.message}`);
    })
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {email, password} = req.body;

        const missingFields:string[] = [];

        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");

        if(missingFields.length > 0) {
            customResponse(res, StatusCodes.BAD_REQUEST, `Please enter a valid ${missingFields.join(',')} field`);
            return;
        }

        const user = await userModel.findOne({ email: email });

        if(!user) {
            customResponse(res, StatusCodes.NOT_FOUND, `email is not yet a user`);
            return;
        }

        if(await comparePassword(password, user.password)){
            customResponse(res, StatusCodes.BAD_REQUEST, 'incorrect password');
            return;
        }

        customResponse(res, StatusCodes.OK, 'login successfully', {token: generateToken(user.id), id: user.id});
    }catch (err:any) {
        console.error(err);
        customResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, `internal server error ${err.message}`);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {email} = req.body;

        const missingFields:string[] = [];

        if (!email) missingFields.push("email");

        if(missingFields.length > 0) {
            customResponse(res, StatusCodes.BAD_REQUEST, `Please enter a valid ${missingFields.join(',')} field`);
            return;
        }

        const user = await userModel.findOne({ email: email });

        if(!user) {
            customResponse(res, StatusCodes.NOT_FOUND, `email is not yet a user`);
            return;
        }

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        user.otp = otp;

        await user.save().then(() => {
            sendMail(email, 'Forgot Password Request', `Please use this otp to change your password ${otp}`);
        });

        customResponse(res, StatusCodes.OK, 'reset email sent successfully');
    }catch(err:any){
        console.error(err);
        customResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, `internal server error ${err.message}`);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
   try{
       const {otp, password, confirmPassword} = req.body;

       const missingFields:string[] = [];

       if (!otp) missingFields.push("otp");
       if (!password) missingFields.push("password");
       if (!confirmPassword) missingFields.push("confirmPassword");

       if(missingFields.length > 0) {
           customResponse(res, StatusCodes.BAD_REQUEST, `Please enter a valid ${missingFields.join(',')} field`);
           return;
       }

       if(password !== confirmPassword) {
           customResponse(res, StatusCodes.BAD_REQUEST, `passwords do not match`);
           return;
       }

       const user = await userModel.findOne({ otp: otp });

       if(!user) {
           customResponse(res, StatusCodes.NOT_FOUND, `otp does not exist`);
           return;
       }

       user.password = await hashPassword(password);

       await user.save();

       customResponse(res, StatusCodes.OK, 'password replaced successfully');

   }catch (err:any) {
       console.error(err);
       customResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, `internal server error ${err.message}`);
   }
}
