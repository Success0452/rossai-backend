import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import {triggerRequest} from "../controllers/ai.controller";

class AiRoute implements Route {
    public path: string = "/ai"
    public router: Router = Router()

    constructor(){
        this.initializeRoutes()
    }

    private initializeRoutes(){
        this.router.post(`${this.path}/trigger`, triggerRequest);
    }
}

export default AiRoute
