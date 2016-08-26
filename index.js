#!/usr/bin/env node
var program  = require('commander');
var cmd      = require('node-cmd');
var lib 	 = require('./lib/lib');
var lib  	 = new lib(cmd);

program
   .version('0.0.1')
   .usage('<command>')

program
	.command('store')
	.description('Get all Repository list ,  store into a default or specified file');
program
	.command('install')
	.description('Install all command using sudo privilege from a file');

program
   .arguments('<cmd>')
   .action(function(cmd) {
   
   		lib.get(cmd);
   });

program.parse(process.argv);
