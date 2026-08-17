const canvas=document.getElementById('game');
const intro=document.getElementById('intro');
const startButton=document.getElementById('start');
const status=document.getElementById('status');
const errorBox=document.getElementById('error');
const speedText=document.getElementById('speed');
const missionText=document.getElementById('mission');

if(!window.THREE){throw new Error('Three.js yuklanmadi');}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){errorBox.style.display='block';errorBox.textContent='Kompyuteringiz WebGL 3D grafikani qo‘llab-quvvatlamadi.';throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x172332);
scene.fog=new THREE.Fog(0x172332,90,620);
const camera=new THREE.PerspectiveCamera(66,innerWidth/innerHeight,.1,1800);
scene.add(new THREE.HemisphereLight(0xaec7dc,0x292019,1.7));
const sun=new THREE.DirectionalLight(0xffe5c0,2.35);
sun.position.set(-140,190,90);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-220;sun.shadow.camera.right=220;sun.shadow.camera.top=220;sun.shadow.camera.bottom=-220;scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshStandardMaterial({color:0x626b5b,roughness:1,metalness:0}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

function mat(c,r=.8,m=0){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});}
function addBox(parent,x,y,z,c,sx,sy,sz,r=.8){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c,r));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

// City blocks
for(let x=-216;x<=216;x+=36){
 for(let z=-216;z<=216;z+=36){
  if(Math.abs(x)<20&&Math.abs(z)<105)continue;
  if(Math.random()<.78){const h=5+Math.random()*18,w=15+Math.random()*10;addBox(scene,x,h/2,z,Math.random()<.28?0xb98a5c:0x9c927d,w,h,w,.9);}
 }
}
// Roads and lane markings
for(let x=-216;x<=216;x+=72){addBox(scene,x,.02,0,0x25282b,13,.05,450,1);for(let z=-210;z<=210;z+=22)addBox(scene,x,.06,z,0xd2bc74,.3,.025,8,1);}
for(let z=-216;z<=216;z+=72){addBox(scene,0,.025,z,0x25282b,450,.05,13,1);for(let x=-210;x<=210;x+=22)addBox(scene,x,.065,z,0xd2bc74,8,.025,.3,1);}
// Parks and trees
for(let i=0;i<170;i++){const x=(Math.random()-.5)*420,z=(Math.random()-.5)*420;if(Math.abs(x%72)<10||Math.abs(z%72)<10)continue;addBox(scene,x,2,z,0x60442d,1,4,1,1);const t=new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*1.5,12,9),mat(0x315d38,1));t.position.set(x,6,z);t.castShadow=true;scene.add(t);}
// Original landmark inspired by Samarkand architecture
for(const x of[-12,12]){addBox(scene,x,7,-70,0xc69a67,8,14,4,.7);addBox(scene,x,14.5,-68,0x2b6e78,9,1,2,.5);}
addBox(scene,0,2,-60,0xd2ad75,34,4,12,.8);
for(const x of[-12,12]){const d=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,17,18),mat(0x4e8d91,.55));d.position.set(x,8.5,-66);d.castShadow=true;scene.add(d);}

// Player vehicle
const car=new THREE.Group();
const body=addBox(car,0,1.25,0,0x9e1d22,3.35,1.35,6.3,.48);
addBox(car,0,2.35,-.25,0x182027,2.55,1.25,3.25,.18);
for(const x of[-1.72,1.72])for(const z of[-2.05,2.05]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.38,20),mat(0x111214,.96));w.rotation.z=Math.PI/2;w.position.set(x,.62,z);w.castShadow=true;car.add(w);}
car.position.set(0,0,145);scene.add(car);

// Traffic
const traffic=[];
for(let i=0;i<14;i++){
 const lane=[-144,-72,72,144][i%4];
 const v=new THREE.Group();addBox(v,0,.9,0,[0x34495e,0x6b3f35,0x59633e,0x777777][i%4],2.8,1.1,5.4,.55);v.position.set(lane,0,-230+i*32);v.userData.speed=0.06+Math.random()*.075;scene.add(v);traffic.push(v);
}

const keys=Object.create(null);
let started=false,camYaw=0,camPitch=.22,mouseDown=false,lastX=0,lastY=0;
let speed=0,steerVelocity=0,headingVelocity=0;
const clock=new THREE.Clock();

addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.code==='Space')keys.space=true;});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.code==='Space')keys.space=false;});
addEventListener('blur',()=>{for(const k in keys)delete keys[k];});

startButton.addEventListener('click',()=>{
 if(started)return;
 started=true;
 intro.classList.add('hide');
 missionText.textContent='Prolog: Shaharga qaytish — Registon tomon boring';
 document.body.requestPointerLock?.();
 clock.start();
});

addEventListener('mousedown',e=>{mouseDown=true;lastX=e.clientX;lastY=e.clientY;});
addEventListener('mouseup',()=>mouseDown=false);
addEventListener('mousemove',e=>{
 if(document.pointerLockElement===document.body){camYaw-=e.movementX*.0025;camPitch=Math.max(-.18,Math.min(.62,camPitch-e.movementY*.002));}
 else if(mouseDown){camYaw-=(e.clientX-lastX)*.004;camPitch=Math.max(-.18,Math.min(.62,camPitch-(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY;}
});

function update(dt){
 if(!started)return;
 // Simplified but physically motivated vehicle model: engine force, drag, rolling resistance, braking and speed-dependent steering.
 const forward=keys.w?1:keys.s?-1:0;
 const boost=keys.shift?1.45:1;
 const maxForward=1.20*boost;
 const engineForce=forward>0?.24*boost:forward<0?-.14:0;
 const drag=.028*speed*Math.abs(speed);
 const rolling=.055*speed;
 speed+=(engineForce-drag-rolling)*dt;
 if(keys.space)speed*=Math.pow(.045,dt);
 if(!forward)speed*=Math.pow(.38,dt);
 speed=Math.max(-.42,Math.min(maxForward,speed));
 const steer=(keys.a?-1:0)+(keys.d?1:0);
 const grip=Math.min(1,Math.abs(speed)*2.8);
 const targetSteer=steer*0.72*grip;
 steerVelocity+=(targetSteer-steerVelocity)*Math.min(1,9*dt);
 headingVelocity+=(steerVelocity*speed*1.65-headingVelocity)*Math.min(1,5*dt);
 car.rotation.y-=headingVelocity*dt;
 car.translateZ(-speed*dt*60);
 // World boundary
 car.position.x=Math.max(-440,Math.min(440,car.position.x));
 car.position.z=Math.max(-440,Math.min(440,car.position.z));
 // Traffic motion
 for(const v of traffic){v.position.z+=v.userData.speed*dt*60;if(v.position.z>250)v.position.z=-250;}
 speedText.textContent=Math.round(Math.abs(speed)*86)+' km/soat';
}

function render(){
 requestAnimationFrame(render);
 const dt=Math.min(.033,clock.getDelta());
 update(dt);
 const distance=13+Math.min(10,Math.abs(speed)*5);
 const target=new THREE.Vector3(0,3.2,distance);
 target.applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y+camYaw);
 target.y+=camPitch*8;
 target.add(car.position);
 camera.position.lerp(target,1-Math.pow(.001,dt));
 camera.lookAt(car.position.x,1.55,car.position.z);
 renderer.render(scene,camera);
}

camera.position.set(0,5,160);camera.lookAt(car.position);clock.stop();render();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);});
