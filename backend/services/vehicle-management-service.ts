import { Pool } from "pg";
import { User } from "../interfaces/User";
import { Garage, Vehicle } from "../interfaces/VehicleInterfaces";
import {
    createNewUserGarageInDB, 
    createNewUserVehicleInDB,
    getUserGarageById,
    getUserVehiclesForGarage
} from "../repositories/vehicle-repository";

export const createUserGarage = async function(pgPool: Pool, user: User, garage: Garage): Promise<Garage|null>  {    
    const client = await pgPool.connect();
    try {
        //ToDo: add a limit for number of garages (2)
        return await createNewUserGarageInDB(client, user, garage);        
    } catch(error) {
        console.log(`Error in createUserGarage: ${error}`);        
    } finally {
        await client.release();
    }
    return null;
};

export const getUserGarageWithVehicles = async function(pgPool: Pool, user: User, garageId: number): Promise<Garage|null>  {    
    const client = await pgPool.connect();
    try {
        const garage = await getUserGarageById(client, user, garageId);
        if (!garage) {
            return null;
        }
        const vehiclesInGarage = await getUserVehiclesForGarage(client, user, garageId);
        garage.vehicles = vehiclesInGarage;
        return garage;
    } catch(error) {
        console.log(`Error in createUserGarage: ${error}`);
    } finally {
        await client.release();
    }
    return null;
};

export const createUserVehicle = async function(pgPool: Pool, user: User, vehicle: Vehicle): Promise<Vehicle|null> {
    const client = await pgPool.connect();
    try {
        //ToDo: add a limit for number of vehicles in a garage (20)
        return await createNewUserVehicleInDB(client, user, vehicle);        
    } catch(error) {
        console.log(`Error in createUserGarage: ${error}`);        
    } finally {
        await client.release();
    }
    return null;
};