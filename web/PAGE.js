PAGE = {
	async getJSON(url, cd) {

 

		try {
	 
		  const response = await fetch(url, {
	 
			method: "POST",
	 
			headers: {
	 
			  'Content-Type': 'application/json'
	 
			},
	 
		  });
	 
	  
	 
		  const result = await response.json();

		  if(cd)cd(result)
	 
		  return result
	 
		  
	 
		} catch (error) {
	 
		  console.log(error);
	 
		}
	 
	 },
	//  Показать список сцен
	showList(){
		if(PROJECT.scenesList){
			var fr = DocFragment(),   scenesList = PROJECT.scenesList;
			// var byName = SWAP(Scenes)
			var f = PAGE.loacl;
			const mask = new RegExp(PROJECT.sceneNameMask);
			var setData = function(name){
				// let s = f.match(mask)[1];
				var im=IMG();
				var info = DIV({className:'info'});
				var imgBox = DIV({className:'imgBox'})//im
				var l = ALink({
					href:f+'?'+name,
					className:'Item',
					parentNode:fr
				},[
					imgBox,
					SPAN({className:'title'},name),
					info
				]);
				loadScript([PROJECT.scenesDir+'/'+name+'/SceneDATA.js'],function(){
					// im.src= PROJECT.scenesDir+'/'+ name + '/'+ DATA.list[0][2];
					imgBox.style.backgroundImage = `url("${PROJECT.scenesDir}/${name}/${DATA.list?.[0]?.[2]}")`
					if(DATA.scene.titlePage){
						DIV({parentNode:info},'Глава ' + DATA.scene.titlePage.chapter)
					}
					var p = DATA.scene.pages.first;
					p = p === 100 ? '' : ', Стр. ' + p+'-... ';
					DIV({parentNode:info}, `${DATA.list.length} кадров${p}`)
				})
			}
			// for(var s in Scenes){
			// 	setData(s,Scenes[s])
			// }
			scenesList.forEach(setData)
			DIV({id:"scenesList",parentNode: document.body},
				fr
				)
		}
	},
	Init(){//Для отображения нескольких сцен скопом 
		
		PROJECT.scene = Object.assign({ 
			sizes : {},
			spec : {},
			texts : {},
			parts : {},
			Parts : []
		},PROJECT.scene);
		PROJECT.list = PROJECT.list || [];
		PROJECT.list.forEach((v)=>{ v[1].path = v[1].path||'';}); 
		let opScenes = PAGE.opScenes = PAGE.opScenes||[];
		let nextInd = PAGE.nextInd=PAGE.nextInd||0; 
		if(!PAGE.scene)return PAGE.showList();

		ALink({href:PAGE.loacl, parentNode:document.body},'< К списку сцен')

		PAGE.scene = PAGE.scene || PROJECT.scenesList[0];
		var S;// N сцены, Которую надлежит открыть
		// if( PROJECT.scenesList.indexOf(PAGE.scene)===-1 ){//Чтобы можно было запросить по фрагменту имени, а не по номеру сцены
			if(PROJECT.scenesList.indexOf(PAGE.scene) === -1) PAGE.scene = PROJECT.scenesList.find(s=>s.indexOf(PAGE.scene)!==-1);
			// for(let i in PROJECT.Scenes)if(PROJECT.Scenes[i] === PAGE.scene){
			// 	PAGE.scene = i;
			// 	break;
			// }
		// }
		if(PROJECT.scenesList && !PAGE.inited){ 
			S = PROJECT.scenesList.indexOf(PAGE.scene);
			PROJECT.scene.next = [
				PROJECT.scenesList[S]
			]
			PAGE.container = PAGE.container || DIV({id:'pages-container', parentNode:document.body});
			
		}else{
			S = PAGE.scene_last+1;
		}
		if(PROJECT.scene.next){
			PROJECT.scene.next = typeof PROJECT.scene.next === 'object'?PROJECT.scene.next:[PROJECT.scene.next]; 
			
			for(let n of PROJECT.scene.next){
				
				switch(typeof n){
					case 'boolean':
						n = PROJECT.scenesList[S];
					break
					case 'number':
					case 'string':
						n = PROJECT.scenesList[n] || n;
					break;
				}
				if(!~opScenes.indexOf(n))
					opScenes.push(n);
				S++;
			}
			PAGE.scene_last = S-1;
			console.log('next >>',opScenes)
		}
		this.inited = true;
		if(nextInd<opScenes.length)PAGE.loadDATA();else PAGE.__construct();
	}, 
	// Получение списка кадров
	loadDATA(){
		var sceneName = PAGE.opScenes[PAGE.nextInd]; 
		let sceneNum = sceneName.match(new RegExp(PROJECT.sceneNameMask))[1];
		let sceneInfo = {
			name: sceneName,
			num: sceneNum
		}
		var nextPath = PROJECT.scenesDir+'/'+ sceneName +'/';
				delete PROJECT.scene.next; 
				let onload =()=>{ 
					// старотовать с... (для "тяжелых" сцен)
					if((PARAMS.start || PARAMS.end) && PROJECT.list.length === 0){
						const start = +PARAMS.start || 0;
						const end = +PARAMS.end;
						DATA.list = DATA.list.filter(v => v[1].num >= start && (!end || v[1].num <= end))
					}
					 
					PROJECT.list = PROJECT.list.concat(DATA.list.map((v)=>{ 
						v[1].path = nextPath;
						v[1].sceneInfo = sceneInfo; 
						v[1].sceneName = sceneName; 
						return v;}));   
					
					PROJECT.scene = Object.assign(
						{},
						DATA.scene,
						PROJECT.scene
					);
 
					
					PROJECT.scene.spec[sceneName] = DATA.scene.spec||{}; 
					PROJECT.scene.sizes[sceneName] = DATA.scene.sizes||{}; 
					PROJECT.scene.texts[sceneName] = DATA.scene.texts||{}; 
					PROJECT.scene.parts[sceneName] = DATA.scene.parts||[]; 
					if(DATA.scene.Parts)
						PROJECT.scene.Parts = PROJECT.scene.Parts.concat(DATA.scene.Parts) 
					PAGE.nextInd++;
					if(PROJECT.scene.next){ PAGE.Init();}
					else 
					if(PAGE.nextInd<PAGE.opScenes.length)PAGE.loadDATA();else PAGE.__construct();
				} 
				// this.getJSON(nextPath+'scene.json',console.log)
				let dataName = PARAMS.data || 'SceneDATA.js';
				if(dataName.indexOf('.js')===-1)dataName+='.js'
				loadScript([nextPath+dataName],onload)
				
				
	},
	styles : {
		lineHeight : 1.1
	},
	__construct(){

		PROJECT.scene = Object.assign({
			scale : PROJECT.styles.FRAME.scale,
			spec : {}
		},PROJECT.scene)
		PAGE.styles.scale = PROJECT.scene.scale || PROJECT.styles.FRAME.scale;
		PAGE.sizes = PROJECT.scene.sizes || {};
		PAGE.spec = PROJECT.scene.spec || {};
		PAGE.page = PROJECT.scene.pages.first;
		 
		
		if( PROJECT.styles.PAGE.BG && !PAGE.BG ){ 
			PAGE.BG = new Image();
			PAGE.BG.onload = PAGE.BG.onerror = this.loader;
			PAGE.BG.src = PROJECT.dataDir + "/template/" + PROJECT.styles.PAGE.BG;
		}else this.loader();


		
		
	},
	loadcount : 0,
	FRAMES:{},
	loader(){
		var $ = PAGE, onload = ()=>{ $.loadcount--;if($.loadcount===0)$.InitPages();}, ln = PAGE.lang, FRAMES= $.FRAMES;
		$.loadcount = PROJECT.list.length*2;
		PROJECT.list.forEach((d)=>{
		let k = d[1];
		k.imgFile = d[2]; 
		let PNGI= new Image(); 
		PNGI.onload = function(){k.png = this;  onload();};
		PNGI.onerror = onload; 
		PNGI.src = d[1].path+d[2];
		let sn = d[1].path+d[0];
		let SVGI = new Image(); 
		SVGI.onload = function(){//svg теперь не обязательный, поскольку планируется экспортировать из браузера, где необходим
			k.svg = this; onload();
		}; 
		SVGI.onerror = onload; 
		k.svgPath = sn+(ln === 'en'?'_en':'')+'.svg'; 
		k.svgName = d[0]+(ln === 'en'?'_en':'')+'.svg'; 
		SVGI.src = k.svgPath; 
		})
	},
	InitPages(){
		if(PROJECT.scene.titlePage)PAGE.titlePage(PROJECT.scene.titlePage);
		else PAGE.setList();
	}, 
	scale : 2,
	ctx : false, 
	width:1800, 
	height:1260,
	pmatrix : [],
	setCanvas(){
		var canvas = document.createElement('canvas');
		canvas.width=this.width;canvas.height=this.height;
		let ctx = this.ctx = canvas.getContext("2d");
		
		this.pmatrix.length = 0;
		this.closed=false;
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#000';
		ctx.fill();
		if(this.BG)ctx.drawImage(this.BG,0,0  );
	},
	newPage( ){
		this.pageData = {
			page : this.page,
			frames : []
		}
		// this.PX =0;
		// this.PY = 0;
		// this.ih=0;
		this.setCanvas();
		this.framesList.length = 0;
		this.framesInPage.length = 0;
		// this.cols = 0;
		// this.rows = 0; 
		// this.placeSum
		console.log('NewPage');
		return this;
	},
	updPageList(){
		this.framesInPage.length = 0;
		var start = PAGE.currentFrame;
		var list = PROJECT.list;
		this.hasSpec = false;//Специальный размер. Где есть кадры со спец-положением, игнорируем рассчёт позиций
		let sq = PAGE.placeSq, 
			S = 0,s, item, c = 0, r =0, w =0, j;
		
		let mg = PAGE.styles.frameMargin;
		let framesInPageByS = []
		var hasLong=false, hasHaight = false
		// Отбираем из списка по площади
		for(let j = start; j< list.length; j++){
			item = list[j];
			let [name, {width:W,height:H,path:path,png:pngIMG,svg:svgIMG=false, svgPath : svgPath, svgName : svgName, sceneName:sceneName, sceneInfo:sceneInfo}, f]=item;
			 
			let iw, ih; 
			if(pngIMG){
				iw = pngIMG.width, ih = pngIMG.height; 
			}else{
				iw = W, ih = H; 
				console.error(item);
			}
			let [scale, cx, cy,file_Width,file_Height] = Object.assign(
				[
					PAGE.styles.scale,
					0,0,
					iw, ih
				],
				this.sizes[sceneName]&&this.sizes[sceneName][name]
			);
			if(typeof scale === 'object')scale=~~(H/scale[1]); 
			let scaled_Width = file_Width/scale, scaled_Height = file_Height/scale;
 
			let placeWidth = scaled_Width+mg*2,  
			placeHeight = scaled_Height+PAGE.styles.frameMarginVert;

			s = scaled_Width * scaled_Height;
			S += s; 
			if(S > sq) break;
			if(this.spec[sceneName] && this.spec[sceneName][name])this.hasSpec = true;
			if(j>start){
				let last = framesInPageByS.at(-1);
				if(placeWidth!==last.placeWidth)hasLong=true;
				if(placeHeight!==last.placeHeight)hasHaight=true;
			}
			 
			framesInPageByS.push({
				name : name,
				scale : scale,
				scaled_Width : scaled_Width,
				scaled_Height : scaled_Height,
				placeS: s,
				placeWidth : placeWidth,
				placeHeight : placeHeight,
				file_Width : file_Width,
				file_Height : file_Height,
				cx : cx,
				cy : cy,
				pngIMG : pngIMG,
				svgIMG : svgIMG,
				svgPath : svgPath,
				svgName : svgName,
				imgFile : item[1].imgFile,
				sceneInfo : sceneInfo,
				sceneName:sceneName,
				path : path
			})	
		}
		item = framesInPageByS[0]
		// this.framesInPage.push(item);
		var maxX = PAGE.styles.maxX;
		var maxY = PAGE.styles.maxY;
		var minX = PAGE.styles.minX;
		var minY = PAGE.styles.minY;
		item.x= minX;
		item.y= minY;
		let x = minX, 
			y = minY;
		let wstep =item.placeWidth, hstep = item.placeHeight;
		if(true){//Если все равны - простой алгоритм
		// if(hasLong === false && hasHaight === false){//Если все равны - простой алгоритм
			
			for(let i=0; i<framesInPageByS.length; i++){
				item = framesInPageByS[i];
				// if(i>0){ 
				// 	x+=wstep
				// 	if(x > maxX){
				// 		y+=hstep;
				// 		x=minX
				// 	}
				// 	if(y + hstep > maxY)break
				// }
				// item.x=x;
				// item.y=y;
				this.framesInPage.push(item);
			}
		}else{ 
			//TODO:  отсеить лишние и скомпоновать 
			let last = item,rowCount, next,listX=[], pmatrx = [],max_w, freeW, isNewLine=true;
			pmatrx = Array.from({length: maxY-minY},(v)=>Array.from({length:maxX-minX}))
			let setMatrix = (x,y,w,h)=>{
				for(let _y=y, row; _y<y+h; _y++){
					row = pmatrx[_y];
					for(let _x=x; _x<x+w; _x++) row[_x]=true; 
				}
			}
			let check = (x,y,w,h)=>{ 
				for(let _y=y, row; _y<y+h; _y++){
					row = pmatrx[_y];
					for(let _x=x; _x<x+w; _x++)if( row[_x]){
						return false;
					} 
				}
				return true
			}
			let findFree = (x,y,w,h)=>{
				for(let _y=y, row; _y<=pmatrx.length-h; _y++){
					row = pmatrx[_y];
					for(let _x=x; _x<row.length-w; _x++)if( !row[_x]){
						if(check(_x,_y,w,h))return [_x,_y] 
					} 
				}
				return x===0 && y===0 ? false : findFree(0,0,w,h);
			}
			for(let i=0; i<framesInPageByS.length; i++){
				item = framesInPageByS[i];
				if(isNewLine){
					listX.length = 0;
					listX.push(item)
					freeW = maxX - x
					max_w = item.placeWidth
					//1 найти след не стандартный по высоте
					for(j=i+1;j<framesInPageByS.length; j++ ){
						next = framesInPageByS[j];
						if(next.placeWidth >= freeW){
							// 100% свободной ширины: Если не поместится с кем-то по ширине из отобранных - скомпоновать не удастся
							listX.length = 1;
							break;
						}
						if(next.placeHeight<item.placeHeight || next.placeHeight!==item.placeHeight && j===i+1){
							// Если следующий другой высоты - просто вставляется, если меньше - дальше пересчёт отн-но него
							listX.length = 1;
							break;
						}
						if(next.placeHeight>item.placeHeight){ 
							if(
								next.placeWidth + max_w > freeW 
								){
								// w+w > Max; Если не поместится с кем-то по ширине из отобранных - скомпоновать не удастся 
								listX.length = 1;
								break;
							} 
							rowCount = Math.ceil(next.placeHeight/item.placeHeight);
							let realRowsCount = 1;
							for(let w2=0, j2=0; j2< listX.length; j2++){
								w2+=listX[j2].placeWidth;
								if(w2 + next.placeWidth  > freeW ){
									realRowsCount++; w2=0;
								}
							}
							if(
								realRowsCount > rowCount 
							){
								// Набрал больше чем надо
								listX.length = 1;
								break;
							} 

							break;//
						}
						max_w = Math.max(max_w, next.placeWidth);
						listX.push(next)
					}
					if(listX.length>1){
						// 1 сколько по ширине ещё может
						let nextList = [next],k, realRowsCount, tRX, tY, _mX, it2;
						let freeW2 = freeW - max_w - next.placeWidth;//Сколько максимум может поместиться следом
						if(freeW2 > 0)
						for(k=j+1;k<framesInPageByS.length; k++ ){
							if(framesInPageByS[k].placeHeight!==next.placeHeight)break;
							freeW2-=framesInPageByS[k].placeWidth;
							if(freeW<0)break;
							nextList.push(framesInPageByS[k]);
						} 
						rowCount = Math.ceil(next.placeHeight/item.placeHeight);
						while(nextList.length>0){ 
							let nextW = 0, w=0;
							for(k=0;k<nextList.length;k++)nextW+=nextList[k].placeWidth
							realRowsCount = 1;
							listX[k]._tx = x;
							listX[k]._ty = y;
							tRX = x+listX[0].placeWidth;
							tY = y;
							_mX = maxX - nextW
							for(k=1; k< listX.length; k++){
								it2 = listX[k]
								tRX+=it2.placeWidth;
								if(!check(tRX)){
									// TODO
									let _n = findFree(tRX,tY,it2.placeWidth,it2.placeHeight)
									if(!_n || (_n[1]!==tY || _n[0]<tRX)){
										realRowsCount+=100; break;
										// TODO:
									} 
									tRX = _n[0]
								}
								if(tRX > _mX ){
									realRowsCount++; tRX=x;
									tY+=it2.placeHeight;
									if(realRowsCount > rowCount)break
								} 
								it2._tx = tRX-it2.placeWidth;
								it2._ty = tY;

							}
							if(realRowsCount > rowCount){
								nextList.length--;
							}else{
								break;
							}
						}
						if(nextList.length>0){
							for(k=0; k<listX.length;k++){
								listX[k].x=listX[k]._tx
								listX[k].y=listX[k]._ty
								this.framesInPage.push(item);
							}
							for(k=0; k<nextList.length;k++){
								x = _mX + (i>0? nextList[i-1].placeWidth : 0)
								listX[k].x=x
								listX[k].y=y
								this.framesInPage.push(item);
							}
							i+=listX.length + nextList.length
							// y+=nextList[0].placeHeight;
							// x = minX;
							continue
						}
					}
				}
				
				if(i>0){ 
					let pos = findFree(x,y,item.placeWidth,item.placeHeight);
					if(!pos)break;
					x = pos[0]
					y = pos[1] 
				}
				
				item.x=x;
				item.y=y;
				this.framesInPage.push(item);
			}
		}
		

		return this.framesInPage;
	},
	page : 0,
	scenePage : 0,
	frame : 0,
	PX:0,
	PY:0, 
	framesList : [],
	framesInPage : [],
	framesData : {},
	
	setFullImg(icf, callback){
		if(icf && icf.src){
			let ctx = this.ctx;
			let img = new Image();
			img.onload=function(){ 
				if(icf.width === 'auto'){icf.width = this.width;icf.height = this.height;}
				if(icf.width&&!icf.height)icf.height=this.height*icf.width/this.width; 
				icf.width = icf.width||PAGE.width;icf.height = icf.height||PAGE.height;
				
				if(icf.x === '50%')icf.x = (PAGE.width - icf.width)*0.5;
				if(icf.y === '50%')icf.y = (PAGE.height - icf.height)*0.5;
				
				ctx.drawImage(this,icf.x||0,icf.y||0,icf.width,icf.height ); 
				callback(); 
			}
			img.onerror=()=>callback();
			// console.log(D.img.src)
			img.src = 	icf.path + '/' +icf.src+'?v='+Date.now();
		}else callback()
	},
	titlePage(D, update){
		if(!update)this.newPage();
		let covOpt = PROJECT.chapterCover;
			if(covOpt){
				covOpt = JSON.parse(JSON.stringify(covOpt))
				for(let k in D){
					if(typeof D[k] === "object")covOpt[k] =  Object.assign(covOpt[k],D[k])
					else switch(k){
						case "title":
							covOpt.title.text = D.title
						break
						case "chapter":
							covOpt.chapter.num = D.chapter
						break
						case "top":
							covOpt.chapter.top = D.top
						break
						case "dtop":
							covOpt.title.dtop = D.dtop
						break
						default:
							covOpt[k] = D[k]
						break
					}
					

					}
					for(var k in covOpt)switch(k){
						case "bg": 
							covOpt[k].path = covOpt[k].path || "%dataDir%"
						case "img":
							covOpt[k].path = covOpt[k].path || "%scene%"
							covOpt[k].path = covOpt[k].path
							.replace("%dataDir%",PROJECT.dataDir)
							.replace("%scenesDir%",PROJECT.scenesDir)
							.replace("%scene%",PAGE.opScenes[0] ) 
							if(covOpt[k].src)covOpt[k].src = covOpt[k].src.replace("%chapter%",covOpt.chapter.num)  
						break
					}
					PAGE.setFullImg(covOpt.bg,()=>{
						PAGE.setFullImg(covOpt.img,()=>{
							PAGE.setTitle(covOpt, update); 
						})
					})
			}else if(!update){
				this.appendPage();
				this.stat.pages++;
				PAGE.setList();
	
			}
		
	}, 
	setTitle(covOpt, update){
		let ctx = this.ctx;
		switch(PROJECT.name){
			case "__Саша":
				//this.ctx.rect(x,y,iw,ih);
				ctx.beginPath();
			ctx.moveTo(36,82);
			ctx.lineTo(26+1712,82);
			ctx.moveTo(36,1188);
			ctx.lineTo(26+1712,1188);
			ctx.moveTo(72,51);
			ctx.lineTo(72,51+1176);
			ctx.moveTo(1713,51);
			ctx.lineTo(1713,51+1176);
			ctx.strokeStyle = PROJECT.styles.fillStyle;
			ctx.stroke();
			this.ctx.stroke();
			//162.3
			
				let Y = covOpt.top || 500,X;
				ctx.font = "126px Alexandra Zeferino Three";
				ctx.fillStyle = PROJECT.styles.fillStyle;
				ctx.textAlign="center";
				ctx.fillText(`Глава ${covOpt.chapter}`,PAGE.width/2,Y);
				ctx.font = "76px AleksandraC";
				Y+=(covOpt.dtop || 170);
				TML = covOpt.title.split('\n'); 
				for (let i = 0; i<TML.length; i++) ctx.fillText(TML[i],PAGE.width/2,Y + (i*87)); 
				ctx.font = "32px AleksandraC";
				X = PAGE.width - 160; Y=PAGE.height - 140;

				ctx.textBaseline = 'middle';
				ctx.fillText('18+',X,Y);
				ctx.beginPath(); 
				let r = 34;
				ctx.lineWidth = 2;
				ctx.arc( X,Y-4,r,0,2 * Math.PI,true);
				ctx.stroke();
		break;
		default:{
			let Y,X;

			Y = covOpt.chapter.top;
			if(Y<0)Y=PAGE.height+Y
			ctx.font = covOpt.chapter.font;
			ctx.fillStyle = covOpt.chapter.color || covOpt.color || PROJECT.styles.fillStyle;
			ctx.textAlign = covOpt.chapter.textAlign || "center";
			X = "X" in covOpt.chapter ?  covOpt.chapter.X : PAGE.width/2;
			if(typeof X === "string" && X.indexOf('%')!==-1)X = parseFloat(X)/100 * PAGE.width
			if(X<0)X+=PAGE.width
			let num = covOpt.chapter.num
			if(covOpt.chapter.romanStyle)num = convertToRoman(num)
			ctx.fillText('Глава' + ' ' + num,X,Y);
			

			Y = covOpt.title.dtop ? Y + covOpt.title.dtop : covOpt.title.top
			
			if(Y<0)Y=PAGE.height+Y
			ctx.font = covOpt.title.font;
			ctx.fillStyle = covOpt.title.color || covOpt.color || PROJECT.styles.fillStyle;
			ctx.textAlign = covOpt.title.textAlign || "center";
			X = "X" in covOpt.title ?  covOpt.title.X : PAGE.width/2;
			if(typeof X === "string" && X.indexOf('%')!==-1)X = parseFloat(X)/100 * PAGE.width
			if(X<0)X+=PAGE.width
			let lineHeight = covOpt.title.lineHeight || parseInt(covOpt.title.font)*3
			
			TML = covOpt.title.text || ''
			TML = TML.split('\n'); 
			for (let i = 0; i<TML.length; i++) ctx.fillText(TML[i],X,Y + (i*lineHeight)); 
		}
		}
		if(!update){
			this.appendPage();
			this.stat.pages++;
			PAGE.setList();

		}
	},
	checkCoord(x,y,placeWidth,placeHeight){

	},
	setFrames( ){
		// if(this.PX===0&&this.PY===0&&this.closed===true)this.newPage(i,list);
		// console.log(fn );
		// if(fn  ==='K.S.20.1480')
		// console.log(fn );
		// let newLine = false; 

		var pmatrix = this.pmatrix;
		var list = this.framesInPage;
		
		var i = pmatrix.length;
		var itemData = list[i]; 
		if(!itemData){ 
			if(PAGE.currentFrame>0)this.closePage();
			this.newPage(true);
			PAGE.updPageList();
			i = 0;
			itemData = list[i]; 
		}

		var name = itemData.name,
			sceneName = itemData.sceneInfo.name,
			scale = itemData.scale,
			scaled_Width = itemData.scaled_Width,
			scaled_Height = itemData.scaled_Height,
			placeWidth = itemData.placeWidth,  
			placeHeight = itemData.placeHeight,
			file_Width = itemData.file_Width,
			file_Height = itemData.file_Height,
			cx = itemData.cx,
			cy = itemData.cy,
			pngIMG = itemData.pngIMG,
			svgIMG = itemData.svgIMG
 
		let mg = PAGE.styles.frameMargin;
		let x,y; 
		
		/*
		Искать куда поместится
		
		*/
		if(this.spec[sceneName]&&this.spec[sceneName][name]){// спецпозиций  
			console.log(this.spec[sceneName][name]);
			({x,y} = this.spec[sceneName][name]);
			if(typeof x === 'string')x= mg+(~~x);if(x<0)x= mg+x;
			if(typeof y === 'string')y= mg+(~~y);if(y<0)y= mg+y;
		}if(this.pmatrix.length === 0){
			x = mg; y=mg;
			this.PX+=placeWidth; 

		} else{//Прочие  
			let use = true, j;
			let l = pmatrix.length, 
				maxX = PAGE.styles.maxX-scaled_Width, 
				maxY = PAGE.styles.maxY-scaled_Height;
				
				// пытаемся скомпоновать

			// if(name === 'K.S.23.0460')
			// 	console.log(name);
				var minY;// Минимальный y - чтобы не перебирать заведомо занятые значения
			//Проверить отступы
				var y0 = PAGE.styles.minY;
				// Если следующий кадр по высоте - больше - переводим на новую строку 
				if(!this.hasSpec && i>0 && i < list.length-1){//Если - не первый и не последний, и на странице нет "специальных"
					let _next, bigIndex, MaxH = 0.9*PAGE.placeBox.height;
					// Временный
					_prev = list[i-1], 
					_next = list[i+1],
					_naxt2 = list[i+2];
					
					let freeWidth = maxX, freeHeight = maxY - _prev.placeWidth - _prev.cx; 
					if( 
						_prev.placeHeight <= placeHeight && _next.placeWidth <= freeWidth && (
							(_next.placeHeight > placeHeight) 
							|| 
							_naxt2 && _naxt2.placeWidth <= freeWidth &&(_naxt2.placeHeight > placeHeight) && _prev.placeHeight <= placeHeight 
						)
					){
						y0+=_prev.placeHeight;
					}
				}

			let xp0, xp1, yp0, yp1; 
			let x1,y1;
			yloop:for(y = y0; y<=maxY;y++){
				y1 = y+placeHeight;
				for(x = mg; x<=maxX;x++){
					x1 = x+placeWidth;
					use = true;
					for(j= 0; j<l; j++){   
						[xp0, xp1, yp0, yp1] = pmatrix[j];
						if(
							( x >= xp0 && x <= xp1 || x1 > xp0 && x1 <= xp1 )
							&&( y >= yp0 && y <= yp1 || y1 >= yp0 && y1 <= yp1 ) 
							||	
							( x <= xp0 && x1 >= xp1 && y <= yp0 && y1 > yp1 )
						){
							use =  false;
							x=xp1;
							if( typeof minY === "undefined" || minY > yp1)minY = yp1;
							 
							break;
							
						}
					}
					if(use === true)break;
						
				}
				if(use === true)break;
				if(typeof minY === "number")y = Math.round(minY);
				
				minY = undefined;
			}

			// console.log(pmatrix) 
			if(use === false){//позиция+ширина+отступы больше ширины стр 
				this.closePage().newPage(true);  PAGE.updPageList();
				x=mg; y=mg;
			} 
			
		} 
		this.pmatrix.push([x,x+placeWidth-1,y,y+placeHeight-1]);
		//let ctx = this.ctx; 
		let b = 5;
		let arg = [cx, cy,file_Width,file_Height,x+b,y+b,scaled_Width-b*2,scaled_Height-b*2];
		console.log(arg);

		var ctxData = {
			pngIMG : pngIMG,
			svgIMG : svgIMG,
			svgPath : itemData.svgPath,
			svgName : itemData.svgName,
			sceneInfo : itemData.sceneInfo,
			sceneName : sceneName,
			arg : arg,
			border : PROJECT.styles.FRAME.border && [x,y,scaled_Width,scaled_Height]
		}; 
		this.setCTXFrame(ctxData);
		let item = {
			name:name, 
			framePos : [x,y,scaled_Width,scaled_Height], 
			imgPos: arg, 
			img: pngIMG, 
			imgFile: itemData.imgFile,
			sceneInfo : itemData.sceneInfo,
			sceneName : sceneName,
			ctxData : ctxData,
			path : itemData.path
		}
		this.framesList.push(item);
		
		this.pageData.frames.push(item);

		PAGE.currentFrame += 1;
		this.frame++; this.stat.frames++; 


		if(PAGE.currentFrame < PROJECT.list.length)
			PAGE.setFrames( );
		else
			PAGE.closePage();
	},

	setCTXFrame : function(ctxData){
		if(ctxData.pngIMG)this.ctx.drawImage(ctxData.pngIMG, ...ctxData.arg); 
		// console.log(this.ctx.getImageData(cx, cy,1,1))
		if(ctxData.svgIMG)this.ctx.drawImage(ctxData.svgIMG, ...ctxData.arg); 

		if(PROJECT.styles.FRAME.border){
			this.ctx.rect(...ctxData.border);
			this.ctx.stroke();

        } 
	},
	
	ih : 0, 
	
	appendPage(){ 

		var fr = DocFragment();
		var padding = PROJECT.styles.FRAME.padding || 0;
		// console.log(this.framesList)
		
		this.framesList.forEach(frm =>{ 
			let sceneName = frm.sceneName
			var fra = DIV({className:'frame', name : frm.name, title:frm.name, parentNode:fr}  );
			fra.dataset.scene = sceneName
			STYLES.set(fra, {
				left : frm.imgPos[4],
				top : frm.imgPos[5],
				width : frm.imgPos[6],
				height : frm.imgPos[7],
				// backgroundImage : `url("${frm.img.src}")`,
				// backgroundSize : `${frm.imgPos[6]}px ${frm.imgPos[7]}px`

			}) 
			let cont = PROJECT.scene.texts[sceneName][frm.name] || {texts : []};
			let scale  = (frm.imgPos[6])/frm.imgPos[2];//+2*padding
			// scale = Math.round(scale*100)/100;

			
			
			let svgAttr = {
				name : frm.name,
				W:frm.imgPos[2],
				H:frm.imgPos[3],
				img:frm.img ? frm.img.src : '',
				pathes : cont.pathes,
				texts : cont.texts
			}
			
			var svgBlockOuter = EDITOR.createSVG(svgAttr);
			
			
			let svg = svgBlockOuter.querySelector('svg');
			
			var svgBlock = svg.parentNode;

			svgBlock.style.transformOrigin = `0 0`
			svgBlock.style.transform = `scale(${scale})`
			svgBlock.toggleAttribute('contenteditable',true);

			 
			fra.appendChild(svgBlockOuter)
 
			svgBlock.addEventListener('keypress',EDITOR.actions.Frame_keypress);
			svgBlock.addEventListener('keydown',EDITOR.actions.Frame_keydown);

			svgBlock.addEventListener('mouseout',EDITOR.actions.Frame_mouseout )

			let ctrlBox = DIV({
				className:'frameController',
				parentNode:fra
			})
			
			INPUT({className:'h3', readonly : true, value : frm.name, parentNode:ctrlBox }).addEventListener('click',(ev)=>{
				ev.target.select();
				EDITOR.clipboardName(ev.target.closest('.frame').dataset.scene,ev.target.value,ev.ctrlKey,ev.shiftKey)
			})
			ALink({className:'saveBtn', dataset : {name:frm.name}, download : frm.ctxData.svgName, parentNode:ctrlBox},'Сохранить')
			.addEventListener('click',EDITOR.actions.saveBtn_click)

			// var paddingX = scale*frm.imgPos[2] - frm.imgPos[6];
			// var paddingY = scale*frm.imgPos[3] -  frm.imgPos[7];
			// svgBlockOuter.style.width = frm.imgPos[6]+ 'px';
			// svgBlockOuter.style.height = frm.imgPos[7] + 'px';
			// svgBlockOuter.style.overflow = 'hidden';
			// svgBlock.style.marginLeft = -1*paddingX/2 + 'px';
			// svgBlock.style.marginTop = -1*paddingY/2 + 'px';
			// svgBlock.addEventListener('focus',function(ev){
			// 	console.log('focus',ev.target,ev)
			// })

			// svg.addEven

			/*
			let texts = cont.texts.map(t=>{ 
				let p = PTag(t.innerText), x = t.attr.x, y = t.attr.y, tr = t.attr.transform;
				if(x&&y || tr){
					x = +x||0; y =+y||0;
					if(tr){
						let tr_type = tr.match(/(^[a-z]+)/)[0];
						console.log(tr_type)
						tr = tr.match(/(\d+\.{0,1}\d*)/g);
						switch(tr_type){
							case "translate":
								x+=+tr[0];
								y+=+tr[1];
								tr = false;
							break;
							case "matrix":
								x+=+tr[4];
								y+=+tr[5];
								tr[4] = tr[5] = 0;//Смещение пусть за счёт координат
								// tr[0] = tr[3] = 0;//Масштаб пусть за счёт координат
								
								// tr[0] = (+tr[0])/scale; 
								// tr[3] = (+tr[3])/scale; 
								switch(t.type){
									case 'text':
										// TODO: Понять как рассчитывать: для текста внутри - двойной спан с параметрами x,y
										tr[1]=(-tr[1])*scale;
										tr[2]=(+tr[2])*scale;
										x*=2;
										y=y/2;
									break;
									case 'flowRoot':
											tr[1]=(-tr[1])*scale;
											tr[2]=(+tr[2])*scale;
									break;
								}
								// scale
								tr[0] = 1+(1-tr[0]); 
								tr[3] = 1+(1-tr[3]); 
								
								tr = `matrix(${tr}`;
							break;
							default:
								tr = t.attr.transform;
						} 
					}
					p.style.left = Math.round(x*scale)+'px';
					p.style.top = Math.round(y*scale)+'px';
				}
				if(t.attr.width)p.style.width = Math.round((t.attr.width)*scale)+'px'; 
				if(tr)p.style.transform =tr;
				return p;
			});


			let content = DIV({className : "content", contenteditable:true, dataset: {scale : scale}, parentNode:fra},texts);
			content.addEventListener('input',function(ev){
				for(let n of this.childNodes){
					if(!(n instanceof Element))PTag({parentNode:this},n)
				}
			})
			*/ 
		this.framesData[sceneName] = this.framesData[sceneName] || {}
		this.framesData[sceneName][frm.name] = {
				name : frm.name,
				data : frm,
				block : fra,
				content : cont,
				scale : scale,
				svg : svg,
				ctxData : frm.ctxData,
				sceneName : sceneName,
				sceneInfo : frm.sceneInfo
			} 

			svg.setAttribute('name',frm.name)
			
			// fra.innerHTML = `<input class='h3' readonly value="${frm.name}" /><textarea class="content">${texts}</textarea>`;
			// TODO: btn{download: frm.name + (PAGE.lang === 'en' ? '_en' : '') +'.svg'};
			// moseover: btn.href = getSVG(textarea.value);
			// fr.appendChild(fra);
		},this)

		
		var pageData = DIV({className:'pageData'},fr);

		pageData.addEventListener('click',EDITOR.actions.Frame_click);

		var pageController;

		if(this.pageData){
			//this.pageData
			// this.ctx.canvas
			pageController = DIV({className:'pageController'});
			let btn;
			
			// let btnsOuter = SPAN({ className:'btnsOuter', parentNode: pageController },btn)
			btn = SPAN({className:'toggleBtn btn', title:'toggle Page ' + this.page,parentNode: pageController},'▼');//▲►▼◄
			
			btn.dataset.page = this.page;
			btn.addEventListener('click',function(){
				var box = this.closest('.page-box');
				var v = toggleDisplay(box.querySelectorAll('.page-block'),'!',true);
				if(v){
					this.textContent = '▼';
					if(this.nextSibling)this.nextSibling.remove();
				}
				else {
					this.textContent = '►';
					this.after(SPAN(this.dataset.page))
				}
			});

			btn = SPAN({className:'partStartBtn btn', title:'Начало выпуска', parentNode: pageController },'1');
			btn.addEventListener('click',function(){
				this.closest('.page-box').classList.toggle('partStart') 
			});

			// reload Page
			btn = SPAN({className:'reloadBtn btn', title:'reload Page', parentNode: pageController },'⭮');
			GlobalData.set(btn,'data',this.pageData);
			btn.addEventListener('click',function(){
				var reloadBtn = this;
				var pageData = GlobalData.get(reloadBtn,'data' );
				console.log(pageData);
				PAGE.createPageFromData(pageData,ctx => {
					var box = reloadBtn.closest('.page-box');
					var block = box.querySelector('.page-block');
					var c = box.querySelector('canvas');
					block.innerHTML ='';
					block.appendChild(ctx.canvas);
					// if(c){

					// 	c.after(ctx.canvas);
					// 	c.remove();
					// }else{
					// 	box.insertBefore(ctx.canvas,box.firstElementChild);
					// }
				})
			});
			INPUT({parentNode: pageController, style: {opacity:0.5}, value : numToString(this.pageData.page)}) // numToString(this.pageData.page,4)
			.addEventListener('click',function(ev){
				this.select()
				if(ev.ctrlKey){
					let v = this.value
					let n = PROJECT.idNumLength || 0
					if(v.length<n){
						v = '0'.repeat(n - v.length) + v
					}
					// TODO: partNum
					navigator.clipboard.writeText(PROJECT.idName + '_' + v +'.png').then(function() {
						/* clipboard successfully set */
					  }, function() {
						/* clipboard write failed */
					  });
				}
				
			})

			btn = SPAN({className:'upBtn btn', title:'↑ Page', parentNode: pageController },'↑');//←↑→↓
			btn.addEventListener('click',function(){
				var box = this.closest('.page-box');
				if(box.previousElementSibling)box.previousElementSibling.before(box);
			});

			btn = SPAN({className:'upBtn btn', title:'↓ Page', parentNode: pageController },'↓');
			btn.addEventListener('click',function(){
				var box = this.closest('.page-box');
				if(box.nextElementSibling)box.nextElementSibling.after(box);
			});
		}
		let sceneName =  this.framesList[0]?.sceneName
		if(sceneName!==this.sceneName){
			this.scenePage = 0;
			this.sceneName = sceneName
		} 
		var pageBox = DIV({className:'page-box', parentNode:PAGE.container, dataset:{page:this.page,scenepage:this.scenePage}},[
			
			pageController,
			DIV({className:'page-block'},this.ctx.canvas),
			DIV({className:'page-block'},pageData)
		]); 
		
		if(sceneName && PROJECT.scene.parts[sceneName].indexOf(this.scenePage+1)!==-1 || PROJECT.scene.Parts.indexOf(this.page)!==-1)
			pageBox.classList.add('partStart')
		this.page++;
		this.scenePage++;
		this.closed=true;
	},
	createPageFromData(pageData, callback){
		this.setCanvas();

		if(pageData.frames.length === 0){
			if(PROJECT.scene.titlePage){
				PAGE.titlePage(PROJECT.scene.titlePage, true);
			}
			callback ( PAGE.ctx );
		return this.ctx;
		}
		
		var i = 0, item = pageData.frames[i], d,
		ln = PAGE.lang,
			onLoad = function(){
				PAGE.setCTXFrame(d.ctxData);
			i++;
			item = pageData.frames[i];
			if(item)f();
			else{
				PAGE.setPageFooter(pageData.page);
				callback ( PAGE.ctx );
			}
		};
		var f = ( )=>{  
			d = PAGE.framesData[item.sceneName][item.name].data;
			let PNGI= new Image(); 
			PNGI.onload = function(){

				d.ctxData.pngIMG = this;
				d.ctxData.svgIMG = false;
				let sn = d.path+d.name;
				let SVGI = new Image(); 
				SVGI.onload = function(){//svg теперь не обязательный, поскольку планируется экспортировать из браузера, где необходим
					 d.ctxData.svgIMG = this; onLoad();
				}; 
				SVGI.onerror = onLoad; 
				SVGI.src = sn+(ln === 'en'?'_en':'')+'.svg?v='+Date.now(); 


			};
			PNGI.onerror = function(){
				
				}; 
			PNGI.src =d.path+d.imgFile + '?v='+Date.now(); 
			
		} 

		f();
		return this.ctx;
	},
	setPageFooter( page ){
		let ctx = this.ctx, setImage = this.setImage;
		// ctx.beginPath();
		// ctx.moveTo(25,1194);
		// ctx.lineTo(25+775,1194);
		// ctx.stroke();
	//ctx.font = "Italic 30px AleksandraC";
	//ctx.fillStyle = '#003';
	//canvas.textAlign = "start";
		ctx.textBaseline = "middle";
        var Y = 1230,X,img;
		let footerFont = PAGE.getFontString('footer');

		let footer =  PROJECT.styles.footer || {}
				if(footer instanceof Array){
					if(!PAGE.cachedFooterOpt){
						let  defaultFooter;
						let sceneNum = parseFloat(PAGE.scene.match(new RegExp(PROJECT.sceneNameMask))[1]);
						PAGE.cachedFooterOpt = footer.find(f=>{
							let ok = false
							if(!f.scenes || f.scenes === "*"){
								defaultFooter = f
							}else{ 
								ok = sceneNum >= f.scenes[0] && (f.scenes[1]===true || sceneNum <= f.scenes[1])

							}
							return ok
						}) || defaultFooter
					}
					footer = PAGE.cachedFooterOpt
					
				}

				img = new Image();
				img.onload=function(){
					// console.log(this);
					let top = PAGE.height -this.height
					ctx.drawImage(this,0,top , this.width, this.height ); 
					let numOpt  = footer.num || {}
					ctx.textBaseline= numOpt.textBaseline || "hanging";
					ctx.font = numOpt.font || footer.font;
					ctx.fillStyle = numOpt.fillStyle || footer.fillStyle || PROJECT.styles.fillStyle; 
					let X=numOpt.X, Y = top + numOpt.Y;
					ctx.fillText(page,X,Y); 


					// if(cb)cb();
				}
				// img.onerror=cb;
				img.src = 	PROJECT.dataDir +  '/' + footer.img;

        
		switch(PROJECT.name){
			case "ВНИИ Пустоты":
				// Y =PAGE.height - 39;  

				// setImage('footer.svg',[0, PAGE.height - 49]);
				
				// ctx.font = "900 17px Ubuntu"; 
				// ctx.textAlign="center"; 
				// Y = 1073;
				// ctx.textBaseline="alphabetic";
				// X = this.width/2;
				// ctx.fillText(this.lang === 'en' ? 'SRI of the Void' : 'ВНИИ Пустоты',this.width/2,Y);
				// ctx.textAlign="end";  
				// ctx.fillText('VNII.SU  |  Skazochnik.ORG',this.width-10,Y); 
				// ctx.font = "700 14px Ubuntu"; 
				
				// let iY = Y+7, rX = this.width-10, bY = Y+20;
				// ctx.fillText(this.lang === 'en' ? 'patreon.com/grinya_lesnoy' : 'vk.com/lesnoy . skazochnik',rX,bY); 
				// //setImage('vk.png',[rX-=200,iY,16]);
				// //ctx.fillText('patreon.com/grinya_lesnoy',rX-=10,bY); 
				// // if(this.lang === 'en') setImage('patreon.png',[rX-=200,iY]);
				// ctx.textAlign="start"; 
				// X = 540;
				// setImage('CC-BY-SA-Andere_Wikis_(v).svg',[X,Y-17,58]);
				 
				// ctx.fillText('CC BY-SA',472+132,Y); 
				// ctx.fillText('Grinya Lesnoy',X,Y+20); 
			break;
			case "Саша":
				

				// Y = 1230;
				// ctx.font = footerFont;
				// ctx.fillStyle = PROJECT.styles.fillStyle;
				// ctx.fillText(`Стр. ${page}`,25,Y); 
				// setImage('CC-BY-SA-Andere_Wikis_(v).svg',[402,1207,117,39]);
				// ctx.fillText('CC BY-SA',402+132,Y); 
				// X = 402+132+170;
				// ctx.font = "16px AleksandraC";	
				// ctx.textAlign="center";
				// ctx.fillText('18+',X,Y); 	
				// // ctx.textBaseline = 'middle'; 
				// ctx.beginPath(); 
				// let r = 18;
				// ctx.lineWidth = 2;
				// ctx.arc( X,Y-2,r,0,2 * Math.PI,true);
				// ctx.stroke();
				// ctx.textAlign="start"; 
				// ctx.font = footerFont;
				// ctx.fillText('= Саша =',833.0,Y); 	
				// ctx.fillText('Гриня Лесной   •   Skazochnik.ORG  | VNII.SU',1136.0,Y); 		
			break;
		}  
	},
	closePage(){
		this.setPageFooter( this.page );
		
		this.appendPage();
		this.stat.pages++;
		return this;
	},
	getFontString (type,size){
		let font = '';
		switch(type){
			case 'footer':
				font = PROJECT.styles.footerFont || [];
			break;
		}
		if(font instanceof Array){
			font = font.map((a)=>{
				if(typeof a === 'number'){
					if(size)a = size;
					a+="px";
				}
				return a
			}).join(" ");

		}
		return font;
	}, 
	closed : true,
	setImage (url,xywh,cb,eb){
		let ctx = PAGE.ctx;
		let [x,y,w=false,h=false]=xywh;
		let img = new Image();
		img.onload=function(){
			// console.log(this);
			ctx.drawImage(this,x,y,w||this.width,h||~~(this.height*(w? w/this.width:1)) ); 
			if(cb)cb();
		}
		if(eb)img.onerror=eb;
		img.src = 	PROJECT.dataDir + "/template/" + url;
	},
	setList(){ 
		let mg = PROJECT.styles.FRAME.margin;
		PAGE.styles.frameMargin = mg; 
		PAGE.styles.frameMarginVert = (~~mg*1.5)+ (PROJECT.styles.FRAME.padding || 0),//Погрешность;; 
		PAGE.styles.minX = mg;
		PAGE.styles.minY = mg;
		PAGE.styles.maxX = this.width-mg;
		PAGE.styles.maxY = this.height-PAGE.styles.frameMarginVert;
		PAGE.placeBox = {
			x : mg,
			y: mg,
			width : this.width - 2*mg,
			height : this.height-PAGE.styles.frameMarginVert - mg,
		}
		PAGE.placeSq = (PAGE.styles.maxX - PAGE.styles.minX)*(PAGE.styles.maxY - PAGE.styles.minY);//Площадь пространства
		PAGE.currentFrame = 0;
		PAGE.setFrames( );
		// PROJECT.list.forEach(PAGE.setFrames,PAGE);
		// if(PAGE.closed === false)PAGE.closePage();
		let st = document.createElement('div');

		st.id = "footer";
		st.style.padding='20px 10px'; 
		st.innerHTML=`<b>Pages:</b> ${this.stat.pages} (${PROJECT.scene.pages.first} - ${PROJECT.scene.pages.first-1+this.stat.pages})<br/>
		<b>Frames:</b> ${this.stat.frames}<br/>`;
		PAGE.container.appendChild(st);

		 
		var pageScale = PROJECT.styles.PAGE.scale || 1;
		if(pageScale!==1){
			PAGE.container.style.transformOrigin = `0 0`;
			PAGE.container.style.transform=`scale(${pageScale})`
		}
	},
	stat:{pages:0,frames:0},
	openScene(s){
		// PARAMS.scene = s;
		// document.body.innerHTML = '';
		// DATA = JSON.parse( PAGE.backupData );
		// this.nextInd = 0;
		// PAGE.Init();
		// EDITOR.Init();
		location.href = location.origin + location.pathname + '?' + s;
	}
} 
; 