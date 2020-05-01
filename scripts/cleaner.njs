
const fs = require('fs');
gm = require('gm');
//const dir = __dirname+'/';

let dir = (process.argv[2]||__dirname).replace(/\\/g,'/');
if(dir.slice(-1)!='/')dir+='/'; 

try {
	const cheerio = require('cheerio');
clean = (svg,f)=>{
const $ = cheerio.load(svg,{xmlMode: true});
let name = f.match(/(.+).svg/)[1].replace(/(_en$)/,'');

console.log(f );
//console.log($('text')[0].attribs.x);
//$('text').each(()=>{console.log(this);})
let texts = $('text');
let l = texts.each((i,e)=>{ 
let $T = $(e);
let tspans = $T.children();
let x = ~~$T.attr('x');
let y =  ~~tspans.get(0).attribs.y; 
$T.attr('y',y);$T.attr('x',x);
tspans.map((i,s)=>{
	let $s = $(s);
	//let style = $s.get(0).attribs.style; 
	//if(style&&!$s.attribs.style)$s.attribs.style=style;
 $s.text($s.text()),$s.attr('x',x);$s.attr('y',~~$s.attr('y'));// console.log($s.html());

});
}) 
let img = $('image');  
let ext = img.attr('xlink:href');
ext=ext.slice(ext.lastIndexOf('.'));
img.attr('xlink:href',name+ext);
img.attr('sodipodi:insensitive',"true")
img.parent('g').attr('sodipodi:insensitive',"true")
gm(name+ext)
.size(function (err, size) {
  if (!err) { console.log(err ? 'err':size)
	img.attr('width',size.width);
	img.attr('height',size.height);
	let svg = $('svg');  
	svg.attr('width',size.width);
	svg.attr('height',size.height);
	svg.attr('viewBox','0 0 '+size.width+' '+ size.height);
  }
  fs.writeFile(dir+f, $.html(), (err)=>{if(err)return console.log(err);}); 
});
//console.log(f,'--',x,texts.html());

//for(t in texts)console.log(t);
/*
hexToRgbA=(hex,op=1)=>{
//if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){}
 c= hex.substring(1).split('');
        if(c.length== 3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',op)';
}
path
//opacity:!important
if(~style.indexOf('opacity')&&!~style.indexOf('opacity:1')){
	s={};
	style.split(';').forEath((e)=>{
	e=e.split(':');let v = e[1].trim(); s[e[0].trim()]=v===+v?+v:v;
	}); 
if(s.opacity&&s.opacity<1)s.fill=hexToRgbA(s.fill,s.opacity); 

}
*/
}
fs.readdir(dir,(e,files)=>{FLIST = files;
for(let f of files){
if(!~f.indexOf('.svg'))continue;
	let svg = fs.readFileSync(f, 'utf8');
	if(!~f.indexOf('<text'))clean(svg,f);
}
});
//$.html()

} catch (error) {
	console.error(error)
	var path = require('path');
	var fn = path.basename(__filename)
	var efPath = dir+'/error.log'
	var lastErr = '';
	if(fs.existsSync(efPath))lastErr = fs.readFileSync(efPath, 'utf8') + '\n\n=======================\n';
	
	fs.writeFile(efPath, `${lastErr}[${(new Date()).toLocaleString()} - "${fn}"]:\n\n${error.stack}`, (err)=>{if(err)return console.log(err);}); 
}