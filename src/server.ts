import errorHandler from 'errorhandler';
import {MongoClient} from 'mongodb';
import User from './dao/user';
import Comment from './dao/comment';
import Article from './dao/article';

import app from './app';
import {MONGODB_DB_NAME, MONGODB_URI} from './util/secrets';

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
}

const mongo_uri = MONGODB_URI || '';
MongoClient.connect(mongo_uri, {
    poolSize: 50,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch((err) => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        process.exit(1);
    })
    .then(async ({db}) => {
        await User.injectDB(db(MONGODB_DB_NAME));
        await Comment.injectDB(db(MONGODB_DB_NAME));
        await Article.injectDB(db(MONGODB_DB_NAME));
        app.listen(app.get('port'), () => {
            console.log(
                '  App is running at http://localhost:%d in %s mode',
                app.get('port'),
                app.get('env')
            );
            console.log('  Press CTRL-C to stop\n');
        });
    });
