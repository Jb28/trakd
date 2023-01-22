import axios from "axios";

const authDataApiAxios = axios.create({
    baseURL: 'http://localhost:4000/',
    timeout: 60000,
    withCredentials: true
});

export const authDataApiService = {
    loginUser(loginData) {
        return authDataApiAxios.post('/user/login/web', loginData);
    }
}