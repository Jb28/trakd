export default function ({ isServer, res, query} ) {
    console.log('middleware hit');
    const token = query.token
    if (token) {
        if (isServer) {
            res.setHeader('Set-Cookie', [`access_token=${token}`]); // Server-side
        } else {
            document.cookie = `access_token=${token}` // Client-side
        }
    }
}