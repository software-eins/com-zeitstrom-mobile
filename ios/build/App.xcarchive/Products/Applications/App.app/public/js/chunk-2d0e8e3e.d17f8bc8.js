(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0e8e3e"],{"8acb":function(e,t,n){"use strict";n.r(t);var c=n("7a23"),i=Object(c["h"])("Kontakt"),o=Object(c["h"])("Absenden");function u(e,t,n,u,a,r){var s=Object(c["z"])("ion-back-button"),l=Object(c["z"])("ion-buttons"),b=Object(c["z"])("ion-title"),d=Object(c["z"])("ion-button"),j=Object(c["z"])("ion-toolbar"),f=Object(c["z"])("ion-header"),O=Object(c["z"])("ion-input"),p=Object(c["z"])("ion-item"),h=Object(c["z"])("ion-textarea"),m=Object(c["z"])("ion-list"),g=Object(c["z"])("ion-content"),I=Object(c["z"])("ion-page");return Object(c["r"])(),Object(c["e"])(I,null,{default:Object(c["E"])((function(){return[Object(c["i"])(f,null,{default:Object(c["E"])((function(){return[Object(c["i"])(j,null,{default:Object(c["E"])((function(){return[Object(c["i"])(l,{slot:"start"},{default:Object(c["E"])((function(){return[Object(c["i"])(s,{disabled:e.isLoading,"default-href":"/",text:"Zurück"},null,8,["disabled"])]})),_:1}),Object(c["i"])(b,null,{default:Object(c["E"])((function(){return[i]})),_:1}),Object(c["i"])(l,{slot:"primary"},{default:Object(c["E"])((function(){return[Object(c["i"])(d,{color:"primary",strong:!0,disabled:!e.isComplete()||e.isLoading,onClick:t[1]||(t[1]=function(t){return e.sendFeedback()})},{default:Object(c["E"])((function(){return[o]})),_:1},8,["disabled"])]})),_:1})]})),_:1})]})),_:1}),Object(c["i"])(g,{fullscreen:!0},{default:Object(c["E"])((function(){return[Object(c["i"])(m,null,{default:Object(c["E"])((function(){return[Object(c["i"])(p,{lines:"full"},{default:Object(c["E"])((function(){return[Object(c["i"])(O,{disabled:e.isLoading,modelValue:e.message.subject,"onUpdate:modelValue":t[2]||(t[2]=function(t){return e.message.subject=t}),placeholder:"Betreff"},null,8,["disabled","modelValue"])]})),_:1}),Object(c["i"])(p,{lines:"full"},{default:Object(c["E"])((function(){return[Object(c["i"])(h,{disabled:e.isLoading,modelValue:e.message.body,"onUpdate:modelValue":t[3]||(t[3]=function(t){return e.message.body=t}),rows:10,"auto-grow":"true",placeholder:"Nachricht schreiben"},null,8,["disabled","modelValue"])]})),_:1})]})),_:1})]})),_:1})]})),_:1})}var a=n("8a30"),r=n("d4ec"),s=n("262e"),l=n("2caf"),b=n("df40"),d=function(e){Object(s["a"])(n,e);var t=Object(l["a"])(n);function n(){var e;return Object(r["a"])(this,n),e=t.call(this,"/api/v2/support/tickets/"),e.formFields=[new b["c"]("subject","Dein Anliegen",{autofocus:!0}),new b["c"]("body","Detaillierte Beschreibung",{})],e}return n}(b["a"]),j=new d,f=j,O=Object(c["j"])({props:{},data:function(){return{supportTicketService:f,isLoading:!1,message:{subject:"",body:""}}},components:{IonHeader:a["i"],IonItem:a["n"],IonContent:a["g"],IonPage:a["w"],IonTitle:a["N"],IonList:a["p"],IonInput:a["m"],IonTextarea:a["M"],IonToolbar:a["P"],IonButtons:a["d"],IonBackButton:a["b"],IonButton:a["c"]},methods:{isComplete:function(){return this.message.subject&&this.message.body},sendFeedback:function(){var e=this;this.isLoading=!0,this.supportTicketService.create(this.message).then((function(){e.$router.go(-1),a["U"].create({message:"Nachricht versendet.",duration:2e3}).then((function(e){return e.present()}))})).catch((function(){e.isLoading=!1}))}}});O.render=u;t["default"]=O}}]);
//# sourceMappingURL=chunk-2d0e8e3e.d17f8bc8.js.map