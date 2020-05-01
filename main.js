const path = require('path');
// let scriptDir = __dirname.replace(/\\/g,'/');

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

// // Create an empty context menu
// var menu = new nw.Menu();

// // Add some items with label
// menu.append(new nw.MenuItem({
//   label: 'Item A',
//   click: function(){
//     alert('You have clicked at "Item A"');
//   }
// }));
// menu.append(new nw.MenuItem({ label: 'Item B' }));
// menu.append(new nw.MenuItem({ type: 'separator' }));
// menu.append(new nw.MenuItem({ label: 'Item C' }));

// // Hooks the "contextmenu" event
// document.body.addEventListener('contextmenu', function(ev) {
//   // Prevent showing default context menu
// //   ev.preventDefault();
//   // Popup the native context menu at place you click
// //   menu.popup(ev.x, ev.y);
// console.log(',')
// //   return false; 
// }, false);


if(typeof nw !== 'undefined'){
  // var dir = 'file:///N:/=Works=/Animation&Comics/Саша/Scenes';
  var gui = require('nw.gui');
  var commands = nw.App.argv;
  var nwin = gui.Window.get();
  // nwin.enterFullscreen();
  
  var dir = commands[0]; 
    // nw.Window.open('index.html', {}, function(win) {
        // win.on('loaded', () => {
          document.addEventListener("DOMContentLoaded", ()=>{
          var win = nwin.window;
          win.nw = nw;  
          var body = win.document.body;
          try{ 
              // body.innerHTML = 'c ' + JSON.stringify(process.argv);
              win.DIV({
                className : 'comicsTab',
                parentNode : body, 
              },
                win.CreateElement('iframe',{
                  src : dir + '/index.html?'+commands[1],
                
                })
              ) 
              }catch(e){
                body.innerHTML = e;
              }

        });
        nwin.maximize();
        nwin.showDevTools();

        
    // });
}else{

}