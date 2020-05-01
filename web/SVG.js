SVG = function(/* tag|[size],attr,content */){
    var e,
        //   isNode = mainUI.isNode,
        A = arguments,
        tagName = 'svg',
        attr,
        content,
        size,
        datasetSupport = 'dataset' in document.documentElement,
        parentNode = null,
        NS = 'http://www.w3.org/2000/svg',
        val, 
        i,
        isUpdate = false,
        inserFunc = 'appendChild';

    var A = arguments, i=1, Ai=A[0]; 

    if (!datasetSupport) e.dataset = {};

    switch(typeof Ai){
        case 'string':
            if(Ai.indexOf('<')===-1){
                tagName = Ai;
                if(A.length === 1)return document.createElementNS(NS,tagName)
            }else{
                content = Ai;
            }
        break;
        case "undefined":
        case "object":
            if(!Ai || Ai instanceof Element){
                e = Ai;
                isUpdate = true;
                break;
            }else if(Ai instanceof Array){
                size = Ai;
                tagName = 'svg';
                break;
            }else{
                attr = Ai;
                content = A[1];
                i=2;
                break;
            }
        case 'number':
        default:
            content = Ai;
    }

    if(A.length>1 && i === 1){
        Ai=A[i];
        i=2;
        if(typeof Ai === 'object' && !(Ai instanceof Node) && !(Ai instanceof DocumentFragment) && typeof Ai.length !== 'number'){
            attr = Ai;
            content = A[2];
            i++;
        }else{
            content = Ai;
        }
    }
    attr = Object.assign({},attr)
    if(attr.tagName)tagName = attr.tagName;
    e = e || document.createElementNS(NS,tagName);
    if(e.tagName==='svg')e.setAttribute('xmlns',NS);

    if(size){
        if(size.length===4 && e.tagName !== 'svg'){
            attr.x = size[0];
            attr.y = size[1];
        }else if(size.length === 2){
            size = [0,0].concat(size);
        }
        
        if(e.tagName === 'svg'){
            attr.viewBox = size+'';
        }
        attr.width = size[2];
        attr.height = size[3];
    }

    if(attr)for(var a in attr){
        if(attr[a]===null||attr[a]===undefined)continue;
        switch(a){
            case 'tagName':case'NS':break;
            case 'style':
                    if(typeof attr.style === 'string')e.style.cssText = attr.style;
                    else for (var s in attr.style) e.style[s] = attr.style[s];
                    break;
                case 'dataset':
                    if(attr.dataset)
                    for (var d in attr.dataset) {
                        if(d.dataset&&d.indexOf('-')===-1) d.dataset[d] = attr.dataset[d];
                        else e.setAttribute('data-' + d, attr.dataset[d]);
                        //if(!datasetSupport)e.dataset[d] =  attr.dataset[d];
                    }
                    break;
                case 'classList':
                    e.classList.add.apply(e.classList, attr.classList);
                    break;
                case 'parentNode':
                case 'parentElement':
                    parentNode = attr[a];
                    break;
                case 'nextSibling'://TODO: мигрирующий элемент
                case 'nextElementSibling':
                    inserFunc = 'after';
                    parentNode = attr[a];
                break;
                case 'previousSibling': 
                case 'previousElementSibling': 
                    inserFunc = 'before';
                    parentNode = attr[a];
                break;
                case 'children':
                    if(!attr.childNodes)for(i = 0; i<attr.children.length; i++)e.appendChild(attr.children[i])
                    break;
                case 'childNodes':
                    if(attr.childNodes)
                    for(i = 0; i<attr.childNodes.length; i++)e.appendChild(attr.childNodes[i])
                break; 
                default:
                        val = attr[a];
                        if(typeof val === 'object'){
                            if(!val)val = false;
                            else if((val instanceof Array)&&!(val[0] instanceof Element))
                                val = val+'';
                            else{
                                if(a === 'for'){
                                    if(!(val instanceof Element))val = val[0];
                                    if(val instanceof Element){
                                        if(!val.id)val.id = uniqueId();
                                        val = val.id;
                                    }
                                }
                            }
                        }
                        switch (typeof val) { 
                            case 'string':
                            case 'number':
                                i = a.indexOf(':');
                                if (i !== -1) {
                                    NS = a.substr(0, i);
                                    a = a.substr(i + 1);
                                    switch (NS) {
                                        case 'xlink':
                                            NS = 'http://www.w3.org/1999/xlink';
                                            break;
                                    }
                                    e.setAttributeNS(NS, a, val)
                                } else
                                    e.setAttribute(a, val);
                                break;
                            case 'undefined':
                                val = false;
                            case 'boolean':
                                // if (val === true) e.setAttribute(a, a);
                                // else if (isUpdate === true) e.toggleAttribute(a,val);
                                e.toggleAttribute(a, val);
                            default:
                                e[a] = val;
                        }
        
        }
    }
    console.log(content)
    if(e.tagName === 'INPUT'){
        if(typeof content === 'boolean' &&(e.type === 'checkbox' || e.type === 'radio'))
            e.checked = content;
        else if(content)
            e.value = content;
    }else if(e.tagName === 'IMG'){
        if(content) content;e.setAttribute('src', content);
    }else
    
    switch (typeof content) {
        case 'string': case 'number': 
        var full = content.indexOf('<svg')!==-1;
        if(!full)content = '<svg xmlns="'+NS+'">'+content+'</svg>';
        if(A.length===1)full=true;
        var doc = new DOMParser().parseFromString(
            content,'application/xml');
            content = document.createDocumentFragment();
            content = content.appendChild(content.ownerDocument.importNode(doc.documentElement, true));
            
            if(full)return content;
            else content = Array.from(content.childNodes); 
        // break;
        case 'object':
            if (content) {
                if(content.tagName === "TEMPLATE")content = content.childNodes;
                if((content instanceof HTMLCollection) || (content instanceof NodeList)){
                    var fr = document.createDocumentFragment(), i=0;
                    while(content[i]){ fr.appendChild(content[i]); if(content[i]&&!content[i].parentElement)i++; }
                    content = fr; 
                }
                if ((content  instanceof Node)||content  instanceof DocumentFragment) e.appendChild(content);
                else if (typeof content.length === 'number') { 
                    var fr = document.createDocumentFragment(), tmp;
                    var ctx;
                    for (i = 0; i < content.length; i++)if (content[i]){
                            ctx = content[i];
                            switch(typeof ctx){
                                case 'string':
                                    if(ctx.indexOf('<')!==-1){ 
                                        tmp = tmp ||  document.createElement('template');
                                        tmp.innerHTML = ctx;
                                        while(tmp.firstChild) fr.appendChild(tmp.firstChild);
                                        break;
                                    } 
                                case 'number':
                                    ctx = TextNode(ctx)
                                case 'object':
                                    if(ctx instanceof Node)fr.appendChild(ctx); 
                            }
                        }
                        e.appendChild(fr); 
                }

            }
            break;
        case 'function': content.call(e, e); break;
    } 
    if(typeof parentNode === 'string')parentNode = document.querySelector(parentNode);
    if(parentNode){ 
        if ( !((parentNode instanceof Element) || (parentNode instanceof DocumentFragment)) ) parentNode=parentNode[0];
        if ( (parentNode instanceof Element) || (parentNode instanceof DocumentFragment) ) parentNode[inserFunc](e);
    }
    return e;
}