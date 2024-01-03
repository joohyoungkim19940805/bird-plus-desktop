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
	//release = new Date( release.setDate(release.getDate() - 1) )
	let year = release.getFullYear();
	let month = String(release.getMonth() + 1).padStart(2, 0);
	let date = String(release.getDate()).padStart(2, 0);
	let hours = String(release.getHours()).padStart(2, 0);
	let minutes = String(release.getMinutes()).padStart(2, 0);
	let seconds = String(release.getSeconds()).padStart(2, 0);
	console.log('release :: ', release.toLocaleString());
	console.log('release22',`${year}-${month}-${date} ${hours}:${minutes}:${seconds} +0900`)
	// Asynchronous (with Promise)
	gitlogPromise({
		repo: `${__dirname}/.git`,
		number: 9999,
		fields: ["hash", "subject", "authorName", "authorDateRel", "authorDate", "authorEmail"],
		execOptions: { maxBuffer: 1000 * 1024 },
		after: `${year}-${month}-${date} ${hours}:${minutes}:${seconds} +0900`,
		//before : `${year}-${month}-${date}`,
	}).then( (commits) => {
		console.log('commits :: ', commits)
		
		const process = require('process')
		console.log(process.env.AWS_ACCESS_KEY_ID);
		console.log(process.env.AWS_SECRET_ACCESS_KEY);
		
		const AWS = require('aws-sdk');
		const s3 = new AWS.S3({
			//accessKeyId : process.env.AWS_ACCESS_KEY_ID,
			//secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
			region
		});

		s3.upload({
			Bucket: bucket,
			Key: `update/history_${packageJson.version}.json`,
			ContentType: 'application/json',
			Body: JSON.stringify( commits.map(e=>{
				e.files = e.files.map(e=>e.split('/').at(-1))
				return e;
			}) ) 
		}, (err, data) => {
			if (err) {
				console.error('s3 upload failed ::: ', err.message);
			}
			console.log(data);
		});
	})
	.catch(err=>{
		console.error(err.message)
	})

	
	console.log('2024-01-02T22:25:20.153Z');
	console.log(new Date('2024-01-02T22:25:20.153Z').toLocaleString());

})
.catch( (err) => console.error(err) );

