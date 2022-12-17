const moduleExports = {};
const cryptoModule = require('crypto');
import { User } from '../interfaces/User';
import { ServiceError } from '../interfaces/Errors';
import { insertNewUser } from '../repositories/login-repository';

export const createUser = async function(user: User): Promise<ServiceError | User> {
    
    //validate password format, can extract this
    const errorMessages: Array<string> = [];
    if (user.password.length > 50 || user.password.length < 8) {
        errorMessages.push('Password must be between 8 and 50 characters');
    }
    if (errorMessages.length > 0) {
        return { Messages: errorMessages };
    }
    
    //choose a salt - make this random
    let salt = 'abc';

    //encrypt password
    const hashedPlainPasswordBytes = cryptoModule.scryptSync(user.password, new Buffer(salt), 64, { "N": 1024, "r": 8, "p": 1 });    
    user.password = hashedPlainPasswordBytes.toString('hex');
    
    //create username
    user.username = user.email.split('@')[0].substring(0,10);

    //store in database
    const response = await insertNewUser(user);

    return response;
};

export const loginUser = function(email, password) {

};