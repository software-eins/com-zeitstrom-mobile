(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3f12c38e"],{"856d":function(e,n,t){"use strict";t.d(n,"b",(function(){return s}));t("d3b7");var r=t("d4ec"),i=t("bee2"),a=t("257e"),u=t("262e"),o=t("2caf"),c=t("df40"),l=function(e){Object(u["a"])(t,e);var n=Object(o["a"])(t);function t(){var e;return Object(r["a"])(this,t),e=n.call(this,"/api/v2/devices/devices/"),e.formFields=[new c["c"]("serial_number","Seriennummer",{autofocus:!0,showEdit:!1}),new c["c"]("human_readable_name","Bezeichnung",{mobileType:"stacked",showEdit:!1}),new c["c"]("serial_number","Seriennummer",{isReadOnly:!0,showCreate:!1}),new c["c"]("model","Baureihe",{isReadOnly:!0,showCreate:!1,default:"Token-Scanner"}),new c["c"]("human_readable_name","Bezeichnung",{mobileType:"stacked",autofocus:!0,showCreate:!1}),new c["c"]("authentication_mode","Authentifizierung",{type:"select",remoteSourceService:Object(a["a"])(e),remoteSourceAttribute:"label",remoteSourceListMethod:"listAuthenticationModes",isSelectedValueInOptionList:!0,allowNull:!1,showCreate:!1,conditions:[new c["d"]("model","MFP*")]})],e.cacheTimeout=900,e}return Object(i["a"])(t,[{key:"titleAttribute",value:function(e){return Promise.resolve((function(e){return e.human_readable_name?e.human_readable_name:e.serial_number}))}},{key:"newResourceTitle",value:function(e){return Promise.resolve("Terminal hinzufügen")}},{key:"newResourceConfirmation",value:function(e){return Promise.resolve("Terminal hinzugefügt")}},{key:"deleteResourceMethod",value:function(e){return Promise.resolve("delete")}},{key:"deleteResourceTitle",value:function(e){return Promise.resolve("Entfernen")}},{key:"deleteResourceConfirmation",value:function(e){return Promise.resolve("Terminal entfernt")}},{key:"listAuthenticationModes",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:50,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";return this._getChoices("authentication-modes/",e,n,t)}},{key:"listParams",value:function(e){var n=e.pagesize||50,t=e.page||1,r=e.query||"",i="?limit="+String(n)+"&offset="+String((t-1)*n)+"&q="+encodeURIComponent(String(r));return this._get(i)}}]),t}(c["a"]),s=new l;n["a"]=s},aa72:function(e,n,t){"use strict";t.r(n);var r=t("7a23"),i=Object(r["h"])("Es existiert aktuell keine Zeiterfassungs-Hardware in deinem Unternehmen."),a=Object(r["h"])("Füge Hardware hinzu, um deinen Mitarbeitern die Arbeitszeiterfassung über dedizierte Terminals zu ermöglichen.");function u(e,n,t,u,o,c){var l=Object(r["z"])("zeit-list");return Object(r["r"])(),Object(r["e"])(l,{resourceType:"Hardware",basePath:"/devices/",searchPlaceholder:"Suche nach Seriennummer",service:e.deviceService,fields:e.fields},{"no-results":Object(r["E"])((function(){return[i]})),"no-results-add":Object(r["E"])((function(){return[a]})),_:1},8,["service","fields"])}var o=t("83e5"),c=t("856d"),l=Object(r["j"])({components:{ZeitList:o["a"]},data:function(){return{deviceService:c["a"],fields:[{id:"serial_number",label:"Seriennummer",mobileLevel:"p"},{id:"human_readable_name",label:"Bezeichnung",default:"Keine Bezeichnung",mobileLevel:"h2"},{id:"model",label:"Baureihe",default:"Token-Scanner",mobileLevel:"p"}]}}});l.render=u;n["default"]=l}}]);
//# sourceMappingURL=chunk-3f12c38e.d9d18483.js.map