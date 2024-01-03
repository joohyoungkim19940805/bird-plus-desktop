const packageJson = require('./package.json');
//https://bird-plus-s3-public.s3.ap-northeast-2.amazonaws.com/update/latest.yml
//amazonaws.com
const {bucket, region, channel} = packageJson.build.publish
const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/update/${channel}.yml`
const axios = require('axios');
const updateLatestYmlPromise = axios.get(s3Url).then( response => {
	if (response.status == 200 || response.status == 201) {
		const yaml = require('js-yaml');
		console.log(response.data)
		return yaml.load(response.data);
	}
	throw new Error({status : response.status, errorMessage : response.message})
});

const { gitlogPromise } = require("gitlog");

console.log('start history deploy');
updateLatestYmlPromise.then(yml => {
	console.log(yml)
	let {version, releaseDate} = yml;
	let release = new Date(releaseDate);
	console.log('release :: ', release.toLocaleDateString());
	// Asynchronous (with Promise)
	gitlogPromise({
		repo: `${__dirname}/.git`,
		number: 9999,
		fields: ["hash", "treeHash", "subject", "authorName", "authorDateRel", "authorDate", "committerName", "rawBody", "committerDate"],
		execOptions: { maxBuffer: 1000 * 1024 },
		after : '2024. 1. 2.',
		before : '2024-01-03',
		
	}).then( (commits) => {
		console.log('commits :: ', commits) 
	})
	.catch(err=>{
		console.error(err.message)
	})

	
	console.log('2024-01-02T22:25:20.153Z');
	console.log(new Date('2024-01-02T22:25:20.153Z').toLocaleString());

})
.catch( (err) => console.error(err) );

