import jwt from "jsonwebtoken";
import { reduce } from "lodash";

export default (user: any) => {
    const token = jwt.sign({
        data: reduce(user, (result: any, value: any, key: any) => {
            if(key !== 'password') {
                result[key] = value
            }
           return result;
        }, {})
    }, process.env.JWT_SECRET || '', {
        expiresIn: process.env.JWT_MAX_AGE,
        algorithm: 'HS256'
    });

    return token
};
