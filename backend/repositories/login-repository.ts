import { Client, Pool } from 'pg';
import { User } from '../interfaces/User';

export const insertNewUser = async function(pgPool: Pool, user: User): Promise<User> {    
    const client = await pgPool.connect();
    try {
        const result = await client.query(
            'INSERT INTO user_main (email, password_hashed, password_salt, username) VALUES ($1, $2, $3, $4)',
            [user.email, user.passwordHashed, user.passwordSalt, user.username]
        )
    } catch (err) {
        console.log(`Postgres Error in insertNewUser: ${err}`);
    }finally {
        await client.release();
        return user;
    }
};