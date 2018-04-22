import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

process.env.BABEL_ENV = 'es5'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/index.es.js',
        format: 'es'
      }, {
        file: './dist/index.js',
        format: 'cjs',
        exports: 'named',
        footer: 'module.exports = exports.default;'
      }],
    plugins: [
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/index.es.min.js',
        format: 'es'
      }, {
        file: './dist/index.min.js',
        format: 'cjs',
        exports: 'named',
        footer: 'module.exports = exports.default;'
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      uglify({})
    ]
  }
]
