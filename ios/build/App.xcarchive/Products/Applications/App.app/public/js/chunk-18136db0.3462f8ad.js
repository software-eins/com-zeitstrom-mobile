(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-18136db0"],{acca:function(e,r,n){"use strict";n.r(r);var t=n("7a23"),i=Object(t["h"])("Es existieren aktuell keine Projekte."),o=Object(t["h"])("Sobald du ein Projekt erstellst, können Arbeitszeiten Projekten zugewiesen werden.");function c(e,r,n,c,l,a){var s=Object(t["z"])("zeit-list");return Object(t["r"])(),Object(t["e"])(s,{resourceType:"Projekte",basePath:"/projects/",searchPlaceholder:"Suche nach Name oder Code",service:e.projectService,fields:e.fields},{"no-results":Object(t["E"])((function(){return[i]})),"no-results-add":Object(t["E"])((function(){return[o]})),_:1},8,["service","fields"])}var l=n("ff79"),a=n("83e5"),s=n("e7b7"),d=n("1e47"),u=n("3384"),h=Object(t["j"])({components:{ZeitList:a["a"]},data:function(){return{projectService:s["a"],fields:[{id:"name",label:"Name",mobileLevel:"h2"},{id:"highlighted",hideDesktop:!0,mobileLevel:"h2-icons",formatter:function(e){if(e.highlighted)return new u["a"](l["S"])}},{id:"code",label:"Code",mobileLevel:"p"},{id:"color",label:"Projektfarbe",mobileLevel:"colorborder"},{id:"total_duration",label:"Erfasste Zeit",mobileLevel:"p",promise:function(e){return Object(d["d"])(e.total_duration).then((function(e){return e+" h"}))}}]}}});h.render=c;r["default"]=h},e7b7:function(e,r,n){"use strict";n.d(r,"b",(function(){return s}));n("a15b"),n("d3b7");var t=n("d4ec"),i=n("bee2"),o=n("262e"),c=n("2caf"),l=n("df40"),a=function(e){Object(o["a"])(n,e);var r=Object(c["a"])(n);function n(){var e;return Object(t["a"])(this,n),e=r.call(this,"/api/v2/projects/projects/"),e.formFields=[new l["c"]("name","Name",{autofocus:!0}),new l["c"]("code","Code",{}),new l["c"]("highlighted","Hervorgehoben",{type:"bool",description:"Hervorgehobene Projekte können schneller durch Mitarbeiter ausgewählt werden. Es können maximal 3 Projekte hervorgehoben werden."}),new l["c"]("color","Farbe",{type:"color"})],e.archivedFormFields=[new l["c"]("name","Name",{isReadOnly:!0}),new l["c"]("code","Code",{isReadOnly:!0}),new l["c"]("highlighted","Hervorgehoben",{type:"bool",isReadOnly:!0,description:"Hervorgehobene Projekte können schneller durch Mitarbeiter ausgewählt werden. Es können maximal 3 Projekte hervorgehoben werden."}),new l["c"]("color","Farbe",{type:"color",isReadOnly:!0})],e.cacheTimeout=300,e}return Object(i["a"])(n,[{key:"newResourceTitle",value:function(e){return Promise.resolve("Projekt hinzufügen")}},{key:"newResourceConfirmation",value:function(e){return Promise.resolve("Projekt hinzugefügt")}},{key:"deleteResourceMethod",value:function(e){return Promise.resolve("archive")}},{key:"deleteResourceTitle",value:function(e){return Promise.resolve("Archivieren")}},{key:"deleteResourceConfirmation",value:function(e){return Promise.resolve("Projekt archiviert")}},{key:"listParams",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:50,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"",t=arguments.length>3?arguments[3]:void 0;t=t||{};var i="?limit="+String(r)+"&offset="+String((e-1)*r)+"&q="+encodeURIComponent(String(n));return t.ids&&t.ids.length>0&&(i+="&ids="+t.ids.join("|")),(t.ids&&t.ids.length>0||t.includeArchived)&&(i+="&include-archived"),t.highlighted&&(i+="&highlighted"),this._get(i)}},{key:"archive",value:function(e){var r=this,n=this._post(e+"/archive/",{});return n.then((function(){r.clearCache()})),n}}]),n}(l["a"]),s=new a;r["a"]=s}}]);
//# sourceMappingURL=chunk-18136db0.3462f8ad.js.map