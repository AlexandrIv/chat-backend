import bodyParser from "body-parser";
import express from "express";
import * as socket from "socket.io";

import { loginValidation, registerValidation } from "../utils/validations";
import { checkAuth, updateLastSeen } from "../middlewares";
import multer from './multer';
import { UserCtrl, DialogCtrl, MessageCtrl, UploadFileCtrl } from "../controllers";

// TODO: Сделать так чтобы контроллеры знали о существовании сокетов и могли с ними работать отдельно.

const createRoutes = (app: express.Express, io: socket.Server) => {
    const UserController = new UserCtrl(io);
    const DialogController = new DialogCtrl(io);
    const MessageController = new MessageCtrl(io);
    const UploadFileController = new UploadFileCtrl();

    app.use(bodyParser.json());
    app.use(checkAuth);
    app.use(updateLastSeen);

    // User CRUD
    app.get('/user/me', UserController.getMe);
    app.get('/user/verify', UserController.verify);
    app.post('/user/signup', registerValidation, UserController.create);
    app.post('/user/signin', loginValidation, UserController.login);
    app.get('/user/find', UserController.findUsers);
    app.get('/user/:id', UserController.show);
    app.delete('/user/:id', UserController.delete);

    // Dialog CRUD
    app.get('/dialogs', DialogController.index);
    app.delete('/dialogs/:id', DialogController.delete);
    app.post('/dialogs', DialogController.create);

    // Messages CRUD
    app.get('/messages', MessageController.index);
    app.delete('/messages', MessageController.delete);
    app.post('/messages', MessageController.create);

    // Files CRUD
    app.post('/files', multer.single('file'), UploadFileController.create);
    app.delete('/files', UploadFileController.delete);
};

export default createRoutes;
