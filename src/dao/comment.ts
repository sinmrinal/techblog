import { ObjectId } from 'bson';
import {
    Collection,
    Db,
    DeleteWriteOpResultObject,
    InsertOneWriteOpResult,
    UpdateWriteOpResult
} from 'mongodb';

let comments: Collection;
interface DAOResponse {
    response: { ok: boolean } | undefined;
    error: Error | undefined;
}
export default class CommentsDAO {
    static async injectDB(db: Db): Promise<void> {
        if (comments) {
            return;
        }
        try {
            comments = await db.collection('comments');
        } catch (e) {
            console.error(
                `Unable to establish collection handles in comments data access object: ${e}`
            );
        }
    }

    static async addComment(
        articleID: string,
        username: string,
        comment: string,
        date: Date
    ): Promise<DAOResponse> {
        const response = { ok: false };
        let error = undefined;
        try {
            const commentDoc = {
                articleID: new ObjectId(articleID),
                username: username,
                body: comment,
                date: date
            };

            const insertResponse: InsertOneWriteOpResult<any> = await comments.insertOne(
                commentDoc
            );
            if (insertResponse.result.ok === 1)
                response.ok = true;
            else
                throw new Error('Unable to save comment.');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async updateComment(
        commentId: string,
        username: string,
        text: string,
        date: Date
    ): Promise<DAOResponse> {
        const response = { ok: false };
        let error = undefined;
        try {
            const updateResponse: UpdateWriteOpResult = await comments.updateOne(
                { _id: new ObjectId(commentId), username: username },
                { $set: { body: text, date: date } }
            );

            if (updateResponse.result.ok === 1)
                response.ok = true;
            else
                throw new Error('Unable to update comment.');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async deleteComment(
        commentId: string,
        username: string
    ): Promise<DAOResponse> {
        const response = { ok: false };
        let error = undefined;
        try {
            const deleteResponse: DeleteWriteOpResultObject = await comments.deleteOne(
                {
                    _id: new ObjectId(commentId),
                    username: username
                }
            );

            if (deleteResponse.result.ok === 1)
                response.ok = true;
            else
                throw new Error('Unable to delete comment.');
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }
}
