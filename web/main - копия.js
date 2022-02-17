
EmptyElement = document.createElement.bind(document)

function httpGet(url) {
return new Promise(function(resolve, reject) {
var xhr = new XMLHttpRequest();
xhr.open('GET',url,true);
xhr.onload = function() {
      if (this.status == 200) {
        resolve(this.response);
      } else {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function() {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });
}
/*var DATA = {},__dir=location.href.substr(0,location.href.lastIndexOf('/')+1);
httpGet(__dir+'scene.json').then(
(data)=>{
DATA.scene = JSON.parce(data);
return httpGet(__dir+'list.json');
}
).then( (data)=> {
DATA.list = JSON.parce(list);
console.log(DATA);
})*/

loadScript = function(src,callback,error){
	if(typeof src === 'string'){
		let s = document.createElement('script');
		s.onload = callback;
		s.onerror = error === false ? console.error : error || callback;
		s.src = src;
		document.head.appendChild(s);
	}else{
		let i = 0; 
		let onerror, onload;
		
		onload = ()=>{
			i++;
			if (i<src.length){
				loadScript(src[i],onload,onerror ) 
			}else{
				callback();
			}
		}
		onerror = error  === false ? console.error : error || onload;
		loadScript(src[i],onload,onerror )  
	}
	
}

createPage = (num)=>{

}
const URL = decodeURI(location.href);

  
let I= URL.indexOf('Comics')+'Comics'.length;
const rootURL = URL.substr(0,I+1);
let path=URL.slice(I+1);
I = path.indexOf('/');
const NAME=path.substr(0,I); 
path = path.slice(I,path.lastIndexOf('/'))+'/';
const alias = {
	'ВНИИ Пустоты' : 'VNII',
	'Подземная история' : 'UStory',
	'Саша' : 'Sasha'
};

var relative = p => p.replace(new RegExp(rootURL+NAME ),'../'.repeat(path.match(/\//g).length-1));

const COMIX =  alias[NAME]||NAME;
const SCENE_DIR_NAME = path.match(/\/([^\/]+)\//)[1];
const SCENE_DIR = relative(rootURL+NAME + '/' + SCENE_DIR_NAME);
//const TEMPLATEDIR = (COMIX === 'VNII' ? '../':'')+'../Data/template/';
let script = document.getElementsByTagName('script');
for(let s of script)if(~s.src.indexOf('/main.js')){script=s.src; break;}
const TEMPLATEDIR = script.substr(0,script.lastIndexOf('/')+1);//rootURL+NAME+'/Data/template/';
//const COMIXTEMPLATEDIR = rootURL+NAME+'/Data/template/';
const COMIXTEMPLATEDIR = (COMIX === 'VNII' ?  relative( rootURL+NAME ) : SCENE_DIR )+'/Data/template/';
var params = {}
var _param_ = location.search.substr(1);
if(!~_param_.indexOf('&')&&!~_param_.indexOf('=')) params = {scene : _param_}
else {
	_param_.split('&').forEach(p=>{
		
		if(!~p.indexOf('='))switch(p){
			case 'debug':
			break;
			default:
				params.scene = p;

		}else{
			p = p.split('=');
			params[p[0]]=p[1]
		}
		

	})
}
PAGE = {
	Init(){//Для отображения нескольких сцен скопом 
		DATA.scene = Object.assign({ 
			sizes : {},
			spec : {},
			text : {}
		},DATA.scene);
		DATA.list = DATA.list || [];
		DATA.list.forEach((v)=>{ v[1].path = v[1].path||'';}); 
		let next = this.next = this.next||[];
		let nextInd = this.nextInd=this.nextInd||0;
		if(DATA.Scenes && !this.inited){
			var c = params.scene || Object.keys(DATA.Scenes)[0];
			DATA.scene.next = [
				DATA.Scenes[c]
			]
		}
		if(DATA.scene.next){
			DATA.scene.next = typeof DATA.scene.next === 'object'?DATA.scene.next:[DATA.scene.next]; 
			for(let n of DATA.scene.next)if(!~next.indexOf(n))next.push(n);
		}
		this.inited = true;
		if(nextInd<next.length)PAGE.loadDATA();else PAGE.__construct();
	}, 
	loadDATA(){
		var $=this,Data_old = DATA, nextPath = SCENE_DIR+'/'+$.next[$.nextInd]+'/';
				delete DATA.scene.next; 
				let onload =()=>{
					let Data_new = DATA; 
					DATA=Data_old;
					DATA.list = DATA.list.concat(Data_new.list.map((v)=>{ v[1].path = nextPath;return v;}));   
					
					DATA.scene = Object.assign(
						{},
						Data_new.scene,
						DATA.scene
					);
					
						DATA.scene.spec = Object.assign(DATA.scene.spec,Data_new.scene.spec||{}); 
						DATA.scene.sizes = Object.assign(DATA.scene.sizes,Data_new.scene.sizes||{}); 
						DATA.scene.texts = Object.assign(DATA.scene.texts || {},Data_new.scene.texts||{}); 
					$.nextInd++;
					if(DATA.scene.next){ PAGE.Init();}
					else 
					if($.nextInd<$.next.length)$.loadDATA();else PAGE.__construct();
				} 
				loadScript([nextPath+'list.js', nextPath+'texts.js'],onload)
				
				
	},
	__construct(){
		if(~location.href.split('/').pop().indexOf('en'))PAGE.lang='en';
		switch(COMIX){
			
			case 'VNII':
			this.scale = 4;
			this.minW = 300;
			this.minH = 350;
			this.width = 900;
			this.height = 1100;
			this.margin = 0;
			this.bottom=40;
			this.font = '700 24px Ubuntu';
			this.fillStyle = '#000';
			this.svgFont = 'font-size:56px;font-family:Ubuntu; fill:#000;';
			this.svgStyle = `path{fill:#fff; stroke:#000;stroke-width:3;opacity:1;}
				text, flowPara{font-size:56px;font-family:Ubuntu; fill:#000;}`;
			break;
			case 'Sasha':
			this.scale = 2;
			this.minW = 550;
			this.minH = 550;
			this.width = 1800;
			this.height = 1260;
			this.margin = 25;
			this.BG = 'bg.jpg';
			this.font = '28px AleksandraC';
			this.fillStyle = '#003';
			this.svgFont = 'font-size:60px;font-family:AleksandraC;fill:#003';
			this.svgStyle = `path{fill:#fff; stroke:#003;stroke-width:3;opacity:1;}
				text, flowPara{font-size:60px;font-family:AleksandraC;fill:#003}`;
			break;
			}

		DATA.scene = Object.assign({
			scale : this.scale,
			spec : {}
		},DATA.scene)
			this.scale = DATA.scene.scale || this.scale;
		this.sizes = DATA.scene.sizes || {};
		this.spec = DATA.scene.spec || {};
		this.page = DATA.scene.pages.first;
		 
		
		if(this.BG){
			let bg = this.BG;
			this.BG = new Image();
			this.BG.onload = this.BG.onerror = this.loader;
			this.BG.src = COMIXTEMPLATEDIR+bg;
		}else this.loader();


		
		var style = document.createElement('style');
		document.head.appendChild(style);
		style.innerHTML = `
			body{
				background : #333;
				color : #fff;
				font-size:35px;
			}
	
			.page-block{
				display:inline-block;
				padding:20px;
				vertical-align: top;
			}
	
			.page-box{
				width: ${(PAGE.width+40)*2+10}px;
			}
	
			.pageData{
				display:inline-block;
				padding:5px;
				vertical-align:top;
				position : relative;
				width: ${PAGE.width}px;
				height: ${PAGE.height}px;
			}
	
			.pageData .frame{
				position: absolute;
				background-color:#fff;
				font : ${PAGE.font};
				color: ${PAGE.fillStyle};
			}
			.pageData .frame .content{ 
				overflow-y:auto; 
				max-height:100%;
				height: 100%;
				width: 100%;
				background: rgba(255,255,255,0.7);
				font : inherit;
				color: ${PAGE.fillStyle};
				position: absolute;
				left: 0;
				top: 0;
			}

			p{
				margin-top:0;
			}

			.pageData .frame .content p[style] {
				position:absolute;
				margin:0;
				
			} 

			.pageData .frame .content p:not([style]){
				position:relative;
				left:5px;
				top:5px;
				width: calc(100% - 10px);
				margin-bottom: 0 0 28px;
			}
			.pageData .frame .content p:not([style]):before {
				 content: '- '; 
			}
	
			table{
				border-color:#fff;
				width: ${PAGE.width}px;
				height: ${PAGE.height}px;
				vertical-align:top;
			}
	
			td{
				padding:10px;
				border: 1px solid #ccc;
				vertical-align: top;
			}
	
			.frame h3, .frame .h3 {
				padding: 5px;
				margin: 0 0 5px;
				color: #fff;
				background: #333;
				position: absolute;
				bottom: -55px;
				border: none;
				font-size: 1.2em;
				font-weight: 500;
			}
		`; 
	},
	bottom:20,
	loadcount : 0,
	FRAMES:{},
	loader(){
		var $ = PAGE, onload = ()=>{ $.loadcount--;if($.loadcount===0)$.InitPages();}, ln = PAGE.lang, FRAMES= $.FRAMES;
		$.loadcount = DATA.list.length*2;
		DATA.list.forEach((d)=>{
		let k = d[1];
		let I= new Image(); I.onload = function(){k.png = this;  onload();}; I.src = d[1].path+d[2]; I.onerror = function(e){console.error(I.src)}
		let sn = d[1].path+d[0];
		I= new Image(); 
		I.onload = function(){//svg теперь не обязательный, поскольку планируется экспортировать из браузера, где необходим
			k.svg = this; onload();
		}; 
		I.onerror = onload;

		I.onerror=onload;
		I.src = sn+(ln === 'en'?'_en':'')+'.svg'; 
		})
	},
	InitPages(){
		if(DATA.scene.titlePage)PAGE.titlePage(DATA.scene.titlePage);
		else PAGE.setList();
	},
	margin : 25,
	scale : 2,
	ctx : false, 
	width:1800, 
	height:1260,
	newPage(){
		var canvas = document.createElement('canvas');
		canvas.width=this.width;canvas.height=this.height;
		let ctx = this.ctx = canvas.getContext("2d");
		this.PX =0;
		this.PY = 0;
		this.ih=0;
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
		switch(COMIX){
			case 'Sasha':
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
			ctx.strokeStyle = '#003';
			ctx.stroke();
			this.ctx.stroke();
			//162.3
			
				let Y = D.top || 500;
				ctx.font = "126px Alexandra Zeferino Three";
				ctx.fillStyle = '#003';
				ctx.textAlign="center";
				ctx.fillText(`Глава ${D.chapter}`,PAGE.width/2,Y);
				ctx.font = "76px AleksandraC";
				Y+=(D.dtop || 170);
				TML = D.title.split('\n'); 
				for (let i = 0; i<TML.length; i++) ctx.fillText(TML[i],PAGE.width/2,Y + (i*87)); 
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
			img.src = 	D.img.src;
			}else PAGE.setTitle(D);
		
	}, 
	setFrame(item,i,list){
		let [fn, {width:W,height:H,path:path,png:pngIMG,svg:svgIMG=false}, f]=item; 
		if(this.PX===0&&this.PY===0&&this.closed===true)this.newPage();
		
		let cw = pngIMG.width, ch = pngIMG.height, 
		cx=0, cy=0, 
		scale = this.scale, newLine = false; 
		if(this.sizes[fn])[scale=scale,cx=cx,cy=cy,cw=cw,ch= ch] = this.sizes[fn];
		if(typeof scale === 'object')scale=~~(H/scale[1]); 
		let iw = cw/scale, ih = ch/scale;
		let m = this.margin, x,y, b = 5;
		 
		
		/*
		Искать куда поместится
		
		*/
		
		if(!this.spec[fn]){//Для спецпозиций не рассматривается 
			let CW=iw+m*2, CH=(~~m*1.5)+ (COMIX === 'VNII'?3:0);//Погрешность;
			x=this.PX+m; y=this.PY+m;
			if((this.PX+=CW)>this.width){//позиция+ширина+отступы больше ширины стр 
				this.PY+=this.ih+CH;
				this.ih=0;  
				if(this.PY+ ih+CH >this.height){this.closePage().newPage(); y=m;}else{
					y=this.PY+m;
					newLine = true;
				} 
				this.PX = CW; x=m;				
				console.log(fn,this.PY,CH,this.height);
				
			}
			this.ih = Math.max(this.ih,ih);//Кеширование высоты. max - пока не нужна (задел для алгоритма нестандартных версток)
			//x=this.PX+m; y=this.PY+m;//let x=25+(iw+50)*this.PX, y=25+(ih+50)*this.PY;
			
		}else {console.log(this.spec[fn]);
			({x,y} = this.spec[fn]);
			if(typeof x === 'string')x=this.PX+m+(~~x);if(x<0)x=this.PX+m+x;
			if(typeof y === 'string')y=this.PY+m+(~~y);if(y<0)y=this.PY+m+y;
		} 
		//let ctx = this.ctx; 
		let arg = [cx, cy,cw,ch,x+b,y+b,iw-b*2,ih-b*2]
		this.ctx.drawImage(pngIMG, ...arg); 
		if(svgIMG)this.ctx.drawImage(svgIMG, ...arg); 

		
		switch(COMIX){
		case 'Sasha':
			this.ctx.rect(x,y,iw,ih);
			this.ctx.stroke();
			break;
			case 'VNII': 
			break;
		}
		
		item[1].framePos = [x,y,iw,ih]
		item[1].imgPos = arg
		this.framesList.push({name:fn, newLine : newLine, framePos : [x,y,iw,ih], imgPos: arg, img: pngIMG})
		
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
	minW : 550,
	minH : 550, 
	createSVG(d){
		let stroke = 3;
		let s = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
			<svg 
			xmlns:svg="http://www.w3.org/2000/svg"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			version="1.1" viewBox="0 0 ${d.W} ${d.H}" height="${d.H}" width="${d.W}" >
				<defs id="defs2">
					<style id="style5694">
						path{fill:#fff; stroke:${this.fillStyle};stroke-width:${stroke};opacity:1;} text, flowPara{${this.svgFont }}

					</style>
				</defs> 
				<g  sodipodi:insensitive="true" id="layer1">
					<image sodipodi:insensitive="true" xlink:href="${d.img}" y="0" x="0" height="${d.H}" width="${d.W}" />
				</g>
				<g id="layer2"></g>
				${d.pathes&&d.pathes.length>0 ? d.pathes : [`<path id="path5753" d="m 25,-122 c -77,47 56,69 90,53 13,-6 8,-56 -1,-62 -12,-8 -33,0 -47,0 -17,0 -27,7 -41,9 z" style="opacity:1;fill:#fff;stroke:${this.fillStyle};stroke-width:${stroke};"/>`].join('')}
				<g id="layer3"></g>
				${	d.texts ? '':''
				// 	d.texts ? 

				// 	:
				// 	`<flowRoot id="flowRoot5743"
				// 	xml:space="preserve"><flowRegion
				// 	id="flowRegion5745"><rect
				// 	y="-115"  x="22"  height="97" width="507" id="rect5747" /></flowRegion><flowPara

				// 	style="${this.svgFont }"
				// id="flowPara5749">Текст</flowPara></flowRoot>`
				}
				
		</svg>`;
		return DIV({className:'svgBox',innerHTML : s})
	},
	appendPage(){ 
		var div;

		var pageData = EmptyElement('div');
		pageData.className = 'pageData';  
		var frm_str = '';
		var framesData = this.framesData;
		var fr = document.createDocumentFragment();
		// console.log(this.framesList)
		this.framesList.forEach(frm =>{
			var fra = DIV({className:'frame', name : frm.name, parentNode:fr},
				INPUT({className:'h3', readonly : true, value : frm.name })
			);
			STYLES.set(fra, {
				left : frm.imgPos[4],
				top : frm.imgPos[5],
				width : frm.imgPos[6],
				height : frm.imgPos[7],
				// backgroundImage : `url("${frm.img.src}")`,
				// backgroundSize : `${frm.imgPos[6]}px ${frm.imgPos[7]}px`

			}) 
			let cont = DATA.scene.texts[frm.name] || {texts : []};
			let scale  = frm.imgPos[6]/frm.imgPos[2];
			scale = Math.round(scale*100)/100;

			
			
			let svgAttr = {
				W:frm.imgPos[2],
				H:frm.imgPos[3],
				img:frm.img.src,
				pathes : cont.pathes
			}
			
			svgBlock = this.createSVG(svgAttr);
			
			svgBlock.style.transformOrigin = `0 0`
			svgBlock.style.transform = `scale(${scale})`
			// svgBlock.toggleAttribute('contenteditable',true);
			let svg = svgBlock.querySelector('svg');
			fra.appendChild(svgBlock)

			
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

			framesData[frm.name] = {
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
		})
		pageData.appendChild(fr);
		var box = EmptyElement('div');
		box.className = 'page-box';

		div = EmptyElement('div');
		div.className = 'page-block';
		div.appendChild(this.ctx.canvas);  
		box.appendChild(div);

		div = EmptyElement('div');
		div.className = 'page-block';
		div.appendChild(pageData);  
		box.appendChild(div); 

		document.body.appendChild(box)
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
		var Y = 1230,img;
		switch(COMIX){
			case 'VNII':
				Y =1061; 
				
				ctx.textBaseline="hanging";
				ctx.font = "700 35px Ubuntu";
				ctx.fillStyle = '#999';
				ctx.fillText(`${this.page}`,8,Y+1); 
				ctx.font = "900 17px Ubuntu"; 
				ctx.textAlign="center"; 
				Y = 1073;
				ctx.textBaseline="alphabetic";
				let X = this.width/2;
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
			case 'Sasha':
				Y = 1230;
				ctx.font = "Italic 30px AleksandraC";
				ctx.fillStyle = '#003';
				ctx.fillText(`Стр. ${this.page}`,25,Y); 
				setImage('CC-BY-SA-Andere_Wikis_(v).svg',[402,1207,117,39]);
				ctx.fillText('CC BY-SA',402+132,Y); 	
				ctx.fillText('= Саша =',833.0,Y); 	
				ctx.fillText('Гриня Лесной   •   Skazochnik.ORG  | VNII.SU',1136.0,Y); 		
			break;
		}  
		
		this.appendPage();
		this.stat.pages++;
		return this;
	},
	closed : true,
	setImage (url,xywh,cb,eb){
		let ctx = PAGE.ctx;
		let [x,y,w=false,h=false]=xywh;
		let img = new Image();
		img.onload=function(){
			console.log(this);
			ctx.drawImage(this,x,y,w||this.width,h||~~(this.height*(w? w/this.width:1)) ); 
			if(cb)cb();
		}
		if(eb)img.onerror=eb;
		img.src = 	TEMPLATEDIR+url;
	},
	setList(){ 
		DATA.list.forEach(PAGE.setFrame,PAGE);
		if(PAGE.closed === false)PAGE.closePage();
		let st = document.createElement('div');
		st.style.padding='20px 10px'; 
		// st.style.color='#fff';
		// st.style.fontSize='35px';
		st.innerHTML=`<b>Pages:</b> ${this.stat.pages} (${DATA.scene.pages.first} - ${DATA.scene.pages.first+this.stat.pages})<br/>
		<b>Frames:</b> ${this.stat.frames}<br/>`;
		document.body.appendChild(st);
	},
	stat:{pages:0,frames:0}
} 
;  
document.addEventListener("DOMContentLoaded", ()=>{
	// document.body.style.background='#333';  
	loadScript([TEMPLATEDIR + 'lib.js',TEMPLATEDIR + 'polyfills/main.js'],()=>{ 
		if(DATA.scene || DATA.Scenes)
		PAGE.Init();
	})
	
});