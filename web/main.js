 


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
 
// const URL = decodeURI(location.href);
// var rootURL = URL.substr(0,URL.lastIndexOf('/'));
 
 

 
let script = Array.from(document.getElementsByTagName('script')).find(s=>s.src.indexOf('/main.js')!==-1).src; 
const TEMPLATEDIR = script.substr(0,script.lastIndexOf('/')+1); 


var PARAMS = {}
var PROJECT = {
	list : []
}

var _param_ = location.search.substr(1);
if(!~_param_.indexOf('&')&&!~_param_.indexOf('=')) PARAMS = {scene : _param_}
else {
	_param_.split('&').forEach(p=>{
		
		if(!~p.indexOf('='))switch(p){
			case 'debug':
			break;
			default:
				PARAMS.scene = p;

		}else{
			p = p.split('=');
			PARAMS[p[0]]=p[1]
		}
		

	})
}

document.addEventListener("DOMContentLoaded", ()=>{
	// document.body.style.background='#333';  
	loadScript([TEMPLATEDIR + 'lib.js',TEMPLATEDIR + 'EDITOR.js',TEMPLATEDIR + 'PAGE.js',TEMPLATEDIR + 'polyfills/main.js','DATA.js'],()=>{
		PROJECT = Object.assign(PROJECT,DATA);
		console.log('init');
		var style = document.createElement('style');
		document.head.appendChild(style);
		style.innerHTML = `
			:root {
				--page-box: ${(PROJECT.styles.PAGE.width+40)*2+10}px;
				--page-width: ${PROJECT.styles.PAGE.width}px;
				--page-height: ${PROJECT.styles.PAGE.height}px;
				--frame-font:${PROJECT.styles.FRAME.font};
				--fill:${PROJECT.styles.fillStyle};
		  	}
			
		`; 

		CreateElement('link',{rel:"stylesheet",href: TEMPLATEDIR + 'styles.css',parentNode:document.head})
 

		if(~location.href.split('/').pop().indexOf('en'))PAGE.lang='en';
		PAGE.backupData = JSON.stringify(PROJECT);
        PAGE.width = PROJECT.styles.PAGE.width;
		PAGE.height = PROJECT.styles.PAGE.height; 
		PAGE.scene = PARAMS.scene;
		if(PROJECT.scene || PROJECT.Scenes)
		PAGE.Init();
		EDITOR.Init();

	})
	
});