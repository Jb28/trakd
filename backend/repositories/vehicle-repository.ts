import { PoolClient } from "pg";
import { User } from "../interfaces/User";
import { Garage, Vehicle } from "../interfaces/VehicleInterfaces";

export const createNewUserGarageInDB = async function(pgPoolClient: PoolClient, user: User, garage: Garage): Promise<Garage> {
    const result = await pgPoolClient.query(
        `INSERT INTO user_garage (user_id, name)
         VALUES ($1, $2)`,
         [user.id, garage.name]
    );
    const resultData = result.rows[0];
    return {
        id: resultData.id,
        userId: resultData.user_id,
        name: resultData.name,
        createdOn: resultData.created_on,
        updatedOn: resultData.updated_on,
    }
};

export const createNewUserVehicleInDB = async function(pgPoolClient: PoolClient, user: User, garage: Garage, vehicle: Vehicle): Promise<Vehicle> {
    const result = await pgPoolClient.query(
        `INSERT INTO user_vehicle (user_id, garage_id, type, make, model, year, description, history, image_url, modifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
         [user.id, garage.id, vehicle.type, vehicle.make, vehicle.model, vehicle.year, 
            vehicle.description, vehicle.history, vehicle.imageUrl, vehicle.modifications]
    );
    const resultData = result.rows[0];
    return {
        id: resultData.id,
        userId: resultData.user_id,
        garageId: resultData.garage_id,
        type: resultData.type,
        make: resultData.make,
        model: resultData.model,
        year: resultData.year,
        description: resultData.description,
        history: resultData.history,
        imageUrl: resultData.image_url,
        modifications: resultData.modifications,
        createdOn: resultData.created_on,
        updatedOn: resultData.updated_on,
    }
};