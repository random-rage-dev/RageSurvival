(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const absolute_path="package://RageZombies/cef/views/";class CEFBrowser{constructor(e){this._setup(e)}_setup(e){this.browser=mp.browsers.new(absolute_path+e),this.cursorState=!1}call(){let e=Array.prototype.slice.call(arguments),s=e[0],t="(";for(let s=1;s<e.length;s++){switch(typeof e[s]){case"string":t+="'"+e[s]+"'";break;case"number":case"boolean":t+=e[s];break;case"object":t+=JSON.stringify(e[s])}s<e.length-1&&(t+=",")}s+=t+=");",this.browser.execute(s)}active(e){this.browser.active=e}get isActive(){return this.browser.active}cursor(e){this.cursorState=e,mp.gui.cursor.visible=e}load(e){this.browser.url=absolute_path+e}}module.exports=CEFBrowser;

},{}],2:[function(require,module,exports){
const movementClipSet="move_ped_crouched",strafeClipSet="move_ped_crouched_strafing",clipSetSwitchTime=.25,loadClipSet=e=>{for(mp.game.streaming.requestClipSet(e);!mp.game.streaming.hasClipSetLoaded(e);)mp.game.wait(0)};loadClipSet(movementClipSet),loadClipSet(strafeClipSet),mp.events.add("entityStreamIn",e=>{"player"===e.type&&e.getVariable("isCrouched")&&(e.setMovementClipset(movementClipSet,.25),e.setStrafeClipset(strafeClipSet))}),mp.events.addDataHandler("isCrouched",(e,t)=>{"player"===e.type&&(t?(e.setMovementClipset(movementClipSet,.25),e.setStrafeClipset(strafeClipSet)):(e.resetMovementClipset(.25),e.resetStrafeClipset()))}),mp.keys.bind(17,!1,()=>{mp.events.callRemote("Player:Crouch")});

},{}],3:[function(require,module,exports){
require("./vector.js");var natives=require("./natives.js"),materials=require("./materials.js");console.log=function(...e){mp.gui.chat.push("DEBUG:"+e.join(" "))},mp.events.add("render",()=>{let e=9999,a=new mp.Vector3(mp.players.local.position.x,mp.players.local.position.y,mp.players.local.position.z),i=mp.players.local.getHeading();a=a.findRot(i,.5,90);for(var t=0;t<180;t+=10){let r=a.findRot(i,5,t),l=mp.raycasting.testCapsule(a,r,.1,mp.players.local.handle,-1);if(l){r=new mp.Vector3(l.position.x,l.position.y,l.position.z),a.dist(r)<e?(mp.game.graphics.drawLine(a.x,a.y,a.z,r.x,r.y,r.z,0,255,0,255),mp.game.graphics.drawText("Found "+(null!=materials[l.material]?materials[l.material]:l.material),[r.x,r.y,r.z],{font:4,color:[255,255,255,185],scale:[.3,.3],outline:!0,centre:!0})):mp.game.graphics.drawLine(a.x,a.y,a.z,r.x,r.y,r.z,159,150,0,255),console.log(JSON.stringify(mp.objects.atHandle(l.entity)))}else mp.game.graphics.drawLine(a.x,a.y,a.z,r.x,r.y,r.z,255,0,0,255)}});

},{"./materials.js":6,"./natives.js":7,"./vector.js":12}],4:[function(require,module,exports){
require("./scaleforms/index.js"),require("./crouch.js"),require("./items.js"),require("./gathering.js");var LastCam,natives=require("./natives.js"),CEFBrowser=require("./browser.js"),Browser=new CEFBrowser("login/index.html");function clearBlips(){natives.SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT(!0);let e=natives.GET_FIRST_BLIP_INFO_ID(5);for(;natives.DOES_BLIP_EXIST(e);)mp.game.ui.removeBlip(e),e=natives.GET_NEXT_BLIP_INFO_ID(5);mp.game.wait(50)}mp.events.callRemote("ServerAccount:Ready"),mp.game.graphics.transitionToBlurred(1),mp.events.add("Server:RequestLogin",()=>{clearBlips(),(LastCam=mp.cameras.new("default",new mp.Vector3(593.5968627929688,-1820.015869140625,142.7814483642578),new mp.Vector3,60)).pointAtCoord(163.39794921875,-1788.3284912109375,27.982322692871094),LastCam.setActive(!0),mp.game.cam.renderScriptCams(!0,!1,0,!0,!1),mp.game.ui.displayHud(!1),mp.game.ui.displayRadar(!1),mp.game.graphics.transitionToBlurred(1),Browser.cursor(!0),setTimeout(function(){Browser.call("cef_loadlogin",mp.players.local.name)},100)}),mp.events.add("Account:Alert",function(...e){Browser.call("alert_login",e[0])}),mp.events.add("Account:HideLogin",()=>{mp.game.graphics.transitionFromBlurred(500),Browser.cursor(!1),Browser.call("cef_hidelogin")}),mp.events.add("Account:LoginDone",()=>{mp.game.player.setTargetingMode(1),mp.game.player.setLockon(!1),mp.game.player.setLockonRangeOverride(0),mp.players.local.setOnlyDamagedByPlayer(!1),mp.players.local.setProofs(!0,!1,!1,!1,!1,!1,!1,!1),mp.game.player.setHealthRechargeMultiplier(0),mp.game.ui.displayRadar(!0),mp.game.ui.displayHud(!0),mp.game.ui.setMinimapVisible(!1)}),mp.events.add("Cam:Hide",()=>{mp.game.graphics.transitionFromBlurred(100),LastCam.setActive(!1),mp.game.cam.renderScriptCams(!1,!1,0,!0,!1),mp.game.ui.displayRadar(!0),mp.game.ui.displayHud(!0),mp.game.ui.setMinimapVisible(!1),mp.game.player.setTargetingMode(1),mp.game.player.setLockon(!1),mp.game.player.setLockonRangeOverride(0),mp.players.local.setOnlyDamagedByPlayer(!1),mp.players.local.setProofs(!0,!1,!1,!1,!1,!1,!1,!1),mp.game.player.setHealthRechargeMultiplier(0)}),mp.events.add("entityStreamIn",e=>{"player"===e.type&&(mp.game.player.setTargetingMode(1),mp.game.player.setLockon(!1),mp.game.player.setLockonRangeOverride(0),mp.players.local.setOnlyDamagedByPlayer(!1),mp.players.local.setProofs(!0,!1,!1,!1,!1,!1,!1,!1),mp.game.player.setLockonRangeOverride(0))}),mp.events.add("Account:Login",(e,a)=>{mp.events.callRemote("ServerAccount:Login",e,a)}),mp.events.add("Account:Register",(e,a,r)=>{mp.events.callRemote("ServerAccount:Register",e,a,r)}),mp.events.add("Notifications:New",e=>{Browser.call("notify",e)}),mp.events.add("Player:Collision",e=>{1==e?mp.vehicles.forEach(e=>{mp.players.local.vehicle&&(mp.players.local.vehicle.setNoCollision(e.handle,!0),natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle,e,!0),natives.SET_ENTITY_NO_COLLISION_ENTITY(e,mp.players.local.vehicle,!0)),e.setAlpha(255)}):mp.vehicles.forEach(e=>{mp.players.local.vehicle&&(mp.players.local.vehicle.setNoCollision(e.handle,!1),natives.SET_ENTITY_NO_COLLISION_ENTITY(e,mp.players.local.vehicle,!1),natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle,e,!1)),e.setAlpha(150)})});

},{"./browser.js":1,"./crouch.js":2,"./gathering.js":3,"./items.js":5,"./natives.js":7,"./scaleforms/index.js":11}],5:[function(require,module,exports){
require("./vector.js"),console.log=function(...o){mp.gui.chat.push("DEBUG:"+o.join(" "))};var streamedPools=[];class LootPool{constructor(o){this._setup(o)}_setup(o){this._lootData=o,this._pickupObjects=[],this.initLootObjects()}set data(o){this._lootData=o}get position(){return new mp.Vector3(this._lootData.pos.x,this._lootData.pos.y,this._lootData.pos.z)}getLootPool(){return this._lootData.items}isInRange(){return new mp.Vector3(this._lootData.pos.x,this._lootData.pos.y,this._lootData.pos.z).dist(mp.players.local.position)<2}initLootObjects(){let o=this;console.log("loot objects init");let t=new mp.Vector3(o._lootData.pos.x,o._lootData.pos.y,o._lootData.pos.z),e=360/o._lootData.items.length;o._lootData.items.forEach(function(s,a){let l=t.findRot(0,.5,e*a),n=e*a+Math.floor(360*Math.random());n>360&&(n-=360);var i=l.findRot(0,.1,n+180).ground(),r=l.findRot(0,.1,n+0).ground(),d=l.findRot(0,.1,n+270).ground(),c=l.findRot(0,.1,n+90).ground();d.rotPoint(c),i.rotPoint(r);let p=l.ground();p.z+=1;let m=mp.objects.new(mp.game.joaat(s.model),p,{rotation:new mp.Vector3(0,0,n),alpha:255,dimension:0});m.placeOnGroundProperly();let g=m.getRotation(0),f=m.getCoords(!1);m.setCollision(!1,!0),m.setCoords(f.x+s.offset.pos.x,f.y+s.offset.pos.y,f.z-m.getHeightAboveGround()+s.offset.pos.z,!1,!1,!1,!1),m.setRotation(g.x+s.offset.rot.x,g.y+s.offset.rot.y,g.z,0,!0),o._pickupObjects.push({id:o._lootData.id,obj:m})})}render(){}unload(o){let t=this;console.log("DO UNLOADING"),t._pickupObjects.forEach(function(e,s){e.id==o&&(console.log("remove"),e.obj.markForDeletion(),e.obj.destroy(),delete t._pickupObjects[s])})}}mp.events.add("Loot:Load",(o,t)=>{streamedPools[o]||(console.log("Creating LootPool",o),streamedPools[o]=new LootPool(t))}),mp.events.add("Loot:Unload",o=>{streamedPools[o]&&(console.log("Unload LootPool",o),streamedPools[o].unload(o),delete streamedPools[o])}),mp.events.add("Loot:Reload",(o,t)=>{streamedPools[o]&&(console.log("Reload LootPool",o),streamedPools[o].data=t)}),mp.events.add("render",()=>{Object.keys(streamedPools).forEach(function(o){let t=streamedPools[o];if(1==t.isInRange()){let o=t.position,e=360/t.getLootPool().length;t.getLootPool().forEach(function(t,s){let a=o.findRot(0,.5,e*s).ground();mp.game.graphics.drawText(t.name,[a.x,a.y,a.z+.3],{font:4,color:[255,255,255,185],scale:[.3,.3],outline:!0,centre:!0})})}})}),mp.keys.bind(9,!1,()=>{mp.game.gameplay.setWeatherTypeNow("SMOG"),mp.game.time.setClockTime(2,0,0),console.log("LoL"),console.log(Object.keys(streamedPools)),Object.keys(streamedPools).forEach(function(o){let t=streamedPools[o];1==t.isInRange()&&console.log(JSON.stringify(t.getLootPool()))})});

},{"./vector.js":12}],6:[function(require,module,exports){
var materials={2379541433:"Tree",127813971:"Stone",3454750755:"Mineral Stone",581794674:"Vegetation"};module.exports=materials;

},{}],7:[function(require,module,exports){
var natives={};mp.game.graphics.clearDrawOrigin=(()=>mp.game.invoke("0xFF0B610F6BE0D7AF")),natives.START_PLAYER_TELEPORT=((E,e,_,a,i,n,m,T)=>mp.game.invoke("0xAD15F075A4DA0FDE",E,e,_,a,i,n,m,T)),natives.CHANGE_PLAYER_PED=((E,e,_)=>mp.game.invoke("0x048189FAC643DEEE",E,e,_)),natives.SET_PED_CURRENT_WEAPON_VISIBLE=((E,e,_,a,i)=>mp.game.invoke("0x0725A4CCFDED9A70",E,e,_,a,i)),natives.SET_BLIP_SPRITE=((E,e)=>mp.game.invoke("0xDF735600A4696DAF",E,e)),natives.SET_BLIP_ALPHA=((E,e)=>mp.game.invoke("0x45FF974EEE1C8734",E,e)),natives.SET_BLIP_COLOUR=((E,e)=>mp.game.invoke("0x03D7FB09E75D6B7E",E,e)),natives.SET_BLIP_ROTATION=((E,e)=>mp.game.invoke("0xF87683CDF73C3F6E",E,e)),natives.SET_BLIP_FLASHES=((E,e)=>mp.game.invoke("0xB14552383D39CE3E",E,e)),natives.SET_BLIP_FLASH_TIMER=((E,e)=>mp.game.invoke("0xD3CD6FD297AE87CC",E,e)),natives.SET_BLIP_COORDS=((E,e,_,a)=>mp.game.invoke("0xAE2AF67E9D9AF65D",E,e,_,a)),natives.SET_CURSOR_LOCATION=((E,e)=>mp.game.invoke("0xFC695459D4D0E219",E,e)),natives.SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT=(E=>mp.game.invoke("0xB98236CAAECEF897",E)),natives.GET_FIRST_BLIP_INFO_ID=(E=>mp.game.invoke("0x1BEDE233E6CD2A1F",E)),natives.GET_NEXT_BLIP_INFO_ID=(E=>mp.game.invoke("0x14F96AA50D6FBEA7",E)),natives.DOES_BLIP_EXIST=(E=>mp.game.invoke("0xA6DB27D19ECBB7DA",E)),natives.GET_NUMBER_OF_ACTIVE_BLIPS=(()=>mp.game.invoke("0x9A3FF3DE163034E8")),natives.SET_BLIP_SCALE=((E,e)=>mp.game.invoke("0xD38744167B2FA257",E,e)),natives.SET_ENTITY_NO_COLLISION_ENTITY=((E,e,_)=>mp.game.invoke("0xA53ED5520C07654A",E.handle,e.handle,_)),natives.GET_CLOSEST_OBJECT_OF_TYPE=((E,e,_,a,i,n,m,T)=>mp.game.invoke("0xE143FA2249364369",E,e,_,a,i,n,m,T)),natives.DOES_OBJECT_OF_TYPE_EXIST_AT_COORDS=((E,e,_,a,i,n)=>mp.game.invoke("0xBFA48E2FF417213F",E,e,_,a,i,n)),module.exports=natives;

},{}],8:[function(require,module,exports){
var messageScaleform=require("./Scaleform.js");let bigMessageScaleform=null,bigMsgInit=0,bigMsgDuration=5e3,bigMsgAnimatedOut=!1;mp.events.add("ShowWeaponPurchasedMessage",(e,g,s,a=5e3)=>{null==bigMessageScaleform&&(bigMessageScaleform=new messageScaleform("mp_big_message_freemode")),bigMessageScaleform.callFunction("SHOW_WEAPON_PURCHASED",e,g,s),bigMsgInit=Date.now(),bigMsgDuration=a,bigMsgAnimatedOut=!1}),mp.events.add("ShowPlaneMessage",(e,g,s,a=5e3)=>{null==bigMessageScaleform&&(bigMessageScaleform=new messageScaleform("mp_big_message_freemode")),bigMessageScaleform.callFunction("SHOW_PLANE_MESSAGE",e,g,s),bigMsgInit=Date.now(),bigMsgDuration=a,bigMsgAnimatedOut=!1}),mp.events.add("ShowShardMessage",(e,g,s,a,i=5e3)=>{null==bigMessageScaleform&&(bigMessageScaleform=new messageScaleform("mp_big_message_freemode")),bigMessageScaleform.callFunction("SHOW_SHARD_CENTERED_MP_MESSAGE",e,g,s,a),bigMsgInit=Date.now(),bigMsgDuration=i,bigMsgAnimatedOut=!1}),mp.events.add("render",()=>{null!=bigMessageScaleform&&(bigMessageScaleform.renderFullscreen(),bigMsgInit>0&&Date.now()-bigMsgInit>bigMsgDuration&&(bigMsgAnimatedOut?(bigMsgInit=0,bigMessageScaleform.dispose(),bigMessageScaleform=null):(bigMessageScaleform.callFunction("TRANSITION_OUT"),bigMsgAnimatedOut=!0,bigMsgDuration+=750)))});

},{"./Scaleform.js":10}],9:[function(require,module,exports){
var messageScaleform=require("./Scaleform.js");let midsizedMessageScaleform=null,msgInit=0,msgDuration=5e3,msgAnimatedOut=!1,msgBgColor=0;mp.events.add("ShowMidsizedMessage",(e,s,m=5e3)=>{null==midsizedMessageScaleform&&(midsizedMessageScaleform=new messageScaleform("midsized_message")),midsizedMessageScaleform.callFunction("SHOW_MIDSIZED_MESSAGE",e,s),msgInit=Date.now(),msgDuration=m,msgAnimatedOut=!1}),mp.events.add("ShowMidsizedShardMessage",(e,s,m,a,i,d=5e3)=>{null==midsizedMessageScaleform&&(midsizedMessageScaleform=new messageScaleform("midsized_message")),midsizedMessageScaleform.callFunction("SHOW_SHARD_MIDSIZED_MESSAGE",e,s,m,a,i),msgInit=Date.now(),msgDuration=d,msgAnimatedOut=!1,msgBgColor=m}),mp.events.add("render",()=>{null!=midsizedMessageScaleform&&(midsizedMessageScaleform.renderFullscreen(),msgInit>0&&Date.now()-msgInit>msgDuration&&(msgAnimatedOut?(msgInit=0,midsizedMessageScaleform.dispose(),midsizedMessageScaleform=null):(midsizedMessageScaleform.callFunction("SHARD_ANIM_OUT",msgBgColor),msgAnimatedOut=!0,msgDuration+=750)))});

},{"./Scaleform.js":10}],10:[function(require,module,exports){
class BasicScaleform{constructor(e){for(this.handle=mp.game.graphics.requestScaleformMovie(e);!mp.game.graphics.hasScaleformMovieLoaded(this.handle);)mp.game.wait(0)}callFunction(e,...a){mp.game.graphics.pushScaleformMovieFunction(this.handle,e),a.forEach(e=>{switch(typeof e){case"string":mp.game.graphics.pushScaleformMovieFunctionParameterString(e);break;case"boolean":mp.game.graphics.pushScaleformMovieFunctionParameterBool(e);break;case"number":Number(e)===e&&e%1!=0?mp.game.graphics.pushScaleformMovieFunctionParameterFloat(e):mp.game.graphics.pushScaleformMovieFunctionParameterInt(e)}}),mp.game.graphics.popScaleformMovieFunctionVoid()}renderFullscreen(){mp.game.graphics.drawScaleformMovieFullscreen(this.handle,255,255,255,255,!1)}dispose(){mp.game.graphics.setScaleformMovieAsNoLongerNeeded(this.handle)}}module.exports=BasicScaleform;

},{}],11:[function(require,module,exports){
var messageScaleform=require("./Scaleform.js");require("./BigMessage.js"),require("./MidsizedMessage.js"),mp.game.ui.messages={showShard:(e,s,a,d,h=5e3)=>mp.events.call("ShowShardMessage",e,s,a,d,h),showWeaponPurchased:(e,s,a,d=5e3)=>mp.events.call("ShowWeaponPurchasedMessage",e,s,a,d),showPlane:(e,s,a,d=5e3)=>mp.events.call("ShowPlaneMessage",e,s,a,d),showMidsized:(e,s,a=5e3)=>mp.events.call("ShowMidsizedMessage",e,s,a),showMidsizedShard:(e,s,a,d,h,i=5e3)=>mp.events.call("ShowMidsizedShardMessage",e,s,a,d,h,i)};

},{"./BigMessage.js":8,"./MidsizedMessage.js":9,"./Scaleform.js":10}],12:[function(require,module,exports){
mp.Vector3.prototype.findRot=function(t,e,o){let r=new mp.Vector3(this.x,this.y,this.z);var i=(t+o)*(Math.PI/180);return r.x=this.x+e*Math.cos(i),r.y=this.y+e*Math.sin(i),r},mp.Vector3.prototype.rotPoint=function(t){var e=new mp.Vector3(this.x,this.y,this.z),o=new mp.Vector3(t.x,t.y,t.z),r=o.z-e.z,i=e.x-o.x,h=e.y-o.y,s=Math.sqrt(i*i+h*h);return 180*Math.atan2(r,s)/Math.PI},mp.Vector3.prototype.normalize=function(t){let e=new mp.Vector3(this.x,this.y,this.z);return e.x=this.x/t,e.y=this.y/t,e.z=this.z/t,this},mp.Vector3.prototype.multiply=function(t){let e=new mp.Vector3(this.x,this.y,this.z);return e.x=this.x*t,e.y=this.y*t,e.z=this.z*t,this},mp.Vector3.prototype.dist=function(t){let e=this.x-t.x,o=this.y-t.y,r=this.z-t.z;return Math.sqrt(e*e+o*o+r*r)},mp.Vector3.prototype.getOffset=function(t){let e=this.x-t.x,o=this.y-t.y,r=this.z-t.z;return new mp.Vector3(e,o,r)},mp.Vector3.prototype.ground=function(){let t=new mp.Vector3(this.x,this.y,this.z);return t.z=mp.game.gameplay.getGroundZFor3dCoord(t.x,t.y,t.z,0,!1),t};

},{}]},{},[4]);
