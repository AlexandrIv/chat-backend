import express from "express";
import * as socket from "socket.io";

import { MessageModel, DialogModel } from "../Models";

class MessageController {
    public io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io;
    }

    updateReadStatus = (res: express.Response, userId: string, dialogId: any): void => {
        MessageModel.updateMany(
          { dialog: dialogId, user: {$ne: userId} },
          { $set: { read: true } },
          (err: any) => {
              if(err) {
                  return res.status(500).json({
                      status: "error",
                      message: err
                  });
              }
          });
    }

    index = (req: any, res: express.Response) => {
        const dialogId: any = req.query.dialog;
        const userId = req.user._id;

        this.updateReadStatus(res, userId, dialogId);

        MessageModel
            .find({dialog: dialogId })
            .populate(['dialog', 'user', 'attachments'])
            .exec((err: any, messages: any) => {
                if(err) {
                    return res.status(404).json({
                        status: "error",
                        message: "Messages not found"
                    });
                }
                return res.json(messages);
        });
    }

    create = (req: any, res: express.Response) => {
        const userId: string = req.user._id;

        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            user: userId,
            attachments: req.body.attachments
        };

        const message = new MessageModel(postData);

        message
          .save()
          .then((obj: any) => {
              obj.populate(['dialog', 'user', 'attachments'], (err: any, message: any) => {
                  if(err) {
                      return res.status(500).json({
                          status: 'error',
                          message: err
                      });
                  }

                  DialogModel.findOneAndUpdate(
                    {_id: postData.dialog},
                    {lastMessage: message._id},
                    {upsert: true},
                    (err) => {
                        if(err) {
                            return res.status(500).json({
                                status: 'error',
                                message: err
                            });
                        }
                    }
                  );

                  res.json(message);

                  this.io.emit('SERVER:NEW_MESSAGE', message);
              })
          })
          .catch(reason => {
              res.json(reason);
          });
    }

    delete = (req: any, res: express.Response) => {
        const id: string = req.query.id;
        const userId: string = req.user._id;

        MessageModel.findById(id, (err, message: any) => {
            if(err || !message) {
                return res.status(404).json({
                    status: "error",
                    message: "Message not found"
                });
            }
            if(message.user.toString() === userId) {
                const dialogId = message.dialog;
                message.remove();
                MessageModel.findOne({dialog: dialogId}, {}, {sort: {'created_at': -1}}, (err, lastMessage) => {
                    if(err) {
                        res.status(500).json({
                            status: "error",
                            message: err
                        });
                    }
                    DialogModel.findById(dialogId, (err, dialog: any) => {
                        if(err) {
                            res.status(500).json({
                                status: "error",
                                message: err
                            });
                        }
                        dialog.lastMessage = lastMessage;
                        dialog.save();
                    });
                });

                return res.json({
                    status: "success",
                    message: "Message deleted"
                });
            } else {
                return res.status(403).json({
                    status: "error",
                    message: "Not have permission"
                });
            }
        });
    }
}

export default MessageController;
