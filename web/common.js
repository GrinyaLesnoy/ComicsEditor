//if (window.console && window.console.log) {
//    var logger = MochiKit.Logging.logger;
//    logger.useNativeConsole = false;
//    logger.addListener('firebug', null, function(msg) {
//        var level = msg.level.toLowerCase();
//        var f = console[level]? console[level] : console.log;
//        if(f.apply) f.apply(console, msg.info);
//    });
//}else if(window.log){
//    window.console = {};
//    window.console.log = window.log
//}
BIGS=window.BIGS||{};
if (typeof contextPath === 'undefined') contextPath = '';

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



var querySelectorToElement = function(el, returnElement, useParent){
    if(typeof el === 'string'){
        var e1 = dQ(el);
        if(!e1){
            el = el.trim().split(' ');
            var eq = el.pop(),
            pq = (typeof useParent === 'object' || typeof useParent === 'string') ? useParent : useParent ? el.join(' ') : null;
            var tag = eq.match(/^([\w_-]+)[^.\#\[]/gi),
                id = eq.match(/\#([\w_-]+)[^.\#\[]/gi),
                cls = eq.match(/\.([\w_-]+)[^.\#\[]/gi),
                attr = eq.match(/\[([^\]])+/gi);
            el = {}
            if(tag && tag[0])el.tagName = tag[0];
            if(cls && cls[0])el.classList = cls.map(function(c){return c.substr(1)});
            if(id && id[0])el.id = id[0].substr(1);
            if(attr)attr.forEach(function(a){
                a = a.substr(1).trim().split('=');
                el[a[1]] = a[1].trim().replace(/("|')/g,'')
            }) 
            if(pq)el.parentNode = pq;
            if(returnElement)el = dCE(el)
        }
    }
    return el;
}

getCustomEvent = function (e,d) {
    // es5 struct mode не поддерживает callee, однако имя может
    var self = arguments.callee || getCustomEvent;
    self._ = self._ || {};
    return self._[e] || (self._[e] = new CustomEvent(e));
}


var dQsafe = function (q) {//Возвращает пустой див если не нашлось элемента
    return dQ(q) || EmptyElement('div')
}
var isNode = function (o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
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



var ElememtData = function (o, k, v) {//Аналог jQuery.data()
    // es5 struct mode не поддерживает callee, однако имя может
    var self = arguments.callee || elememtData;
    var _key_ = self._key_;

    if (!self._key_) {
        self._key_ = 'ED' + Date.now();
        self._val_ = 0;
        _key_ = self._key_;
        self.setKey = function (o, v) {
            if (v && typeof v === 'object') {
                if (!v[_key_]) self.setKey(v);
                v = v[_key_]
            }
            if (!o[_key_]) o[_key_] = v || ('___node__' + (self._val_++));
            return o[_key_];
        }
    }

    if (!self._) self._ = {}
    if (!o) return self._;
    if (typeof o === 'object' && o.length) {//Возможность зарядить одни и теже данные сразу куче объектов
        var A = Array.prototype.slice.call(arguments);
        return Array.prototype.slice.call(o).map(function (o1) { A[0] = o1; return ElememtData.apply(null, A) })
    }

    if (typeof o === 'object' && !(_key_ in o) && isNode(o)) {
        if (o.tagName === 'LABEL') {//для input и соотв. ему label пытается выставить одни данные
            var input = o.htmlFor ? dId(o.htmlFor) : o.querySelector('input');
            self.setKey(o, input);
        } else if (o.tagName === 'INPUT') {
            var label = o.id ? dQ('label[for="' + o.id + '"]') : o.closest('label');
            self.setKey(o, label);
        }
        else self.setKey(o);
    }
    var o = o[_key_] || o;
    self._[o] = self._[o] || {};
    if (!k) return self._[o];
    if (typeof k === 'object') {
        if (Array.isArray(k)) {
            v = k[1];
            k = k[0];
        } else {
            for (var i in k) self._[o][i] = k[i];
            return self._[o];
        }
    }
    if (arguments.length >= 3) {
        self._[o][k] = v;
    }
    return self._[o][k];
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
            if (!Ai || (Ai  instanceof Node)) {
                e = Ai; //update current - можно использовать для обновления существующего и создания нового, если тот отсутствует
                isUpdate = true;
            } else {
                attr = Ai;
                content = A[1];
                i = 2;
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
        if (typeof Ai === 'object' && !(Ai  instanceof Node) && !(Ai  instanceof DocumentFragment) && typeof Ai.length !== 'number') {
            attr = Ai;
            content = A[2];
            i++;
        } else {
            content = Ai;
            if (typeof A[2] === 'object'){ attr = A[2]; i++;}
        }
    } 
    Ai = A[i];
    NS = (typeof Ai === 'string') && Ai || (typeof attr === 'object') && attr.NS;

    if (NS)  
        switch (NS.toUpperCase()) {
            case 'HTML':
                NS = 'http://www.w3.org/1999/xhtml';
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
            case 'tagName': case 'NS': break;
            case 'className': case 'id': case 'href': case 'innerHTML': case 'innerText': case 'textContent': case 'value': case 'checked':
                e[a] = attr[a];
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
var LABEL = CreateElement.bind(null, 'label');
var TH = CreateElement.bind(null, 'th');
var TD = CreateElement.bind(null, 'td');
var TR = CreateElement.bind(null, 'tr');
var IMG = CreateElement.bind(null, 'img');
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
                if(content.tagName === 'LI')break;
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
        res = CreateElement('label', attr, [
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
            TypeINPUT(
                'radio',
                Object.assign({parentNode:fr, checked: at.value === value || value === true && i === 0}, attr, at), 
                lb,
                onchange)
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
            }
            if(o.value == val || !o.value && o.innerText == val) o.toggleAttribute('selected',true);
            content.appendChild(o);
        } 
    }
    return content;
}

CreateTable = function (tag, data, opt) {
    opt = opt || [];
    if (tag === 'tr' || tag === 'TR') return dCE('tr', data.map(function (d, i) {
        return dCE('td', opt[i] || {}, d)
    })
    )
    if(!(data[0] instanceof Array))data = [data];
    data = data.map(function (d) {
        return dCE('tr', d.map(function (d, i) {
            return dCE('td', opt[i] || {}, d)
        })
        )
    })
    return tag ? dCE(tag, data) : data;
}

var hiddenBLOCK = function(/*box,controller,content,show*/){
    var A = arguments, i = 0;
    var box,controller,content,show = false;
    for(i;i<A.length; i++)if(typeof A[i]==='boolean'){
        show = A[i];
        i--;
        break
    };
    if(i>1)content = A[i--];
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
        this.parentNode.classList.toggle('group-box-open');
    })
    box.classList.toggle('group-box-open',show); 

    return box;
}

TABSBLOCK = {
    blocks : new Map(),
    init : function(box, options){
        var fr = DocFragment();
        var tabBar = dCE('ul',{className:'tabBar ui-tabs-nav ui-helper-clearfix', parentNode:fr}); 
        var tabContent = DIV({className:'panelsBox', parentNode:fr});
        var tab;
        var onClick = function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            var tab = this;
            var box = tab.parentNode.parentNode;
            var oldIndex = +box.dataset.index;
            var index = +tab.dataset.index;
            if(index!==oldIndex){
                var panelsList = box.querySelector(':scope > .panelsBox').children;
                var panel= panelsList[index];
                for(var i =0; i<panelsList.length; i++ )toggleElDisplay(panelsList[i],index === i);

                toggleClassToElement(tab,'ui-tabs-active');
                toggleClassToElement(tab,'ui-state-active');

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
                options.show(ev,{
                    index : index,
                    panel : this.querySelector(':scope > .panelsBox').children[index],
                    tab : this.querySelector(':scope > .tabBar').children[index]
                })
            })
        }
        options.tabs.forEach(function(tabData,i){
            tab = LI({parentNode:tabBar,className:'ui-state-default'},
                ALink({href:'#'+tabData.id},tabData.name)
            );
            tab.dataset.index = i;
            tab.addEventListener('click',onClick)
            tabContent.appendChild(tabData.tabContent);
            tabData.tabContent.dataset.index = i;
            tabData.tabContent.id = tabData.id;
            tabData.tabContent.classList.add('ui-tabs-panel','layout')
        });
        box.innerHTML='';
        box.classList.add('ui-tabs');
        box.appendChild(fr);

        

        (tabBar.children[options.active] || tabBar.children[0]).dispatchEvent(new CustomEvent('click'))
    },
    showTab : function(box,active){
        var tabBar = box.querySelector(':scope > .tabBar');
        if(tabBar && tabBar.children[active])tabBar.children[active].dispatchEvent(new CustomEvent('click'))
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

FindParent = FindUp = function(  /*e, mask, lim, self*/){ 
    var i =0, start = 0;
    var e = (this instanceof Element)?  this : arguments[i++];
    if(!e)return null;
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
    
    if(mask)
        while( e ){
            if(i>=start){
                switch(typeof mask){
                    case 'number':
                        if(i === mask)return e;
                    break;
                    case 'function':
                        if(mask.call(self || e,e,i))return e;
                    break;
                    case 'string':
                        if(e.matches(mask))return e;
                    break;
                    case 'oblect':
                        if(e === mask)return e;
                    break;
                }
                // if(!e||e.matches(mask))return block; 
                if( lim === i || lim === e ){
                    return self === true ? e : self instanceof Node ? self : null
                }
            }
            e = e.parentNode;
            i++;
        } 
    return e;
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
    


// Эквивалент arr.filter().map();  возвращает массив элементы которого являются результатом выполнения функции и не равны undefined
Array.prototype.uFilterMap = function (predicate) {
    if (this == null) {
        throw new TypeError('Array.prototype.uFilterMap called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;
    var newArray = [];

    for (var i = 0; i < length; i++) {
        value = predicate.call(thisArg, list[i], i, list);
        if (typeof value !== 'undefined') newArray[newArray.length++] = value;
    }
    return newArray;
}

// Аналог join только умеет принимать функции в качестве аргумента
Array.prototype.joinFu = function (f) {
    if (this == null) {
        throw new TypeError('Array.prototype.joinFu called on null or undefined');
    }

    if (typeof f !== 'function') return this.join(f);

    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var str = '';

    for (var i = 0; i < length; i++)
        str += f.call(thisArg, list[i], i, list);

    return str;
}



//слияние объектов
var _MG_;
var _MERGE_ = _MG_ = function (o) {
    var A = arguments,
        L = arguments.length,
        i,
        E = A[0],
        o = E,
        start = +!(E && typeof A[0] === 'object' && !(E instanceof Date) && !(E instanceof Node)),
        isArrays = true, maxl = 0, k, l, s,
        arrs = [];
        //Тип мерджа для массивов. true - слияние, false - замена, function - результат работ функции
    var AMType = true;
    if(typeof A[L-1]!=='object'){
        AMType = A[L-1];L--;
    }
    if (L < 2) return o;
    arrs.length = A.length;
    var _M_ = function (cu, ne) {
        switch (typeof ne) {
            case 'undefined': break;
            case 'object':
                // if(ne == null)break;
                if (ne == null || (ne instanceof Node) || ne === window) cu = ne;
                else if (ne instanceof Date) cu = new Date(ne); 
                else cu = _MERGE_(cu, ne, AMType);
                break;
            default:
                cu = ne;
        }
        return cu;
    }
    // Можно сливать массивы
    for (i = start; i < L; i++) {
        E = A[i];
        arrs[i] = (Array.isArray(E) || NodeList.prototype.isPrototypeOf(E));
        if (isArrays === true && arrs[i] === false) isArrays = false;
    }
    if (start > 0) o = isArrays === true ? [] : {};

    for (i = 1; i < L; i++) {

        E = A[i];
        if (isArrays === true || arrs[i] === true) {
            switch(typeof AMType){
                case 'function':
                    o = AMType(o,E,i,A);
                break;
                case 'boolean':
                    if(AMType === false){
                        o.length = 0;
                        o.length =  E.length;
                    } 
                    o.length = Math.max((o.length || 0), E.length)
                    for (k = 0, l = E.length; k < l; k++)o[k] = _M_(o[k], E[k])
                break;
                case 'string':
                case 'number':
                    
            }
            if(typeof AMType === 'function'){
                o = AMType(o,E,i,A);
            }else{ 
                s = 0;    
                switch(AMType){
                    case '+':
                    case 1:
                        // сложить два массива
                        s = o.length;
                        o.length+=E.length; 
                    break;
                    case false:
                    case 0:
                        // заполнить значениями нового
                        // o = undefined;
                    // break;
                    case '-':
                    case -1:
                        // заполнить значениями нового
                        o.length =  E.length;
                    break;
                    default :
                        // смержить
                    o.length = Math.max((o.length || 0), E.length)
                }
                if(o)
                for (k = 0, l = E.length; k < l; k++)o[s+k] = _M_(o[s+k], E[k]);
            } 
            
            

        } else if (E) {
            for (k in E) if (E.hasOwnProperty(k)) o[k] = _M_(o[k], E[k])
        }

    }
    return o;
} 

//Эмуляция работы с классами в j.s. Точнее - его расширенная версия.
//В принципе, при надобности, можно расширить, чтобы собирал из дохрена цепочки, скрещивая между собой объекты и классы
var _NEW_ = function (_class_/*,ext1,ext2 ..., data*/) {
    var o = {},
        i, k,
        _class_ = _class_,
        C = [],
        AL = arguments.length, Ai, data, datatype;

    if (AL > 1) {
        Ai = arguments[AL - 1];
        if (!Ai || typeof Ai !== 'object') {
            data = Ai;
            datatype = 'value';
            AL--;
        } else if (Array.isArray(Ai)) {
            data = Ai;
            datatype = 'array';
            AL--;
        }

    }

    if (typeof _class_ === "function") o = new _class_();
    else {
        while (_class_) {
            C.push(_class_);
            _class_ = _class_.__IsEXTEND__ || _class_._extends;
            if (typeof _class_ === 'string') _class_ = window[_class_];//Можно передавать имя класса, а не сам класс
        }

        for (i = C.length - 1; i >= 0; i--)
            for (k in C[i]) o[k] = C[i][k];

        // if(o.constructor)o.constructor(data);

    }

    for (i = 1; i < AL; i++) {
        Ai = arguments[i];
        switch (typeof Ai) {
            case 'function':
                Ai === new Ai();
            case 'object':
                if (Ai) for (var j in Ai) o[j] = Ai[j];
        }
    }
    if (typeof o.__init__ === 'function')
        switch (datatype) {
            case 'array':
                o.__init__.apply(o, data);
                break;
            case 'value':
                o.__init__(data);
                break;
            default:
                o.__init__();
        }
    return o;
}

console.__timers = console.__timers || { __start: Date.now(), __last: Date.now() }

function consoleDebug(data,type) {
    try {
        var nowTime = Date.now(), __timers = console.__timers, info;

        //     nowTime = new Date();
        //     console.log(nowTime.getHours() + "."+ nowTime.getMinutes() + "."+ nowTime.getSeconds() + "." + nowTime.getMilliseconds() + " " + str);
        var getStackTrace = function () {
            var obj = {};
            Error.captureStackTrace(obj, getStackTrace);
            return obj.stack;
        };
        var err = new Error();
        var info = {
            callee: arguments.callee.caller,
            stack: err.stack.substr(err.stack.indexOf(')') + 2).trim(),
            delta: -(__timers.__last - nowTime) / 1000
        };
        if (arguments.length > 1 && !(arguments[1] in console) || arguments.length > 2) {
            var id = arguments[0];
            data = arguments[1];
            type = arguments[2];
            __timers[id] = __timers[id] || nowTime;
            info.id = id;
            info['delta[' + id + ']'] = -(__timers[id] - nowTime) / 1000
            __timers[id] = nowTime;
        }

        if(!type){
            type = 'log';
            if(id === 'error')type = 'error'
            else if(typeof data === 'string'){
                if(
                    data.indexOf('TypeError:')===0||
                    data.indexOf('Ошибка:')===0
                
                )type = 'error'
            }
        }
        // info.match(/\(([^)]+)\)/)[1]
        info = info.stack.match(/\/([^)|\/]+)\)/)[1];
        // info = info.stack;
        console[type](-(__timers.__start - nowTime) / 1000, data, info);//arguments.callee.caller
        // console.trace();
        __timers.__last = nowTime;
    } catch (e) { }
}

// consoleDebug = console.info.bind(console,'debug:');

// возможность измерять суммарную длительность неоднократно повторяемых элементов кода
var Intervals = {

    _begins: {},
    _ends: {},
    _counts: {},

    TOTAL_KEY: "INTERVALS TOTAL",

    // начало всего замера
    start: function () {
        Intervals._drop();

        Intervals.begin(Intervals.TOTAL_KEY);
    },

    // начало замера конкретного куска кода
    begin: function (mark) {
        if (!Intervals._begins[mark]) {
            Intervals._begins[mark] = 0;
        }
        if (!Intervals._counts[mark]) {
            Intervals._counts[mark] = 0;
        }
        var d = new Date().valueOf();
        Intervals._begins[mark] += d;
        Intervals._counts[mark]++;
    },

    // конец замера конкретного куска кода
    end: function (mark) {
        if (!Intervals._ends[mark]) {
            Intervals._ends[mark] = 0;
        }
        var d = new Date().valueOf();
        Intervals._ends[mark] += d;
    },

    // конец всего замера
    finish: function () {
        Intervals.end(Intervals.TOTAL_KEY);

        for (var mark in Intervals._begins) {
            Intervals._print(mark);
        }

        Intervals._drop();
    },

    _print: function (mark) {
        var begin = Intervals._begins[mark],
            end = Intervals._ends[mark],
            count = Intervals._counts[mark],
            total;

        if (end) {
            total = (end - begin);
            consoleDebug(mark + " = " + total + "ms, count=" + count);
        }
    },

    _drop: function () {
        Intervals._begins = {};
        Intervals._ends = {};
        Intervals._counts = {};
    }
}


if (typeof (Arion) === "undefined") {
    Arion = {};
}

Arion.util = {};
Arion.widget = {};

function invokeLater() {
    var callback = arguments[0];
    var interval = arguments[1] || 1;

    var time = setTimeout(function () {
        clearTimeout(time);
        callback();
    }, interval);
}


var waitCount = 0;
function doWhenItIsReady() {
    var callback = arguments[0];
    var interval = arguments[1] || 300;
    var recursive = arguments[2];  // internal parameter
    if (!recursive) {
        waitCount = 0
    }
    waitCount++;
    try {
        callback();
    }
    catch (e) {
        if (waitCount < 20) {
            invokeLater(function () {
                doWhenItIsReady(callback, interval, true);
            }, interval)
        }
    }
};


showNotification = (function () {
    var queue = [];
    var doShowNotification;
    var showing = false;
    var processNotifications = function () {
        if (queue.length > 0 && !showing) {
            showing = true;
            var notification = queue.splice(0, 1);
            invokeLater(function () {
                doShowNotification(notification)
            })
        }
    };

    var defaultConfig = {
        timeout: 5000,
        styleClass: 'UserNotification',
        callback: null,
        title: 'Системное сообщение',
        windowStyle: 'ArionWindowDiv',
        icon: null,
        zIndex: 3500,
        cancelBubble: true
    };

    doShowNotification = function (params) {
        var notification = params[0];
        var remove = function () {
            showing = false;
            jQuery("#notificationDialog").dialogCover("destroy");
            processNotifications();
            if (notification.callback) {
                notification.callback();
            }
        }

        var content = "";
        content += "<div class=''>";
        content += "<table><tbody><tr>";

        content += "<td>";
        if (notification.icon) {
            content += "<img src='" + contextPath + '/images/filter/' + notification.icon + "' align='absmiddle' />";
        } else {
            content += "<span/>";
        }
        content += "</td>";

        content += "<td class='alignMiddle'>";
        content += "<div class='" + notification.styleClass + "'>" + notification.message + "</div>";
        content += "</td>";

        content += "</tr></tbody></table>";
        content += "</div>";

        var arrowImg = "<img src='" + contextPath + "/images/filter/filtrArrow.gif' align='absmiddle' class='paddingRight5'/>";

        if (jQuery("#notificationDialog").length == 0) {
            jQuery("body").append("<div id='notificationDialog' class='filterBodyLeft' />")
        }

        jQuery("#notificationDialog")
            .empty()
            .append(content)
            .dialogCover({
                title: arrowImg + notification.title,
                forceDialogClass: notification.windowStyle,
                width: 500,
                resizable: false,
                close: function (elent, ui) {
                    remove();
                },
                minHeight: 110
            })
            .dialogCover("open")
            .dialogCover("option", "position", {
                my: "center",
                at: "center",
                of: window
            })

        if (notification.timeout) {
            setTimeout(function () {
                remove();
            }, notification.timeout);
        }
    };

    return function (message, conf) {
        var config = deepCloneObject(defaultConfig);
        if (isValueOK(conf)) {
            jQuery.extend(config, conf);
        }
        config.message = message;
        queue.push(config);
        processNotifications();
    };
})()

//showConfirm = function(title, message, buttonMessage, buttonNoMessage, func) {
//    var button = BUTTON({'class' : 'button'}, buttonMessage);
//    var buttonNo = BUTTON({'class' : 'button cancelBtn'}, buttonNoMessage);
//    var messageDiv = DIV({'style' : 'text-align: center; height: 40px;'}, message);
//    var container = DIV(null, messageDiv, DIV({'class' : 'controlsContainer'}, button, buttonNo));
//    var window = createWindow(title, container, { dimensions: {w: 400}, hidden: true, autoHide: false, zIndex: Data.BASE_Z_INDEX + 500});
//    var destroy = function(){
//        window.destroy();
//        delete window;
//        if(conn1) disconnect(conn1);
//        if(conn2) disconnect(conn2);
//        if(conn3) disconnect(conn3);
//        delete conn1;
//        delete conn2;
//        delete conn3;
//        delete button;
//        delete buttonNo;
//        delete container;
//        delete callback;
//        delete callbackNo;
//        delete callbackEnter;
//    };
//    var callback = function() {
//        func(true);
//        destroy();
//    };
//    var callbackNo = function() {
//        func(false);
//        destroy();
//    };
//    var callbackEnter = function(evt){
//        if (evt._event.keyCode == Data.keyCodes.ENTER) { // enter
//            callback();
//        };
//        if (evt._event.keyCode == Data.keyCodes.ESC) {  // esc
//            callbackNo();
//        };
//    };
//    var conn1 = connect(button, 'onclick', callback);
//    var conn2 = connect(buttonNo, 'onclick', callbackNo);
//    var conn3 = connect(document, 'onkeypress', callbackEnter);
//    window.show();
//}


showErrorNotification = function (message, params, force) {
    if (!Data.popupErrorMessages && !force) {
        consoleDebug("Ошибка: " + message)
        return;
    }
    if (!isValueOK(params)) {
        params = {};
    }
    params.styleClass = 'ErrorNotification';
    params.windowStyle = 'ArionErrorWindowDiv';
    params.icon = 'iconRed.gif';
    if (!params.title) {
        params.title = 'Ошибка';
    }
    showNotification(message, params);
};

showSuccesNotification = function (message, params) {
    if (!isValueOK(params)) {
        params = {};
    }
    params.styleClass = 'ErrorNotification';
    params.windowStyle = 'ArionSuccesWindowDiv';
    if (!params.icon) {
        params.icon = 'iconGreen.gif';
    }
    if (!params.title) {
        params.title = 'Системное сообщение';
    }
    showNotification(message, params);
}

showWarningNotification = function (message, params) {
    if (!isValueOK(params)) {
        params = {};
    }
    params.styleClass = 'WarningNotification';
    params.windowStyle = 'ArionWarningWindowDiv';
    if (!params.icon) {
        params.icon = 'iconWarning.png';
    }
    if (!params.title) {
        params.title = 'Системное сообщение';
    }
    showNotification(message, params);
}




Arion.widget.createButton = function (elem, cls, callback, small) {
    return new Arion.widget.button(elem, cls, callback, small);
}

Arion.widget.button = function (elem, cls, callback, small) {
    if (typeof (elem) === "string") {
        this.elem = dId(elem);
        this.id = elem;
    } else {
        this.elem = elem;
        if (!this.elem || this.elem.parentNode == undefined || this.elem.parentNode == null) {
            return
        }
        this.id = elem.id ||  uniqueId();
    }
    if (!this.elem || this.elem.parentNode == undefined || this.elem.parentNode == null) {
        //console.debug("need parent for " + this.elem.title);
        return
    }
    this.cls = cls;
    this.callback = null;
    if ( typeof (callback) === "function") {
        this.callback = callback;
    }
    this.small = small;
    this.disabled = false;
    this.locked = false;
    this.createBtn();
};


(function () {
    var m_oButtons = {};
    var btnS = document.createElement('button');
    btnS.setAttribute("type", "button");

    Arion.widget.button.prototype = {
        createBtn: function () {
            var _ = this;
            var size = _.small ? 23 : 32;

            _.btn = btnS.cloneNode(false);
            _.btn.setAttribute('title', _.elem.title);
            
            _.btnContainer = SPAN({
                id:_.id,
                className:'yui-button ' + _.cls + ' yui-btn-'+size,
                title: _.elem.title,
                parentNode : _.elem.parentNode,
                style : {
                    display: 'inline-block',
                    width : size + 'px',
                    height : size + 'px', 
                }
            },
            _.btn
            ); 

            _.btnContainer.addEventListener('click',function(ev){
               if(!this.matches('[disabled] *, [disabled]')){
                //    if(this.classList.toggle(DelegateButton.CLASS_SELECTED)){

                //    }
                this.classList.toggle(DelegateButton.CLASS_ACTIVE)
                if(_.callback)_.callback.call(this,ev)
               }
            })

            _.elem.remove(); 

            _.set("disabled", false);
            m_oButtons[_.id] = _;
            return _.btnContainer
        },

        set: function (prop, value) { 

            //
            switch(prop){
                case "locked":
                    this.locked = value; 
                case "disabled":
                    this.btnContainer.toggleAttribute('disabled',value || this.locked);
                break;
                case "display":
                    toggleElDisplay(this.btnContainer,"inline-block",value !== "none");
                break;
                case "select":
                    this.btnContainer.classList.toggle(DelegateButton.CLASS_SELECTED,value);
                break;
                case "pressed": 
                break;
                case 'title': 
                    if(typeof (value) === 'string')
                        this.btn.setAttribute('title', value);
                break;
                case 'class':
                    if(typeof (value) === 'string'){ 
                        this.cls = value;
                        this.btnContainer.classList.add(value);
                    }
                break;
                case 'action':
                    if( value != undefined && value != null && typeof (value) === "function" ){ 
                        this.callback = value;
                        if (this.btnContainer.onclick != null)
                            this.btnContainer.onclick = this.callback;
                    }
                break;
                case 'type':
                    if( typeof (value) === 'string' ){ 
                        this.btn.setAttribute('type', value);
                    }
                break;

            }   
        },

        setBtnClass: function (btn, cls) {
            btn.btnContainer.classList.add(cls);
        },

        setAttributes: function (obj) {
            this.set("disabled", !!obj.disabled)
        },

        addClass: function (cls) {
            if (cls != null && cls != undefined) {
                this.btnContainer.className = this.btnContainer.className + cls;
            }
        },

        removeClass: function (cls) {
            if (cls != null && cls != undefined) {
                var t = 7;
            }
        },

        setStyle: function (prop, value) {
            this.btnContainer.style[prop] = value;
        },

        isDisabled: function () {
            return this.btnContainer.hasAttribute("disabled");
        },

        isActive: function () {
            // return jQuery(this.btnContainer).hasClass("yui-button-active")
        },

        // isHover: function () {
        //     return jQuery(this.btnContainer).hasClass("yui-button-hover")
        // },

        destroy: function () {
            this.elem = null;
            this.cls = null;
            this.callback = null;
            this.small = null;
            this.disabled = null;
            this.locked = null;
            this.id = null;
            // this.btnContainer.onmouseover = null;
            // this.btnContainer.onmouseout = null;
            this.btnContainer.onmousedown = null;
            this.btnContainer.onmouseup = null;
            this.btnContainer.onclick = null;
            if (this.btnContainer.parentNode) {
                var removed = this.btnContainer.parentNode.removeChild(this.btnContainer);
                removed = null;
            }
        }
    }

    Arion.widget.button.getButton = function (btnId) {
        return m_oButtons[btnId]
    }
})();





var DelegateButton = {
    // CLASS_HOVER: "yui-button-hover",
    CLASS_ACTIVE: "yui-button-active",
    // CLASS_DISABLED: "yui-button-disabled",
    CLASS_SELECTED: "yui-button-selected",

    addHandlers: function (parent, list) { 

        if(typeof parent === 'string')parent = dQ(parent); 
        if(!(parent instanceof Node))
            switch(true){
                case parent&&('length' in parent):
                    if(parent.length === 1 &&( parent[0]  instanceof Node)){parent = parent[0]; break;}
                    else for(var i=0; i<parent.length; i++)DelegateButton.addHandlers(parent[i], list);
                default:
                return;
            } 

        if (list instanceof Array) {
            list.forEach(DelegateButton.addClickEvent.bind(this,parent));
            // DelegateButton.addEffects(parent, selectors)
        }else{
            DelegateButton.addClickEvent(parent, list)
        }
    },

    addEffects: function (parent, selector) {
        // parent.delegate(selector, "mouseenter", function () {
        //     var btn = this;
        //     if (!DelegateButton.isDisabled(btn) && !DelegateButton.isSelected(btn)) {
        //         btn.classList.add(DelegateButton.CLASS_HOVER)
        //     }
        // })

        // parent.delegate(selector, "mouseleave", function () {
        //     var btn = this;
        //     if (!DelegateButton.isDisabled(btn) && !DelegateButton.isSelected(btn)) {
        //         btn.classList.remove(DelegateButton.CLASS_HOVER)
        //     }
        // })

        // parent.delegate(selector, "mousedown", function () {
        //     var btn = this;
        //     if (!DelegateButton.isDisabled(btn) && !DelegateButton.isSelected(btn)) {
        //         btn.classList.add(DelegateButton.CLASS_ACTIVE)
        //     }
        // })

        // parent.delegate(selector, "mouseup", function () {
        //     var btn = this;
        //     if (!DelegateButton.isDisabled(btn) && !DelegateButton.isSelected(btn)) {
        //         btn.classList.remove(DelegateButton.CLASS_ACTIVE)
        //     }
        // })
    },

    cache : new Map(),

    addClickEvent: function (parent, item) {
        
        if(!(parent instanceof Node)) return;
        item = item || {} 
        
        
        var CH = DelegateButton.cache.get(parent);
        
        if(!CH)
            DelegateButton.cache.set(parent,CH = {});

        var cached = CH[item.selector || 0]; 

        var isInited = !!cached;

        if(!isInited)cached = CH[item.selector || 0] = {};
        else console.info('DelegateButton : Переназначение методов события',parent)
        
        Object.assign(cached,item); 

        for(var i in cached)if(typeof cached[i]!=='function')delete cached[i];

        if(!isInited) 
            parent.addEventListener( "click", function (e) { 
                var _ = DelegateButton;
                var btn = item.selector ? e.target.closest(item.selector) : this; 
                if(!btn)return;

                if (!DelegateButton.isDisabled(btn)) {
                    if (!DelegateButton.isSelected(btn) && cached.callback)//onSelected
                        cached.callback.apply(btn, arguments);
                    if (cached.click)//ex : selectedClickCallback
                        cached.click.call(btn, e);
                } else if (cached.onDisabledClick) {//ex : disabledClickCallback
                    //Клик по отключенной кнопке (созданно для вызова настроек в дашбордах)
                    cached.onDisabledClick.call(btn, e);
                }
            })
    },

    getButton: function (c, title, disabled) {
        var Arg = { className: (c || '') }
        if (typeof c === 'object') {
            Arg.className = c.className;
            title = title || c.title || c.text || '';
            disabled = c.disabled;
            if (c.id) Arg.id = c.id;
            Arg.parentNode = c.parentNode || c.parentElement
        }
        Arg.className += " yui-button yui-btn-32";
        if (disabled) Arg.disabled = true; 
        var btn = SPAN( Arg,  CreateElement('button', { title: title, type: 'button' }) )
        if(typeof c === 'object' && (c.callback || c.click || c.clickOnDisabled))
            DelegateButton.addClickEvent(btn,c);
        return btn;
    },

    setInitedButtons: function (parent, list) {
        if (list) {
            list.forEach(function (item, i) {
                parent.append(DelegateButton.getButton(item));
                //DelegateButton.addClickEvent(parent, item); 
            })
            // DelegateButton.addEffects(parent, selectors)
        }
    },

    getButtonStr: function (cls, title, disabled) { 
        return "<span class='" + cls + " yui-button yui-btn-32'"+(disabled ? ' disabled' : '')+"><button title='" + title + "' type='button'></button></span>"
    },

    set: function (btn, prop, value) {
        if (!btn) return;
        if (!('length' in btn)) btn = [btn];
        for (var i = 0; i < btn.length; i++) {
            switch (prop) {
                case "selected":
                    if (value === true) {
                        btn[i].classList.add(DelegateButton.CLASS_SELECTED)
                        // btn[i].classList.add(DelegateButton.CLASS_HOVER)
                    } else {
                        btn[i].classList.remove(DelegateButton.CLASS_SELECTED)
                        // btn[i].classList.remove(DelegateButton.CLASS_ACTIVE)
                        // btn[i].classList.remove(DelegateButton.CLASS_HOVER)
                    }
                    break;
                case "disabled":
                    btn[i].toggleAttribute('disabled',value === true)
                    // if (!value ) { 
                    //     btn[i].classList.remove(DelegateButton.CLASS_HOVER)
                    // }
                    break;
                case "title":
                    var button = btn[i].querySelector("button");
                    if (button) button.setAttribute("title", value);
                    break;
            }
        }
    },

    isDisabled: function (btn) {//DelegateButton.CLASS_DISABLED
        return getEl(btn,true).hasAttribute("disabled");
    },

    isSelected: function (btn) { 
        return getEl(btn,true).classList.contains(DelegateButton.CLASS_SELECTED)
    },

    toggleSelected: function (btn) {
        DelegateButton.set(btn, "selected", !DelegateButton.isSelected(btn));
    }
}



Arion.widget.button.ButtonSelector = function (config, callback) {
    this.buttons = [];
    this.buttonsDataById = {};
    this.selectedBtnId = null;
    this.selectFirstButton = (config.selectFirstButton == false) ? false : true;
    this.callback = callback;

    this.config = config;
    //    var config = {
    //        parentId : "",
    //        buttons : [
    //            {
    //                value : "",
    //                cls : "",
    //                title : ""
    //            }
    //        ]
    //    }
    this.init();
}

Arion.widget.button.ButtonSelector.prototype = {
    init: function () {
        var _this = this;
        var parentId,
            parent;
        if (_this.config.parentId) {
            parentId = _this.config.parentId;
            parent = dId(parentId);

        } else if (_this.config.parent) {
            parent = getEl(_this.config.parent);
            parentId = parent.id;
            _this.config.parentId = parentId;
        }

        parent.innerHTML = '';
        var btnData, id, btnElem, selectedValue;
        for (var i = 0, L = _this.config.buttons.length; i < L; i++) {
            btnData = _this.config.buttons[i];
            id = btnData.value + parentId;
            _this.buttonsDataById[id] = btnData;
            btnElem = CreateElement('button', { id: id, title: btnData.title })
            parent.appendChild(SPAN( btnElem ))
            _this.buttons.push(Arion.widget.createButton(btnElem, btnData.cls, function () {
                _this._clickCallback(this);
            }))
            if (_this.selectFirstButton && i == 0) {
                selectedValue = btnData.value;
            }
        }
        _this.setSelected(selectedValue);
    },

    setSelected: function (value) {
        if (this.selectedBtnId) {
            Arion.widget.button.getButton(this.selectedBtnId).set("select", false);
            this.selectedBtnId = null;
        }
        if (isValueOK(value)) {
            var id = this._getButtonIdByValue(value)
            var btn = Arion.widget.button.getButton(id);
            if (btn) {
                btn.set("select", true);
                this.selectedBtnId = id;
            }
        }
    },

    getSelected: function () {
        return this.selectedBtnId ? this._getButtonValueById(this.selectedBtnId) : null
    },

    _clickCallback: function (btn) {
        if (btn.id != this.selectedBtnId) {
            var value = this._getButtonValueById(btn.id);
            this.setSelected(value)
            this.callback.call(btn, value);
        }
    },

    enableOne: function (value) {
        var id = this._getButtonIdByValue(value)
        if (id) {
            var btn = Arion.widget.button.getButton(id);
            if (btn) {
                btn.set("disabled", false);
            }
        }
    },

    disableOne: function (value) {
        var id = this._getButtonIdByValue(value)
        if (id) {
            var btn = Arion.widget.button.getButton(id);
            if (btn) {
                if (id == this.selectedBtnId) {
                    var firtsBtn = this.buttons[0];
                    this._clickCallback(firtsBtn);
                }
                btn.set("disabled", true);
            }
        }
    },

    enableAll: function () {
        var selectedBtn = null;
        if (this.selectedBtnId) {
            selectedBtn = Arion.widget.button.getButton(this.selectedBtnId);
        }
        for (var i = 0, L = this.buttons.length; i < L; i++) {
            var btn = this.buttons[i];
            btn.set("disabled", false);
            btn.set("select", btn === selectedBtn);
        }
    },

    disableAll: function () {
        for (var i = 0, L = this.buttons.length; i < L; i++) {
            this.buttons[i].set("disabled", true)
        }
    },

    _getButtonValueById: function (id) {
        return this.buttonsDataById[id].value
    },

    _getButtonIdByValue: function (value) {
        return value + this.config.parentId
    },

    destroy: function () {
        for (var i = 0, L = this.buttons.length; i < L; i++) {
            var btn = this.buttons[i];
            btn.destroy();
        }
        this.callback = null;
    }
}




createBlock = (function () {
    // следующая версия
    // работает на jQuery без Mochikit
    var jQueryOK = typeof (jQuery) === "function";

    var defaultConfig = {
        closeBtn: false,
        initialShowContent: true,
        closeCallback: null,
        clickCallback: null,
        hideContentCallback: null,
        showContentCallback: null,
        hoverEffect: false,
        style: "", // deprecated
        cls: "",
        hasHeaderTextBkg: false,
        editableHeader: false,
        upBtn: false,
        upClickCallback: null,
        downBtn: false,
        downClickCallback: null
    };


    return function (header, content, pos, conf) {
        var config = Object.assign({}, defaultConfig);
        if (conf != undefined && conf != null) {
            config = Object.assign(config, conf);
        } 

        var innerDiv = DIV({className:'operationBody'},[
            DIV({className:'operationBody2'},content),
            DIV({className:'bottomBar'})
        ]); 

        var tmp = DocFragment();

        var posSpan = null;
        var position = null;
        var fSetPos = function () {
        };
        var headerTextElem;
        if (pos) {
            position = pos;
            posSpan = tmp.appendChild(SPAN(position));
            tmp.appendChild(TextNode(". "));
            fSetPos = function (newPos) { 
                posSpan.innerHTML = position = newPos;
            }
        }
        headerTextElem = config.editableHeader ? INPUT({className:'operationHeaderInput',value:header}) : SPAN({className:'operationHeaderInput',value:header},header);
        tmp.appendChild(headerTextElem);

        
        var headerElem = SPAN(tmp);
        if (config.hasHeaderTextBkg) 
            headerElem.classList.add("operationHeaderText"); 

        var fGetHeader = function () {
            return config.editableHeader ? headerTextElem.value : header;
        }

        var fSetHeader = function (text) {
            headerTextElem[(config.editableHeader? 'value':'innerText')] = text;
        }

        var fGetPos = function () {
            return position
        }

        tmp = DocFragment();
        if (config.closeBtn){ 
            var closeBtn = IMG({className:'ArionWindowHeaderButton closeBtn',src:contextPath + "/images/filter/filterClose.gif",parentNode:tmp}); 
            if (typeof (config.closeCallback) === 'function') 
                closeBtn.addEventListener("click", function (e) {
                    config.closeCallback(this);
                });
        }

 
        var upButton, downButton,
            fUpBtnToggleView = function () { },
            fDownBtnToggleView = function () { };
        if (config.upBtn) {
            upButton =  IMG({className:'ArionWindowHeaderButton upBtn',src:contextPath + "/images/filter/blockUp.gif",parentNode:tmp});  
            fUpBtnToggleView = toggleElDisplay.bind(null,upButton);
            if (typeof (config.upClickCallback) === 'function') 
                upButton.addEventListener("click", function (e) {
                    config.upClickCallback(this);
                });
        }
        if (config.downBtn) {
            downButton = IMG({className:'ArionWindowHeaderButton downBtn',src:contextPath + "/images/filter/blockDown.gif",parentNode:tmp});  
            fUpBtnToggleView = toggleElDisplay.bind(null,downButton);
            if (typeof (config.downClickCallback) === 'function')
                downButton.addEventListener("click", function (e) {
                    config.downClickCallback(this);
                });
        }

        var headerRightDiv = DIV({className:'operationHeaderRight',unselectable:'on'},tmp);
        var headerDiv =  DIV({className:'operationHeaderLeft',unselectable:'on'},[
            headerRightDiv, headerElem
        ]);  


        var show = config.initialShowContent;
        var showContent = function () {
            show = true;
            toggleElDisplay(innerDiv,true);
            if (typeof (config.showContentCallback) === "function") config.showContentCallback();
        }
        var hideContent = function () {
            show = false;
            toggleElDisplay(innerDiv,false);
            if (upButton) toggleElDisplay(upButton,false);
            if (downButton) toggleElDisplay(upButton,true);
            if (typeof (config.hideContentCallback) === "function") config.hideContentCallback();
        }
        var toggleContent = function () {
            if (show) hideContent(); else showContent();
        }

        var cls = config.cls || config.style;
        var operationDiv = DIV({className:'operation forStrip '+(config.cls || config.style),unselectable:'on'},[headerDiv,innerDiv]) 

         
        if (config.hoverEffect) {
            operationDiv.addEventListener('mouseover',function(){this.classList.add("hoverHighlight")});
            operationDiv.addEventListener('mouseout',function(){this.classList.remove("hoverHighlight")}); 
        }
        if (typeof (config.clickCallback) === "function") {
            operationDiv.addEventListener('click', function () {
                config.clickCallback(this);
            })
        }

        var fDestroy = function () {
            operationDiv.remove();

            innerDiv = null;
            headerElem = null;
            fSetHeader = null;
            posSpan = null;
            headerRightDiv = null;
            headerDiv = null;
            showContent = null;
            hideContent = null;
            toggleContent = null;
            operationDiv = null;
            fUpBtnToggleView = null;
            fDownBtnToggleView = null;
        }

        var blockUI = {
            block: operationDiv,
            header: fGetHeader,
            setHeader: fSetHeader,
            content: content,
            showContent: showContent,
            hideContent: hideContent,
            toggleViewContent: toggleContent,
            getPos: fGetPos,
            setPos: fSetPos,
            destroy: fDestroy,
            upBtnToggleView: fUpBtnToggleView,
            downBtnToggleView: fDownBtnToggleView
        }

        Blocks.data.set(blockUI.block, blockUI)

        return blockUI

    }

})();


var Blocks = {

    data : new Map(),

    getData : function(e){
        if(!e)return {};
        if(!(e instanceof Element))e = e[0];
        return Blocks.data.get(e)
    },

    createBlock: function (header, content, pos, conf) {
        var c = {
            upClickCallback: function () {
                Blocks._upClick.apply(this, arguments);
                if (conf.upClickCallback) conf.upClickCallback.apply(this, arguments);
            },
            downClickCallback: function () {
                Blocks._downClick.apply(this, arguments);
                if (conf.downClickCallback) conf.downClickCallback.apply(this, arguments);
            },
            closeCallback: function () {
                Blocks._remove.apply(this, arguments);
                if (conf.closeCallback) conf.closeCallback.apply(this, arguments);
            }
        }

        c = Object.assign({}, conf, c);
        var b = createBlock(header, content, pos, c);

        return b
    },

    _upClick: function (elem) {
        var b = Blocks.getBlock(elem);
        var prev = Blocks._getPrev(b);
        if (prev.length > 0) {
            prev.before(b);
            Blocks.refreshAll(Blocks._getList(b));
        }
    },

    _downClick: function (elem) {
        var b = Blocks.getBlock(elem);
        var next = Blocks._getNext(b);
        if (next.length > 0) {
            next.after(b);
            Blocks.refreshAll(Blocks._getList(b));
        }
    },

    refresh: function (b, bData, pos) {
        bData = bData ||  Blocks.getBlockData(b);
        var prev = Blocks._getPrev(b);
        var next = Blocks._getNext(b);
        bData.upBtnToggleView(!!prev);
        bData.downBtnToggleView(!!next);

        if (pos != null)bData.setPos(pos);
    },

    refreshAll: function (list) {
        getEl(list).querySelectorAll(":scope >.operation").forEach(function (o,i) {
            Blocks.refresh(o, null, i + 1);
        })
    },

    _remove: function (elem) {
        var b = Blocks.getBlock(elem);
        var list = Blocks._getList(b);
        Blocks.getBlockData(b).destroy();
        Blocks.refreshAll(list);
    },

    getBlock: function (elem) {
        return elem.closest(".operation")
    },

    getBlockData: function (elem) {
        return Blocks.data.get(Blocks.getBlock(elem)); 
    },

    _getList: function (elem) {
        return Blocks.getBlock(elem).parentNode;
    },

    _getNext: function (block) {
        while( block ){
            block = block.nextElementSibling;
            if(!block||block.classList.contains("operation"))return block; 
        } 
        return null;
    },

    _getPrev: function (block) { 
        while( block ){
            block = block.previousElementSibling;
            if(!block||block.classList.contains("operation"))return block; 
        } 
        return null;
    }
}




function isTextOK(text) {
    return (typeof (text) === "string" && text !== "" && text.trim().length > 0);//text.replace(/^\s*/, "")
}
function isValueOK(value) {
    return (value != undefined /*&& value !== null*/ && value !== "");
}

function isValueNotOK(value) {
    return (value == undefined /*|| value === null*/ || value === "");
}

function isNotUndefinedOrNull(value) {
    return (value != undefined /*&& value !== null*/);
}

function trimText(str, n) {
    if (typeof (str) === "string" && typeof (n) === "number" && str.length > n) {
        return str.substr(0, n) + "..."
    } else {
        return str
    }
}

function trimHLText(str, n) {
    var res = str;
    if (typeof (str) === "string" && typeof (n) === "number") {
        var L = str.length;
        if (L > n) {
            var hlPos = str.indexOf("<em>"),
                prefix = "",
                suffix = "";

            if (hlPos != -1) {
                var start = hlPos - Math.ceil(n / 4);
                if (start < 0) {
                    start = 0;

                } else {
                    prefix = "... ";
                }

                if (start + n > L) {
                    start = L - n;

                } else {
                    suffix = " ...";
                }

                res = prefix + str.substr(start, n) + suffix;

                // for test only
                //res += "<br/>" + str;

            } else {
                res = str.substr(0, n) + "...";
            }
        }
    }

    return res;
}

function trimSpaces(str) {
    if (typeof (str) === "string") {
        return str.replace(/^\s*/, "").replace(/\s*$/, "")
    } else {
        return str
    }
}


function addHttp(str) {
    if (typeof (str) === "string") {
        var patt = /^((http|https):\/\/)/ig;
        var href = patt.test(str) ? str : "http://" + str;
        return href;

    } else {
        return str;
    }
}


function isMultiword(str) {
    return typeof (str) === "string" && trimSpaces(str).split(" ").length > 1;
}

//function setParamsToUrl(params){
//    var str = "";
//    var param, value;
//    if(params){
//        for(var i=0, L=params.length; i<L; i++){
//            param = params[i].param;
//            value = params[i].value;
//            if(value){
//                if(str != ""){
//                    str += "&";
//                }
//                str += param + "=" + value;
//            }
//        }
//        if(str != ""){
//            str = "#" + str;
//        }
//    }else if(location.href.indexOf("?") == -1){
//        return
//    }
//
//    location.href = encodeURI(location.protocol + "//" + location.host + location.pathname + str);
//}
//
//function getParamsFromUrl(){
//    var url = decodeURIsafe(location.href);
//    var arr = url.slice(url.indexOf("#") + 1).split("&");
//    var params = {};
//    var p, param, value;
//    for(var i=0, L=arr.length; i<L; i++){
//        p = arr[i].split("=");
//        param = p[0];
//        value = p[1];
//        if(param && value){
//            params[param] = value
//        }
//    }
//    return params
//}

function decodeURIsafe(uri) {
    var s = uri;
    try {
        s = decodeURI(uri);
    } catch (_) { }
    return s
}

function getUrl(noAddHtmlPage) {
    var url = location.protocol + "//" + location.host;
    if (!noAddHtmlPage) {
        url += location.pathname.replace(/\/$/, "");
        if (Data.isPortalEmbeddedWindow) url += location.search
    } else {
        if (!Data.isPortalEmbeddedWindow) url += "/bigs";
    }
    return url;
}

function safeAppendToUrl(paramsStr, useQMark) {
    var url = getUrl();
    url += getSafeUrlParams(paramsStr, useQMark);

    return url
}

function getSafeUrlParams(paramsStr, useQMark) {
    var str = "";
    var url = getUrl();
    var reg = /\.html|\.php/;//html$|php$/; - не верен в некоторых случаях
    if(Data.isPortalEmbeddedWindow)useQMark = false;
    var sep = (useQMark) ? "?" : "#";
    if (!paramsStr) {
        paramsStr = "";
    }
    if (reg.exec(url)) {
        str += sep + paramsStr;
    } else {
        str += "/" + sep + paramsStr;
    }

    return str
}

function setParamsToUrl(jsonString) {
    var str = ""; 
    if (jsonString && jsonString != "") str = "#" + jsonString;

    location.href = encodeURI(location.protocol + "//" + location.host + location.pathname + str);
}

function getJsonFromUrl() {
    return getJsonParams(decodeURIsafe(location.href), true)
}

function getJsonFromUrlString(urlString) {
    return getJsonParams(urlString, false)
}

function getJsonParams(url, nullIfNotFound) {
    var params = "";
    var start = url.indexOf("{");
    var end = url.indexOf("&");

    if (start != -1) {
        if (end != -1 && end > start) {
            params = url.slice(start, end);
        } else {
            params = url.slice(start);
        }

    } else {
        if (nullIfNotFound) {
            params = null;
        } else {
            params = url
        }
    }
    return params
}


function getURLParmsSeparator(url, def) {
    if (Data.isPortalEmbeddedWindow) return "#";
    if (!url) url = location.href;
    var s = url.indexOf("?"),
        s2 = url.indexOf("#");
    if (s !== -1 && s2 !== -1)
        return (s < s2 ? "?" : "#");
    else if (s === -1 && s2 === -1)
        return def;
    else if (s === -1) return "#";
    else if (s2 === -1) return "?";
}

function getOneParamFromURIStr(str, name) {
    var value = null;
    if (str === true) str = decodeURIComponent(decodeURIsafe(location.href));
    if (str != null) { 
        var s = str.indexOf("#");
        if(!Data.isPortalEmbeddedWindow){
            var s2 = str.indexOf("?");
            if (s !== -1 && s2 !== -1)//Стоит ли вместо location.pathname использовать str.substr ?...
                s = Math.min(s, s2);
            else if (s === -1) s = s2;
        }
        var map = Object.create((s === -1) ? {
            __parmstr__: '',
            __sep__: isIframe() ? '?' : '#',
            __path__: str,
            __url__: str
        } : {
                __parmstr__: str.substring(s + 1),
                __sep__: str.substr(s, 1),
                __path__: str.substr(0, s),
                __url__: str
            })
        if (s != -1) {

            str = map.__parmstr__;

            //1. Пытаемся выбить из запроса { ... } т.к. там может всякое непотребство быть
            var skobaFirst = str.indexOf('{');
            var skobaLast = str.lastIndexOf('}'),
                ravno = str.indexOf('='),
                start = 0,
                br = 0,
                end = 0,
                substr = '';
            if (skobaFirst !== -1) {
                // Вычленяем {}

                var str1 = str.substr(0, skobaFirst),
                    str2 = str.substr(skobaLast + 1);
                var jsonStr = str.slice(skobaFirst, skobaLast + 1);
                if (str1[str1.length - 1] === '=') {
                    br = str1.lastIndexOf('&');
                    if (br === -1) br = 0;
                    else br += 1;
                    map[str1.slice(br, -1)] = jsonStr;
                    str1 = str1.substr(0, br)
                } else {
                    map[0] = jsonStr;
                }
                br = 0;
                str = str1 + str2.substr(1);
            }

            if (str)
                while (start < str.length) {
                    //Нужно переделать: пусть вначале ищит & а потом строки
                    // Новый алгоритм: а) получить 3 подстроки от-но {}
                    // б) Разбить подстроки по & м отфильтровать
                    br = str.indexOf('&', start);
                    ravno = str.indexOf('=', start);
                    if (br === -1) br = str.length;
                    if (ravno > br || ravno === -1) {
                        map[str.slice(start, br)] = null;
                    } else {
                        map[str.slice(start, ravno)] = str.slice(ravno + 1, br);
                    }
                    start = br + 1;
                }
            if (name || name === 0) {
                value = map[name] || null;
            } else {
                value = map;
            }

        } else if (!name) {
            value = map;
        }
    }
    return value
}



var datePikerRu = {
    days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
    daysShort: ["Вос", "Пон", "Втр", "Ср", "Чет", "Птн", "Суб", "Вос"],
    daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    weekMin: 'нед'
}

function fAddZeroToString(sString) {
    sString = sString.toString();
    if (sString.length === 1) {
        sString = "0" + sString;
    }
    return sString;
}

function fromStringToDate(str) {
    // date in format "DD.MM.YYYY"
    var d = str.split(".");
    var date = new Date(d[2], d[1] * 1 - 1, d[0]);
    return date
}

function fromDateToString(date) {
    // date in format "DD.MM.YYYY"
    if (typeof (date) == "number") {
        date = new Date(date);
    }
    return fAddZeroToString(date.getDate()) + "." + fAddZeroToString(date.getMonth() + 1) + "." + date.getFullYear();
}

function fromDateToStringTime(date) {
    // date in format "DD.MM.YYYY hh:mm"
    if (typeof (date) == "number") {
        date = new Date(date);
    }
    return fAddZeroToString(date.getDate()) + "." + fAddZeroToString(date.getMonth() + 1) + "." + date.getFullYear() + " " + fAddZeroToString(date.getHours()) + ":" + fAddZeroToString(date.getMinutes());
}

function fromStringToRFC(str) {// "Sun, 12 Oct 2003 16:25:01 +0100"
    var rfc = null;
    if (str != null) {
        var d = fromStringToDate(str);
        var o = d.getTimezoneOffset();
        var sign;
        if (o > 0) {
            sign = "-";
        } else {
            sign = "+";
            o = -o;
        }
        var timeOffset = sign + fAddZeroToString(Math.floor(o / 60)) + fAddZeroToString(o % 60);
        var dd = new Date(d.getTime() + o * 60000); // корректируем дату с учетом разницы с GMT чтобы toUTCString, которая возвращает дату по GMT, возвращала дату, совпадающую с локальной.
        var arr = dd.toUTCString().split(" ");
        var rfc = arr[0] + " " + arr[1] + " " + arr[2] + " " + arr[3] + " " + fAddZeroToString(dd.getHours()) + ":" + fAddZeroToString(dd.getMinutes()) + ":" + fAddZeroToString(dd.getSeconds()) + " " + timeOffset;
    }
    return rfc
}

function fromRFCToString(rfc) {
    var time = arguments[1];
    var str = null;
    if (rfc != null) {
        rfc = rfc.replace(/\s+/g, " ");
        var arr = rfc.split(" ");
        var o = arr[5];
        var sign = o.substr(0, 1);
        var offsetMinutes;
        switch (sign) {
            case "+": {
                offsetMinutes = -(o.substr(1, 2) * 60 + o.substr(3, 2) * 1);
                break
            }
            case "-": {
                offsetMinutes = o.substr(1, 2) * 60 + o.substr(3, 2) * 1;
                break
            }
            default: {
                o = "+" + o;
                offsetMinutes = -(o.substr(1, 2) * 60 + o.substr(3, 2) * 1);
                break
            }
        }
        var stringGMT = arr[0] + " " + arr[1] + " " + arr[2] + " " + arr[3] + " " + arr[4] + " " + "GMT " + o;
        var d = Date.parse(stringGMT);
        var dd = new Date(d);
        if (time) {
            str = fromDateToStringTime(dd);
        } else {
            str = fromDateToString(dd);
        }

    }
    return str
}

function fromRFCToStringTime(rfc) {
    // date in format "DD.MM.YYYY hh:mm"
    var str = null;
    if (rfc != null) {
        str = fromRFCToString(rfc, true);
    }
    return str
}

function getDateFromAndDateTo(dateArray) {
    var start, end;
    var getDateObject = function (z) {
        if (typeof (z) == 'number') {
            return new Date(z)
        } else if (typeof (z) == 'string') {
            return fromStringToDate(z)
        } else {
            return z
        }
    }

    var d0 = getDateObject(dateArray[0]);
    var d1 = getDateObject(dateArray[1]);

    if (!d1) {
        start = d0;
        end = null;
    } else {
        if (d0.getDate() == d1.getDate() && d0.getMonth() == d1.getMonth() && d0.getFullYear() == d1.getFullYear()) {
            start = d0;
            end = null;
        } else {
            start = d0;
            end = d1;
        }
    }
    //        var dateFrom = start.getDate() + "." + (start.getMonth() + 1) + "." + start.getFullYear();
    var dateFrom = fAddZeroToString(start.getDate()) + "." + fAddZeroToString((start.getMonth() + 1)) + "." + start.getFullYear();
    if (!end) {
        end = new Date(start.getTime() + 86400000);
    }
    //        var dateTo = end.getDate() + "." + (end.getMonth() + 1) + "." + end.getFullYear();
    var dateTo = fAddZeroToString(end.getDate()) + "." + fAddZeroToString((end.getMonth() + 1)) + "." + end.getFullYear();
    return {
        dateFrom: dateFrom,
        dateTo: dateTo
    }
}

function fromIsoToStringDateTime(str, addTime, seconds) {
    // str in format "2011-01-01T01:14:16"
    var s = "";
    if (str) {
        if (str.indexOf("T") == -1) {
            s = str
        } else {
            var arr1 = str.split("T");
            var arr2 = arr1[0].split("-")
            s += arr2[2] + "." + arr2[1] + "." + arr2[0];
            if (addTime) {
                if (!seconds) {
                    var arr3 = arr1[1].split(":");
                    s += " " + arr3[0] + ":" + arr3[1];
                } else {
                    s += " " + arr1[1];
                }
            }
        }
    }
    return s
}

function fromStringToIsoDateTime(str) {
    // str in format "20.03.2012"
    var s = "";
    if (str) {
        if (str.indexOf("T") != -1) {
            s = str
        } else if(str.indexOf('.')!==-1) {
            var arr1 = str.split(" ");
            var arr2 = arr1[0].split(".")
            s += arr2[2] + "-" + arr2[1] + "-" + arr2[0];
            if (arr1[1]) {
                s += "T" + arr1[1];
                if (arr1[1].split(":").length == 2) {
                    s += ":00";
                }
            } else {
                // fake
                s += "T00:00:00"
            }
        }else{ s = '';}
    }
    return s
}

function fromDateToIsoDateTime(date) {
    // require moment.js
    return date.local().format("YYYY-MM-DD[T]HH:mm:ss")
}

function fromDateToUTCIsoDateTime(date) {
    // require moment.js
    return date.utc().format("YYYY-MM-DD[T]HH:mm:ss")
}

function fromDateStringToRussianString(s) {
    var m = moment(s);
    return (m.isValid()) ? m.format("D MMMM YYYY HH:mm:ss") : s;
}

function fromDateStringToRussianString2(s) {
    var m = moment(s);
    return (m.isValid()) ? m.format("DD.MM.YYYY HH:mm:ss") : s;
}

// TODO: избавитьсся от numeral.js (numeral())

formatNumber = function(num,roundNum, sep){
    // было 123456,789
    // будет 123 456
    var res = ''; 
    if (num == +num) { 
        roundNum = roundNum ? Math.pow(10,roundNum) : 1; 
        var _num_, z = num<0 ? -1 : 1;
        
        if(roundNum>0)num = Math.round((+num)*roundNum)/roundNum;
        num*=z;
        _num_ = ~~num;
        _num_+='';
        num+='';
        for(var i=_num_.length, j=3;i>0;i-=3){
            if(i<3)j=i;
            if(res)res = ' ' + res;
            res = _num_.substr(i-j,j) + res;
        }
        if(z==-1)res = '-'+res;
        if(_num_!==num){
            _num_ = num.substr(_num_.length+1)
            res+=(sep||',')+_num_;//(_num_.length<3 ? _num_ : _num_.replace(/(\w{3})/g,'$1 '))
       }
    }
    return res
}

function formatLong(num) {
    return formatNumber(num)
    // было 123456,789
    // будет 123 456
    // require numeral.js
    if (num == +num) {//fix:округляем
        mum = +num;
        num = Math.round(num);
    }
    return numeral(num).format("0,0");
}

// TODO : заменить одной функцией
formatSearchNum = formatLong;

function formatDouble1(num) {
    // было 123456,789
    // будет 123 456,7
    return formatNumber(num,1)
    // require numeral.js
    if (num == +num) {//fix:округляем
        mum = +num;
        num = Math.round(num * 10) / 10;
    }
    return numeral(num).format("0,0.[0]");
}

function formatDouble2(num) {
    // было 123456,789
    // будет 123 456,78
    // require numeral.js
    return formatNumber(num,2)
    if (num == +num) {//fix:округляем
        mum = +num;
        num = Math.round(num * 100) / 100;
    }
    return numeral(num).format("0,0.[00]");
}

function formatDouble3(num) {
    // было 123456,789
    // будет 123 456,789
    // require numeral.js
    return formatNumber(num,3)
    if (num == +num) {
        mum = +num;
        num = Math.round(num * 1000) / 1000;
    }
    return numeral(num).format("0,0.[000]");
}

function formatDoubleExtended(num, roundSize, roundMode) {
    var val = 0,
        multiplier,
        method,
        floatFormatter;

    switch (roundSize) {
        case 0: {
            multiplier = 1;
            floatFormatter = "";
            break;
        }
        case 1: {
            multiplier = 10;
            floatFormatter = ".[0]";
            break;
        }
        case 2:
        default: {
            multiplier = 100;
            floatFormatter = ".[00]";
            break;
        }
    }

    switch (roundMode) {
        case "floor":  
        case "ceil": {
            method = roundMode;
            break;
        }
        case "default":
        default: {
            method = "round";
            break;
        }
    }

    val = Math[method](num * multiplier) / multiplier;

    val = numeral(val).format("0,0" + floatFormatter);

    return val;
}

function test_formatDoubleExtended() {
    var arr = [
        {
            num: 12345.6789,
            roundSize: 0,
            roundMode: "ceil",
            res: "12 346"
        },
        {
            num: 12345.6789,
            roundSize: 0,
            roundMode: "floor",
            res: "12 345"
        },
        {
            num: 12345.6789,
            roundSize: null,
            roundMode: "aaa",
            res: "12 345,68"
        },
        {
            num: 12345.6789,
            roundSize: 1,
            roundMode: "floor",
            res: "12 345,6"
        },
        {
            num: 12345.6789,
            roundSize: 1,
            roundMode: "ceil",
            res: "12 345,7"
        },
        {
            num: 12345.6789,
            roundSize: 2,
            roundMode: "floor",
            res: "12 345,67"
        },
        {
            num: 12345.6789,
            roundSize: 2,
            roundMode: "ceil",
            res: "12 345,68"
        },
        {
            num: 12345.123,
            roundSize: 0,
            roundMode: "ceil",
            res: "12 346"
        },
        {
            num: 12345.123,
            roundSize: 0,
            roundMode: "floor",
            res: "12 345"
        }
    ]

    var str = "",
        res;
    jQuery.each(arr, function (i, item) {
        str = "";

        res = formatDoubleExtended(item.num, item.roundSize, item.roundMode);

        str += (item.res === res);
        str += " :";
        str += " num=" + item.num;
        str += " roundSize=" + item.roundSize;
        str += " roundMode=" + item.roundMode;
        str += " res=" + res;

        consoleDebug(str);
    })
}

function formatSearchTime(time) {
    var res = "";
    var u = getTimeUnits(time);
    if (u.seconds < 0.01) {
        res = "менее 0,01 сек"
    } else {
        res = u.seconds.toString().replace(/\./, ",") + " сек"
    }

    return res
}


function formatDurationTime(time) {
    var res = "";
    var u = getTimeUnits(time);
    if (u.d) {
        res += u.d + "&nbsp;д ";
    }
    if (u.h) {
        res += u.h + "&nbsp;ч ";
    }
    if (u.m) {
        res += u.m + "&nbsp;м ";
    }
    if (u.s) {
        res += u.s + "&nbsp;с";
    }
    if (res == "") {
        res = "менее 1&nbsp;с";
    }

    return res;
}


function getTimeUnits(time) {
    var t = parseFloat(time),
        s = 0,
        m = 0,
        h = 0,
        d = 0,
        seconds = 0;

    if (!isNaN(t)) {
        t = t / 10;
        t = Math.round(t);
        t = t / 100;
        seconds = t;

        if (t > 60) {
            m = Math.floor(t / 60);

            if (m > 60) {
                h = Math.floor(m / 60);
                m = m - h * 60;

                if (h > 24) {
                    d = Math.floor(h / 24);
                    h = h - d * 24;
                }
            }
        }
        s = Math.round(seconds - d * 86400 - h * 3600 - m * 60);
    }

    return {
        s: s,
        m: m,
        h: h,
        d: d,
        seconds: seconds
    }
}

function winOpen(url, w, h) {
    winOpen2(url, "", w, h)
}

function winOpen2(url, name, w, h) {
    var winl = (screen.width - w) / 2;
    var wint = (screen.height - h) / 2;
    var winprops = 'toolbar=0,location=0,status=0,menubar=0,resizable=1,scrollbars=1,height=' + h + ',width=' + w + ',top=' + wint + ',left=' + winl;
    return window.open(url, name, winprops);
}

function winOpen3(url, name, w, h) {
    var winl = (screen.width - w) / 2;
    var wint = (screen.height - h) / 2;
    var winprops = 'toolbar=1,location=1,status=1,menubar=1,resizable=1,scrollbars=1,height=' + h + ',width=' + w + ',top=' + wint + ',left=' + winl;
    return window.open(url, name, winprops);
}

function winOpen4(url) {
    //    alert(url);
    var winprops = 'toolbar=1,location=1,status=1,menubar=1,resizable=1,scrollbars=1';
    return window.open(url, "", winprops);
}

function winOpen5(url, name) {
    //    alert(url);
    var winprops = 'toolbar=1,location=1,status=1,menubar=1,resizable=1,scrollbars=1';
    return window.open(url, name, winprops);
}

function winOpenInNewTab(url) {
    return window.open(url);
}




function getEnding(word, num, type) {
    // выбирается окончание для word в зависимости от num
    // word - только основа слова без окончания!
    // type позволяет выбирать разные окончания для разных типов слов
    // при необходимости дописать другие типы
    // type = 1 для word типа "результат"
    // type = 2 для word типа "секунда" , "минута"
    // type = 3 для word типа "неделя"
    // type = 4 для word типа "месяц"

    // type = "день" для слова "день" - день склоняется с чередованием букв, удобнее сделать специальный тип

    var last = num % 10;
    var ending = "";

    // для 5-20, 25-30, 35-40 и т.д.
    switch (type) {
        case 1: {
            ending = "ов"
            break
        }
        //        case 2:{
        //            ending = ""
        //            break
        //        }
        //        case 3:{
        //            ending = "ь"
        //            break
        //        }
        //        case 4:{
        //            ending = "ев"
        //            break
        //        }
        //        case "день":{
        //            ending = "дней"
        //            break
        //        }
    }

    if (num < 10 || num > 20) {
        if (last == 1) {
            // для 1, 21, 31 и т.д. кроме 11
            switch (type) {
                case 1: {
                    ending = ""
                    break
                }
                //                case 2:{
                //                    ending = "а"
                //                    break
                //                }
                //                case 3:{
                //                    ending = "я"
                //                    break
                //                }
                //                case 4:{
                //                    ending = ""
                //                    break
                //                }
                //                case "день":{
                //                    ending = "день"
                //                    break
                //                }
            }
        } else if (last == 2 || last == 3 || last == 4) {
            // для 2, 3, 4, 22, 23, 24, 32, 33, 34 и т.д. кроме 12,13,!4
            switch (type) {
                case 1: {
                    ending = "а"
                    break
                }
                //                case 2:{
                //                    ending = "ы"
                //                    break
                //                }
                //                case 3:{
                //                    ending = "и"
                //                    break
                //                }
                //                case 4:{
                //                    ending = "а"
                //                    break
                //                }
                //                case "день":{
                //                    ending = "дня"
                //                    break
                //                }
            }
        }
    }
    return word + ending
}

function escapeHTMLQuotes(str) {
    if (str) {
        return ("" + str).replace(/&quot;/gi, "&amp;quot;").replace(/&apos;/gi, "&amp;apos;")
    } else {
        return ""
    }
}

function unEscapeHTMLQuotes(str) {
    if (str) {
        return ("" + str).replace(/&quot;/gi, "\"").replace(/&apos;/gi, "\'");
    } else {
        return ""
    }
}

function escapeQuotesByHTML(str) {
    if (str) {
        return ("" + str).replace(/"/g, "\\&quot;").replace(/'/g, "\\&apos;")
    } else {
        return ""
    }
}

function escapeQuotesByHTML2(str) {
    if (str) {
        return ("" + str).replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    } else {
        return ""
    }
}

function escapeQuotes(str) {
    if (str) {
        return ("" + str).replace(/"/g, "\\\"").replace(/'/g, "\\\'")
    } else {
        return ""
    }
}

function unEscapeQuotes(str) {
    if (str) {
        return ("" + str).replace(/\\"/g, "\"").replace(/\\'/g, "\'")
    } else {
        return ""
    }
}

function setCookie(name, value, expires, path, domain, secure) {                     //  запись кукисов
    document.cookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function getCookie(name) {                                                       //  чтение кукисов
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) {
            break;
        }
    }
    return null;
}

function getCookieVal(offset) {                                                  //  чтение строки параметра кукиса
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
}

KCookie =  function(key, value, options) {
    /**from Klaus Hartl jQ */
    // key and at least value given, set cookie...
    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
        options = Object.assign({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

    var pairs = document.cookie.split('; ');
    for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
        if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
    }
    return null;
};

// Для совместимости (чтобы не переписывать в плагинах)
if(typeof jQuery === 'function')jQuery.cookie = KCookie;

function escapeNameForId(name) {
    try {
        return name.replace(new RegExp('[^A-Za-zА-Яа-яёЁ0-9_]', 'g'), "_")
    } catch (e) {
        return name.replace(/\W/g, "_")
    }

}

function escapeEM(text) {
    return ("" + text).replace(/<em>|<\/em>/g, "")
}

function escapeWinName(name) {
    return name.replace(/\W/g, "_")
}


/**
 *
 * Base64 encode/decode
 * http://www.webtoolkit.info
 *
 **/

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    //метод для кодировки в base64 на javascript
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    //метод для раскодировки из base64
    decode: function (input) {
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
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // метод для кодировки в utf8
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;

    },

    //метод для раскодировки из urf8
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

var ajaxContextPath = "";
function setAjaxContextPath(str) {
    if (typeof str === "string") {
        ajaxContextPath = str;
        if (!ajaxContextPath.match(/\/$/)) {
            ajaxContextPath += "/";
        }
    }
}
function isOwnDomen() {
    return ajaxContextPath === "" || ajaxContextPath.indexOf(/bigs/)!==-1;
}

var LoadData = function (opt, self) {
    // this.XMLHttpId = this.XMLHttpId || 0;
    var A = arguments;
    var xmlhttp = new XMLHttpRequest();
    var _ = {
        url: '',
        params: null,
        onload: console.log,
        onerror: console.error,
        self: xmlhttp,
        metod: 'POST',
        dataType: "json"
    }
    var onError = function (xmlhttp, err) {
        var data = xmlhttp.responseText;
        try {
            if (_.dataType === 'json') data = data !== '' ? JSON.parse(data) : null;
        } catch (err) {
            data = xmlhttp.responseText || null;
        }
        if (_.onerror === true) _.onload.call(_.self, data, _, xmlhttp);
        else _.onerror.call(_.self, data, xmlhttp, xmlhttp.status);
        // console.error('error load data', _.url,_.params,xmlhttp,err);
        consoleDebug("Error in " + _.url);
        if (err && err.stack) {
            consoleDebug(err.stack);
        } else if (err) {
            consoleDebug(err);
        }
    }
    if (typeof A[0] === 'object') {
        _ = Object.assign(_, A[0]);
        if (typeof A[1] === 'object' && typeof A[0].self !== 'object') _.self = A[1];
    } else {
        _.url = A[0];
        _.params = A[1];
        if (typeof A[2] === 'function') _.onload = A[2];
        if (typeof A[3] === 'function') _.onerror = A[3];
        if (A[3] === true) _.onerror = A[3];//Вызывает калбэк и передает null
        if (typeof A[A.length - 1] === 'object') _.self = A[A.length - 1];
    }
    try {
        if (typeof _.params === "object" && _.params != null) _.params = JSON.stringify(_.params);

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    if (xmlhttp.readyState === 4) {//Complete  
                        var data = xmlhttp.responseText;
                        try {
                            if (_.dataType === 'json') data = data !== '' ? JSON.parse(data) : null;

                        } catch (err) {
                            onError(xmlhttp, err);
                            return;
                        }
                        _.onload.call(_.self, data, _, xmlhttp);
                    }
                } else {
                    onError(xmlhttp)
                }
            }
        }
        var urlpref = window.ajaxContextPath || '';
        if(urlpref && (_.url[0]==='/' || _.url.indexOf('http')===0) )urlpref = '';
        if (urlpref && urlpref[urlpref.length - 1] !== '/') urlpref += '/';
        xmlhttp.open(_.metod, urlpref + _.url, true);
        switch(_.dataType){
            case 'json' :
            xmlhttp.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01')
            xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
            break;
            default:
            xmlhttp.setRequestHeader('Accept', '*/*')
            xmlhttp.setRequestHeader('Content-Type', 'text/html; charset=utf-8')
        }
        
        //if(options.file) xhr.setRequestHeader("X_FILENAME", options.file.name); 
       // if (_.metod === 'GET')
        //    xmlHttp.send(null); 
        //else
            xmlhttp.send(_.params);
    } catch (err) {
        onError(xmlhttp, err)
    }
}

var LoadMultiData = function (/*list,defaultPar, onload, merge, self*/) {
    var A = arguments, l=A.length-1;
    var self = l>=2 && typeof A[l]==='object' ? A[l--] : null;
    var list, defaultPar, onload, merge, self;
    for(var i=0; i<=l;i++){
        switch(typeof A[i]){
            case 'object':
                if(Array.isArray(A[i]))list = A[i];
                else defaultPar =  A[i];
            break;
            case 'string':
                if(!onload)defaultPar = {url : A[i]};
                else merge =  A[i];
            break;
            case 'function':
                if(!onload){
                    onload =  A[i];
                    break;
                }
            default:
                merge =  A[i];
        }
    }
    if(defaultPar)list = list&&list.map(function(d){
        var p = Object.assign({},defaultPar);
        p.params = Object.assign({},p.params,d);
        return p;
    }) || [defaultPar];

    var loaded = list&&list.length || 0;
    var data = [];
    var result = [];
    var onall = function () {
        if (typeof merge !== 'undefined') {
            onload.call(self, _MG_.apply(null, data.concat(merge)), result);
        } else {
            onload.call(self, data, result);
        }
    }
    if(loaded === 0)return onall();
    var cb = function (d, _) {
        loaded--;
        data[_.index] = d;
        result[_.index] = Object.assign({},_,{/*response: d,*/ result: d});
        if (loaded === 0) onall();
    }
    data.length = result.length = loaded;
    for (var i = 0, l = loaded, item; i < l; i++) {
        item = {};

        data[i] = item;
        result[i] = {};
        LoadData(Object.assign({}, list[i], { onload: cb, onerror: true, index: i }))
    }
}


function jqAjaxJson() {
    var url = arguments[0];
    if(ajaxContextPath && url[0]!=='/'&&url.indexOf('http')!==0)url = ajaxContextPath + url;
    var data = arguments[1];
    var success = arguments[2];
    var error = arguments[3];
    //    consoleDebug("jqAjaxJson send " + url);
    jQuery.ajax({
        url: url,
        dataType: "json",
        type: "POST",
        data: (typeof data == "string") ? data : JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        cache: false,
        success: function (data, st) {
            //            consoleDebug("jqAjaxJson result " + url);
            if (typeof (success) === 'function') {
                success(data, st)
            }
        },
        error: function (xhr, st, err) {
            if (typeof (error) === 'function') {
                error(xhr, st, err)
            } else {
                showErrorNotification("Ошибка.")
            }

            consoleDebug("Error in " + url);

            if (err.stack) {
                consoleDebug(err.stack);
            } else if (st) {
                consoleDebug(st);
            }
        }
    })
}

function jqAjaxFileAsText() {
    var fileName = arguments[0];
    var data = arguments[1];
    var success = arguments[2];
    var error = arguments[3];
    jQuery.ajax({
        url: ajaxContextPath + fileName,
        type: "GET",
        //        data:  (typeof data == "string") ? data : JSON.stringify(data),
        contentType: 'text/html; charset=utf-8',
        cache: false,
        success: function (data, st) {
            if (typeof (success) === 'function') {
                success(data, st)
            }
        },
        error: function (xhr, st, err) {
            if (typeof (error) === 'function') {
                error(xhr, st, err)
            } else {
                showErrorNotification("Ошибка загрузки файла \"" + fileName + "\".")
            }

            if (err.stack) {
                consoleDebug(err.stack);
            } else if (st) {
                consoleDebug(st);
            }
        }
    })
}

var FILLED_VALUE_INDENT = "<span class='indent'>&nbsp;&nbsp;&nbsp;&nbsp;</span>";

var Filled = {

    INDENT: "<span class='indent'>&nbsp;&nbsp;&nbsp;&nbsp;</span>",

    indents: {},

    getIndent: function (level) {
        var indent = "";

        if (!isNaN(level) && level != 0) {
            indent = Filled.indents[level];
            if (!indent) {
                indent = "";
                for (var i = 0; i < level; i++) {
                    indent += Filled.INDENT;
                }
                Filled.indents[level] = indent;
            }
        }

        return indent;
    },

    replaceCatalogIdsWithNames: function (text, idsForLoad, callback) {
        if (idsForLoad && idsForLoad.length > 0) {
            getCatalogsByIds(idsForLoad, null,
                function (data) {
                    if (data && data.catalogs) {
                        jQuery.each(data.catalogs, function (i, catData) {
                            text = text.split(catData.id).join(catData.name)
                        })
                    }
                    callback(text);
                },
                function (xhr, st, er) {
                    callback(text);
                }
            )

        } else {
            callback(text);
        }
    }

}

function getFilledRequest(req, schedules, attributes, level, params) {
    //    var r = getFilledRequest2({ // todo  перейти на новую версию
    //        request : req,
    //        schedules : schedules,
    //        attributes : attributes
    //    })
    //
    //    return {
    //        str : r.str,
    //        html : r.element,
    //        request : r.request
    //    }

    var request = req;
    if (typeof (req) === "string") {
        try {
            request = JSON.parse(decodeURIsafe(req));
        } catch (e) {
            request = null;
        }
    }

    level = level || 0;

    var INDENT_AT_LEVEL_0 = Filled.getIndent(level);
    var INDENT_AT_LEVEL_1 = Filled.getIndent(level + 1);

    var str = "";
    var html = "";
    var idsForLoad = [];
    var v, s, op, type, query, sQuery, bundleComment;
    var partOfMultiquery;

    var addSearchWord = (params) ? !params.notSearchWord : false;

    if (!addSearchWord) {
        INDENT_AT_LEVEL_1 = INDENT_AT_LEVEL_0;
    }

    if (request) {
        request = request.request || request;

        if (request.linkValue) {

        } else if (request.type === "MULTIQUERY" && request.multiqueryRequest && request.multiqueryRequest.queryRequests) {
            request.multiqueryRequest.queryRequests.forEach( function ( queryRequest, i) {
                s = "";
                if (queryRequest.operator === "OR") {
                    s += "ИЛИ ";
                } else if (i > 0) {
                    s += "И ";
                }
                if (queryRequest.not) {
                    s += "НЕ ";
                }

                if (queryRequest.type == Data.multiqueryTypes.Q || !queryRequest.type /* dictionary */) {
                    partOfMultiquery = null;
                    try {
                        partOfMultiquery = jQuery.extend(
                            true,
                            {},
                            JSON.parse(decodeURIsafe(queryRequest.request)),
                            {
                                groups: null,
                                dateFrom: null,
                                dateTo: null
                            }
                        )
                    } catch (_) { }
                    v = getFilledRequest(partOfMultiquery, null, null, level + 1, params);
                    str += s + v.str + " ";

                    if (s != "") {
                        s = "<div class='filled__oneFieldRequest'>" + s + "</div>";
                    }
                    html += s + v.html;
                    idsForLoad = idsForLoad.concat(v.idsForLoad);
                } else {
                    str += s + queryRequest.queryId + " ";
                    html += "<div class='filledValue0'>" + s + " по категории \"" + queryRequest.queryId + "\"</div>";
                    idsForLoad.push(queryRequest.queryId);
                }
            })
        } else if (request.mode === "EXTENDED") {
            if (request.byTypes) {
                // поиск по типам
                if (request.typeRequests[0]) {
                    if (addSearchWord) {
                        str += "Искать: ";
                        html += INDENT_AT_LEVEL_0 + "<strong>Искать: </strong>";
                    }
                    str += request.typeRequests[0].query + " по типу: " + request.typeRequests[0].name;
                    html += "<div class='filledValue0'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(request.typeRequests[0].query) + " <strong> по типу: </strong>" + replaceAngleBrackets(request.typeRequests[0].name) + "</div>";
                }
            } else {
                // атрибутивный поиск
                var extFieldStr = "";
                request.typeRequests.forEach( function (extType,i) {
                    if (i > 0) {
                        str += "; "
                        html += "";

                        switch (extType.typesMode) {
                            case "OR": {
                                str += "\"ИЛИ\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "\"ИЛИ\" </div>";
                                break;
                            }
                            case "AND_NOT": {
                                str += "\"И НЕТ\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "\"И НЕТ\" </div>";
                                break;
                            }
                            case "AND":
                            default: {
                                str += "\"И\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "\"И\" </div>";
                                break;
                            }
                        }
                    }
                    if (extType.name != "common") {
                        str += extType.name + ": ";
                        html += INDENT_AT_LEVEL_0 + "<strong>" + replaceAngleBrackets(extType.name) + ":</strong><div class='filledValue0'>"
                    }

                    if (isTextOK(extType.query)) {
                        try {
                            if (extType.operator) {
                                op = SearchTemplate.operators[extType.operator] + " "
                            } else {
                                op = ""
                            }
                        } catch (_) {
                            op = ""
                        }
                        str += "Все поля: " + op + extType.query;
                        html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "Все поля: " + op + replaceAngleBrackets(extType.query) + "</div>";

                    } else if ((extType.fieldRequests && extType.fieldRequests.length > 1)
                        || (extType.fieldRequestGroups && extType.fieldRequestGroups.length > 1)) {
                        switch (extType.mode) {
                            case "OR": {
                                str += "Режим поиска между атрибутами: \"ИЛИ\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "Режим поиска между атрибутами: \"ИЛИ\" </div>";
                                break;
                            }
                            case "AND_NOT": {
                                str += "Режим поиска между атрибутами: \"И НЕТ\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "Режим поиска между атрибутами: \"И НЕТ\" </div>";
                                break;
                            }
                            case "AND":
                            default: {
                                str += "Режим поиска между атрибутами: \"И\"";
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + "Режим поиска между атрибутами: \"И\" </div>";
                                break;
                            }
                        }
                    }


                    if (extType.fieldRequests) {
                        jQuery.each(extType.fieldRequests, function (j, extField) {
                            if (j > 0) {
                                str += ", ";
                            }
                            extFieldStr = getFilledField(extType.name, extField, null, false).str;
                            str += extFieldStr;
                            html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(extFieldStr);
                            html += "</div>";
                        })
                    }

                    if (extType.fieldRequestGroups) {
                        var mode;
                        jQuery.each(extType.fieldRequestGroups, function (j, fieldRequestGroup) {
                            if (fieldRequestGroup.fieldRequests && fieldRequestGroup.fieldRequests.length > 0) {
                                switch (fieldRequestGroup.mode) {
                                    case "OR": {
                                        mode = " ИЛИ ";
                                        break;
                                    }
                                    case "AND": {
                                        mode = " И ";
                                        break;
                                    }
                                    default: {
                                        mode = ", ";
                                    }
                                }
                                html += "<div class='filled__oneFieldRequest'>" + INDENT_AT_LEVEL_1;
                                jQuery.each(fieldRequestGroup.fieldRequests, function (k, extField) {
                                    if (k > 0) {
                                        str += mode;
                                        html += mode;
                                    }
                                    extFieldStr = getFilledField(extType.name, extField, null, false).str;
                                    str += extFieldStr;
                                    html += replaceAngleBrackets(extFieldStr);
                                })
                                html += "</div>";
                            }
                        })
                    }
                    //                    html += "</div>"
                })
            }

        } else if (request.mode == "DICTIONARY") {
            // поиск по словарю
            if (request.dictionaryName) {
                str += "По словарю " + request.dictionaryName;
                html += INDENT_AT_LEVEL_0 + "<strong>По словарю: </strong>";
                html += "<div class='filledValue0 dictionarySearch'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(request.dictionaryName) + "</div>";

            } else if (request.dictionaryElementIDs) {
                str += "По элементам словаря " + request.dictionaryElementIDs.join(", ");
                html += INDENT_AT_LEVEL_0 + "<strong>По элементам словаря: </strong>";
                html += "<div class='filledValue0'>" + INDENT_AT_LEVEL_1 + request.dictionaryElementIDs.join(",<br />") + "</div>";
            }

        } else {
            // простой поиск
            if (addSearchWord) {
                str += "Искать: ";
                html += INDENT_AT_LEVEL_0 + "<strong>Искать: </strong>";
            }

            if (request.type && Data.simpleSearchTypes[request.type]) {
                type = ", " + Data.simpleSearchTypes[request.type];
            } else {
                type = "";
            }
            if (request.simpleSearchFieldsBundle) {
                bundleComment = ", \"" + Data2.getBundleCommentByName(request.simpleSearchFieldsBundle) + "\"";
            } else {
                bundleComment = "";
            }

            str += (request.query || '') + type + bundleComment;
            html += "<div class='filledValue0'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(request.query || '') + type + bundleComment + "</div>";
        }

        if (request.nestedQuery) {
            v = getFilledRequest(request.nestedQuery, null, null, level + 1, params);
            idsForLoad = idsForLoad.concat(v.idsForLoad);
            str += ", область поиска: " + v.str;
            html += INDENT_AT_LEVEL_0 + "<strong>Область поиска: </strong>";
            html += "<div class='filledValue0 nestedQuery'>" + v.html + "</div>";
        }


        // группировка
        if (request.groupField) {
            try {
                v = Data.getGroupedField(request.groupField).comment
            } catch (_) {
                v = request.groupField
            }
            str += ", Группировать по: " + v;
            html += INDENT_AT_LEVEL_0 + "<strong>Группировать по: </strong>";
            html += "<div class='filledValue0'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(v) + "</div>";
        }

        // сортировка
        if (request.sortField && request.sortField != "score") {
            try {
                v = Data.getSortedField(request.sortField).comment
            } catch (_) {
                v = request.sortField
            }
            str += ", Сортировать по: " + v;
            html += INDENT_AT_LEVEL_0 + "<strong>Сортировать по: </strong>";
            html += "<div class='filledValue0'>" + INDENT_AT_LEVEL_1 + replaceAngleBrackets(v) + "</div>";
        }

        // фильтрация по фасетам
        if (request.filter && request.filter.length > 0) {
            str += ", Фильтровать по: ";
            html += INDENT_AT_LEVEL_0 + "<strong>Фильтровать по: </strong>";
            html += "<div class='filledValue0'>";

            var facets = {};
            jQuery.each(request.filter, function (i, elem) {
                if (!facets[elem.field]) {
                    facets[elem.field] = []
                }
                facets[elem.field].push(elem)
                //                str += " " + elem.query;
                //                html += " " + elem.query;
            })

            var ii = 0
            jQuery.each(facets, function (i, facet) {
                if (ii > 0) {
                    str += "; "
                    html += ";"
                }
                ii++
                jQuery.each(facet, function (j, filter) {
                    if (j > 0) {
                        str += ", "
                        html += ", "
                    }
                    str += filter.query;
                    html += INDENT_AT_LEVEL_1 + replaceAngleBrackets(filter.query);
                })
            })
            html += "</div>"
        }

        if (request.joinFrom && request.joinTo) {
            str += ", Фильтровать по связи: ";
            html += INDENT_AT_LEVEL_0 + "<strong>Фильтровать по связи: </strong>";
            html += "<div class='filledValue0'>";

            var v = Data.allFieldsByName[request.joinFrom];
            var text = "";
            if (v) {
                text += v.comment + " (";
                if (v.common) {
                    text += "общий атрибут"
                } else {
                    text += v.__typeName;
                }
                text += ") ";

            } else {
                text += request.joinFrom;
            }

            str += text + "к ";
            html += INDENT_AT_LEVEL_1 + text + getArrowRight() + " ";

            text = "";
            v = Data.allFieldsByName[request.joinTo];
            if (v) {
                text += v.comment + " (";
                if (v.common) {
                    text += "общий атрибут"
                } else {
                    text += v.__typeName;
                }
                text += ")";

            } else {
                text += request.joinTo;
            }

            str += text;
            html += text;

            html += "</div>"
        }

        var indexes = getFilledIndexes({
            groups: request.groups,
            dateFrom: request.dateFrom,
            dateTo: request.dateTo
        }, level);
        if (indexes.str != "") {
            str += ", "
            str += indexes.str;
            html += indexes.html;
        }

        if (request.customFilters && request.customFilters.length > 0) {
            var customFilters = getFilledCustomFilters(request.customFilters, level);
            if (customFilters.str != "") {
                //                str += ", "
                str += customFilters.str;
                html += customFilters.html;
            }
        }
    }

    var filledSchedules = getFilledSchedules(schedules, level);
    if (filledSchedules.str != "") {
        if (str != "") {
            str += ", "
        }
        str += "регламент выполнения: " + filledSchedules.str
        html += INDENT_AT_LEVEL_0 + "<strong>Регламент выполнения: </strong>" + filledSchedules.html
    }

    if (attributes) {
        var L = attributes.length;
        if (L > 0) {
            str += ", Дополнительно";
            html += INDENT_AT_LEVEL_0 + "<strong>Дополнительно: </strong>";
            html += "<div class='filledValue0'>"
            for (var i = 0; i < L; i++) {
                if (attributes[i]) {
                    if (i > 0) {
                        str += ", "
                        html += ",<br />"
                    }

                    try {
                        v = Data.allFieldsByName[attributes[i].name].comment
                    } catch (_) {
                        v = attributes[i].name
                    }
                    str += v + ": " + attributes[i].value;
                    html += INDENT_AT_LEVEL_1 + replaceAngleBrackets(v + ": " + attributes[i].value);
                }
            }
            html += "</div>";
        }
    }

    return {
        str: str,
        html: html,
        request: request,
        idsForLoad: idsForLoad
    }
}

function getFilledSchedules(schedules, level) {
    if (!level) {
        level = 0;
    }
    var INDENT_AT_LEVEL_1 = Filled.getIndent(level + 1);

    var str = "", html = "";
    if (schedules && schedules.length > 0) {
        var valueArr, increment, ii, L, pos, valueArrAtPos, textStr;
        html += "<div class='filledValue0'>"
        jQuery.each(schedules, function (i, shedule) {
            valueArr = shedule.split(" ");
            pos = null;
            for (ii = 0, L = valueArr.length; ii < L; ii++) {
                if (valueArr[ii].indexOf("/") != -1) {
                    pos = ii;
                }
            }
            if (i > 0) {
                str += ", "
                html += ",<br />"
            }
            if (pos != null) {
                textStr = ""
                valueArrAtPos = valueArr[pos].split("/")
                switch (pos) {
                    case 0: {
                        textStr += "Каждые " + valueArrAtPos[1] + " секунд"
                        break
                    }
                    case 1: {
                        textStr += "Каждые " + valueArrAtPos[1] + " минут"
                        break
                    }
                    case 2: {
                        textStr += "Каждые " + valueArrAtPos[1] + " часов"
                        break
                    }
                    case 3: {
                        textStr += "Каждые " + valueArrAtPos[1] + " дней"
                        if (valueArr[1] != "" && valueArr[2] != "") {
                            textStr += " в " + valueArr[2] + ":" + valueArr[1]
                        }
                        break
                    }
                    case 5: {
                        textStr += "Каждые " + valueArrAtPos[1] + " недель"
                        switch (valueArrAtPos[0]) {
                            case "MON": {
                                textStr += " по понедельникам"
                                break
                            }
                            case "TUE": {
                                textStr += " по вторникам"
                                break
                            }
                            case "WED": {
                                textStr += " по средам"
                                break
                            }
                            case "THU": {
                                textStr += " по четвергам"
                                break
                            }
                            case "FRI": {
                                textStr += " по пятницам"
                                break
                            }
                            case "SAT": {
                                textStr += " по субботам"
                                break
                            }
                            case "SUN": {
                                textStr += " по воскресеньям"
                                break
                            }
                        }
                        if (valueArr[1] != "" && valueArr[2] != "") {
                            textStr += " в " + valueArr[2] + ":" + valueArr[1]
                        }
                        break
                    }
                    case 4: {
                        textStr += "Каждые " + valueArrAtPos[1] + " месяцев"
                        if (valueArr[3] != "") {
                            textStr += " " + valueArr[3] + " числа"
                        }
                        if (valueArr[1] != "" && valueArr[2] != "") {
                            textStr += " в " + valueArr[2] + ":" + valueArr[1]
                        }
                        break
                    }
                }
                str += textStr
                html += INDENT_AT_LEVEL_1 + textStr
            } else {
                str += shedule
                html += INDENT_AT_LEVEL_1 + shedule
            }
        })
        html += "</div>"
    }

    return {
        str: str,
        html: html
    }
}


function getFilledDictionaryElements(dictionaryName, limit, level, callback) {
    new FillDictionaryElements(dictionaryName, limit, level, callback);
}


var FillDictionaryElements = function (dictionaryName, limit, level, callback) {

    this.dictionaryName = dictionaryName;
    this.limit = limit;
    this.level = level;
    this.callback = callback;
    this.dictionaryName = null;

    this.str = "";
    this.html = "";
    this.isExceed = false;

    this.ROWS = 50;
    this.ORDER = "desc";
    this.SORT_FIELD = "VALUE";

    this.get();
}

FillDictionaryElements.prototype = {

    get: function () {

        this.load(0);
    },

    load: function (start) {
        var _this = this;
        var childrenParams = {
            start: start,
            order: _this.ORDER,
            sortField: _this.SORT_FIELD,
            rows: _this.ROWS
        }
        DictionariesCore.getDictionary(this.dictionaryName, childrenParams, function (data) {
            if (data && data.dictionarySimpleElements) {
                _this.addElements(data.dictionarySimpleElements, _this.level);

                if (!_this.isExceed && data.totalElement > _this.start + _this.ROWS) {
                    _this.load(_this.start + _this.ROWS);

                } else {
                    _this.finish();
                }

            } else {
                _this.finish();
            }
        })
    },

    addElements: function (elements, level) {
        var _this = this,
            previousHasChildren = false,
            value;

        _this.html += "<div class='filledDictionaryElements'>";

        jQuery.each(elements, function (i, element) {
            if (i > 0 && !previousHasChildren) {
                _this.str += ", ";
                _this.html += "<br/>";
            }

            _this.html += Filled.getIndent(level);

            switch (element.type) {
                case Data.dictionaryUtil.types.GROUP.name:
                case Data.dictionaryUtil.types.CONCEPT.name: {
                    if (element.type == Data.dictionaryUtil.types.GROUP.name) {
                        value = "Группа " + element.value;
                    } else {
                        value = element.value;
                    }

                    _this.str += value + ": (";
                    _this.html += "<strong>" + value + ": </strong><div class='filledDictionaryElements'>";

                    _this.addElements(element.terms, level + 1);

                    _this.str += ") ";
                    _this.html += "</div>";

                    previousHasChildren = true;
                    break;
                }
                case Data.dictionaryUtil.types.MULTIWORD.name:
                case Data.dictionaryUtil.types.SIMPLE.name:
                default: {
                    _this.str += element.value;
                    _this.html += element.value;

                    previousHasChildren = false;
                    break;
                }
            }

            if (_this.str.length > _this.limit) {
                _this.isExceed = true;
                return false;
            }
        })

        _this.html += "</div>";
    },

    finish: function () {
        if (this.isExceed) {
            this.html += "<div class='filledDictionaryElements'>...</div>";
        }
        this.callback({
            str: this.str,
            html: this.html,
            isExceed: this.isExceed
        })

        this.destroy();
    },

    destroy: function () {
        for (var k in this) {
            this[k] = null;
        }
    }


}


function preprocessingDate(query, sQuery, operator, isSelectable, path, type) {
    var res = {
        query: query,
        sQuery: sQuery,
        operator: operator,
        queryDelta: null,
        unit: null,
        text: null,
        htmlStr: null
    }

    var timeUnits, unit, suffix, q, sQ, operatorText;

    if (query) {
        q = query.toUpperCase();
    }
    if (sQuery) {
        sQ = sQuery.toUpperCase();
    }

    switch (!0) {
        case (operator == "B" && !!q && (q.indexOf("NOW") != -1) && !!sQ): {
            var queryPath = null, sQueryPath = null;

            var qIsNow = (q == "NOW");
            var sqIsNow = (sQ == "NOW");
            var qHasMinus = (q.indexOf("-") != -1);
            var qHasPlus = (q.indexOf("+") != -1);
            var sqHasMinus = (sQ.indexOf("-") != -1);
            var sqHasPlus = (sQ.indexOf("+") != -1);
            var unitValue = (qIsNow) ? sQ : q;

            timeUnits = parseTimeUnits(unitValue);
            unit = timeUnits.unit;
            suffix = timeUnits.suffix;

            if (path) {
                queryPath = jQuery.merge([], path);
                queryPath.push("query");
                sQueryPath = jQuery.merge([], path);
                sQueryPath.push("sQuery");
            }

            res.query = q.replace(/[^0-9]/g, "");
            res.sQuery = sQ.replace(/[^0-9]/g, "");
            res.unit = unit;

            switch (!0) {
                case (qHasMinus && sqHasPlus): {
                    res.operator = "_B";
                    res.text = "в диапазоне до "
                        + res.query
                        + suffix
                        + " после "
                        + res.sQuery
                        + suffix;
                    res.htmlStr = "в диапазоне до "
                        + getOneFilledValueStr(res.query, "LONG", isSelectable, queryPath)
                        + suffix
                        + " после "
                        + getOneFilledValueStr(res.sQuery, "LONG", isSelectable, queryPath)
                        + suffix;
                    break
                }
                case (qIsNow && sqHasPlus): {
                    res.operator = "_G";
                    operatorText = SearchTemplate.getOperatorText(res.operator, type);
                    res.text = operatorText + " "
                        + res.sQuery
                        + suffix;
                    res.htmlStr = operatorText + " "
                        + getOneFilledValueStr(res.sQuery, "LONG", isSelectable, queryPath)
                        + suffix;
                    break
                }
                case (qHasPlus && sqHasPlus): {
                    res.operator = "_GB";
                    operatorText = SearchTemplate.getOperatorText(res.operator, type);
                    res.text = operatorText + " от "
                        + res.query
                        + suffix
                        + " до "
                        + res.sQuery
                        + suffix;
                    res.htmlStr = operatorText + " от "
                        + getOneFilledValueStr(res.query, "LONG", isSelectable, queryPath)
                        + suffix
                        + " до "
                        + getOneFilledValueStr(res.sQuery, "LONG", isSelectable, queryPath)
                        + suffix;
                    break
                }
                case (qHasMinus && sqIsNow): {
                    res.operator = "_L";
                    operatorText = SearchTemplate.getOperatorText(res.operator, type);
                    res.text = operatorText + " "
                        + res.query
                        + suffix;
                    res.htmlStr = operatorText + " "
                        + getOneFilledValueStr(res.query, "LONG", isSelectable, queryPath)
                        + suffix;
                    break
                }
                case (qHasMinus && sqHasMinus): {
                    res.operator = "_LB";
                    operatorText = SearchTemplate.getOperatorText(res.operator, type);
                    res.text = operatorText + " от "
                        + res.query
                        + suffix
                        + " до "
                        + res.sQuery
                        + suffix;
                    res.htmlStr = operatorText + " от "
                        + getOneFilledValueStr(res.query, "LONG", isSelectable, queryPath)
                        + suffix
                        + " до "
                        + getOneFilledValueStr(res.sQuery, "LONG", isSelectable, queryPath)
                        + suffix;
                    break
                }
            }
            break
        }
        case (operator == "GE" || operator == "LE"): {
            timeUnits = parseTimeUnits(q);
            unit = timeUnits.unit;
            suffix = timeUnits.suffix;

            if (unit == "") {
                q = fromIsoToStringDateTime(q, false, false);
                res.query = q;
                res.sQuery = "";
                res.text = q;
                res.htmlStr = q;

            } else {
                q = fromIsoToStringDateTime(q.substr(0, 18), false, false);
                sQ = query.substr(19).replace(/[^0-9]/g, "");

                res.query = q;
                res.sQuery = sQ;
                res.queryDelta = sQ;
                res.unit = unit;

                res.text = q + " " + sQ + suffix;
                res.htmlStr = q + " " + sQ + suffix;
            }
            break
        }
        default: {
            res.query = fromIsoToStringDateTime(query, false, false);
            if (sQuery) {
                res.sQuery = fromIsoToStringDateTime(sQuery, false, false);
            }
        }
    }

    return res
}

function parseTimeUnits(unitValue) {
    var unit = "", suffix = "";

    if (unitValue) {
        if (unitValue.match(/SECOND|SECONDS/)) {
            unit = SearchTemplate.DATE.units.SECONDS;
            suffix = " секунд";

        } else if (unitValue.match(/MINUTE|MINUTES/)) {
            unit = SearchTemplate.DATE.units.MINUTES;
            suffix = " минут";

        } else if (unitValue.match(/HOUR|HOURS/)) {
            unit = SearchTemplate.DATE.units.HOURS;
            suffix = " часов";

        } else if (unitValue.match(/DAY|DAYS|DATE/)) {
            unit = SearchTemplate.DATE.units.DAYS;
            suffix = " дней";
        }
    }

    return {
        unit: unit,
        suffix: suffix
    }
}



function getOneFilledValueStr(value, type, isSelectable, path) {
    var str = "";

    var cls = type;
    if (isSelectable) {
        cls += " SELECTABLE";
    }

    var attrStr = "";
    if (path) {
        attrStr = " oneFilledValueData='"
        attrStr += JSON.stringify({
            path: path,
            type: type
        })
        attrStr += "'";
    }

    str += "<span class='oneFilledValue' " + attrStr + "><span class='" + cls + "' type='" + type + "'>";
    str += replaceAngleBrackets(value);
    str += "</span></span>";

    return str
}

function getOneFilledValue(elem) {
    var d = null;
    try {
        d = JSON.parse(elem.attr("oneFilledValueData"));
    } catch (_) { }

    return d;
}



function getFilledRequest2(conf) {
    /*
    * conf.request
    * conf.schedules
    * conf.attributes
    * conf.partOfMultiquery - является ли этот request частью Multiquery
    * conf.path - путь указываестя для вложенных запросов
    * */

    var request = conf.request;
    if (typeof (request) == "string") {
        try {
            request = decodeURIsafe(request)
        } catch (e) {
        }
        try {
            request = JSON.parse(request)
        } catch (e) {
            request = null;
        }
    }

    var path = conf.path || [];

    var str = "";
    var outer, filledValue, oneFilledValue, _str, cls;
    var v, op, type, query, sQuery, bundleComment;
    var partOfMultiquery, uniqId;

    if (conf.partOfMultiquery) {
        cls = "filled-outer-part-of-multiquery";
    } else {
        cls = "filled-outer";
    }
    outer = jQuery("<div class='" + cls + "'/>")

    if (request) {
        request = request.request ? request.request : request;

        if (request.linkValue) {

        } else if (request.type == "MULTIQUERY" && request.multiqueryRequest && request.multiqueryRequest.queryRequests) {
            jQuery.each(request.multiqueryRequest.queryRequests, function (i, queryRequest) {
                if (queryRequest.operator == "OR") {
                    str += "ИЛИ, ";
                    outer.append("ИЛИ, ");
                } else {
                    str += "И, ";
                    outer.append("И, ");
                }
                if (queryRequest.not) {
                    str += "НЕ, ";
                    outer.append("НЕ, ");
                }
                if (queryRequest.type == Data.multiqueryTypes.Q || !queryRequest.type /* dictionary */) {
                    partOfMultiquery = null;
                    try {
                        partOfMultiquery = jQuery.extend(
                            true,
                            {},
                            JSON.parse(decodeURIsafe(queryRequest.request)),
                            {
                                groups: null,
                                dateFrom: null,
                                dateTo: null
                            }
                        )
                    } catch (_) {
                    }
                    v = getFilledRequest2({
                        request: partOfMultiquery,
                        partOfMultiquery: true
                    });
                    str += v.str + " ";
                    outer.append(v.element);
                } else {
                    str += "<span queryId='" + queryRequest.queryId + "' class='load-catalog'>" + queryRequest.queryId + "</span> ";
                    outer.append("<div queryId='" + queryRequest.queryId + "' class='load-catalog'>" + queryRequest.queryId + "</div>");
                }
            })
        } else if (request.mode == "EXTENDED") {
            if (request.byTypes) {
                // поиск по типам
                if (request.typeRequests[0]) {
                    str += "Искать: " + request.typeRequests[0].query + " по типу: " + request.typeRequests[0].name;

                    jQuery("<strong>Искать: </strong>")
                        .appendTo(outer)

                    oneFilledValue = getOneFilledValueStr(request.typeRequests[0].query, "TEXT", true, path.concat(["typeRequests", 0, "query"]));
                    jQuery("<div class='filledValue' ></div>")
                        .append(oneFilledValue)
                        .append("<strong> по типу: </strong>" + replaceAngleBrackets(request.typeRequests[0].name))
                        .appendTo(outer)

                }
            } else {
                // атрибутивный поиск
                var extFieldFilled = "", filledValueStr = "";
                jQuery.each(request.typeRequests, function (i, extType) {
                    if (i > 0) {
                        str += "; "

                        switch (extType.typesMode) {
                            case "OR": {
                                str += "\"ИЛИ\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>\"ИЛИ\" </div>";
                                break;
                            }
                            case "AND_NOT": {
                                str += "\"И НЕТ\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>\"И НЕТ\" </div>";
                                break;
                            }
                            case "AND":
                            default: {
                                str += "\"И\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>\"И\" </div>";
                                break;
                            }
                        }
                    }
                    if (extType.name != "common") {
                        str += extType.name + ": ";

                        jQuery("<strong>" + replaceAngleBrackets(extType.name) + ":</strong>")
                            .appendTo(outer)
                    }

                    filledValueStr = "<div class='filledValue' >";

                    if (extType.query != undefined && extType.query != null) {
                        try {
                            if (extType.operator) {
                                op = SearchTemplate.operators[extType.operator] + " "
                            } else {
                                op = ""
                            }
                        } catch (_) {
                            op = ""
                        }
                        str += "Все поля: " + op + extType.query;

                        filledValueStr += "Все поля: " + op + getOneFilledValueStr(extType.query, "TEXT", true, path.concat(["typeRequests", i, "query"]));


                    } else if ((extType.fieldRequests && extType.fieldRequests.length > 1)
                        || (extType.fieldRequestGroups && extType.fieldRequestGroups.length > 1)) {
                        switch (extType.mode) {
                            case "OR": {
                                str += "Режим поиска между атрибутами: \"ИЛИ\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>Режим поиска между атрибутами: \"ИЛИ\" </div>";
                                break;
                            }
                            case "AND_NOT": {
                                str += "Режим поиска между атрибутами: \"И НЕТ\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>Режим поиска между атрибутами: \"И НЕТ\" </div>";
                                break;
                            }
                            case "AND":
                            default: {
                                str += "Режим поиска между атрибутами: \"И\"";
                                filledValueStr += "<div class='oneFilledValue paddingBottom5'>Режим поиска между атрибутами: \"И\" </div>";
                                break;
                            }
                        }
                    }


                    if (extType.fieldRequests) {
                        jQuery.each(extType.fieldRequests, function (j, extField) {
                            if (j > 0) {
                                str += ", ";
                            }
                            try {
                                type = Data.allFieldsByName[extField.name].type;
                            } catch (_) {
                                type = ""
                            }
                            extFieldFilled = getFilledField(extType.name, extField, path.concat(["typeRequests", i, "fieldRequests", j]), false);
                            str += extFieldFilled.str;

                            filledValueStr += "<div class='paddingBottom5'>" + extFieldFilled.htmlStr + "</div>";
                        })
                    }

                    if (extType.fieldRequestGroups) {
                        var mode;
                        jQuery.each(extType.fieldRequestGroups, function (j, fieldRequestGroup) {
                            if (fieldRequestGroup.fieldRequests && fieldRequestGroup.fieldRequests.length > 0) {
                                switch (fieldRequestGroup.mode) {
                                    case "OR": {
                                        mode = " ИЛИ ";
                                        break;
                                    }
                                    case "AND": {
                                        mode = " И ";
                                        break;
                                    }
                                    default: {
                                        mode = ", ";
                                    }
                                }
                                filledValueStr += "<div class='paddingBottom5'>";
                                jQuery.each(fieldRequestGroup.fieldRequests, function (k, extField) {
                                    if (k > 0) {
                                        str += mode;
                                        filledValueStr += mode;
                                    }
                                    extFieldFilled = getFilledField(extType.name, extField, path.concat(["typeRequests", i, "fieldRequestGroups", j, "fieldRequests", k]), false);
                                    str += extFieldFilled.str;
                                    filledValueStr += extFieldFilled.htmlStr;
                                })
                                filledValueStr += "</div>";
                            }
                        })
                    }
                    filledValueStr += "</div>";
                    outer.append(filledValueStr);
                })
            }

        } else if (request.mode == "DICTIONARY") {
            // поиск по словарю

            if (request.dictionaryName) {
                str += "По словарю " + request.dictionaryName;
                jQuery("<strong>По словарю: </strong><div class='filledValue'>" + replaceAngleBrackets(request.dictionaryName) + "</div>").appendTo(outer)

            } else if (request.dictionaryElementIDs) {

                str += "По элементам словаря " + request.dictionaryElementIDs.join(", ");
                jQuery("<strong>По элементам словаря: </strong><div class='filledValue'>" + request.dictionaryElementIDs.join(",<br />") + "</div>").appendTo(outer)
            }



        } else if (request.mode == "QUERY_HISTORY") {
            // сохраненный запрос
            if (request.historyQueryId) {
                str += "Сохраненный запрос: " + request.historyQueryId + " ";

                jQuery("<strong>Сохраненный запрос: </strong>")
                    .appendTo(outer)

                oneFilledValue = jQuery("<div class='oneFilledValue'>" + request.historyQueryId + "</div>");

                jQuery("<div class='filledValue' />")
                    .append(oneFilledValue)
                    .appendTo(outer)
            }

        } else if (request.selectionId) {
            str += "[Закладки/Подборки]";
            oneFilledValue = jQuery("<div class='oneFilledValue'></div>");

                jQuery("<div class='filledValue' />")
                    .append(oneFilledValue)
                    .appendTo(outer)
        } else {
            // простой поиск
            if (request.type && Data.simpleSearchTypes[request.type]) {
                type = ", " + Data.simpleSearchTypes[request.type];
            } else {
                type = "";
            }
            if (request.simpleSearchFieldsBundle) {
                bundleComment = ", \"" + Data2.getBundleCommentByName(request.simpleSearchFieldsBundle) + "\"";
            } else {
                bundleComment = "";
            }

            str += (request.query||'') + type + bundleComment;

            jQuery("<strong>Искать: </strong>")
                .appendTo(outer)

            oneFilledValue = getOneFilledValueStr(request.query + type + bundleComment, "TEXT", true, path.concat(["query"]));
            jQuery("<div class='filledValue' />")
                .append(oneFilledValue)
                .appendTo(outer)

        }

        if (request.nestedQuery) {
            v = getFilledRequest2({
                request: request.nestedQuery,
                path: ["nestedQuery"]
            });
            str += ", область поиска: " + v.str;

            jQuery("<strong>Область поиска: </strong>")
                .appendTo(outer)

            jQuery("<div class='filledValue' />")
                .append(v.element)
                .appendTo(outer)
        }


        // группировка
        if (request.groupField) {
            try {
                v = Data.getGroupedField(request.groupField).comment
            } catch (_) {
                v = request.groupField
            }
            str += ", Группировать по: " + v;
            jQuery("<strong>Группировать по: </strong><div class='filledValue'>" + replaceAngleBrackets(v) + "</div>")
                .appendTo(outer)
        }

        // сортировка
        if (request.sortField && request.sortField != "score") {
            try {
                v = Data.getSortedField(request.sortField).comment
            } catch (_) {
                v = request.sortField
            }
            str += ", Сортировать по: " + v;
            jQuery("<strong>Сортировать по: </strong><div class='filledValue'>" + replaceAngleBrackets(v) + "</div>")
                .appendTo(outer)
        }

        // фильтрация по фасетам
        if (request.filter && request.filter.length > 0) {
            str += ", Фильтровать по: ";
            _str = "<strong>Фильтровать по: </strong><div class='filledValue'>";
            var facets = {};
            jQuery.each(request.filter, function (i, elem) {
                if (!facets[elem.field]) {
                    facets[elem.field] = []
                }
                facets[elem.field].push(elem)
                //                str += " " + elem.query;
                //                html += " " + elem.query;
            })

            var ii = 0
            jQuery.each(facets, function (i, facet) {
                if (ii > 0) {
                    str += "; "
                    _str += ";<br /> "
                }
                ii++
                jQuery.each(facet, function (j, filter) {
                    if (j > 0) {
                        str += ", "
                        _str += ", "
                    }
                    str += filter.query;
                    _str += replaceAngleBrackets(filter.query);
                })
            })
            _str += "</div>"
            jQuery(_str)
                .appendTo(outer)
        }

        if (request.joinFrom && request.joinTo) {
            str += ", Фильтровать по связи: ";
            _str = "<strong>Фильтровать по связи: </strong><div class='filledValue'>";

            var v = Data.allFieldsByName[request.joinFrom];
            var text = "";
            if (v) {
                text += v.comment + " (";
                if (v.common) {
                    text += "общий атрибут"
                } else {
                    text += v.__typeName;
                }
                text += ") ";

            } else {
                text += request.joinFrom;
            }

            str += text + "к ";
            _str += text + getArrowRight() + " ";

            text = "";
            v = Data.allFieldsByName[request.joinTo];
            if (v) {
                text += v.comment + " (";
                if (v.common) {
                    text += "общий атрибут"
                } else {
                    text += v.__typeName;
                }
                text += ")";

            } else {
                text += request.joinTo;
            }

            str += text;
            _str += text;

            _str += "</div>";
            jQuery(_str)
                .appendTo(outer)
        }

        var indexes = getFilledIndexes({
            groups: request.groups,
            dateFrom: request.dateFrom,
            dateTo: request.dateTo
        });
        if (indexes.str != "") {
            str += ", "
            str += indexes.str;
            jQuery(indexes.html)
                .appendTo(outer)
        }

        if (request.customFilters && request.customFilters.length > 0) {
            var customFilters = getFilledCustomFilters(request.customFilters);
            if (customFilters.str != "") {
                //                str += ", "
                str += customFilters.str;
                jQuery(customFilters.html)
                    .appendTo(outer)
            }
        }
    }


    if (conf.schedules) {
        var filledSchedules = getFilledSchedules(conf.schedules);
        if (filledSchedules.str != "") {
            if (str != "") {
                str += ", "
            }
            str += "регламент выполнения: " + filledSchedules.str
            jQuery("<strong>Регламент выполнения: </strong>" + filledSchedules.html)
                .appendTo(outer)
        }
    }


    if (conf.attributes) {
        var L = conf.attributes.length;
        if (L > 0) {
            str += ", Дополнительно";
            _str = "<strong>Дополнительно: </strong><div class='filledValue'>"
            for (var i = 0; i < L; i++) {
                if (conf.attributes[i]) {
                    if (i > 0) {
                        str += ", "
                        _str += ",<br />"
                    }

                    try {
                        v = Data.allFieldsByName[conf.attributes[i].name].comment
                    } catch (_) {
                        v = conf.attributes[i].name
                    }
                    str += v + ": " + conf.attributes[i].value;
                    _str += replaceAngleBrackets(v + ": " + conf.attributes[i].value);
                }
            }
            _str += "</div>";
            jQuery(_str)
                .appendTo(outer)
        }
    }

    return {
        str: str,
        element: outer,
        request: request
    }
}


function getFilledField(typeName, field, path, noAddFieldName, separator, noAddTypeName) {
    var str = "", htmlStr = "", v, op = "", type, query, sQuery, queryHTML, sQueryHTML, queryPath = null, sQueryPath = null, isSelectable, dateValue,
        fieldName = field.name || field.field;

    try {
        if (typeName && typeName != "common") {
            v = Data.getType(typeName).fields[fieldName].comment;
            type = Data.getType(typeName).fields[fieldName].type;
        } else {
            v = Data.allFieldsByName[fieldName].comment;
            type = Data.allFieldsByName[fieldName].type;
        }
    } catch (_) {
        v = fieldName;
        type = "TEXT";
    }

    if (noAddTypeName) {
        v = "";
    }

    if (field.operator != "D" && ParamQueryCore.isFieldTypeForParamQuery(type)) { // не поиск по словарю
        isSelectable = true;
    } else {
        isSelectable = false;
    }

    try {
        if (field.operator) {
            op = SearchTemplate.operators[field.operator] + (separator ? separator : " ");
        }
    } catch (_) {
        op = "";
    }

    if (path) {
        queryPath = jQuery.merge([], path);
        queryPath.push("query");
        sQueryPath = jQuery.merge([], path);
        sQueryPath.push("sQuery");
    }

    if (!noAddFieldName) {
        str += v + (separator ? separator : " ");
        htmlStr += v + (separator ? separator : " ");
    }

    switch (field.operator) {
        case "EM":
            {
                str += "Пустое"
                htmlStr += "Пустое"
                break
            }
        case "B":
        case "NB":
            {
                if (type == "DATE") {
                    dateValue = preprocessingDate(field.query, field.sQuery, field.operator, isSelectable, path, type);
                    if (dateValue.text) {
                        str += dateValue.text;
                        htmlStr += dateValue.htmlStr;

                    } else {
                        queryHTML = getOneFilledValueStr(dateValue.query, type, isSelectable, queryPath);

                        if (isTextOK(dateValue.query)) {
                            sQueryHTML = getOneFilledValueStr(dateValue.sQuery, type, isSelectable, sQueryPath);
                            if (!isTextOK(dateValue.sQuery)) {
                                dateValue.sQuery = "";
                            }

                            if (dateValue.query == dateValue.sQuery) {
                                if (field.operator == "B") {
                                    str += "за " + dateValue.query;
                                    htmlStr += "за " + queryHTML;

                                } else {
                                    str += op + " за " + dateValue.query;
                                    htmlStr += op + " за " + queryHTML;
                                }

                            } else {
                                str += op + dateValue.query + " и " + dateValue.sQuery;
                                htmlStr += op + queryHTML + " и " + sQueryHTML;
                            }
                        }
                    }

                } else {
                    str += op + field.query + " и " + field.sQuery;
                    htmlStr += op
                        + getOneFilledValueStr(field.query, type, isSelectable, queryPath)
                        + " и "
                        + getOneFilledValueStr(field.sQuery, type, isSelectable, sQueryPath);
                }
                break
            }
        default:
            {
                if (type == "DATE") {
                    dateValue = preprocessingDate(field.query, field.sQuery, field.operator, isSelectable, path, type);
                    if (SearchTemplate.operators["DATE_" + field.operator]) {
                        op = SearchTemplate.operators["DATE_" + field.operator] + " ";
                    }
                    if (dateValue.text) {
                        v = dateValue.text;
                    } else {
                        v = field.query || "";
                    }
                } else if (!SystemTags.isNotSystemTagField(fieldName)) {
                    v = field.query.replace(/OR/, "или");
                } else {
                    v = field.query || "";
                }
                str += op + v;
                htmlStr += op + getOneFilledValueStr(v, type, isSelectable, queryPath);
                break
            }
    }
    return {
        str: str,
        htmlStr: htmlStr
    }
}


function getFilledCustomFilters(customFilters, level) {
    if (!level) {
        level = 0;
    }

    var INDENT_AT_LEVEL_0 = Filled.getIndent(level);
    var INDENT_AT_LEVEL_1 = Filled.getIndent(level + 1);

    var str = "", html = "", filled;
    if (customFilters && customFilters.length > 0) {
        str += ", Фильтровать по: ";
        html += INDENT_AT_LEVEL_0 + "<strong>Фильтровать по: </strong>";
        html += "<div class='filledValue0'>"
        jQuery.each(customFilters, function (i, customFilter) {
            if (i > 0) {
                str += ", ";
                html += ", <br/>";
            }
            filled = getFilledOneCustomFilter(customFilter);
            str += filled.str;
            html += INDENT_AT_LEVEL_1 + filled.html;
        })
        html += "</div>";
    }

    return {
        str: str,
        html: html
    }
}

function getFilledOneCustomFilter(customFilter, separator) {
    var str = "", html = "", typeName = "", extFieldStr;
    var field = Data.allFieldsByName[customFilter.name];
    if (field) {
        if (field.common) {
            typeName = "";
        } else {
            typeName = field.__typeName + (separator ? separator : ", ");
        }
    }
    extFieldStr = typeName + getFilledField(null, customFilter, null, false, separator).str;
    str += extFieldStr;
    html += replaceAngleBrackets(extFieldStr);

    return {
        str: str,
        html: html
    }
}

function getFilledIndexes(groupsData, level) {
    if (!level) {
        level = 0;
    }

    var INDENT_AT_LEVEL_0 = Filled.getIndent(level);
    var INDENT_AT_LEVEL_1 = Filled.getIndent(level + 1);

    var str = "", html = "";
    if (groupsData && groupsData.groups) {
        var groupsL = groupsData.groups.length;
        if (groupsL > 0) {
            if (groupsL == 1) {
                str += "Архив: ";
                html += INDENT_AT_LEVEL_0 + "<strong>Архив: </strong>";
            } else {
                str += "Архивы: ";
                html += INDENT_AT_LEVEL_0 + "<strong>Архивы: </strong>";
            }
            html += "<div class='filledValue0'>";

            jQuery.each(groupsData.groups, function (i, group) {
                if (i > 0) {
                    str += ", ";
                    html += ",<br />";
                }
                str += group;
                html += INDENT_AT_LEVEL_1 + replaceAngleBrackets(group);
            })


            html += "</div>"
        }
    }

    if (groupsData && groupsData.dateFrom && groupsData.dateTo) {
        if (str != "") {
            str += ", ";
        }
        str += "Интервал: ";
        html += INDENT_AT_LEVEL_0 + "<strong>Интервал: </strong>";
        html += "<div class='filledValue0'>";
        var interval = fromIsoToStringDateTime(groupsData.dateFrom, true) + " - " + fromIsoToStringDateTime(groupsData.dateTo, true);
        str += interval;
        html += INDENT_AT_LEVEL_1 + interval;
        html += "</div>";
    }

    return {
        str: str,
        html: html
    }
}



function loadMultiquerySQCatalogs(filled, callback, errorCallback) {
    // for getFilledRequest2
    var outersHTML = filled.element.find(".load-catalog");

    if (!typeof (callback) === 'function') {
        callback = function () { }
    }

    if (!typeof (errorCallback) === 'function') {
        errorCallback = function () {
            showErrorNotification("Ошибка при загрузке данных сложного запроса.")
        }
    }

    if (outersHTML.length > 0) {
        var outersSTRByIds = {}, outersHTMLByIds = {}, ids = [], outer, queryId;

        outersHTML.each(function () {
            outer = jQuery(this);
            queryId = outer.attr("queryId");
            if (!outersHTMLByIds[queryId]) {
                outersHTMLByIds[queryId] = [];
            }
            outersHTMLByIds[queryId].push(outer);
            ids.push(queryId);
        })
        var loadedFilled, elem;
        getCatalogsByIds(ids, null,
            function (data) {
                if (data && data.catalogs) {
                    jQuery.each(data.catalogs, function (i, catData) {
                        loadedFilled = getFilledRequest2({
                            request: catData.query,
                            schedules: catData.schedules,
                            attributes: catData.attributes,
                            partOfMultiquery: true
                        })

                        jQuery.each(outersHTMLByIds[catData.id], function (i, outer) {
                            elem = jQuery(this);
                            if (elem.is("div")) {
                                elem
                                    .empty()
                                    .append(loadedFilled.element.clone(true));
                            } else {
                                elem
                                    .empty()
                                    .append(loadedFilled.str);
                            }
                        })
                    })
                    callback()
                } else {
                    errorCallback()
                }
            },
            errorCallback
        )

    } else {
        callback()
    }

}

function loadCatalogsForFilled(c) {
    // for getFilledRequest
    var filled = c.filled,
        func = c.func,
        callback = c.callback,
        errorCallback = c.errorCallback,

        ids = filled.idsForLoad;

    if (!typeof (func) === 'function') {
        func = function (catData) {
            return catData.name;
        }
    }

    if (!typeof (callback) === 'function') {
        callback = function () { }
    }

    if (!typeof (errorCallback) === 'function') {
        errorCallback = function () {
            showErrorNotification("Ошибка при загрузке данных сложного запроса.")
        }
    }

    if (ids && ids.length > 0) {
        getCatalogsByIds(ids, null,
            function (data) {
                if (data && data.catalogs) {
                    jQuery.each(data.catalogs, function (i, catData) {
                        filled.str = filled.str.replace(catData.id, func(catData));
                    })
                    callback();
                } else {
                    errorCallback();
                }
            },
            errorCallback
        )

    } else {
        callback();
    }
}


function isRequestOK(req) {
    var ok = false;
    var request;
    if (typeof (req) == "string") {
        try {
            request = JSON.parse(decodeURIsafe(req))
        } catch (e) {
            request = null;
        }
    } else {
        request = req
    }
    if (request) {
        if (request.request) {
            request = request.request;
        }
        if (request.query
            || request.typeRequests
            || request.type == "MULTIQUERY" && request.multiqueryRequest && request.multiqueryRequest.queryRequests
            || (request.mode == "DICTIONARY" && (request.dictionaryName || request.dictionaryElementIDs))) {
            ok = true;
        }
    }
    return ok
}

function encodeSymbols(str) {
    return str
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/%/g, "%25")
        .replace(/#/g, "%23")
}

function decodeSymbols(str) {
    return str
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%25/g, "%")
        .replace(/%23/g, "#")
}

function encodeAngleBrackets(str) {
    return str
        .replace(/</g, "%3C")
        .replace(/>/g, "%3E")
}

function decodeAngleBrackets(str) {
    return str
        .replace(/%3C/g, "<")
        .replace(/%3E/g, ">")
}

function replaceBreakingSymbols(text, noEscape) {
    // для отображения данных на странице
    // заменяет символы, которые ломают верстку
    var str = text;
    // кое где не надо экранировать, это проще задать флагом noEscape чем решить на месте
    if (noEscape!==true) {
        str = escapeQuotesByHTML2(replaceAngleBrackets("" + text, ['a', 'em', 'br']));// для тэгов em  и br не заменяем <
        // .replace(/&lt;a /g, "<a ")
        // .replace(/&lt;a>/g, "<a>")
        // .replace(/&lt;\/a>/g, "</a>")
        //.replace(/&lt;em>/g, "<em>")          // для тэгов em  и br возвращаем первоначальный вид <
        //.replace(/&lt;\/em>/g, "</em>").replace(/&lt;br>/g, "<br>").replace(/&lt;br\/>/g, "<br\/>")
    }

    return str;
}

function replaceAngleBrackets(str, exlude) {
    if (!str) return typeof str === "number" ? "0" : '';
    if (typeof str !== "string") str += "";
    if (!~str.indexOf('<')) return str;
    tmp1 = str;
    if (!exlude || exlude.length === 0) str = (str) ? ("" + str).replace(/</g, "&lt;") : "" // все < заменяем на &lt;
    else
        str = str.split('<').map(function (substr, i) {
            if (i === 0) return substr;
            var r = true;
            for (var j = 0, e; j < exlude.length; j++) {
                e = exlude[j];
                if (substr.indexOf(e + ' ') === 0 || substr.indexOf(e + '>') === 0 || substr.indexOf('/' + e + '>') === 0) { r = false; break; }
            }
            return (r ? '&lt;' : '<') + substr;
        }).join('');
    return str;

}

function escapeColon(str) {
    return (str) ? str.replace(/:/g, "\\:") : str;
}


// экранирование служебных html символов
// чтобы после отображения на странице увидеть текст, совпадающий с исходным кодом
function escapePureHTML(str) {
    return escapeQuotesByHTML2(replaceAngleBrackets("" + str))
}

// функция сортировки массива по любому полю элемента этого массива.
// параметры: arr - массив для сортировки, param - строковое имя поля, по которому надо провести сортировку
// если param не задано или не является строкой, будет проведена стандартная сортировка arr.sort()
sortArray = function (arr, param) {
    var doSort;
    if (arr && typeof arr.sort === "function") {
        if (typeof (param) === "string") {
            doSort = function (i, ii) {
                if (i[param] > ii[param])
                    return 1;
                else if (i[param] < ii[param])
                    return -1;
                else
                    return 0;
            }
            arr.sort(doSort);
        } else if (param === true) {
            doSort = function (i, ii) {
                if (i > ii)
                    return 1;
                else if (i < ii)
                    return -1;
                else
                    return 0;
            }
            arr.sort(doSort);

        } else {
            arr.sort();
        }
        return arr
    } else {
        return false
    }
}

function WrapSPANStr(zeroSymbols) {
    return (zeroSymbols) ? "<span class='wrap'></span>" : "<span class='wrap'>  </span>";
}

function WrapSPAN(zeroSymbols) {
    var span = EmptyElement('span'); span.className = 'wrap';
    if(!zeroSymbols )span.innerHTML=' '; 
    return span;
}

function getArrowRight() {
    return "<i class='arrow-right'>&#8594;</i>"
}

function getFragment() {
    return jQuery(document.createDocumentFragment())
}


function findDiffInObjects(obj1, obj2) {
    for (var key in obj1) {
        if (typeof obj1[key] == "object") {
            findDiffInObjects(obj1[key], obj2[key])
        } else {
            if ((obj1 && !obj2) || (!obj1 && obj2)) {
                consoleDebug("no value for key = " + key)
            } else if (obj1[key] !== obj2[key]) {
                consoleDebug("key = " + key + " values = " + obj1[key] + " and " + obj2[key])
            }
        }
    }
}

function isEqualObjects(obj1, obj2) {
    var diff = findDifferences(obj1, obj2);
    var equal = diff.length == 0;
    if (!equal) {
        var d = 9;
    }
    return equal;
}


function findDifferences(objectA, objectB) {
    //    consoleDebug("start diff")
    var propertyChanges = [];
    var objectGraphPath = ["this"];

    var addPropertyChanged = function (graphPath, a, b) {
        propertyChanges.push({ "Property": graphPath.join(""), "ObjectA": a, "ObjectB": b });
    };

    (function (a, b) {
        if (a != undefined && a != null && b != undefined && b != null) {
            if (a.constructor == Array) {
                var La = a.length,
                    Lb = b.length;
                if (La != Lb) {
                    addPropertyChanged(objectGraphPath, a, b);
                } else {
                    for (var i = 0; i < La; i++) {
                        objectGraphPath.push("[" + i.toString() + "]");
                        arguments.callee(a[i], b[i]);
                        objectGraphPath.pop();
                    }
                }

            } else if (a.constructor == Object
                || (a.constructor != Number && a.constructor != String && a.constructor != Date
                    && a.constructor != RegExp && a.constructor != Function && a.constructor != Boolean)) {
                var La = 0, Lb = 0;
                var properties = [];
                for (var property in a) {
                    if (a[property] != undefined && a[property] != null && a[property].constructor != Function) {
                        properties.push(property);
                        La++;
                    }
                }
                for (property in b) {
                    if (b[property] != undefined && b[property] != null && b[property].constructor != Function) {
                        Lb++;
                    }
                }

                if (La != Lb) {
                    addPropertyChanged(objectGraphPath, a, b);
                } else {
                    for (var i = 0, L = properties.length; i < L; i++) {
                        property = properties[i];
                        objectGraphPath.push(("." + property));
                        arguments.callee(a[property], b[property]);
                        objectGraphPath.pop();
                    }
                }
            } else if (a.constructor != Function) { // filter out functions
                if (a !== b) {
                    addPropertyChanged(objectGraphPath, a, b);
                }
            }
        } else if (a != b) {
            addPropertyChanged(objectGraphPath, a, b);
        }
    })(objectA, objectB);
    //    consoleDebug("end diff")
    return propertyChanges;
}




HashMap = function (key) {
    this._key = key
    this._hash = {}
}

HashMap.prototype = {

    add: function (d) {
        this._hash[d[this._key]] = d;
    },

    get: function (value) {
        return this._hash[value]
    },

    has: function (value) {
        return !!this._hash[value]
    },

    del: function (d) {
        if (this._hash[d[this._key]]) {
            delete this._hash[d[this._key]];
        }
    },

    clear: function () {
        this._hash = {};
    }
}













function getElementsByClassName(cls) {
    if (document.getElementsByClassName == undefined) {
        var clsList = cls.split(" ");
        var elems = document.getElementsByTagName('*');
        var b = [],
            reg;
        var f = function (c, elms) {
            reg = new RegExp('\\b' + c + '\\b');
            b = [];
            for (var i = 0, L = elms.length; i < L; i++) {
                if (reg.test(elms[i].className)) {
                    b.push(elms[i])
                }
            }
            return b
        }

        for (var i = 0, Lcls = clsList.length; i < Lcls; i++) {
            elems = f(clsList[i], elems);
        }

        return elems
    } else {
        return document.getElementsByClassName(cls)
    }
}



var LinkSelector = {

    get: function (c) {
        var conf = {
            elements: c.elements,// text, value
            selectedValue: c.selectedValue,
            allowNoSelect: c.allowNoSelect,
            useCheckboxes: c.useCheckboxes,
            outerClass: c.outerClass || "",
            callback: c.callback || function (value, isManual) { },
            beforeChange: c.beforeChange || function (obj) {
                /*
                 * obj =
                 * oldValue
                 * oldChecked
                 * newValue
                 * newChecked
                 * */
                return true;
            },
            checkboxCallback: c.checkboxCallback || function (valueArr) { },
            asSpan: c.asSpan
        }

        var outerTag = "div";

        if (c.asSpan) {
            outerTag = "span";
        }

        var outer = jQuery("<" + outerTag + " />", {
            "class": "modeSelectorOuter " + conf.outerClass
        })

        outer.data("LinkSelector", conf);

        if (conf.selectedValue == null && !conf.allowNoSelect) {
            conf.selectedValue = conf.elements[0].value;
        }

        var elemCls,
            str;
        jQuery.each(conf.elements, function (i, elem) {
            if (i > 0) {
                outer.append(WrapSPAN());
            }

            if (conf.selectedValue == elem.value) {
                elemCls = "selectedMode";
            } else {
                elemCls = "";
            }

            if (conf.useCheckboxes) {
                str = "";
                str += "<input type='checkbox'";
                str += " value='" + elem.value + "'";
                if (elem.checked) {
                    str += " checked='true'";
                }
                str += " />";

                outer.append(str);
            }

            jQuery("<a />", {
                "href": "javascript:void(0)",
                "class": elemCls,
                "text": elem.text
            })
                .data("linkData", elem)
                .appendTo(outer)
        })

        outer.delegate("a", "click.LinkSelector", function (e) {
            var link = jQuery(this);
            var _outer = link.closest(".modeSelectorOuter");
            var _conf = _outer.data("LinkSelector");
            var obj;

            if (!LinkSelector.isSelectedLink(link)) {
                obj = {
                    oldValue: LinkSelector.getValue(_outer).value,
                    oldChecked: null,
                    newValue: link.data("linkData").value,
                    newChecked: null
                }
                if (conf.useCheckboxes) {
                    obj.oldChecked = LinkSelector.isCheckedLink(outer.find(".selectedMode"));
                    obj.newChecked = LinkSelector.isCheckedLink(link);
                }
                if (_conf.beforeChange(obj)) {
                    LinkSelector._clickAndSelectCallback(link, _outer, _conf);
                }

            } else if (_conf.allowNoSelect) {
                obj = {
                    oldValue: link.data("linkData").value,
                    oldChecked: null,
                    newValue: {},
                    newChecked: null
                }
                if (conf.useCheckboxes) {
                    obj.oldChecked = LinkSelector.isCheckedLink(outer.find(".selectedMode"));
                }
                if (_conf.beforeChange(obj)) {
                    LinkSelector._clickAndNoSelectCallback(link, _outer, _conf);
                }
            }
        })

        if (conf.useCheckboxes) {
            outer.delegate("input", "click.LinkSelector", function (e) {
                var chb = jQuery(this);
                var _outer = chb.closest(".modeSelectorOuter");
                conf.checkboxCallback(LinkSelector.getCheckboxValue(_outer));
            })
        }

        conf.callback.call(outer.get(0), LinkSelector.getValue(outer), false);

        return outer
    },

    _clickAndSelectCallback: function (link, outer, conf) {
        var value = link.data("linkData"),
            isManual = true,
            isChecked = null;

        if (conf.useCheckboxes) {
            isChecked = LinkSelector._getCheckbox(link).is(":checked");
        }

        outer.find(".selectedMode").removeClass("selectedMode");
        link.addClass("selectedMode");

        conf.callback.call(link.get(0), value, isManual, isChecked);
    },

    _clickAndNoSelectCallback: function (link, outer, conf) {
        var value = {},
            isManual = true,
            isChecked = null;

        if (conf.useCheckboxes) {
            isChecked = LinkSelector._getCheckbox().is(":checked");
        }

        link.removeClass("selectedMode");
        conf.callback.call(link.get(0), value, isManual, isChecked);
    },

    getValue: function (outer) {
        return jQuery(outer).find(".selectedMode").data("linkData") || {}
    },

    setValue: function (outer, value) {
        var _outer = (outer.is(".modeSelectorOuter")) ? outer : outer.find(".modeSelectorOuter");
        var conf = _outer.data("LinkSelector");
        var pos, link;
        if (conf.elements) {
            jQuery.each(conf.elements, function (i, elem) {
                if (elem.value == value) {
                    pos = i;
                    return false;
                }
            })

            link = jQuery(outer.find("a").get(pos));

            if (!LinkSelector.isSelectedLink(link)) {
                LinkSelector._clickAndSelectCallback(link, outer, conf);

            } else if (conf.allowNoSelect) {
                LinkSelector._clickAndNoSelectCallback(link, outer, conf);
            }
        }
    },


    getCheckboxValue: function (outer) {
        var v = [];
        outer.find(':checkbox:checked').each(function () {
            v.push(this.value);
        })
        return v;
    },

    setCheckboxValue: function (outer, valueArr) {
        if (valueArr) {
            var valueMap = {};
            jQuery.each(valueArr, function (i, v) {
                valueMap[v] = true;
            })
            outer.find(':checkbox:checked').each(function () {
                if (valueMap[this.value]) {
                    this.checked = true;
                }
            })
        }
    },

    getLinkData: function (link) {
        return (link) ? link.data("linkData") : null;
    },

    updateLinkData: function (link, linkData) {
        if (link && linkData) {
            link.data("linkData", linkData);
            link.text(linkData.text);
            LinkSelector._getCheckbox(link).val(linkData.value);
        }
    },


    destroy: function (outer) {
        outer.empty();
        outer.unbind("click.LinkSelector");
    },

    _getCheckbox: function (link) {
        return link.prev(":checkbox");
    },

    isCheckedLink: function (link) {
        return LinkSelector._getCheckbox(link).is(":checked");
    },
    isSelectedLink: function (link) {
        return link.is(".selectedMode")
    }
}


//Переключает класс на элемент из списка (т.е. вырубает на остальных и ставит на текущий)
toggleClassToElement = function (elem, cls, list, parent) {
    if (typeof elem === 'string') {
        if(list&&list[0] instanceof Element){
            if(list[0].parentElement)
                elem = list[0].parentElement.querySelector(elem);
            else for(var i=0, l=list.length; i<l; i++)if(list[i].matches&&list[i].matches(elem)){elem = list[i]; break;}

        }else elem = document.querySelector(elem)
    }
    if ( elem && !(elem instanceof Element)) var elem = elem[0];
    if ((!elem && !list) || !cls || list === null) return false;
    // var list = list || elem.parentNode.children;  
    if( list instanceof Element ){ 
        parent = list; 
        list = null;
    } else if( list === true )list = '.'+cls;
    
    if( !list ){
        list = ( parent || elem.parentNode ).children;
    }else if( typeof list === 'string' ){
        list = ( parent || document ).querySelectorAll(list);
    }

    if ( list && list.length > 0 ) for ( var i = 0, l = list.length; i < l; i++ )list[i].classList.remove(cls);
    if ( elem ) elem.classList.add(cls);
    return true;
}

// Селектор аттрибутов (можно встретить в настройках дашбордов для выбора аттрибутов фильтрации дат)
var AttributeSelector = {

    SELECTED_CLASS: "attribute-selector__selected-item",
    DISABLED_CLASS: "attribute-selector__disabled",

    resizeElem: null,

    data : new Map(),

    create: function (c) {
        var conf = {
            // элемент в который добавляем AttributeSelector
            parent: document.body,
            // список атрибутов полученный из getAllFieldsForSortable
            fieldsList: false,
            // выбранное значение
            value: false,
            // количество видимых строк
            size: 7,
            // заблокирован
            disabled: false,

            // если не задан fieldsList можно передать эти параметры:
            // критерий отбора атрибутов
            checkFunc: c.checkFunc || function (field) {
                return true;
            },
            // не добавлять лат. имя
            noAddName: false,
            // не добавлять имя типа
            noAddType: false,
            // input для вывода (не обязателен)
            output: null,
            // каллбэк на изменение
            onChange: null,
            // Возможность выбирать несколько значений
            multiselect : false
        }

        for (var i in c) conf[i] = c[i];
        if (conf.output) conf.output = conf.output[0] || conf.output;//нужен конечный элемент, а не jQuery

        if (!conf.fieldsList) {
            conf.fieldsList = Data.getAllFieldsForSortable(conf.checkFunc, conf.noAddName, conf.noAddType).allFields || [];
        }

        var outer, 
            filterCache = [],
            namesCache = [];

        namesCache.length = conf.fieldsList.length; 
        var values = conf.multiselect ? SWAP(conf.value,true) : {};
        if(!conf.multiselect)values[conf.value]=true;

        var rows = conf.fieldsList.map(function (item,i) { 
            namesCache[i]=item.name; 
            return LI({
                className:"attribute-selector__item " + (values[item.name]?AttributeSelector.SELECTED_CLASS:''),
                name:item.name,
                cacheItems: AttributeSelector._setCache(item, filterCache).join(",")
            },item.comment)
        })

        var input = INPUT({className:'attribute-selector__input'}),
            list = dCE('ul',{className:'attribute-selector__list'},rows),
            listOuter = DIV({className:"attribute-selector__list-outer " + Data.STOP_SCROLL_CLASS},list),

            outer = DIV({className:'attribute-selector__outer'},[ input, listOuter ]);

        var data =  {
            rows: rows,
            input: input,
            listOuter: listOuter,
            list: list,
            filterCache: filterCache,
            namesCache: namesCache,
            conf: conf, 
            values : conf.multiselect ? (conf.value||[]) : [conf.value]
        }

        input.addEventListener("keyup", AttributeSelector._filter.bind(input,input));
        list.addEventListener("click", function (e) { 
            if (e.target!==this&&!this.closest('.attribute-selector__outer').classList.contains(AttributeSelector.DISABLED_CLASS)) {
                var link = e.target.closest(".attribute-selector__item"),
                    val = link.getAttribute('name'),
                    SELECTED_CLASS = AttributeSelector.SELECTED_CLASS,
                    i = data.values.indexOf(val);

                if (link.classList.contains(SELECTED_CLASS)) {
                    link.classList.remove(SELECTED_CLASS);
                    data.values = data.values.splice(i,1)
                } else {
                    if(data.conf.multiselect){
                        link.classList.add(SELECTED_CLASS);
                    }else{
                        data.values.length=0;
                        toggleClassToElement(link, SELECTED_CLASS);
                    }
                    data.values.push(val);
                }

                if (conf.output) {
                    conf.output.value = data.values + '';
                    conf.output.dispatchEvent(new CustomEvent("change"));
                    // else conf.output.fireEvent("onchange");
                }

                if (typeof conf.onChange === "function") conf.onChange.call(link, e, data.conf.multiselect? data.values : val, conf);
                jQuery(conf.parent).trigger("change.AttributeSelector");
                getEl(conf.parent).dispatchEvent(new CustomEvent("change"));
            }
        }); 
        
        AttributeSelector.data.set(outer,data)

        getEl(conf.parent).appendChild(outer);
        AttributeSelector.resize(conf.parent);

        if (conf.disabled) AttributeSelector.setDisabled(conf.parent, true);

        return outer;
    },

    resize: function (elem) {
        if(!(elem instanceof Element) ){
            if(elem&&(typeof elem === 'object')&&('length' in elem)){
                if(elem.length === 1)elem=elem[0];
                else for (var i=0;i<elem.length;i++)AttributeSelector.resize(elem[i]);
            }
        }
        if(elem instanceof Element) {
            var outer = AttributeSelector._findOuter(elem),
                data = AttributeSelector.data.get(outer),
                size,
                listOuter,
                rows,
                h,
                hListOuter,
                pos = null,
                H,
                position;

            if (data && data.rows.length>0) {
                size = data.conf.size;
                listOuter = data.listOuter;
                rows = data.rows;

                h = rows[0].offsetHeight;
                hListOuter = h * size;
                if (hListOuter > 0) {
                    listOuter.style.height = hListOuter + 'px';
                }

                pos = rows.findIndex(function (row) {
                    return row.classList.contains(AttributeSelector.SELECTED_CLASS);
                })


                // выбранный элемент есть
                if (pos !== -1) {
                    H = listOuter.clientHeight;
                    // элементы отрисованы
                    if (H > 0) {
                        position = rows[pos].getBoundingClientRect().top - listOuter.getBoundingClientRect().top;
                        // выбранный элемент вне поля видимости
                        if (position.top + h > H) {
                            listOuter.scrollTop = position.top - (H - h) / 2;
                        }
                    }
                }
            }
        } 

    },

    setValue: function (elem, value, add) {
        var outer = AttributeSelector._findOuter(elem),
        data =  AttributeSelector.data.get(outer); 
        if(!data)return;
        if(!data.conf.multiselect||!add)data.values.length=0;
        value = SWAP(data.values.concat(value));
        data.values = Object.keys(value);//Комбинация SWAP - Object.keys очищает от дублей
        data.rows.forEach(function(li){
            li.classList.toggle(AttributeSelector.SELECTED_CLASS,value[li.getAttribute('name')]);
        })  
    },

    getValue: function (elem, arr) {
        var value = null,
            outer = AttributeSelector._findOuter(elem),
            data =  AttributeSelector.data.get(outer);

        if (data) value = data.conf.multiselect || arr ? data.values : data.values[0]; 

        return value;
    },

    setDisabled: function (elem, disable) {
        var outer = AttributeSelector._findOuter(elem),
            data =  AttributeSelector.data.get(outer);

            data.input.toggleAttribute("disabled", disable);
            outer.classList.toggle(AttributeSelector.DISABLED_CLASS,disable); 
    },

    isDisabled: function (elem) {
        var outer = AttributeSelector._findOuter(elem);

        return outer.classList.contains(AttributeSelector.DISABLED_CLASS);
    },


    _setCache: function (item, filterCache) {
        var filterValues; 
        var typeName = item.typeName || item.type || '';
 
       if(typeName  === Data.COMMON_TYPE) typeName = "Общий атрибут " + Data.COMMON_TYPE;
 
        filterValues = [
            item.name.toLowerCase()// добавляем латинское имя
        ].concat(
            AttributeSelector._phraseToWordArray(item.__pure_comment||item.comment||''),
            AttributeSelector._phraseToWordArray(typeName)
        );

        filterCache[item.name] = filterValues;

        return filterValues;
    },

    _phraseToWordArray: function (phrase) {
        var lowerText = phrase.toLowerCase();

        var arr = [];
        // добавляем полное русское имя
        arr.push(lowerText);

        var pos = lowerText.indexOf(" ");
        while (pos != -1) {
            // фикс случая нескольких пробелов подряд
            do {
                pos++;
            } while (lowerText.charAt(pos) == " ")

            // добавляем часть русского имени после пробела и до конца имени
            lowerText = lowerText.substr(pos);
            arr.push(lowerText);

            pos = lowerText.indexOf(" ");
        }

        return arr;
    },

    _filter: function (input) {
        var term = input.value.toLowerCase(),
            data = AttributeSelector.data.get(input.closest(".attribute-selector__outer"));

        if (!data) return;

        var rows = data.rows,
            filterCache = data.filterCache,
            namesCache = data.namesCache,

            scores = [],
            filterValues;

        if (!term || term == "") { 
            toggleElDisplay(rows,true);
        } else {
            toggleElDisplay(rows,false);

            namesCache.forEach( function ( name, i) {
                filterValues = filterCache[name];
                if (filterValues) {
                    filterValues.forEach( function ( v ) {
                        if (v.indexOf(term) === 0) scores.push(i);
                    })
                }
            });

            scores.forEach( function (s) {
                toggleElDisplay(rows[s],true);
            });
        }
    },

    _findOuter: function (elem) {
        elem = getEl(elem);
        return  elem&&(elem.classList.contains("attribute-selector__outer") ? elem : elem.querySelector(".attribute-selector__outer"))||EmptyElement('div');
    },

    _initResizeElem: function () { 
        AttributeSelector.resizeElem = DIV({className:'attribute-selector__resize-elem',style:{position:'absolute',top:'-10000px',parentNode:document.body}});
    }
}


var startEditable = (function () {
    // editable from Arion in jQuery
    var defaultConfig = {
        // должны ли в данный момент обрабатываться события - и возможно схлопывать
        isActive: function () { return true },

        // метод, вызываемый для переключения в ShowMode
        toShowMode: function (elem) { },

        // метод, вызываемый для переключения в EditMode
        toEditMode: function (elem) { },

        // класс общего контейнера внутри которого содержатся схлопываемые элементы
        editableOuterCls: "editableOuter",

        //
        okClickSelector: null,

        // класс для контейнера showMode
        showModeCls: "showMode",

        // класс для контейнера editMode
        editModeCls: "editMode",

        showAndEditTheSame: false
    }


    return function (conf) {
        var config = jQuery.extend({}, defaultConfig, conf);
        var _id = "editable" + uniqueId();

        jQuery(document).bind("click." + _id, function (e) {
            if (config.isActive()) {
                var $target = jQuery(e.target);

                // надо закрыть все editMode кроме того, в котором сейчас работаем. Определяем нужный editMode.
                // возможно кликнули в editMode
                var editElem = $target.closest("." + config.editModeCls);

                var hasOkElem = false;
                if (config.okClickSelector) {
                    hasOkElem = $target.closest(config.okClickSelector).length > 0;
                }

                //Возможно, кликнули в диалоговом окне - в этом случае, ничего не делаем
                var isDialogWindow = $target.closest('.ReferenceBookSelectorWindow').length > 0;

                var allEditElems = null;
                if (!hasOkElem && !isDialogWindow) {
                    allEditElems = jQuery("." + config.editModeCls + ":visible");
                }

                // если кликнули не в editMode, то если кликнули в showMode, через clause получаем нужный editMode
                if (editElem.length == 0 && $target.closest("." + config.showModeCls).length > 0) {
                    var outer = $target.closest("." + config.editableOuterCls);
                    editElem = outer.find(("." + config.editModeCls));
                    config.toEditMode(outer);

                    if (config.showAndEditTheSame) {
                        editElem = (outer.is("." + config.showModeCls)) ? outer : outer.find(("." + config.showModeCls));
                    }
                }

                // если кликнули не в editMode и не в showMode, то editElem останется undefined и закроются все элементы
                if (allEditElems && !isDialogWindow) {
                    allEditElems.not(editElem).each(function () {
                        config.toShowMode(jQuery(this))
                    })
                }
            }
        })

        var destroy = function () {
            jQuery(document).unbind("click." + _id);
            config = null;
        }


        return {
            isActive: config.isActive,
            toShowMode: config.toShowMode,
            toEditMode: config.toEditMode,
            destroy: destroy
        }
    }
})()





// очистка объекта searchRequest от полей, которые автоматически добавляются при поиске или имеют значения по умолчанию
function clearSearchRequest(request) {
    var cleanRequest = {};
    if (request) {
        var f;
        for (var key in request) {
            if (request[key] != null) {
                switch (key) {
                    case "filter": {
                        cleanRequest[key] = request[key].map( function (  oneFilter) {
                            f = {
                                field: oneFilter.field,
                                query: oneFilter.query
                            }
                            if (oneFilter.operator != null)
                                f.operator = oneFilter.operator; 
                            if (oneFilter.sQuery != null)
                                f.sQuery = oneFilter.sQuery; 
                            return f;
                        })
                        break
                    }
                    case "additionalFields":
                    case "facet":
                    case "nonRecursiveCatalogsWalking":
                    case "hlFragSize":
                    case "idOnly":
                    case "facetLimit":
                    case "uid":
                    case "hlColors": {
                        // do not add to cleanRequest
                        break
                    }
                    case "useLingvo": {
                        if (request[key]) {
                            cleanRequest[key] = request[key]
                        }
                        break
                    }
                    case "start": {
                        if (request[key] != 0) {
                            cleanRequest[key] = request[key]
                        }
                        break
                    }
                    case "type": {
                        if (request[key] != "QUERY") {
                            cleanRequest[key] = request[key]
                        }
                        break
                    }
                    case "mode": {
                        if (request[key] != "SIMPLE") {
                            cleanRequest[key] = request[key]
                        }
                        break
                    }
                    case "shards": {
                        if (request[key].length != 0) {
                            cleanRequest[key] = request[key]
                        }
                        break
                    }
                    //                    case "sortField" : {
                    //                        if (request[key] != "score") {
                    //                            cleanRequest[key] = request[key]
                    //                        }
                    //                        break
                    //                    }
                    //                    case "sortOrder" : {
                    //                        if (request[key] != "desc") {
                    //                            cleanRequest[key] = request[key]
                    //                        }
                    //                        break
                    //                    }
                    default: {
                        cleanRequest[key] = request[key];
                    }
                }

            }
        }
    }
    return cleanRequest
}


// копирует из searchRequest все фильтры, сортировки, группировки в новый объект
// при этом удаляет их в исходном объекте
function moveSearchRequestFilters(request) {
    var newRequest = {}

    if (request) {
        [
            "filter",
            "customFilters",
            "filterGroups",
            "customFilterGroups",
            "groups",
            "dateFrom",
            "dateTo",
            "sortOrder",
            "sortField",
            "groupField",
            "joinFrom",
            "joinTo",
            "sorts"
        ].forEach(function (field) {
            if(typeof request[field]!=='undefined' && request[field]!==null)newRequest[field] = request[field];
            //request[field] = null;
        })
    }

    return newRequest;
}

function isEqualOrNotAssign(a, b, defaultValue) {
    var equal = false;
    if (isValueOK(defaultValue)) {
        if ((a === b) || ((isValueNotOK(a) || a == defaultValue) && (isValueNotOK(b) || b == defaultValue))) {
            equal = true;
        }

    } else {
        if ((a === b) || (isValueNotOK(a) && isValueNotOK(b))) {
            equal = true;
        }
    }
    return equal;
}


function isEqualOrNotAssignArrays(a, b, ignoreOrder) {
    // сравниваются атрибуты в которых могут быть массивы примитивных значений
    // они сравниваются с учетом порядка элементов
    var equal = false,
        isOkA = isValueOK(a),
        isOkB = isValueOK(b);

    if (isOkA && isOkB) {
        if (ignoreOrder) {
            var La = a.length,
                Lb = b.length;

            if (La == Lb) {
                equal = true;
                var mapA = {};
                for (var i = 0; i < La; i++) {
                    mapA[a[i]] = true;
                }
                for (var i = 0; i < Lb; i++) {
                    if (!mapA[b[i]]) {
                        equal = false;
                    }
                }
            }

        } else {
            if (a.join(",") === b.join(",")) {
                equal = true;
            }
        }

    } else if (!isOkB && isOkB) {
        if (b.length == 0) {
            equal = true;
        }
    } else if (isOkB && !isOkB) {
        if (a.length == 0) {
            equal = true;
        }
    } else {
        equal = true;
    }

    return equal;
}


function isSameCustomFilter(customFilterA, customFilterB) {
    // сравнение значений полей в которых могут быть списки объектов, аналогичных SearchRequest.customFilter
    var equal = false,
        isOkA = isValueOK(customFilterA),
        isOkB = isValueOK(customFilterB),
        LA = (isOkA) ? customFilterA.length : -1,
        LB = (isOkB) ? customFilterB.length : -1;

    if (LA == LB) {
        if (LA > 0) {
            // оба заданы и не пустые
            var hasNewFilters = false;

            jQuery.each(customFilterB, function (i, filter) {
                if (!CustomFilterLoader.isHasThisFilter(filter, customFilterA)) {
                    hasNewFilters = true;
                }
            })

            if (!hasNewFilters) {
                equal = true;
            }

        } else {
            // оба пустые или оба не заданы
            equal = true;
        }

    } else if (LA - 1 < 0 && LB - 1 < 0) {
        // один из массивов задан, другой - нет
        // если размеры массивов 0 и -1 то вычитая 1 оба размера становятся меньше 0
        equal = true;
    }

    return equal;
}


function isSameFilter(filterA, filterB) {
    // сравнение значений полей в которых могут быть списки объектов, аналогичных SearchRequest.filter
    var equal = false,
        isOkA = isValueOK(filterA),
        isOkB = isValueOK(filterB),
        LA = (isOkA) ? filterA.length : -1,
        LB = (isOkB) ? filterB.length : -1;

    if (LA == LB) {
        if (LA > 0) {
            // оба заданы и не пустые
            var hasNewFilters = false,
                filterBMap = {};

            jQuery.each(filterB, function (i, filter) {
                if (!filterBMap[filter.field]) {
                    filterBMap[filter.field] = {}
                }
                filterBMap[filter.field][filter.query] = true;
            })

            jQuery.each(filterA, function (i, filter) {
                if (!filterBMap[filter.field] || !filterBMap[filter.field][filter.query]) {
                    hasNewFilters = true;
                }
            })

            if (!hasNewFilters) {
                equal = true;
            }

        } else {
            // оба пустые или оба не заданы
            equal = true;
        }

    } else if (LA - 1 < 0 && LB - 1 < 0) {
        // один из массивов задан, другой - нет
        // если размеры массивов 0 и -1 то вычитая 1 оба размера становятся меньше 0
        equal = true;
    }

    return equal;
}


function isSameRequest(requestA, requestB) {
    var ok = true;

    if (SearchInst.modes.isMultiquery(requestA.type) && SearchInst.modes.isMultiquery(requestB.type)) {
        try {
            var queryRequestB;
            jQuery.each(requestA.multiqueryRequest.queryRequests, function (i, queryRequestA) {
                queryRequestB = requestB.multiqueryRequest.queryRequests[i];
                if (queryRequestA.type != queryRequestB.type
                    || !isEqualOrNotAssign(queryRequestA.not, queryRequestB.not, false)
                    || !isEqualOrNotAssign(queryRequestA.operator, queryRequestB.operator, "AND")) {
                    ok = false;

                } else {
                    if (queryRequestA.type == Data.multiqueryTypes.Q) {
                        ok = isSameRequest(JSON.parse(queryRequestA.request), JSON.parse(queryRequestB.request));

                    } else {
                        if (queryRequestA.queryId !== queryRequestB.queryId) {
                            ok = false;
                        }
                    }
                }
            })

        } catch (e) {
            ok = false;
        }

        // simple
    } else if (SearchInst.modes.isSimple(requestA.mode) && SearchInst.modes.isSimple(requestB.mode)) {
        if (requestA.query !== requestB.query
            || !isEqualOrNotAssign(requestA.type, requestB.type, "QUERY")
            || !isEqualOrNotAssign(requestA.simpleSearchFieldsBundle, requestB.simpleSearchFieldsBundle, Data.DEFAULT_BUNDLE_NAME)) {
            ok = false;
        }

        // extended
    } else if (SearchInst.modes.isExtended(requestA.mode) && SearchInst.modes.isExtended(requestB.mode)) {
        if (requestA.typeRequests && requestB.typeRequests) {
            var typeRequestB, fieldRequestB, fieldRequestGroupB;
            jQuery.each(requestA.typeRequests, function (i, typeRequestA) {
                if (!ok) {
                    return false;
                }

                typeRequestB = requestB.typeRequests[i];

                if (typeRequestA.name == typeRequestB.name) {
                    // проверяем оператор между typeRequest
                    if (!isEqualOrNotAssign(typeRequestA.typesMode, typeRequestB.typesMode, null)) {
                        ok = false;
                        return false;
                    }

                    // по всем атрибутам
                    if (isValueOK(typeRequestA.query)) {
                        if (typeRequestA.query !== typeRequestB.query
                            || typeRequestA.operator !== typeRequestB.operator
                            || !isEqualOrNotAssign(typeRequestA.mode, typeRequestB.mode, "AND")) {
                            ok = false;
                            return false;
                        }
                    }

                    // по каждому атрибуту
                    ok = isSameFieldRequests(typeRequestA.fieldRequests, typeRequestB.fieldRequests);

                    // по группам атрибутов
                    if (ok && typeRequestA.fieldRequestGroups && typeRequestB.fieldRequestGroups) {
                        if (ok && typeRequestA.fieldRequestGroups.length != typeRequestB.fieldRequestGroups.length) {
                            ok = false;

                        } else {
                            jQuery.each(typeRequestA.fieldRequestGroups, function (j, fieldRequestGroupA) {
                                fieldRequestGroupB = typeRequestB.fieldRequestGroups[j];
                                if (!isEqualOrNotAssign(fieldRequestGroupA.mode, fieldRequestGroupB.mode, Data.FIELD_REQUEST_GROUP__DEFAULT__MODE)) {
                                    ok = false;
                                    return false;
                                } else if (!isEqualOrNotAssign(fieldRequestGroupA.groupMode, fieldRequestGroupB.groupMode, Data.FIELD_REQUEST_GROUP__DEFAULT__GROUP_MODE)) {
                                    ok = false;
                                    return false;
                                } else if (!isSameFieldRequests(fieldRequestGroupA.fieldRequests, fieldRequestGroupB.fieldRequests)) {
                                    ok = false;
                                    return false;
                                }
                            })
                        }
                    }

                } else {
                    ok = false;
                    return false;
                }

            })
        }

        // dictionary
    } else if (SearchInst.modes.isDictionary(requestA.mode) && SearchInst.modes.isDictionary(requestB.mode)) {
        if (requestA.dictionaryName !== requestB.dictionaryName
            || !isEqualOrNotAssignArrays(requestA.dictionaryElementTags, requestB.dictionaryElementTags)) {
            ok = false;
        }

        // catalog
    } else if (SearchInst.modes.isCatalog(requestA.mode) && SearchInst.modes.isCatalog(requestB.mode)) {
        if (requestA.catalogId !== requestB.catalogId) {
            ok = false;
        }

        // object
    } else if (SearchInst.modes.isObject(requestA.mode) && SearchInst.modes.isObject(requestB.mode)) {
        if (requestA.sourceField !== requestB.sourceField
            || requestA.linkValue !== requestB.linkValue
            || requestA.linkOperator !== requestB.linkOperator
            || !isEqualOrNotAssignArrays(requestA.groups, requestB.groups)) {
            ok = false;
        }

        // link
    } else if (SearchInst.modes.isOpenedByLink(requestA.mode) && SearchInst.modes.isOpenedByLink(requestB.mode)) {
        if (requestA.sourceField !== requestB.sourceField
            || requestA.linkValue !== requestB.linkValue
            || !isEqualOrNotAssignArrays(requestA.groups, requestB.groups)) {
            ok = false;
        }

        // history
    } else if (SearchInst.modes.isHistory(requestA.mode) && SearchInst.modes.isHistory(requestB.mode)) {
        if (requestA.historyQueryId !== requestB.historyQueryId) {
            ok = false;
        }

    } else {
        ok = false;
    }


    return ok;
}

function isSameFieldRequests(fieldRequestsA, fieldRequestsB) {
    var ok = true,
        isOkA = isValueOK(fieldRequestsA),
        isOkB = isValueOK(fieldRequestsB),
        fieldRequestB;

    if ((isOkA && !isOkB) || (!isOkA && isOkB)) {
        ok = false;

    } else if (isOkA && isOkB) {
        if (fieldRequestsA.length != fieldRequestsB.length) {
            ok = false;

        } else {
            jQuery.each(fieldRequestsA, function (j, fieldRequestA) {
                fieldRequestB = fieldRequestsB[j];
                if (fieldRequestA.name != fieldRequestB.name
                    || fieldRequestA.query != fieldRequestB.query
                    || fieldRequestA.operator != fieldRequestB.operator
                    || !isEqualOrNotAssign(fieldRequestA.sQuery, fieldRequestB.sQuery, null)) {
                    ok = false;
                    return false;

                }
            })
        }
    }
    return ok;
}


function isSameRequestFilters(requestA, requestB) {
    var ok = true;

    // customFilters
    ok = isSameCustomFilter(requestA.customFilters, requestB.customFilters);

    // dateFrom
    if (ok) {
        ok = requestA.dateFrom === requestB.dateFrom;
    }

    // dateTo
    if (ok) {
        ok = requestA.dateTo === requestB.dateTo;
    }

    // directFilters
    if (ok) {
        ok = isSameCustomFilter(requestA.directFilters, requestB.directFilters);
    }

    // filter
    if (ok) {
        ok = isSameFilter(requestA.filter, requestB.filter);
    }

    // groups
    if (ok) {
        ok = isEqualOrNotAssignArrays(requestA.groups, requestB.groups);
    }

    // joinFrom
    if (ok) {
        ok = requestA.joinFrom === requestB.joinFrom;
    }

    // joinTo
    if (ok) {
        ok = requestA.joinTo === requestB.joinTo;
    }

    // shards
    if (ok) {
        ok = isEqualOrNotAssignArrays(requestA.shards, requestB.shards);
    }

    // staticFilters
    if (ok) {
        ok = isSameCustomFilter(requestA.staticFilters, requestB.staticFilters);
    }

    return ok;
}

// Создана из ui.nameEditor 
    nameEditor = function(el,options){
        if(arguments.length>0){
            if(!(el instanceof Node)){
                if(el[0] instanceof Node)el = el[0];
                else return console.error('Не верный тип аргумента Node');
            }
            var ElNameEditor = ElememtData(el,'ElNameEditor');
            if(!options || typeof options === 'object'){
                if(ElNameEditor){
                    ElNameEditor.destroy();
                }
                ElNameEditor  = new nameEditor();
                ElNameEditor.element = el;
                ElNameEditor.options = Object.assign(JSON.clone(nameEditor.prototype.options),options)
                ElememtData(el,'ElNameEditor',ElNameEditor);
                ElNameEditor.init();
            }else if(ElNameEditor && ElNameEditor[options]){
                ElNameEditor[options]()
            }
        }
    }
    nameEditor.prototype = {

        // Здесь задается список настроек и их значений по умолчанию
        options: {
            editors : [
//                {
//                    key : "keyName",          // ключевое имя поля
//                    text : "someText",        // текст, отображаемый перед инпутом
//                    value : "initialValue"    // начальное значение
//                }
            ],
            ignoredElements : [],
            ignoredClasses : [
                'ArionWindowDiv',
                'ArionWindowCloseButton',
                'crossInInput'
            ],
            enterCallback : undefined,
            escCallback : undefined,
            outerClass : "nameEditor-outer",
            textClass : "nameEditor-text",
            inputClass : "nameEditor-input",
            resizeInput : true,
            useWait : false, //Блокировка после нажатия Enter (исключает повторную отправку)
        },

        // Функция, вызываемая при активации виджета на элементе
        init: function( ) {
            this.editors = [];
            this.minInputWidth = 0;
            var _= this;

            if(_.options.editors)
            _.options.editors.forEach(_._addEditor,_) 

            if(this.options.resizeInput){
                _.editors.forEach(function( editor){
                    editor.input.style.width = _.minInputWidth + 'px'; 
                })
            }
            _.click = _._click.bind(_)
            var time = setTimeout(function(){
                clearTimeout(time);
                
                document.addEventListener('click',_.click ) 
            }, 100);

            var input = _.editors[0].input;
            if(input){ 
                input.focus();
                input.selectionStart = input.value.length;
            }


        },

        destroy: function() {
            this.element.style.width = "100%";
            this.editors.forEach( function(elem){
                elem.outer.remove()
            })
            document.removeEventListener('click',this.click )  
            this.disabled = false
        },
        
        disable : function(ok){
            this.disabled = true;
            this.editors.forEach(function(editor){
                editor.input.toggleAttribute('readonly',ok);
                editor.outer.classList.toggle('wait',ok);
            })
        },

        _addEditor : function(editor){
            var _ = this, options = _.options;
            var outer = SPAN({className : options.outerClass}) 
            this.element.after(outer)
            this.element.style.width = 'auto'; 

            var textSpan = SPAN({className:options.textClass, parentElement: outer},editor.text) 
            var input = INPUT({value:editor.value,className:options.inputClass, parentElement: outer}) 
            input.addEventListener('keydown',function(ev){
                ev.stopPropagation()
                if(_.disabled)
                    ev.preventDefault();
                else
                if (ev.key === "Enter" || ev.keyCode == 13) { // enter 13
                    _._enter.call(_);
                    if(options.useWait)_.disable(true)
                    ev.preventDefault();
                }
                else if (ev.key === 'Escape' || ev.keyCode == 27) {  // esc
                    _._cancel.call(_);
                    ev.preventDefault();
                }

            })
            input.addEventListener('click',function(e){
                e.stopPropagation();
            })

            this.options.ignoredElements.push(input)

            var width = outer.clientWidth - textSpan.clientWidth - 10;

            this.editors.push({
                editor : editor,
                outer : outer,
                input : input,
                width : width
            })

            if(!this.minInputWidth){
                this.minInputWidth = width;
            }else if(this.minInputWidth > width){
                this.minInputWidth = width;
            }
        },

        _enter : function(){
            if(typeof this.options.enterCallback === 'function'){
                var values = this.getValues.call(this);
                this.options.enterCallback.call(this, values)
            }
        },

        _cancel : function(){
            if(typeof this.options.escCallback === 'function'){
                this.options.escCallback.call(this)
            }
            this.destroy()
        },

        _click : function(e){
            var target = e.target;
            if(target === document)return

            while (target && target !== document && !this._checkIgnoredElements(target) && !this._checkIgnoredClasses(target)) {
                target = target.parentNode;
            }
            if (target === null || target === document || (!this._checkIgnoredElements(target) && !this._checkIgnoredClasses(target))) {
                this._enter()
            }
        },

        _checkIgnoredElements : function(target){ 
            return !!this.options.ignoredElements.find(function(elem){
                return target === elem
            }) 
        },

        _checkIgnoredClasses : function(target){ 
            return !!this.options.ignoredClasses.find(function(cls){
                return target.classList.contains(cls)
            }) 
        },

        getValues : function(){
            var values = {};
            this.editors.forEach( function(  elem){
                values[elem.editor.key] = {
                    key : elem.editor.key,
                    value : elem.input.value,
                    initValue : elem.editor.value,
                    text : elem.editor.text
                }
            })
            return values
        }
    }  


var TestComparators = {

    isSameCustomFilterTest: function () {
        var values = [
            {
                A: null,
                B: [
                    {
                        name: "testName",
                        operator: "C",
                        query: "777"
                    }
                ],
                equal: false
            },
            {
                A: [
                    {
                        name: "testName",
                        operator: "C",
                        query: "777"
                    },
                    {
                        name: "testName",
                        operator: "C",
                        query: "999"
                    },
                    {
                        name: "testName2",
                        operator: "B",
                        query: "888"
                    }
                ],
                B: [
                    {
                        name: "testName",
                        operator: "C",
                        query: "777"
                    },
                    {
                        name: "testName",
                        operator: "C",
                        query: "999"
                    },
                    {
                        name: "testName2",
                        operator: "B",
                        query: "888"
                    }
                ],
                equal: true
            },
            {
                A: [
                    {
                        name: "testName",
                        operator: "C",
                        query: "777"
                    },
                    {
                        name: "testName",
                        operator: "C",
                        query: "999"
                    }
                ],
                B: [
                    {
                        name: "testName",
                        operator: "C",
                        query: "777"
                    },
                    {
                        name: "testName",
                        operator: "C",
                        query: "999"
                    },
                    {
                        name: "testName2",
                        operator: "B",
                        query: "888"
                    }
                ],
                equal: false
            },
            {
                A: null,
                B: null,
                equal: true
            },
            {
                A: [],
                B: [],
                equal: true
            },
            {
                A: null,
                B: [],
                equal: true
            }
        ]

        var res;
        jQuery.each(values, function (i, value) {
            res = isSameCustomFilter(value.A, value.B);
            consoleDebug("test isSameCustomFilter " + (value.equal === res));
        })
    },

    isSameFilterTest: function () {
        var values = [
            {
                A: null,
                B: [
                    {
                        field: "testName",
                        query: "777"
                    }
                ],
                equal: false
            },
            {
                A: [
                    {
                        field: "testName",
                        query: "777"
                    },
                    {
                        field: "testName",
                        operator: "C",
                        query: "999"
                    },
                    {
                        field: "testName2",
                        query: "888"
                    }
                ],
                B: [
                    {
                        field: "testName",
                        query: "777"
                    },
                    {
                        field: "testName",
                        operator: "C",
                        query: "999"
                    },
                    {
                        field: "testName2",
                        query: "888"
                    }
                ],
                equal: true
            },
            {
                A: [
                    {
                        field: "testName",
                        query: "777"
                    },
                    {
                        field: "testName",
                        query: "999"
                    }
                ],
                B: [
                    {
                        field: "testName",
                        query: "777"
                    },
                    {
                        field: "testName",
                        query: "999"
                    },
                    {
                        field: "testName2",
                        query: "888"
                    }
                ],
                equal: false
            },
            {
                A: null,
                B: null,
                equal: true
            },
            {
                A: [],
                B: [],
                equal: true
            },
            {
                A: [],
                B: null,
                equal: true
            }
        ]

        var res;
        jQuery.each(values, function (i, value) {
            res = isSameFilter(value.A, value.B);
            consoleDebug("test isSameFilter " + (value.equal === res));
        })
    },

    isEqualOrNotAssignArraysTest: function () {
        var values = [
            {
                A: [1, 2, 3],
                B: [1, 2, 3],
                equal: true
            },
            {
                A: [1, 2],
                B: [1, 2, 3],
                equal: false
            },
            {
                A: [1, 3, 2],
                B: [1, 2, 3],
                equal: false
            },
            {
                A: [1, "2", "3"],
                B: [1, 2, 3],
                equal: true
            },
            {
                A: null,
                B: null,
                equal: true
            },
            {
                A: [],
                B: [],
                equal: true
            },
            {
                A: [],
                B: null,
                equal: true
            }
        ]

        var res;
        jQuery.each(values, function (i, value) {
            res = isEqualOrNotAssignArrays(value.A, value.B);
            consoleDebug("test isEqualOrNotAssignArrays " + (value.equal === res));
        })
    }

}


function resizeImg(img, maxW, maxH) {
    if (maxW && maxH) {
        if (img.height > maxH || img.width > maxW) {
            if (img.width / (img.height / maxH) > maxW) {
                img.height = img.height / (img.width / maxW);
                img.width = maxW;
            } else {
                img.width = img.width / (img.height / maxH);
                img.height = maxH;
            }
        }
    }
}


function getFieldValue(bigsDocumentField, showSeconds, addEmptyText, allowEmptyStr) {
    var formatted = null, pure = null, type = null;

    if (bigsDocumentField) {
        if (isValueOK(bigsDocumentField["dateValue"])) {
            var field = Data.allFieldsByName[bigsDocumentField.name];
            var addTime = (field && field.viewType == SearchTemplate.NO_TIME.name) ? false : true;
            formatted = fromIsoToStringDateTime(bigsDocumentField["dateValue"], addTime, showSeconds);
            pure = bigsDocumentField["dateValue"];
            type = "DATE";

        } else if (isValueOK(bigsDocumentField["longValue"])) {
            pure = bigsDocumentField["longValue"];
            formatted = formatLong(pure);
            type = "LONG";

        } else if (isValueOK(bigsDocumentField["doubleValue"])) {
            pure = bigsDocumentField["doubleValue"];
            formatted = formatDouble3(pure);
            type = "DOUBLE";

        } else if (isValueOK(bigsDocumentField["linkName"])) {
            formatted = bigsDocumentField["linkName"];
            pure = formatted;
            type = "LINK";

        } else if (isValueOK(bigsDocumentField["value"])) {
            formatted = bigsDocumentField["value"];
            pure = formatted;
            type = "TEXT";

        } else if (allowEmptyStr && isNotUndefinedOrNull(bigsDocumentField["value"])) {
            formatted = bigsDocumentField["value"];
            pure = formatted;
            type = "TEXT";
        }
    }

    if (formatted == null && addEmptyText) {
        formatted = "Не заполнено";
    }

    return {
        formatted: formatted,
        pure: pure,
        type: type
    }
}

function getEmptyFieldValue() {
    return {
        dateValue: null,
        doubleValue: null,
        linkName: null,
        longValue: null,
        value: null
    }
}


function selectText($elem) {
    var target = $elem instanceof Node ? $elem : $elem && $elem.length > 0 ? $elem[0] : null;
    if (target) { 
        var rng, sel;
        if (document.createRange) {
            rng = document.createRange();
            rng.selectNode(target)
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(rng);
        } else {
            var rng = document.body.createTextRange();
            rng.moveToElementText(target);
            rng.select();
        }
    }
}


//  фокус переходит на инпут и курсор ствится в конце текста
function focusAtEnd(inpt) {
    var input = inpt[0] || inpt;
    input.focus();
    input.selectionStart = input.value.length;
}




function actionQueue(list) {
    var i,
        j,
        L = list.length,
        current = 0,
        currentL;
    for (i = 0; i < L; i++) {

        currentL = list[i].length;
        current = 0;
        for (j = 0; j < currentL; j++) {
            list[i][j](function () {
                current++;
                if (current < currentL + 1) {
                    //                    next();
                }
            })
        }

    }
}


/*
    позволяет последовательно выполнить список функций.
    точка входа - метод start,
    параметры:
    list - двумерный список списков функций.
        функции в каждом уровне list будут запущены одновременно,
        функции следующего уровня начнут выполняться только после завершения всех функций текущего уровня
    callback - будет вызван после завершения всех функций в list

    каждая функция в list должна принимать аргумент - коллбек после её выполнения
 */
ActionQueue = {

    // список функций либо списков функций,
    // на каждом уровне они будут запущены одновремено
    list: [],
    // коллбек после выполнения всех функций
    callback: null,

    // количество уровней
    levelSize: 0,
    // текущий уровень
    level: 0,

    // количество функций на одном уровне
    count: 0,
    // количество завершенных функций на одном уровне
    finishedCount: 0,

    start: function (list, callback) {
        if (list) {
            ActionQueue.list = list;
            ActionQueue.callback = callback;
            ActionQueue.levelSize = list.length - 1;
            ActionQueue.level = 0;

            ActionQueue._nextLevel();
        }
    },

    _nextLevel: function () {
        ActionQueue.finishedCount = 0;
        var level = ActionQueue.list[ActionQueue.level];

        ActionQueue.count = level.length
        for (var i = 0; i < ActionQueue.count; i++) {
            level[i](ActionQueue._finished);
        }
    },

    _finished: function () {
        ActionQueue.finishedCount++;

        if (ActionQueue.finishedCount == ActionQueue.count) {
            if (ActionQueue.level == ActionQueue.levelSize) {
                if (typeof (ActionQueue.callback) === 'function') {
                    ActionQueue.callback();
                }

            } else {
                ActionQueue.level++;
                ActionQueue._nextLevel();
            }
        }
    }

}



function jqShow(elem, force) { 
    if (elem) elem.removeClass((force) ? "hideForce" : "hide");
    return elem;
}

function jqHide(elem, force) { 
    if (elem) elem.addClass((force) ? "hideForce" : "hide");
    return elem;
}

var toggleEl = function (/*elem, show, force*/) { 

    var elem = arguments, show, force,
    l = 1,  
    e = elem[0];
        
    for(l=1;l<elem.length;l++)
        if(typeof elem[l] === 'boolean'){
            show = elem[l];
            force = elem[l+1];
            break;
        };

    if( (typeof e === 'object') && !(e instanceof Element)&& e && ('length' in e)){
        elem = elem[0];
        l = elem.length;
    } 

    var showing = false, 
    className = force ? "hideForce" : "hide";

    for(var i=0; i< l; i++){
        e = elem[i];
        if (typeof e === 'string') e = document.querySelector(e);
        if (e instanceof Element) {
           if(typeof show === 'boolean') 
                showing = !e.classList.toggle(className, !show); 
            else
                showing = !e.classList.toggle(className);  
            
        }
    } 
    return showing;
 
}
// Переводит elem.style.display в значение none и обратно. 
// Поддерживает: инверция текущего значения, автоматическое назначение, строка
var toggleElDisplay = function (/*elem, show, safe || elem, display, show*/) { 
    toggleElDisplay.displayData = toggleElDisplay.displayData || new Map();
    var showing = false, 
        A = arguments, show, safe = false,
        list = [], st = 0, l,i,j,
        e = A[0], 
        display, _display_ = '', _show_, mask = /[^a-z-]/; 
    for(i=0;i<A.length;i++ ){
        if( typeof A[i] === 'boolean' ||  typeof A[i] === 'string'  && !mask.test( A[i] )) {//elem, show, safe || elem, display, show
            if(typeof A[i] === 'boolean')show = A[i];
            else show = _display_ = A[i];
            if(typeof A[i+1] === 'boolean'){
                i++;
                if(typeof show === 'boolean') safe = A[i];
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
                        toggleElDisplay.displayData.set(e, display);//Запоминает предыдущее значение
                        if(_show_ === '' && safe === false) _show_ = display;
                    }else if (_show_ === '' && safe === false){
                        _show_ = toggleElDisplay.displayData.get(e);
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



eVALIDATOR = function(e,f){
    var value;
    if(!e)return; 
        var d, list, i=0;
        if( (typeof e === 'object') && !(e instanceof Element) && e && ('length' in e)){
            list = e;
        }
        do{
            e = list ? list[i] : e;
            if(e  && e!==0){ 
                 switch(e.type){
                     case 'checkbox':
                         value = e.checked;
                        e.addEventListener('change',function(){
                            if(!f(this,!this.checked,this.checked))this.checked = !this.checked;
                            else value = this.checked;
                        });
                    break;
                     case 'radio':
                         if(e.checked)value = e.value;
                        e.addEventListener('change',function(){
                            var _list = list || this.closest('form, body').querySelectorAll('input[name="'+this.name+'"]');
                            var cur = _list.find(function(inp){return inp.checked});
                            if(!f(this,value,cur&&cur.value)){
                                _list.forEach(function(inp){
                                    inp.checked = inp.value === value;
                                })
                            }else{
                                value = cur.value;
                            }
                        });
                    break;
                    default :
                        value = e.value;
                        e.addEventListener('change',function(){
                            if(!f(this,value,this.value))this.value = value;
                            else value = this.value;
                        });
                 }
            }
            i++
        }while(list&&i<list.length);
}


/* добавление/удаления события. В отличае от стандартного, поддерживает:
    - добавление одной функции на несколько элементов/событий, 
    - препятствование повторному добавлению одной и тойже функции (но только, если она была добавленна через негоже)
    - специальные события (ради которых, собственно, оно и делалось)
*/
EV = {
    specialEvents : {//Спец. события
        '$resize' : {// Изменение размеров блока
            inited : false,
            init : function(){
                var _ = this;
                if( !_.inir && _.list.size > 0 ){
                    _.inir = setInterval(function(){
                        _.list.forEach(function(size,e){
                            if(e.offsetParent){ 
                                if( size[0]!==e.clientWidth || size[1]!==e.clientHeight ){
                                    size[0]=e.clientWidth; size[1]=e.clientHeight;
                                    e.dispatchEvent(new CustomEvent('$resize'));
                                }
                            }
                        });
                        if(_.list.size === 0){
                            clearInterval(_.inir);
                            delete _.inir;
                        }
                    },62.5); 
                }
                
            },
            list : new Map(),
            'add' : function( e, o ){  
                this.list.set(e,[e.clientWidth, e.clientHeight]);
                this.init();
            },
            'remove' : function( e, o ){
                this.list["delete"](e);
            },
        },
    },
    reg : {
        list : new Map(),
        'add' : function(e, t, f, o){ 
            var d = this.list.get(e);
            if(!d){
                d = {}
                this.list.set(e,d);
            } 
            var ls = d[t] || new Map();
            if(ls.has(f)){ 
                return false;
            }
            ls.set(f,true);
            d[t] = ls;
            return true;
        },
        'remove' : function(e, type, f, o){
            var d = this.list.get(e) || {}, ls = d[t];
            if(ls)ls["delete"](f); 
            return true;
        },
    },
    toggle : function( fn, e, type, f, o ){
         
        if(!e || !type || !f)return;

        var  list, i = 0, j=0, t;

        if(typeof fn === 'boolean')fn = fn ? 'add' : 'remove';

        
        if( (typeof e === 'object') && !(fn + 'EventListener' in e) && e && ('length' in e))list = e;

        if(typeof type === 'string' && type.indexOf(' ')!==-1)type = type.split(' '); 
        
        do{
            e = list ? list[i++] : e;  
            if(!(fn + 'EventListener' in e))continue;
            j =0;
            do{
                t = type === 'object' ? type[j++] : type;
                if(!t)continue;
                if(EV.reg[fn](e,t,f,o)){
                    if(EV.specialEvents[t])EV.specialEvents[t][fn](e,o)
                    e[fn + 'EventListener'](t,f,o);
                    if(fn === 'add' && o && o.once){
                        e.addEventListener(t,function(){EV.toggle('remove',e,t,f,o)}, {once : true});
                    }
                }
            }while( typeof type === 'object' && j<type.length);


 
        }while(list&&i<list.length);
    },
    add : function(){
        var A = arguments,  e = A[0], i = 1;
        if(this instanceof Node || typeof A[1] === 'function'){
            e = this;
            i = 0;
        }
        EV.toggle('add',e, A[i], A[i+1], A[i+2]);
    },
    remove : function(){
        var A = arguments,  e = A[0], i = 1;
        if(this instanceof Node || typeof A[1] === 'function'){
            e = this;
            i = 0;
        }
        EV.toggle('remove',e, A[i], A[i+1], A[i+2]);
    }
}

ON = Element.prototype.ON = EV.add;

OFF = Element.prototype.OFF = EV.remove;


// замена jQuery.extend(true, {}, obj);
// работает быстрее, надо проверить хорошо ли клонирует
//var cloned = {
//    types : {},
//    fields : {},
//    others : []
//}
function deepCloneObject(o) {
    //    return jQuery.extend(true, {}, o);

    //    Intervals.begin("deepCloneObject")
    var c = _deepCloneObject(o);

    //    if (o.operators !== undefined) {
    //        if (cloned.fields[o.__typeName] == undefined) {
    //            cloned.fields[o.__typeName] = {};
    //        }
    //        if (cloned.fields[o.__typeName][o.name] == undefined) {
    //            cloned.fields[o.__typeName][o.name] = 0;
    //        }
    //        cloned.fields[o.__typeName][o.name]++;
    //
    //    } else if (o.name && o.fields) {
    //        if (cloned.types[o.name] == undefined) {
    //            cloned.types[o.name] = 0;
    //        }
    //        cloned.types[o.name]++;
    //
    //    } else {
    //        cloned.others.push(o);
    //    }

    //    Intervals.end("deepCloneObject")
    return c;
}

function _deepCloneObject(o) {

    //    if(!o || "object" !== typeof o)  {
    //        return o;
    //    }
    //    var c = "function" === typeof o.pop ? [] : {};
    //
    //    var p, v;
    //    for(p in o) {
    //        if(o.hasOwnProperty(p)) {
    //            v = o[p];
    //            if(v && "object" === typeof v) {
    //                c[p] = _deepCloneObject(v);
    //            }else {
    //                c[p] = v;
    //            }
    //        }
    //    }

    if (o == undefined || "object" !== typeof o) {
        return o;
    }
    var c = Array.isArray(o) ? [] : {};

    var p, v;
    for (p in o) {
        //        if(o.hasOwnProperty(p)) {
        v = o[p];
        c[p] = _deepCloneObject(v);
        //        }
    }
    return c;
}


function cloneObjectOneLevel(o) {
    if (!o || "object" !== typeof o) {
        return o;
    }
    var c = "function" === typeof o.pop ? [] : {};

    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && "object" === typeof v) {
            } else {
                c[p] = v;
            }
        }
    }
    return c;
}


function testClone() {
    if (!window.metadata) {
        return;
    }

    var src = metadata.types;
    var test = deepCloneObject(src);

    test[0].icon = 111111;
    test[0].fields[0].comment = "test1111111";

    var test1 = src[0].icon === test[0].icon;
    var test2 = test[0].fields[0].comment === src[0].fields[0].comment;

    consoleDebug("test1=" + test1 + "   test2=" + test2);
}


var CrossInInput = {

    crossElem: null,
    crossElemW: 0,
    crossElemH: 0,

    focusInput: null,


    init: function () {
        CrossInInput.crossElem = jQuery("<div id='crossInInput' class='crossInInput'></div>");
        jQuery("body").append(CrossInInput.crossElem);

        jQuery(document)
            .on("focus", "input[readonly!='readonly']", function (e) {
                var $target = jQuery(e.target);
                var type = $target.attr("type");
                if ($target.is("input") && (type == "text" || !type)) {
                    CrossInInput.connect($target);

                }
            })
            .on("mouseenter", "input[readonly!='readonly']", function (e) {
                var $target = jQuery(e.target);
                var type = $target.attr("type");
                if ($target.is("input") && (type == "text" || !type)) {
                    CrossInInput.connect($target);

                }
            })
            .on("mouseleave", "input[readonly!='readonly']", function (e) {
                if (!e.toElement || !jQuery(e.toElement).is(CrossInInput.crossElem)) {
                    CrossInInput._hide();
                }
            })
            .click(function (e) {
                var $target = jQuery(e.target);
                var type = $target.attr("type");
                if ($target.is("input") && (type == "text" || !type)) {
                    // ничего делать не надо, все сработает при событии focus

                } else if ($target.hasClass("crossInInput")) {
                    if (CrossInInput.focusInput) {
                        CrossInInput.focusInput.val("");
                        CrossInInput.focusInput.trigger("change", e);
                        CrossInInput._hide();
                        CrossInInput.focusInput.focus();

                        // кастомное событие при очистке инпута крестиком
                        CrossInInput.focusInput.trigger("crossInInput.clear", e);
                        // CrossInInput.focusInput.trigger("change", e);  
                        CrossInInput.focusInput[0].dispatchEvent( new CustomEvent("change") )
                        CrossInInput.focusInput[0].dispatchEvent( new CustomEvent("clear") )

                        if (Data.isPortalWindow || Data.isOperatorWindow) {
                            SearchInst.checkSearchAbility();

                        } else if (Data.isSecWindow) {
                            SecDeletePortal.checkSearchAbility();
                        }
                    }

                } else {
                    CrossInInput.disconnect();
                }
            })

        if (typeof FlyMenu != "undefined") {
            FlyMenu.addShowMenuCallback(function () {
                CrossInInput.blur();
            })
        }
    },

    // ручное подключение инпутов события от которых не доходят до document, например автокомплиты
    attach: function (input) {
        jQuery(input)
            .on("focus.crossInInput", function (e) {
                CrossInInput.connect(jQuery(this));
            })
    },

    connect: function (input) {
        if (CrossInInput.focusInput) {
            CrossInInput.focusInput.unbind("keyup.crossInInput");
        }

        CrossInInput.focusInput = input;
        if (CrossInInput.focusInput) {
            CrossInInput.focusInput
                .bind("keyup.crossInInput", function (e) {
                    CrossInInput.toggle(jQuery(this));
                })

                .bind("keydown.crossInInput", function (e) {
                    // отслеживаем потерю фокуса при нажатии TAB
                    if (e.keyCode == Data.keyCodes.TAB) {
                        CrossInInput.disconnect();
                    }
                })

            CrossInInput.toggle(CrossInInput.focusInput);
        }
    },

    detach: function (input) {
        if (input) {
            input.unbind("focus.crossInInput");
        }
    },

    // скрытие крестика
    // можно использовать вручную для скрытия крестика при клике по элементам события от которых не доходят до document
    disconnect: function () {
        if (CrossInInput.focusInput) {
            CrossInInput.focusInput.unbind("keyup.crossInInput");
            CrossInInput._hide();
            CrossInInput.focusInput = null;
        }
    },

    blur: function () {
        if (CrossInInput.focusInput) {
            CrossInInput.focusInput.blur();
            CrossInInput.disconnect();
        }
    },

    toggle: function (input) {
        if (!input.is(":disabled") && input.val().length > 0) {
            CrossInInput._show(input);

        } else {
            CrossInInput._hide();
        }
    },

    _show: function (input) {
        if (!CrossInInput.crossElemH) {
            CrossInInput.crossElemH = CrossInInput.crossElem.height();
        }
        if (!CrossInInput.crossElemW) {
            CrossInInput.crossElemW = CrossInInput.crossElem.width();
        }

        var offset = input.offset(),
            w = input.outerWidth(),
            h = input.outerHeight(),
            scrollTop = jQuery(window).scrollTop(),
            top,
            left,
            d = (h - CrossInInput.crossElemH) / 2;

        top = offset.top + d;
        left = offset.left + w - d - CrossInInput.crossElemW;

        CrossInInput.crossElem.css({
            top: top,
            left: left
        })
    },

    _hide: function () {
        CrossInInput.crossElem.css({
            top: "-10000px",
            left: "-10000px"
        })
    }

}


function classToMap(elem) {
    var classArr,
        classMap = {},
        elem = elem && elem[0] ? elem[0] : elem;

    if (elem && elem.className) {
        classArr = elem.classList || elem.className.split(/\s+/);
        for (var i = 0; i < classArr.length; i++)classMap[classArr[i]] = true;
    }

    return classMap;
}


function optionToObject(option, value) {
    var obj = {},
        ob = obj,
        optionArr = option.split("."),
        last = optionArr.length - 1,
        i = 0;

    while (i < last) {
        ob[optionArr[i]] = {};
        ob = ob[optionArr[i]];
        i++;
    }

    ob[optionArr[last]] = value;

    return obj;
}

function formatTextInCell(text, oneRowSize, rowsCount) {
    var str = text,
        _oneRowSize,
        _rowsCount,
        space = " ",

        arr,
        L,
        pos,
        rowsLimit,
        rowCount,
        currentRow,
        currentRowSize,
        lastRow,
        spacePos;

    if (typeof text === "string") {
        _oneRowSize = parseInt(oneRowSize, 10);
        _rowsCount = parseInt(rowsCount, 10);

        if (!isNaN(_oneRowSize) && _oneRowSize > 0) {
            arr = [];
            str = "";
            L = text.length;
            pos = 0;
            rowCount = 0;

            // определяем ограничение на количество строк
            if (!isNaN(_rowsCount) && _rowsCount > 0) {
                rowsLimit = _rowsCount;
            } else {
                rowsLimit = 10000;
            }

            // режем текст на строки требуемой длины
            while (rowCount < rowsLimit && pos < L) {
                currentRow = text.substr(pos, _oneRowSize);
                currentRowSize = currentRow.length;

                if (pos + currentRowSize >= L) {
                    // последняя строка

                } else if (text.charAt(pos + _oneRowSize) == space) {
                    // следующий символ - пробел, значит ничего хитрить не надо

                } else {
                    spacePos = currentRow.lastIndexOf(space);
                    if (spacePos != -1) {
                        // нашли последний пробел в строке, обрезаем по нему
                        currentRowSize = spacePos + 1;
                        currentRow = currentRow.substr(0, currentRowSize);

                    } else {
                        // пробелов в строке нет, значит фиг с ней - режем как есть
                        currentRowSize = _oneRowSize;
                    }
                }

                arr.push(currentRow);
                pos += currentRowSize;
                rowCount++;
            }

            // добавляем многоточие в последнюю строку
            // если в строки отобраны не все символы
            if (rowCount > 0 && pos < L) {
                lastRow = arr[rowCount - 1];
                if (lastRow.length >= _oneRowSize) {
                    arr[rowCount - 1] = lastRow.substr(0, _oneRowSize - 3);
                }
                arr[rowCount - 1] += "...";
            }

            str = arr.join("\n");
        }
    }

    return str;
}


var test__formatTextInCell = {

    text: "When implementing a callback function for this configuration option, " +
        "use the argument value to be displayed in a label. This value can be accessed " +
        "using the fields of the object that is passed as the function's parameter.",

    test_1: function () {
        var str = formatTextInCell(test__formatTextInCell.text);
        consoleDebug("aa\n" + str);
    },

    test_2: function () {
        var str = formatTextInCell(test__formatTextInCell.text, 30);
        consoleDebug("aa\n" + str);
    },

    test_3: function () {
        var str = formatTextInCell(test__formatTextInCell.text, 30, 5);
        consoleDebug("aa\n" + str);
    }
}





function uppercaseCount(str) {
    var count = 0;
    if (isTextOK(str)) {
        var L = str.length,
            arr = str.split("");

        for (var i = 0; i < L; i++) {
            if (arr[i] != arr[i].toLowerCase()) {
                count++;
            }
        }
    }
    return count;
}


var TableCheckboxes = function (config) {

    this.outer = config.outer;
    this.commonChbSelector = config.commonChbSelector;
    this.oneChbSelector = config.oneChbSelector;

    this.clickCallback = config.clickCallback || function (selectedCount) { };

    this.init();
}

TableCheckboxes.prototype = {

    init: function () {
        var _this = this;

        _this.outer
            .on("click", _this.commonChbSelector, function (e) {
                _this._commonClicked(jQuery(this));
            })
            .on("click", _this.oneChbSelector, function (e) {
                _this._oneClicked(jQuery(this));
            })
    },

    _commonClicked: function (elem) {
        var checkboxes = this.getCheckboxes();
        if (elem.is(":checked")) {
            checkboxes.each(function () {
                jQuery(this).prop("checked", true);
            })
        } else {
            checkboxes.each(function () {
                jQuery(this).removeProp("checked");
            })
        }
        var count = this.getSelectedCount();
        this.clickCallback(count);
    },

    _oneClicked: function (elem) {
        var commonChb = this.outer.find(this.commonChbSelector),
            checkboxes = this.getCheckboxes(),
            checked = checkboxes.filter(":checked");

        if (checkboxes.length == checked.length) {
            commonChb.prop("checked", true);
        } else {
            commonChb.removeProp("checked");
        }
        var count = this.getSelectedCount();
        this.clickCallback(count);
    },

    getCheckboxes: function () {
        return this.outer.find(this.oneChbSelector);
    },

    getSelectedRows: function () {
        var rows = [],
            checkboxes = this.getCheckboxes().filter(":checked"),
            row;

        checkboxes.each(function () {
            row = jQuery(this).closest("tr");
            rows.push(row);
        })

        return rows;
    },

    getSelectedCount: function () {
        return this.getCheckboxes().filter(":checked").length;
    }
}


function hideFlyElement(elem) {
    STYLES.set(elem,{
        top: "-10000px",
        left: "-10000px"
    });
}




// Закладки
var BookmarksInCard = function (config) {

    this.isInIframe = config.isInIframe;
    this.selection = config.selection;
    this.bkgColor = config.bkgColor;
    this.textColor = config.textColor;

    this.getSpecialSelectionParams = config.getSpecialSelectionParams;


    this.bookmarksById = {};

    this.init();
}

BookmarksInCard.prototype = {

    hlPrefix: "<span class='del'></span>",

    init: function () {
        var _this = this,
            hlClass = ""

        _this.win = (_this.isInIframe) ? parent : window;

        _this.bookmarkMarkupInst = new _this.win.Markup({
            hlClass: _this.win.BookmarksCore.CLS,
            hlPrefix: _this.hlPrefix,
            getMainContainer: function (node) {
                return node.closest(".value-inner");
            },
            getHLContainer: function (node) {
                return node.closest(".one-value");
            },
            isOKNode: function (node) {
                return !!this.getHLContainer(node);
            }
        })
    },

    onBookmarksListLoaded: function (data) {
        this.bookmarksById = byKEY(data && data.bookmarks, 'id');
    },

    prepareAddToBookmark: function () {
        var _this = this,
            params = _this.getBookmarkParams();

        if (params) {
            _this.showAddSelectedTextToBookmarksWindow(params);
        }
    },

    getBookmarkParams: function () {
        // private String id;
        // private String documentId;
        // private String shard;
        // private String uid;
        // private String name;
        // private String field;
        // private int valueNum;
        // private int start;
        // private int end;
        // private String selectionId;

        var _this = this,
            params = null,
            selection = _this.selection.get(),
            text = selection.text.toString(),
            selectionParams;

        _this.selectionClone = selection;

        if (text != "") {
            selectionParams = _this.getSelectionParams();
            if (selectionParams.fieldName) {
                params = {
                    documentId: _this.win.DocumentCard.id,
                    shard: _this.win.DocumentCard.shard,
                    uid: _this.win.Data.uid,
                    name: text,
                    field: selectionParams.fieldName,
                    valueNum: selectionParams.valueNum,
                    start: selectionParams.start,
                    end: selectionParams.end,
                    startPath: selectionParams.startPath,
                    endPath: selectionParams.endPath
                }
            }
        }

        return params;
    },

    getSelectionParams: function () {
        var _this = this,
            fieldName = null,
            valueNum = 0,
            textParent = null,

            selection = _this.selection.get(),

            oneValue,
            valueOuter,
            fieldData,
            field,
            d,
            coords,
            tableValues,
            tableDelimiterLength,
            valueLength,
            start,
            end,
            startPos,
            startPath,
            endPath,
            inSelection;

        if (typeof (_this.getSpecialSelectionParams) === 'function') {
            d = _this.getSpecialSelectionParams();
            fieldName = d.fieldName;
            valueNum = d.valueNum;
            textParent = d.textParent;
            field = d.field;

        } else if(selection.rang.startContainer){
            oneValue = selection.rang.startContainer.closest(".one-value");
            valueOuter = oneValue.closest(".value-outer");
            fieldData = DocumentCard.getData(valueOuter);
            if (fieldData) {
                field = fieldData.fieldArr[0].field;
                fieldName = field.name;

                if (oneValue.classList.contains("multivalue-one-value")) {
                    valueNum = jQuery.data(valueOuter,"pos");
                } else {
                    valueNum = oneValue.dataset.pos;
                }

                textParent = oneValue;
            }
        }

        if (fieldName) {
            if (field.viewType == "TABLE") {
                start = 0;
                end = 0;
                startPos = 0;
                inSelection = false;
                tableDelimiterLength = (field.tableDelimiter) ? field.tableDelimiter.length : 0; 
                getEl(textParent,true).querySelectorAll(".one-table-value").forEach(function (e,i) {
                    valueLength = e.innerText.length;
                    coords = _this.bookmarkMarkupInst.getRelativeCoordinates(selection, this);

                    if (i > 0) {
                        startPos += tableDelimiterLength;
                    }
                    if (isValueOK(coords.start) && isValueOK(coords.end)) {
                        // в этой колонке есть выделенный текст
                        if (!inSelection) {
                            start = startPos + coords.start;
                            end = startPos + coords.end;
                            inSelection = true;

                        } else {
                            end = startPos + coords.end;
                        }

                    } else {
                        // в этой колонке ничего не выделено

                    }
                    startPos += valueLength;
                })

            } else if (field.viewType == "HTML") {
                startPath = ElementPath.getPathByElement(selection.rang.startContainer);
                endPath = ElementPath.getPathByElement(selection.rang.endContainer);
                // var doc = jQuery(selection.rang.startContainer).closest("html").get(0).parentNode;
                // var elem = ElementPath.getElementByPath(startPath, doc);

                coords = _this.bookmarkMarkupInst.getRelativeCoordinates(selection, selection.rang.startContainer.parentNode);
                start = coords.start;

                coords = _this.bookmarkMarkupInst.getRelativeCoordinates(selection, selection.rang.endContainer.parentNode);
                end = coords.end;

            } else {
                coords = _this.bookmarkMarkupInst.getRelativeCoordinates(selection, textParent);
                start = coords.start;
                end = coords.end;
            }
        }


        return {
            fieldName: fieldName,
            valueNum: valueNum,
            textParent: textParent,
            start: start,
            end: end,
            startPath: startPath,
            endPath: endPath
        }
    },

    showAddSelectedTextToBookmarksWindow: function (params) {
        var _this = this,
            selectionId = null,

            openRoot = _this.win.Data.privateBookmarksRootId,
            rootFilter = {},

            str = "",
            height = 70,
            bottomPadding = 10,
            topElem,
            newName;

        rootFilter[_this.win.Data.privateBookmarksRootId] = true;
        if (_this.win.Data.allowViewCommonBookmarksCatalog()) {
            rootFilter[_this.win.Data.publicBookmarksRootId] = true;
        }

        var buttons = [
            {
                text: "Сохранить",
                click: function (ev) {
                    var btn = ev.target.closest('.ui-button');
                    btn.toggleAttribute('disabled',true);
                    btn.toggleAttribute('wait',true);
                    newName = topElem.find(".edit-bookmark__name").val();
                    params.name = newName;
                    params.selectionId = selectionId;

                    _this.createBookmark(params, function (data) {
                        _this.createBookmarkCallback(data);
                        catalogSelectorWindowInst.destroyCatalogSelectorWindow();
                    })
                }
            },
            {
                text: "Отменить",
                click: function () {
                    catalogSelectorWindowInst.destroyCatalogSelectorWindow();
                }
            }
        ];


        str += "<div class='edit-bookmark__name-outer' style='height:" + height + "px;'>";
        str += "<textarea class='edit-bookmark__name width100' style='height:" + (height - bottomPadding) + "px;'>" + params.name + "</textarea>";
        str += "</div>";
        topElem = jQuery(str);

        var catalogSelectorWindowInst = new _this.win.CatalogSelectorWindow({
            title: "Выбор каталога для закладки",
            showQueries: true,
            showFilters: false,
            useContextMenu: true,
            rootFilter: rootFilter,
            openRoot: openRoot,
            useOtherPrivateRoot: false,
            topElement: {
                element: topElem,
                height: height,
            },
            selectCallback: function (e, selectedNode) {
                var catData = _this.win.Data.catalogUtil.getCatData(selectedNode);
                if (catData && !_this.win.Favourites.isVirtualFolder(catData.id)) {
                    selectionId = catData.id;
                    catalogSelectorWindowInst.toggleButton(0, true);
                } else {
                    selectionId = null;
                    catalogSelectorWindowInst.toggleButton(0, false);
                }
            },
            dialogOptions: {
                resizable: true,
                height: 400,
                width: 450,
                buttons: buttons
            }
        })
        catalogSelectorWindowInst.toggleButton(0, false);
    },

    createBookmark: function (params, callback) {
        // for test
        // callback(params);
        // return;

        jqAjaxJson("createBookmark.action",
            params,
            function (data, st) {
                callback(data);
            },
            function (xhr, st, err) {
                showErrorNotification("Не удалось создать закладку.");
            }
        )
    },

    createBookmarkCallback: function (data) {
        var _this = this;

        _this.bookmarksById[data.id] = data;

        _this.makeBookmarkHL(_this.selectionClone);
    },

    makeBookmarkHL: function (selection) {
        this.bookmarkMarkupInst.makeHL({
            selection: selection,
            bkgColor: this.bkgColor,
            textColor: this.textColor
        })
    }

}


// отправка сообщений между окнами
var PostMessage = {

    send : function(c) {
        var target = c.target || parent,
            data = (typeof c.data === "string") ? c.data : JSON.stringify(c.data),
            // Разрешить получение сообщения только окнам с данного источника.
            targetOrigin = c.targetOrigin || "*";

        target.postMessage(data, targetOrigin);
    },

    attach : function(callback) {
        var messageHandler = function (e) {
            callback(e);
        }
        window.removeEventListener("message", messageHandler);

        window.addEventListener("message", messageHandler);
    }

}

var ElementPath = {

    // http://qaru.site/questions/67697/find-an-element-by-text-and-get-xpath-selenium-webdriver-junit
    getPathByElement: function (element) {
        if (element.nodeName == 'HTML') {
            return '/html';
        }
        if (element === document.body) {
            return '/html/body';
        }

        // calculate position among siblings
        var position = 0;
        // Gets all siblings of that element.
        var siblings = element.parentNode.childNodes;
        var elemPath;
        for (var i = 0, L = siblings.length; i < L; i++) {
            var sibling = siblings[i];
            // Check Siblink with our element if match then recursively call for its parent element.
            if (sibling === element) {
                elemPath = "";
                if (element.nodeName) {
                    elemPath = '/' + element.nodeName + '[' + (position + 1) + ']';
                }
                return ElementPath.getPathByElement(element.parentNode) + elemPath;
            }

            // if it is a siblink & element-node then only increments position.
            var type = sibling.nodeType;
            if (type === 1 && sibling.nodeName === element.nodeName) {
                position++;
            }
        }
    },

    getElementByPath: function (path, doc, excludeClasses) {
        var doc = doc || document,
            pathArr = [],
            parent = null,
            position,
            child,
            reg = /(\w+)\[(\d+)\]/,
            regRes,
            nodeName,
            pos,
            excludeClassesSelector = null;

        if (excludeClasses && excludeClasses.length > 0) {
            excludeClassesSelector = "." + excludeClasses.join(", .");
        }

        if (path) {
            parent = doc.getElementsByTagName("body")[0];
            pathArr = path.split("/");
            for (var i = 3, L = pathArr.length; i < L; i++) {
                position = 1;
                regRes = reg.exec(pathArr[i]);
                if (regRes) {
                    nodeName = regRes[1];
                    pos = regRes[2];

                    for (var j = 0, Lj = parent.childNodes.length; j < Lj; j++) {
                        child = parent.childNodes[j];
                        if (child.nodeName == nodeName) {
                            if (excludeClassesSelector == null || !jQuery(child).is(excludeClassesSelector)) {
                                if (position == pos) {
                                    parent = child;
                                    break;
                                } else {
                                    position++;
                                }
                            }
                        }
                    }

                } else {
                    break;
                }
            }
        }

        return parent;
    }

}
// Формат файла
function fileSizeFormat(size, precision, prefix) {
    if (size != undefined && size != 0 && size != null) { 
        var m = precision ? Math.pow(10,+precision||0) : 1;

        var s = [
            [0,"Б"],
            [1024,"КБ"],
            [1048576,"МБ"],
            [1073741824,"ГБ"],
            [1099511627776,"ТБ"]
        ]

        for(var i =1; i<s.length; i++)if(size<s[i][0])break; 

        switch(typeof prefix){
            case 'string':case 'number':break;
            default:
            prefix = '';
        }
        
        return prefix +(i>1 ? Math.round(size / s[i-1][0] * m) / m : size) + " "+s[i-1][1]
    }

    return ""
}

function isRelativeLink(href) {
    return href && href.search(/^\/{2,}/) < 0 && href.search(/^[http,https]/) < 0;
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
    addCSS : function(opts) {
        if(typeof opts === 'string')opts = {url:opts}//Для сокращения записи
        // добавление строки css правил
        if (opts.str) {
            var tmp = false, is_new = true;
            if (opts.title) {
                tmp = dQ("style[id='" + opts.title + "-stylesheet']");
            }
            if (tmp) {
                is_new = false;
            } else {
                tmp = EmptyElement("style");
                tmp.setAttribute('type', "text/css");
                if (opts.title) {
                    tmp.setAttribute("id", opts.title + "-stylesheet");
                }
            }

            if (tmp.styleSheet) {
                // for ie
                if (is_new) {
                    document.getElementsByTagName("head")[0].appendChild(tmp);
                    tmp.styleSheet.cssText = opts.str;
                } else {
                    if (opts.clear) {
                        tmp.styleSheet.cssText = opts.str;
                    } else {
                        tmp.styleSheet.cssText = tmp.styleSheet.cssText + " " + opts.str;
                    }
                }

            } else {
                if (opts.clear) {
                    tmp.innerHTML = "";
                }
                tmp.appendChild(TextNode(opts.str));
                document.getElementsByTagName("head")[0].appendChild(tmp);
            }
        }

        // загрузка внешнего css файла по урлу
        if (opts.url) {
            if (document.createStyleSheet) {
                try {
                    document.createStyleSheet(contextPath + opts.url);
                } catch (e) {
                }
            } else {
                var cssLink = EmptyElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.type = 'text/css';
                cssLink.media = "all";
                cssLink.href = contextPath + opts.url;
                document.getElementsByTagName("head")[0].appendChild(cssLink);
            }
        }
    },

    addCSSLinks : function(){
        var A = Array.isArray(arguments[0]) ? arguments[0] : arguments;
        var d = document, 
            head = d.head || d.getElementsByTagName("head")[0];
        for(var a=0; a<A.length; a++)
            if (d.createStyleSheet) {
                try {
                    d.createStyleSheet(contextPath + A[a]);
                } catch (e) {
                }
            } else {
                var cssLink = d.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.type = 'text/css';
                cssLink.media = "all";
                cssLink.href = contextPath + A[a];
                head.appendChild(cssLink);
            }
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
}



// TODO: Всплывающее окошко
// TODO: Выяснить про ModalWindow Объект

DialogCover = (function(){ 
    var DATA = new Map();
    var defOptions = {
        id : 'MAIN',
        resizable: false,
        title:'',
        height: "auto",
        // height:400,
        width: 450,
        minHeight: 150,
		minWidth: 150,
        width: 300,
		zIndex: 1000,
        buttons:  [ ],
        allowCloseWindowOnBtn : true
    } 
    var DC = {  
    
    init : function(el,options){ 
        // if(typeof el === 'string'){

        // }
        var data = DATA.get(el) || {}
        data.options = Object.assign({},defOptions,Object.Clean(options));
        // var id = options.id || _.options.id;
        // if(wd[id].el)wd[id].el.remove();
        data.ui = {} 
        data.el = data.ui.content  = el;
        DATA.set(el,data)
        DC._create(el,data) 
    }, 
    _create : function( el,data ){  
            var options = data.options;
            var ui = data.ui; 
            
            var fr = DocFragment();


            
            ui.Title = DIV({ 
				id : 'DC_'+Date.now(),
				className : "ui-dialog-title",
				parentNode: Titlebar
            },
            options.title||data.el.getAttribute('title')||''
            )

            var WindowClose = DIV({ className: 'ui-dialog-titlebar-close' });
            var close = DC.toggle.bind(DC,data,false);

            WindowClose.addEventListener('click', close );

            ui.header = DIV({className:'ui-dialog-header clearfloat'}); 

            var Titlebar = DIV({
				className : "ui-dialog-titlebar  ui-widget-header ui-corner-all  ui-helper-clearfix",
				parentNode : fr
            },[
                ui.Title,
                WindowClose,
                ui.header
            ]);
            
            ui.ContentBlock = DIV({ className: 'layer-content ui-dialog-content  scrollY ' + Data.STOP_SCROLL_CLASS,parentNode:fr });
            

             

            // var WindowInner = DIV({ className: 'layer-inner' }, [DIV({ className: 'ui-widget-header' }, [wd.TITLE,WindowClose]), wd.CONTENT])

            
            if(options.buttons&&options.buttons.length>0)DIV({ className:'text-center layer-footer ui-dialog-buttonpane ui-widget-content ui-helper-clearfix',parentNode:fr},
                DIV({className:'ui-dialog-buttonset'},
                
                options.buttons.map(function(opt){
                    var btn;
                    if(opt instanceof Node){
                        btn = opt;
                    }else{
                        if(typeof opt !== 'object')opt = {text:opt};
                        btn = SPAN({
                            className:'pointer ui-button'
                        }, 
                            SPAN({className: 'ui-button-text'},opt.text)
                        )
                    }
                    btn.addEventListener('click',function(ev){
                        if(!opt.disabled && !data.disabled && !this.classList.contains('wait')&&!this.closest('*[disabled]') ){
                            if(typeof opt.click === 'function')opt.click();
                            if( opt.closeWindow===true || data.options.allowCloseWindowOnBtn===true&&opt.closeWindow!==false )close(); 
                        }
                    })

                    // if(opt.closeWindow === true){
                    //     btn.addEventListener('click',_._close.bind(data));
                    // }
                    return btn;
                })
                ) 
            )
            ui.bg = DIV({className:'ui-widget-overlay',parentNode: document.body})
            ui.win = DIV({ id: 'modalWindow_'+el.id, className: 'layer layer-xl  treeDictionaryDialog ui-dialog ui-widget-content ui-widget', parentNode: document.body },fr)
            toggleElDisplay(ui.bg,ui.win,false);
            if(options.forceDialogClass)ui.win.classList.add(options.forceDialogClass)
        //     ui.win = DIV({ 
        //         // id: 'modalWindowBack',
        //          className: 'layer-container treeDictionaryDialog ui-dialog ui-widget-content ui-widget',
        //          parentElement: document.body
        //  },fr); 
        DC.setContent(data);
        
    }, 
    setContent : function(el){
        var data = el instanceof Node ? DATA.get(el) : el;
        SetContent(data.ui.header,data.options.header||'',true)
        SetContent(data.ui.ContentBlock,data.el,true);
        // отслеживание изменений
        var observer =  new MutationObserver(function(mutations) {
            console.log(mutations);   
            DC._resizeContent(data);
            });
            observer.observe(data.ui.header, { attributes: true, childList: true, characterData: true,subtree: true });
    },
    _createButtons : function(el){

    },
    _resizeContent : function(data){ 
        var h2 = 0, content = data.ui.ContentBlock, list = content.parentNode.children;
            for(var i=0; i<list.length;i++)
                if(list[i]!==content)h2+=list[i].offsetHeight+parseInt(getComputedStyle(list[i]).getPropertyValue("margin-top"));
            content.style.height = (data.ui.win.clientHeight-h2)+'px';
    },
    resize : function(el,w,h){
        var data = el instanceof Node ? DATA.get(el) : el,
        win = data.ui.win, content = data.ui.ContentBlock;
        w =w || data.options.width || data.options.minWidth || 'auto';
        h = h || data.options.height || data.options.minHeight || 'auto';
        if(typeof w === 'number')w+='px';
        if(typeof h === 'number')h+='px';
        win.style.width = w;
        win.style.height = h;
        if(h === 'auto')content.style.height = 'auto';
        w = win.clientWidth;
        h = win.clientHeight; 
        w = Math.max(data.options.minWidth||0,w)&&Math.min(window.innerWidth,w);
        h = Math.max(data.options.minHeight||0,h)&&Math.min(window.innerHeight,h);
        data.width = w;
        data.height = h;
        win.style.width = w+'px';
        win.style.height = h+'px';
        DC._resizeContent(data);
    },
    move : function(el,x,y){
        var data = el instanceof Node ? DATA.get(el) : el;
        var win = data.ui.win;
        var styles = {left : [x,'Width',window.pageXOffset || 0],top:[y,'Height',window.pageYOffset || 0]}
        for(var s in styles){
            var val = styles[s][0], k = styles[s][1], p = styles[s][2];
            switch (typeof val){
                case 'undefined':
                        val = 'center'
                case 'string':
                        val = (val === 'left' || val === 'top') ? 0 :
                        (val === 'right' || val === 'bottom') ? window['inner'+k] - win['client'+k] :
                        (window['inner'+k] - win['client'+k])/2;
                default :
                val = ((val || 0)+p)+'px'; 
            }
            win.style[s]=val;
        }
    },
    toggle : function(el,show){
        var data = el instanceof Node ? DATA.get(el) : el;
        if(data&&data.ui){
            var win = data.ui.win;
            toggleElDisplay(data.ui.bg,win,show);
            if(show){
                win.style.zIndex = data.options.zIndex;
               DC.resize(data)
               DC.move(data)
            }else{
                
            }
        }
        
    },
    show: function (el) {
        // var _ = DialogCover , wd = _.wd;
        // options = Object.assign({},_.options,options)
        // var id = options.id; 
        // wd[id] = wd[id] || {};
        // wd = wd[id]; 
        DC.toggle(el,true)
        // dCE(wd.CONTENT, content)
    },
    open :  function(el){
        DC.toggle(el,true)
    },
    close : function(el){
        DC.toggle(el,false)
    },
    // Добавить 1 опуию в this.options
	_setOption: function(el, key, value ) {
        var data = DATA.get(el);
		// var isDraggable, isResizable,
		// 	uiDialog = this.uiDialog;

		switch ( key ) {
		// 	case "buttons":
		// 		this._createButtons( value );
		// 		break;
		// 	case "closeText":
		// 		// ensure that we always pass a string
		// 		this.uiDialogTitlebarCloseText.innerText = value;
		// 		break;
			// case "dialogClass":
			// 	uiDialog.classList.remove(uiDialogClasses + value)
			// 	uiDialog.classList.add(uiDialogClasses + value) 
			// 	break;
			case "disabled":
				// uiDialog.classList.toggle("ui-dialog-disabled",!!value)
				break;
			case "draggable":
				// isDraggable = uiDialog.is( ":data(draggable)" );
				// if ( isDraggable && !value ) uiDialog.draggable( "destroy" );

				// if ( !isDraggable && value ) {
				// 	this._makeDraggable();
				// }
				break;
			case "position":
				// this._position( value );
				break;
			case "resizable":
				// currently resizable, becoming non-resizable
				// isResizable = uiDialog.is( ":data(resizable)" );
				// if ( isResizable && !value ) {
				// 	uiDialog.resizable( "destroy" );
				// }

				// // currently resizable, changing handles
				// if ( isResizable && typeof value === "string" ) {
				// 	uiDialog.resizable( "option", "handles", value );
				// }

				// // currently non-resizable, becoming resizable
				// if ( !isResizable && value !== false ) {
				// 	this._makeResizable( value );
				// }
				break;
			case "title":
				// convert whatever was passed in o a string, for html() to not throw up
				data.ui.Title.innerHTML = "" + ( value || "&#160;" ); 
				break;
		}

	},
}

return function(el){
    var A = arguments;
    if(typeof A[1] === 'object')DC.init(el,A[1]);
    if(typeof A[1] === 'string'){
        if(A[1] === 'option')DC._setOption(el,A[2],A[3])
        else if(DC[A[1]])DC[A[1]](el,A[2])
    }
    return DialogCover.bind(DialogCover,el)
}
})() 

var showConfirmDialog = function(c) {
    var e = dId('confirmDialog') || DIV({className:'hide',parentNode:document.body}).appendChild(DIV({id:'confirmDialog'}));
    
    switch(c){
        case "destroy":
            return DialogCover(e,"destroy");
        case "close":
            return DialogCover(e,"close");
        case "getContent":
            return e;
    }
    if(c === "destroy")return DialogCover(e,"destroy");
    else if(c === 'getContent')return e;
    var text = c.text,
        title = c.title || "Подтверждение", 
        okBtnText = c.okBtnText,
        onOK = c.onOK,
        close = function(){
            if(!c.close || c.close()!==false)
             DialogCover(dId("confirmDialog"),"close")
        };

    
    e.innerHTML = text;
    e.setAttribute('title', title)
    DialogCover(e,{
        resizable: false,
        height: c.height || "auto",// 140,
        width: c.width || 400,
        buttons : [
            {
                text: okBtnText || "ok",
                "class": "",
                click: function () { 
                    if(onOK()!==false)//Можно не дать закрыть
                        DialogCover(dId("confirmDialog"),"close");
                }
            },
            {
                text: "Отменить",
                "class": "",
                click: function () {
                    if(c.onClose)c.close();
                    close();
                }
            }
        ],
        close: function( event, ui ) {
            DialogCover(dId("confirmDialog"),"destroy");
        }
    })("open")
}

function getSelectedText() {
    var txt = '';
    if (window.getSelection) {
        txt = window.getSelection();
    }
    else if (document.getSelection) {
        txt = document.getSelection();
    }
    else if (document.selection) {
        txt = document.selection.createRange().text;
    }
    return txt.toString()
}


// Оьъект выделения текста  
getSelectionTextObject = function () {
    var Seletion,
        range,
        SelectionTextObject;

    Selection = window.getSelection();
    range = Selection.getRangeAt(0);

    SelectionTextObject = {
        anchorNode: Selection.anchorNode,
        parentNode: Selection.anchorNode.parentNode,
        selectionText: Selection.toString(),
        startIndex: 0,
        endIndex: 0,
        Selection: Selection,
        //Позволяет обновить индексы, задав собственный родительский элемент ( allTextNode ) (По умолчанию, будет считать таковым блжайший parentNode, что не всегда верно)
        updateIndex: function (allTextNode) {
            var
                range = this.Range,
                startIndex = 0,
                Starter,
                allTextNode = allTextNode || range.commonAncestorContainer.parentNode;

            startIndex = range.startOffset;
            Starter = range.startContainer;
            // Если впереди болтается др. элемент, startIndex будет начинаться от него, а нам нужно - от начала "родителя"
            // Кроме того, в качестве родителя можно передавать в ф-ю произвольный элемент (решение проблеммы с вложенными элементами)
            // Если элементов нет, то значение range.startContainer.nodeValue совпадет с parent.innerText
            if (Starter.nodeValue !== allTextNode.innerText) {
                var val = '#' + Date.now() + '#';
                Starter.before(val);
                if(allTextNode.tagName === 'BODY'){//Для унификации
                    var div = document.createElement('div');
                    div.innerHTML = allTextNode.innerHTML.trim();
                    allTextNode = div;
                }
                startIndex = allTextNode.innerText.indexOf(val) + startIndex;
                Starter.previousSibling.remove();
            }
            // while( Starter.previousSibling || Starter.parentNode !== allTextNode ){
            //     //Пытаемся выползти из теговой ямы
            //     if(!Starter.previousSibling){ Starter = Starter.parentNode; continue; }

            //     Starter = Starter.previousSibling;
            //     startIndex+=(
            //         Starter.innerText ? (Starter.tagName === "BR" ? 1 : Starter.innerText.length )
            //         : Starter.length ) || 0;
            // }

            this.startIndex = startIndex;
            this.endIndex = startIndex + this.selectionText.length;
        },
        Range: range

    }

    SelectionTextObject.updateIndex();

    return SelectionTextObject;
}
// From Leroy's jQuery.selection()
/*
 Используется функция SelectionText(window)
 она вощзвращает объект с двумя методами get и set
 exampe: SelectionText().get().html - верент выделенный html
 exampe: SelectionText().get().text - верент выделенный text
 exampe: SelectionText().set('Привет'); - заменит выделенный текст на Привет
 exampe: SelectionText().set(text,function(text,info,replaceFunc){
 replaceFunc('Привет') // заменяем выделенную часть на Привет
 return false; // тогда по умолчанию set не зменяет text
 }); - заменит выделенный текст на Привет
 exampe: SelectionText().set(text,function(text,info,replaceFunc){
 replaceFunc(info.html.replace('Hello','Привет')) // заменяем в выделенной части Hello на Привет
 return false; // тогда по умолчанию set не зменяет text
 }); - заменит выделенный текст на Привет

 */
SelectionText = function(w) {
    var wind = w || window;
    var selectionInfo = false;
    var get = function() {
        return selectionInfo = getSelectionFragment();
    };
    var set = function(text, callback) {
        this.get();
        if ((typeof callback === 'function') || (typeof text === 'function') && (callback = text) )
            text = callback(text, selectionInfo, replaceSelection);
        text !== false && replaceSelection(text);
    };
    var replaceSelection = function(text) {
        selectionInfo.rang.deleteContents();
        var documentFragment = toDOM(text);
        selectionInfo.rang.collapse(false);
        selectionInfo.rang.insertNode(documentFragment);
    }
    var getSelectionFragment = function() { 
        var selectedText = wind.getSelection();
        var rang = selectedText.getRangeAt(0);
        return {ie : false, 'text' : selectedText, 'html' : toHTML( rang.cloneContents() ), 'rang' : rang} 
    };
    var toHTML = function(docFragment) {
        var d = wind.document.createElement('template');
        d.appendChild(docFragment);
        return d.innerHTML;
    };
    var toDOM = function(HTMLstring) {
        var d = wind.document.createElement('template');
        d.innerHTML = HTMLstring;
        var docFrag = wind.document.createDocumentFragment();  // тут тоже важный момент, я с этим пол дня провозился
        while (d.firstChild) docFrag.appendChild(d.firstChild);
        return docFrag;
    };
    return {'get' : get, 'set' : set}
} 


function isIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

//Пустая ф-ция. Можно подставлять, где нужна пустая функция в аргументах или переменной
function _void_() { return undefined; }

//Методы для дебага: 
//Создает читабельную json-строку
JSON.stringify_t = JSON.stringify_t || function (str, f) { return JSON.stringify(str, f || null, '\t'); }
// Тоже, но пытается убить кавычки в ключах (нужен для создания кода)
JSON.stringify_c = function (str, f) { return JSON.stringify(str, f || null, '\t').replace(/"(.*)":/g, function (s) { return s.replace(/"/g, '') }); }
//Переводит json-строку в читабельный вид
JSON.break_t = JSON.break_t || function (str) { return JSON.stringify(JSON.parse(str), null, '\t'); }
//клонирует объект через методы json
JSON.clone = JSON.clone || function (o) { return JSON.parse(JSON.stringify(o)) }

// Римские цифры ()
function toRoman(num) {
    var result = '';
    var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var roman = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    for (var i = 0; i <= decimal.length; i++) {
        while (num % decimal[i] < num) {
            result += roman[i];
            num -= decimal[i];
        }
    }
    return result;
}

function fromRoman(str) {
    var result = 0;
    // the result is now a number, not a string
    var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var roman = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    for (var i = 0; i <= decimal.length; i++) {
        while (str.indexOf(roman[i]) === 0) {
            result += decimal[i];
            str = str.replace(roman[i], '');
        }
    }
    return result;
}

Rect = function (obj) {
    if (typeof arguments[0] !== 'object' || !obj) {
        obj = this;

    }
    var r = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0
    },
        t, tBody;
    r.winWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    r.winHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    tBody = (((t = document.documentElement) || (t = document.body.parentNode))
        && typeof t.scrollLeft == 'number' ? t : document.body);
    // TODO: window.pageYOffset - ie 9+ - scrollTop думаю не нужен
    r.pageYOffset = (window.pageYOffset || tBody.scrollTop);
    r.pageXOffset = (window.pageXOffset || tBody.scrollLeft);

    if (!obj || obj === window) {
        r.width = r.winWidth;
        r.height = r.winHeight;
    } else if (typeof obj.getBoundingClientRect === 'function') {
        var rect = obj.getBoundingClientRect();
        r.width = typeof rect.width === 'number' ? rect.width : obj.clientWidth;
        r.height = typeof rect.height === 'number' ? rect.height : obj.clientHeight;
        r.top = r.pageYOffset + rect.top;
        r.bottom = r.winHeight - (r.pageYOffset + rect.bottom);//
        // r.bottom = r.winHeight - (r.top + r.height);//
        r.left = r.pageXOffset + rect.left;
        r.offsetLeft = obj.offsetLeft;
        r.right = r.winWidth - (r.pageXOffset + rect.right);//
        // r.right = r.winWidth - (r.left + rect.width);//
        r.BCR = rect;
    }
    return r
}

Element.prototype.Rect = Rect;

function getScrollbarWidth() {
    if (!window.scrollbarWidth) {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);
        window.scrollbarWidth = widthNoScroll - widthWithScroll;
    }
    return window.scrollbarWidth;
}
// Событие, которое срабатывает лишь однажды
// addOneEventListener = function () {
//     var i = 0, A = arguments;
//     var el = this;
//     if (typeof A[0] === 'object') {
//         el = A[0];
//         i++
//     }
//     var ev = A[i++];
//     var f = A[i++];
//     var s = A[i++] || false;
//     // var ff = function (e) {
//     //     f.call(this, e);
//     //     el.removeEventListener(ev, ff)
//     // }
//     el.addEventListener(ev, f, {once:true})
// }
// document.addOneEventListener = Element.prototype.addOneEventListener = addOneEventListener;


// Пытается перекрасить картинку. Воспренимает любую как чб 
var changeColorIMG = function (data, nData)// imgNode, [R,G,B]
{
    var img, cnv, cnt, imgData;
    if (typeof data === 'string') {
        img = document.createElement('img');
        img.src = data;
    } else {
        img = data;
    }
    var cg = ((nData[0] + nData[1] + nData[2]) / 3);
    // nData = nData.map(function(c){return c/255});

    cnv = document.createElement('canvas');
    cnv.width = img.width;
    cnv.height = img.height;

    ctx = cnv.getContext('2d');
    ctx.drawImage(img, 0, 0);

    imgData = ctx.getImageData(0, 0, cnv.width, cnv.height)
    data = imgData.data;

    for (var x = 0, len = data.length, c, d; x < len; x += 4) {
        c = ((data[x] + data[x + 1] + data[x + 2]) / 3);
        d = c - cg;
        c = c / 255;
        for (var i = 0, z; i < 3; i++) {
            z = (nData[i] > c ? 1 : nData[i] < c ? -1 : 0) * 0.2 * nData[i];//Увеличим амплетуду
            z += ~~((nData[i] + d) * c);
            if (z < 0) z = 0; else if (z > 255) z = 255;
            data[x + i] = z;
        }

        data[x + 1] = ~~((nData[1] + d) * c);
        data[x + 2] = ~~((nData[2] + d) * c);
    }

    ctx.putImageData(imgData, 0, 0);
    return cnv.toDataURL();
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    if(r instanceof Array){ b = r[2]; g = r[1]; r = r[0];}
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
    if(h instanceof Array){ l = h[2]; s = h[1]; h = h[0];}
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
    if(r instanceof Array){ b = r[2]; g = r[1]; r = r[0];}
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
    if(h instanceof Array){ v = h[2]; s = h[1]; h = h[0];}
    var r, g, b;
    if (h < 0) h = 1 - h;
    if (s < 0) s = 1 - s;
    if (v < 0) v = 1 - v;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [~~(r * 255), ~~(g * 255), ~~(b * 255)];
}


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) { 
    if(r instanceof Array){ b = r[2]; g = r[1]; r = r[0];}
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex, alpha) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    result =  result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0,0,0];
    if(alpha)result.push(alpha);
    return result;
}

// Сравнение объектов
var CompareObjects = function () {
    var A = arguments,
        l = A.length,
        i = 0,
        C = CompareObjects,
        r,
        R = [];
    R.length = l;

    // R[0]=Object.assign(new A[0].__proto__.constructor,A[0])
    R[0] = {}
    R[1] = {}
    for (var i in A[0]) if (A[0].hasOwnProperty(i)) R[0][i] = A[0][i]
    for (var i in A[1]) if (A[1].hasOwnProperty(i))
        if (A[1][i] === R[0][i]) {
            console.log(i, 1)
            delete R[0][i];
        } else if (
            !(i in R[0]) ||
            (typeof R[0][i] !== 'object' ||
                typeof A[1][i] !== 'object') ||
            !R[0][i] && A[1][i] ||
            R[0][i] && !A[1][i]
        ) {
            console.log(i, 2)
            R[1][i] = A[1][i]
        } else {
            console.log(i, 3)
            r = C(R[0][i], A[1][i])
            if (
                Object.keys(r[0]).length === 0 &&
                Object.keys(r[1]).length === 0) {
                delete R[0][i];
                delete R[1][i];
            } else {
                R[0][i] = r[0];
                R[1][i] = r[1];
            }
        }
    return R;
}

//Пытается получить дату вида DD.MM.YYYY
dateFormatter = function (v /* v, [f], [now] || v, [now], [f]  */ ) {
    var f = arguments [1], now = arguments [2], v1; 

    if(f  instanceof Date){
        f = arguments [2];
        now = arguments [1];
    }else if(!(now  instanceof Date)){ 
        now = new Date();
    }

    if (typeof v === 'string') {
        var v = v.match(/(\d*)?/g).filter(function (a) { return !!a })
        if (v.length > 0) {
            var y, m, d, sy;
            d = v[0];
            sy = d.search(/(19)|(20)/);
            if (v.length === 1 && //чтобы можно было вообще без точек писать
                d.length > 2 &&
                !(d.length === 4 && sy === 0)
            ) {
                v.length = 3;
                // Пытаемся определить, что идет 2м
                m = d.substr(2, 2);
                v[0] = d.substr(0, 2);
                if (+m > 12) {
                    v.length = 2;
                    v[1] = d.substr(2);//год 
                } else {
                    v.length = 3;
                    v[0] = d.substr(0, 2);
                    v[1] = m;
                    v[2] = d.substr(4);
                }
            }
            if (v[0].length === 4&&v[2].length<=2) v.reverse();

            if (v.length < 3) { 

                v1 = [
                    now.getDate(),
                    now.getMonth(),
                    now.getFullYear()
                ];
                if (v.length === 1) {
                    v1[v[0].length === 4 ? 2 : 0] = v[0];
                    v1[1]++;//Иаче потом вычтет - и будет хня
                } else {
                    var i = 2;
                    if (v[1].length < 4 && (+v[1]<=12)) i--;
                    v1[i] = v[1];
                    v1[i - 1] = v[0];
                }
                v = v1;
            }

            d = +v[0];
            m = +v[1] - 1;
            if(m>11)m=11;
            y = +v[2];
            if(y<1000){
                v1 = v[2][0];
                y += y < 100 ? (y < 29 || (v1 === '0') ? 2000 : 1900) : y < 1000 ? (v1 === '9' ? 1000 : (y * 10 - y)) : 0;
            } 

            if (f === 'Date') return new Date(y, m, d, 0, 0, 0);
            else {
                
                if(d>30 || m===1&&d>28){
                    v1 = new Date(y, m, d, 0, 0, 0);
                    d = now.getDate();
                    m = now.getMonth();
                    y = now.getFullYear();
                }

                d = '' + d; m = '' + (m + 1), y = '' + y;
                if (d.length < 2) d = '0' + d;
                if (m.length < 2) m = '0' + m;
                if (f === 'Array') return [d, m, y];
                else return d + '.' + m + '.' + y;
            }
        }
    } else if( typeof v === 'number' ){
        now = new Date(v); 
    } else if (v  instanceof Date){
        now = v;
    }

    if (f === 'Date') return now;
    else {
        v1 = [
            now.getDate() + '',
            (now.getMonth() + 1) + '',
            now.getFullYear() + ''
        ];
        if (v1[0].length < 2) v1[0] = '0' + v1[0];
        if (v1[1].length < 2) v1[1] = '0' + v1[1];
        if (f === 'Array') return v1;
        else return v1.join('.')
    }
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
            d =  val.call(self,k,o[k],o);
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

// TODO
  /*parseIntText = function( t ){
    var t = t.trim().toLowerCase(), i;
    var na = {
        'перв': '1',
        'втор' : '2',
        'трет' : '3',
        'четверт' : '4',
        "пят" : '5',
        "шест" : '6',
        "седьм": '7',
        "восьм": '8',
        "девят" : '9',
        "десят" : '10',
        "одиннадцат" : '11',
        "двенадцат" : '12',
        "тринадцат" : '13',
        "четырнадцат" : '14',
        "пятнадцат" : '15',
        "шестнадцат" : '16',
        "семнадцат" : '17',
        "восемьнадцат" : '18',
        "девятнадцат" : '19',
    }
    var des = { 
        "двадцать" : '2',
        "тридцать" : '3',
        "двадцат" : '2',
        "тридцат" : '3',
        "сорок" : '4',
        "пятьдесят" : '5',
        "шестьдесят" : '6',
        "семьдесят" : '7',
        "восемьдесят" : '8',
        "девяносто" : '9',
    }

  }*/

  Array.Repeat = function (arr, k) {
    var A = [];
    return A.concat.apply(A, (new Array(k || 1)).fill(arr))
}

  BIGS.Analitycs = {
    LOG : function(){
        if(typeof AnalitycsCore === 'object' && AnalitycsCore.isActive()){ 
            AnalitycsCore.LOG.apply(AnalitycsCore,arguments)
            BIGS.Analitycs = AnalitycsCore
        }
    },
    SetLastAction : function(){
        if(typeof AnalitycsCore === 'object'){
            AnalitycsCore.SetLastAction.apply(AnalitycsCore,arguments)
            BIGS.Analitycs = AnalitycsCore
        }
    }
}

// TODO: Избавиться от jQuery
BIGS.dialogCover = function( ){
    var a = Array.prototype.slice.call(arguments);
    var e = jQuery(a.shift());
    e.dialogCover.apply(e,a);

}

// TODO: Избавиться от jQuery

BIGS.selectBox = SelectBox = function( ){
    var A = Array.prototype.slice.call(arguments);
    var e = A.shift();
    var usePlugin = !Data.isPortalEmbeddedWindow;
    if(usePlugin){
        // здесь отвалятся существующие события для селектора
        var $e = jQuery(e);
        $e = $e.selectBox.apply($e,A);
        return e;
    }else{
        e=getEl(e);
        if(e instanceof Element){// !documentFragment
            switch(A[0]){
                case 'value':
                    if(A.length>1)e.value = A[1];
                    else return e.value;
                break;
                case 'options':
                    var data = A[1];
                    if( data && (typeof data === 'object') && !(o instanceof Node) && !('length' in o) )
                        data = Object.entries(data).filter(function(d){
                            if( (typeof d[1] === 'object') && d[1] ) d[1] = Object.entries( d[1] );
                            return d[1]!==null;
                        });  
                    SELECT(e,data)
                break;
                case 'dropdown':
                break;
                case "destroy": 
                case "dirtyDestroy": 
                
                break;
                default :e.classList.add('selectBox');
            }
            
        }
        return e;
    }
}
 
//Object.Clean
Object.defineProperty(Object, 'Clean', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(o, notNull,assign){
        var isArray = Array.isArray(o);
        if(assign)o = Object.assign(isArray?[]:{},o)
        var keysArray = isArray ? o : Object.keys(o); 
            for (var i = 0, len = keysArray.length, prop; i < len; i++) {
                prop = isArray ? i : keysArray[i];
                if(o[prop] === undefined || notNull && o[prop] === null){
                    if(isArray)
                        o.splice(prop, 1);
                    else
                        delete  o[prop];
                }
            }
            return o;
        }
  })

//  Тоже, что и Object.assign, только исключает undefined в свойствах
    Object.defineProperty(Object, 'assignSoft', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target, firstSource) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }
  
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
  
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable && nextSource[nextKey]!== undefined) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });


// Позволяет блокировать ссылки и прочее
document.addEventListener('click', function (e) {
    // console.log(e.path)
    if (e.target.closest('*[disabled]')) e.preventDefault();
})


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

  path = {
    sep : '/',
    parse : function(p){
        var p = p.replace(/([\?|#].*)/,'').trim();
        var sep = this.sep;
        if(p.slice(-1) === sep)p=p.slice(0,-1);
        p = p.split(sep);
        var base = p.pop();
        i = base.lastIndexOf('.');
        var root = p.shift() || sep;
        if(root.indexOf(':')!==-1){
            root = root + sep + p.shift() + sep + p.shift();
        }
        return {
            root : root,
            dir : p.join(sep),
            dirname : p[p.length-1],
            base : base,
            name : base.substr(0,i),
            ext :  base.substr(i+1),
        }
    },
    // basename
  }