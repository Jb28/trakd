export interface Garage {
    id?: BigInteger;
    userId: BigInteger;
    name: string;
    vehicles?: Array<Vehicle>;
    createdOn?: Date; 
    updatedOn?: Date;
};

export interface Vehicle {
    id?: BigInteger;
    userId: BigInteger;
    garageId: BigInteger;
    type: string;
    make: string;
    model: string;
    year?: Date;
    description?: string;
    history?: string;
    imageUrl?: string;
    modifications: JSON;
    createdOn?: Date;
    updatedOn?: Date;
}

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
};