import {
    Collection,
    Db,
    DeleteWriteOpResultObject,
    InsertOneWriteOpResult,
    ObjectId,
    UpdateWriteOpResult
} from 'mongodb';
import { User, DAOResponse } from './../util/globals';

let users: Collection;
let sessions: Collection;

export default class UsersDAO {
    static async injectDB(db: Db): Promise<void> {
        if (users && sessions) {
            return;
        }
        try {
            users = db.collection('users');
            sessions = db.collection('sessions');
        } catch (e) {
            console.error(
                `Unable to establish collection handles in users data access object: ${e}`
            );
        }
    }

    static async getUser(
        user: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            if (/\S+@\S+\.\S+/.test(user)) {
                const userInfo: User | undefined = await users.findOne({
                    email: user
                });
                response = userInfo;
            } else if (user.startsWith('@')) {
                const userInfo: User | undefined = await users.findOne({
                    username: user
                });
                response = userInfo;
            } else throw Error('Username or email is required.');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async addUser(
        username: string, name: string, email: string, password: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const user = {
                username: username,
                email: email,
                name: name,
                password: password,
                joined: new Date(),
                isAdmin: false
            };
            const insertResponse: InsertOneWriteOpResult<any> = await users.insertOne(
                user,
                { w: 'majority' }
            );
            if (insertResponse.result.ok === 1)
                response = true;
            else
                throw Error('Enable to add user.');
        } catch (err) {
            // if (String(err.message).startsWith('MongoError: E11000 duplicate key error')) {
            //     return {
            //         success: false,
            //         detail: 'A user with the given username or email already exists.'
            //     };
            // }
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async loginUser(
        user: string,
        jwt: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const updateResponse: UpdateWriteOpResult = await sessions.updateOne(
                { user: user },
                { $set: { user: user, jwt: jwt } },
                { upsert: true, w: 'majority' }
            );
            if (updateResponse.result.ok === 1)
                response = { user: user, jwt: jwt };
            else
                throw Error('Error occurred while logging in user');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async logoutUser(
        email: string, password: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const deleteResponse: DeleteWriteOpResultObject = await sessions.deleteOne(
                { user: email }
            );
            if (deleteResponse.result.ok === 1)
                response = true;
            else
                throw new Error('Error occurred while logging out user');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async getUserSession(
        user: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const userSession: {
                user: string;
                jwt: string;
            } = await sessions.findOne({ user: user });
            response = userSession;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async deleteUser(
        email: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const userDeleteResponse: DeleteWriteOpResultObject = await users.deleteOne(
                { user: email }
            );
            const sessionDeleteResponse: DeleteWriteOpResultObject = await sessions.deleteOne(
                { user: email }
            );
            if (userDeleteResponse.result.ok === 1 && sessionDeleteResponse.result.ok === 1) {
                response = true;
            } else {
                throw new Error('Unable to delete user');
            }
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async isAdmin(email: string): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const userInfo: DAOResponse = await this.getUser(email);
            if (userInfo.error)
                throw userInfo.error;
            const user: User = userInfo.response;
            response = user.isAdmin;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async isUsernameAvailable(
        username: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const res = await this.getUser(username);
            if (res.error)
                throw res.error;
            if (res.response)
                response = false;
            else
                response = true;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async addArticleToAuthor(
        username: string,
        articleID: string
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const updateResponse: UpdateWriteOpResult | undefined = await users.updateOne(
                { username: username },
                { $push: { articles: new ObjectId(articleID) } }
            );
            if (updateResponse.result.ok === 1)
                response = updateResponse.result.ok === 1;
            else
                throw new Error('No user with corresponding username.');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }
}
