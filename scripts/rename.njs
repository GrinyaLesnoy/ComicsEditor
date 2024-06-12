try{
let {run} = require(__dirname + '/operations.js');
let dir = (process.argv[2]||__dirname).replace(/\\/g,'/');
run(dir); 
} catch (error) {
	console.error(error);
	setTimeout(()=>{},10000)
}