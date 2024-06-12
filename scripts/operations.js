var fs = require('fs');
const { tmpdir } = require('os');
var path = require('path'); 


const confName = 'actionsDo.js'
const confOldName = '_renameData.njs'

let projectData; 
const getProject = (dir)=>{
    if(!projectData){
        let _root = dir
        console.log('_root',_root)
        while(_root&&_root!=='.'&&_root!=='/'){
            console.log('_root',_root)
            let rootPath = path.posix.join(_root , 'project.json')
            if(fs.existsSync(rootPath)){
                projectData = JSON.parse( fs.readFileSync(rootPath, 'utf8') )
                break;
            }
            _root = path.dirname(_root);
            console.log('_root',_root)
        }
        
        projectData.fileNumMask = new RegExp( projectData.fileNumMask);
        projectData.sceneNameMask = new RegExp(projectData.sceneNameMask);
       
        projectData._MIN = +(projectData.frameName.match(/%count:(\d)*%/)||[0,4])[1];
        projectData.sceneInfo = {}
        
        projectData.root = path.posix.join(_root,projectData.root || '.')
        projectData.scenesDir = path.posix.join(projectData.root,projectData.scenesDir || '.')
        projectData.dataDir = path.posix.join(projectData.root,projectData.dataDir || "Data")
    }

    if(!projectData.sceneInfo[dir]){
        let item = {}
        let dirName = path.posix.basename(dir);
        let sceneNum = dirName.match(new RegExp(projectData.sceneNameMask))[1];
        if(sceneNum == +sceneNum)sceneNum = +sceneNum;
        item.sceneNum = sceneNum
        item.prefix_ = projectData.frameName.replace(/(\%[^\%]+%)/g,s=>{
            switch(s.replace(/%/g,'')){case 'scene': return sceneNum; default:return ''}
        });
        projectData.sceneInfo[dir] = item
    }
    
    return projectData;
} 
 
const errorLog = (dir,error)=>{

	console.error(error)
	var fn = path.basename(__filename)
	var efPath = path.join( dir,'error.log')
	var lastErr = '';
	if(fs.existsSync(efPath))lastErr = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';
	
	fs.writeFile(efPath, `${lastErr}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${error.stack || error}`, (err)=>{if(err)return console.log(err);}); 

}

const infoLog = (dir, info)=>{

	console.log(info) 
	var fn = path.basename(__filename)
	var efPath = path.join( dir,'info.log') 
	var lastInfo = '';
	if(fs.existsSync(efPath))lastInfo = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';
	
	fs.writeFile(efPath, `${lastInfo}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${info}`, (err)=>{if(err)return console.log(err);}); 

}
// infoLog(`root: ${_root} Data:  ${project.dataDir}`);

// infoLog('A')
var cb = (dir)=>{ 
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
 

const DO = {
// Переименовывает файлы. 
// Выборочно {oldNum:newNum} 
// или пактно 
// [StartNum, +Num]  ([StartNum, EndNum = count,  +Num, Step = 10]) 
// {start:N, count: M} {start:N, to: M}  ({start, end,to,step})
move : function(dir, options,filter){//start,end,step,s=10
	var files = fs.readdirSync(dir), dict=[]; 
	var $tmpDir = path.join(dir,'$tmp');
	if(!fs.existsSync($tmpDir)){
		fs.mkdirSync($tmpDir);
	}else if(fs.readdirSync($tmpDir).length > 0){
		errorLog(dir,'clean temp dir!');
		return;
	} 

    const project = getProject(dir)
    const PREF_ = project.sceneInfo[dir].prefix_
    const MIN = project._MIN

	let reg = new RegExp(project.fileNumMask); 
	if(options === -1){
		options = fs.readFileSync(path.join(dir,'lastRenameList.json'))
		options = JSON.parse(options).map(it=>it.reverse())
	}
	if(Array.isArray(options) && Array.isArray(options[0])){
		dict = options;// [[from,to]]
	}
	else if(Array.isArray(options) || ('start' in options)){//[start,end,to,step=10] || {start : ...,}
		var to_abs, saveSteps = false;
		if(Array.isArray(options)){
			var [start,end,to,step=10] = options;
			if(!to){ to = end, end = false };
		}else{
			var {start,end,to,step=10} = options; 
			if(step === false){
				step = 10; saveSteps = true
			}
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
		infoLog(dir,`move ${start} , ${to_abs}`); 
		dict = nums.map((num, i)=>{ 
			// if(step>0)while(to_abs<=num)to_abs+=step;
			// else if(step<0)while(to_abs>=num)to_abs+=step;
			let new_num; 
			if(saveSteps)
				new_num = num + to;
			else	
				new_num = to_abs + i*step; //
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
	
		fs.writeFile(path.join(dir,'lastRenameList.json'),  JSON.stringify(dict,null,'\t') , (err)=>{if(err)return console.log(err);}); 

		for(let d of dict){
			//$tmpDir
			let [from,to] = d; 
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~|(_bg)){0,1}\.\[a-z~]+$)','i')
			let list = files.filter(f=>reg.test(f));  
			if(filter instanceof RegExp)list = list.filter(f=>filter.test(f));  

			from = new RegExp(from);
			let new_list = list.map(f=>f.replace(from,to)); 
			if(
				list.find((f,i) => {
					// return true;
					let nf = new_list[i];
                    let np = path.join($tmpDir,nf)
					if(fs.existsSync(np))return true; //Мало ли, какая херня
					fs.renameSync(path.join(dir,f), np);
				})
			){
				errorLog(dir,'err '+ from + ' => '+ to + ' in $tmp ' ); 
				return;
			}
			console.log(from + ' => '+ to,true)

		}
		files = fs.readdirSync(dir);
		var tmpFiles = fs.readdirSync($tmpDir);
		//Проверка, нет ли занятых имён
		var zanyat = tmpFiles.find( f=> fs.existsSync(path.join(dir,f)) );
		if(zanyat){
			errorLog(dir,'err   : ' + zanyat ); 
			return;
		}
		tmpFiles.forEach((f,i)=>{
			fs.renameSync(path.join($tmpDir,f), path.join(dir,f));
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
 
	 
	cb(dir)
},  
copy (dir, options){//start,end,step,s=10
	var files = fs.readdirSync(dir), dict=[];   
    const project = getProject(dir);
    const PREF_ = project.sceneInfo[dir].prefix_;
    const MIN = project._MIN;
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
		infoLog(dir, `copy ${start} , ${to_abs}`); 
		dict = nums.map((num, i)=>{ 
			// if(step>0)while(to_abs<=num)to_abs+=step;
			// else if(step<0)while(to_abs>=num)to_abs+=step; 
			let new_num = to_abs + i*step; //
			// to_abs+=step;
			return [num,new_num];
		});   

		// if(to>0)dict.sort((a,b)=>b[0]>a[0] ? 1 : -1);  //если назад - от первого к последнему
		 
	}else{ //{from:to}
		for(let from in options){
			if(options[from] instanceof Array)
				for(let to of options[from])dict.push([from, to]);
			else
			dict.push([from, options[from]]);
	}
		}
		console.log(dict)
		for(let d of dict){
			//$tmpDir
			let [from,to] = d; 
			from = from+''; 
			if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from; 
			to = to+'';
			if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

			reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~|(_bg)){0,1}\.\[a-z~]+$)','i')
			let list = files.filter(f=>reg.test(f));  

			from = new RegExp(from);
			list.forEach(f=>{
				var nf = f.replace(from,to);
				if(!fs.existsSync(nf)){
					fs.copyFileSync(path.join(dir,f), path.join(dir,nf) );
					// fs.renameSync(f, nf);
				}
			});  

		} 
 
	 
	cb(dir)
},
exchange(dir, options){
    const project = getProject(dir);
    const PREF_ = project.sceneInfo[dir].prefix_;
    const MIN = project._MIN;

	var files = fs.readdirSync(dir), dict=[]; 
	var $tmpDir = path.join(dir,'$tmp'); 
	if(!fs.existsSync($tmpDir)){
		fs.mkdirSync($tmpDir);
	}else if(fs.readdirSync($tmpDir).length > 0){
		errorLog(dir,'clean temp dir!');
		return;
	} 
	
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

	 if(opt.nosvg || opt.svg === false)opt.exclude = 'svg'; //

	 
	 for(let d in dict){
		//$tmpDir 
		let from = d;
		let to = dict[d]; 
		if(MIN>from.length)from ='0'.repeat(MIN-from.length)+from;  
		if(MIN>to.length)to ='0'.repeat(MIN-to.length)+to; 

		reg = new RegExp('(^(' + PREF_ +  from + ')((_en)|~|(_bg)){0,1}\.\[a-z~]+$)','i')
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
                let np = path.join( $tmpDir,nf)
				if(fs.existsSync(np))return true; //Мало ли, какая херня
				fs.renameSync(path.join(dir,f),np);
			})
		){
			errorLog(dir,'err '+ from + ' => '+ to + ' in $tmp ' ); 
			return;
		}

	}
	files = fs.readdirSync(dir);
	var tmpFiles = fs.readdirSync($tmpDir);
	//Проверка, нет ли занятых имён
	var zanyat = tmpFiles.find( f=> fs.existsSync(path.join(dir,f)) );
	if(zanyat){
		errorLog(dir,'err   : ' + zanyat ); 
		return;
	}
	tmpFiles.forEach((f,i)=>{
		fs.renameSync(path.join($tmpDir,f), path.join(dir,f));
		// infoLog($tmpDir+f + ' - ' + dir+f);
	});
},
// Создаие новых кадров (аналог move : [Num1,Num2,Num3...] или {start,count,end,step} )
create : function(dir,o){infoLog(dir,`create`); 
    const project = getProject(dir);
    const PREF_ = project.sceneInfo[dir].prefix_;
    const MIN = project._MIN;
	var $tpl = 'frame';
	var $f = [];
	var par = o;
	console.log(par);
	
	if(Array.isArray(o)){//список имён 
		if(o[0] instanceof Array){
			par = {list:o[0]}
			if(typeof o[1] === "string"){par.tpl = o[1];}
		}else
		if( o[1]<=o[0] || typeof o[1] === 'string'){//[170,12] || [170,'12']; 50 за раз - ограничение, чтобы не нафигачил снова несколько тысяч из-за опечатеи 
			par = {start:o[0], count: 1} 
			if(isNaN(+o[1]))
			{
				par.tpl = o[1];
			}else{
				par.count = +o[1];
			}
			if(typeof o[2] === "number"){par.step = o[2];}
			if(typeof o[2] === "string"){par.tpl = o[2];}
			else if(typeof o[3] === "string"){par.tpl = o[3];} 
		}else{//[170,180...] .. [[10,20]]  
			par = {list:o}
		}
	} 

		// let o = o;
		console.log(par)
		if(par.list&&par.list.length>0)$f = par.list.flat().sort();
		else if(('start' in par) || ('count' in par)){
			if(par.count > 50 )return console.error('ERROR: count > 50');;//Защита от опечатки
			let start = par.start, step = par.step || 10;
			if(!start || start === '+'){
				start = step;
				var files = fs.readdirSync(dir);
				let reg = new RegExp(project.fileNumMask); 
				files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
					let n = f.match(reg);
					if(n&&n[1]) start = Math.max(start,+n[1]+step); 
				}); 
			}
			// let  end = par.end || (start + (par.count-1) * step); 
			// if(end)
			// for(var i = start; i<= end; i+=step)$f.push( i );
			// let count = par.count || Math.round( (start - par.end + step)/step ) 
			if(par.count)
				$f = Array.from({length:par.count},(v,i)=>( start + i*step ));
			else if(par.end){
				$f = [];
				for(var i = start; i<= par.end; i+=step)$f.push( i );
			}
		}	
		

		console.log($f);

		if(par.tpl){
			if( !isNaN(+par.tpl)  || par.tpl[0] == +par.tpl[0] )$tpl+=par.tpl;//Суффикс 1,2 ...
			else $tpl = par.tpl;
		} 
	let templateDir = path.posix.join(project.dataDir , 'template') 
	let types = ["kra","png"]
	let tpls = {}
	let templatesStats = {};
	types.forEach(ext=>{
		templatesStats[ext]=[]
		tpls[ext]=path.posix.join(templateDir, $tpl + '.' + ext);
	})

	if(par.force)fs.readdirSync(templateDir).forEach(f=>{
		let s = fs.statSync(path.posix.join(templateDir, f))
		s.fullName = f;
		let t = f.split('.')
		s.extend = t.pop()
		s.name = t.join('.')
		if(s.extend in templatesStats)templatesStats[s.extend].push(s)
	})
	for(let n of $f){
		let name = n+''; 
		if(MIN>name.length)name ='0'.repeat(MIN-name.length)+name;
		name = PREF_ +  name;
		let okList = [];
		for(let ext of types){
			let fullName = path.join(dir,name + '.' + ext)
			let doFile = !fs.existsSync(fullName)
			if(par.force && !doFile){
				let stat = fs.statSync(fullName)
				doFile = !!templatesStats[ext].find(
					t=> t.name !== $tpl && t.extend === ext && stat.size === t.size
					)
			}
			okList.push(doFile && ext)
			if(doFile)fs.copyFileSync(tpls[ext],fullName);
		} 
		console.log(name,okList);  
			
		}  
	 
	cb(dir )
},  
// Меняет номер сцены в имени файлов [с,по] shift - смещение номеров sceneNumя {32:31,33:true}
rescene : function(dir, o){
    const project = getProject(dir);
    const MIN = project._MIN;
    const sceneNum = project.sceneInfo[dir].sceneNum
	if(o instanceof Array){
		var  [from,to = true,shift]= o; console.log([from,to])

	}else if(typeof o === "object"){
		var {from,to = o.TO || true,shift = o.step} = o;
		if(!from){
			from = []
			for(var i in o)if(i==+i)from.push(
				[+i, o[i],shift]
			)
	   	}
		
		
	}
	if(from instanceof Array){ 
		if(from.length === 1 ){
			from = from[0];
			if(from instanceof Array){
				from = from[0]
				to = from[1] || to
				shift = from[2] || shift
			}
		}
		else {
			for(let fr of from){
				let r = [fr, to, shift];
				if(fr instanceof Array)Object.assign(r,fr)
				DO.rescene(r)
			}
			return;
		}
			
	} 
	if(!to || to === true)to = sceneNum
	var files = fs.readdirSync(dir);
	var _f = new RegExp('(\\.'+from +'\\.)'),_t=`.${to}.`;
	files.forEach(f=>{
		if(_f.test(f)){
			var nf = path.join(dir,f.replace(_f,_t));
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
				fs.renameSync(path.join(dir,f), nf) 
		}
	})
},
// Исправление последствий неправильного переименования
fixName : function( dir ){
	var files = fs.readdirSync(dir);
    const project = getProject(dir);
    const MIN = project._MIN;
		let reg = new RegExp(project.fileNumMask); 
		files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
			let n = f.match(reg);
			if(n&&n[1]){
				let name = (+n[1])+'';
				if(MIN>name.length)name ='0'.repeat(MIN-name.length)+name;
				if(name!==n){
					var nf = f.replace(reg,name);
					fs.renameSync(path.join(dir,f), path.join(dir,nf));
					if(nf.indexOf('.svg')>0){
						let svg = fs.readFileSync(path.join(dir,nf), 'utf8') ; 
						svg = svg.replace(new RegExp(n,'g'),name); 
						fs.writeFileSync(path.join(dir,nf), svg, (err)=>{if(err)errorLog(dir,err);})
					}
				} 
			
			}
		}); 
},
 clean : function( dir ){
	//  1) Проходимся по списку файлов, нахдим, где есть svg и меняем его содержимое на то, что задано в списке, а также выравниваем
	 // 2) Создаем словарь {file.svg:{name:n, img:im, w:w,h:h...}}
	var dict = { }
	var files = fs.readdirSync(dir);
    const project = getProject(dir)
	let reg = new RegExp(project.fileNumMask); 

	var count = (s,str)=>{
		let c = 0, i;
		if(typeof s === "string"){
			while(i!==-1){
				i=str.indexOf(s,i);
				if(i==-1)break;
				c++;i++;
			}
		}else if(s instanceof RegExp){
			let l = str.match(new RegExp(s,"g"))
			if(l)c = l.length
		}
		
		return c;
	}

	var defaultPathStyle = {
		fill: project.styles.fillStyle,
		opacity:1,
		fill:"#fff",
		stroke:project.styles.fillStyle,
		"stroke-width":3
	}
	
	let patchStyles = [defaultPathStyle]
	if(project.styles.patchStyles){
		project.styles.patchStyles.forEach(p=>{
			patchStyles.push({...defaultPathStyle, ...p})
		})
	}  
	let sx = 50, secColorCoords = '-170 -20,40 h 40 z',
	secColorCoordsOld  = '-130 -20,-40 -20,40 z';
	patchStyles = patchStyles.map(fillStyle => Object.entries(fillStyle).map(s=>s.join(":")).join(';'))
	var defaultPathesList = patchStyles.map((fillStyle,i) =>
		`<path id="color${i}" d="m ${sx+50*i},${secColorCoords}" style="${fillStyle}"/>`
		)
	var defaultPathesStr = defaultPathesList.join('')

	files.forEach(f=>{//Получаем список номеров файлов от start до end (или до конца)
		let n = f.match(reg);
		if(n&&n[1]&&f.indexOf('.svg')){
			let i = f.lastIndexOf('.');
			let f_name = f.substring(0, i);
			let type =  f.substring(i+1).toLowerCase();
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
			let svg = fs.readFileSync(path.join(dir,f), 'utf8'); 
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
			if(svg.indexOf(secColorCoordsOld) !==-1 ){
				svg = svg.replace(/((<path[^>]+d="m \d+,-130 -20,-40 -20,40 z"[^>]+)((\/>)|(><\/path>)))\s*/g,'')
				change = true;
			}
			if(svg.indexOf(secColorCoords)===-1){
				let i = svg.indexOf('<path')
				if(i===-1){
					let s = '<g id="layer2"></g>'
					i = svg.indexOf('</g>',svg.indexOf('image'))
					if(i!==-1)i+=4
				}
				if(i!==-1){
					svg = svg.substring(0,i) + '\n\t\t\t\t'+ defaultPathesStr + svg.substring(i)
					svg.replace(/(\n*<path [^>]+d="m 25,-122 c -77,47 56,69 90,53 13,-6 8,-56 -1,-62 -12,-8 -33,0 -47,0 -17,0 -27,7 -41,9 z"[^>]+><\/path>)/,'');
					change = true;
				}else{
					console.error(f,'error find img path')
				}
				// svg = svg.replace('<path',`${defaultPathesStr}
				// <path`)
				
			}
			else if(count(secColorCoords,svg)<patchStyles.length){
				patchStyles.forEach((st,i)=>{
					if(svg.indexOf(st,i)===-1){
						svg = svg.replace('<path',`${defaultPathesList[i]}
						<path`);
						change = true;
					}
				})
			}
			// if(svg.indexOf('"m 25,-122 c -77,47 56,69 90,53 13,-6 8,-56 -1,-62 -12,-8 -33,0 -47,0 -17,0 -27,7 -41,9 z"')!==-1){
			// 	svg = svg.replace(/(\n*<path [^>]+d="m 25,-122 c -77,47 56,69 90,53 13,-6 8,-56 -1,-62 -12,-8 -33,0 -47,0 -17,0 -27,7 -41,9 z"[^>]+><\/path>)/,'');
			// 	change = true;
			// }
			if(change){
				console.log(f,change)
				fs.writeFile(path.join(dir,f), svg, (err)=>{if(err)return console.log(err);}); 
			}
		})
	}
 },
 getSceneData : function( dir, log ){
	let confPath = path.join(dir,confName)
	let confOldPath = path.join(dir,confOldName)
    const project = getProject(dir)
    let fileNumMask = project.fileNumMask;

    var LIST = [], DATA = {};
    let sceneJSONPath = path.join( dir, 'scene.json') 
	if (fs.existsSync(sceneJSONPath)) {
		DATA.scene = JSON.parse(fs.readFileSync(sceneJSONPath, 'utf8'));
		infoLog(dir,'parse' + sceneJSONPath)
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
    infoLog(dir,JSON.stringify(exclude))
    // GET TEXTS
    FLIST.filter(f => f.slice(-3) === 'svg' && !/([_en|~])/.test(f))
        .forEach(f => {
            let svg = fs.readFileSync(path.join(dir,f), 'utf8');
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

        // let for
        
    LIST = FLIST.filter(f => {  ///\.(png|jpg)$/i.test(f)
        let fn = f.slice(0, -3); //if(log)console.log(fn);
        switch (f.slice(-3)) {
            case 'svg': break;//TODO: Создавать только svg в режиме расскадровки
                if (~FLIST.indexOf(fn + 'jpg')) break;//svg само по себе
            case 'jpg':
                if (~FLIST.indexOf(fn + 'png')) break;//у png приоретет
            case 'png':
                // infoLog(dir,fn,fileNumMask.test(fn))
                return fileNumMask.test(fn);
        }
        return false
    })
        .map(f => {
            let f_name = f.substring(0, f.lastIndexOf('.'));
            let num = (f_name.match(fileNumMask) || [])[1] || 0;
            if (num == +num) num = +num;
            return [f_name, { imgFile: f, num: num }, f]; //,f_ind

        })

    DATA.list = LIST.sort((a, b) => {
        return a[1].num > b[1].num ? 1 : -1;
    });
    var forLog = DATA.list.map(it=>it[2])
    if(log)console.log(forLog);
    else console.log(forLog.at(0),'...',forLog.at(-1));
    var count = 0;
    let sceneDataJSPath = path.join(dir,'SceneDATA.js') 
    console.log('writte ' + sceneDataJSPath)
    fs.writeFile(
        sceneDataJSPath,
        `DATA = ${JSON.stringify(DATA)};\nDATA.scene.texts = ${JSON.stringify(texts, null, '\t')}`,

        (err) => { if (err) return errorLog(dir,err); }
    ); 

 }

} 

const defaultSceneData = `/**
	=move=
		-1 - undo last move
		ARRAY1 [[start1,to1],....]
		ARRAY2 [start,end,to,step=10] 
		SIMPLE OBJ {from:to,...}
		EXT OBJ {start,end,to|TO,step=10}
	=copy=
		~move + {frpm:[toList]}
	=exchange= 
		 {FROM<num>:TO<num>, include: <Reg|string>,exclude: <Reg|string>, filter: <Reg|string>, svg:<Boolean>, nosvg:<Boolean>}
	=rescene= 
		ARRAY - [FROM <num|array>,TO<num|true|none>,SHIFT<num|none>] (SHIFT - смещение от-но текущей нум кадров)
		OBJ {from|<num>,to|TO,step|shift} 

	=create= 
		ARRAY1: [<nums>]
		ARRAY2 [list<arr>,tpl]
		ARRAY3 [start,count<(num<=start)|string>|tpl,step|tpl,tpl] 
		OBJ {start,count|end,step,tpl,force}
	**/ 
let commands = [
	// {move : {0:0}},// 0 -> 10
   // {move : [0,10]},// 0...end -> +10
   // {move : {start:10, end:20, to:20}},
   // {move : {start:10, end:20, TO:30}},
   // {rescene : [19]},//FROM->текущ 
   // {rescene : [10:true]},//FROM->TO
   // {exchange:{10:20, svg: false}},
   // {create :[10,20]},
   // {create :[[10,20],'3x2']}, // list:[10,20], tpl:'3x2; 
   // {create :{start: 10, count:18}},
   // {create :{start: 10, count:1, tpl : '3x2', force:true}},
   // {create :{list: [10],   tpl : '3x2', force:true}},
   // {copy : {10:20}},
   // {copy:{400:[410,420]}},   
	"getSceneData",
	// "clean"
];
module.exports = commands; 
//module.exports = commands[0]; 
`;

const run = (dir, A) => {
	let confPath = path.join(dir,confName)
	let confOldPath = path.join(dir,confOldName)
	let DATA = {}
    try{
        infoLog(dir,'start');
		let sceneJSONPath = path.join( dir, 'scene.json') 
		if (!fs.existsSync(sceneJSONPath)) {
			DATA.scene = {
				titlePage: false,
				pages: {
					first: 100,
					start: 0
				}
			}
			fs.writeFile(sceneJSONPath, JSON.stringify(DATA.scene, null, '\t'), (err) => { if (err) errorLog(dir,err); });
		   
		}
		 
        console.log(dir)
		let _confpath =  fs.existsSync(confPath) ? confPath : fs.existsSync(confOldPath) ? confOldPath : null
		if(!_confpath){
			fs.writeFile(confPath, defaultSceneData, (err) => { if (err) errorLog(dir,err); });
			console.log("INIT")
			setTimeout(()=>{},1000)
			return
		}
		if(!A)A = require(_confpath);

		
    
    infoLog(dir,A);
    // if(A instanceof Array)for(var d of A)if(typeof DO[d[0]] === 'function')DO[d[0]](d[1]);
    // else 
    let _proxy = (a,par)=>{
        console.log(a,par)
        if(typeof DO[a] === 'function')DO[a](dir,par); 
    }
    if(A instanceof Array)for(let a of A){
        if(typeof a === "string")_proxy(a);
        else for(let b in a)_proxy(b,a[b]);
    }else if(A.commands){
        for(let a of A.commands){
            if(typeof a === "string")_proxy(a, A[a]);
            else for(let b in a)_proxy(b,a[b]);
        }
    }
    else
    for(var a in A)_proxy(a,A[a]);
    // if(A.move)move(A.move); 
    // if(A.create) Array.isArray(A.create) ? create.apply(null,A.create) : create(A.create); 
    // if(A.rescene) rescene.apply(null,A.rescene); 
    
     setTimeout(()=>infoLog(dir,'done'),2000);  
    } catch (error) {
        errorLog(dir,error);
        setTimeout(()=>{},10000)
    }
}



module.exports = {run, getProject, DO}