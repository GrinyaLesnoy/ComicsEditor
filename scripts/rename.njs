var fs = require('fs');
var path = require('path');
let dir = (process.argv[2]||__dirname).replace(/\\/g,'/');


var _root = dir, project = {};

while(_root&&_root!=='.'&&_root!=='/'){
    if(fs.existsSync(_root + '/project.json')){
        project = JSON.parse( fs.readFileSync(_root + '/project.json', 'utf8') )
        break;
    }
    _root = path.posix.dirname(_root);
}
let dirName = path.posix.basename(dir);
let sceneNum = dirName.match(new RegExp(project.sceneNameMask))[1];
if(sceneNum == +sceneNum)sceneNum = +sceneNum;
var fileNumMask = new RegExp( project.fileNumMask);
var sceneNameMask = new RegExp(project.sceneNameMask);

const PREF_ = project.frameName.replace(/(\%[^\%]+%)/g,s=>{
	switch(s.replace(/%/g,'')){case 'scene': return sceneNum; default:return ''}
});
const MIN = +(project.frameName.match(/%count:(\d)*%/)||[0,4])[1];


project.root = path.posix.join(_root,project.root || '.')
project.scenesDir = path.posix.join(project.root,project.scenesDir || '.')
project.dataDir = path.posix.join(project.root,project.dataDir || "Data")

if(dir.slice(-1)!='/')dir+='/';
var errorLog = (error)=>{

	console.error(error)
	var fn = path.basename(__filename)
	var efPath = dir+'/error.log'
	var lastErr = '';
	if(fs.existsSync(efPath))lastErr = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';
	
	fs.writeFile(efPath, `${lastErr}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${error.stack || error}`, (err)=>{if(err)return console.log(err);}); 

}

var infoLog = (info)=>{

	console.log(info) 
	var fn = path.basename(__filename)
	var efPath = dir+'/info.log'
	var lastInfo = '';
	if(fs.existsSync(efPath))lastInfo = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';
	
	fs.writeFile(efPath, `${lastInfo}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${info}`, (err)=>{if(err)return console.log(err);}); 

}
infoLog('start');
// infoLog(`root: ${_root} Data:  ${project.dataDir}`);
try{
var A = require(dir+'/_renameData.njs'); 
// infoLog('A')
var cb = ()=>{ 
	var child_process = require('child_process');
	child_process = child_process.spawn('node',['SceneData.njs',dir]) 
	// require('./getTexts.njs');
	// require('./create_svg.njs');
} 

// let opt = {
// 	Sasha : {
// 		reg : /K.S.[0-9]*.([0-9]*)/,
// 		MIN : 4,
// 		PREF_ : 'K.S.' + path.posix.basename(dir).match(/(\d)+/)[0] +'.'
// 		},
// 		VNII : {
// 		reg : /Kt.K.([0-9]*)/,
// 		MIN: 3,
// 		PREF_ : 'Kt.K.'
// 		}
// }, C = dir.indexOf('ВНИИ')!==-1 ? 'VNII' : 'Sasha';infoLog(C);
// 	// opt = opt[C];
// 	// opt.name = C; 
// 	var reg;

 
var rename = (o)=>{  
	if (!fs.existsSync(dir+o.f_new)) { 
		fs.renameSync(dir+o.f_old, dir+o.f_new) 
		infoLog(`rename ${o.f_old} => ${o.f_new}` ); 
		//
		if(~o.f_new.indexOf('.svg')){
			let svg = fs.readFileSync(dir+o.f_new, 'utf8') ; 
			svg = svg.replace(new RegExp(o.Name_old,'g'),o.Name_new);
			 
			fs.writeFileSync(dir+o.f_new, svg, (err)=>{if(err)errorLog(err);}); 
		}   
	}else{ errorLog('err '+ o.f_old + ' => '+ dir+o.f_new);  }
}

DO = {
// Переименовывает файлы. 
// Выборочно {oldNum:newNum} 
// или пактно 
// [StartNum, +Num]  ([StartNum, EndNum = count,  +Num, Step = 10]) 
// {start:N, count: M} {start:N, to: M}  ({start, end,to,step})
move : function(options){//start,end,step,s=10
	var files = fs.readdirSync(dir), dict=[]; 
	let reg = new RegExp(project.fileNumMask); 
	if(Array.isArray(options) && Array.isArray(options[0]))dict = options;// [[from,to]]
	else if(Array.isArray(options) || ('start' in options)){//[start,end,to,step=10] || {start : ...,}
		var to_abs;
		if(Array.isArray(options)){
			var [start,end,to,step=10] = options;
			if(!to){ to = end, end = false };
		}else{
			var start = options.start, end = options.end, to=options.to,  step=options.step || 10;
			to_abs = options.TO;
		}
		let nums = {}; 
		files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
			let n = f.match(reg);
			if(n&&n[1]){
				n = +n[1];
				if(n>=start &&  (!end || n<=end))nums[n]=n;
			}
		});
		nums = Object.values(nums);
		nums.sort((a,b)=>a>b?1:-1);
 
		to_abs = to_abs ||  Math.ceil((nums[0]+to)/10)*10;// Из относительного в абсолютное
		// infoLog(`move ${nums}`);
		infoLog(`move ${start} , ${to_abs}`); 
		dict = nums.map(num=>{ 
				let new_num = to_abs; //
				to_abs+=step;
				return [num,new_num];
			});  

		if(to>0)dict.sort((a,b)=>b[0]>a[0] ? 1 : -1);  //если назад - от первого к последнему
		
	}else{ //{from:to}
		for(let from in options)dict.push([from, options[from]]);
	}
	// return
	// infoLog(`move ${dict}`);
		// console.log( dict) 
		for(let d of dict){
			let [from,to] = d;
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
			let list = files.filter(f=>reg.test(f));  

			from = new RegExp(from);
			let new_list = list.map(f=>f.replace(from,to)); 
			if( !new_list.find(f=> fs.existsSync(dir+f)) ){//Не повторяется вся группа (иначе возникает чехарда)
				list.forEach((f,i) => {
					rename({
						f_old:f,
						f_new:new_list[i],
						Name_old:PREF_ +  from,
						Name_new:PREF_ +  to
					});
				})
			}
		}
 
	 
	cb()
},  
exchange(options){
	var files = fs.readdirSync(dir), dict=[]; 
	let reg = new RegExp(project.fileNumMask); 
	for(let from in options){

		dict.push([from, options[from]]);
	}
		for(let d of dict){
			let [from,to] = d;
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
			let list = files.filter(f=>reg.test(f));  

			from = new RegExp(from);
			let new_list = list.map(f=>f.replace(from,to)); 
			if( !new_list.find(f=> fs.existsSync(dir+f)) ){//Не повторяется вся группа (иначе возникает чехарда)
				list.forEach((f,i) => {
					rename({
						f_old:new_list[i],
						f_new:f+'___tmp',
						Name_old:PREF_ +  from,
						Name_new:PREF_ +  to+'___tmp'
					});
					rename({
						f_old:f,
						f_new:new_list[i],
						Name_old:PREF_ +  from,
						Name_new:PREF_ +  to
					});
					rename({
						f_old:f+'___tmp',
						f_new:f,
						Name_old:PREF_ +  to,
						Name_new:PREF_ +  from+'___tmp'
					});
				})
			}
		}

},
// Создаие новых кадров (аналог move : [Num1,Num2,Num3...] или {start,count,end,step} )
create : function(o){infoLog(`create`); 
	console.log(o);
	var $tpl = 'frame';
	var $f = [];
	if(Array.isArray(o)){//список имён
		$f = o;
	}else {
		// let o = o;
		console.log(o)
		if(('start' in o) || ('count' in o)){
			let start = o.start, step = o.step || 10;
			if(!start || start === '+'){
				start = 10;
				var files = fs.readdirSync(dir);
				let reg = new RegExp(project.fileNumMask); 
				files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
					let n = f.match(reg);
					if(n&&n[1]) start = Math.max(start,+n[1]+step); 
				}); 
			}
			let  end = o.end || (start + (o.count-1) * step); 
			if(end)
			for(var t = start; t<= end; t+=step)$f.push( t );
		}	
		
		if(o.list)$f = $f.concat( o.list ).sort();

		console.log($f);

		if(o.tpl){
			if( o.tpl == +o.tpl )$tpl+=o.tpl;//Суффикс 1,2 ...
			else $tpl = o.tpl;
		}
	}  
	var tplPNG = project.dataDir + '/template/' + $tpl + '.png';
	var tplKRA = project.dataDir + '/template/' + $tpl + '.kra';

	for(let n of $f){
		let name = n+''; 
		if(MIN>name.length)name ='0'.repeat(MIN-name.length)+name;
		name = PREF_ +  name;
		if (!fs.existsSync(dir+name + '.png')) 
			fs.copyFileSync(tplPNG, dir+name + '.png');
		if (!fs.existsSync(dir+name + '.kra'))
			fs.copyFileSync(tplKRA, dir+name + '.kra');
			
			
		}  
	 
	cb( )
},  
// Меняет номер сцены в имени файлов [с,по]
rescene : function(o){
	let [from,to]= o;console.log([from,to])
	var files = fs.readdirSync(dir);
	var _f = new RegExp('(\\.'+from +'\\.)'),_t=`.${to}.`;
	files.forEach(f=>{
		if(_f.test(f)){
			
			fs.renameSync(dir+f, dir+f.replace(_f,_t)) 
		}
	})
},
// Исправление последствий неправильного переименования
fixName : function( ){
	var files = fs.readdirSync(dir);
		let reg = new RegExp(project.fileNumMask); 
		files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
			let n = f.match(reg);
			if(n&&n[1]){
				let name = (+n[1])+'';
				if(MIN>name.length)name ='0'.repeat(MIN-name.length)+name;
				if(name!==n){
					var nf = f.replace(reg,name);
					fs.renameSync(dir+f, dir+nf);
					if(nf.indexOf('.svg')>0){
						let svg = fs.readFileSync(dir+nf, 'utf8') ; 
						svg = svg.replace(new RegExp(n,'g'),name); 
						fs.writeFileSync(dir+nf, svg, (err)=>{if(err)errorLog(err);})
					}
				} 
			
			}
		}); 
},
 clean : function(){
	//  1) Проходимся по списку файлов, нахдим, где есть svg и меняем его содержимое на то, что задано в списке, а также выравниваем
	 // 2) Создаем словарь {file.svg:{name:n, img:im, w:w,h:h...}}
	var dict = { }
	var files = fs.readdirSync(dir);
	let reg = new RegExp(project.fileNumMask); 
	files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
		let n = f.match(reg);
		if(n&&n[1]&&f.indexOf('.svg')){
			let i = f.lastIndexOf('.');
			let f_name = f.substr(0, i);
			let type =  f.substr(i+1).toLowerCase();
			if(type === 'jpeg')type = 'jpg';
			if(type === 'jpg' || type === 'png' || type === 'svg'){
				dict[f_name] = dict[f_name] || {'svg' : []}
				if(type === 'svg')dict[f_name].svg.push(f);
				else if(type === 'png' || type === 'jpg' && !dict[f_name].img)dict[f_name].img = f;
			}
		}
	});
	var imgReg = /<image[^>]+href=["']([^"']*)["']/;
	for(var name in dict){
		let d = dict[name];
		let img = d.img || '';
		d.svg.forEach(f=>{
			let svg = fs.readFileSync(f, 'utf8'); 
			let r = svg.match(imgReg);
			if(r&&r.length>1){
				let Name_old = r[1];
				if(Name_old!==img){
					svg = svg.replace(new RegExp(Name_old,'g'),img);
					fs.writeFile(f, svg, (err)=>{if(err)return console.log(err);}); 
				}
			}
		})
	}
 }

}
infoLog(A);
// if(A instanceof Array)for(var d of A)if(typeof DO[d[0]] === 'function')DO[d[0]](d[1]);
// else 
for(var a in A)if(typeof DO[a] === 'function')DO[a](A[a]);
// if(A.move)move(A.move); 
// if(A.create) Array.isArray(A.create) ? create.apply(null,A.create) : create(A.create); 
// if(A.rescene) rescene.apply(null,A.rescene); 

 setTimeout(()=>infoLog('done'),2000);  
} catch (error) {
	errorLog(error)
}
