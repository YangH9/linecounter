const path = require("path");

module.exports = function tooBig (stats, dir, fileName) {
	let filePath = path.join(dir, fileName).replace(/(\s+)/g, "\\$1");
	let fileSize = (stats.size/1024/1024).toFixed(2);
	fs.appendFile("linecounter.error.log",`${fileName} is ~${fileSize} megabytes. It is too big to be standard text. However if you are interested in the results of this file just type: linecounter -f ${filePath}, or just ignore it with: linecounter -i ${filePath}\n`, (err) => {
			if (err) throw err
	});
}