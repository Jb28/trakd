export interface User {
    id?: BigInteger;
    email: string;
    password?: string;
    passwordHashed?: string;
    passwordSalt?: string;
    username?: string;
}
