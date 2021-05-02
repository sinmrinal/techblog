import {ObjectId} from 'bson';
import {Collection, Db} from 'mongodb';

let articles: Collection;

export interface Article {
    _id?: string;
    title: string;
    category: string;
    excerpt: string;
    image: string;
    publishedOn: Date;
    author: ObjectId;
    body?: string;
    comments?: string[];
}

export interface DAOResponse {
    success: boolean;
    detail: Article | Article[] | string;
}

export default class ArticlesDAO {
    static async injectDB(db: Db): Promise<void> {
        if (articles) return;
        try {
            articles = await db.collection('articles');
        } catch (error) {
            console.error(
                `Unable to establish a collection handle in articles data access object: ${error}`
            );
        }
    }

    static async getArticlesByAuthor(
        authorID: string,
        page = 0,
        articlesPerPage = 10
    ): Promise<DAOResponse> {
        try {
            const article: Article[] = await articles.find(
                {author: new ObjectId(authorID)},
                {projection: {body: 0}, sort: {publishedOn: -1}})
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();

            return {success: true, detail: article};
        } catch (error) {
            console.error(`Unable to issue find command, ${error}`);
            return {
                success: false,
                detail: 'Unable to retrieve articles at the moment.'
            };
        }
    }

    static async getArticleByID(id: string): Promise<DAOResponse> {
        try {
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: 'comments',
                        let: {
                            id: '$_id'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$article', '$$id']
                                    }
                                }
                            },
                            {
                                $sort: {
                                    date: -1
                                }
                            }
                        ],
                        as: 'comments'
                    }
                }
            ];
            const article = await articles.aggregate(pipeline).toArray();
            return {success: true, detail: article[0]};
        } catch (error) {
            console.error(`Something went wrong in getArticleByID: ${error}`);
            return {
                success: false,
                detail: 'Unable to retrieve articles at the moment.'
            };
        }
    }

    static async getArticlesByCategory(
        category: string,
        page = 0,
        articlesPerPage = 10
    ): Promise<DAOResponse> {
        try {
            const article: Article[] = await articles.find(
                {category: category},
                {projection: {body: 0}, sort: {publishedOn: -1}})
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();
            return {success: true, detail: article};
        } catch (error) {
            console.error(`Unable to issue find command, ${error}`);
            return {
                success: false,
                detail: 'Unable to retrieve articles at the moment.'
            };
        }
    }

    static async getArticles(
        page = 0,
        articlesPerPage = 10
    ): Promise<DAOResponse> {
        try {
            const cursor: Article[] = await articles
                .find({}, {projection: {body: 0}, sort: {publishedOn: -1}})
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();
            return {success: true, detail: cursor};
        } catch (error) {
            console.error(`Unable to issue find command, ${error}`);
            return {
                success: false,
                detail: 'Unable to retrieve articles at the moment.'
            };
        }
    }
}
