try{
    let {run} = require(__dirname + '/operations.js');
    let dir = (process.argv[2]||__dirname).replace(/\\/g,'/');
    run(dir,{'getSceneData': true}); 
    } catch (error) {
        console.error(error);
        setTimeout(()=>{},10000)
    }