export interface User {
    id?: number;
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
};

export interface UserDeviceInformation {
    ip?: string;
    country?: string;
    device?: string;
};

export interface UserSessionKey {
    key: string;
    userId: number;
    createdOn: Date; 
    ip: string;
    country?: string;
    device?: string;
};