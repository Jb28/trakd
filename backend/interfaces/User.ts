export interface User {
    id?: BigInteger;
    email: string;
    password?: string;
    passwordHashed?: string;
    passwordSalt?: string;
    username?: string;
    avatarUrl?: string;
    country?: string, 
    isActivated?: boolean,
    createdOn?: Date, 
    updatedOn?: Date,
}

export interface UserDeviceInformation {
    ip?: string;
    country?: string;
    device?: string;
}