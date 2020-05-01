const fs = require('fs');
const path = require('path');
let scriptDir = __dirname.replace(/\\/g,'/');
let dir = (process.argv[2]||__dirname).replace(/\\/g,'/');

var _root = dir, project = {};

while(_root&&_root!=='.'&&_root!=='/'){
    if(fs.existsSync(_root + '/project.json')){
        project = JSON.parse( fs.readFileSync(_root + '/project.json', 'utf8') )
        break;
    }
    _root = path.posix.dirname(_root);
    }
    
    console.log(project)

    _root = path.posix.join(_root,project.root || '.')
    var scenesDir = path.posix.join(_root,project.scenesDir || '.')
    // project.dataDir = path.posix.join(project.root,project.dataDir || "Data")
    project.dataDir = project.dataDir || "Data";
 
var DATA = Object.assign(
    {},project
)
// DATA.root
const mask = new RegExp(project.sceneNameMask);
var scenes  = {}
var list = fs.readdirSync(scenesDir).filter(f=>mask.test(f)&&f.slice(-1)!=='~').sort((a,b)=>{
    a = a.match(mask)[1];
    b = b.match(mask)[1];
    let _a = +a,_b=+b, r = 0;
    if(_a!==a)_a = a;
    if(_b!==b)_b = b;
    if(typeof _a !== typeof _b) r = typeof _a === 'number' ? -1 : 1;
    else r = _a < _b ? -1 : 1;
    console.log(_a,_b,r)
    return r;
})
list.forEach(f=>{
    let n = f.match(mask)[1];
    if(scenes[n])
        for(let i =1;; i++)
            if(!scenes[n+i]){n+=i;break;}
    scenes[n]=f;
});
DATA.Scenes = scenes;
DATA.scenesList = list;
console.log(_root + "/DATA.js")
fs.writeFile(_root + "/DATA.js", `ProjectData = DATA = ${JSON.stringify(DATA,null,'\t')}`, (err)=>{if(err)return console.log(err);}); 