import { Pool } from "pg";
import { User } from "../interfaces/User";
import { Garage, Vehicle } from "../interfaces/VehicleInterfaces";
import {
    createNewUserGarageInDB, 
    createNewUserVehicleInDB
} from "../repositories/vehicle-repository";

//serviceResult.message = 'Unable to create a new Garage at this time, please try again later';        
const createUserGarage = async function(pgPool: Pool, user: User, garage: Garage): Promise<Garage|null>  {    
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
}

const createUserVehicle = async function(pgPool: Pool, user: User, garage: Garage, vehicle: Vehicle): Promise<Vehicle|null> {
    const client = await pgPool.connect();
    try {
        //ToDo: add a limit for number of vehicles in a garage (20)
        return await createNewUserVehicleInDB(client, user, garage, vehicle);        
    } catch(error) {
        console.log(`Error in createUserGarage: ${error}`);        
    } finally {
        await client.release();
    }
    return null;
}

//ToDo
const getUserGarage = async function(pgPool: Pool, user: User, garage: Garage) : Promise<Garage|null> {
    //retrieve garage
    //retrieve all vehicles for that garage
    return null;
}