export default {
  testEnvironment: 'node',
  testMatch: [
    'assets/js/**/__tests__/**/*.test.js',
    'assets/js/**/*.test.js'
  ],
  collectCoverageFrom: [
    'assets/js/**/*.js',
    '!assets/js/**/*.test.js',
    '!assets/js/astronomy.browser.js' // Exclude third-party library
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  transform: {}, // Use default Node.js ES module support
  extensionsToTreatAsEsm: ['.js']
};
