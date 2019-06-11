/*
require('babel-core/register')({
    presets: ['es2015', 'stage-0'],
});
*/
require('babel-core/register')({
    presets: ['env', 'stage-2'],
});
require('babel-polyfill');


module.exports = require('./index.js');

