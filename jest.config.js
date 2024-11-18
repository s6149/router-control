module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: [
        '**/*.test.js',
        '**/*.spec.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFiles: ['dotenv/config'],
    moduleDirectories: ['node_modules', 'src'],
    // 添加這個配置來確保 Jest 可以找到 mock 文件
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};