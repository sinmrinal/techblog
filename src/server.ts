import errorHandler from 'errorhandler';
import {MongoClient} from 'mongodb';
import User from './dao/user';
import Comment from './dao/comment';
import Article from './dao/article';

import app from './app';
import {ENVIRONMENT, MONGODB_DB_NAME, MONGODB_URI, PORT} from './util/secrets';
import log from './util/log';

if (ENVIRONMENT === 'development') {
    app.use(errorHandler());
}

MongoClient.connect(MONGODB_URI, {
    poolSize: 50,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch((err) => {
        console.log(`MongoDB connection error. ${err}`);
        process.exit(1);
    })
    .then(async (db) => {
        await User.injectDB(db.db(MONGODB_DB_NAME));
        await Comment.injectDB(db.db(MONGODB_DB_NAME));
        await Article.injectDB(db.db(MONGODB_DB_NAME));
        app.listen(PORT, () => {
            log.info(
                `App is running at http://localhost:${PORT} in ${ENVIRONMENT} mode.\nPress CTRL-C to stop.`,
            );
        });
    });
