export interface Garage {
    id?: number;
    userId?: number;
    name: string;
    vehicles?: Array<Vehicle>;
    createdOn?: Date; 
    updatedOn?: Date;
};

export interface Vehicle {
    id?: number;
    userId: number;
    garageId: number;
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