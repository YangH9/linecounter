const fs = require("fs");
const path = require("path");

module.exports = linecounter;

function initialize(options) {
	results = {
		TOTAL: {lines: 0, files: []},
	};
	operation = {
		FILES: [],
		COMPLETED_FILES: []
	}
	opts = options || {};
	ignore = {
		fileNames: _ignore.defaults.concat(opts.ignore),
		extensions: _ignore.extensions
	}
}

const _ignore = require("./lib/ignore.js");

const HALF_MEGABYTE = 1024 * 512;

function linecounter(cb, options) {
	initialize(options);
	// if there was a single file specified
	if (opts.file) {
		var counting = new Promise((resolve, reject) => {
			operation.resolve = resolve;
			readFile(opts.file);
		});
	}
	else {
		// start from specified directory or from pwd
		opts.directory = opts.directory ? opts.directory : ".";
		var counting = new Promise((resolve, reject) => {
			operation.resolve = resolve;
			var counting = readDirectory(opts.directory);
		});
	}
	counting.then(res => {
		return cb(res);
	});
}

function readDirectory (dir) {
	fs.readdir(dir, (err, files) => dealWithFiles(files, dir));
}

function dealWithFiles (files, dir) {
	files.forEach(fileName => {
		let stats = fs.statSync(path.join(dir, fileName));
		// .git, .DS_Store...
		if (fileName[0] === ".") {
			return;
		}
		// file is too big to be text, probably they've ommited the extension
		else if (stats.size > HALF_MEGABYTE) {
			if (opts.errors === true) {
				require("./lib/tooBig.js")(stats, dir, fileName);
			}
			return;
		}
		else if (ignore.fileNames.includes(fileName)) {
			return;
		}
		// the file must be ignored (by extension)
		else if (ignore.extensions.includes(path.extname(fileName))) {
			return;
		}
		else if (stats.isDirectory()) {
			return readDirectory(path.join(dir, fileName));
		}
		// it is a simple file, just count it
		else {
			return readFile(path.join(dir, fileName));
		}
	});
}

function readFile (fileName) {
	operation.FILES.push(fileName);
	var extension = path.extname(fileName) ? path.extname(fileName) : "PLAIN";
	fs.readFile(fileName, (err, file) => {
		updateResults({
			fileName: fileName,
			extension: extension,
			lines: file.toString().split(/\r\n|\r|\n/).length
		});
	});
}

function updateResults (metadata) {
	operation.COMPLETED_FILES.push(metadata.fileName);
	results.TOTAL.lines += metadata.lines;

	// if it is the first file with this extension, we initialize
	if(!results[metadata.extension]) {
		results[metadata.extension] = {
			files: 1,
			lines: metadata.lines
		};
	}
	else {
		results[metadata.extension].files++;
		results[metadata.extension].lines += metadata.lines;
	}

	if (operation.FILES.length === operation.COMPLETED_FILES.length) {
		results.TOTAL.files = operation.FILES.length;
		operation.resolve(finish());
	}
}

function finish () {
	if (opts.list === true) {
		return operation.FILES.join("\n");
	}
	else {
		return JSON.stringify(results);
	}
}