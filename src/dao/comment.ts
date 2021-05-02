import {ObjectId} from 'bson';
import {Collection, Db, DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult} from 'mongodb';

let comments: Collection;

export default class CommentsDAO {
    static async injectDB(db: Db) {
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
    ): Promise<boolean> {
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
            return insertResponse.result.ok == 1;
        } catch (e) {
            console.error(`Unable to post comment: ${e}`);
            return false;
        }
    }

    static async updateComment(
        commentId: string,
        username: string,
        text: string,
        date: Date
    ): Promise<boolean> {
        try {
            const updateResponse: UpdateWriteOpResult = await comments.updateOne(
                {_id: new ObjectId(commentId), username: username},
                {$set: {body: text, date: date}}
            );

            return updateResponse.result.ok == 1;
        } catch (e) {
            console.error(`Unable to update comment: ${e}`);
            return false;
        }
    }

    static async deleteComment(
        commentId: string,
        username: string
    ): Promise<boolean> {
        try {
            const deleteResponse: DeleteWriteOpResultObject = await comments.deleteOne(
                {
                    _id: new ObjectId(commentId),
                    username: username
                }
            );

            return deleteResponse.result.ok == 1;
        } catch (e) {
            console.error(`Unable to delete comment: ${e}`);
            return false;
        }
    }
}
