console.log('start history deploy');

const { gitlogPromise } = require("gitlog");

const options = {
  repo: `${__dirname}/.git`,
  number: 1,
  fields: ["hash", "treeHash", "subject", "authorName", "authorDateRel", "authorDate", "committerName", "rawBody", "committerDate"],
  execOptions: { maxBuffer: 1000 * 1024 },
};

// Asynchronous (with Promise)
gitlogPromise(options).then((commits) => {
	console.log(commits)
})
.catch((err) => console.log(err));

console.log('2024-01-02T22:25:20.153Z');
console.log(new Date('2024-01-02T22:25:20.153Z').toLocaleString());

