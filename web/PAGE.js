PAGE = {
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
	loadDATA(){
		var nextPath = PROJECT.scenesDir+'/'+ PAGE.opScenes[PAGE.nextInd]+'/';
				delete PROJECT.scene.next; 
				let onload =()=>{ 
					 
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
				loadScript([nextPath+'SceneDATA.js'],onload)
				
				
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
	newPage(){
		var canvas = document.createElement('canvas');
		canvas.width=this.width;canvas.height=this.height;
		let ctx = this.ctx = canvas.getContext("2d");
		this.PX =0;
		this.PY = 0;
		this.ih=0;
		this.pmatrix.length = 0;
		this.closed=false;
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#000';
		ctx.fill();
		if(this.BG)ctx.drawImage(this.BG,0,0  );
		this.framesList.length = 0;
		console.log('NewPage');
		return this;
	},
	page : 0,
	frame : 0,
	PX:0,
	PY:0, 
	framesList : [],
	framesData : {},
	setTitle(D){
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
		this.appendPage();
		PAGE.setList();
	},
	titlePage(D){
		this.newPage();
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
				PAGE.setTitle(D); 
			}
			img.onerror=()=>PAGE.setTitle(D);
			// console.log(D.img.src)
			img.src = 	PAGE.opScenes[0] + '/' + D.img.src;
			}else PAGE.setTitle(D);
		
	}, 
	setFrame(item,i,list){
		let [fn, {width:W,height:H,path:path,png:pngIMG,svg:svgIMG=false}, f]=item; 
		if(this.PX===0&&this.PY===0&&this.closed===true)this.newPage();
		// console.log(fn );
		// if(fn  ==='K.S.20.1480')
		// console.log(fn );
		let cw = pngIMG.width, ch = pngIMG.height, 
		cx=0, cy=0, 
		scale = PAGE.styles.scale, newLine = false; 
		if(this.sizes[fn])[scale=scale,cx=cx,cy=cy,cw=cw,ch= ch] = this.sizes[fn];
		if(typeof scale === 'object')scale=~~(H/scale[1]); 
		let iw = cw/scale, ih = ch/scale;
		let m = PROJECT.styles.FRAME.margin, x,y, b = 5;
		 
		let CW=iw+m*2, 
		mH=(~~m*1.5)+ (PROJECT.styles.FRAME.padding || 0),//Погрешность;
		CH = ih+mH;
		
		/*
		Искать куда поместится
		
		*/
		if(this.spec[fn]){// спецпозиций  
			console.log(this.spec[fn]);
			({x,y} = this.spec[fn]);
			if(typeof x === 'string')x=this.PX+m+(~~x);if(x<0)x=this.PX+m+x;
			if(typeof y === 'string')y=this.PY+m+(~~y);if(y<0)y=this.PY+m+y;
		}if(this.pmatrix.length === 0){
			x = m; y=m;
			this.PX+=CW;
		} else{//Прочие  
			let use = true, j,pmatrix = this.pmatrix, pm;
			let l = pmatrix.length, maxX = this.width-iw, maxY = this.height-ih - mH;
			if(fn === 'K.S.23.0460')
				console.log(fn);
				var minY;// Минимальный y - чтобы не перебирать заведомо занятые значения
			//Проверить отступы
			yloop:for(y = m; y<=maxY;y++){
				for(x = m; x<=maxX;x++){
					use = true;
					for(j= 0; j<l; j++){  
						pm = pmatrix[j];
						if(
							( x >= pm[0] && x <= pm[1] || (x+CW) > pm[0] && (x+CW) <= pm[1]  )&&( y >= pm[2]&&y <= pm[3] || (y + CH) >= pm[2]&&(y + CH) <= pm[3] ) ||	
							x <= pm[0] && (x+CW) >= pm[1] && y <= pm[2] && (y+CH) > pm[3] 
						){
							use =  false;
							x=pm[1];
							minY = typeof minY === "undefined" || minY > pm[3] ? pm[3] : minY;
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
			// x=this.PX+m; 
			// y=this.PY+m;
			// this.PX+=CW;
			if(use === false){//позиция+ширина+отступы больше ширины стр 
				// this.PY+=this.ih+mH;
				// this.PY+=CH;
				// this.ih=0;  
				// if(this.PY+ CH >this.height){
					this.closePage().newPage(); x=m; y=m;
				// }else{
				// 	y=this.PY+m;
				// 	newLine = true;
				// } 
				// this.PX = CW; 
				// x=m;				
				// console.log(fn,this.PY,mH,this.height);
				
			}
			// this.ih = Math.max(this.ih,ih);//Кеширование высоты. max - пока не нужна (задел для алгоритма нестандартных версток)
			//x=this.PX+m; y=this.PY+m;//let x=25+(iw+50)*this.PX, y=25+(ih+50)*this.PY;
			
		} 
		this.pmatrix.push([x,x+CW-1,y,y+CH-1]);
		//let ctx = this.ctx; 
		let arg = [cx, cy,cw,ch,x+b,y+b,iw-b*2,ih-b*2];
		console.log(arg)
		this.ctx.drawImage(pngIMG, ...arg); 
		if(svgIMG)this.ctx.drawImage(svgIMG, ...arg); 

		if(PROJECT.styles.FRAME.border){
			this.ctx.rect(x,y,iw,ih);
			this.ctx.stroke();

        } 
		
		item[1].framePos = [x,y,iw,ih]
		item[1].imgPos = arg
		this.framesList.push({name:fn, newLine : newLine, framePos : [x,y,iw,ih], imgPos: arg, img: pngIMG, imgFile: item[1].imgFile})
		
		this.frame++; this.stat.frames++;
		//if(!this.spec[fn])this.PX+=iw+m*2;
		/*Перенести в начало: определяет положение при постановке; либо getSize() */
		/*let mW = 0, mH =0;
		if(list[i+1]){//Размер следующего кадра
			let n = list[i+1]; 
			if(this.spec[n[0]])return;//Если след. имеет спец позиционирование - переход не происходит (чтобы их можно было размещать произвольно
			if(this.sizes[n[0]]){
				mW=this.sizes[n[0]][0];mH=this.sizes[n[0]][1];
			}else{ 
				mW = n[1].width/scale;mH = n[1].height/scale;
			} 
			
		} 
		if(!this.spec[fn])this.ih=ih;
		if(this.PX>this.width-mW){
			this.PX=0; this.PY+=this.ih+(~~m*1.5);
			if(COMIX === 'VNII')this.PY+=3;//Погрешность
			
			if(this.PY>this.height-mH){ this.PY=0; this.closePage(); }
		}*/
	},
	ih : 0, 
	
	appendPage(){ 

		var fr = DocFragment();
		var padding = PROJECT.styles.FRAME.padding || 0;
		// console.log(this.framesList)
		this.framesList.forEach(frm =>{ 
			var fra = DIV({className:'frame', name : frm.name, parentNode:fr}  );
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
				img:frm.img.src,
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
				svg : svg
			}
			// if(frm.newLine)frm_str += `</tr><tr>`;
			
			// fra.innerHTML = `<input class='h3' readonly value="${frm.name}" /><textarea class="content">${texts}</textarea>`;
			// TODO: btn{download: frm.name + (PAGE.lang === 'en' ? '_en' : '') +'.svg'};
			// moseover: btn.href = getSVG(textarea.value);
			// fr.appendChild(fra);
		},this)

		
		var pageData = DIV({className:'pageData'},fr);

		pageData.addEventListener('click',EDITOR.actions.Frame_click)
		 
		var pageBox = DIV({className:'page-box', parentNode:PAGE.container},[
			DIV({className:'page-block'},this.ctx.canvas),
			DIV({className:'page-block'},pageData)
		]);   

		this.page++;this.closed=true;
	},
	closePage(){
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
				ctx.fillText(`${this.page}`,8,Y+1); 
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
				ctx.fillText(`Стр. ${this.page}`,25,Y); 
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
		PROJECT.list.forEach(PAGE.setFrame,PAGE);
		if(PAGE.closed === false)PAGE.closePage();
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