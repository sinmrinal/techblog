import { ObjectId } from 'bson';
import { Collection, Db } from 'mongodb';

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
    response: any | undefined;
    error: Error | undefined
}

export default class ArticlesDAO {
    static async injectDB(db: Db): Promise<void> {
        if (articles) return;
        try {
            articles = db.collection('articles');
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
        let response = undefined;
        let error = undefined;
        try {
            const article: Article[] = await articles.find(
                { author: new ObjectId(authorID) },
                { projection: { body: 0 }, sort: { publishedOn: -1 } })
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();

            response = article;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async getArticleByID(id: string): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
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
            response = article[0];
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async getArticlesByCategory(
        category: string,
        page = 0,
        articlesPerPage = 10
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const article: Article[] = await articles.find(
                { category: category },
                { projection: { body: 0 }, sort: { publishedOn: -1 } })
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();
            response = article;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }

    static async getArticles(
        page = 0,
        articlesPerPage = 10
    ): Promise<DAOResponse> {
        let response = undefined;
        let error = undefined;
        try {
            const cursor: Article[] = await articles
                .find({}, { projection: { body: 0 }, sort: { publishedOn: -1 } })
                .skip(page * articlesPerPage)
                .limit(articlesPerPage)
                .toArray();
            response = cursor;
        } catch (err) {
            error = err;
        } finally {
            return { response, error };
        }
    }
}
