import {
    Collection,
    Db,
    DeleteWriteOpResultObject,
    InsertOneWriteOpResult,
    ObjectId,
    UpdateWriteOpResult
} from 'mongodb';

let users: Collection;
let sessions: Collection;


interface User {
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

interface DAOResponse {
    success: boolean;
    detail: User | Record<string, string> | string;
}

export default class UsersDAO {
    static async injectDB(db: Db): Promise<void> {
        if (users && sessions) {
            return;
        }
        try {
            users = await db.collection('users');
            sessions = await db.collection('sessions');
        } catch (e) {
            console.error(
                `Unable to establish collection handles in users data access object: ${e}`
            );
        }
    }

    static async getUser(
        user: string
    ): Promise<DAOResponse> {
        try {
            if (/\S+@\S+\.\S+/.test(user)) {
                const userInfo: User | undefined = await users.findOne({email: user});
                return userInfo ? {success: true, detail: userInfo} : {
                    success: false,
                    detail: `User with email: ${user} not found`
                };
            } else if (user.startsWith('@')) {
                const userInfo: User | undefined = await users.findOne({
                    username: user
                });
                return userInfo ? {success: true, detail: userInfo} : {
                    success: false,
                    detail: `User with username: ${user} not found`
                };
            } else return {success: false, detail: 'Username or email is required.'};
        } catch (err) {
            throw err;
        }
    }

    static async addUser(
        userInfo: User
    ): Promise<DAOResponse> {
        try {
            const insertResponse: InsertOneWriteOpResult<any> = await users.insertOne(
                userInfo,
                {w: 'majority'}
            );
            return insertResponse.result.ok === 1
                ? {success: true, detail: userInfo}
                : {success: false, detail: 'Enable to add user.'};
        } catch (err) {
            if (String(err.message).startsWith('MongoError: E11000 duplicate key error')) {
                return {
                    success: false,
                    detail: 'A user with the given username or email already exists.'
                };
            }
            console.error(`Error occurred while adding new user, ${err}.`);
            return {success: false, detail: err.message};
        }
    }

    static async loginUser(
        user: string,
        jwt: string
    ): Promise<DAOResponse> {
        try {
            const updateResponse: UpdateWriteOpResult = await sessions.updateOne(
                {user: user},
                {$set: {user: user, jwt: jwt}},
                {upsert: true, w: 'majority'}
            );
            return updateResponse.result.ok === 1
                ? {success: true, detail: {user: user, jwt: jwt}}
                : {success: false, detail: 'Error occurred while logging in user'};
        } catch (err) {
            console.error(`Error occurred while logging in user, ${err}`);
            return {success: false, detail: err.message};
        }
    }

    static async logoutUser(
        email: string
    ): Promise<DAOResponse> {
        try {
            const deleteResponse: DeleteWriteOpResultObject = await sessions.deleteOne(
                {user: email}
            );
            return deleteResponse.result.ok == 1
                ? {success: true, detail: email}
                : {success: false, detail: 'Error occurred while logging out user'};
        } catch (err) {
            console.error(`Error occurred while logging out user, ${err}`);
            return {success: false, detail: err.message};
        }
    }

    static async getUserSession(
        user: string
    ): Promise<DAOResponse> {
        try {
            const userSession: {
                user: string;
                jwt: string;
            } = await sessions.findOne({user: user});
            return userSession
                ? {success: true, detail: userSession}
                : {success: false, detail: 'No user session found with corresponding email.'};
        } catch (err) {
            console.error(`Error occurred while retrieving user session, ${err}`);
            return {success: false, detail: err.message};
        }
    }

    static async deleteUser(
        email: string
    ): Promise<DAOResponse> {
        try {
            const userDeleteResponse: DeleteWriteOpResultObject = await users.deleteOne(
                {user: email}
            );
            const sessionDeleteResponse: DeleteWriteOpResultObject = await sessions.deleteOne(
                {user: email}
            );
            if (userDeleteResponse.result.ok === 1 && sessionDeleteResponse.result.ok === 1) {
                return {success: true, detail: email};
            } else {
                console.error('Unable to delete user');
                return {success: false, detail: 'Unable to delete user'};
            }
        } catch (err) {
            console.error(`Error occurred while deleting user, ${err}`);
            return {success: false, detail: err.message};
        }
    }

    static async checkAdmin(email: string): Promise<boolean | Error> {
        try {
            const userInfo: DAOResponse = await this.getUser(email);
            const user = userInfo.detail.
            return userInfo.success ? userInfo.detail : false;
        } catch (err) {
            return new Error(err);
        }
    }

    static async checkUsernameAvailability(
        username: string
    ): Promise<boolean | object> {
        try {
            const user = await this.getUser(username);
            return !user.success;
        } catch (e) {
            return {error: e};
        }
    }

    static async addArticleToAuthor(
        username: string,
        articleID: string
    ): Promise<DAOResponse | DAOFailureResponse> {
        try {
            const updateResponse: UpdateWriteOpResult = await users.updateOne(
                {username: username},
                {$push: {articles: new ObjectId(articleID)}}
            );
            return updateResponse.result.ok
                ? {success: true, detail: updateResponse.result}
                : {success: false, error: 'No user with corresponding username.'};
        } catch (e) {
            return {success: false, error: e};
        }
    }
}
