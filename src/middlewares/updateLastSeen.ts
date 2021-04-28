import express, {NextFunction} from "express";
import { UserModel } from "../Models";

export default (req: any, __: express.Response, next: NextFunction) => {
    if (req.user) {
        UserModel.findOneAndUpdate(
          { _id: req.user.id },
          {last_seen: new Date()},
          {new: true},
          () => {
          }
        );
    }
    next();
};
