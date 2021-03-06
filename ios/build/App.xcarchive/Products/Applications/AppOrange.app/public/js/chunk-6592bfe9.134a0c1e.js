(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-6592bfe9"],{"2cba":function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));var r=function(){function e(){var e=this;this.platform="web",this.isNative=!1,this.Plugins={},"undefined"!==typeof Proxy&&(this.Plugins=new Proxy(this.Plugins,{get:function(t,n){if("undefined"===typeof t[n]){var r=e;return new Proxy({},{get:function(e,t){return"undefined"===typeof e[t]?r.pluginMethodNoop.bind(r,e,t,n):e[t]}})}return t[n]}}))}return e.prototype.pluginMethodNoop=function(e,t,n){return Promise.reject(n+" does not have web implementation.")},e.prototype.getPlatform=function(){return this.platform},e.prototype.isPluginAvailable=function(e){return this.Plugins.hasOwnProperty(e)},e.prototype.convertFileSrc=function(e){return e},e.prototype.handleError=function(e){console.error(e)},e}()},"81c3":function(e,t,n){"use strict";var r,i,o,s,a,c,u,d,l,p,f,h,v,b;n.d(t,"a",(function(){return m["a"]})),function(e){e["Prompt"]="PROMPT",e["Camera"]="CAMERA",e["Photos"]="PHOTOS"}(r||(r={})),function(e){e["Rear"]="REAR",e["Front"]="FRONT"}(i||(i={})),function(e){e["Uri"]="uri",e["Base64"]="base64",e["DataUrl"]="dataUrl"}(o||(o={})),function(e){e["Documents"]="DOCUMENTS",e["Data"]="DATA",e["Cache"]="CACHE",e["External"]="EXTERNAL",e["ExternalStorage"]="EXTERNAL_STORAGE"}(s||(s={})),function(e){e["UTF8"]="utf8",e["ASCII"]="ascii",e["UTF16"]="utf16"}(a||(a={})),function(e){e["Heavy"]="HEAVY",e["Medium"]="MEDIUM",e["Light"]="LIGHT"}(c||(c={})),function(e){e["SUCCESS"]="SUCCESS",e["WARNING"]="WARNING",e["ERROR"]="ERROR"}(u||(u={})),function(e){e["Dark"]="DARK",e["Light"]="LIGHT"}(d||(d={})),function(e){e["Body"]="body",e["Ionic"]="ionic",e["Native"]="native",e["None"]="none"}(l||(l={})),function(e){e["Default"]="DEFAULT",e["Destructive"]="DESTRUCTIVE",e["Cancel"]="CANCEL"}(p||(p={})),function(e){e["Camera"]="camera",e["Photos"]="photos",e["Geolocation"]="geolocation",e["Notifications"]="notifications",e["ClipboardRead"]="clipboard-read",e["ClipboardWrite"]="clipboard-write",e["Microphone"]="microphone"}(f||(f={})),function(e){e["Smart"]="smart",e["Shared"]="shared",e["User"]="user"}(h||(h={})),function(e){e["Dark"]="DARK",e["Light"]="LIGHT"}(v||(v={})),function(e){e["None"]="NONE",e["Slide"]="SLIDE",e["Fade"]="FADE"}(b||(b={}));var m=n("f750"),w=function(){function e(){this.plugins={},this.loadedPlugins={}}return e.prototype.addPlugin=function(e){this.plugins[e.config.name]=e},e.prototype.getPlugin=function(e){return this.plugins[e]},e.prototype.loadPlugin=function(e){var t=this.getPlugin(e);t?t.load():console.error("Unable to load web plugin "+e+", no such plugin found.")},e.prototype.getPlugins=function(){var e=[];for(var t in this.plugins)e.push(this.plugins[t]);return e},e}(),y=new w,g=function(){function e(e,t){this.config=e,this.loaded=!1,this.listeners={},this.windowListeners={},t?t.addPlugin(this):y.addPlugin(this)}return e.prototype.addWindowListener=function(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0},e.prototype.removeWindowListener=function(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)},e.prototype.addListener=function(e,t){var n=this,r=this.listeners[e];r||(this.listeners[e]=[]),this.listeners[e].push(t);var i=this.windowListeners[e];return i&&!i.registered&&this.addWindowListener(i),{remove:function(){n.removeListener(e,t)}}},e.prototype.removeListener=function(e,t){var n=this.listeners[e];if(n){var r=n.indexOf(t);this.listeners[e].splice(r,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}},e.prototype.removeAllListeners=function(){for(var e in this.listeners={},this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}},e.prototype.notifyListeners=function(e,t){var n=this.listeners[e];n&&n.forEach((function(e){return e(t)}))},e.prototype.hasListeners=function(e){return!!this.listeners[e].length},e.prototype.registerWindowListener=function(e,t){var n=this;this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:function(e){n.notifyListeners(t,e)}}},e.prototype.requestPermissions=function(){return Capacitor.isNative?Capacitor.nativePromise(this.config.name,"requestPermissions",{}):Promise.resolve({results:[]})},e.prototype.load=function(){this.loaded=!0},e}(),O=function(e){return e.config.platforms&&e.config.platforms.indexOf(Capacitor.platform)>=0},P=function(e){for(var t=y.getPlugins(),n=0,r=t;n<r.length;n++){var i=r[n];j(e,i)}},j=function(e,t){e.hasOwnProperty(t.config.name)&&!O(t)||(e[t.config.name]=t)},E=n("9ab4"),x=function(e){function t(){return e.call(this,{name:"Accessibility",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.isScreenReaderEnabled=function(){throw new Error("Feature not available in the browser")},t.prototype.speak=function(e){if(!("speechSynthesis"in window))return Promise.reject("Browser does not support the Speech Synthesis API");var t=new SpeechSynthesisUtterance(e.value);return e.language&&(t.lang=e.language),window.speechSynthesis.speak(t),Promise.resolve()},t}(g),S=(new x,function(e){function t(){var t=e.call(this,{name:"App",platforms:["web"]})||this;return"undefined"!==typeof document&&document.addEventListener("visibilitychange",t.handleVisibilityChange.bind(t),!1),t}return Object(E["b"])(t,e),t.prototype.exitApp=function(){throw new Error("Method not implemented.")},t.prototype.canOpenUrl=function(e){return Promise.resolve({value:!0})},t.prototype.openUrl=function(e){return Promise.resolve({completed:!0})},t.prototype.getLaunchUrl=function(){return Promise.resolve({url:""})},t.prototype.getState=function(){return Promise.resolve({isActive:!0!==document.hidden})},t.prototype.handleVisibilityChange=function(){var e={isActive:!0!==document.hidden};this.notifyListeners("appStateChange",e)},t}(g)),R=(new S,function(e){function t(){return e.call(this,{name:"Browser",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.open=function(e){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(t){return this._lastWindow=window.open(e.url,e.windowName||"_blank"),[2,Promise.resolve()]}))}))},t.prototype.prefetch=function(e){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(e){return[2,Promise.resolve()]}))}))},t.prototype.close=function(){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(e){return this._lastWindow&&this._lastWindow.close(),[2,Promise.resolve()]}))}))},t}(g)),C=(new R,function(e){function t(){return e.call(this,{name:"Camera",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.getPhoto=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t=this;return Object(E["c"])(this,(function(n){return[2,new Promise((function(n,r){return Object(E["a"])(t,void 0,void 0,(function(){var t,i=this;return Object(E["c"])(this,(function(o){switch(o.label){case 0:return e.webUseInput?(this.fileInputExperience(e,n),[3,7]):[3,1];case 1:if(!customElements.get("pwa-camera-modal"))return[3,6];t=document.createElement("pwa-camera-modal"),document.body.appendChild(t),o.label=2;case 2:return o.trys.push([2,4,,5]),[4,t.componentOnReady()];case 3:return o.sent(),t.addEventListener("onPhoto",(function(o){return Object(E["a"])(i,void 0,void 0,(function(){var i,s;return Object(E["c"])(this,(function(a){switch(a.label){case 0:return i=o.detail,null!==i?[3,1]:(r("User cancelled photos app"),[3,4]);case 1:return i instanceof Error?(r(i.message),[3,4]):[3,2];case 2:return s=n,[4,this._getCameraPhoto(i,e)];case 3:s.apply(void 0,[a.sent()]),a.label=4;case 4:return t.dismiss(),document.body.removeChild(t),[2]}}))}))})),t.present(),[3,5];case 4:return o.sent(),this.fileInputExperience(e,n),[3,5];case 5:return[3,7];case 6:console.error("Unable to load PWA Element 'pwa-camera-modal'. See the docs: https://capacitorjs.com/docs/pwa-elements."),this.fileInputExperience(e,n),o.label=7;case 7:return[2]}}))}))}))]}))}))},t.prototype.fileInputExperience=function(e,t){var n=document.querySelector("#_capacitor-camera-input"),s=function(){n.parentNode&&n.parentNode.removeChild(n)};n||(n=document.createElement("input"),n.id="_capacitor-camera-input",n.type="file",document.body.appendChild(n)),n.accept="image/*",n.capture=!0,e.source===r.Photos||e.source===r.Prompt?n.removeAttribute("capture"):e.direction===i.Front?n.capture="user":e.direction===i.Rear&&(n.capture="environment"),n.addEventListener("change",(function(r){var i=n.files[0],a="jpeg";if("image/png"===i.type?a="png":"image/gif"===i.type&&(a="gif"),e.resultType===o.DataUrl||e.resultType===o.Base64){var c=new FileReader;c.addEventListener("load",(function(){if(e.resultType===o.DataUrl)t({dataUrl:c.result,format:a});else if(e.resultType===o.Base64){var n=c.result.split(",")[1];t({base64String:n,format:a})}s()})),c.readAsDataURL(i)}else t({webPath:URL.createObjectURL(i),format:a}),s()})),n.click()},t.prototype._getCameraPhoto=function(e,t){return new Promise((function(n,r){var i=new FileReader,s=e.type.split("/")[1];t.resultType===o.Uri?n({webPath:URL.createObjectURL(e),format:s}):(i.readAsDataURL(e),i.onloadend=function(){var e=i.result;t.resultType===o.DataUrl?n({dataUrl:e,format:s}):n({base64String:e.split(",")[1],format:s})},i.onerror=function(e){r(e)})}))},t}(g)),L=(new C,function(e){function t(){return e.call(this,{name:"Clipboard",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.write=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r;return Object(E["c"])(this,(function(i){switch(i.label){case 0:return navigator.clipboard?void 0!==e.string||e.url?navigator.clipboard.writeText?[4,navigator.clipboard.writeText(void 0!==e.string?e.string:e.url)]:[2,Promise.reject("Writting to clipboard not supported in this browser")]:[3,2]:[2,Promise.reject("Clipboard API not available in this browser")];case 1:return i.sent(),[3,10];case 2:if(!e.image)return[3,9];if(!navigator.clipboard.write)return[2,Promise.reject("Setting images not supported in this browser")];i.label=3;case 3:return i.trys.push([3,7,,8]),[4,fetch(e.image)];case 4:return[4,i.sent().blob()];case 5:return t=i.sent(),n=new ClipboardItem((r={},r[t.type]=t,r)),[4,navigator.clipboard.write([n])];case 6:return i.sent(),[3,8];case 7:return i.sent(),[2,Promise.reject("Failed to write image")];case 8:return[3,10];case 9:return[2,Promise.reject("Nothing to write")];case 10:return[2,Promise.resolve()]}}))}))},t.prototype.read=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e,t,n,r;return Object(E["c"])(this,(function(i){switch(i.label){case 0:return navigator.clipboard?navigator.clipboard.read?[3,1]:navigator.clipboard.readText?[2,this.readText()]:[2,Promise.reject("Reading from clipboard not supported in this browser")]:[2,Promise.reject("Clipboard API not available in this browser")];case 1:return i.trys.push([1,5,,6]),[4,navigator.clipboard.read()];case 2:return e=i.sent(),t=e[0].types[0],[4,e[0].getType(t)];case 3:return n=i.sent(),[4,this._getBlobData(n,t)];case 4:return r=i.sent(),[2,Promise.resolve({value:r,type:t})];case 5:return i.sent(),[2,this.readText()];case 6:return[2]}}))}))},t.prototype.readText=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e;return Object(E["c"])(this,(function(t){switch(t.label){case 0:return[4,navigator.clipboard.readText()];case 1:return e=t.sent(),[2,Promise.resolve({value:e,type:"text/plain"})]}}))}))},t.prototype._getBlobData=function(e,t){return new Promise((function(n,r){var i=new FileReader;t.includes("image")?i.readAsDataURL(e):i.readAsText(e),i.onloadend=function(){var e=i.result;n(e)},i.onerror=function(e){r(e)}}))},t}(g)),A=(new L,function(e){function t(){var t=e.call(this,{name:"Filesystem",platforms:["web"]})||this;return t.DEFAULT_DIRECTORY=s.Data,t.DB_VERSION=1,t.DB_NAME="Disc",t._writeCmds=["add","put","delete"],t}return Object(E["b"])(t,e),t.prototype.initDb=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e=this;return Object(E["c"])(this,(function(n){if(void 0!==this._db)return[2,this._db];if(!("indexedDB"in window))throw new Error("This browser doesn't support IndexedDB");return[2,new Promise((function(n,r){var i=indexedDB.open(e.DB_NAME,e.DB_VERSION);i.onupgradeneeded=t.doUpgrade,i.onsuccess=function(){e._db=i.result,n(i.result)},i.onerror=function(){return r(i.error)},i.onblocked=function(){console.warn("db blocked")}}))]}))}))},t.doUpgrade=function(e){var t=e.target,n=t.result;switch(e.oldVersion){case 0:case 1:default:n.objectStoreNames.contains("FileStorage")&&n.deleteObjectStore("FileStorage");var r=n.createObjectStore("FileStorage",{keyPath:"path"});r.createIndex("by_folder","folder")}},t.prototype.dbRequest=function(e,t){return Object(E["a"])(this,void 0,void 0,(function(){var n;return Object(E["c"])(this,(function(r){return n=-1!==this._writeCmds.indexOf(e)?"readwrite":"readonly",[2,this.initDb().then((function(r){return new Promise((function(i,o){var s=r.transaction(["FileStorage"],n),a=s.objectStore("FileStorage"),c=a[e].apply(a,t);c.onsuccess=function(){return i(c.result)},c.onerror=function(){return o(c.error)}}))}))]}))}))},t.prototype.dbIndexRequest=function(e,t,n){return Object(E["a"])(this,void 0,void 0,(function(){var r;return Object(E["c"])(this,(function(i){return r=-1!==this._writeCmds.indexOf(t)?"readwrite":"readonly",[2,this.initDb().then((function(i){return new Promise((function(o,s){var a=i.transaction(["FileStorage"],r),c=a.objectStore("FileStorage"),u=c.index(e),d=u[t].apply(u,n);d.onsuccess=function(){return o(d.result)},d.onerror=function(){return s(d.error)}}))}))]}))}))},t.prototype.getPath=function(e,t){e=e||this.DEFAULT_DIRECTORY;var n=void 0!==t?t.replace(/^[/]+|[/]+$/g,""):"",r="/"+e;return""!==t&&(r+="/"+n),r},t.prototype.clear=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e,t,n;return Object(E["c"])(this,(function(r){switch(r.label){case 0:return[4,this.initDb()];case 1:return e=r.sent(),t=e.transaction(["FileStorage"],"readwrite"),n=t.objectStore("FileStorage"),n.clear(),[2,{}]}}))}))},t.prototype.readFile=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n;return Object(E["c"])(this,(function(r){switch(r.label){case 0:return t=this.getPath(e.directory,e.path),[4,this.dbRequest("get",[t])];case 1:if(n=r.sent(),void 0===n)throw Error("File does not exist.");return[2,{data:n.content}]}}))}))},t.prototype.writeFile=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r,i,o,s,a,c,u,d,l;return Object(E["c"])(this,(function(p){switch(p.label){case 0:return t=this.getPath(e.directory,e.path),n=e.data,r=e.recursive,[4,this.dbRequest("get",[t])];case 1:if(i=p.sent(),i&&"directory"===i.type)throw"The supplied path is a directory.";return o=e.encoding,s=t.substr(0,t.lastIndexOf("/")),[4,this.dbRequest("get",[s])];case 2:return a=p.sent(),void 0!==a?[3,4]:(c=s.indexOf("/",1),-1===c?[3,4]:(u=s.substr(c),[4,this.mkdir({path:u,directory:e.directory,recursive:r})]));case 3:p.sent(),p.label=4;case 4:return d=Date.now(),l={path:t,folder:s,type:"file",size:n.length,ctime:d,mtime:d,content:!o&&n.indexOf(",")>=0?n.split(",")[1]:n},[4,this.dbRequest("put",[l])];case 5:return p.sent(),[2,{uri:l.path}]}}))}))},t.prototype.appendFile=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r,i,o,s,a,c,u,d;return Object(E["c"])(this,(function(l){switch(l.label){case 0:return t=this.getPath(e.directory,e.path),n=e.data,r=t.substr(0,t.lastIndexOf("/")),i=Date.now(),o=i,[4,this.dbRequest("get",[t])];case 1:if(s=l.sent(),s&&"directory"===s.type)throw"The supplied path is a directory.";return[4,this.dbRequest("get",[r])];case 2:return a=l.sent(),void 0!==a?[3,4]:(c=r.indexOf("/",1),-1===c?[3,4]:(u=r.substr(c),[4,this.mkdir({path:u,directory:e.directory,recursive:!0})]));case 3:l.sent(),l.label=4;case 4:return void 0!==s&&(n=s.content+n,o=s.ctime),d={path:t,folder:r,type:"file",size:n.length,ctime:o,mtime:i,content:n},[4,this.dbRequest("put",[d])];case 5:return l.sent(),[2,{}]}}))}))},t.prototype.deleteFile=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r;return Object(E["c"])(this,(function(i){switch(i.label){case 0:return t=this.getPath(e.directory,e.path),[4,this.dbRequest("get",[t])];case 1:if(n=i.sent(),void 0===n)throw Error("File does not exist.");return[4,this.dbIndexRequest("by_folder","getAllKeys",[IDBKeyRange.only(t)])];case 2:if(r=i.sent(),0!==r.length)throw Error("Folder is not empty.");return[4,this.dbRequest("delete",[t])];case 3:return i.sent(),[2,{}]}}))}))},t.prototype.mkdir=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r,i,o,s,a,c,u;return Object(E["c"])(this,(function(d){switch(d.label){case 0:return t=this.getPath(e.directory,e.path),n=e.recursive,r=t.substr(0,t.lastIndexOf("/")),i=(t.match(/\//g)||[]).length,[4,this.dbRequest("get",[r])];case 1:return o=d.sent(),[4,this.dbRequest("get",[t])];case 2:if(s=d.sent(),1===i)throw Error("Cannot create Root directory");if(void 0!==s)throw Error("Current directory does already exist.");if(!n&&2!==i&&void 0===o)throw Error("Parent directory must exist");return n&&2!==i&&void 0===o?(a=r.substr(r.indexOf("/",1)),[4,this.mkdir({path:a,directory:e.directory,recursive:n})]):[3,4];case 3:d.sent(),d.label=4;case 4:return c=Date.now(),u={path:t,folder:r,type:"directory",size:0,ctime:c,mtime:c},[4,this.dbRequest("put",[u])];case 5:return d.sent(),[2,{}]}}))}))},t.prototype.rmdir=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r,i,o,s,a,c,u,d,l;return Object(E["c"])(this,(function(p){switch(p.label){case 0:return t=e.path,n=e.directory,r=e.recursive,i=this.getPath(n,t),[4,this.dbRequest("get",[i])];case 1:if(o=p.sent(),void 0===o)throw Error("Folder does not exist.");if("directory"!==o.type)throw Error("Requested path is not a directory");return[4,this.readdir({path:t,directory:n})];case 2:if(s=p.sent(),0!==s.files.length&&!r)throw Error("Folder is not empty");a=0,c=s.files,p.label=3;case 3:return a<c.length?(u=c[a],d=t+"/"+u,[4,this.stat({path:d,directory:n})]):[3,9];case 4:return l=p.sent(),"file"!==l.type?[3,6]:[4,this.deleteFile({path:d,directory:n})];case 5:return p.sent(),[3,8];case 6:return[4,this.rmdir({path:d,directory:n,recursive:r})];case 7:p.sent(),p.label=8;case 8:return a++,[3,3];case 9:return[4,this.dbRequest("delete",[i])];case 10:return p.sent(),[2,{}]}}))}))},t.prototype.readdir=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r,i;return Object(E["c"])(this,(function(o){switch(o.label){case 0:return t=this.getPath(e.directory,e.path),[4,this.dbRequest("get",[t])];case 1:if(n=o.sent(),""!==e.path&&void 0===n)throw Error("Folder does not exist.");return[4,this.dbIndexRequest("by_folder","getAllKeys",[IDBKeyRange.only(t)])];case 2:return r=o.sent(),i=r.map((function(e){return e.substring(t.length+1)})),[2,{files:i}]}}))}))},t.prototype.getUri=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n;return Object(E["c"])(this,(function(r){switch(r.label){case 0:return t=this.getPath(e.directory,e.path),[4,this.dbRequest("get",[t])];case 1:return n=r.sent(),void 0!==n?[3,3]:[4,this.dbRequest("get",[t+"/"])];case 2:n=r.sent(),r.label=3;case 3:if(void 0===n)throw Error("Entry does not exist.");return[2,{uri:n.path}]}}))}))},t.prototype.stat=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n;return Object(E["c"])(this,(function(r){switch(r.label){case 0:return t=this.getPath(e.directory,e.path),[4,this.dbRequest("get",[t])];case 1:return n=r.sent(),void 0!==n?[3,3]:[4,this.dbRequest("get",[t+"/"])];case 2:n=r.sent(),r.label=3;case 3:if(void 0===n)throw Error("Entry does not exist.");return[2,{type:n.type,size:n.size,ctime:n.ctime,mtime:n.mtime,uri:n.path}]}}))}))},t.prototype.rename=function(e){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(t){return[2,this._copy(e,!0)]}))}))},t.prototype.copy=function(e){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(t){return[2,this._copy(e,!1)]}))}))},t.prototype._copy=function(e,t){return void 0===t&&(t=!1),Object(E["a"])(this,void 0,void 0,(function(){var n,r,i,o,s,a,c,u,d,l,p,f,h,v,b,m,w,y,g=this;return Object(E["c"])(this,(function(O){switch(O.label){case 0:if(n=e.to,r=e.from,i=e.directory,o=e.toDirectory,!n||!r)throw Error("Both to and from must be provided");if(o||(o=i),s=this.getPath(i,r),a=this.getPath(o,n),s===a)return[2,{}];if(a.startsWith(s))throw Error("To path cannot contain the from path");O.label=1;case 1:return O.trys.push([1,3,,6]),[4,this.stat({path:n,directory:o})];case 2:return c=O.sent(),[3,6];case 3:return O.sent(),u=n.split("/"),u.pop(),d=u.join("/"),u.length>0?[4,this.stat({path:d,directory:o})]:[3,5];case 4:if(l=O.sent(),"directory"!==l.type)throw new Error("Parent directory of the to path is a file");O.label=5;case 5:return[3,6];case 6:if(c&&"directory"===c.type)throw new Error("Cannot overwrite a directory with a file");return[4,this.stat({path:r,directory:i})];case 7:switch(p=O.sent(),f=function(e,t,n){return Object(E["a"])(g,void 0,void 0,(function(){var r,i;return Object(E["c"])(this,(function(s){switch(s.label){case 0:return r=this.getPath(o,e),[4,this.dbRequest("get",[r])];case 1:return i=s.sent(),i.ctime=t,i.mtime=n,[4,this.dbRequest("put",[i])];case 2:return s.sent(),[2]}}))}))},h=p.type,h){case"file":return[3,8];case"directory":return[3,15]}return[3,28];case 8:return[4,this.readFile({path:r,directory:i})];case 9:return v=O.sent(),t?[4,this.deleteFile({path:r,directory:i})]:[3,11];case 10:O.sent(),O.label=11;case 11:return[4,this.writeFile({path:n,directory:o,data:v.data})];case 12:return O.sent(),t?[4,f(n,p.ctime,p.mtime)]:[3,14];case 13:O.sent(),O.label=14;case 14:return[2,{}];case 15:if(c)throw Error("Cannot move a directory over an existing object");O.label=16;case 16:return O.trys.push([16,20,,21]),[4,this.mkdir({path:n,directory:o,recursive:!1})];case 17:return O.sent(),t?[4,f(n,p.ctime,p.mtime)]:[3,19];case 18:O.sent(),O.label=19;case 19:return[3,21];case 20:return O.sent(),[3,21];case 21:return[4,this.readdir({path:r,directory:i})];case 22:b=O.sent().files,m=0,w=b,O.label=23;case 23:return m<w.length?(y=w[m],[4,this._copy({from:r+"/"+y,to:n+"/"+y,directory:i,toDirectory:o},t)]):[3,26];case 24:O.sent(),O.label=25;case 25:return m++,[3,23];case 26:return t?[4,this.rmdir({path:r,directory:i})]:[3,28];case 27:O.sent(),O.label=28;case 28:return[2,{}]}}))}))},t._debug=!0,t}(g)),D=(new A,function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return t.forEach((function(t){if(t&&"object"===typeof t)for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})),e}),I=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0,n="x"===e?t:3&t|8;return n.toString(16)}))},T=function(e){function t(){return e.call(this,{name:"Geolocation",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.getCurrentPosition=function(e){var t=this;return new Promise((function(n,r){return t.requestPermissions().then((function(t){window.navigator.geolocation.getCurrentPosition((function(e){n(e)}),(function(e){r(e)}),D({enableHighAccuracy:!0,timeout:1e4,maximumAge:0},e))}))}))},t.prototype.watchPosition=function(e,t){var n=window.navigator.geolocation.watchPosition((function(e){t(e)}),(function(e){t(null,e)}),D({enableHighAccuracy:!0,timeout:1e4,maximumAge:0},e));return""+n},t.prototype.clearWatch=function(e){return window.navigator.geolocation.clearWatch(parseInt(e.id,10)),Promise.resolve()},t}(g),F=(new T,function(e){function t(){return e.call(this,{name:"Device",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.getInfo=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e,t;return Object(E["c"])(this,(function(n){return e=navigator.userAgent,t=this.parseUa(e),[2,Promise.resolve({model:t.model,platform:"web",appVersion:"",appBuild:"",appId:"",appName:"",operatingSystem:t.operatingSystem,osVersion:t.osVersion,manufacturer:navigator.vendor,isVirtual:!1,uuid:this.getUid()})]}))}))},t.prototype.getBatteryInfo=function(){return Object(E["a"])(this,void 0,void 0,(function(){var e;return Object(E["c"])(this,(function(t){switch(t.label){case 0:e={},t.label=1;case 1:return t.trys.push([1,3,,4]),[4,navigator.getBattery()];case 2:return e=t.sent(),[3,4];case 3:return t.sent(),[3,4];case 4:return[2,Promise.resolve({batteryLevel:e.level,isCharging:e.charging})]}}))}))},t.prototype.getLanguageCode=function(){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(e){return[2,{value:navigator.language}]}))}))},t.prototype.parseUa=function(e){var t={},n=e.indexOf("(")+1,r=e.indexOf(") AppleWebKit");-1!==e.indexOf(") Gecko")&&(r=e.indexOf(") Gecko"));var i=e.substring(n,r);if(-1!==e.indexOf("Android"))t.model=i.replace("; wv","").split("; ").pop().split(" Build")[0],t.osVersion=i.split("; ")[1];else if(t.model=i.split("; ")[0],navigator.oscpu)t.osVersion=navigator.oscpu;else if(-1!==e.indexOf("Windows"))t.osVersion=i;else{var o=i.split("; ").pop().replace(" like Mac OS X","").split(" ");t.osVersion=o[o.length-1].replace(/_/g,".")}return/android/i.test(e)?t.operatingSystem="android":/iPad|iPhone|iPod/.test(e)&&!window.MSStream?t.operatingSystem="ios":/Win/.test(e)?t.operatingSystem="windows":/Mac/i.test(e)?t.operatingSystem="mac":t.operatingSystem="unknown",t},t.prototype.getUid=function(){var e=window.localStorage.getItem("_capuid");return e||(e=I(),window.localStorage.setItem("_capuid",e),e)},t}(g)),N=(new F,function(e){function t(){var t=e.call(this,{name:"LocalNotifications",platforms:["web"]})||this;return t.pending=[],t}return Object(E["b"])(t,e),t.prototype.createChannel=function(e){throw new Error("Feature not available in the browser. "+e.id)},t.prototype.deleteChannel=function(e){throw new Error("Feature not available in the browser. "+e.id)},t.prototype.listChannels=function(){throw new Error("Feature not available in the browser")},t.prototype.sendPending=function(){var e=this,t=[],n=+new Date;this.pending.forEach((function(r){r.schedule&&r.schedule.at&&+r.schedule.at<=n&&(e.buildNotification(r),t.push(r))})),console.log("Sent pending, removing",t),this.pending=this.pending.filter((function(e){return!t.find((function(t){return t===e}))}))},t.prototype.sendNotification=function(e){var t=this,n=e;if(e.schedule&&e.schedule.at){var r=+e.schedule.at-+new Date;return this.pending.push(n),void setTimeout((function(){t.sendPending()}),r)}this.buildNotification(e)},t.prototype.buildNotification=function(e){var t=e;return new Notification(t.title,{body:t.body})},t.prototype.schedule=function(e){var t=this,n=[];return e.notifications.forEach((function(e){n.push(t.sendNotification(e))})),Promise.resolve({notifications:e.notifications.map((function(e){return{id:""+e.id}}))})},t.prototype.getPending=function(){return Promise.resolve({notifications:this.pending.map((function(e){return{id:""+e.id}}))})},t.prototype.registerActionTypes=function(e){throw new Error("Method not implemented.")},t.prototype.cancel=function(e){return console.log("Cancel these",e),this.pending=this.pending.filter((function(t){return!e.notifications.find((function(e){return e.id===""+t.id}))})),Promise.resolve()},t.prototype.areEnabled=function(){return Promise.resolve({value:"granted"===Notification.permission})},t.prototype.requestPermission=function(){return new Promise((function(e){Notification.requestPermission((function(t){var n=!0;"denied"!==t&&"default"!==t||(n=!1),e({granted:n})}))}))},t.prototype.requestPermissions=function(){return new Promise((function(e,t){Notification.requestPermission((function(n){"denied"!==n&&"default"!==n?e({results:[n]}):t(n)}))}))},t}(g)),U=(new N,function(e){function t(){return e.call(this,{name:"Share",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.share=function(e){return navigator.share?navigator.share({title:e.title,text:e.text,url:e.url}):Promise.reject("Web Share API not available")},t}(g)),_=(new U,function(e){function t(){return e.call(this,{name:"Modals",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.alert=function(e){return Object(E["a"])(this,void 0,void 0,(function(){return Object(E["c"])(this,(function(t){return window.alert(e.message),[2,Promise.resolve()]}))}))},t.prototype.prompt=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t;return Object(E["c"])(this,(function(n){return t=window.prompt(e.message,e.inputText||""),[2,Promise.resolve({value:t,cancelled:null===t})]}))}))},t.prototype.confirm=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t;return Object(E["c"])(this,(function(n){return t=window.confirm(e.message),[2,Promise.resolve({value:t})]}))}))},t.prototype.showActions=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t=this;return Object(E["c"])(this,(function(n){return[2,new Promise((function(n,r){return Object(E["a"])(t,void 0,void 0,(function(){var t,r=this;return Object(E["c"])(this,(function(i){return t=document.querySelector("pwa-action-sheet"),t||(t=document.createElement("pwa-action-sheet"),document.body.appendChild(t)),t.header=e.title,t.cancelable=!1,t.options=e.options,t.addEventListener("onSelection",(function(e){return Object(E["a"])(r,void 0,void 0,(function(){var t;return Object(E["c"])(this,(function(r){return t=e.detail,n({index:t}),[2]}))}))})),[2]}))}))}))]}))}))},t}(g)),k=(new _,function(e){function t(){var t=e.call(this,{name:"Motion"})||this;return t.registerWindowListener("devicemotion","accel"),t.registerWindowListener("deviceorientation","orientation"),t}return Object(E["b"])(t,e),t}(g)),q=(new k,function(e){function t(){var t=e.call(this,{name:"Network",platforms:["web"]})||this;return t.listenerFunction=null,t}return Object(E["b"])(t,e),t.prototype.getStatus=function(){return new Promise((function(e,t){if(window.navigator){var n=window.navigator.onLine,r=window.navigator.connection||window.navigator.mozConnection||window.navigator.webkitConnection,i=r?r.type||r.effectiveType:"wifi";e({connected:n,connectionType:n?i:"none"})}else t("Network info not available")}))},t.prototype.addListener=function(e,t){var n=this,r=window.navigator.connection||window.navigator.mozConnection||window.navigator.webkitConnection,i=r?r.type||r.effectiveType:"wifi",o=t.bind(n,{connected:!0,connectionType:i}),s=t.bind(n,{connected:!1,connectionType:"none"});if(0===e.localeCompare("networkStatusChange"))return window.addEventListener("online",o),window.addEventListener("offline",s),{remove:function(){window.removeEventListener("online",o),window.removeEventListener("offline",s)}}},t}(g)),W=(new q,function(e){function t(){return e.call(this,{name:"Permissions"})||this}return Object(E["b"])(t,e),t.prototype.query=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n,r;return Object(E["c"])(this,(function(i){switch(i.label){case 0:return t=window.navigator,t.permissions?(n=e.name===f.Photos?"camera":e.name,[4,t.permissions.query({name:n})]):[2,Promise.reject("This browser does not support the Permissions API")];case 1:return r=i.sent(),[2,{state:r.state}]}}))}))},t}(g)),B=(new W,function(e){function t(){return e.call(this,{name:"SplashScreen",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.show=function(e,t){return Promise.resolve()},t.prototype.hide=function(e,t){return Promise.resolve()},t}(g)),K=(new B,function(e){function t(){var t=e.call(this,{name:"Storage",platforms:["web"]})||this;return t.KEY_PREFIX="_cap_",t}return Object(E["b"])(t,e),t.prototype.get=function(e){var t=this;return new Promise((function(n,r){n({value:window.localStorage.getItem(t.makeKey(e.key))})}))},t.prototype.set=function(e){var t=this;return new Promise((function(n,r){window.localStorage.setItem(t.makeKey(e.key),e.value),n()}))},t.prototype.remove=function(e){var t=this;return new Promise((function(n,r){window.localStorage.removeItem(t.makeKey(e.key)),n()}))},t.prototype.keys=function(){var e=this;return new Promise((function(t,n){t({keys:Object.keys(localStorage).filter((function(t){return e.isKey(t)})).map((function(t){return e.getKey(t)}))})}))},t.prototype.clear=function(){var e=this;return new Promise((function(t,n){Object.keys(localStorage).filter((function(t){return e.isKey(t)})).forEach((function(e){return window.localStorage.removeItem(e)})),t()}))},t.prototype.makeKey=function(e){return this.KEY_PREFIX+e},t.prototype.isKey=function(e){return 0===e.indexOf(this.KEY_PREFIX)},t.prototype.getKey=function(e){return e.substr(this.KEY_PREFIX.length)},t}(g)),M=(new K,function(e){function t(){return e.call(this,{name:"Toast",platforms:["web"]})||this}return Object(E["b"])(t,e),t.prototype.show=function(e){return Object(E["a"])(this,void 0,void 0,(function(){var t,n;return Object(E["c"])(this,(function(r){return t=2e3,e.duration&&(t="long"===e.duration?3500:2e3),n=document.createElement("pwa-toast"),n.duration=t,n.message=e.text,document.body.appendChild(n),[2]}))}))},t}(g));new M;P(m["a"])},f750:function(e,t,n){"use strict";(function(e){n.d(t,"a",(function(){return o}));var r=n("2cba"),i=function(e){return e.Capacitor=e.Capacitor||new r["a"]}("undefined"!==typeof self?self:"undefined"!==typeof window?window:"undefined"!==typeof e?e:{}),o=i.Plugins}).call(this,n("c8ba"))}}]);
//# sourceMappingURL=chunk-6592bfe9.134a0c1e.js.map