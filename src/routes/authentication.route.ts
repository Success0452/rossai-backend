import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import {
    login,
    createAccount,
    forgotPassword,
    resetPassword
} from "../controllers/authentication.controller";

class AuthenticationRoute implements Route {
    public path: string = "/account"
    public router: Router = Router()

    constructor(){
        this.initializeRoutes()
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/register`, createAccount);
        this.router.post(`${this.path}/login`, login);
        this.router.post(`${this.path}/forget-password`, forgotPassword);
        this.router.post(`${this.path}/reset-password`, resetPassword);
    }
}

export default AuthenticationRoute
