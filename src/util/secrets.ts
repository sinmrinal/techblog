import log from './log';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

if (fs.existsSync('.env')) {
    log.info('Using .env file to supply config environment variables');
    dotenv.config({path: '.env'});
} else {
    log.debug('Using .env.example file to supply config environment variables');
    dotenv.config({path: '.env.example'});
}
export const PORT = process.env.PORT || 8000;
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env['MONGODB_URI'] || '';
export const MONGODB_DB_NAME = process.env['MONGODB_DB_NAME'] || '';

if (MONGODB_URI === '') {
    log.fatal('No mongo connection string. Set MONGODB_URI environment variable.');
    process.exit(1);
}

if (MONGODB_DB_NAME === '') {
    log.fatal('No mongo database name. Set MONGODB_DB_NAME environment variable.');
    process.exit(1);
}
