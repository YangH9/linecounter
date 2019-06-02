const program = require('commander');

program
	.version("3.3.1")
	.option("-d, --directory <directory>", "specify directory")
	.option("-i, --ignore <filename1, filename2... filenameN>", "ignore specific files", function list(val) {return val.split(',');})
	.option("-f, --file <filename>", "count only one file")
	.option("-l, --list", "list out not ignored (counting files)")
	.option("-e, --errors", "list out errors to linecounter.error.log")
	.option("-t, --table", "display results in a table")
	.parse(process.argv);

var options = {
	directory: 'c:/xampp/htdocs/tedulinecounter',
	ignore: program.ignore,
	file: program.file,
	list: program.list,
	errors: program.errors
}

const linecounter = require("./index.js");

linecounter(console.log, options)