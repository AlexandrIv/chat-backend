import mongoose, {Schema, Document, HookNextFunction} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { generatePasswordHash } from "../utils";
import differenceInMinutes from "date-fns/differenceInMinutes";

export interface IUser extends Document {
    email?: string,
    fullname?: string,
    password?: string,
    confirmed?: boolean,
    avatar?: string,
    confirm_hash?: string,
    last_seen?: Date
}

// TODO Сделать последнее посещение по дефолту
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    fullname: {
        type: String,
        required: 'Fullname is required'
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    avatar: String,
    confirm_hash: String,
    last_seen: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: true
});

UserSchema.plugin(uniqueValidator);

UserSchema.virtual('isOnline').get(function(this: any) {
  return differenceInMinutes(new Date(), this.last_seen) < 5;
});

UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.pre('save', function (next: HookNextFunction) {
   const user: IUser = this;

   if(!user.isModified('password')) return next();

   generatePasswordHash(user.password)
       .then(hash => {
           user.password = String(hash);
           generatePasswordHash(+new Date()).then(confirmHash => {
               user.confirm_hash = String(confirmHash);
               next();
           });
       })
       .catch(err => {
          next(err);
       });
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
