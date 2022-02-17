var dQ = document.querySelector.bind(document);
var dQAll = document.querySelectorAll.bind(document);
var dId = document.getElementById.bind(document);
var EmptyElement =  document.createElement.bind(document);
    
var TextNode = document.createTextNode.bind(document);
var DocFragment = document.createDocumentFragment.bind(document)


function uniqueId() {
    uniqueId.__uid__ = uniqueId.__uid__ || 0;
    return '__uid_' + (uniqueId.__uid__++);
}

function uniqueId2() {
    return "__" + Date.now()
}


var getEl = extrEl =  function(e,p){
    if((e instanceof Element) || (e instanceof DocumentFragment) || (e instanceof HTMLDocument)) return e;
    if(p === false)return null;//Эквивалент (e instanceof Element)
    if(e instanceof Node) return  e.parentElement;
    if(typeof p === 'undefined') p = 0; 
    switch(typeof e){
        case 'string' :
            e = p > 0 ? dQAll(e)[p] : dQ(e);
        break;
        case 'object':
            e = e&&e[(typeof p === 'number') ? p : 0]; 
        break; 
    }

    if(!(e instanceof Element)&&!(e instanceof HTMLDocument))
        switch(typeof p){ 
            case 'string':
                e = dQ(p);
            break;
            case 'object':
                e = p;
            break;
            case 'boolean':
                e =  EmptyElement('div')
            break;
            default:
                e = null;
        } 
    return e;
}

 
var GlobalData = {
    data : new Map(),
    get : function(e,name){ 
        if( (typeof e === 'object') && !(e instanceof Element) && e && ('length' in e)){
            e = e[0];
        }
        if(!e && e!==0)return;
        var d = GlobalData.data.get(e);
        if(!d){
            d = new Map();
            GlobalData.data.set(e,d);
        }
        if(name || name === 0)d = d.get(name);
        return d; 

    },
    has : function(e,name){
        if( (typeof e === 'object') && !(e instanceof Element) && e && ('length' in e)){
            e = e[0];
        }
        if(!e && e!==0)return false;
        if(arguments.length === 1)return GlobalData.data.has(e);
        var d = GlobalData.data.get(e);
        return !!d&&d.has(name);
    },
    set : function(e,name,data){
        if(!e)return;
        var A = arguments;
        if(A.length === 2){
            data = A[1];
            name = undefined;
        }
        var d, list, i=0;
        if( (typeof e === 'object') && !(e instanceof Element) && e && ('length' in e)){
            list = e;
        }
        do{
            e = list ? list[i] : e;
            if(e  && e!==0){ 
                if(name || name === 0){
                    d = GlobalData.data.get(e);  
                    if(!(d instanceof Map)){
                        d = new Map();
                        GlobalData.data.set(e,d);
                    }
                    if(typeof data !== 'undefined')
                        d.set(name,data);
                    else 
                        d["delete"](name);
                }else {
                    
                    if(typeof data !== 'undefined'){
                        GlobalData.data.set(e,data);
                    }else 
                        GlobalData.data["delete"](e);
                }
            }
            i++
        }while(list&&i<list.length);
        return data;
    },
    update : function(e,data){
        var d, list, i=0;
        if( (typeof e === 'object') && !(e instanceof Element) && e && ('length' in e)){
            list = e;
        }
        do{
            e = list ? list[i] : e;
            if(e  && e!==0){ 
                
                d = GlobalData.data.get(e);  
                if(!(d instanceof Map)){
                    d = new Map();
                    GlobalData.data.set(e,d);
                }
                d.$import(data);
            }
            i++
        }while(list&&i<list.length);
        
    },
    remove : function(e,name){
        GlobalData.set(e,name,undefined)
    },
    clone : function(e){
        var A = arguments,
        l, m = false, f,
        d = GlobalData.data.get(e), d1; 
        if(!d) return;
        for(l=1; l<A.length; l++)if(typeof A[l] === 'boolean'){
             m = A[l]; break;
        }
        f = m ? _MG_ : Object.assign;
        for(var i=1; i<l; i++){
            d1 = new Map();
            d.forEach(function(v,k){
                d1.set(k, m ? _MG_(v) : v);
            })
            GlobalData.data.set(A[i], d1);
         }
        return d1;
    }
}

var CreateElement = newElement = function (/*tagName, attr, content, NS*/) {
    var e,
        //   isNode = mainUI.isNode,
        A = arguments,
        tagName,
        attr,
        content,
        datasetSupport = 'dataset' in document.documentElement,
        parentNode = null,
        NS = false,
        val,
        defaultTag = 'span',
        i,
        isUpdate = false,
        inserFunc = 'appendChild';

    //Позволяет устраивать чехарду с аргументами функции 
    var Ai = A[0], i = 1;
    switch (typeof Ai) {
        case 'string':
            tagName = Ai; 
            if(A.length===1)return document.createElement(tagName)
            break; 
        case "undefined":
        case 'object':
            if (!Ai || (Ai  instanceof Element)) {
                e = Ai; //update current - можно использовать для обновления существующего и создания нового, если тот отсутствует
                isUpdate = true;
                break;
            } else if( !(Ai  instanceof Node) && !(Ai  instanceof DocumentFragment) && typeof Ai.length !== 'number' ){
                attr = Ai;
                content = A[1];
                i = 2;
                break;
            }
        case 'number':
            content = Ai; 
            break; 
        default:
            content = Ai; 
    }
    
    if (A.length>1 && i === 1) {
        Ai = A[i];
        i=2;
        if (typeof Ai === 'object' && !(Ai  instanceof Node) && !(Ai  instanceof DocumentFragment) && Ai && typeof Ai.length !== 'number') {
            attr = Ai;
            content = A[2];
            i++;
        } else {
            content = Ai;
            if (typeof A[2] === 'object'){ attr = A[2]; i++;}
        }
    } 
    Ai = A[i];
    NS = (typeof Ai === 'string') && Ai || (typeof attr === 'object') && attr.$NS;

    if (NS)  
        switch (NS.toUpperCase()) {
            case 'HTML':
                NS = 'http://www.w3.org/1999/xhtml';
                break;
            case 'XML':
                NS = 'http://www.w3.org/XML/1998/namespace';
                break;
            case 'SVG':
                NS = 'http://www.w3.org/2000/svg';
                break;
            case 'xlink':
                NS = 'http://www.w3.org/1999/xlink';
                break;
            case 'XBL':
                NS = 'http://www.mozilla.org/xbl';
                break;
            case 'XUL':
                NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
                break;
        } 

    tagName = tagName || (typeof attr === 'object') && attr.tagName || defaultTag;

    if (!e) e = NS ? document.createElementNS(NS, tagName) : document.createElement(tagName);
    if (!datasetSupport) e.dataset = {};
    if (typeof attr === 'object') for (var a in attr){
        if( attr[a] === null || (typeof attr[a] === 'undefined'))continue;
        switch (a) {
            case 'tagName': case '$NS': break;
            case 'className': case 'id': case 'href': case 'innerHTML': case 'innerText': case 'textContent': case 'value': case 'checked':
                e[a] = attr[a];
                break;
            case 'style':
                if(typeof attr.style === 'string')e.style.cssText = attr.style;
                else for (var s in attr.style) e.style[s] = attr.style[s];
                break;
            case 'dataset':
                if(attr.dataset)
                for (var d in attr.dataset) if(typeof attr.dataset[d] !== 'undefined'){
                    if(d.dataset&&d.indexOf('-')===-1) d.dataset[d] = attr.dataset[d];
                    else e.setAttribute('data-' + d, attr.dataset[d]);
                    //if(!datasetSupport)e.dataset[d] =  attr.dataset[d];
                }else if(isUpdate){
                    if(d.dataset&&d.indexOf('-')===-1)delete d.dataset[d];
                    else e.removeAttribute('data-' + d);
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
                        if (i !== -1 ) {
                            NS = a.substr(0, i);
                            a = a.substr(i + 1);
                            switch (NS) {
                                case 'xlink':
                                    NS = 'http://www.w3.org/1999/xlink';
                                    break;
                                case 'xmlns':
                                    NS = 'http://www.w3.org/2000/xmlns/';
                                    a = 'xmlns:'+a;
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

    if(e.tagName === 'INPUT'){
        if(typeof content === 'boolean' &&(e.type === 'checkbox' || e.type === 'radio'))
            e.checked = content;
        else if(content)
            e.value = content;
    }else if(e.tagName === 'IMG'){
        if(content)e.src = content;
    }else
    switch (typeof content) {
        case 'string': case 'number':
        var tmp = EmptyElement('template');
            tmp.innerHTML = content; 
            if ('content' in tmp) e.appendChild(tmp.content);
            else while(tmp.firstChild) e.appendChild(tmp.firstChild);
            break;
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
                                        if(tmp.content)fr.appendChild(tmp.content);
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

var SetContent = function ( e/*,...content , clean*/) {
    if(e && (typeof e === 'object') && !(e instanceof Node) && ('length' in e))e=e[0];
    if (typeof e === 'string') e = document.querySelector(e);
    if ((e instanceof Element) || (e instanceof DocumentFragment)) {
        var clean = false, list = arguments, content = list[1], i = 1, l=2, fr = DocFragment(), tmp;
        for(l =2; l<list.length; l++)if(typeof list[l] === 'boolean'){
            clean = list[l]; break;
        }
        if (clean) {
            if (e instanceof Element)e.innerHTML = ''; else 
            if ((e instanceof SVGElement)  || (e instanceof DocumentFragment)) while (e.lastChild) e.removeChild(e.lastChild);
        }
        if(content && (typeof content === 'object')&&!(content instanceof Node)&&('length' in content)){ list = content; i = 0; l = list.length; }
        for(i;i<l;i++)
            if (list[i]){
                content = list[i];
                switch(typeof content){
                    case 'string':
                        if(content.indexOf('<')!==-1){ 
                            tmp = tmp ||  EmptyElement('template');
                            tmp.innerHTML = content;
                            if ('content' in tmp) fr.appendChild(tmp.content);
                            else while(tmp.firstChild) fr.appendChild(tmp.firstChild);
                            break;
                        } 
                    case 'number':
                        content = TextNode(content)
                    case 'object':
                        if(content instanceof Node)fr.appendChild(content); 
                }
            }
            e.appendChild(fr); 
        }
    return e;
}

var dCE = CreateElement;
var DIV = CreateElement.bind(null, 'div');
var SPAN = CreateElement.bind(null, 'span');
var STRONG = CreateElement.bind(null, 'strong');
var EM = CreateElement.bind(null, 'em');
var LI = CreateElement.bind(null, 'li');
var ALink = CreateElement.bind(null, 'a');
var INPUT = CreateElement.bind(null, 'input');
var TEXTAREA = CreateElement.bind(null, 'textarea');
var FORM = CreateElement.bind(null, 'form');
var LABEL = CreateElement.bind(null, 'label');
var TABLE = CreateElement.bind(null, 'table');
var TBODY = CreateElement.bind(null, 'tbody');
var THEAD = CreateElement.bind(null, 'thead');
var TH = CreateElement.bind(null, 'th');
var TD = CreateElement.bind(null, 'td');
var TR = CreateElement.bind(null, 'tr');
var IMG = CreateElement.bind(null, 'img');
var PTag = CreateElement.bind(null, 'p');
var H1 = CreateElement.bind(null, 'h1');
var H2 = CreateElement.bind(null, 'h2');
var H3 = CreateElement.bind(null, 'h3');
var H4 = CreateElement.bind(null, 'h4');

// Создаёт или обновляет эдемент списка
var LISTEL = function () {
    var A = arguments, 
    attr = {}, 
    content = '', 
    i = 1, 
    tag = A[0] instanceof Element ? A[0].tagName : A[0];
    if (tag.search(/(UL|OL)$/i) === 0) //Пытаемся понять, что скормили первым параметром: наименование тега, или сам тег
    {
        tag = A[0];
    }else{//...Или это вообще было что-то другое
        tag = 'UL';
        i=0;
    }
    for (i; i < A.length; i++)
        switch(typeof A[i]){
            case 'object':
                if(!A[i])break;// null
                if(!(A[i] instanceof Node)&&!('length' in A[i])){attr = A[i]; break;}// аттрибуты - обычный объект 
            default:
                content = A[i]; // Всё прочее считакм контентом
        }

    if(tag instanceof Element)tag.innerHTML = '';  

    // Проверяем контент и, если надо, оборачиваем в тег LI
    switch(typeof content){
        case 'string':
            if(!content.trim() || content.search(/\s*<LI/i)===0)break;
        case 'number':
        case 'object':
            if(content  instanceof Node){
                if(content.tagName === 'LI' || (content instanceof DocumentFragment))break;
            }else if(typeof content === 'object'){
                if('length' in content)break;
            }
            content = LI(content)
        break;
    }  

    if(typeof content === 'object' && content.length > 0){
        var fr = DocFragment(), d, li;
        for(i =0; i< content.length; i++){
            d = content[i];
            if(( d instanceof Element )&& d.tagName === 'LI' )
                li = d;
            else{ 
                li = EmptyElement('li');
                switch(typeof d){
                    case 'number':case 'string':
                        li.innerHTML = d;
                    break;
                    case 'object': 
                        if( d instanceof Node )li.appendChild(d);
                        else if(d) dCE(li,d);
                    break; 
                }
            }
            fr.appendChild(li); 
        } 
        content =  fr;
        }
    
    return CreateElement(tag, attr,content); 
}
var UL = LISTEL.bind(null,'UL');
var OL = LISTEL.bind(null,'OL');

TypeINPUT = function(type,attr,label,onchange){
    var res,input; 
    if(typeof label === 'function'){
        onchange = arguments[2];
        label = undefined; 
    }
    if((typeof label === 'undefined' || label == null) && attr )label = (attr.text || attr.label);//Для совместимости
    if(typeof label!== 'undefined'){ 
        input = INPUT({type:type,   name : attr.name, value : attr.value, dataset : attr.dataset, checked : attr.checked});
        input.style.display = 'none';
        res = LABEL( attr, [
            input,
            typeof label === 'string' ? SPAN( { className: 'label' }, label) : label
        ]) 
        input.addEventListener('change', function () {
            this.parentNode.checked = this.checked;  
            
        })
    }else {
        input = res = INPUT(Object.assign({type:type},attr));
    }
    if(typeof onchange === 'function')input.addEventListener('change', onchange);
    return res;
}

CHECKBOX = TypeINPUT.bind(null,'checkbox');

RADIO = function(attr, label, value, onchange){
    if(attr instanceof Array){
        label = arguments[0];
        attr = {};
        value = arguments[1];
    }
    if(typeof attr === 'string')attr = {name:attr};
    else attr = Object.assign({},attr);
    if(label instanceof Array){
        if(attr.value){
            value = attr.value;
            delete attr.value;
        }
        var fr = DocFragment(); 
        var def, isDef = false;;
        if(attr["default"] || attr["default"] === 0){
            def = attr["default"];
            delete attr["default"]; 
        }
        label.forEach(function(r, i){
            var at,lb;
            if(typeof r === 'object'){
                at = r;
                if(r instanceof Array){
                    at = r[0];lb = r.length>1 ? r[1] : true;
                }
            }else{
                at = lb = r;
            }
            if(typeof at!=='object')at = {value:at}
            if(lb === true)lb = at.value;
            var inp = TypeINPUT(
                'radio',
                Object.assign({parentNode:fr, checked: at.value === value || value === true && i === 0}, attr, at), 
                lb,
                onchange);
                if(typeof def!== 'undefined'){
                    if(inp.tagName!=='INPUT')inp = inp.firstChild;
                    isDef = def === true ? inp.checked : (def === inp.value || def === i);
                    if(isDef)inp.toggleAttribute('default', isDef)
                }
        })
        return fr;
    }else{ 
        return TypeINPUT('radio',Object.assign({checked : attr.value&&attr.value === value},attr), label, onchange)
    }
}

function CreateInputLabelElement(type, attr, comtent) {
    var input = INPUT( { name: attr.name, type: type || 'checkbox', className: 'hide', checked : !!attr.checked });
    
    var label = CreateElement('label', attr, [
        input,
        SPAN( { className: 'label' }, comtent)
    ])
    
    label.dataset.name = attr.name;
    if(type === 'checkbox'){ 
        label.value = input.checked;
        input.addEventListener('change', function () {
            label.value = input.checked; label.checked = input.checked; //label.dispatchEvent(getCustomEvent('change'))
        })
    }else{
        if(attr.value)input.value = attr.value;
        input.addEventListener('change', function () {
            label.value = input.value; 
            label.checked = input.checked;
        })
    }
    if (attr.disabled) input.toggleAttribute('disabled', true); 
    return label;
}

CreateRadioInputElements = function (bOpts, attr, checked) {
    if (typeof checked === 'undefined') checked = 0; var n, t;
    if (bOpts instanceof Array)
        return bOpts.map(function (k, i) {
            if (typeof k === 'object') { n = k[0], t = k[1] } else { n = t = k; checked = +checked }
            return CreateInputLabelElement('radio', Object.assign({ value: n, checked: (checked === i || checked === n) }, attr), t);
        });
    else
        return Object.keys(bOpts).map(function (k, i) {
            return CreateInputLabelElement('radio', Object.assign({ value: k, checked: (checked === i || checked === k) }, attr), bOpts[k]);
        });
}

function styleCheckbox($checkbox, text) {
    var id = $checkbox.id,
        title = $checkbox.getAttribute("title");
    if (!id) {
        id = uniqueId();
        $checkbox.id = id;
    }

    $checkbox.classList.add("pretty-checkbox");
    $checkbox.after(dCE('label',{"for":id,className:'pretty-checkbox-label',title:title||''},text));
}

var CreateSelevtor = SELECT =  function (opt, options) {
    var select = 'select', val;
    if(arguments[0] instanceof Element){//update
        select = arguments[0];
        val = select.value;
        select.innerHTML = '';
        opt = arguments[1];
        options = arguments[2];
    }
    opt = (typeof opt === 'object') && opt ? opt : { name: opt, full: true };

    if('value' in opt) val = opt.value; 

    select = dCE(select, opt, SELECT.getOPTIONS( options, val )); 
    
    if ( val === true ){ 
        var o = select.querySelector('option');
        if(o){
            val = o.value || o.innerText;
            o.toggleAttribute('selected',true);
        }  
    }

    if(val)select.value = val;
    return select
}

SELECT.getOPTIONS = function(options, val){
    var content;
    if(typeof options === 'string')content = options; 
    else if (options){
        content = DocFragment();
        for(var i =0,o, ct; i<options.length; i++){
            o = options[i];
            if(!o)continue;
            switch(typeof o){
                case 'object':
                if(o instanceof Element){o = o; break;} 
                if('length' in o){
                    ct = o[o.length-1]; 
                    if((typeof ct === 'object') && ('length' in ct)){
                        o = dCE('optgroup',{label:o[0]},SELECT.getOPTIONS(ct, val)); break;
                    }else 
                        o = { value: o[0],innerHTML: ct}; 
                }
                else if(o.text)o = Object.assign({textContent : o.text},o)//Для совместимости
                default:  o = dCE('option',o);
                if(o.innerHTML==='')o.innerText = o.value;
            }
            if(o.value == val || !o.value && o.innerText == val) o.toggleAttribute('selected',true);
            content.appendChild(o);
        } 
    }
    return content;
}

CreateTable = function ( ) { 
    var A = arguments, i=0;
    var tag,attr,trAttr = {},content,rows,cols,opt;
    switch(typeof A[i]){//tag Не обязат
        case 'string':
            tag = A[i].toLowerCase(); i++;
            if(tag === 'tr')rows = 1;
        break;
        case 'function':
            tag = A[i]; i++;
        break;
    }
    switch(typeof A[i]){//tag Не обязат
        case 'object':
            if(!Array.isArray(A[i])){ 
                attr = A[i]; i++;
                if( attr.tagName ) tag = attr.tagName;
                if( tag === 'tr' || !tag ) trAttr = attr
            } 
        break;
        case 'function':
            tag = A[i]; i++;
        break;
    }
    switch(typeof A[i]){
        case 'number':
            cols = A[i];
        break;
        case 'object':
            content = A[i];
        break;
    }
    i++;
    switch(typeof A[i]){
        case 'number':
            rows = A[i];
        break;
        case 'object':
            opt = A[i];
        break;
    }
    i++;
    switch(typeof A[i]){
        case 'object':
            opt = A[i];
        break;
    } 
    if(!content&&rows&&cols){//Создание пустой таблийы ('table',5,3)  
        content = Array.from({length:cols}).fill(''); 
        if(tag!=='tr')
            content =  Array.from({length:rows}).fill( content ); 
    }
    opt = opt || [];
    if(opt && !(opt instanceof Array)){
        if(opt.rowsAttr)trAttr = opt.rowsAttr;
        if(opt.colsData)trAttr = opt.colsAttr;
        if(opt.mainAttr || opt.attr)attr = opt.mainAttr || opt.attr;
    }
    attr = attr || {};
    if (tag === 'tr') return TR(trAttr, content.map(function (d, i) {
        return dCE('td', opt[i] || {}, d)
    })
    )
    if(!(content[0] instanceof Array))content = [content];
    var _ST = tag.toLowerCase() === 'thead' ? TH : TD;
    content = content.map(function (d) {
        return TR(trAttr,d.map(function (d, i) {
            return _ST(opt[i] || {}, d)
        })
        )
    })
    return tag ? dCE(tag, attr, content) : content;
}

var hiddenBLOCK = function(/*box,controller,content,show*/){
    var A = arguments, i = 0;
    var box,controller,content,show = false;
    for(i;i<A.length; i++)if(typeof A[i]==='boolean'){
        show = A[i]; 
        break
    };
    i--;
    if(i>=1)content = A[i--];
    controller = A[i--];
    box = A[i--];
    if(!(box instanceof Element))box = DIV(box||'');
    box.classList.add('group-box');
    if(!(controller instanceof Element))controller = DIV(controller||'');
    controller.classList.add('groupName');
    if(!(content instanceof Element))content = DIV(box||'');
    content.classList.add('tab-box');
    box.appendChild(controller); 
    box.appendChild(content);
    controller.addEventListener('click',function(){ 
        var show = this.parentNode.classList.toggle('group-box-open');
        this.parentNode.dispatchEvent(new CustomEvent('blockToggle',{detail:{show:show}}))
    })
    box.classList.toggle('group-box-open',show); 

    return box;
}
// вкладки
TABSBLOCK = {
    blocks : new Map(),
    init : function(box, options){
        
        var tabBar = dCE('ul',{className:'tabBar' }); 
        var panelsBox = DIV({className:'panelsBox' });
        var opts = {
            ui : {
                box : box,
                tabBar : tabBar,
                panelsBox : panelsBox
            },
            options : options
        }
        TABSBLOCK.blocks.set(tabBar, opts);
        TABSBLOCK.blocks.set(panelsBox, opts);
        TABSBLOCK.blocks.set(box, opts);
        if(options.tabBarClass)tabBar.classList.add(options.tabBarClass);
        var tab; 
        var onClick = function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            var tab = this;
            var opts = TABSBLOCK.blocks.get(tab.parentNode);
            var box = opts.ui.box;
            var oldIndex = +box.dataset.index;
            var index = +tab.dataset.index;
            if(index!==oldIndex){
                var panelsList = opts.ui.panelsBox.children;
                var panel= panelsList[index];
                for(var i =0; i<panelsList.length; i++ )toggleDisplay(panelsList[i],index === i);

                toggleClassToElement(tab,'active');
                toggleClassToElement(tab,'active');

                if(typeof options.activate === 'function'){
                    options.activate(ev,{
                        newPanel : panel,
                        newTab : tab,
                        oldPanel : panelsList[oldIndex] || null,
                        oldTab :tab.parentNode.children[oldIndex] || null
                    })
                }
                box.dataset.id = panel.id;
                box.dataset.index = index;
                
                var onTabShow = new CustomEvent('onTabShow' );
                // box.dispatchEvent(onTabShow);
                panel.dispatchEvent(new CustomEvent('onTabShow',{bubbles : true})); 
                tab.dispatchEvent(onTabShow); 
                tab.parentNode.dispatchEvent(onTabShow); 
            }
        }
        if(typeof options.show === 'function'){
            box.addEventListener('onTabShow',function(ev){
                var index = +this.dataset.index;
                var opts = TABSBLOCK.blocks.get(this); 
                options.show(ev,{
                    index : index,
                    panel : opts.ui.panelsBox.children[index],
                    tab : opts.ui.tabBar.children[index]
                })
            })
        }
        options.tabs.forEach(function(tabData,i){
            if(tabData.use && tabData.use() !== true)return;
            var tabName = tabData.name;
            if(options.labelFormatter)tabName = options.labelFormatter(tabData,i,options.tabs);
            tab = LI({parentNode:tabBar,className:' ',dataset:{id:tabData.id}},
                // ALink({href:'#'+tabData.id},tabData.name)
                tabName
            );
            tab.dataset.index = i;
            tab.dataset.num = i+1;//for design
            tab.addEventListener('click',onClick);
            var tabContent = tabData.tabContent;
            if(!(tabContent instanceof Element))tabContent = DIV(tabContent)
            panelsBox.appendChild(tabContent);
            tabContent.dataset.index = i;
            tabContent.id = tabData.id;
            tabContent.classList.add( 'layout');
            if(tabData.viewTab)toggleDisplay(tab,!!tabData.viewTab(),true);
        });
        box.innerHTML=''; 
        box.appendChild(panelsBox);
        if(options.tabBarParentNode instanceof Element)
            options.tabBarParentNode.appendChild(tabBar);
        else if(options.tabBarPositon === 'bottom'){
            panelsBox.after(tabBar);
        }else{
            panelsBox.before(tabBar);
        }

        
        var active = (tabBar.children[options.active] || tabBar.children[0]);
        if(active)active.dispatchEvent(new CustomEvent('click'))
    },
    showTab : function(box,active){
        var opts = TABSBLOCK.blocks.get(box);
        var tabs = opts.ui.tabBar.children;
        if(tabs.length>0){
            var newTab;
            switch(typeof active){
                case 'number':
                        newTab = tabs[active];
                break;
                case 'string':
                        newTab = Array.prototype.find.call(tabs,function(li){return li.dataset.id===active});
                break;
                case 'object':
                        newTab = active;
                break;
                        
            }
            if(newTab instanceof Element){
                newTab.dispatchEvent(new CustomEvent('click'))
                return true;
            }
            return false;
        }
        
    },
    setMaxHeight : function(parent){
        if(parent instanceof Element){
            // parent.querySelectorAll('panelsBox').forEach(function(){

            // })
        }
        var panelsBox = dQ('.cardTabs .panelsBox');
                    if(panelsBox){
                        if(Result.currentResultView === Data.resultView.TEXT_DOC_VIEW){
                        
                            var cardParent = getEl(DocumentCard.cardParent);
                            var H = cardParent.offsetHeight; 
                            
                            var panelsBoxTop = panelsBox.getBoundingClientRect().top - cardParent.firstElementChild.getBoundingClientRect().top; 

                            panelsBox.style.maxHeight = (H - panelsBoxTop-20) + 'px';
                        }else{
                            panelsBox.style.maxHeight = '';
                        }
                    }
    }
}


// Работает как closest но позволяет ограничить поиск неким родителем; limit = Element, number, selector
ExtClosest = function(/*e,selector,limit,etc*/){
    var i =0, e;
    if(this instanceof Element)e = this;else e = arguments[i++];
    var selector  = arguments[i++]||false;
    var limit  = arguments[i++];
    var etc  = arguments[i++];
    if(typeof limit === 'string')limit = e.closest(limit);
    if(!limit&&limit!==0)return selector ? e.closest(selector) : document.body;  
    i = 0; 
    while(e){
        if(e.matches(selector))return e;
        if(typeof limit === 'function')limit.call(etc, e,i);
        else if( limit === e || i === limit )return etc === true ? e : etc instanceof Node ? etc : null;//Можно заставить возвращать что-либо
        e = e.parentElement;
        i++;
    }
    return null;
} 

FindParent = FindUpAll = function(  /*e, mask, lim, self*/){ 
    var i =0, start = 0;
    var e = (this instanceof Element)?  this : arguments[i++];
    if(!e)return [null];
    var mask  = arguments[i++]||false; 
    if(arguments.length === i && typeof mask === 'string')return e.closest(mask);
    var lim  = arguments[i++]; 
    var self  = arguments[i++]; 
    
    if(mask instanceof Array){
        start = mask[0];
        mask = mask[1];
    }
    
    if( (typeof mask === 'function') && (lim instanceof Element) && self){
        self = lim;
        lim = null;
    }

    if( typeof lim === 'string' )lim = e.closest(lim);
 
    i = 0;
    
    var LIST = []; 
    var root = e&&e.ownerDocument;
    if(mask)
        while( e && e!==root ){  
            if(i>=start){
                switch(typeof mask){
                    case 'number':
                        if(i === mask)LIST.push(e);
                    break;
                    case 'function':
                        if(mask.call(self || e,e,i))LIST.push(e);
                    break;
                    case 'string':
                        if(e.matches(mask))LIST.push(e);
                    break;
                    case 'oblect':
                        if(e === mask)LIST.push(e);
                    break;
                }
                // if(!e||e.matches(mask))return block; 
                
                if( lim === i || lim === e ){//Если достигло лимита - self=true - включить этот элемент, или self вместо него или null
                    if(self === true)LIST.push(e);
                    if(self instanceof Node)LIST.push(self); 
                    break;
                }
            }
            e = e.parentNode;
            i++;
        } 
    return LIST;
}
 

FindParent = FindUp = function(  /*e, mask, lim, self*/){ 
    return FindUpAll.apply(null,arguments).pop()||null;
    // return self === true ? e : self instanceof Node ? self : null;
}

findNextEl = function (e,mask,_) {
    
    if(!e || !e.nextElementSibling)return null;
    e = e.nextElementSibling; 
    var i = 1;
    if(mask)
        while( e ){
            switch(typeof mask){
                case 'number':
                    if(i === mask)return e;
                break;
                case 'function':
                    if(mask.call(_,e))return e;
                break;
                case 'string':
                    if(e.matches(mask))return e;
                break;
                case 'oblect':
                    if(e === mask)return e;
                break;
            }
            // if(!e||e.matches(mask))return block; 
            
            e = e.nextElementSibling;
            i++;
        } 
    return e;
};
findPrevEl = function (e,mask,_) {
    
    if(!e || !e.nextElementSibling)return null;
    e = e.previousElementSibling; 
    var i = 1;
    if(mask)
        while( e ){
            switch(typeof mask){
                case 'number':
                    if(i === mask)return e;
                break;
                case 'function':
                    if(mask.call(_,e))return e;
                break;
                case 'string':
                    if(e.matches(mask))return e;
                break;
                case 'oblect':
                    if(e === mask)return e;
                break;
            }
            // if(!e||e.matches(mask))return block; 
            
            e = e.previousElementSibling;
            i++;
        } 
    return e;
};

var WRAP = function(e,parent){
    e.after(parent);
    parent.appendChild(e);
    return parent;
}
    


    

STYLES = {
    cssNumber : {//jQuery.cssNumber
        columnCount: true,
        fillOpacity: true,
        flexGrow: true,
        flexShrink: true,
        fontWeight: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        widows: true,
        zIndex: true,
        zoom: true
    },
    set : function(/*el,styles*/){
        var A = arguments,list = [], e,  mask = /[:|;]/, styles;
        for(var a=0;a<A.length;a++ ){
            e = A[a];
            // if(!e) continue;
            if(typeof e === 'string'){
                if(!e || mask.test( e ))styles = e;
                else e = dQAll(e);
            }
            if(e && typeof e === 'object'){
                if(e instanceof Element)
                    list.push(e);
                else if('length' in e)
                    list = list.concat(Array.from(e));//jQuery and etc
                else
                    styles = e;
            }
            if(styles){
                for(var i=0, l = list.length, j, s,s1,val; i<l;i++){
                    e = A[i];
                    if(e instanceof Element) {
                        if(typeof styles === 'string')e.style.cssText = styles;
                        else for(s in styles){
                            val = styles[s];
                            if(s.indexOf('-')!==-1){
                                s1 = s.split('-');
                                s = s1[0];
                                for(var j =1; j<s1.length;j++)s+= s1[j][0].toUpperCase()+s1[j].substr(1);
                            }
                            // If a number was passed in, add 'px' to the (except for certain CSS properties)
                            if ( typeof val === "number" && !STYLES.cssNumber[ s ] ) val += "px";
                            e.style[s]=val;
                        }
                    }
                }
                list.length = 0;
                styles = null;
            }
        }
    },
    dictToString : function(data){
        var s = '';
        for(var sel in data){
            s+=sel+'{';
            for(var p in data[sel])s+=p + ':' + data[sel][p]+';';
            s+= '}';
        }
        return s;
    },
    addCSS : function(opts) {
        if(typeof opts === 'string')opts = {url:opts}//Для сокращения записи
        // добавление строки css правил
        
        if (opts.str || opts.styles) {
            var id = opts.id || (opts.title ? opts.title + "-stylesheet" : null)
            var el = id && dQ("style[id='" + id + "']") || CreateElement("style",{id:id, type:'text/css', parentNode:document.head}); 

            if (opts.clear)el.innerHTML = "";

            var str = opts.str || '';
            if(opts.styles){
                if(opts.styles instanceof Array)str += opts.styles.map(STYLES.dictToString).join('');
                else str += STYLES.dictToString(opts.styles);
            }
            el.appendChild(TextNode(str)); 
        }

        // загрузка внешнего css файла по урлу
        if (opts.url) {
            CreateElement('link',{rel:'stylesheet',type:'text/css', media:"all", href: contextPath + opts.url, parentNode:document.head })
        }
    },

    addCSSLinks : function(){
        var A = Array.isArray(arguments[0]) ? arguments[0] : arguments; 
        for(var a=0; a<A.length; a++)
            CreateElement('link',{rel:'stylesheet',type:'text/css', media:"all", href: contextPath + A[a], parentNode:document.head });
    },

    deleteCSS : function(opts) {
        if (opts.url) {
            dQAll("link").forEach(function(el) {
                if (el.href.indexOf(url) != -1) el.remove();
            })
        }
        if (opts.title) {
            var e = dQ("style[id='" + opts.title + "-stylesheet']");
            if(e)e.remove();
        }
    },

    get : function(e,prop, formatter){
        var r = getComputedStyle(e).getPropertyValue(prop);
        if(formatter === true)formatter = parseInt;
        if(formatter)r = formatter(r);
        return r
    }
}

setScreenCSSSizeCSS = function(){
    var w = window.innerWidth+'px', h = window.innerHeight+'px';
    STYLES.addCSS({
        id : 'ScreenCSSSizeCSS',
        styles : {
            '.minHeightScreen,.minHScreen':{ 'min-height':h},
            '.maxHeightScreen,.maxHScreen':{ 'max-height':h},
            '.heightScreen,.hScreen':{ 'height':h},
            '.heightTScreen,.hTScreen':{ 'max-height':h,'min-height':h,'height':h},
            '.minWidthScreen,.minWScreen':{ 'min-width':w},
            '.maxWidthScreen, .maxWScreen':{ 'max-width':w},
            '.widthScreen,.wScreen':{ 'width':w},
            '.widthTScreen,.wTScreen':{ 'max-width':w,'min-width':w,'width':w}
        },
        clear : true
    })
}
//setScreenCSSSizeCSS();
//window.addEventListener('resize',setScreenCSSSizeCSS);



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
            case 'textContent':
                e[a]=attr[a];
            break;
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
                                            case 'xmlns':
                                                NS = 'http://www.w3.org/2000/xmlns/';
                                                a = 'xmlns:'+a;
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
    // console.log(content)
    if(e.tagName === 'INPUT'){
        if(typeof content === 'boolean' &&(e.type === 'checkbox' || e.type === 'radio'))
            e.checked = content;
        else if(content)
            e.value = content;
    }else if(e.tagName === 'image'){
        if(content) content;e.setAttributeNS('http://www.w3.org/1999/xlink','href', content);
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


/** 
 * Base64 encode/decode
 * http://www.webtoolkit.info 
 **/   
 Base64 = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    //метод для кодировки в base64 на javascript
   encode : function (input) {
     var output = "";
     var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
     var i = 0
     input = this._utf8_encode(input);
        while (i < input.length) {
        chr1 = input.charCodeAt(i++);
       chr2 = input.charCodeAt(i++);
       chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
       enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
       enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
       enc4 = chr3 & 63;
        if( isNaN(chr2) ) {
          enc3 = enc4 = 64;
       }else if( isNaN(chr3) ){
         enc4 = 64;
       }
        output = output +
       this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
       this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
     return output;
   },
  
    //метод для раскодировки из base64
   decode : function (input) {
     var output = "";
     var chr1, chr2, chr3;
     var enc1, enc2, enc3, enc4;
     var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
       enc2 = this._keyStr.indexOf(input.charAt(i++));
       enc3 = this._keyStr.indexOf(input.charAt(i++));
       enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
       chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
       chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if( enc3 != 64 ){
         output = output + String.fromCharCode(chr2);
       }
       if( enc4 != 64 ) {
         output = output + String.fromCharCode(chr3);
       }
    }
    output = this._utf8_decode(output);
      return output;
    },
    // метод для кодировки в utf8
   _utf8_encode : function (string) {
     string = string.replace(/\r\n/g,"\n");
     var utftext = "";
     for (var n = 0; n < string.length; n++) {
       var c = string.charCodeAt(n);
        if( c < 128 ){
         utftext += String.fromCharCode(c);
       }else if( (c > 127) && (c < 2048) ){
         utftext += String.fromCharCode((c >> 6) | 192);
         utftext += String.fromCharCode((c & 63) | 128);
       }else {
         utftext += String.fromCharCode((c >> 12) | 224);
         utftext += String.fromCharCode(((c >> 6) & 63) | 128);
         utftext += String.fromCharCode((c & 63) | 128);
       }
      }
     return utftext;
  
   },
  
   //метод для раскодировки из urf8
   _utf8_decode : function (utftext) {
     var string = "",i = 0;
     var c = c1 = c2 = 0;
     while( i < utftext.length ){
       c = utftext.charCodeAt(i);
        if (c < 128) {
         string += String.fromCharCode(c);
         i++;
       }else if( (c > 191) && (c < 224) ) {
         c2 = utftext.charCodeAt(i+1);
         string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
         i += 2;
       }else {
         c2 = utftext.charCodeAt(i+1);
         c3 = utftext.charCodeAt(i+2);
         string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
         i += 3;
       }
      }
      return string;
   },
   getBase64String : function(content, contentType){
    contentType = contentType ? "data:" + contentType + ";base64," : '';
    return contentType+Base64.encode(content);
}
  }
 


  camelCase = toCamelCase = function(){
    var i =0, 
    text = this instanceof String ? this : arguments[i++],
    upper = arguments[i]; 
    if(!(text instanceof String))
      text = typeof text.toString === 'function' ? text.toString() : '';
    if(text!==''){
      text = text.split(/[-_\s]+/g).map(function(s,i){ 
          s = s.toLowerCase();
          if(i>0 || upper === true){ 
              s = s[0].toUpperCase() + s.substr(1);
          }
          return s;
      }).join(''); 
    }
    return text;
}
String.prototype.toCamelCase =  String.prototype.toCamelCase ||  camelCase;

unCamelCase = fromCamelCase = function(){
    var i =0,
    text = this instanceof String ? this : arguments[i++],
    sep = arguments[i];
    if(typeof sep!=='string')sep = '-'; 
    if(!(text instanceof String))
      text = typeof text.toString === 'function' ? text.toString() : '';
      
    return text.replace(/[A-Z]/g,function(t,i){return (i === 0 ? '' : sep)+t.toLowerCase()});
}
String.prototype.unCamelCase =  String.prototype.fromCamelCase ||  unCamelCase;


  

Autocomplete = (function(){
    var data = new Map();
    var drawList = function(opt){
        opt.aclist.innerHTML = '';
        opt.getContent(opt.input.value,function(data){
            var fr = DocFragment(), mult = opt.multivalue;
            data&&data.forEach(function(d){
                LI({parentNode:fr},[
                    mult ? CHECKBOX({checked:false,value:d}) : null,
                    d
                ])
            })
        },opt)
    }

    var open = function(ev){
        var e = this instanceof Element ? this : ev;
        var opt = data.get(ev);
        
    }
    var close = function(ev){
        var e = this instanceof Element ? this : ev;
        var opt = data.get(ev);
    }
    var toggle = function(ev,show){
        var e = this instanceof Element ? this : ev;
        var opt = opt = ev.input ? ev : data.get(ev);
        if(!opt)return;
        show = toggleElDisplay(opt.acbox,show);
        if(show)drawList(opt);
        if(opt.btn){
            //opt.btn.classList.toggle("",show)
        }
    }
    var init = function(e,opt){
        e = getEl(e);
        var input = e;
        if(data.has(input))return;
        var opt = Object.assign({
            input : input,
            getContent : function(val,cb,opt){
                var val = val.toLoverCase();
                return opt.list&&opt.list.filter(function(v){return v.toLoverCase().indexOf(val)!==-1})

            }
        },opt);
        data.set(e,opt);
        
        opt.acbox = DIV({className:'ac-box'});
        opt.acbox.style.display = 'none';
        var place = DIV({className:'ac-place'},opt.acbox);

        opt.aclist = UL({className:'ac-list',parentNode:opt.acbox});

        if(opt.multivalue){
            var applyBtn = SPAN({className:'redButtonOuter'},INPUT({type:'button',className:'ac-apply-button' },'Применить'))
            DIV({className:'bottomController',parentNode:opt.acbox},[
                applyBtn
            ]);
        }
        if(opt.btn){
            data.set(opt.btn,opt);
            input.addEventListener('click',toggle);
        }
        input.after(place);
        input.addEventListener('input',open);
        // input.addEventListener('blur',open);
    }
     
    return function(e, opt){
        switch(opt){
            default:
                init(e,opt);
        }
    }
})();


typeValue = function(v){
    var _v = v;
    switch(v){
        case "true":
        case "True":
        case "TRUE":
            _v = true;
        break;
        case "false":
        case "False":
        case "FALSE":
            _v = false;
        break;
    }
    if(typeof _v === 'string' && _v == +_v){
        _v = +_v;
    }
    return _v;
}  

    // Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
tmpl =  (function(){
    var cache = {};
    
    return  function tmpl(str, data){
      // Figure out if we're getting a template, or if we need to
      // load the template - and be sure to cache the result.
      var fn = !/\W/.test(str) ?
        cache[str] = cache[str] ||
          tmpl(document.getElementById(str).innerHTML) :
        
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +
          
          // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +
          
          // Convert the template into pure JavaScript
          str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
        + "');}return p.join('');");
      
      // Provide some basic currying to the user
      return data ? fn( data ) : fn;
    };
  })();


  // Переводит elem.style.display в значение none и обратно. 
// Поддерживает: инверция текущего значения, автоматическое назначение, строка
var toggleDisplay = function (/*elem, show, safe || elem, display, show*/) { 
    toggleDisplay.displayData = toggleDisplay.displayData || new Map();
    var showing = false, 
        A = arguments, show, safe = false,
        list = [], st = 0, l,i,j,
        e = A[0], 
        display, _display_ = '', _show_, mask = /[^a-z-]/; 
    for(i=0;i<=A.length;i++ ){
        if( typeof A[i] === 'boolean' ||  A[i] === '!' || typeof A[i] === 'string'  && !mask.test( A[i] )  || i === A.length && i!==st  ) {//elem, show, safe || elem, display, show
            if(A[i] === '!')show = undefined;
            else if(typeof A[i] === 'boolean')show = A[i];
            else{ show = A[i]; _display_ = A[i] || '';}
            if(typeof A[i+1] === 'boolean'){
                i++;
                if(typeof show === 'boolean' || typeof show === 'undefined') safe = A[i];
                else show = A[i];
            }

            for(j=0, l = list.length; j< l; j++){
                e = list[j]; 
                if (typeof e === 'string') e = dQ(e);
                if (e instanceof Element) {
                    
                    display = e.style.display || getComputedStyle(e,null).getPropertyValue('display');
                    _show_ = show;
                    
                    switch (typeof show) {
        
                        case 'undefined':
                            _show_ = display === 'none';
                        case 'boolean':
                            _show_ = _show_ ? _display_ : 'none';         
                    }
                    if (display && display !== 'none'){ 
                        toggleDisplay.displayData.set(e, display);//Запоминает предыдущее значение
                        if(_show_ === '' && safe === false) _show_ = display;
                    }else if (_show_ === '' && safe === false){
                        _show_ = toggleDisplay.displayData.get(e);
                        if(!_show_)
                        switch(e.tagName){
                            case 'TD': case 'TH':
                            _show_ =  'table-cell';
                            break;
                            case 'TBODY':  
                            _show_ =  'table-row-group';
                            break;
                            case 'TABLE':  
                            _show_ =  'table';
                            break;
                            default : 
                            _show_ =  'block';
                        } 
                        
                    }
                    showing = (_show_ !== 'none');
                    e.style.display = _show_;
                    if(showing)e.classList.remove('hide')
        
                } 
            } 

            st = i+1;
            
        } else {
            
            if(i === st){
                list.length = 0;
                safe = false;
                show = undefined;
                _display_ = '';
            }
            e = A[i];
            switch(typeof e){
                case 'string':
                    e = dQAll(e);
                case 'object':
                    if(!e)break;
                    if(e instanceof Element){
                        list.push(e);
                    }else if('length' in e){
                        list = list.concat(Array.from(e));//jQuery and etc
                    }
            }
        } 
    } 
    

    
    return showing;
}
var toggleVisibility = function (/*elem, show, safe || elem, display, show*/) { 
    toggleVisibility.displayData = toggleVisibility.displayData || new Map();
    var showing = false, 
        A = arguments, show, safe = false,
        list = [], st = 0, l,i,j,
        e = A[0], 
        display, _display_ = '', _show_, mask = /[^a-z-]/; 
    for(i=0;i<=A.length;i++ ){
        if( typeof A[i] === 'boolean' ||  typeof A[i] === 'string'  && !mask.test( A[i] )  || i === A.length && i!==st  ) {//elem, show, safe || elem, display, show
            if(typeof A[i] === 'boolean')show = A[i];
            else{ show = A[i]; _display_ = A[i] || '';}
            if(typeof A[i+1] === 'boolean'){
                i++;
                if(typeof show === 'boolean') safe = A[i];
                else show = A[i];
            }

            for(j=0, l = list.length; j< l; j++){
                e = list[j]; 
                if (typeof e === 'string') e = dQ(e);
                if (e instanceof Element) {
                    
                    display = e.style.visibility || getComputedStyle(e,null).getPropertyValue('visibility');
                    _show_ = show;
                    
                    switch (typeof show) {
        
                        case 'undefined':
                            _show_ = display === 'hidden';
                        case 'boolean':
                            _show_ = _show_ ? _display_ : 'hidden';         
                    }
                    if (display && display !== 'hidden'){ 
                        toggleVisibility.displayData.set(e, display);//Запоминает предыдущее значение
                        if(_show_ === '' && safe === false) _show_ = display;
                    }else if (_show_ === '' && safe === false){
                        _show_ = toggleVisibility.displayData.get(e);
                        if(!_show_)
                        switch(e.tagName){
                            // case 'TD': case 'TH':
                            // _show_ =  'table-cell';
                            // break;
                            // case 'TBODY':  
                            // _show_ =  'table-row-group';
                            // break;
                            // case 'TABLE':  
                            // _show_ =  'table';
                            // break;
                            default : 
                            _show_ =  'visible';
                        } 
                        
                    }
                    showing = (_show_ !== 'hidden');
                    e.style.visibility = _show_;
                    // if(showing)e.classList.remove('hide')
        
                } 
            } 

            st = i+1;
            
        } else {
            
            if(i === st){
                list.length = 0;
                safe = false;
                show = undefined;
                _display_ = '';
            }
            e = A[i];
            switch(typeof e){
                case 'string':
                    e = dQAll(e);
                case 'object':
                    if(!e)break;
                    if(e instanceof Element){
                        list.push(e);
                    }else if('length' in e){
                        list = list.concat(Array.from(e));//jQuery and etc
                    }
            }
        } 
    } 
    

    
    return showing;
}


function toggleInlineBlock(elem, show) {

    var elem = arguments, show,
    l = 1,  
    e = elem[0];
        
    for(l=1;l<elem.length;l++)
        if(typeof elem[l] === 'boolean'){
            show = elem[l];
            break;
        };

    if( (typeof e === 'object') && !(e instanceof Element)&& e && ('length' in e)){
        elem = elem[0];
        l = elem.length;
    } 

    var showing = false, 
    className = "inlineBlock";

    for(var i=0; i< l; i++){
        e = elem[i];
        i++; 
        if (typeof e === 'string') e = document.querySelector(e);
        if (e instanceof Element) {
           if(typeof show === 'boolean') 
                showing = e.classList.toggle(className, show); 
            else
                showing = e.classList.toggle(className);  
            e.classList.toggle("hide",!showing)
        }
    } 
    return showing;

}

// Переворачивает объект: {k1:v1, k2: v2} => {v1: k1, v2:k2} || {v1:true,v2:true} || ...
function SWAP(o,val,self){
    var ret = {}, useVal = arguments.length>1, d, isArray = Array.isArray(o);
    if(!o)return ret;
    var keys = isArray ? o : Object.keys(o), l=keys.length; 
    if(typeof val === 'function')for( var i=0,k; i<l;i++ ){
        k = isArray ? i : keys[i]; //if(k==+k)k=+k;
        d =  val.call(self,o[k],k,o);
        if(d){
            d = Object.assign({key:o[k],value:k},d);
            ret[ d.key ] = d.value;
        }
    }
    else for( var i=0,k; i<l;i++ ){
        k = isArray ? i : keys[i]; //if(k==+k)k=+k;
        ret[ o[k] ] = useVal === true ? val : k;
    }
    
    return ret;
  }
// [{id:'i1',..},{id:'i2',...}] => {i1 : {id:'i1',..},i2 : {id:'i2',..}} || {i1:true,i2:true} || ...
  function byKEY(o,key,val,self){
    if(!o)return {};
    var ret = {}, A = arguments, d, isArray = Array.isArray(o);
    
    var keys = isArray ? o : Object.keys(o), l=keys.length; 
    if(typeof key === 'function'){
        var self = typeof val === 'object' ? val : this;
        for( var i=0,k; i<l;i++ ){
            k = isArray ? i : keys[i]; //if(k==+k)k=+k;
            d =  key.call(self,k,o[k],o);
            if(d){
                d = Object.assign({key:k,value:o[k]},d);
                ret[ d.key ] = d.value;
            }
        }
    }else{ 
        var useVal = A.length>2;
        for( var i=0,k; i<l;i++ ){
            k = isArray ? i : keys[i]; //if(k==+k)k=+k;
            d = o[k]; 
            k = d[key];
            if( typeof k !=='undefined' )
                ret[ k ] = useVal === true ? val : d;
        }
    }
    return ret;
  }
  function byKEYList(o,key,val,self){
    if(!o)return {};
    var ret = {}, A = arguments, d, isArray = Array.isArray(o);
    
    var keys = isArray ? o : Object.keys(o), l=keys.length; 
    if(typeof key === 'function'){
        var self = typeof val === 'object' ? val : this;
        for( var i=0,k; i<l;i++ ){
            k = isArray ? i : keys[i]; //if(k==+k)k=+k;
            d =  key.call(self,k,o[k],o);
            if(d){
                d = Object.assign({key:k,value:o[k]},d);
                ret[ d.key ] = ret[ d.key ] || [];
                ret[ d.key ].push(d.value);
            }
        }
    }else{ 
        var useVal = A.length>2;
        for( var i=0,k; i<l;i++ ){
            k = isArray ? i : keys[i]; //if(k==+k)k=+k;
            d = o[k]; 
            k = d[key];
            if( typeof k !=='undefined' ){
                ret[ k ] = ret[ k ] || [];
                ret[ k ].push(useVal === true ? val : d);
            }
        }
    }
    return ret;
  }

  numToString = function(v,minLength){
    var s = (v || 0)+'';
    if(minLength) s = '0'.repeat(minLength - s.length)+s
    return s;
  }


  MathG = {
      length3(c1,c2,g){
          if(!g){
              return Math.sqrt(Math.pow(c1,2)+Math.pow(c2,2))
          }
          if(!c2){
              return Math.sqrt(Math.pow(g,2)-Math.pow(c1,2))
          }
      },
      alpha3(c,cont,g){

      }
  }