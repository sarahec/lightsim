/* eslint-disable */

// Modules throwing error "Jest encountered an unexpected token"
const esModules = ['unified', 'remark-parse'];

export default {
  displayName: 'rollup-plugin-lightsim',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!.*\\.mjs$)`],
  moduleFileExtensions: ['ts', 'js', 'html'],
  // coverageDirectory: '../../coverage/packages/rollup-plugin-lightsim',
};
