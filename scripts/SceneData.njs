var fs = require('fs');
const path = require('path');
let scriptDir = __dirname.replace(/\\/g, '/');
let dir = (process.argv[2] || __dirname).replace(/\\/g, '/');


var _root = dir, project = {};

while (_root && _root !== '.' && _root !== '/') {
    if (fs.existsSync(_root + '/project.json')) {
        project = JSON.parse(fs.readFileSync(_root + '/project.json', 'utf8'))
        break;
    }
    _root = path.posix.dirname(_root);
}
let dirName = path.posix.basename(dir);
let sceneNum = dirName.match(new RegExp(project.sceneNameMask))[1];
if (sceneNum == +sceneNum) sceneNum = +sceneNum;
var fileNumMask = new RegExp(project.fileNumMask);
var sceneNameMask = new RegExp(project.sceneNameMask);

project.root = path.posix.join(_root, project.root || '.')
project.scenesDir = path.posix.join(project.root, project.scenesDir || '.')
project.dataDir = path.posix.join(project.root, project.dataDir || "Data")
if (dir.slice(-1) != '/') dir += '/';
var errorLog = (error) => {

    console.error(error)
    var fn = path.basename(__filename)
    var efPath = dir + '/error.log'
    var lastErr = '';
    if (fs.existsSync(efPath)) lastErr = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';

    fs.writeFile(efPath, `${lastErr}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${error.stack}`, (err) => { if (err) return console.log(err); });

}

var infoLog = (info) => {

    console.log(info)
    var fn = path.basename(__filename)
    var efPath = dir + '/info.log'
    var lastInfo = '';
    if (fs.existsSync(efPath)) lastInfo = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';

    fs.writeFile(efPath, `${lastInfo}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${info}`, (err) => { if (err) return console.log(err); });

}

try {


    // GET LIST
    const child_process = require('child_process');
    // var gm = require('gm');
    var LIST = [], DATA = {};

    if (fs.existsSync(dir + '/scene.json')) {
        DATA.scene = JSON.parse(fs.readFileSync(dir + '/scene.json', 'utf8'));
        infoLog('parse' + dir + '/scene.json')
    } else {
        DATA.scene = {
            titlePage: false,
            pages: {
                first: 100,
                start: 0
            }
        }
        fs.writeFile(dir + '/scene.json', JSON.stringify(DATA.scene, null, '\t'), (err) => { if (err) errorLog(err); });
        fs.writeFile(dir + '/_renameData.njs', `module.exports = {
            // move : {0:0}, 
            // move : [0,10],
            // create : [10,20]
            // clean : true
            // rescene : [19,20]
            // exchange:{10:20, nosvg: true}
            // exchange:{10:20}
            create :{start: 10, count:18}
            // move : {start:10, to:20}
            //  create :{start: 10, count:1, tpl : '3x2'}
            //  create :{list: [10],   tpl : '3x2'}
        };`, (err) => { if (err) errorLog(err); });
    }

    var texts = {};
    var exclude = {}

    var FLIST = fs.readdirSync(dir).filter(f => {
        if (/(~|(_bg))/i.test(f)) {
            if (!/(~$)/.test(f))//-бэкапы
                exclude[f.replace(/(~)/g, '').slice(0, -3)] = f;
            return false;
        }
        return f.indexOf('.') !== -1;
    })
        .filter(f => !exclude[f.slice(0, -3)]);
    infoLog(JSON.stringify(exclude))
    // GET TEXTS
    FLIST.filter(f => f.slice(-3) === 'svg' && !/([_en|~])/.test(f))
        .forEach(f => {
            let svg = fs.readFileSync(f, 'utf8');
            // let list = (svg.match(/<((flowPara)|(text))[^>]*>(([^(<\/flowPara)>)])*)<\/((flowPara)|(text))>/g) || []);
            let list = [], sI = 0, eI = 0, str = svg, close_tag;
            while (true) {
                sI = str.search(/<((flowRoot)|(text))[^>]*>/);
                close_tag = (str.match(/<\/((flowRoot)|(text))>/) || [])[0];
                eI = close_tag ? str.indexOf(close_tag) + close_tag.length : -1;
                if (sI === -1 || eI === -1) break;
                list.push(str.slice(sI, eI));
                str = str.substr(eI);
            }
            texts[f.slice(0, -4)] = {
                pathes: (svg.match(/(<path[^>]*>)/g)||[]).map(
                        p=>{
                            p = p.replace(/sodipodi:nodetypes="[^"]+"/g,"").replace(/\s+/g," ").replace(/\s+/g," ");
                            if(p.indexOf("/>")===-1)p = p.replace(">","/>");
                            return p;
                        }
                    ),
                texts: list.map(
                    t => {
                        let r = {
                            type: t.match(/<((flowRoot)|(text))/)[1],
                            innerText: t.replace(/(<\/tspan>)/g, '\n').replace(/\n\n/g, '\n').replace(/(<[^>]*>)/g, '').trim(),
                            cleanedHTML: t.replace(/id="[^"]+"/g,"").replace(/\s+/g," "),
                            attr: {}

                        };
                        ((t.match(/(<flowRoot[^>]*>\s*<flowRegion[^>]*>\s*(<[\/]{0,1}rect[^\/|>]*[\/]{0,1}>)+<\/flowRegion>\s*<flowPara[^>]*>)/) || t.match(/(<text[^>]*>)/) || [''])[0]
                            .match(/\s([^=\s]+\s*=\s*['|"][^"']+['|"])/g) || [])
                            .forEach(a => {
                                a = a.split('=').map(at => at.trim());
                                let key = a[0], val = a[1];
                                if (val.search(/('|")/) === 0) val = val.slice(1, -1);
                                if (val == +val) val = +val;
                                if (key === "style" && r.attr[key]) r.attr[key] += ';' + val;
                                else r.attr[key] = val
                            });

                        return r;
                    }
                ).filter(t => t.innerText !== 'Текст' && t.innerText !== '&#x422;&#x435;&#x43A;&#x441;&#x442;')
            }
        })

    // fs.writeFile(dir + 'texts.js', 'DATA.scene.texts = ' + JSON.stringify(texts, null, '\t'), (err) => { if (err) return console.log(err); })


    // Чтобы можно было указывть номер сцены, а не полное название
    // if(DATA.scene.next){
    // 	var n = {}; 
    // 	var scenesDir = path.dirname(dir);
    // 	var scenesList = fs.readdirSync(scenesDir).filter(d=>fs.statSync(scenesDir+'/'+d).isDirectory()&&/\d/.test(d));
    // 	scenesList.sort((a,b)=>
    // 		+a.match(/(\d+[\.\d+]*)/)[0] >= +b.match(/(\d+[\.\d+]*)/)[0] ? 1 : -1
    // 	)
    // 	var _dirname_ =  path.basename(dir);
    // 	var dIndex = scenesList.findIndex(d=>d === _dirname_ ); 
    // 	DATA.scene.next = DATA.scene.next.map(k =>
    // 		 k === true ?  scenesList[++dIndex] : scenesList.find((d,i)=>{if(d === _dirname_){dIndex = i; return true}} ) || k
    // 	); 
    // }
    LIST = FLIST.filter(f => {  ///\.(png|jpg)$/i.test(f)
        let fn = f.slice(0, -3); console.log(fn)
        switch (f.slice(-3)) {
            case 'svg': break;//TODO: Создавать только svg в режиме расскадровки
                if (~FLIST.indexOf(fn + 'jpg')) break;//svg само по себе
            case 'jpg':
                if (~FLIST.indexOf(fn + 'png')) break;//у png приоретет
            case 'png':
                // infoLog(fn,fileNumMask.test(fn))
                return fileNumMask.test(fn);
        }
        return false
    })
        .map(f => {
            let f_name = f.substr(0, f.lastIndexOf('.'));
            let num = (f_name.match(fileNumMask) || [])[1] || 0;
            if (num == +num) num = +num;
            return [f_name, { imgFile: f, num: num }, f]; //,f_ind

        })

    DATA.list = LIST.sort((a, b) => {
        return a[1].num > b[1].num ? 1 : -1;
    });

    var count = 0;
    
    // DATA.list.forEach(d => gm(d[1].imgFile).size({ bufferStream: true }, (err, size) => {
    //     if (err) console.error(f);
    //     Object.assign(d[1], size);
    //     count++;

    //     if (count === DATA.list.length)
    //         fs.writeFile(
    //             dir + '/SceneDATA.js',
    //             `DATA = ${JSON.stringify(DATA)};\nDATA.scene.texts = ${JSON.stringify(texts, null, '\t')}`,

    //             (err) => { if (err) return errorLog(err); }
    //         );

    // }))

    // DATA.list.forEach(d =>{
    //     child_process.exec('identify -format "%w|%h" "' + d[1].imgFile + '"', (err, stdout, stderr) => {
    //     if (err) console.error('identify ' + d[1].imgFile);
    //     var size = stdout.split('|');
    //     d[1].width = +size[0];
    //     d[1].height = +size[1]; 
    //     count++;

    //     if (count === DATA.list.length){
            console.log('writte ' + dir + '/SceneDATA.js')
            fs.writeFile(
                dir + '/SceneDATA.js',
                `DATA = ${JSON.stringify(DATA)};\nDATA.scene.texts = ${JSON.stringify(texts, null, '\t')}`,

                (err) => { if (err) return errorLog(err); }
            );
    //         }

    // })})

} catch (error) {
    errorLog(error)
}