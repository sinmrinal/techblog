export default {
    coverageProvider: 'v8',
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    },
    moduleFileExtensions: [
        'js',
        'ts',
    ],
    testEnvironment: 'node',
    testMatch: [
        '**/test/**/*.test.(ts|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
};
