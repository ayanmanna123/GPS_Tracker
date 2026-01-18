export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.cjs'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)',
  ],
};