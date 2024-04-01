import { PoolClient } from "pg";
import { User } from "../interfaces/User";
import { Garage, Vehicle } from "../interfaces/VehicleInterfaces";

export const createNewUserGarageInDB = async function(pgPoolClient: PoolClient, user: User, garage: Garage): Promise<Garage> {
    const result = await pgPoolClient.query(
        `INSERT INTO user_garage (user_id, name)
         VALUES ($1, $2)
         RETURNING id, user_id, name, created_on, updated_on`,
         [user.id, garage.name]
    );
    const resultData = result.rows[0];
    return {
        id: parseInt(resultData.id),
        userId: parseInt(resultData.user_id),
        name: resultData.name,
        createdOn: resultData.created_on,
        updatedOn: resultData.updated_on,
    }
};

export const getUserGarageIds = async function(pgPoolClient: PoolClient, user: User): Promise<number[]|null> {
    const result = await pgPoolClient.query(
        `SELECT id 
         FROM user_garage
         WHERE user_id = $1`,
         [user.id]
    );
    if (result.rows.length <= 0){
        return null;
    }
    const userGarageIds: number[] = [];
    result.rows.forEach(row =>{
        userGarageIds.push(row.id);
    });
    return userGarageIds;
};

export const getUserGarageById = async function(pgPoolClient: PoolClient, user: User, garageId: number): Promise<Garage|null> {
    const result = await pgPoolClient.query(
        `SELECT id, user_id, name, created_on, updated_on 
         FROM user_garage
         WHERE id = $2 AND user_id = $1`,
         [user.id, garageId]
    );
    if (result.rows.length <= 0){
        return null;
    }
    const resultData = result.rows[0];
    return {
        id: parseInt(resultData.id),
        userId: parseInt(resultData.user_id),
        name: resultData.name,
        createdOn: resultData.created_on,
        updatedOn: resultData.updated_on,
    }
};

export const getUserVehiclesForGarage = async function(pgPoolClient: PoolClient, user: User, garageId: number): Promise<Array<Vehicle>> {
    const result = await pgPoolClient.query(
        `SELECT id, user_id, garage_id, type, make, model, year, description, history, image_url, modifications
         FROM user_vehicle 
         WHERE user_id = $1 AND garage_id = $2`,
         [user.id, garageId]
    );
    const vehiclesForGarage: Vehicle[] = [];
    result.rows.forEach(row =>{
        vehiclesForGarage.push({
            id: parseInt(row.id),
            userId: parseInt(row.user_id),
            garageId: parseInt(row.garage_id),
            type: row.type,
            make: row.make,
            model: row.model,
            year: new Date(row.year),
            description: row.description,
            history: row.history,
            imageUrl: row.image_url,
            modifications: row.modifications,
            createdOn: row.created_on,
            updatedOn: row.updated_on,
        })
    })
    return vehiclesForGarage;
};

export const createNewUserVehicleInDB = async function(pgPoolClient: PoolClient, user: User, vehicle: Vehicle): Promise<Vehicle> {
    const result = await pgPoolClient.query(
        `INSERT INTO user_vehicle (user_id, garage_id, type, make, model, year, description, history, image_url, modifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, user_id, garage_id, type, make, model, year, description, history, image_url, modifications`,
         [user.id, vehicle.garageId, vehicle.type, vehicle.make, vehicle.model, vehicle.year, 
            vehicle.description, vehicle.history, vehicle.imageUrl, vehicle.modifications]
    );
    const resultData = result.rows[0];
    return {
        id: parseInt(resultData.id),
        userId: parseInt(resultData.user_id),
        garageId: parseInt(resultData.garage_id),
        type: resultData.type,
        make: resultData.make,
        model: resultData.model,
        year: new Date(resultData.year),
        description: resultData.description,
        history: resultData.history,
        imageUrl: resultData.image_url,
        modifications: resultData.modifications,
        createdOn: resultData.created_on,
        updatedOn: resultData.updated_on,
    }
};