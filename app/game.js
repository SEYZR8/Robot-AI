const canvas=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x182333);scene.fog=new THREE.Fog(0x182333,90,520);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1500);
scene.add(new THREE.HemisphereLight(0x9fb9d0,0x292018,1.7));
const sun=new THREE.DirectionalLight(0xffe6c4,2.4);sun.position.set(-120,180,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-180;sun.shadow.camera.right=180;sun.shadow.camera.top=180;sun.shadow.camera.bottom=-180;scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshStandardMaterial({color:0x69705e,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(x,y,z,c,sx,sy,sz,rough=.8){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c,roughness:rough}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
// Samarqand-inspired urban grid
for(let x=-216;x<=216;x+=36)for(let z=-216;z<=216;z+=36){if(Math.abs(x)<20&&Math.abs(z)<100)continue;if(Math.random()<.78){const h=5+Math.random()*18,w=15+Math.random()*10;box(x,h/2,z,Math.random()<.28?0xb98a5c:0x9c927d,w,h,w);if(Math.random()<.35)box(x,h+.8,z,0x6b5b4d,w*.7,1.5,w*.7)}}
for(let x=-216;x<=216;x+=72)box(x,.02,0,0x25282b,13,.05,450,1);
for(let z=-216;z<=216;z+=72)box(0,.025,z,0x25282b,450,.05,13,1);
// road markings
for(let x=-216;x<=216;x+=72)for(let z=-210;z<=210;z+=22)box(x,.06,z,0xc7b56e,.35,.03,8,1);
for(let z=-216;z<=216;z+=72)for(let x=-210;x<=210;x+=22)box(x,.065,z,0xc7b56e,8,.03,.35,1);
// trees and parks
for(let i=0;i<180;i++){const x=(Math.random()-.5)*420,z=(Math.random()-.5)*420;if(Math.abs(x%72)<10||Math.abs(z%72)<10)continue;box(x,2,z,0x60442d,1,4,1);const t=new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*1.5,10,8),new THREE.MeshStandardMaterial({color:0x315d38,roughness:1}));t.position.set(x,6,z);t.castShadow=true;scene.add(t)}
// original landmark, not a copy of any game asset
for(const x of[-12,12]){box(x,7,-70,0xc69a67,8,14,4);box(x,14.5,-68,0x2b6e78,9,1,2)}
box(0,2,-60,0xd2ad75,34,4,12);for(const x of[-12,12]){const d=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,17,18),new THREE.MeshStandardMaterial({color:0x4e8d91,roughness:.55}));d.position.set(x,8.5,-66);d.castShadow=true;scene.add(d)}
// vehicle
const car=new THREE.Group();
const body=box(0,1.25,0,0x9e1d22,3.35,1.35,6.3,.55);car.add(body);
const cabin=box(0,2.35,-.25,0x182027,2.55,1.25,3.25,.2);car.add(cabin);
for(const x of[-1.72,1.72])for(const z of[-2.05,2.05]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.38,20),new THREE.MeshStandardMaterial({color:0x111214,roughness:.95}));w.rotation.z=Math.PI/2;w.position.set(x,.62,z);w.castShadow=true;car.add(w)}
car.position.set(0,0,145);scene.add(car);
// a few moving traffic vehicles
const traffic=[];for(let i=0;i<12;i++){const v=box((i%3-1)*72,.9,-180+i*30,0x3b4e61,2.8,1.1,5.4,.5);traffic.push({mesh:v,z:v.position.z,speed:.08+Math.random()*.08})}
const keys={};let speed=0,camYaw=0,camPitch=.25,started=false,mouseDown=false,lastX=0,lastY=0;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Shift')keys.shift=true});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key==='Shift')keys.shift=false});
document.getElementById('start').addEventListener('click',()=>{started=true;document.getElementById('intro').classList.add('hide');document.body.requestPointerLock?.()});
addEventListener('mousedown',e=>{mouseDown=true;lastX=e.clientX;lastY=e.clientY});addEventListener('mouseup',()=>mouseDown=false);addEventListener('mousemove',e=>{if(document.pointerLockElement===document.body){camYaw-=e.movementX*.0025;camPitch=Math.max(-.15,Math.min(.65,camPitch-e.movementY*.002));}else if(mouseDown){camYaw-=(e.clientX-lastX)*.004;camPitch=Math.max(-.15,Math.min(.65,camPitch-(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY}});
function update(dt){if(!started)return;
const forward=keys.w?1:keys.s?-1:0;const boost=keys.shift?1.65:1;const accel=forward>0?.22*boost:forward<0?-.16:0;speed+=accel*dt;speed-=speed*(forward?0.035:0.09)*dt;speed=Math.max(-.55,Math.min(1.25*boost,speed));
const steer=(keys.a?-1:0)+(keys.d?1:0);const steering=Math.min(1,Math.abs(speed)*2.2);car.rotation.y-=steer*.9*steering*dt;
if(keys[' '])speed*=Math.pow(.18,dt);
car.translateZ(-speed*dt*60);
// soft world boundaries
car.position.x=Math.max(-430,Math.min(430,car.position.x));car.position.z=Math.max(-430,Math.min(430,car.position.z));
traffic.forEach(t=>{t.mesh.position.z+=t.speed*dt*60;if(t.mesh.position.z>240)t.mesh.position.z=-240});
}
function render(){requestAnimationFrame(render);const dt=Math.min(.033,clock.getDelta());update(dt);const distance=14+Math.min(9,Math.abs(speed)*5);const target=new THREE.Vector3(0,3.4, distance);target.applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y+camYaw);target.y+=camPitch*8;target.add(car.position);camera.position.lerp(target,1-Math.pow(.001,dt));const look=new THREE.Vector3(car.position.x,1.6,car.position.z);camera.lookAt(look);document.getElementById('speed').textContent=Math.round(Math.abs(speed)*85)+' km/soat';renderer.render(scene,camera)}
const clock=new THREE.Clock();camera.position.set(0,5,160);camera.lookAt(car.position);render();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
