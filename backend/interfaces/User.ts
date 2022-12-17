export interface User {
    id?: BigInteger;
    email: string;
    password: string;
    password_hashed?: string;
    username?: string;
}
