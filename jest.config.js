module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/user/(.*)$': '<rootDir>/src/services/user/$1',
    '^@/account/(.*)$': '<rootDir>/src/services/account/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
}; 