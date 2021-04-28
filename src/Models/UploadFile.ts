import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./Message";
import { IUser } from "./User";

export interface IUploadFile extends Document {
  filename: string;
  size: number;
  url: string;
  ext: string;
  message: IMessage | string;
  user: IUser | string;
}

export type IUploadFileDocument = Document & IUploadFile;

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    url: String,
    ext: String,
    message: { type: Schema.Types.ObjectId, ref: 'Message', required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true
  }
)

const UploadFile = mongoose.model<IUploadFile>("UploadFile", UploadFileSchema);

export default UploadFile;
