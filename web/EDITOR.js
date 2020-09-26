EDITOR = {
    ui : {
        input : {}
    },
    current : {
        active : null,
        selected : [],
    },//выделенные
    last : {
        active : null,
        selected : [],
    },// пред выделенные
    buffer : [],
    Init (){
        EDITOR.sidebar = DIV({id:'sidebar', parentNode:document.body});
        EDITOR.sidebar.addEventListener('click',function(ev){
            if(ev.target.dataset.action && !ev.target.closest('[disabled]'))EDITOR.actions[ev.target.dataset.action].call(ev.target,ev);
        });
        EDITOR.ui.svgtree = UL({id:"SVGTree",className:'width100' });
        EDITOR.ui.svgtree.addEventListener("click",function(ev){
            var outer = this;
            var e = ev.target.closest(".nodeItem");
            if(ev.target.classList.contains('toggler')){
                e.classList.toggle("opened")
            }else if(ev.target.classList.contains('content')||ev.target.classList.contains('nodeItem')){
                outer.querySelectorAll(".nodeItem.selected,.nodeItem.hasSelected").forEach(function(e){
                    e.classList.remove("selected","hasSelected")
                });
                e.classList.add("selected");
                var cur = e.svgNode
                while(e = e.parentNode.closest("#SVGTree .nodeItem")){
                    e.classList.add("hasSelected","opened");
                }
 
                EDITOR.setCurrentNode(cur);
                // EDITOR.current.treeNodeItem = e;
                // EDITOR.current.treeNodeItemContent = e.querySelector('.content');
                
            }
        })
        
        EDITOR.ui.svgtreebox = DIV({id:"svgctrlr",className:'width100',  parentNode:EDITOR.sidebar},[
            EDITOR.ui.svgtree
        ]);
        EDITOR.ui.input.name = INPUT({className:'width100', readonly : true, name:"name", parentNode:EDITOR.sidebar});
        EDITOR.ui.input.name.addEventListener('click',ev=>ev.target.select())
        EDITOR.ui.input.prop = SELECT({className:'width100', name:"prop", parentNode:EDITOR.sidebar});
        EDITOR.ui.input.prop.addEventListener('change',function(){
            switch(this.value){
                case 'style': 
                    EDITOR.ui.input.item.value = EDITOR.current.node.style.cssText; 
                break;
                case 'textContent': 
                    EDITOR.ui.input.item.value = EDITOR.current.node.textContent; 
                break;
                case 'setContent':  
                    EDITOR.ui.input.item.value =  Array.prototype.map.call(EDITOR.current.node.children, span => span.textContent ).join('\n')
                break;
                default: 
                    EDITOR.ui.input.item.value = EDITOR.current.node.getAttribute(this.value);
            }
        })
        EDITOR.ui.input.item = TEXTAREA({className:'width100', name:"item", parentNode:EDITOR.sidebar});
        var onChange = ev=>{
            var cur = EDITOR.current.node,
            prop = EDITOR.ui.input.prop.value,
            v = ev.target.value;
            switch(prop){
                case 'style':
                    cur.style.cssText = v

                break;
                case 'textContent':
                    console.log('onChange',ev)
                    EDITOR.insertText(cur,v,true);
                break;
                case 'setContent':
                    console.log('onChange',ev);
                    
                    var x = +cur.getAttribute('x');
                    var y = +cur.getAttribute('y');
                    var fontSize = parseInt(cur.style.fontSize) || PROJECT.styles.FRAME.fontSize; 
                    var lh = fontSize * PAGE.styles.lineHeight; 
                    v = v.split(/\n/);
                    var i = 0, ch = cur.children;
                    for(;i<v.length; i++)
                        if(ch[i])ch[i].textContent = v[i];
                        else SVG('tspan',{parentNode:cur,x :x,y:y+i*lh,textContent:v[i]});
                    for(;i<ch.length; i++)ch[i].remove();
                break;
                case 'x':
                case 'y':
                    if(cur.tagName==='text'){
                        if(prop === 'x')EDITOR.moveText(v,false,"a")
                        else EDITOR.moveText(false,v,"a")
                        break;
                    }
                default:
                    EDITOR.current.node.setAttribute(prop,v);

            }

        }
        // EDITOR.ui.input.item.addEventListener('change',onChange);
        EDITOR.ui.input.item.addEventListener('input',onChange);
        EDITOR.setBTN('cut');
        // EDITOR.setBTN('remove',{},'X');
        EDITOR.setBTN('movetext');
        EDITOR.setBTN('textanchor',{dataset:{anchor:'start'}},'Al');
        EDITOR.setBTN('textanchor',{dataset:{anchor:'middle'}},'Ac');
        EDITOR.setBTN('textanchor',{dataset:{anchor:'end'}},'Ar');
        EDITOR.setBTN('divtotext',{disabled: true},'dt');
        EDITOR.setBTN('saveBtn_click',{}, 'S');
        EDITOR.setBTN('repair',{}, 'Rp');
        addEventListener('FrameClick',ev=>{
            dQ('.btn[data-action="divtotext"]').toggleAttribute('disabled', EDITOR.current.active.tagName !== 'DIV');
        })
        EDITOR.ui.console = TEXTAREA({
            parentNode: EDITOR.sidebar,
            id : 'console', 
        });
    },
    console(type,data){
        switch(type){
            case 'text':
                // if(data.tagName === 'd')
                EDITOR.ui.console.value = data.innerHTML.replace(/((<\/tspan>)|(<br[\/]{0,1}>))/gi,'\n').replace(/(<[^>]+>)/g,'')
            break;
        }
    },
    createSVG(d){
		let stroke = 3;
		let svg = `<svg 
			xmlns:dc="http://purl.org/dc/elements/1.1/"
			xmlns:cc="http://creativecommons.org/ns#"
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
			xmlns:svg="http://www.w3.org/2000/svg"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
			xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
			version="1.1" viewBox="0 0 ${d.W} ${d.H}" height="${d.H}" width="${d.W}" class="framesvg">
				<defs id="defs2">
					<style id="style5694">
						svg.framesvg path{fill:#fff; stroke:${PROJECT.styles.fillStyle};
						stroke-width:${stroke};
                        opacity:1;} 
                        svg.framesvg text, svg.framesvg div, svg.framesvg textarea, svg.framesvg p, svg.framesvg flowPara{${ PROJECT.styles.FRAME.svgFont }; }

					</style>
				</defs> 
				<g  sodipodi:insensitive="true"  id="layer1">
					<image sodipodi:insensitive="true" xlink:href="${d.img}" y="0" x="0" height="${d.H}" width="${d.W}" />
				</g>
				<g id="layer2"></g>
				${d.pathes&&d.pathes.length>0 ? d.pathes : [`<path id="path5753" d="m 25,-122 c -77,47 56,69 90,53 13,-6 8,-56 -1,-62 -12,-8 -33,0 -47,0 -17,0 -27,7 -41,9 z" style="opacity:1;fill:#fff;stroke:${PROJECT.styles.fillStyle};stroke-width:${stroke};"/>`].join('')}
				<g id="layer3"></g> 
				
		</svg>`; 
		var svgBox = DIV({className:'svgBox', dataset:{name:d.name}},svg);
		svg = svgBox.firstChild;
		var foreignObject = SVG('foreignObject',{x :0,y:0,width:d.W,height:d.H, parentNode:svg}  );
		var scale = 1;
		d.texts.forEach(t=>{ 
			let p, x = t.attr.x, y = t.attr.y, tr = t.attr.transform,style = t.attr.style||'';
			// style.replace(/(:|;)\s/g,'$1').split(';').filter(s=>{ if(s){let s1 = s.split(':'); return !!s1[0]}})
			let tr_type = tr ? tr.match(/(^[a-z]+)/)[0] : null;
			if(tr)tr = tr.match(/(\d+\.{0,1}\d*)/g);
			console.log(tr_type)
			x = +x||0; y =+y||0;
			switch(t.type){
				case 'text':
					p = SVG('text',{parentNode:svg});
					if(tr)
					switch(tr_type){
						case "translate":
							x+=+tr[0];
							y+=+tr[1];
							tr = false;
						break;
						case "matrix":
							// x+=+tr[4];
							// y+=+tr[5];
							// tr[4] = tr[5] = 0;//Смещение пусть за счёт координат
							// // tr[0] = tr[3] = 0;//Масштаб пусть за счёт координат
							
							// // tr[0] = (+tr[0])/scale; 
							// // tr[3] = (+tr[3])/scale; 
							// // TODO: Понять как рассчитывать: для текста внутри - двойной спан с параметрами x,y
							// tr[1]=(-tr[1]);
							// tr[2]=(+tr[2]);
							// x*=2;
							// y=y/2;
							// // scale
							// tr[0] = 1+(1-tr[0]); 
							// tr[3] = 1+(1-tr[3]); 
							
							// tr = `matrix(${tr}`;
							tr = t.attr.transform;
						break;
						default:
							tr = t.attr.transform;
					} 

					// p.style.left = Math.round(x*scale)+'px';
				// p.style.top = Math.round(y*scale)+'px';
				p.setAttribute('x',x);
				p.setAttribute('y',y);
				
				
				p.style.cssText = style;
				var fontSize = parseInt(p.style.fontSize) || PROJECT.styles.FRAME.fontSize; 
				var lh = fontSize * PAGE.styles.lineHeight; 
				t.innerText.split(/\n/).forEach((t,i)=>{
					SVG('tspan',{parentNode:p,x :x,y:y+i*lh,textContent:SPAN(t).innerText})
				})
				break; 
				case 'flowRoot':
					// p = SVG('text',{parentNode:svg});
					// var _p = svg; 
					p = DIV( { parentNode: foreignObject },'' );
					// p.addEventListener('input',function(){
					// 	this.style.height = this.scrollHeight + 'px';
					// })
					
					//  dCE('body',{'xmlns':'http://www.w3.org/1999/xhtml',parentNode:svg},p =DIV( {'xmlns':'http://www.w3.org/1999/xhtml'}),'http://www.w3.org/1999/xhtml');
 

					if(tr)
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
							tr[1]=(-tr[1]);
							tr[2]=(+tr[2]);
							// scale
							tr[0] = 1+(1-tr[0]); 
							tr[3] = 1+(1-tr[3]); 
							
							tr = `matrix(${tr}`;
						break;
						default:
							tr = t.attr.transform;
					} 
					p.style.cssText = style;
					p.style.left = Math.round(x )+'px';
				p.style.top = Math.round(y )+'px';
				p.style.width = Math.round(t.attr.width )+'px'; 
				p.style.position = 'absolute'; 
				p.innerText = SPAN(t.innerText).innerText.replace(/\n/,'<br/>');
				break;
			} 
			console.log( p.getBoundingClientRect() )

			if(t.attr.width)p.style.width = Math.round((t.attr.width)*scale)+'px'; 
			if(tr)p.style.transform =tr;
			 

			
		});


		// let content = DIV({className : "content", contenteditable:true, dataset: {scale : scale}, parentNode:fra},texts);
		// content.addEventListener('input',function(ev){
		// 	for(let n of this.childNodes){
		// 		if(!(n instanceof Element))PTag({parentNode:this},n)
		// 	}
		// })

		return svgBox
    },
    mergeTspan(node,nap){
        /**
         * 1 Запоминает окончание вышестоящей строки
         * 2 Заменяет в ней текст нна сумму текстов
         * 3 Фокус, селект на позицию в тексте = длине исходной строки
         * 4 смещает нижележащие
         * 
         */
        if(node.tagName!=='tspan')return;
        var first, second;
        switch(nap){
            case "UP":case -1:case 'Backspace':
                first = node.previousElementSibling;
                second = node;
            break;
            default:
                first = node;
                second = node.nextElementSibling;
        }
        if( first && second ){
            var text = first.textContent;
            first.textContent+=second.textContent;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(first,text.length);
            range.setEnd(first,text.length); 
            first.focus(); 
            // range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            next.remove();
            next = first;
            var fontSize = getComputedStyle(cur).fontSize || PROJECT.styles.FRAME.fontSize;
            var lh = parseInt(fontSize)*PAGE.styles.lineHeight;
            while(next = next.nextElementSibling)
                next.setAttribute('y',+next.getAttribute('y') - lh); 

        }
        EDITOR.changeFrame();
        
    },
    setBTN(action,attr,ctx){
        var btn = ALink(Object.assign(attr||{},{ parentNode:EDITOR.sidebar}), ctx || action[0].toUpperCase());
        btn.dataset.action = action;
        btn.classList.add('btn');
        return btn
    },
    changeFrame(svg){
         var svg = svg || EDITOR.current.svg;
        if(svg){
            svg.parentNode.classList.add('changed','notSaved');
        }
    },
    actions : {
        Frame_click : function(ev){
            var svg = ev.target.closest('svg'),
            textTag = svg && ev.target.closest('svg div, text');
                var selection = window.getSelection();
                var textNode = selection.anchorNode;
			if( svg && !textTag){
				textNode = TextNode('');
				textTag = SVG('text',{x:ev.offsetX,y:ev.offsetY,parentNode: svg},
					SVG('tspan',{x:ev.offsetX,y:ev.offsetY},
                    textNode
					)
				);
				var range = document.createRange();
				range.setStart(textNode,0);
				range.setEnd(textNode,0); 
				selection.removeAllRanges();
				selection.addRange(range);
				console.log('create',textNode, svg)
            }

            
            for(let n in EDITOR.ui.input)EDITOR.ui.input[n].value = "";
            
            EDITOR.current.svg = svg;
            if(textTag){
                EDITOR.console('text',textTag);
                EDITOR.last.active = EDITOR.current.active;
                if(EDITOR.last.active && ev.detail!=='insertText')
                    EDITOR.cleanSVGText(EDITOR.last.active);
                EDITOR.last.selected = [].concat(EDITOR.current.selected);
                EDITOR.current.active = textTag;
                EDITOR.current.selected = [];
                EDITOR.current.selected.push(textTag);
            }
            EDITOR.setCurrentNode(textNode);
            EDITOR.drawTree()
            EDITOR.current.name = svg.closest('.frame').getAttribute('name');
            EDITOR.ui.input.name.value = EDITOR.current.name;

            if(svg)EDITOR.actions.past();

            dispatchEvent(new CustomEvent( 'FrameClick' ))

			console.log(ev.target,ev)
		},
        Frame_keypress : function(ev){
            var selection = window.getSelection();
                var firstNode =selection.baseNode,
                    cur = firstNode.parentElement, 
                    curText = cur.textContent,
                    index = selection.baseOffset;
                    console.log(cur,selection);

            console.log(ev.key,cur,index) 
            switch(ev.key){
                case 'Enter': 
                console.log(ev)
                
                if(cur.tagName ==='tspan' || cur.tagName ==='text'){ 
                var _new = cur.cloneNode();

                    if(index < curText.length){   
                        cur.textContent = curText.substr(0,index);
                        _new.textContent = curText.substr(index);
                    }
                    cur.after(_new);

                    var next = cur ; 
                    var fontSize = getComputedStyle(cur).fontSize || PROJECT.styles.FRAME.fontSize;
                    var lh = parseInt(fontSize)*PAGE.styles.lineHeight;
                    while(next = next.nextElementSibling)
                        next.setAttribute('y',+next.getAttribute('y') + lh);

                    _new.focus();
                    // range.deleteContents();
                    // range.insertNode(br);
                    var range = document.createRange();
                    firstNode = _new.firstChild || _new.appendChild(TextNode(''))
                    // var _emptyNode = TextNode('\n');
                    // _new.insertBefore(_emptyNode,_new.firstChild)
                    // // range.setStartAfter(_emptyNode);
                    // // range.setEndAfter(_emptyNode);
                    // range.selectNodeContents(_emptyNode) 
                    // range.collapse(false);
                    range.setStart(firstNode,0);
                    range.setEnd(firstNode,0);
                    console.log(firstNode)
                    selection.removeAllRanges();
                    selection.addRange(range);
                    // _emptyNode.textContent='';
                    EDITOR.changeFrame();
                    ev.preventDefault();
                }else if(!ev.shiftKey){
                    
                    var br = EmptyElement('br');
                    var _emptyNode = TextNode(' ');
                    var range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.setEndAfter(br); 
                    range.collapse(false);

                    selection.removeAllRanges();
                    selection.addRange(range);
                    cur.focus()

                    // cur.before(
                    // 	TextNode(curText.substr(0,index))
                    // )
                    // cur.before(
                    // 	EmptyElement('br')
                    // )
                    // cur.textContent = curText.substr(index);
                    // document.execCommand('innerHTML',false,'<br/>')
                    EDITOR.changeFrame();
                    ev.preventDefault();

                }
                
                break; 
                case 'Backspace': 
                break;
                default:
                    if(cur.tagName ==='tspan' && ev.key.length === 1 && index === 0){
                        firstNode.textContent = ev.key + firstNode.textContent;
                        var range = document.createRange();
                        range.setStart(firstNode,1);
                        range.setEnd(firstNode,1);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        EDITOR.changeFrame();
                        ev.preventDefault();
                    }
            }
        },
        Frame_keydown : function(ev){
            console.log(ev.key);
            var shiftKey = ev.shiftKey;
            var ctrlKey = ev.ctrlKey;
            var step = shiftKey ? 10 : 1;
            if(shiftKey || ctrlKey)
                switch(ev.key){   
                
                    case 'Backspace':
                    case 'Delete':
                        if(ctrlKey){
                            EDITOR.actions.remove();
                            ev.preventDefault();
                        }
                    break;
                    case 'ArrowLeft':
                        ev.preventDefault();
                        EDITOR.moveText((-1)*step,0);
                    break;
                    case 'ArrowRight':
                        EDITOR.moveText(step,0);
                        ev.preventDefault();
                    break;
                    case 'ArrowUp':
                        EDITOR.moveText(0,(-1)*step);
                        ev.preventDefault();
                    break;
                    case 'ArrowDown':
                        EDITOR.moveText(0,step);
                        ev.preventDefault();
                    break;
            }
            else
            switch(ev.key){   
                
                case 'Backspace':
                case 'Delete':
                    var selection = window.getSelection();
                    var firstNode =  selection.baseNode,
                        cur = firstNode.parentElement, 
                            str = selection.baseNode.textContent,
                            index = selection.baseOffset;
                    if(cur.tagName ==='text'){
                        ev.preventDefault(); 
                        
                    } 
                    if(cur.tagName !=='tspan')break;
                    
                    console.log(ev.key,index, cur,selection);
                    
                    var range = document.createRange();
                    ev.preventDefault();
                    if(ev.key === 'Delete'){
                        var first = cur;
                        var next = cur.nextElementSibling;
                        if(index===first.length)
                            ev.preventDefault();//В любом случае - тормозим (иначе может радостно стереть не пустой блок)
                        else{   
                            firstNode.textContent = str.substr(0,index) + str.substr(index+1);
                            range.setStart(firstNode,index);
                            range.setEnd(firstNode,index); 
                            selection.removeAllRanges();
                            selection.addRange(range); 
                            break 
                        };
                    }else{
                        var first = cur.previousElementSibling;
                        var next = cur;
                        if(index===0)
                            ev.preventDefault();//В любом случае - тормозим (иначе может радостно стереть не пустой блок)
                        else{ 
                            firstNode.textContent = str.substr(0,index-1)+str.substr(index)
                            range.setStart(firstNode,index-1);
                            range.setEnd(firstNode,index-1); 
                            selection.removeAllRanges();
                            selection.addRange(range); 
                            break 
                        };
                    }

                    if( first && next ){
                        
                        firstNode = first.lastChild;
                        if(!firstNode){
                            firstNode = first.appendChild(TextNode(''))
                        }

                        range.setStartAfter(firstNode);
                        range.setEndAfter(firstNode);
                        while(next.firstChild)
                            range.insertNode(next.firstChild);
                        var lh = Math.abs(+next.getAttribute('y') - first.getAttribute('y'))
                        next.remove();
                        next = first;
                        // var fontSize = getComputedStyle(cur).fontSize || PROJECT.styles.FRAME.fontSize;
                        // var lh = parseInt(fontSize)*PAGE.styles.lineHeight;
                        while(next = next.nextElementSibling)
                            next.setAttribute('y',+next.getAttribute('y') - lh);

                        
                        // range.deleteContents();
                        first.focus(); 
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        ev.preventDefault();
                    } 
                break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    var selection = window.getSelection();
                    var firstNode =  selection.baseNode,
                        cur = firstNode.parentElement, 
                            str = selection.baseNode.textContent,
                            index = selection.baseOffset;
                    if(cur.tagName !=='tspan')break;
                    if(ev.key === 'ArrowLeft' && (index === 1 || index === 0 && cur.previousElementSibling)){
                        var range = document.createRange();
                        if(index===0){
                            firstNode = cur.previousElementSibling.lastChild;
                            index = firstNode.textContent.length+1;
                        }
                        range.setStart(firstNode,index-1);
                        range.setEnd(firstNode,index-1); 
                        selection.removeAllRanges();
                        selection.addRange(range); 
                        ev.preventDefault();
                    }
                    if(ev.key === 'ArrowRight' && ( index === firstNode.textContent.length  && cur.nextElementSibling)){
                        var range = document.createRange();
                        firstNode = cur.nextElementSibling.lastChild;
                            index = 0;
                        range.setStart(firstNode,index);
                        range.setEnd(firstNode,index); 
                        selection.removeAllRanges();
                        selection.addRange(range); 
                        ev.preventDefault();
                    } 
                    console.log(index)
                break;
                case 'ArrowUp':
                case 'ArrowDown':
                    var selection = window.getSelection();
                    var firstNode =  selection.baseNode,
                        cur = firstNode.parentElement, 
                            str = selection.baseNode.textContent,
                            index = selection.baseOffset;
                    if(cur.tagName !=='tspan')break;
                    var next = ev.key === 'ArrowUp' ? cur.previousElementSibling : cur.nextElementSibling;
                    if(next){
                        firstNode = next.lastChild;
                        index = Math.min(index,next.textContent.length)
                        var range = document.createRange();
                        range.setStart(firstNode,index);
                        range.setEnd(firstNode,index); 
                        selection.removeAllRanges();
                        selection.addRange(range); 
                        ev.preventDefault();
                    }
                    ev.preventDefault();
                break;		
                default:
                             
            }
            // EDITOR.console('text',textTag)
            EDITOR.changeFrame();
        },
        Frame_mouseout : function(ev){

            console.log('blur' );
            // EDITOR.cleanSVG(this); 
        },
        saveBtn_click : function(){
            var isFrameBtn = this.parentNode.classList.contains('frame');
            var svg_orig = isFrameBtn ? this.parentNode.querySelector('svg') : EDITOR.current.svg;
            var svg = svg_orig.cloneNode(true);
             EDITOR.cleanSVG(svg);
            svg.querySelector('foreignObject').remove();
            svg_orig.querySelectorAll('div').forEach(function(div){
                var innerHTML = div.innerHTML.replace(/(<br[\/]{0,1}>)/g,'\n').trim()
                if(innerHTML) {
                    var flowRoot = SVG('flowRoot',{parentNode:svg},[
                        SVG('flowRegion',{},
                            SVG('rect',{
                                x:div.offsetLeft,
                                y:div.offsetTop,
                                width:div.offsetWidth,
                                height:div.offsetHeight,
                            })
                        ),
                        SVG('flowPara',{style:PROJECT.styles.FRAME.svgFont},
                            innerHTML
                        )
                    ])
                    if(div.style.transform)flowRoot.setAttribute('transform',div.style.transform)
                }
            });
            var img = svg.querySelector('image');
            var NS = 'http://www.w3.org/1999/xlink';
            var name = isFrameBtn ? this.dataset.name : EDITOR.current.name;
            var frm = (PAGE.framesData[name] || {data:{imgFile:name+'.png'}}).data;
            img.setAttributeNS(NS,'href',frm.imgFile)
            var svg_text = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'+ svg.outerHTML;// .replace(/(data-lock[^\s]*)/g,'sodipodi:insensitive="true"');
            // console.log(svg_text);
            if(!isFrameBtn)this.setAttribute('download',name +'.svg');
            this.href = Base64.getBase64String(svg_text,"image/svg+xml");
            svg_orig.parentNode.classList.remove( 'notSaved');
        },
        movetext(){
            var value = prompt().match(/[^,\.:]+/g)||[];
            var data = {x:false,y:false};
            var type = "d";
            var o = "x";
            var test = /(\d|c)/;
            value.forEach(function(v,i){
                v = v.toLowerCase().trim();
                if(i===0 && v === "a"){
                    type = "a";
                }else if(test.test(v)){//Есть число
                     v = v=== 'c' ? false : +(v);
                    if(o === "x"){
                        data[o] = v;
                        o = "y";
                    }else  if(o === "y"){
                        data[o] = v;
                        o = "z";
                    }
                }else{
                    o = v;
                }
            })
            EDITOR.moveText(data.x,data.y,type) ; 
        },
        cut(){
            var selection = window.getSelection();
                        var firstNode =  selection.baseNode,
                            cur = firstNode.parentElement;
            var text = cur.closest('text,svg div');
            EDITOR.buffer = EDITOR.current.selected.filter(t=>!!t);
        },
        past(){ 
            if(EDITOR.buffer && EDITOR.buffer.length>0){ 
                var svg = EDITOR.current.svg,
                foreignObject = svg.querySelector('foreignObject');
                EDITOR.changeFrame(EDITOR.buffer[0].closest('svg'));
                EDITOR.buffer.forEach(text => {
                    if( text.tagName === 'div')
                        foreignObject.appendChild(text);  
                    else 
                        svg.appendChild(text);  
                })
                EDITOR.buffer = [];
                EDITOR.changeFrame(svg);
            }       
        },
        // div => text
        divtotext(){ 
                var cur = EDITOR.current.active;
            if(cur&&cur.tagName === 'DIV'){
               var svg = EDITOR.current.svg;
               var fontSize = parseInt(getComputedStyle(cur).fontSize) || PROJECT.styles.FRAME.fontSize;
               var lh = fontSize*PAGE.styles.lineHeight; 
               var x = parseInt(cur.style.left || 0);
               var y = parseInt(cur.style.top || 0) + fontSize;
               var Wsvg = svg.getBoundingClientRect().width;
               var scale = Wsvg/svg.getAttribute('width');
            //    var W = cur.clientWidth*scale;
            //    var W = cur.getBoundingClientRect().width/scale;
                var W = parseInt(cur.style.width)*scale;
            //    Заходит ли за предел выделенной области?
               var R = W + parseInt(cur.style.left)*scale - Wsvg;
                if(R > 0)W-=R;
            //    TODO: рассчёт длины и трансформации
               var text = SVG('text',{x:x,y:y, parentNode:svg});
               ['fontSize','fontFamily','fill'].forEach(s => {
                   if(cur.style[s])text.style[s] = cur.style[s] + (s === 'fontSize' ? 'px' : '');
               }) 
               var i = 0;
               cur.innerHTML.split(/<br[\s]*[\/]{0,1}>/).forEach((t)=>{
                    let tspan = SVG('tspan',{parentNode:text ,x :x,y:y+i*lh });
                    i++;
                    let $t = t.split(/\s/), _t=$t.shift();
                    let _tl = _t;
                    for(let word of $t){
                        _t+= ' ' + word;
                        tspan.textContent = _t;
                        if(tspan.getBoundingClientRect().width > W){//Если больше ширины - возвращаем прошлое значение и создаем новую строку
                            tspan.textContent = _tl;
                            tspan = SVG('tspan',{parentNode:text ,x :x,y:y+i*lh, textContent: word });
                            i++;
                            _tl = _t = word;
                        }else{ 
                            _tl = _t;
                        }
                        
                    }

                });
                // TODO: рассчёт длины: выдиление - начало, выдиление +. Если, расстояние больше - найти пробел и сэметировать нажатие enter
                cur.remove();
                text.dispatchEvent(new CustomEvent('click',{bubbles:true}));
                EDITOR.changeFrame();
            }
        },
        textanchor(){
            EDITOR.textAnchor(this.dataset['anchor']); 
        },
        remove(){
            EDITOR.current.selected.forEach(t=>t.remove());
            EDITOR.changeFrame();
        },
        repair(trim){
            EDITOR.current.selected.forEach(text=>{
                EDITOR.cleanSVGText(text);
                text.setAttribute('x',~~(+text.getAttribute('x')));
                text.setAttribute('y',~~(+text.getAttribute('y')));
                text.querySelectorAll('tspan').forEach(tspan=>{
                    tspan.setAttribute('x',~~(+tspan.getAttribute('x')));
                    tspan.setAttribute('y',~~(+tspan.getAttribute('y')));
                    var t = tspan.innerHTML; 
                    if(trim)t= t.trim();
                    tspan.innerHTML = t;
                })
                
            });
        }
       
    },
    setCurrentNode(cur){
        var curElem = cur;
        var last = EDITOR.current.node;
        EDITOR.current.node = cur;
        var props = [];
        switch(cur.nodeType){
            case 1: 
                if(last === cur)return;
                if(cur.tagName === 'text')props.push('setContent');
                props.push('style');
                if(cur.tagName === 'tspan')props.push('textContent');
                var A = cur.attributes;
                for(let i=0; i<A.length;i++)if(A[i].name!=='style')props.push(A[i].name);
            break;
            default: 
                curElem = cur.parentNode; 
                // if(last.nodeType === cur.nodeType)return; 
                props.push('textContent');
        } 
        
        EDITOR.ui.input.item.value = '';
        EDITOR.ui.input.prop.innerHTML ='';
        var textElem = curElem.closest("text");  

        EDITOR.ui.input.prop.appendChild(
            SELECT.getOPTIONS(props)
        )
        EDITOR.ui.input.prop.value = props[0];
        EDITOR.ui.input.prop.dispatchEvent(new CustomEvent("change",{bubbles:true}));
        if(textElem && EDITOR.current.active!==textElem)curElem.dispatchEvent(new CustomEvent("click",{bubbles:true}))
    },
    insertText(tspan, text, select){
        
        if(tspan.nodeType!==1)tspan = tspan.parentNode;
        var cur = tspan;
        
        var textArr = text.replace(/\r/g,'').split('\n');
        cur.textContent = textArr[0];
        var item =  EDITOR.current.treeMap.get(tspan);
        item = item&&item.textItem;
        if(item){
            // item.e.qu
            item.content.dataset.content = textArr[0];
            item.e.svgNode = cur.firstChild;
        }
        // EDITOR.setCurrentNode(cur.firstChild);
        EDITOR.current.node = cur;
        if(textArr.length>1){
            var svg = cur.closest('svg');
            var fontSize = parseInt(getComputedStyle(cur).fontSize) || PROJECT.styles.FRAME.fontSize;
            var lh = fontSize*PAGE.styles.lineHeight;
            var x = parseInt(cur.getAttribute('x') || 0);
            var y = parseInt(cur.getAttribute('y') || 0); 
            for(var i = 1;i<textArr.length;i++){
                let tspan = SVG('tspan',{ x :x,y:y+i*lh },textArr[i]);
                let next = cur;
                while(next = next.nextElementSibling)
                    next.setAttribute('y',+next.getAttribute('y') + lh); 
                cur.after(tspan);
                cur = tspan;
            };
            console.log(textArr)
            if(select){
                if(!cur.textContent){
                    // while(cur = cur.previousElementSibling)if(cur.textContent)break;
                    // if(!cur)cur = tspan;
                    cur.textContent = " "
                }
                if(cur.textContent){
                    var selection = window.getSelection();
                    var textNode = cur.lastChild; 
                    var range = document.createRange();
                    var p = textNode.textContent.length-1;
                    if(!cur.textContent.trim())p=0;
                    range.setStart(textNode,p);
                    range.setEnd(textNode,p); 
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                cur.dispatchEvent(new CustomEvent("click",{bubbles:true, detail:'insertText'}));
                // if(EDITOR.current.treeNodeItemContent)EDITOR.current.treeNodeItemContent.textContent
               
            }
            
        }
    },
    // Дерево svg
    drawTree : function(){
        var svg = EDITOR.current.svg;
        var outer = EDITOR.ui.svgtree;
        var cur = EDITOR.current.node;
        EDITOR.current.treeMap = new Map();
        outer.innerHTML = '';
        var drawNode = function(node,parent){
            var e, ctx;
            switch(node.nodeType){
                case 1:
                    var ch = UL({className:'children'});
                    e = LI({
                        className:'tagItem nodeItem',
                        parentNode:parent
                    },[
                        SPAN({className:'toggler'}),
                        ctx = DIV({
                            className:'content',
                            dataset : {
                                tag : node.tagName
                            }
                        }),
                        ch,
                    ]);
                    
                    EDITOR.current.treeMap.set(node, {e:e,content:ctx});

                    for(var i=0; i< node.childNodes.length; i++){
                        drawNode( node.childNodes[i],ch)
                    }
                break;
                case 8:
                    e = LI({
                        className:'commentItem nodeItem',
                        parentNode:parent
                    },
                        ctx = DIV({
                            className:'content',
                            dataset:{content: node.textContent}
                        })
                    )
                    EDITOR.current.treeMap.set(e, {item:e,content:ctx});
                break;
                case 3:
                    var text = node.textContent.trim();
                    if(text || node === cur)
                    e = LI({
                        className:'textItem nodeItem',
                        parentNode:parent
                    },
                        ctx = DIV({
                            className:'content',
                            dataset:{content: node.textContent}
                        })
                    )
                    var parentItem = EDITOR.current.treeMap.get(node.parentNode);
                    parentItem.textItem =  {e:e,content:ctx};
                    // EDITOR.current.treeMap.set(node, {item:e,content:ctx});
                break;
            }
            if(e){
                e.svgNode = node;
                if(node === cur){
                    // e.classList.add('selected','opened');
                    // while(e.parentNode!==outer){

                    // }
                    e.dispatchEvent(new CustomEvent("click",{bubbles:true}))
                }
            }
        }
        if(svg)drawNode(svg,outer)
    },
    arrayToText : function(textArr,cur, W){
        
        var svg = cur.closest('svg');
        var fontSize = parseInt(getComputedStyle(cur).fontSize) || PROJECT.styles.FRAME.fontSize;
        var lh = fontSize*PAGE.styles.lineHeight;
        var x = parseInt(cur.getAttribute('x') || 0);
        var y = parseInt(cur.getAttribute('y') || 0);
        var Wsvg = svg.getBoundingClientRect().width;
        var scale = Wsvg/svg.getAttribute('width');
        //    Заходит ли за предел выделенной области? 
        var W = parseInt(x)*scale - Wsvg;
        var i = 0;
        textArr.forEach((t)=>{
            let tspan = SVG('tspan',{parentNode:text ,x :x,y:y+i*lh });
            i++;
            let $t = t.split(/\s/), _t=$t.shift();
            let _tl = _t;
            for(let word of $t){
                _t+= ' ' + word;
                tspan.textContent = _t;
                if(tspan.getBoundingClientRect().width > W){//Если больше ширины - возвращаем прошлое значение и создаем новую строку
                    tspan.textContent = _tl;
                    tspan = SVG('tspan',{parentNode:cur ,x :x,y:y+i*lh, textContent: word });
                    i++;
                    _tl = _t = word;
                }else{ 
                    _tl = _t;
                }
                
            }

        });
    },
    textAnchor(tA){
        var text = EDITOR.current.active;; 
        if(text&&text.tagName === 'DIV'){

        }else{
            var ctA = text.style.textAnchor || 'start',
            w = ~text.getBoundingClientRect().width,
            x = +text.getAttribute('x'),
            x0 = x, dx =0;
            var svg = text.closest('svg'),
            scale = svg.getBoundingClientRect().width/svg.getAttribute('width');
            w=w/scale;

            switch(text.style.textAnchor){
                case 'middle':
                    x-=w>>1;
                break;
                case 'end':
                    x-=w;
                break;
            }
            switch(tA){
                case 0:
                case 'center':
                    tA = 'middle';
                break;
                case -1:
                case 'right':
                    tA = 'end';
                break;
                case 1:
                case 'left':
                    tA = 'start';
                break;   
            }
            switch(tA){
                case 'middle':
                    x+=w>>1;
                break;
                case 'end':
                    x+=w;
                break;
                default:
                    
            }
            dx = x - x0;
            text.style.textAnchor = tA;
            text.setAttribute('x',~~(x0-dx));
            text.childNodes.forEach(tspan=>{
                tspan.setAttribute('x',~~(tspan.getAttribute('x') - dx));
            })
        }
        EDITOR.changeFrame();
    },
    moveText(X=0,Y=0,type = "d"){
        // var selection = window.getSelection();
        //             var firstNode =  selection.baseNode,
        //                 cur = firstNode.parentElement;
        // var text = cur.closest('text,svg div');
        var text = EDITOR.current.active;
        var svg =  EDITOR.current.svg;
        var x,y;
        if(type === "a"){
            var sW = parseInt(svg.getAttribute('width'));
            var sH = parseInt(svg.getAttribute('height'));
            
        }
        EDITOR.current.selected.filter(t=>!!t).forEach(text => {
            if( text.tagName === 'text'){
                x = X; y = Y;
                if(type === "a"){
                    var textBB = text.getBBox();
                    var cx = parseInt(text.getAttribute('x')),
                        cy = parseInt(text.getAttribute('y'));
                    
                    if(x<0)x = sW - textBB.width + x;
                    else if(x === false )x = cx;
                    if(y<0)y = sH - textBB.height + y;
                    else if(y === false )y = cy;
                    // to relative
                    x-=parseInt(text.getAttribute('x'));
                    y-=parseInt(text.getAttribute('y'));
                }else{
                    x = +x; y = +y;
                }

                text = [text].concat(Array.from(text.querySelectorAll('tspan')));
                 
                text.forEach(e=>{
                    e.setAttribute('x',x+parseInt(e.getAttribute('x')));
                    e.setAttribute('y',y+parseInt(e.getAttribute('y')));
                })
            }else {
                if(type === "a"){
                    text.style.left = X + 'px';
                    text.style.top = Y + 'px';
                } else{
                    text.style.left = (parseInt(text.style.left) + X) + 'px';
                    text.style.top = (parseInt(text.style.top) + Y) + 'px'; 
                }
            }
            }
        );
        EDITOR.changeFrame();
        
    },
    cleanSVGText(text){
        // Убиваем пустые в конце
        Array.from(text.children).reverse().find((tspan)=>{ 
            if(tspan.textContent.trim()){
                
                return true;
            }else{
                tspan.remove();
                return false;
            }
        })
        if(text.children.length === 0)text.remove()
        else{ 
            text.style.cssText = PROJECT.styles.FRAME.svgFont + ';' + text.style.cssText;
            Array.from(text.children).forEach(tspan=>{
                tspan.textContent = tspan.textContent.replace(/(&nbsp;|\s)/g,' ').trim();
            });
        }
    

    },
    cleanSVG(svg){
        console.log("cleanSVG")
        svg.querySelectorAll('text').forEach(EDITOR.cleanSVGText);
        svg.querySelectorAll('div').forEach(function(div){
            div.innerHTML = div.innerHTML.trim()
            if(!div.innerText.trim())div.remove();
        })
    }
}