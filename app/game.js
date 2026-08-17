const canvas=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x91b8d8);scene.fog=new THREE.Fog(0x91b8d8,90,500);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1000);camera.position.set(0,7,12);
scene.add(new THREE.HemisphereLight(0xbfe0ff,0x554433,2));const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(-80,120,50);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({color:0x69735e,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(x,y,z,c,sx,sy,sz){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
// Samarqand-inspired city blocks
for(let x=-180;x<=180;x+=24)for(let z=-180;z<=180;z+=24){if(Math.abs(x)<15&&Math.abs(z)<80)continue;if(Math.random()<.82){let h=5+Math.random()*16;box(x, h/2,z,Math.random()<.3?0xc89b63:0xb7a27e,18,h,18);}}
// roads
for(let x=-168;x<=168;x+=48)box(x,.025,0,0x252525,10,.05,360);for(let z=-168;z<=168;z+=48)box(0,.03,z,0x252525,360,.05,10);
// trees
for(let i=0;i<130;i++){let x=(Math.random()-.5)*350,z=(Math.random()-.5)*350;if(Math.abs(x%48)<7||Math.abs(z%48)<7)continue;box(x,2,z,0x76502f,1.2,4,1.2);let t=new THREE.Mesh(new THREE.SphereGeometry(3.5,10,8),new THREE.MeshStandardMaterial({color:0x2e6b3b}));t.position.set(x,6,z);t.castShadow=true;scene.add(t)}
// original Registan-inspired landmark
for(let x=-10;x<=10;x+=10){box(x,7,-55,0xd1a16e,7,14,3);box(x,13,-53,0x1d6b78,8,12,2)}box(0,2,-45,0xd4ae76,30,4,8);for(let x=-11;x<=11;x+=11){let d=new THREE.Mesh(new THREE.CylinderGeometry(2,2,16,16),new THREE.MeshStandardMaterial({color:0x4d8b8c}));d.position.set(x,8,-50);scene.add(d)}
// vehicle
const car=new THREE.Group();const body=box(0,1.3,0,0xc91e25,3.2,1.3,6);car.add(body);const cabin=box(0,2.25,-.2,0x20252b,2.5,1.2,3);car.add(cabin);for(const x of[-1.65,1.65])for(const z of[-2,2]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.35,16),new THREE.MeshStandardMaterial({color:0x111111}));w.rotation.z=Math.PI/2;w.position.set(x,.65,z);car.add(w)}car.position.set(0,0,80);scene.add(car);body.castShadow=true;
const keys={};let speed=0,steer=0,camYaw=0,camDist=12;
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false))});
let sx=0;canvas.addEventListener('pointerdown',e=>sx=e.clientX);canvas.addEventListener('pointermove',e=>{if(e.buttons){camYaw+=(e.clientX-sx)*.006;sx=e.clientX}});
function tick(){requestAnimationFrame(tick);let accel=keys.w?.018:keys.s?-.025:0;speed+=(accel-speed*.035);speed=Math.max(-.35,Math.min(.65,speed));let turn=(keys.a?-1:0)+(keys.d?1:0);car.rotation.y-=turn*0.025*(Math.abs(speed)*2+.2);car.translateZ(-speed);if(keys.space){speed*=.7}let target=new THREE.Vector3(0,4,10);target.applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y+camYaw);target.add(car.position);camera.position.lerp(target,.12);camera.lookAt(car.position.x,1.5,car.position.z);document.getElementById('speed').textContent=Math.round(Math.abs(speed)*170)+' km/soat';renderer.render(scene,camera)}tick();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});