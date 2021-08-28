var fs = require('fs');
const { tmpdir } = require('os');
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
		// if(~o.f_new.indexOf('.svg')){
		// 	let svg = fs.readFileSync(dir+o.f_new, 'utf8') ; 
		// 	svg = svg.replace(new RegExp(o.Name_old,'g'),o.Name_new);
			 
		// 	fs.writeFileSync(dir+o.f_new, svg, (err)=>{if(err)errorLog(err);}); 
		// }   
	}else{ errorLog('err '+ o.f_old + ' => '+ dir+o.f_new);  }
}

DO = {
// Переименовывает файлы. 
// Выборочно {oldNum:newNum} 
// или пактно 
// [StartNum, +Num]  ([StartNum, EndNum = count,  +Num, Step = 10]) 
// {start:N, count: M} {start:N, to: M}  ({start, end,to,step})
move : function(options,filter){//start,end,step,s=10
	var files = fs.readdirSync(dir), dict=[]; 
	var $tmpDir = dir+'/$tmp';
	if(!fs.existsSync($tmpDir)){
		fs.mkdirSync($tmpDir);
	}else if(fs.readdirSync($tmpDir).length > 0){
		errorLog('clean temp dir!');
		return;
	}
	$tmpDir += '/';

	let reg = new RegExp(project.fileNumMask); 
	if(Array.isArray(options) && Array.isArray(options[0]))dict = options;// [[from,to]]
	else if(Array.isArray(options) || ('start' in options)){//[start,end,to,step=10] || {start : ...,}
		var to_abs;
		if(Array.isArray(options)){
			var [start,end,to,step=10] = options;
			if(!to){ to = end, end = false };
		}else{
			var {start,end,to,step=10} = options; 
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
		// console.log(nums)
		if(to_abs){
			to = to_abs - nums[0];
		}else{ 
			to_abs = Math.ceil((nums[0]+to)/10)*10;// Из относительного в абсолютное
		}
 
		;  
		// infoLog(`move ${nums}`);
		infoLog(`move ${start} , ${to_abs}`); 
		dict = nums.map((num, i)=>{ 
			// if(step>0)while(to_abs<=num)to_abs+=step;
			// else if(step<0)while(to_abs>=num)to_abs+=step; 
			let new_num = to_abs + i*step; //
			// to_abs+=step;
			return [num,new_num];
		});   

		// if(to>0)dict.sort((a,b)=>b[0]>a[0] ? 1 : -1);  //если назад - от первого к последнему
		 
	}else{ //{from:to}
		for(let from in options)dict.push([from, options[from]]);
	}
	// return
	// infoLog(`move ${dict}`);
		// console.log( dict,) 
		// return;
		// errorLog( JSON.stringify(dict) ); 
	
		fs.writeFile('lastRenameList.json',  JSON.stringify(dict,null,'\t') , (err)=>{if(err)return console.log(err);}); 

		for(let d of dict){
			//$tmpDir
			let [from,to] = d; 
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
			let list = files.filter(f=>reg.test(f));  
			if(filter instanceof RegExp)list = list.filter(f=>filter.test(f));  

			from = new RegExp(from);
			let new_list = list.map(f=>f.replace(from,to)); 
			if(
				list.find((f,i) => {
					// return true;
					let nf = new_list[i];
					if(fs.existsSync($tmpDir+nf))return true; //Мало ли, какая херня
					fs.renameSync(dir+f, $tmpDir+nf);
				})
			){
				errorLog('err '+ from + ' => '+ to + ' in $tmp ' ); 
				return;
			}

		}
		files = fs.readdirSync(dir);
		var tmpFiles = fs.readdirSync($tmpDir);
		//Проверка, нет ли занятых имён
		var zanyat = tmpFiles.find( f=> fs.existsSync(dir+f) );
		if(zanyat){
			errorLog('err   : ' + zanyat ); 
			return;
		}
		tmpFiles.forEach((f,i)=>{
			fs.renameSync($tmpDir+f, dir+f);
			// infoLog($tmpDir+f + ' - ' + dir+f);
		});
		// for(let d of dict){
		// 	let [from,to] = d; 
		// 	from = from+''; 
		// 	if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
		// 	to = to+'';
		// 	if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

		// 	reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
		// 	let list = files.filter(f=>reg.test(f));  

		// 	from = new RegExp(from);
		// 	let new_list = list.map(f=>f.replace(from,to)); 
		// 	let zanyat =  new_list.find(f=> fs.existsSync(dir+f));
		// 	if( !zanyat ){//Не повторяется вся группа (иначе возникает чехарда)
		// 		if(list.find((f,i) => {
		// 			// return true;
		// 			let nf = new_list[i];
		// 			if (!fs.existsSync(dir + nf)) { 
		// 				fs.renameSync(dir+f, dir+nf) 
		// 				infoLog(`rename ${f} => ${nf}` );   
		// 			}else{ 
		// 				errorLog('err '+ f + ' => '+ nf); 
		// 				return true;
		// 			}


		// 			// rename({
		// 			// 	f_old:f,
		// 			// 	f_new:new_list[i],
		// 			// 	Name_old:PREF_ +  from,
		// 			// 	Name_new:PREF_ +  to
		// 			// });
		// 		})){
		// 			break;
		// 		}
		// 	}else{
		// 		errorLog('err '+ from + ' => '+ to + ' : ' + zanyat );  
		// 		break;
		// 	}
		// }
 
	 
	cb()
},  
copy (options){//start,end,step,s=10
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
		// console.log(nums)
		if(to_abs){
			to = to_abs - nums[0];
		}else{ 
			to_abs = Math.ceil((nums[0]+to)/10)*10;// Из относительного в абсолютное
		}
 
		;  
		// infoLog(`move ${nums}`);
		infoLog(`copy ${start} , ${to_abs}`); 
		dict = nums.map((num, i)=>{ 
			// if(step>0)while(to_abs<=num)to_abs+=step;
			// else if(step<0)while(to_abs>=num)to_abs+=step; 
			let new_num = to_abs + i*step; //
			// to_abs+=step;
			return [num,new_num];
		});   

		// if(to>0)dict.sort((a,b)=>b[0]>a[0] ? 1 : -1);  //если назад - от первого к последнему
		 
	}else{ //{from:to}
		for(let from in options)dict.push([from, options[from]]);
	}
	 
		for(let d of dict){
			//$tmpDir
			let [from,to] = d; 
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
			let list = files.filter(f=>reg.test(f));  

			from = new RegExp(from);
			list.forEach(f=>{
				var nf = f.replace(from,to);
				if(!fs.existsSync(nf)){
					fs.copyFileSync(f, nf );
					// fs.renameSync(f, nf);
				}
			});  

		} 
 
	 
	cb()
},
exchange(options){
	var files = fs.readdirSync(dir), dict=[]; 
	var $tmpDir = dir+'/$tmp'; 
	if(!fs.existsSync($tmpDir)){
		fs.mkdirSync($tmpDir);
	}else if(fs.readdirSync($tmpDir).length > 0){
		errorLog('clean temp dir!');
		return;
	}
	$tmpDir += '/';
	
	 if(options instanceof Array){
		for (let item of options){
			// TODO: njs event ?..
		}
	 }else{
		 var dictPar = options.dict || options; 
		var opt = options, dict = {}; 
		for (let from in dictPar){
			if(from == +from){ 
				dict[from] = dictPar[from]+''; 
				dict[dictPar[from]] = from+''; 
			} 
		}
		// DO.move(opt)
	 }

	 if(opt.nosvg)opt.exclude = 'svg'; //

	 
	 for(let d in dict){
		//$tmpDir 
		let from = d;
		let to = dict[d]; 
		if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from;  
		if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

		reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~){0,1}\.\[a-z~]+$)')
		let list = files.filter(f=>reg.test(f));  
		if(opt.filter instanceof RegExp)list = list.filter(f=>opt.filter.test(f));  
		if(opt.exclude instanceof RegExp)list = list.filter(f=>!opt.exclude.test(f));  
		else if(typeof opt.exclude === 'string')list = list.filter(f=>f.indexOf(opt.exclude)===-1);  
		if(opt.include instanceof RegExp)list = list.filter(f=>opt.include.test(f));  
		else if(typeof opt.include === 'string')list = list.filter(f=>f.indexOf(opt.include)!==-1);  

		from = new RegExp(from);
		let new_list = list.map(f=>f.replace(from,to)); 
		if(
			list.find((f,i) => {
				// return true;
				let nf = new_list[i];
				if(fs.existsSync($tmpDir+nf))return true; //Мало ли, какая херня
				fs.renameSync(dir+f, $tmpDir+nf);
			})
		){
			errorLog('err '+ from + ' => '+ to + ' in $tmp ' ); 
			return;
		}

	}
	files = fs.readdirSync(dir);
	var tmpFiles = fs.readdirSync($tmpDir);
	//Проверка, нет ли занятых имён
	var zanyat = tmpFiles.find( f=> fs.existsSync(dir+f) );
	if(zanyat){
		errorLog('err   : ' + zanyat ); 
		return;
	}
	tmpFiles.forEach((f,i)=>{
		fs.renameSync($tmpDir+f, dir+f);
		// infoLog($tmpDir+f + ' - ' + dir+f);
	});
},
// Создаие новых кадров (аналог move : [Num1,Num2,Num3...] или {start,count,end,step} )
create : function(o){infoLog(`create`); 
	console.log(o);
	var $tpl = 'frame';
	var $f = [];
	if(Array.isArray(o)){//список имён
		if(o[1]<o[0]&&o[1]<50 || typeof o[1] === 'string'){//[170,12] || [170,'12']; 50 за раз - ограничение, чтобы не нафигачил снова несколько тысяч из-за опечатеи 
			let start = o[0], count=parseInt(o[1]), step = o[2] || 10;
			$f = Array.from({length:count},(v,i)=>( start + i*step ));
		}else{//[170,180...] 
			$f = o;
		}
	}else {
		// let o = o;
		console.log(o)
		if(o.list&&o.list.length>0)$f = $f.concat( o.list ).sort();
		else if(('start' in o) || ('count' in o)){
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
		

		console.log($f);

		if(o.tpl){
			if( o.tpl == +o.tpl || o.tpl[0] == +o.tpl[0] )$tpl+=o.tpl;//Суффикс 1,2 ...
			else $tpl = o.tpl;
		}
	}  
	var tplPNG = project.dataDir + '/template/' + $tpl + '.png';
	var tplKRA = project.dataDir + '/template/' + $tpl + '.kra';
	for(let n of $f){
		let name = n+''; 
		if(MIN>name.length)name ='0'.repeat(MIN-name.length)+name;
		name = PREF_ +  name;
		console.log(name)
		if (!fs.existsSync(dir+name + '.png')) 
			fs.copyFileSync(tplPNG, dir+name + '.png');
		if (!fs.existsSync(dir+name + '.kra'))
			fs.copyFileSync(tplKRA, dir+name + '.kra');
			
			
		}  
	 
	cb( )
},  
// Меняет номер сцены в имени файлов [с,по]
rescene : function(o){
	let [from,to,shift]= o;console.log([from,to])
	var files = fs.readdirSync(dir);
	var _f = new RegExp('(\\.'+from +'\\.)'),_t=`.${to}.`;
	files.forEach(f=>{
		if(_f.test(f)){
			var nf = dir+f.replace(_f,_t);
			if(shift){
				let reg = new RegExp(project.fileNumMask); 
				let n = f.match(reg); 
				if(n&&n[1]){
					n = n[1]; 
					let from = n;
					let to =( (+n)+shift)+''; 
					if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from;  
					if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 
					nf = n.replace(from,to);
				}
			}
			if(!fs.existsSync(nf)) 
				fs.renameSync(dir+f, nf) 
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
			let r = svg.match(imgReg),change = false;
			if(r&&r.length>1){
				let Name_old = r[1];
				if(Name_old!==img){
					svg = svg.replace(new RegExp(Name_old,'g'),img);
					change = true;
				}
			}
			if(svg.indexOf('xmlns:inkscape')==-1){
				svg = svg.replace('"http://www.w3.org/2000/svg"','"http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"');
				change = true;
			}
			if(svg.indexOf('xmlns:sodipodi')==-1){
				svg = svg.replace('"http://www.w3.org/2000/svg"','"http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"');
				change = true;
			}
			if(svg.indexOf('inkscape:window-maximized')==-1){
				svg = svg.replace('<defs',`
				<sodipodi:namedview inkscape:window-maximized="1" />
				<defs`);
				change = true;
			}
			if(change){
				console.log(f,change)
				fs.writeFile(f, svg, (err)=>{if(err)return console.log(err);}); 
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
