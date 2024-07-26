import cors from 'cors';
import "express-async-errors";
import express, { Application, Request } from "express";
import { PORT } from './config';
import { Route } from './interfaces/route.interface';
import morganMiddleware from './middlewares/morgan.middleware';
import { logger } from './utils/logger';
import ErrorMiddleWare from './middlewares/error.middleware';
import expressListRoutes from "express-list-routes";
import { Server as IOServer } from 'socket.io';
import http from "http";
import { triggerStreamRequest } from "./controllers/stream.controller";
import path from "path";

export default class App {

    public app: Application;
    public port: string | number;
    private io: IOServer;
    private readonly server: http.Server;

    constructor(routes: Route[]) {
        this.app = express();
        this.port = PORT || 4000;
        this.server = http.createServer(this.app);
        this.io = new IOServer(this.server, {
            cors: {
                origin: '*',
            },
        });
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeSocketIo();
        this.listRoutes();
        this.initializeErrorHandling();
    }

    public listen(): void {
        this.server.listen(this.port, () => {
            logger.info(`📡 [server]: Server is running @ http://localhost:${this.port}`);
        });
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors<Request>());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morganMiddleware);
    }

    private initializeRoutes(routes: Route[]): void {
        routes.forEach(route => {
            this.app.use("/api/v1", route.router);
            this.app.get('/', (req, res) => {
                res.sendFile(path.join(process.cwd(), 'documentation.html'));
            });
            this.app.get('/privacy-policy', (req, res) => {
                res.sendFile(path.join(process.cwd(), 'privacy.html'));
            });
        });
    }

    private initializeErrorHandling() {
        this.app.use(ErrorMiddleWare.handleErrors);
    }

    private websocket(): void {
        this.io.on('connection', (socket) => {
            console.log('connected');
            socket.on('data', async (data) => {
                if (data?.data) {
                    await triggerStreamRequest(data?.data, socket);
                }
            });

            socket.on('disconnect', () => {
                console.log('disconnected');
            });
        });
    }

    private initializeSocketIo() {
        this.websocket();
    }

    private listRoutes() {
        expressListRoutes(
            this.app,
            {
                logger: ((method, space, path) => logger.info(`🚏 [Routes]: ${method}  ${path}`))
            }
        );
    }
}
