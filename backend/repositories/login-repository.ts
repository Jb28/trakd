import { Client } from 'pg';
import { User } from '../interfaces/User';
import { RepositoryError } from '../interfaces/Errors';

export const insertNewUser = async function(user: User): Promise<RepositoryError|User> {
    const client = new Client();
    await client.connect();
    try {
        const result = await client.query(
            'INSERT INTO users (email, password_hashed, username) VALUES ($1, $2, $3)',
            [user.email, user.password_hashed, user.username]
        )
    } catch (err) {

    }finally {
        await client.end();
        return user;
    }
};