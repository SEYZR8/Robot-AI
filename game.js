(() => {
'use strict';
const canvas=document.getElementById('game');
const gl=canvas.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:false});
if(!gl){document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;display:grid;place-items:center;background:#08111f;color:white;font:18px system-ui">WebGL bu qurilmada qo‘llab-quvvatlanmaydi.</div>');return;}
const $=id=>document.getElementById(id);
const state={running:false,x:0,y:1.65,z:12,yaw:0,pitch:-0.18,money:250000,hp:100,wanted:0,time:8,mission:0,inCar:false,run:false,carSpeed:0};
const keys={}; const joy={x:0,y:0,active:false};
let audio=null;
function sound(type){try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)(); if(audio.state==='suspended')audio.resume(); const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);const t=audio.currentTime;const map={click:[520,.06,'square'],step:[130,.045,'sine'],car:[80,.18,'sawtooth'],horn:[220,.16,'square'],money:[880,.12,'sine'],ui:[440,.05,'triangle']};const v=map[type]||map.click;o.type=v[2];o.frequency.setValueAtTime(v[0],t);o.frequency.exponentialRampToValueAtTime(Math.max(45,v[0]*.72),t+v[1]);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+v[1]);o.start(t);o.stop(t+v[1]+.02);}catch(e){}}
const V=`attribute vec3 p;attribute vec3 c;uniform mat4 mvp;uniform float light;varying vec3 v;void main(){gl_Position=mvp*vec4(p,1.0);v=c*light;}`;
const F=`precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,V));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,F));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link error');gl.useProgram(program);
const loc={p:gl.getAttribLocation(program,'p'),c:gl.getAttribLocation(program,'c'),mvp:gl.getUniformLocation(program,'mvp'),light:gl.getUniformLocation(program,'light')};
const verts=[];
function tri(a,b,c,col){verts.push(...a,...col,...b,...col,...c,...col)}
function box(x,y,z,sx,sy,sz,col){const x0=x-sx/2,x1=x+sx/2,y0=y,y1=y+sy,z0=z-sz/2,z1=z+sz/2;const p=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],f=[[0,1,2,0,2,3],[1,5,6,1,6,2],[5,4,7,5,7,6],[4,0,3,4,3,7],[3,2,6,3,6,7],[4,5,1,4,1,0]];for(const q of f){for(let i=0;i<6;i+=3)tri(p[q[i]],p[q[i+1]],p[q[i+2]],col);}}
function cyl(x,y,z,r,h,col,n=8){for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;tri([x,y,z],[x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],col);tri([x,y+h,z],[x+Math.cos(b)*r,y+h,z+Math.sin(b)*r],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],col);tri([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],[x+Math.cos(b)*r,y+h,z+Math.sin(b)*r],col);tri([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y+h,z+Math.sin(b)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],col);}}
function roof(x,y,z,s,col){tri([x-s/2,y,z-s/2],[x+s/2,y,z-s/2],[x,y+s*.45,z],col);tri([x+s/2,y,z-s/2],[x+s/2,y,z+s/2],[x,y+s*.45,z],col);tri([x+s/2,y,z+s/2],[x-s/2,y,z+s/2],[x,y+s*.45,z],col);tri([x-s/2,y,z+s/2],[x-s/2,y,z-s/2],[x,y+s*.45,z],col);}
// Ground and roads
box(0,-.2,0,120,.2,120,[.12,.19,.15]);
for(let x=-50;x<=50;x+=10)box(x,.01,0,5,.05,120,[.08,.09,.10]);
for(let z=-50;z<=50;z+=10)box(0,.02,z,120,.05,5,[.08,.09,.10]);
// Buildings, shops and landmarks
for(let x=-45;x<=45;x+=10)for(let z=-45;z<=45;z+=10){if(Math.abs(x)<=5||Math.abs(z)<=5)continue;const h=5+((Math.abs(x*17+z*11)%11));const col=[.22+.018*(h%4),.28+.012*(Math.abs(x)%5),.36+.015*(Math.abs(z)%4)];box(x,h/2,z,7.2,h,7.2,col);for(let wy=1;wy<h;wy+=2)box(x,wy+.45,z-3.62,3.4,.7,.04,[.7,.75,.55]);if((x+z)%20===0)roof(x,h,z,7.2,[.18,.16,.14]);}
// Central boulevard, plaza and fountain
box(0,.08,0,5,.08,120,[.28,.27,.23]);box(0,.09,0,120,.08,5,[.28,.27,.23]);
cyl(0,.12,0,4,.35,[.35,.45,.55],16);cyl(0,.47,0,.55,2.1,[.55,.65,.72],12);
// Trees
for(let x=-44;x<=44;x+=11)for(let z=-44;z<=44;z+=11)if(Math.abs(x)>8&&Math.abs(z)>8){cyl(x,.08,z,.28,2.0,[.27,.18,.08],7);cyl(x,2.0,z,1.25,2.0,[.08,.35,.16],9);}
// Street lamps
for(let x=-45;x<=45;x+=15)for(const z of [-3.2,3.2]){cyl(x,.08,z,.08,3,[.16,.17,.18],6);box(x,3.05,z,.45,.12,.45,[.8,.75,.45]);}
// Cars: body + cabin + wheels + lights
function car(x,y,z,rot,col){const ca=Math.cos(rot),sa=Math.sin(rot);const px=x, pz=z;box(px,y+.35,pz,3.5,.65,6.3,col);box(px,y+.85,pz-.15,2.6,.65,2.9,[.12,.18,.23]);for(const sx of [-1.55,1.55])for(const sz of [-2.05,2.05])cyl(px+sx,y+.18,pz+sz,.43,.25,[.025,.025,.03],10);box(px,y+.52,pz-3.12,.55,.22,.08,[.95,.15,.12]);box(px,y+.52,pz+3.12,.55,.22,.08,[.95,.9,.65]);}
car(-12,.08,-18,0,[.75,.12,.08]);car(15,.08,22,Math.PI,[.08,.28,.65]);car(28,.08,-8,0,[.75,.48,.08]);
// Player model: body, head, legs, arms
function player(x,y,z){cyl(x,y-.8,z,.32,1.1,[.08,.25,.62],8);cyl(x,y+.35,z,.24,.55,[.72,.48,.30],8);cyl(x-.42,y-.65,z,.12,.85,[.06,.07,.10],7);cyl(x+.42,y-.65,z,.12,.85,[.06,.07,.10],7);cyl(x-.52,y-.05,z,.1,.75,[.08,.25,.62],7);cyl(x+.52,y-.05,z,.1,.75,[.08,.25,.62],7);}
// NPCs
const npcs=[[-7,1.65,-8],[7,1.65,-12],[-16,1.65,8],[17,1.65,9],[30,1.65,13],[-28,1.65,-18]];
for(const n of npcs){cyl(n[0],.15,n[2],.28,1.0,[.45,.25,.12],8);cyl(n[0],1.15,n[2],.22,.5,[.8,.6,.35],8);}
const data=new Float32Array(verts),buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(loc.c);gl.vertexAttribPointer(loc.c,3,gl.FLOAT,false,24,12);
function ident(){const a=new Float32Array(16);a[0]=a[5]=a[10]=a[15]=1;return a;}
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function perspective(f,asp,n,far){const q=1/Math.tan(f/2),o=new Float32Array(16);o[0]=q/asp;o[5]=q;o[10]=(far+n)/(n-far);o[11]=-1;o[14]=2*far*n/(n-far);return o;}
function camera(){const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),o=ident();o[0]=cy;o[2]=-sy;o[5]=cp;o[6]=sp;o[8]=sy*cp;o[10]=cy*cp;o[12]=-(o[0]*state.x+o[8]*state.z);o[13]=-(state.y+2.8);o[14]=-(-o[2]*state.x-o[10]*state.z+10);return o;}
function resize(){const d=Math.min(devicePixelRatio||1,1.35),w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}
function hud(){state.time=(state.time+.002)%24;$('clock').textContent=String(Math.floor(state.time)).padStart(2,'0')+':'+String(Math.floor(state.time%1*60)).padStart(2,'0');$('hp').textContent=Math.max(0,Math.floor(state.hp));$('wanted').textContent=state.wanted;$('money').textContent=Math.floor(state.money).toLocaleString('uz-UZ');}
function move(dt){let f=-joy.y||((keys.w?1:0)-(keys.s?1:0)),r=joy.x||((keys.d?1:0)-(keys.a?1:0));if(!f&&!r){state.carSpeed*=.94;return;}const speed=(state.inCar?12:4.5)*(state.run?1.55:1);state.carSpeed=speed;state.x+=(Math.sin(state.yaw)*f+Math.cos(state.yaw)*r)*speed*dt;state.z+=(Math.cos(state.yaw)*f-Math.sin(state.yaw)*r)*speed*dt;state.x=Math.max(-56,Math.min(56,state.x));state.z=Math.max(-56,Math.min(56,state.z));if(Math.random()<dt*2)sound(state.inCar?'car':'step');}
function render(){resize();gl.enable(gl.DEPTH_TEST);gl.clearColor(.025,.06,.1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const P=perspective(1.02,canvas.width/canvas.height,.1,180),M=mul(P,camera());const daylight=.45+.5*Math.max(0,Math.sin((state.time-6)/24*Math.PI*2));gl.uniformMatrix4fv(loc.mvp,false,M);gl.uniform1f(loc.light,daylight);gl.drawArrays(gl.TRIANGLES,0,data.length/6);}
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Shift')state.run=true;if(e.key==='e')action();});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key==='Shift')state.run=false;});
const stick=$('stick'),knob=document.createElement('div');knob.className='knob';stick.appendChild(knob);function joyMove(e){const r=stick.getBoundingClientRect(),p=e.touches?e.touches[0]:e,x=p.clientX-r.left-r.width/2,y=p.clientY-r.top-r.height/2,d=Math.hypot(x,y),m=r.width*.42,k=Math.min(1,d/m);joy.x=(d?x/d:0)*k;joy.y=(d?y/d:0)*k;knob.style.transform=`translate(${joy.x*35}px,${joy.y*35}px)`;}stick.addEventListener('pointerdown',e=>{joy.active=true;stick.setPointerCapture(e.pointerId);joyMove(e);sound('ui');});stick.addEventListener('pointermove',e=>joy.active&&joyMove(e));stick.addEventListener('pointerup',()=>{joy.active=false;joy.x=joy.y=0;knob.style.transform=''});
$('run').onpointerdown=()=>{state.run=true;sound('ui')};$('run').onpointerup=()=>state.run=false;
function action(){sound('click');if(state.mission===0){state.mission=1;state.money+=50000;$('missionText').textContent='Yangi topshiriq: ish joyiga yetib boring.';sound('money');}else{$('dialog').classList.remove('hidden');$('dialogText').textContent='AI: Assalomu alaykum! Bu UZB ROLE. Shahar, ish, transport va qonunlar sizning qarorlaringiz bilan rivojlanadi.';}}
$('action').onclick=action;$('dialogBtn').onclick=()=>{$('dialog').classList.add('hidden');sound('ui')};
$('enter').onclick=()=>{state.inCar=!state.inCar;$('enter').textContent=state.inCar?'🚶':'🚗';$('missionText').textContent=state.inCar?'Mashina bilan markazga boring.':'Markazga boring.';sound(state.inCar?'car':'click');};
$('play').onclick=()=>{audio=null;sound('ui');$('start').remove();state.running=true;last=performance.now();requestAnimationFrame(frame);};
let last=performance.now();function frame(now){if(!state.running)return;const dt=Math.min(.033,(now-last)/1000);last=now;move(dt);hud();render();requestAnimationFrame(frame);}resize();render();
})();
