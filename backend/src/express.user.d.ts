declare namespace Express {
    export interface User {
        email: string,
        role: string,
        iat: number,
        exp: number
    }
}