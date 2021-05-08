export interface User {
    username: string;
    name: string;
    email: string;
    password: string;
    bio: string;
    joined: Date;
    isAdmin: boolean;
    avatar: string;
    articles: string[];
}

export interface DAOResponse {
    response: any | undefined;
    error: Error | undefined;
}