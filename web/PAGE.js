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
		if(PROJECT.Scenes){
			var fr = DocFragment(), Scenes = PROJECT.Scenes;
			var f = PAGE.loacl;
			var setData = function(s,name){
				var im=IMG();
				var info = DIV({className:'info'})
				var l = ALink({
					href:f+'?'+s,
					className:'Item',
					parentNode:fr
				},[
					DIV({className:'imgBox'},im),
					SPAN({className:'title'},name),
					info
				]);
				loadScript([PROJECT.scenesDir+'/'+Scenes[s]+'/SceneDATA.js'],function(){
					im.src= PROJECT.scenesDir+'/'+ name + '/'+ DATA.list[0][2];
					if(DATA.scene.titlePage){
						DIV({parentNode:info},'Глава ' + DATA.scene.titlePage.chapter)
					}
					var p = DATA.scene.pages.first;
					p = p === 100 ? '' : ', Стр. ' + p+'-... ';
					DIV({parentNode:info}, `${DATA.list.length} кадров${p}`)
				})
			}
			for(var s in Scenes){
				setData(s,Scenes[s])
			}
			DIV({id:"scenesList",parentNode: document.body},
				fr
				)
		}
	},
	Init(){//Для отображения нескольких сцен скопом 
		
		PROJECT.scene = Object.assign({ 
			sizes : {},
			spec : {},
			text : {}
		},PROJECT.scene);
		PROJECT.list = PROJECT.list || [];
		PROJECT.list.forEach((v)=>{ v[1].path = v[1].path||'';}); 
		let opScenes = PAGE.opScenes = PAGE.opScenes||[];
		let nextInd = PAGE.nextInd=PAGE.nextInd||0; 
		if(!PAGE.scene)return PAGE.showList();

		ALink({href:PAGE.loacl, parentNode:document.body},'< К списку сцен')

		PAGE.scene = PAGE.scene || Object.keys(PROJECT.Scenes)[0];
		var S;// N сцены, Которую надлежит открыть
		if( !PROJECT.Scenes [PAGE.scene] ){//Чтобы можно было запросить по фрагменту имени, а не по номеру сцены
			if(PROJECT.scenesList.indexOf(PAGE.scene) === -1) PAGE.scene = PROJECT.scenesList.find(s=>s.indexOf(PAGE.scene)!==-1);
			for(let i in PROJECT.Scenes)if(PROJECT.Scenes[i] === PAGE.scene){
				PAGE.scene = i;
				break;
			}
		}
		if(PROJECT.Scenes && !PAGE.inited){ 
			S = (+PAGE.scene) || PAGE.scene ;
			PROJECT.scene.next = [
				PROJECT.Scenes[S]
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
						n = PROJECT.Scenes[S];
					break
					case 'number':
					case 'string':
						n = PROJECT.Scenes[n] || n;
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
		var nextPath = PROJECT.scenesDir+'/'+ PAGE.opScenes[PAGE.nextInd]+'/';
				delete PROJECT.scene.next; 
				let onload =()=>{ 
					// старотовать с... (для "тяжелых" сцен)
					if((PARAMS.start || PARAMS.end) && PROJECT.list.length === 0){
						const start = +PARAMS.start || 0;
						const end = +PARAMS.end || DATA.list[DATA.list.length-1][1];
						DATA.list = DATA.list.filter(v => v[1].num >= start && v[1].num <= end)
					}
					 
					PROJECT.list = PROJECT.list.concat(DATA.list.map((v)=>{ v[1].path = nextPath;return v;}));   
					
					PROJECT.scene = Object.assign(
						{},
						DATA.scene,
						PROJECT.scene
					);
					
					PROJECT.scene.spec = Object.assign(PROJECT.scene.spec,DATA.scene.spec||{}); 
					PROJECT.scene.sizes = Object.assign(PROJECT.scene.sizes,DATA.scene.sizes||{}); 
					PROJECT.scene.texts = Object.assign(PROJECT.scene.texts || {},DATA.scene.texts||{}); 
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
		SVGI.src = sn+(ln === 'en'?'_en':'')+'.svg'; 
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
		let sq = PAGE.placeSq, S = 0,s, item, c = 0, r =0, w =0, j;
		
		let mg = PAGE.styles.frameMargin;
		for(let j = start; j< list.length; j++){
			item = list[j];
			let [name, {width:W,height:H,path:path,png:pngIMG,svg:svgIMG=false}, f]=item;
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
				this.sizes[name]
			);
			if(typeof scale === 'object')scale=~~(H/scale[1]); 
			let scaled_Width = file_Width/scale, scaled_Height = file_Height/scale;
			s = scaled_Width * scaled_Height;
			if(S + s > sq) break;
			S += s;
			if(this.spec[name])this.hasSpec = true;
			
	 
			let placeWidth = scaled_Width+mg*2,  
			placeHeight = scaled_Height+PAGE.styles.frameMarginVert;

			this.framesInPage.push({
				name : name,
				scale : scale,
				scaled_Width : scaled_Width,
				scaled_Height : scaled_Height,
				placeWidth : placeWidth,
				placeHeight : placeHeight,
				file_Width : file_Width,
				file_Height : file_Height,
				cx : cx,
				cy : cy,
				pngIMG : pngIMG,
				svgIMG : svgIMG,
				imgFile : item[1].imgFile,
				path : path
			})	
		}
		return this.framesInPage;
	},
	page : 0,
	frame : 0,
	PX:0,
	PY:0, 
	framesList : [],
	framesInPage : [],
	framesData : {},
	setTitle(D, update){
		let ctx = this.ctx;
		switch(PROJECT.name){
			case "Саша":
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
			
				let Y = D.top || 500,X;
				ctx.font = "126px Alexandra Zeferino Three";
				ctx.fillStyle = PROJECT.styles.fillStyle;
				ctx.textAlign="center";
				ctx.fillText(`Глава ${D.chapter}`,PAGE.width/2,Y);
				ctx.font = "76px AleksandraC";
				Y+=(D.dtop || 170);
				TML = D.title.split('\n'); 
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
		}
		if(!update){
			this.appendPage();
			PAGE.setList();

		}
	},
	titlePage(D, update){
		if(!update)this.newPage();
		if(D.img){
			let ctx = this.ctx;
			let img = new Image();
			img.onload=function(){ 
				if(D.img.width === 'auto'){D.img.width = this.width;D.img.height = this.height;}
				if(D.img.width&&!D.img.height)D.img.height=this.height*D.img.width/this.width; 
				D.img.width = D.img.width||PAGE.width;D.img.height = D.img.height||PAGE.height;
				
				if(D.img.x === '50%')D.img.x = (PAGE.width - D.img.width)*0.5;
				if(D.img.y === '50%')D.img.y = (PAGE.height - D.img.height)*0.5;
				
				ctx.drawImage(this,D.img.x||0,D.img.y||0,D.img.width,D.img.height ); 
				PAGE.setTitle(D, update); 
			}
			img.onerror=()=>PAGE.setTitle(D, update);
			// console.log(D.img.src)
			img.src = 	PAGE.opScenes[0] + '/' + D.img.src+'?v='+Date.now();
			}else PAGE.setTitle(D, update);
		
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
		if(this.spec[name]){// спецпозиций  
			console.log(this.spec[name]);
			({x,y} = this.spec[name]);
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
			if(name === 'K.S.23.0460')
				console.log(name);
				var minY;// Минимальный y - чтобы не перебирать заведомо занятые значения
			//Проверить отступы
				var y0 = PAGE.styles.minY;
				// Если следующий кадр по высоте - больше - переводим на новую строку
				if(!this.hasSpec && i>0 && i < list.length-1){//Если - не первый и не последний, и на странице нет "специальных"
					let _next, bigIndex, MaxH = 0.9*PAGE.placeBox.height;
					// Временный
					_next = list[i+1], _prev = list[i-1];
					if( 
						_prev.placeHeight <= placeHeight &&
							(
							(list[i+1].placeHeight > placeHeight) || (list[i+2]&&list[i+2].placeHeight > placeHeight)&& _prev.placeHeight <= placeHeight 
						)
					){
						y0+=_prev.placeHeight;
					}


					// for(j = $i+1; j< framesInPage.length; j++){
					// 	if( framesInPage[j].placeHeight >= MaxH ){
							
					// 	}
					// }
					// let _next = framesInPage[$i+1], _prev = framesInPage[0];
					//  if( 
					// 	_next.placeHeight > placeHeight
					// 	&& y0 + _next.placeHeight + placeHeight > PAGE.styles.maxY&&
					// 	_prev.placeHeight 
					// 	){
					// 	y0 = 
					//  } 
					// let hasBiggest = false;
					// for(j = $i; j< framesInPage.length; j++){
					// 	if(framesInPage)
					// }
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
							minY = typeof minY === "undefined" || minY > yp1 ? yp1 : minY;
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
			arg : arg,
			border : PROJECT.styles.FRAME.border && [x,y,scaled_Width,scaled_Height]
		}; 
		this.setCTXFrame(ctxData);

		this.framesList.push({
			name:name, 
			framePos : [x,y,scaled_Width,scaled_Height], 
			imgPos: arg, 
			img: pngIMG, 
			imgFile: itemData.imgFile,
			ctxData : ctxData,
			path : itemData.path
		});
		
		this.pageData.frames.push(name);

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
			var fra = DIV({className:'frame', name : frm.name, title:frm.name, parentNode:fr}  );
			INPUT({className:'h3', readonly : true, value : frm.name, parentNode:fra }).addEventListener('click',(ev)=>{ev.target.select();})
			ALink({className:'saveBtn', dataset : {name:frm.name}, download : frm.name+'.svg', parentNode:fra},'Сохранить')
			.addEventListener('click',EDITOR.actions.saveBtn_click)
			STYLES.set(fra, {
				left : frm.imgPos[4],
				top : frm.imgPos[5],
				width : frm.imgPos[6],
				height : frm.imgPos[7],
				// backgroundImage : `url("${frm.img.src}")`,
				// backgroundSize : `${frm.imgPos[6]}px ${frm.imgPos[7]}px`

			}) 
			let cont = PROJECT.scene.texts[frm.name] || {texts : []};
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
			 
		this.framesData[frm.name] = {
				name : frm.name,
				data : frm,
				block : fra,
				content : cont,
				scale : scale,
				svg : svg,
				ctxData : frm.ctxData
			} 
			
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
			

			btn = SPAN({className:'toggleBtn btn', title:'toggle Page ' + this.page},'▼');//▲►▼◄
			SPAN({ parentNode: pageController },btn)
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
		}
		 
		var pageBox = DIV({className:'page-box', parentNode:PAGE.container},[
			
			pageController,
			DIV({className:'page-block'},this.ctx.canvas),
			DIV({className:'page-block'},pageData)
		]);   

		this.page++;this.closed=true;
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
		
		var i = 0, name = pageData.frames[i], d,
		ln = PAGE.lang,
			onLoad = function(){
				PAGE.setCTXFrame(d.ctxData);
			i++;
			name = pageData.frames[i];
			if(name)f();
			else{
				PAGE.setPageFooter(pageData.page);
				callback ( PAGE.ctx );
			}
		};
		var f = ( )=>{  
			d = PAGE.framesData[name].data;
			let PNGI= new Image(); 
			PNGI.onload = function(){

				d.ctxData.pngIMG = this;
				d.ctxData.svgIMG = false;
				let sn = d.path+name;
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
		ctx.beginPath();
		ctx.moveTo(25,1194);
		ctx.lineTo(25+775,1194);
		ctx.stroke();
	//ctx.font = "Italic 30px AleksandraC";
	//ctx.fillStyle = '#003';
	//canvas.textAlign = "start";
		ctx.textBaseline = "middle";
        var Y = 1230,X,img;
        
		switch(PROJECT.name){
			case "ВНИИ Пустоты":
				Y =1061; 
				
				ctx.textBaseline="hanging";
				ctx.font = "700 35px Ubuntu";
				ctx.fillStyle = '#999';
				ctx.fillText(`${page}`,8,Y+1); 
				ctx.font = "900 17px Ubuntu"; 
				ctx.textAlign="center"; 
				Y = 1073;
				ctx.textBaseline="alphabetic";
				X = this.width/2;
				ctx.fillText(this.lang === 'en' ? 'SRI of the Void' : 'ВНИИ Пустоты',this.width/2,Y);
				ctx.textAlign="end";  
				ctx.fillText('VNII.SU  |  Skazochnik.ORG',this.width-10,Y); 
				ctx.font = "700 14px Ubuntu"; 
				
				let iY = Y+7, rX = this.width-10, bY = Y+20;
				ctx.fillText(this.lang === 'en' ? 'patreon.com/grinya_lesnoy' : 'vk.com/lesnoy . skazochnik',rX,bY); 
				//setImage('vk.png',[rX-=200,iY,16]);
				//ctx.fillText('patreon.com/grinya_lesnoy',rX-=10,bY); 
				if(this.lang === 'en') setImage('patreon.png',[rX-=200,iY]);
				ctx.textAlign="start"; 
				X = 540;
				setImage('CC-BY-SA-Andere_Wikis_(v).svg',[X,Y-17,58]);
				 
				ctx.fillText('CC BY-SA',472+132,Y); 
				ctx.fillText('Grinya Lesnoy',X,Y+20); 
			break;
			case "Саша":
				Y = 1230;
				let footerFont = PAGE.getFontString('footer');
				ctx.font = footerFont;
				ctx.fillStyle = PROJECT.styles.fillStyle;
				ctx.fillText(`Стр. ${page}`,25,Y); 
				setImage('CC-BY-SA-Andere_Wikis_(v).svg',[402,1207,117,39]);
				ctx.fillText('CC BY-SA',402+132,Y); 
				X = 402+132+170;
				ctx.font = "16px AleksandraC";	
				ctx.textAlign="center";
				ctx.fillText('18+',X,Y); 	
				// ctx.textBaseline = 'middle'; 
				ctx.beginPath(); 
				let r = 18;
				ctx.lineWidth = 2;
				ctx.arc( X,Y-2,r,0,2 * Math.PI,true);
				ctx.stroke();
				ctx.textAlign="start"; 
				ctx.font = footerFont;
				ctx.fillText('= Саша =',833.0,Y); 	
				ctx.fillText('Гриня Лесной   •   Skazochnik.ORG  | VNII.SU',1136.0,Y); 		
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
		st.innerHTML=`<b>Pages:</b> ${this.stat.pages} (${PROJECT.scene.pages.first} - ${PROJECT.scene.pages.first+this.stat.pages})<br/>
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