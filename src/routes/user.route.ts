import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import {
    getMyProfile
} from "../controllers/user.controller";
import {verifyToken} from "../functions/controllers";

class AuthenticationRoute implements Route {
    public path: string = "/account"
    public router: Router = Router()

    constructor(){
        this.initializeRoutes()
    }

    private initializeRoutes(){
        this.router.route(`${this.path}/register`).post(verifyToken, getMyProfile);
    }
}

export default AuthenticationRoute
