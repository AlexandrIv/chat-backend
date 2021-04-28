import express from "express";

import { UploadFile } from "../Models";
import { IUploadFileDocument } from "../Models/UploadFile";
import cloudinary from "../core/cloudinary";

class UploadController {

  create = (req: any, res: express.Response) => {
    const userId = req.user._id;
    const file: any = req.file;

    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto", folder: "chat-images" }, (
        error: cloudinary.UploadApiErrorResponse | undefined,
        result: cloudinary.UploadApiResponse | undefined
      ) => {
        if(error || !result) {
          return res.status(500).json({
            status: "error",
            message: error || "upload error",
          });
        }

        const fileData: Pick<cloudinary.UploadApiResponse, "filename" | "size" | "ext" | "url" | "user"> = {
          filename: result.original_filename,
          size: result.bytes,
          ext: result.format,
          url: result.url,
          user: userId
        }

        const uploadFile: IUploadFileDocument = new UploadFile(fileData);

        uploadFile
          .save()
          .then((fileObj: any) => {
            res.json({
              status: 'success',
              file: fileObj
            });
          })
          .catch((err: any) => {
            res.json({
              status: 'error',
              message: err
            });
          });
      }).end(file.buffer);
  };

  delete = (req: express.Request, res: express.Response) => {}

}

export default UploadController;
