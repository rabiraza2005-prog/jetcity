(function(){
window.onerror=(m,u,l)=>{const e=document.getElementById('msg');e.textContent='Error: '+m+' (line '+l+')';e.style.opacity=1;e.style.fontSize='14px'};
const $=id=>document.getElementById(id);
let RSEED=31;const R=()=>(RSEED=(RSEED*16807)%2147483647)/2147483647;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
let renderer;
try{
  renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'default',precision:'mediump'});
}catch(e){
  renderer=new THREE.WebGLRenderer({antialias:false});
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
$('c').appendChild(renderer.domElement);
const scene=new THREE.Scene(),FOG=0xc7dbe5;
scene.background=new THREE.Color(FOG);scene.fog=new THREE.FogExp2(FOG,.0003);
const cam=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.3,7500);cam.rotation.order='YXZ';
const SD=new THREE.Vector3(.5,.45,.3).normalize();
const hemi=new THREE.HemisphereLight(0xdbeaff,0x6b7f5a,1.05);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,1.4);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.5;
Object.assign(sun.shadow.camera,{left:-170,right:170,top:170,bottom:-170,near:1,far:700});
scene.add(sun,sun.target);
const nightU={value:0},warmU={value:0};
const sky=new THREE.Mesh(new THREE.SphereGeometry(5000,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{sd:{value:SD},nt:nightU,warm:warmU},
 vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 v;uniform vec3 sd;uniform float nt;uniform float warm;void main(){vec3 d=normalize(v);float h=max(d.y,0.);vec3 c=mix(vec3(.78,.86,.9),vec3(.22,.48,.85),pow(h,.45));c=mix(c,vec3(1.,.5,.25),warm*clamp(1.-h*2.,0.,1.));float s=max(dot(d,sd),0.);c+=vec3(1.,.85,.6)*(pow(s,12.)*.35+pow(s,500.)*3.);vec3 nc=mix(vec3(.03,.05,.1),vec3(.005,.01,.04),pow(h,.5));float st=step(.997,fract(sin(dot(floor(d*160.),vec3(12.9,78.2,37.7)))*43758.5))*smoothstep(.05,.3,d.y);float md=max(dot(d,normalize(vec3(-.4,.5,.3))),0.);nc+=vec3(.9,.95,1.)*(st*.9+pow(md,300.)*2.+pow(md,10.)*.05);c=mix(c,nc,nt);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n}'}));
scene.add(sky);

const M=c=>new THREE.MeshLambertMaterial({color:c});
const flat=(w,d,x,y,z,col)=>{const mt=M(col);if(y>.01){mt.polygonOffset=true;mt.polygonOffsetFactor=-1;mt.polygonOffsetUnits=-Math.round(y*120)}const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),mt);m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m};
const o=new THREE.Object3D();o.rotation.order='YXZ';
const K=(i,j)=>(i+60)*200+(j+60);
const P3=new THREE.Vector3(),T3=new THREE.Vector3(),tm=new THREE.Matrix4(),wm=new THREE.Matrix4();
const place=(mesh,idx,Mw,lx,ly,lz,sc)=>{tm.makeScale(sc,sc,sc);tm.setPosition(lx,ly,lz);wm.multiplyMatrices(Mw,tm);mesh.setMatrixAt(idx,wm)};

// ground and sea
{const sh=new THREE.Shape();sh.moveTo(-7000,-300);sh.lineTo(5000,-300);sh.lineTo(5000,6700);sh.lineTo(-7000,6700);sh.closePath();
 [[900,960],[1700,1760]].forEach(([a,b])=>{const h=new THREE.Path();h.moveTo(a,228);h.lineTo(b,228);h.lineTo(b,252);h.lineTo(a,252);h.closePath();sh.holes.push(h)});
 const g2=new THREE.Mesh(new THREE.ShapeGeometry(sh).rotateX(-Math.PI/2),M(0x86b05e));g2.position.y=-.03;g2.receiveShadow=true;scene.add(g2)}
flat(3640,2080,-1320,0,-900,0xcfc9bc);
flat(640,620,2940,0,-180,0xd2c6aa);
flat(3640,150,-1320,.02,225,0x7fb35a);
const sand=new THREE.Mesh(new THREE.BoxGeometry(12000,1,30),M(0xeedcae));sand.position.set(-1000,-.45,315);sand.receiveShadow=true;scene.add(sand);
const sea=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000).rotateX(-Math.PI/2),new THREE.MeshPhongMaterial({color:0x2a8fa0,specular:0xffffff,shininess:90}));sea.position.y=-.6;scene.add(sea);

// roads
const rc=document.createElement('canvas');rc.width=rc.height=32;
const rcx=rc.getContext('2d');rcx.fillStyle='#3a3f45';rcx.fillRect(0,0,32,32);rcx.fillStyle='#e9e4cf';rcx.fillRect(15,4,2,12);rcx.fillRect(1,0,1,32);rcx.fillRect(30,0,1,32);
const rtex=new THREE.CanvasTexture(rc);rtex.wrapS=rtex.wrapT=THREE.RepeatWrapping;
const po=(m,u)=>{m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=u;return m};const roadMat=po(new THREE.MeshLambertMaterial({map:rtex}),-6),roadMatH=po(new THREE.MeshLambertMaterial({map:rtex}),-10),roadMat2=po(new THREE.MeshLambertMaterial({map:rtex,side:THREE.DoubleSide}),-14);
function road(len,x,z,rot,y){
  const g=new THREE.PlaneGeometry(24,len).rotateX(-Math.PI/2),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*len/16);
  const m=new THREE.Mesh(g,y>=.09?roadMatH:roadMat);m.position.set(x,y,z);m.rotation.y=rot;m.receiveShadow=true;scene.add(m);return m;
}
const ROADOFF={},SEGI={};let ROADN=0;
const sgV=new THREE.PlaneGeometry(24,120).rotateX(-Math.PI/2);{const uv=sgV.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*7.5)}
const sgH=sgV.clone().rotateY(Math.PI/2),segL=[];
for(let i=-26;i<=4;i++)for(let k=-16;k<=0;k++)segL.push([1,i,k]);
for(let j=-16;j<=1;j++)for(let k=-26;k<=3;k++)segL.push([0,j,k]);
for(let i=22;i<=27;i++)for(let k=-4;k<=0;k++)segL.push([1,i,k]);
for(let j=-4;j<=1;j++)if(j!==-2)for(let k=22;k<=26;k++)segL.push([0,j,k]);
{const nV=segL.filter(q=>q[0]).length,RV=new THREE.InstancedMesh(sgV,roadMat,nV),RH=new THREE.InstancedMesh(sgH,roadMatH,segL.length-nV);let iv=0,ih=0;
 segL.forEach(([v,l,k2])=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);if(v){o.position.set(l*120,.05,k2*120+60);o.updateMatrix();RV.setMatrixAt(iv,o.matrix);SEGI['V'+l+':'+k2]=[RV,iv++]}else{o.position.set(k2*120+60,.1,l*120);o.updateMatrix();RH.setMatrixAt(ih,o.matrix);SEGI['H'+l+':'+k2]=[RH,ih++]}});
 RV.receiveShadow=RH.receiveShadow=true;scene.add(RV,RH)}
// power poles and wires along every road
const POLES=[];let pm,pa2,wl;
{const PL={};segL.forEach(([v,l,k2])=>{for(const t of[30,90]){const a=k2*120+t;(PL[v+':'+l]=PL[v+':'+l]||[]).push({a,x:v?l*120+14:a,z:v?a:l*120+14})}});
 const np=Object.values(PL).reduce((n2,L)=>n2+L.length,0),wp=[];
 pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.16,.2,9,6).translate(0,4.5,0),M(0x6b5a48),np);pa2=new THREE.InstancedMesh(new THREE.BoxGeometry(3,.18,.18).translate(0,8.7,0),M(0x6b5a48),np);let pi=0;
 for(const L of Object.values(PL)){L.sort((p1,q1)=>p1.a-q1.a);L.forEach((p1,i)=>{
   o.position.set(p1.x,0,p1.z);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();pm.setMatrixAt(pi,o.matrix);pa2.setMatrixAt(pi,o.matrix);
   const rec={x:p1.x,z:p1.z,id:pi,w:p1.w||[]};POLES.push(rec);pi++;
   const n2=L[i+1];if(n2&&n2.a-p1.a<=61){const off=wp.length;for(const hh of[8.5,7.8]){const mx=(p1.x+n2.x)/2,mz=(p1.z+n2.z)/2;wp.push(p1.x,hh,p1.z,mx,hh-.5,mz,mx,hh-.5,mz,n2.x,hh,n2.z)}rec.w.push(off);n2.w=[off]}})}
 wl=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(wp,3)),new THREE.LineBasicMaterial({color:0x1b1b1b}));wl.frustumCulled=false;scene.add(pm,pa2,wl)}

road(420,690,-240,Math.PI/2,.1);road(1480,2500,-240,Math.PI/2,.1);

const XI=new THREE.InstancedMesh(new THREE.PlaneGeometry(24,24).rotateX(-Math.PI/2),po(M(0x3a3f45),-18),600);
let k=0;
for(let i=-26;i<=4;i++)for(let j=-16;j<=1;j++){o.position.set(i*120,.15,j*120);o.updateMatrix();XI.setMatrixAt(k++,o.matrix)}
for(let i=22;i<=27;i++)for(let j=-4;j<=1;j++){o.position.set(i*120,.15,j*120);o.updateMatrix();XI.setMatrixAt(k++,o.matrix)}
XI.count=k;XI.receiveShadow=true;scene.add(XI);
function ribbon(pts,w,dy,mat){
  const n=pts.length,pos=[],uv=[],idx=[];let acc=0;
  for(let i=0;i<n;i++){
    const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];T3.set(b.x-a.x,0,b.z-a.z).normalize();
    const sx=-T3.z*w/2,sz=T3.x*w/2,p=pts[i];
    pos.push(p.x+sx,p.y+dy,p.z+sz,p.x-sx,p.y+dy,p.z-sz);if(i)acc+=p.distanceTo(pts[i-1]);uv.push(0,acc/16,1,acc/16);
    if(i<n-1){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat||roadMat2);m.receiveShadow=true;scene.add(m);return m;
}

// skyway
const skyCurve=new THREE.CatmullRomCurve3([[480,0,-430],[380,8,-435],[250,18,-420],[60,26,-520],[-200,26,-480],[-480,26,-600],[-760,26,-840],[-1000,26,-1000],[-1300,26,-960],[-1600,26,-1150],[-1900,26,-1400],[-2200,26,-1300],[-2500,26,-1100],[-2800,14,-1000],[-3000,0,-900]].map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'centripetal');
const SL=skyCurve.getLength(),sk=skyCurve.getSpacedPoints(Math.floor(SL/10)),skH={};
const skk=(x,z)=>(Math.floor(x/20)+300)*1000+Math.floor(z/20)+300;
sk.forEach(p=>{p.y=Math.max(0,p.y);(skH[skk(p.x,p.z)]=skH[skk(p.x,p.z)]||[]).push(p)});
function skyNear(x,z,r){
  let best=null,bd=r*r;const cx=Math.floor(x/20),cz=Math.floor(z/20),n=Math.ceil(r/20);
  for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const L=skH[(cx+a+300)*1000+cz+b+300];if(L)for(const p of L){const d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;best=p}}}
  return best;
}
const decks=[];
const gy=(x,z,yc)=>{const s=skyNear(x,z,7.5);if(s&&yc>=s.y-3)return s.y;if(Math.abs(z+240)<8&&x>900&&x<1760){const uy=ugY(x);if(yc<=uy+3)return uy}for(const d of decks){let best=null,bd=d.r2;for(const p1 of d.pts){const dd=(p1.x-x)**2+(p1.z-z)**2;if(dd<bd){bd=dd;best=p1}}if(best&&yc>=best.y-3)return best.y}return 0};
function deckClamp(p){const s=skyNear(p.x,p.z,9);if(s&&p.y>s.y-1.5){const dx=p.x-s.x,dz=p.z-s.z,d=Math.hypot(dx,dz);if(d>6){p.x=s.x+dx/d*6;p.z=s.z+dz/d*6;return true}}return false}
ribbon(sk,14,.1);
function wallStrip(pts,off,hh,col){
  const n=pts.length,pos=[],idx=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];T3.set(b.x-a.x,0,b.z-a.z).normalize();const sx=-T3.z*off,sz=T3.x*off,p=pts[i];
    pos.push(p.x+sx,p.y+.1,p.z+sz,p.x+sx,p.y+.1+hh,p.z+sz);if(i<n-1){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}));m.castShadow=true;scene.add(m);return m;
}
wallStrip(sk,7,1.2,0xb9bdc0);wallStrip(sk,-7,1.2,0xb9bdc0);wallStrip(sk,7.05,.12,0xe8684a);wallStrip(sk,-7.05,.12,0xe8684a);
const inRoad=(x,z)=>x>-3150&&x<500&&z>-1950&&z<150&&(Math.abs(x-Math.round(x/120)*120)<17||Math.abs(z-Math.round(z/120)*120)<17);
{const cols=Math.floor(sk.length/2)+1,pil=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.2,1.5,1,8).translate(0,.5,0),M(0x9a9fa4),cols);let n=0;
 for(let i=0;i<sk.length&&n<cols;i+=2){const p=sk[i];if(p.y<3||inRoad(p.x,p.z))continue;o.position.set(p.x,0,p.z);o.scale.set(1,p.y-.2,1);o.rotation.y=0;o.updateMatrix();pil.setMatrixAt(n++,o.matrix)}
 pil.count=n;pil.castShadow=true;scene.add(pil);o.scale.set(1,1,1)}

const viaCurve=new THREE.CatmullRomCurve3([[480,0,-330],[600,6,-330],[760,18,-330],[900,18,-330],[2220,18,-330],[2360,18,-330],[2500,6,-330],[2640,0,-330]].map(q=>new THREE.Vector3(q[0],q[1],q[2])),false,'centripetal');
const via=viaCurve.getSpacedPoints(Math.floor(viaCurve.getLength()/10));
via.forEach(q=>{q.y=Math.max(0,q.y);(skH[skk(q.x,q.z)]=skH[skk(q.x,q.z)]||[]).push(q)});
ribbon(via,14,.1);wallStrip(via,7,1.2,0xb9bdc0);wallStrip(via,-7,1.2,0xb9bdc0);wallStrip(via,7.05,.12,0xe8684a);wallStrip(via,-7.05,.12,0xe8684a);
{const pv=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.2,1.5,1,8).translate(0,.5,0),M(0x9a9fa4),via.length);let n2=0;
 for(let i=0;i<via.length;i+=4){const q=via[i];if(q.y<3)continue;for(const sd2 of[-5.5,5.5]){o.position.set(q.x,0,q.z+sd2);o.scale.set(1,q.y-.2,1);o.rotation.set(0,0,0);o.updateMatrix();pv.setMatrixAt(n2++,o.matrix)}}
 pv.count=n2;pv.castShadow=true;scene.add(pv);o.scale.set(1,1,1)}

const pendingRail=[],pendingSolids=[];
function mkRamp(P){
  const cv=new THREE.CatmullRomCurve3(P.map(q=>new THREE.Vector3(q[0],q[1],q[2])),false,'centripetal'),pts=cv.getSpacedPoints(Math.max(6,Math.floor(cv.getLength()/8)));
  pts.forEach(q=>{q.y=Math.max(0,q.y);(skH[skk(q.x,q.z)]=skH[skk(q.x,q.z)]||[]).push(q)});
  ribbon(pts,10,.1);wallStrip(pts,5,1.1,0xb9bdc0);wallStrip(pts,-5,1.1,0xb9bdc0);
  pts.forEach((q,i)=>{if(i%3===0&&q.y>3){const pl=new THREE.Mesh(new THREE.CylinderGeometry(1,1.3,q.y,8).translate(0,q.y/2,0),M(0x9a9fa4));pl.position.set(q.x,0,q.z);pl.castShadow=true;scene.add(pl)}});
  cv.pp=true;const L=cv.getLength();for(let i=0;i<2;i++){const dir=i%2?1:-1;pendingRail.push({rail:cv,L,dir,off:dir*2.5,t:(i+.3)/2*L,sp:13,x:0,y:0,z:0})}
}
mkRamp([[900,18,-330],[875,14,-318],[850,9,-297],[828,4,-266],[810,0,-244]]);mkRamp([[790,0,-236],[812,4,-262],[835,10,-290],[862,15,-318],[885,18,-330]]);
mkRamp([[2200,18,-330],[2225,14,-318],[2250,9,-297],[2272,4,-266],[2290,0,-244]]);mkRamp([[2310,0,-236],[2288,4,-262],[2265,10,-290],[2238,15,-318],[2215,18,-330]]);

function roundabout(cx,cz){
  const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push(new THREE.Vector3(cx+Math.cos(a)*22,0,cz+Math.sin(a)*22))}
  ribbon(pts,12,.14);
  const isl=new THREE.Mesh(new THREE.CylinderGeometry(13,13,.5,28),M(0x6fae55));isl.position.set(cx,.25,cz);isl.receiveShadow=true;scene.add(isl);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(13,.35,6,28).rotateX(Math.PI/2),M(0xcfc9bc));rim.position.set(cx,.5,cz);scene.add(rim);
  const fo=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,1.2,16),M(0xaab1b8));fo.position.set(cx,1.1,cz);const wt=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,1.3,16),M(0x39b6d8));wt.position.set(cx,1.15,cz);const sp=new THREE.Mesh(new THREE.ConeGeometry(.5,3,8),M(0xdfe8ee));sp.position.set(cx,3.2,cz);scene.add(fo,wt,sp);
  pendingSolids.push({x:cx,z:cz,hw:13,hd:13,h:.8,y0:0});
  const L=2*Math.PI*22,loop={ug:true,L,getPointAt(u,out){const a=u*Math.PI*2;return out.set(cx+Math.cos(a)*22,0,cz+Math.sin(a)*22)},getTangentAt(u,out){const a=u*Math.PI*2;return out.set(-Math.sin(a),0,Math.cos(a))}};
  for(let i=0;i<5;i++)pendingRail.push({rail:loop,L,dir:1,off:0,t:i/5*L,sp:9,x:0,y:0,z:0});
}
roundabout(680,120);roundabout(680,240);
const coastPts=[];for(let x=-3120;x<=480;x+=200)coastPts.push(new THREE.Vector3(x,0,190+40*Math.sin(x/260)));
const coastCurve=new THREE.CatmullRomCurve3(coastPts,false,'centripetal');
ribbon(coastCurve.getSpacedPoints(Math.floor(coastCurve.getLength()/10)),18,.12);
road(91.5,-3120,165.75,0,.05);road(108.5,480,174.25,0,.05);
road(200,580,120,Math.PI/2,.1);road(120,680,180,0,.05);road(330,845,240,Math.PI/2,.1);

// buildings
const bm=new THREE.MeshLambertMaterial({color:0xffffff});
bm.onBeforeCompile=s=>{s.uniforms.uNight=nightU;
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aSeed;varying float vSeed;varying vec3 vWP;varying float vWall;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 wp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nwp=instanceMatrix*wp;\n#endif\nvWP=(modelMatrix*wp).xyz;vWall=1.0-abs(normal.y);vSeed=aSeed;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uNight;varying float vSeed;varying vec3 vWP;varying float vWall;')
   .replace('#include <color_fragment>','#include <color_fragment>\nfloat sd=vSeed;float cw=sd<.33?3.2:(sd<.66?9.0:2.0);float ch=sd<.66?3.6:7.0;vec2 cl=vec2((vWP.x+vWP.z)/cw,vWP.y/ch);vec2 fr=fract(cl);float win=sd<.33?step(.18,fr.x)*step(fr.x,.82)*step(.2,fr.y)*step(fr.y,.8):(sd<.66?step(.04,fr.x)*step(fr.x,.96)*step(.3,fr.y)*step(fr.y,.7):step(.3,fr.x)*step(fr.x,.7)*step(.08,fr.y)*step(fr.y,.92));win*=step(1.5,vWP.y)*vWall;float lit=step(mix(.6,.3,uNight),fract(sin(dot(floor(cl),vec2(12.9,78.2)))*43758.5));float brick=sd<.25?step(.88,fract(vWP.y/.65))*.16:0.;diffuseColor.rgb*=1.-brick*vWall;diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.12,.2,.28),vec3(.6,.78,.9),lit),win*.9);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(1.,.8,.45)*win*lit*uNight*.9;');
};
const NB=9000,seeds=new Float32Array(NB);
const bgeo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);bgeo.setAttribute('aSeed',new THREE.InstancedBufferAttribute(seeds,1));
const BM=new THREE.InstancedMesh(bgeo,bm,NB);BM.castShadow=BM.receiveShadow=true;
const RM=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4).translate(0,.5,0),M(0xffffff),3600);RM.castShadow=true;
const DM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),M(0xffffff),600);
const pal=[0xe8dcc8,0xd9c3a5,0xc9d3d8,0xb7c4cf,0xe3b9a0,0xf0e6d2,0xd6cfc4,0xb5533c,0xd9b98a,0xa8c5b0,0xe9d36f,0xc9a0a0],glass=[0x8fa8b8,0x7d97a8,0x9fb6c4,0x6f8797],roofC=[0xa34a32,0x7a3b2a,0x4b5563,0x3f5b6b,0x6b4f3a,0x8c3b3b];
let bn=0,rn=0,dn=0;const bmap={},trees=[],solids=[];pendingSolids.forEach(q=>solids.push(q));
const put=(x,y,z,w,h,d,c,sd)=>{o.position.set(x,y,z);o.scale.set(w,h,d);o.updateMatrix();BM.setMatrixAt(bn,o.matrix);BM.setColorAt(bn,new THREE.Color(c));seeds[bn]=sd;bn++};
const roof=(x,y,z,w,h,d,c)=>{o.position.set(x,y,z);o.scale.set(w/1.3,h,d/1.3);o.updateMatrix();RM.setMatrixAt(rn,o.matrix);RM.setColorAt(rn,new THREE.Color(c));rn++};
const dome=(x,y,z,r,c)=>{o.position.set(x,y,z);o.scale.set(r,r,r);o.updateMatrix();DM.setMatrixAt(dn,o.matrix);DM.setColorAt(dn,new THREE.Color(c));dn++};
const neonMat=new THREE.MeshBasicMaterial({color:0x262626}),NEON=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1.4,1),neonMat,1200),cs0=new THREE.Color();let nn=0;
const neon=(x,y,z,w,d)=>{if(nn>=1200)return;o.position.set(x,y,z);o.scale.set(w,1,d);o.rotation.set(0,0,0);o.updateMatrix();NEON.setMatrixAt(nn,o.matrix);NEON.setColorAt(nn,cs0.set([0xff3b6b,0x39e6ff,0xffd23b,0x7dff5a,0xb06bff][Math.floor(R()*5)]));nn++};
function genCity(bi0,bi1,bj0,bj1,cx,cz,norm,town){
  for(let bi=bi0;bi<bi1;bi++)for(let bj=bj0;bj<bj1;bj++){
    if(bmap[K(bi,bj)])continue;const bx=bi*120+60,bz=bj*120+60,d=Math.hypot(bx-cx,bz-cz)/norm,L=bmap[K(bi,bj)]=[];
    if(R()<(town?.06:.1)){flat(90,90,bx,.2,bz,0x7fb35a);for(let t=0;t<20;t++)trees.push([bx+(R()-.5)*80,bz+(R()-.5)*80,1.4+R()*.8]);continue}
    for(let a=0;a<2;a++)for(let b=0;b<2;b++){
      const x=bx+(a?26:-26)+(R()-.5)*12,z=bz+(b?26:-26)+(R()-.5)*12;
      if(skyNear(x,z,34)||R()<.2){for(let t=0;t<3;t++)trees.push([x+(R()-.5)*16,z+(R()-.5)*16,1.4+R()*.8]);continue}
      const w=14+R()*12,dp=14+R()*12;
      let h=town?5+R()*9:8+R()*16+Math.pow(Math.max(0,1-d),1.8)*R()*80;
      if(!town&&R()<.14&&d<.6)h+=40+R()*100;
      const sd=R(),tall=h>40,c=tall?glass[Math.floor(R()*4)]:pal[Math.floor(R()*pal.length)];
      const g0={b0:bn,r0:rn,d0:dn};put(x,0,z,w,h,dp,c,sd);let ht=h;
      if(tall){const c2=h*.14;put(x,h,z,w*.6,c2,dp*.6,c,sd);ht+=c2;if(R()<.5){const rh2=h*.1;roof(x,ht,z,w*.45,rh2,dp*.45,0xb8c4cc);ht+=rh2}else if(h>110){const s2=h*.12;put(x,ht,z,.6,s2,.6,0xcfd4d8,sd);ht+=s2}if(R()<.45)neon(x,h*(.5+R()*.35),z,w*1.04,dp*1.04)}
      else if(h<16||town){const rh=Math.max(2.5,w*.28);roof(x,h,z,w*1.05,rh,dp*1.05,roofC[Math.floor(R()*roofC.length)]);ht+=rh}
      else if(R()<.25){const r=Math.min(w,dp)*.42;dome(x,h,z,r,0x9bbac9);ht+=r}
      if(h<30&&R()<.3){
        const w2=w*.55,d2=dp*.55,x2=x+(R()<.5?1:-1)*w*.4,z2=z+(R()<.5?1:-1)*dp*.4,h2=h*.6;
        put(x2,0,z2,w2,h2,d2,c,sd);let t2=h2;if(h2<16){roof(x2,h2,z2,w2*1.05,3,d2*1.05,roofC[Math.floor(R()*roofC.length)]);t2+=3}
        L.push({x:x2,z:z2,hw:w2/2,hd:d2/2,h:t2,y0:0,g:g0});
      }
      g0.b1=bn;g0.r1=rn;g0.d1=dn;L.push({x,z,hw:w/2,hd:dp/2,h:ht,y0:0,g:g0});
    }
  }
}
genCity(-26,4,-16,1,-1300,-900,1900,false);
genCity(22,27,-4,1,2940,-180,420,true);
BM.count=bn;RM.count=rn;DM.count=dn;NEON.count=nn;
bgeo.attributes.aSeed.needsUpdate=true;
scene.add(BM,RM,DM,NEON);

let mono=null;
const floodMat=new THREE.MeshBasicMaterial({color:0x4d4d3a});
const blk=(x,y0,z,w,h,d,c,hit,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||M(c));m.position.set(x,y0+h/2,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(hit)solids.push({x,z,hw:w/2,hd:d/2,h:y0+h,y0});return m};
{
  const z0=new THREE.Matrix4().makeScale(0,0,0);
  [[-9,-8],[-11,-8],[-10,-7],[-12,-7]].forEach(([bi,bj])=>{
    const L=bmap[K(bi,bj)];if(L){for(const q of L){if(q.g){const g=q.g;for(let i=g.b0;i<g.b1;i++)BM.setMatrixAt(i,z0);for(let i=g.r0;i<g.r1;i++)RM.setMatrixAt(i,z0);for(let i=g.d0;i<g.d1;i++)DM.setMatrixAt(i,z0)}}L.length=0}
    const x0=bi*120,z1=bj*120;for(let i=trees.length-1;i>=0;i--){const t=trees[i];if(t[0]>x0+12&&t[0]<x0+108&&t[1]>z1+12&&t[1]<z1+108)trees.splice(i,1)}
  });
  BM.instanceMatrix.needsUpdate=RM.instanceMatrix.needsUpdate=DM.instanceMatrix.needsUpdate=true;
  {const x=-1260,z=-900;
   blk(x,0,z-18,60,28,26,0xf4f4f4,1);blk(x-30,0,z+14,26,16,38,0xe3e9ee,1);blk(x,19.8,z-4.6,10,2.4,.4,0xd8263a);blk(x,16,z-4.6,2.4,10,.4,0xd8263a);
   const hp2=new THREE.Mesh(new THREE.CylinderGeometry(6,6,.4,20),M(0x3a3f45));hp2.position.set(x,28.2,z-18);scene.add(hp2);
   blk(x-2,28.4,z-18,.8,.12,6,0xffffff);blk(x+2,28.4,z-18,.8,.12,6,0xffffff);blk(x,28.4,z-18,4,.12,.8,0xffffff);
   blk(x+12,5,z+30,26,.6,12,0xcfd4d8);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>blk(x+12+q[0]*12,0,z+30+q[1]*5,.5,5,.5,0xcfd4d8))}
  {const x=-1020,z=-900,dk=new THREE.MeshLambertMaterial({color:0x8a8f96,side:THREE.DoubleSide});
   const bowl=new THREE.Mesh(new THREE.CylinderGeometry(46,40,12,28,1,true),dk);bowl.position.set(x,6,z);bowl.castShadow=bowl.receiveShadow=true;scene.add(bowl);
   const tier=new THREE.Mesh(new THREE.CylinderGeometry(40,31,8,28,1,true),new THREE.MeshLambertMaterial({color:0x4b6a9a,side:THREE.DoubleSide}));tier.position.set(x,4,z);scene.add(tier);
   const pitch=new THREE.Mesh(new THREE.CircleGeometry(30,32).rotateX(-Math.PI/2),M(0x3f8f45));pitch.position.set(x,.35,z);pitch.receiveShadow=true;scene.add(pitch);
   blk(x,.36,z,2,.05,56,0xffffff);blk(x,.36,z,56,.05,2,0xffffff);
   for(const sg of[-1,1]){blk(x+sg*29,0,z-3,.2,2.6,.2,0xffffff);blk(x+sg*29,0,z+3,.2,2.6,.2,0xffffff);blk(x+sg*29,2.5,z,.2,.2,6.2,0xffffff)}
   [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(s2=>{const px=x+s2[0]*44,pz=z+s2[1]*44;blk(px,0,pz,1.4,32,1.4,0x777c82,1);blk(px,32,pz,7,3,1.2,0,0,floodMat)});
   for(let k=0;k<16;k++){const a=k/16*Math.PI*2;if(Math.abs(Math.sin(a))>.95)continue;solids.push({x:x+Math.cos(a)*43,z:z+Math.sin(a)*43,hw:9,hd:9,h:12,y0:0})}}
  {const x=-1140,z=-780;
   blk(x,0,z-8,88,22,56,0xd7d2c8,1);
   const gl=new THREE.Mesh(new THREE.BoxGeometry(60,15,2),new THREE.MeshLambertMaterial({color:0x7fb8d8,transparent:true,opacity:.55}));gl.position.set(x,7.5,z+21);scene.add(gl);
   const sg=new THREE.Mesh(new THREE.BoxGeometry(34,4,1.2),new THREE.MeshBasicMaterial({color:0xff3b30}));sg.position.set(x,24,z+20.5);scene.add(sg);
   flat(88,20,x,.12,z+38,0x55595d);for(let i=0;i<10;i++)blk(x-40+i*8.8,.12,z+38,.2,.02,14,0xffffff)}
  {const x=-1380,z=-780,c=0xc98a6a;
   blk(x,0,z-30,70,16,18,c,1);blk(x-26,0,z+4,18,14,40,c,1);blk(x+26,0,z+4,18,14,40,c,1);blk(x,0,z-30,8,34,8,0xd9a37f,1);
   const ck=new THREE.Mesh(new THREE.CircleGeometry(3,20),M(0xffffff));ck.position.set(x,28,z-25.6);scene.add(ck);flat(30,34,x,.2,z+8,0x6fae55);
   const f1=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.8,16),M(0xaab1b8));f1.position.set(x,.4,z+8);const f2=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,.9,16),M(0x39b6d8));f2.position.set(x,.45,z+8);scene.add(f1,f2)}
  {const y0=9,xa=-3000,xb=470,zz=275,beam=new THREE.Mesh(new THREE.BoxGeometry(xb-xa,.9,1.8),M(0x9aa0a6));beam.position.set((xa+xb)/2,y0,zz);beam.castShadow=true;scene.add(beam);
   const np=Math.floor((xb-xa)/30),pm2=new THREE.InstancedMesh(new THREE.CylinderGeometry(.7,.9,1,8).translate(0,.5,0),M(0x9aa0a6),np);let k4=0;
   for(let i=0;i<np;i++){const x=xa+15+i*30;if(Math.abs(x+480)<22)continue;o.position.set(x,0,zz);o.scale.set(1,y0-.5,1);o.rotation.set(0,0,0);o.updateMatrix();pm2.setMatrixAt(k4++,o.matrix)}
   pm2.count=k4;pm2.castShadow=true;scene.add(pm2);o.scale.set(1,1,1);
   [-2900,-1300,350].forEach(x=>{blk(x,y0+.45,zz,40,.5,7,0x7b8289);blk(x,y0+4.6,zz,40,.4,8,0x3a5a7a)});
   const g=new THREE.Group();for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(11,3,3),M(i%2?0xe8684a:0xf2f2f2));c.position.set(-i*12,y0+2.2,0);const wn=new THREE.Mesh(new THREE.BoxGeometry(9.5,.9,3.1),M(0x2a3a4a));wn.position.set(-i*12,y0+2.5,0);c.castShadow=true;g.add(c,wn)}
   g.position.set(xa+60,0,zz);scene.add(g);mono={g,x:xa+60,dir:1,wait:0,xa:xa+60,xb:xb-60,stops:[-2900,-1300,350]}}
}

{const cx=-1020,cz=-720;
 const w=(z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(96,9,2),M(0x8d9399));m.position.set(cx,4.5,z);m.castShadow=m.receiveShadow=true;scene.add(m);solids.push({x:cx,z,hw:48,hd:1,h:9,y0:0})};
 w(cz-13.5);w(cz+13.5);
 const rf=new THREE.Mesh(new THREE.BoxGeometry(100,3,32),M(0x7b8289));rf.position.set(cx,10.5,cz);rf.castShadow=rf.receiveShadow=true;scene.add(rf);
 solids.push({x:cx,z:cz,hw:50,hd:16,h:12,y0:9});
}

const ugY=x=>x<900?0:x<960?-5.5*(x-900)/60:x<1700?-5.5:x<1760?-5.5*(1760-x)/60:0;
{const pts=[];for(let x=900;x<=1760;x+=10)pts.push(new THREE.Vector3(x,ugY(x),-240));ribbon(pts,14,.1);
 const cm=new THREE.MeshLambertMaterial({color:0x5c6166,side:THREE.DoubleSide});
 const ceil=new THREE.Mesh(new THREE.PlaneGeometry(740,20).rotateX(-Math.PI/2),cm);ceil.position.set(1330,-1,-240);scene.add(ceil);
 [-250,-230].forEach(z=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(740,5.5),cm);w.position.set(1330,-3.75,z);scene.add(w);solids.push({x:1330,z,hw:370,hd:1,h:-.5,y0:-6});
  [930,1730].forEach(x=>{const rw2=new THREE.Mesh(new THREE.BoxGeometry(60,5.5,1),M(0x8d9399));rw2.position.set(x,-2.75,z);scene.add(rw2);solids.push({x,z,hw:30,hd:.5,h:0,y0:-6})})});
 const ll=new THREE.InstancedMesh(new THREE.BoxGeometry(4,.15,1),new THREE.MeshBasicMaterial({color:0xfff2c0}),80);let n2=0;
 for(let x=980;x<=1680;x+=20)for(const z of[-244,-236]){o.position.set(x,-1.1,z);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();ll.setMatrixAt(n2++,o.matrix)}
 ll.count=n2;scene.add(ll)}

// traffic
const NC=900,NT=110,cars=[],cc=[0xe8684a,0xf2c14e,0x3b7ea1,0xffffff,0x2d3a40,0x7bb36a,0xc94c4c,0xffd100,0xffd100,0x8a8f94,0x1f4f8a];
const body=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,.8,4.2),M(0xffffff),NC);
const cab=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,.7,2.2),M(0x222c33),NC);
const wg=new THREE.CylinderGeometry(.38,.38,.3,10).rotateZ(Math.PI/2),wmat=M(0x111111);
const wc=new THREE.InstancedMesh(wg,wmat,NC*4),wt=new THREE.InstancedMesh(wg,wmat,NT*6);
body.castShadow=true;
function addCars(n,vi0,vi1,hj0,hj1,vz0,vz1,hx0,hx1){
  for(let i=0;i<n;i++){
    const v=R()<.5,dir=R()<.5?1:-1,line=v?(vi0+Math.floor(R()*(vi1-vi0+1)))*120:(hj0+Math.floor(R()*(hj1-hj0+1)))*120,lo=v?vz0:hx0,hi=v?vz1:hx1;
    cars.push({v,dir,line,lane:line+dir*4,t:lo+R()*(hi-lo),sp:10+R()*12,lo,hi,x:0,y:0,z:0});
  }
}
addCars(400,-26,4,-16,1,-1920,120,-3120,480);
addCars(60,22,27,-4,1,-480,120,2640,3240);
const nGrid=cars.length;
for(let i=0;i<36;i++){const L=skyCurve.getLength(),dir=i%2?1:-1;cars.push({rail:skyCurve,L,dir,off:dir*3.5,t:R()*L,sp:12+R()*10,x:0,y:0,z:0})}
for(let i=0;i<24;i++){const L=coastCurve.getLength(),dir=i%2?1:-1;cars.push({rail:coastCurve,L,dir,off:dir*4,t:R()*L,sp:10+R()*10,x:0,y:0,z:0})}
skyCurve.pp=true;coastCurve.pp=true;viaCurve.pp=true;
for(let i=0;i<30;i++){const L=viaCurve.getLength(),dir=i%2?1:-1;cars.push({rail:viaCurve,L,dir,off:dir*4,t:R()*L,sp:14+R()*10,x:0,y:0,z:0})}
const linkCurve={ug:true,pp:true,getPointAt(u,out){const x=480+u*2760;return out.set(x,ugY(x),-240)},getTangentAt(u,out){const x=480+u*2760;return out.set(1,ugY(x+1)-ugY(x),0).normalize()}};
for(let i=0;i<30;i++){const dir=i%2?1:-1;cars.push({rail:linkCurve,L:2760,dir,off:dir*4,t:R()*2760,sp:14+R()*10,x:0,y:0,z:0})}
pendingRail.forEach(c=>cars.push(c));
body.count=cab.count=cars.length;wc.count=cars.length*4;
for(let i=0;i<cars.length;i++)body.setColorAt(i,new THREE.Color(cc[Math.floor(R()*cc.length)]));
for(let i=0;i<14;i++)body.setColorAt(i,new THREE.Color(0x16202b));
const PLB=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.14,.3),new THREE.MeshBasicMaterial({color:0xffffff}),28);PLB.count=28;scene.add(PLB);
const trucks=[],tb=new THREE.InstancedMesh(new THREE.BoxGeometry(3.4,3.6,12),M(0xffffff),NT),tc=new THREE.InstancedMesh(new THREE.BoxGeometry(3.2,2.8,3.6),M(0xffffff),NT),tcol=[0xd9d9d9,0x3b7ea1,0xe8684a,0xf2c14e,0xffffff,0x5c8a5a];
tb.castShadow=tc.castShadow=true;
for(let i=0;i<NT;i++){
  const v=R()<.5,dir=R()<.5?1:-1,line=v?(Math.floor(R()*31)-26)*120:(Math.floor(R()*18)-16)*120,lo=v?-1920:-3120,hi=v?120:480;
  trucks.push({v,dir,line,lane:line+dir*9,t:lo+R()*(hi-lo),sp:6+R()*6,lo,hi,x:0,z:0});
  tb.setColorAt(i,new THREE.Color(i<35?[0xd9a000,0x2f7fbf,0xc94c4c][i%3]:tcol[Math.floor(R()*tcol.length)]));tc.setColorAt(i,new THREE.Color(i<35?[0xd9a000,0x2f7fbf,0xc94c4c][i%3]:cc[Math.floor(R()*cc.length)]));
}
scene.add(body,cab,wc,tb,tc,wt);
const lanes={};
[...cars.filter(c=>!c.rail).map(c=>[c,0]),...trucks.map(c=>[c,1])].forEach(([c,tr])=>{c.tr=tr;c.lk=(c.v?'v':'h')+c.lane;(lanes[c.lk]=lanes[c.lk]||[]).push(c)});
const SI=[];for(let i=-26;i<=4;i++)for(let j=-16;j<=1;j++)SI.push([i*120,j*120]);for(let i=22;i<=27;i++)for(let j=-4;j<=1;j++)SI.push([i*120,j*120]);
const pol=new THREE.InstancedMesh(new THREE.CylinderGeometry(.15,.15,6,6).translate(0,3,0),M(0x333333),SI.length*2),hed=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,1.3,.7).translate(0,6.4,0),new THREE.MeshBasicMaterial({color:0xffffff}),SI.length*2);
SI.forEach((q,i)=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(q[0]+14,0,q[1]+14);o.updateMatrix();pol.setMatrixAt(i*2,o.matrix);hed.setMatrixAt(i*2,o.matrix);o.position.set(q[0]-14,0,q[1]-14);o.updateMatrix();pol.setMatrixAt(i*2+1,o.matrix);hed.setMatrixAt(i*2+1,o.matrix)});
scene.add(pol,hed);
let sigS=-1;const SCOL=[0x30d060,0xffd020,0xff3030],cs=new THREE.Color();
function setSignals(s){sigS=s;const cv=s===0?0:s===1?1:2,ch=s===2?0:s===3?1:2;for(let i=0;i<SI.length;i++){hed.setColorAt(i*2,cs.set(SCOL[cv]));hed.setColorAt(i*2+1,cs.set(SCOL[ch]))}hed.instanceColor.needsUpdate=true}
setSignals(0);
function flip(c){const L=lanes[c.lk];if(L){const i=L.indexOf(c);if(i>=0)L.splice(i,1)}c.dir=-c.dir;c.lane=c.line+c.dir*(c.tr?9:4);c.lk=(c.v?'v':'h')+c.lane;(lanes[c.lk]=lanes[c.lk]||[]).push(c)}

// sidewalks, bus stops, benches, trees
let SWM=null;const SWI={};
{
 const nS=segL.length,SWm=new THREE.InstancedMesh(new THREE.BoxGeometry(3.5,.3,96),M(0xc9c4b8),nS*2);SWM=SWm;
 segL.forEach(([v,l,k2],i)=>{for(let sd2=0;sd2<2;sd2++){const off=sd2?-13.75:13.75;o.rotation.set(0,v?0:Math.PI/2,0);o.scale.set(1,1,1);
   if(v)o.position.set(l*120+off,.15,k2*120+60);else o.position.set(k2*120+60,.15,l*120+off);o.updateMatrix();SWm.setMatrixAt(i*2+sd2,o.matrix)}SWI[(v?'V':'H')+l+':'+k2]=i*2});
 SWm.receiveShadow=true;scene.add(SWm);
 const cwc=document.createElement('canvas');cwc.width=64;cwc.height=16;{const x=cwc.getContext('2d');x.fillStyle='#f2f2f2';for(let xx=2;xx<64;xx+=8)x.fillRect(xx,0,4,16)}
 const cwM=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cwc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-30});
 const CW=new THREE.InstancedMesh(new THREE.PlaneGeometry(22,4).rotateX(-Math.PI/2),cwM,SI.length*4);let ci=0;
 SI.forEach(q=>{for(const t of[[0,-16,0],[0,16,0],[-16,0,1],[16,0,1]]){o.scale.set(1,1,1);o.rotation.set(0,t[2]?Math.PI/2:0,0);o.position.set(q[0]+t[0],.22,q[1]+t[1]);o.updateMatrix();CW.setMatrixAt(ci++,o.matrix)}});
 scene.add(CW);
 const nT=nS*3,stT=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.24,2,5).translate(0,1,0),M(0x7a5638),nT),stC=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,4,6).translate(0,4,0),M(0xffffff),nT),stB=new THREE.InstancedMesh(new THREE.SphereGeometry(1.9,8,6).translate(0,4.2,0),M(0xffffff),nT);
 let ta=0,tb=0,tn=0;const greens=[0x3f7d4a,0x4f8f4a,0x6a9a45,0x2f6b3f,0x7aa84a,0xb0883a];
 segL.forEach(([v,l,k2])=>{for(const t of[30,60,90]){const a=k2*120+t,x=v?l*120-14.5:a,z=v?a:l*120-14.5,sz=1+R()*.5;o.rotation.set(0,R()*6,0);o.scale.set(sz,sz,sz);o.position.set(x,.3,z);o.updateMatrix();stT.setMatrixAt(tn++,o.matrix);
   const col=new THREE.Color(greens[Math.floor(R()*greens.length)]);if(R()<.5){stC.setMatrixAt(ta,o.matrix);stC.setColorAt(ta++,col)}else{stB.setMatrixAt(tb,o.matrix);stB.setColorAt(tb++,col)}}});
 stT.count=tn;stC.count=ta;stB.count=tb;stT.castShadow=stC.castShadow=stB.castShadow=true;scene.add(stT,stC,stB);
 const fb=(w,h,d)=>new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),mkI=(geo,col,n)=>new THREE.InstancedMesh(geo,M(col),n);
 const shR=mkI(fb(4,.2,1.8),0x3a5a7a,600),shB=mkI(fb(4,2.4,.1),0x9fd0e6,600),bnc=mkI(fb(1.8,.5,.5),0x7a5638,900),bin=mkI(new THREE.CylinderGeometry(.35,.3,.9,8).translate(0,.45,0),0x2f6b3f,900),bbP=mkI(fb(.4,9,.4),0x555a60,200),bbS=new THREE.InstancedMesh(fb(10,5,.4),new THREE.MeshBasicMaterial({color:0xffffff}),200);
 let n1=0,n2=0,n3=0,n4=0;const vivid=[0xff3b6b,0x39e6ff,0xffd23b,0x7dff5a,0xb06bff,0xff8a2b];
 segL.forEach(([v,l,k2])=>{
   const ln=l*120,P=(mesh,i,t,off,y,ry)=>{o.rotation.set(0,ry,0);o.scale.set(1,1,1);o.position.set(v?ln+off:k2*120+t,y,v?k2*120+t:ln+off);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)},ry0=v?Math.PI/2:0;
   if(R()<.3&&n1<600){P(shR,n1,60,15.3,2.6,ry0);P(shB,n1,60,15.9,.3,ry0);n1++}
   if(R()<.35&&n2<900){P(bnc,n2,45,15,.3,ry0);n2++}
   if(R()<.45&&n3<900){P(bin,n3,105,14.5,.3,0);n3++}
   if(R()<.08&&n4<200){P(bbP,n4,75,17.5,0,0);P(bbS,n4,75,17.5,6.5,ry0);bbS.setColorAt(n4,cs.set(vivid[Math.floor(R()*vivid.length)]));n4++}
 });
 shR.count=shB.count=n1;bnc.count=n2;bin.count=n3;bbP.count=bbS.count=n4;if(bbS.instanceColor)bbS.instanceColor.needsUpdate=true;
 scene.add(shR,shB,bnc,bin,bbP,bbS);
}

// port and airport
road(178,-480,241,0,.05);
const ships=[];
{
 const qd=new THREE.Mesh(new THREE.BoxGeometry(420,1.2,70),M(0x6e7378));qd.position.set(-500,-.3,360);qd.receiveShadow=true;scene.add(qd);
 const cn=new THREE.InstancedMesh(new THREE.BoxGeometry(6,2.6,2.4).translate(0,1.3,0),M(0xffffff),1500);let k3=0;const cols=[0xc94c4c,0x3b7ea1,0xf2c14e,0x7bb36a,0xe8684a,0xdddddd,0x2d3a40];
 for(const[x0,x1] of[[-690,-530],[-445,-310]])for(let x=x0;x<x1;x+=7)for(let z=337;z<385;z+=3.2){const hg=1+Math.floor(R()*3);for(let l=0;l<hg&&k3<1500;l++){o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(x,.3+l*2.6,z);o.updateMatrix();cn.setMatrixAt(k3,o.matrix);cn.setColorAt(k3++,cs.set(cols[Math.floor(R()*cols.length)]))}}
 cn.count=k3;cn.castShadow=true;scene.add(cn);solids.push({x:-610,z:361,hw:82,hd:26,h:8,y0:0},{x:-377,z:361,hw:70,hd:26,h:8,y0:0});
 const cm2=M(0xe8684a),cd=M(0x555a60);
 [-650,-570,-400].forEach(x=>{const g=new THREE.Group();
   [[-8,-6],[8,-6],[-8,6],[8,6]].forEach(q=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.9,18,.9),cm2);l.position.set(q[0],9,q[1]);g.add(l)});
   const b=new THREE.Mesh(new THREE.BoxGeometry(20,1.6,14),cm2);b.position.y=18;const arm=new THREE.Mesh(new THREE.BoxGeometry(2,1.4,46),cd);arm.position.set(0,19.5,14);const cb=new THREE.Mesh(new THREE.BoxGeometry(3,3,3),cd);cb.position.set(0,16.5,6);
   g.add(b,arm,cb);g.position.set(x,0,388);g.traverse(m=>{if(m.isMesh)m.castShadow=true});scene.add(g);solids.push({x,z:388,hw:9,hd:7,h:19,y0:0})});
 const mkShip=(x,z,len,col,moored)=>{
   const g=new THREE.Group(),hm2=M(0x2d3a40),h=new THREE.Mesh(new THREE.BoxGeometry(len,9,22),hm2);h.position.y=3;
   const bow=new THREE.Mesh(new THREE.ConeGeometry(11,22,4).rotateZ(-Math.PI/2),hm2);bow.position.set(len/2+10,3,0);bow.scale.z=1.4;bow.rotation.y=Math.PI/4;
   const br=new THREE.Mesh(new THREE.BoxGeometry(14,11,18),M(0xf2f2f2));br.position.set(-len/2+16,12.5,0);g.add(h,bow,br);
   for(let i=0;i<14;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(6,2.6,2.4),M(cols[Math.floor(R()*cols.length)]));c.position.set(-len/2+34+(i%7)*(len-60)/7,8.8+Math.floor(i/7)*2.6,(i%2?5:-5));g.add(c)}
   g.traverse(m=>{if(m.isMesh)m.castShadow=true});g.position.set(x,-.2,z);scene.add(g);
   if(moored)solids.push({x,z,hw:len/2+10,hd:11,h:12,y0:0});else ships.push({g,sp:(R()<.5?-1:1)*(4+R()*3),ph:R()*6,len});
 };
 mkShip(-600,420,150,0,1);mkShip(-400,425,130,0,1);
 [700,860,1010,1160].forEach((z,i)=>{const sh=mkShip(Math.floor(R()*6000)-3000,z,70+R()*60,0,0)});
 const lt=new THREE.Group();[[2.6,3.4,26,0xffffff,13],[3,3,5,0xd8463a,10]].forEach(a=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(a[0],a[1],a[2],12),M(a[3]));m.position.y=a[4];lt.add(m)});
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(2,10,8),new THREE.MeshBasicMaterial({color:0xfff2a0}));lamp.position.y=28;const cap=new THREE.Mesh(new THREE.ConeGeometry(3.2,3,12),M(0xd8463a));cap.position.y=31.5;lt.add(lamp,cap);lt.position.set(440,0,292);scene.add(lt);solids.push({x:440,z:292,hw:4,hd:4,h:33,y0:0});
}

const AX=1040;
const rwc=document.createElement('canvas');rwc.width=rwc.height=64;
const rw=rwc.getContext('2d');rw.fillStyle='#34383d';rw.fillRect(0,0,64,64);rw.fillStyle='#f2f2f2';rw.fillRect(0,29,32,6);rw.fillRect(0,3,64,2);rw.fillRect(0,59,64,2);
const rwt=new THREE.CanvasTexture(rwc);rwt.wrapS=rwt.wrapT=THREE.RepeatWrapping;rwt.repeat.set(50,1);
const rwm=new THREE.Mesh(new THREE.PlaneGeometry(2000,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:rwt,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-12}));rwm.position.set(1560,.08,0);rwm.receiveShadow=true;scene.add(rwm);
flat(1840,14,1480,.07,60,0x55595d);[700,1040,1380,1900,2400].forEach(x=>flat(14,33,x,.07,36.5,0x55595d));
flat(300,100,880,.08,105,0x6e7176);flat(240,40,880,.07,205,0x5d6065);
const lights=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.5,.7),new THREE.MeshBasicMaterial({color:0xfff2b0}),270);
k=0;for(let x=580;x<=2540;x+=15)for(const z of[-21,21]){o.position.set(x,.3,z);o.scale.set(1,1,1);o.updateMatrix();lights.setMatrixAt(k++,o.matrix)}
lights.count=k;scene.add(lights);
function box(w,h,d,x,z,c,hit){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,h/2,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(hit)solids.push({x,z,hw:w/2,hd:d/2,h,y0:0});return m}
box(220,14,24,880,168,0x9fc3d8,1);box(232,1.6,32,880,168,0x5d6772,0).position.y=14.8;
box(10,45,10,1030,168,0xdfe4e8,1);{const cb=new THREE.Mesh(new THREE.CylinderGeometry(8,6,6,10),M(0x7aa6bd));cb.position.set(1030,48,168);scene.add(cb)}
[1150,1230,1310].forEach(x=>{box(50,14,40,x,140,0xb8bfc6,1);box(52,1,42,x,140,0x6f7780,0).position.y=14.5});

// aircraft models
const jm=(g,geo,m,x,y,z)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=true;g.add(q);return q};
function fighter(col){
  const g=new THREE.Group(),gm=M(col),dm=M(0x3a444c);
  jm(g,new THREE.CylinderGeometry(.7,.55,12,10).rotateX(Math.PI/2),gm,0,0,0);
  jm(g,new THREE.ConeGeometry(.7,4.5,10).rotateX(-Math.PI/2),gm,0,0,-8.2);
  jm(g,new THREE.SphereGeometry(.65,12,8).scale(1,.75,2.2),new THREE.MeshPhongMaterial({color:0x1c3a5a,shininess:100}),0,.6,-3);
  const sh=new THREE.Shape();sh.moveTo(0,3);sh.lineTo(7,-3);sh.lineTo(7,-4.5);sh.lineTo(0,-4.5);sh.closePath();
  const wm2=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}),wgm=new THREE.ExtrudeGeometry(sh,{depth:.25,bevelEnabled:false}).rotateX(-Math.PI/2);
  jm(g,wgm,wm2,0,-.1,0);jm(g,wgm,wm2,0,-.1,0).scale.x=-1;
  [-1,1].forEach(s=>{jm(g,new THREE.BoxGeometry(.2,2.6,2.6),gm,s,1.5,5).rotation.z=-s*.25;jm(g,new THREE.BoxGeometry(3.2,.15,2),gm,s*2,0,5.2)});
  jm(g,new THREE.CylinderGeometry(.5,.4,1.2,10).rotateX(Math.PI/2),dm,0,0,6.4);
  const wh=new THREE.CylinderGeometry(.32,.32,.25,8).rotateZ(Math.PI/2);
  jm(g,wh,dm,0,-1.9,-4);jm(g,wh,dm,-1.3,-1.9,1.5);jm(g,wh,dm,1.3,-1.9,1.5);
  const fl=jm(g,new THREE.ConeGeometry(.4,3,8).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.85}),0,0,8.2);fl.castShadow=false;
  g.userData.flame=fl;return g;
}
function airliner(bc,ac){
  const g=new THREE.Group(),w=M(bc);
  jm(g,new THREE.CylinderGeometry(2.3,2.3,36,12).rotateX(Math.PI/2),w,0,3,0);
  jm(g,new THREE.SphereGeometry(2.3,12,8).scale(1,1,1.4),w,0,3,-18);
  jm(g,new THREE.ConeGeometry(2.3,9,12).rotateX(Math.PI/2),w,0,3,22);
  jm(g,new THREE.BoxGeometry(38,.5,7),M(0xdfe3e6),0,2,2);
  jm(g,new THREE.BoxGeometry(.5,8,6),M(ac),0,8,19);jm(g,new THREE.BoxGeometry(13,.4,3.5),w,0,3.5,20);
  [-8,8].forEach(x=>jm(g,new THREE.CylinderGeometry(1.2,1.2,4,10).rotateX(Math.PI/2),M(0x8a939a),x,1.2,-1));
  const wh=new THREE.CylinderGeometry(.9,.9,.7,10).rotateZ(Math.PI/2),dk=M(0x1a1a1a);
  jm(g,wh,dk,0,.9,-13);[-3,3].forEach(x=>{jm(g,wh,dk,x,.9,3);jm(g,wh,dk,x,.9,5.5)});
  return g;
}
const TY=[
 {n:'Fighter',top:220,tn:.9,vr:65,sc:.6,gy:1.25,r:[6,7,3],air:0,mk:()=>fighter(0x9aa5ad)},
 {n:'Stealth',top:260,tn:1,vr:70,sc:.7,gy:1.45,r:[7,8,3],air:0,mk:()=>fighter(0x23282d)},
 {n:'Airliner',top:150,tn:.45,vr:55,sc:1,gy:1,r:[19,20,9],air:1,mk:()=>airliner(0xf4f4f4,0x3b7ea1)},
 {n:'Private jet',top:190,tn:.7,vr:58,sc:.5,gy:.6,r:[10,10,5],air:1,mk:()=>airliner(0xffffff,0xe8684a)},
 {n:'Trainer',top:200,tn:.85,vr:62,sc:.6,gy:1.25,r:[6,7,3],air:0,mk:()=>fighter(0xe8c24a)}
];
const HOME=[[620,0,-Math.PI/2],[780,112,Math.PI],[840,112,Math.PI],[900,112,Math.PI],[950,112,Math.PI]];
const planes=[],gar=new THREE.Group();scene.add(gar);
function addPlane(t,x,z,yaw,parent){
  const pv=new THREE.Group();pv.rotation.order='YXZ';pv.scale.setScalar(t.sc);
  const m=t.mk();if(t.air)m.position.y=-t.gy/t.sc;pv.add(m);
  const rest={x,z,yaw},sol={x,z,hw:t.r[0],hd:t.r[1],h:t.r[2],y0:0,off:false};
  pv.position.set(x,t.gy,z);pv.rotation.y=yaw;(parent||scene).add(pv);solids.push(sol);
  planes.push({g:pv,t,rest,home:{x,z,yaw},sol,flame:m.userData.flame,rotor:m.userData.rotor});
}
TY.forEach((t,i)=>addPlane(t,HOME[i][0],HOME[i][1],HOME[i][2]));
const jmc={},mc=c=>jmc[c]||(jmc[c]=M(c));
const NAMES=['Falcon','Viper','Raptor','Eagle','Hawk','Storm','Cobra','Phantom','Lancer','Ghost'],JC=[0x9aa5ad,0x23282d,0xe8c24a,0xdfe3e6,0x3b7ea1,0xc94c4c,0x6b7b5a,0x8a7a5a,0x4a5a7a,0xe8684a];
function jetVar(i){
  const r=(q=>()=>(q=(q*16807)%2147483647)/2147483647)(i*977+11);
  const col=JC[Math.floor(r()*JC.length)],len=9+r()*5,rad=.5+r()*.4,nose=3+r()*3,c1=3+r()*3,span=4+r()*3.2,c2=1+r()*1.4,sw=1+r()*3.5,twin=r()<.5,twinE=r()<.4,sc=.55+r()*.25;
  return{n:NAMES[i%10]+'-'+(i+1),top:190+r()*110,tn:.7+r()*.4,vr:60+r()*12,sc,gy:(rad+1.45)*sc,r:[span*sc+1,len*sc*.6,3],air:0,mk:()=>{
    const g=new THREE.Group(),gm=mc(col),dm=mc(0x3a444c);
    jm(g,new THREE.CylinderGeometry(rad,rad*.8,len,10).rotateX(Math.PI/2),gm,0,0,0);
    jm(g,new THREE.ConeGeometry(rad,nose,10).rotateX(-Math.PI/2),gm,0,0,-len/2-nose/2+.1);
    jm(g,new THREE.SphereGeometry(rad*.9,10,8).scale(1,.75,2.2),mc(0x1c3a5a),0,rad*.8,-len*.22);
    const sh=new THREE.Shape();sh.moveTo(0,c1/2);sh.lineTo(span,c1/2-sw);sh.lineTo(span,c1/2-sw-c2);sh.lineTo(0,-c1/2);sh.closePath();
    const wmx=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}),wgx=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:false}).rotateX(-Math.PI/2);
    jm(g,wgx,wmx,0,-.1,len*.05);jm(g,wgx,wmx,0,-.1,len*.05).scale.x=-1;
    if(twin)[-1,1].forEach(q=>jm(g,new THREE.BoxGeometry(.16,2.2,2.4),gm,q*rad*1.3,1.3,len/2-1).rotation.z=-q*.22);else jm(g,new THREE.BoxGeometry(.16,3,2.6),gm,0,1.6,len/2-1);
    jm(g,new THREE.BoxGeometry(span*.6,.12,1.8),gm,0,0,len/2);
    (twinE?[-.4,.4]:[0]).forEach(x=>jm(g,new THREE.CylinderGeometry(.4,.32,1.1,8).rotateX(Math.PI/2),dm,x*rad*1.4,0,len/2+.3));
    const wh=new THREE.CylinderGeometry(.3,.3,.24,8).rotateZ(Math.PI/2),by=-(rad+1.15);
    jm(g,wh,dm,0,by,-len*.3);jm(g,wh,dm,-1.1,by,len*.12);jm(g,wh,dm,1.1,by,len*.12);
    const fl=jm(g,new THREE.ConeGeometry(.35,2.6,8).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.85}),0,0,len/2+1.8);fl.castShadow=false;g.userData.flame=fl;return g;
  }};
}
flat(1860,22,1470,.07,-62,0x4a4e52);flat(1860,.8,1470,.09,-62,0xe9c63a);
[700,1040,1380,1900,2400].forEach(x=>{flat(20,31,x,.07,-35.5,0x4a4e52);flat(.8,31,x,.09,-35.5,0xe9c63a)});
flat(740,31,1030,.07,-88.5,0x5d6065);
function garage(cx,i0){
  const W=300;box(W,12,2,cx,-131,0xaab1b8,1);box(2,12,32,cx-W/2-1,-115,0xaab1b8,1);box(2,12,32,cx+W/2+1,-115,0xaab1b8,1);
  const rf=box(W+6,2,36,cx,-115,0x7a828a,0);rf.position.y=13;solids.push({x:cx,z:-115,hw:W/2+3,hd:18,h:14,y0:11});
  flat(W,27,cx,.07,-117.5,0x6b6f73);
  for(let i=0;i<25;i++)addPlane(jetVar(i0+i),cx-W/2+8+i*11.6,-112,Math.PI,gar);
}
garage(850,0);garage(1210,25);
function heli(col){
  const g=new THREE.Group(),b=mc(col),d=mc(0x2a3036);
  jm(g,new THREE.SphereGeometry(1.5,12,8).scale(1,.9,1.6),b,0,1.6,0);jm(g,new THREE.SphereGeometry(1.1,10,8).scale(1,.8,1),mc(0x1c3a5a),0,1.9,-1.6);
  jm(g,new THREE.CylinderGeometry(.35,.15,6,8).rotateX(Math.PI/2),b,0,1.9,4.6);jm(g,new THREE.BoxGeometry(.12,1.6,1.2),b,0,2.6,7.4);
  [-1.2,1.2].forEach(x=>{jm(g,new THREE.CylinderGeometry(.08,.08,4.4,6).rotateX(Math.PI/2),d,x,.1,0);jm(g,new THREE.CylinderGeometry(.06,.06,1.2,6),d,x,.6,-1);jm(g,new THREE.CylinderGeometry(.06,.06,1.2,6),d,x,.6,1)});
  jm(g,new THREE.CylinderGeometry(.12,.12,.8,6),d,0,3.5,0);
  const rot=new THREE.Group();rot.position.y=3.9;g.add(rot);
  [0,Math.PI/2].forEach(a=>{const bl=new THREE.Mesh(new THREE.BoxGeometry(11,.06,.45),d);bl.rotation.y=a;rot.add(bl)});
  g.userData.rotor=rot;return g;
}
[0xe8684a,0x3b7ea1,0xf2c14e,0x2d3a40,0xffffff,0x7bb36a].forEach((c,i)=>{addPlane({n:'Helicopter '+(i+1),heli:1,top:70,tn:1,vr:0,sc:1,gy:1,r:[5,6,4],air:1,mk:()=>heli(c)},1100+i*36,215,Math.PI);flat(24,24,1100+i*36,.08,215,0x3a3f45)});
planes.forEach(q=>q.g.traverse(m=>{if(m.isMesh)m.castShadow=false}));

// crowd, people, biomes, vehicles
const sc=[0x3b7ea1,0xe8684a,0x2d3a40,0xf2c14e,0x7bb36a,0xb04a8a,0xdddddd],skins=[0xe0b090,0xd9a47c,0xb97c52,0x8d5a3a,0xf1c9a5],hairs=[0x1a1410,0x3a2a1c,0x6b4a2a,0xb08040,0x777777],pants=[0x2d3a40,0x3b4a6b,0x4a3b2d,0x222222,0x5a5a5a];
const pr=(mesh,idx,Mw,lx,ly,lz,rx)=>{tm.makeRotationX(rx);tm.setPosition(lx,ly,lz);wm.multiplyMatrices(Mw,tm);mesh.setMatrixAt(idx,wm)};
function mkCrowd(n){
  const mk=(geo,cnt)=>{const m=new THREE.InstancedMesh(geo,M(0xffffff),cnt);m.castShadow=true;m.frustumCulled=false;scene.add(m);return m};
  const C={torso:mk(new THREE.BoxGeometry(.5,.62,.28).translate(0,1.2,0),n),head:mk(new THREE.SphereGeometry(.17,8,6).translate(0,1.68,0),n),hair:mk(new THREE.SphereGeometry(.18,8,5,0,Math.PI*2,0,1.45).translate(0,1.71,0),n),legs:mk(new THREE.BoxGeometry(.2,.8,.22).translate(0,-.4,0),n*2),arms:mk(new THREE.BoxGeometry(.14,.6,.16).translate(0,-.3,0),n*2)};
  const c2=new THREE.Color();
  for(let i=0;i<n;i++){
    const sh=sc[Math.floor(R()*sc.length)],pc=pants[Math.floor(R()*5)];
    C.torso.setColorAt(i,c2.set(sh));C.arms.setColorAt(i*2,c2.set(sh));C.arms.setColorAt(i*2+1,c2.set(sh));
    C.head.setColorAt(i,c2.set(skins[Math.floor(R()*5)]));C.hair.setColorAt(i,c2.set(hairs[Math.floor(R()*5)]));
    C.legs.setColorAt(i*2,c2.set(pc));C.legs.setColorAt(i*2+1,c2.set(pc));
  }
  C.set=(i,Mw,sw)=>{pr(C.torso,i,Mw,0,0,0,0);pr(C.head,i,Mw,0,0,0,0);pr(C.hair,i,Mw,0,0,0,0);pr(C.legs,i*2,Mw,-.12,.8,0,sw);pr(C.legs,i*2+1,Mw,.12,.8,0,-sw);pr(C.arms,i*2,Mw,-.33,1.48,0,-sw*.8);pr(C.arms,i*2+1,Mw,.33,1.48,0,sw*.8)};
  C.up=()=>{for(const m of[C.torso,C.head,C.hair,C.legs,C.arms])m.instanceMatrix.needsUpdate=true};
  return C;
}
const NP=150,ppl=[],crowdA=mkCrowd(NP);
for(let i=0;i<NP;i++){
  const a=i<80,x=780+R()*200,p=a?{x0:x,z0:152,x1:x+(R()-.5)*140,z1:152+R()*3}:{x0:x,z0:153,x1:x+(R()-.5)*8,z1:160};
  p.L=Math.hypot(p.x1-p.x0,p.z1-p.z0)+.1;p.sp=1.1+R()*.8;p.ph=R()*2;ppl.push(p);
}
const NQ=220,peds=[],crowdB=mkCrowd(NQ),crowds=[crowdB];
for(let i=0;i<NQ;i++){
  const v=R()<.5;let p;
  if(v){const x=(22+Math.floor(R()*6))*120+(R()<.5?15:-15),z0=-470+R()*580;p={x0:x,z0,x1:x,z1:cl(z0+(R()-.5)*160,-470,110)}}
  else{const z=(-4+Math.floor(R()*6))*120+(R()<.5?15:-15),x0=2650+R()*580;p={x0,z0:z,x1:cl(x0+(R()-.5)*160,2650,3230),z1:z}}
  p.L=Math.hypot(p.x1-p.x0,p.z1-p.z0)+.1;p.sp=1.1+R()*.9;p.ph=R()*2;p.d=0;p.cx=p.x0;p.cz=p.z0;p.cy=0;peds.push(p);
}

ppl.forEach((p,i)=>{p.d=0;p.cx=p.x0;p.cz=p.z0;p.cy=0;p.cr=crowdA;p.ci=i;peds.push(p)});crowds.push(crowdA);
box(300,14,24,1580,168,0x9fc3d8,1);box(312,1.6,32,1580,168,0x5d6772,0).position.y=14.8;flat(340,100,1600,.08,105,0x6e7176);

let aiOn=true;
const AIS=[1005,1500,1580,1660].map((sx,k)=>{
  const A={g:airliner([0xf4f4f4,0xe8eef8,0xfff2e0,0xe4f4ff][k],[0xc94c4c,0x3b7ea1,0xf2c14e,0x7bb36a][k]),ph:'idle',seg:0,pr:0,tm:20+k*38,yaw:0,t:0,path:null,sx,cr:mkCrowd(30),pax:[]};
  A.g.rotation.order='YXZ';A.g.visible=false;scene.add(A.g);for(let i=0;i<30;i++)A.pax.push({dx:(R()-.5)*3});
  A.P={
   approach:[[[5100,300,0],[2450,0,0],75,70]],
   roll:[[[2450,0,0],[1900,0,0],70,14],[[1900,0,0],[1900,0,60],12,12],[[1900,0,60],[sx+35,0,60],18,18],[[sx+35,0,60],[sx+15,0,85],8,8],[[sx+15,0,85],[sx,0,108],6,3]],
   out:[[[sx,0,108],[sx+15,0,85],4,8],[[sx+15,0,85],[sx+35,0,60],8,8],[[sx+35,0,60],[1900,0,60],18,18],[[1900,0,60],[1900,0,0],12,12]],
   take:[[[1900,0,0],[2500,0,0],4,75],[[2500,0,0],[5100,300,0],75,85]]};
  return A;
});
function aiGo(A,name){A.ph=name;A.t=0;A.seg=0;A.pr=0;if(A.P[name]){A.path=A.P[name];const s0=A.path[0];if(name==='approach'||name==='take')A.yaw=Math.atan2(-(s0[1][0]-s0[0][0]),-(s0[1][2]-s0[0][2]))}}
function paxHide(A){if(!A.active)return;A.active=false;o.rotation.set(0,0,0);o.scale.set(0,0,0);o.position.set(0,-50,0);o.updateMatrix();for(let i=0;i<30;i++)A.cr.set(i,o.matrix,0);A.cr.up();o.scale.set(1,1,1)}
function paxMove(A,off){
  A.active=true;const a0=off?[A.sx+2.5,118]:[A.sx,153],b0=off?[A.sx,153]:[A.sx+2.5,118];o.rotation.set(0,0,0);
  for(let i=0;i<30;i++){const u=cl((A.t-i*1.4)/32,0,1);
    if(u<=0||u>=1){o.scale.set(0,0,0);o.position.set(0,-50,0)}else{o.scale.set(1,1,1);o.position.set(a0[0]+(b0[0]-a0[0])*u+A.pax[i].dx,0,a0[1]+(b0[1]-a0[1])*u)}
    o.updateMatrix();A.cr.set(i,o.matrix,Math.sin(time*6+i)*.6)}
  A.cr.up();o.scale.set(1,1,1);
}
function airStep(dt){
  for(const A of AIS){
    if(!aiOn){A.g.visible=false;paxHide(A);continue}
    A.t+=dt;
    if(A.ph==='idle'){A.tm-=dt;if(A.tm<=0){A.g.visible=true;aiGo(A,'approach')}paxHide(A);continue}
    if(A.P[A.ph]){
      const sg=A.path[A.seg],a=sg[0],b=sg[1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),v=sg[2]+(sg[3]-sg[2])*A.pr;
      A.pr+=v*dt/L;
      if(A.pr>=1){A.seg++;A.pr=0;if(A.seg>=A.path.length){
        if(A.ph==='approach')aiGo(A,'roll');else if(A.ph==='roll')aiGo(A,'off');else if(A.ph==='out')aiGo(A,'take');else{A.g.visible=false;A.ph='idle';A.tm=170}
        continue}}
      const f=A.pr;let dd=Math.atan2(-dx,-dz)-A.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));A.yaw+=dd*Math.min(1,dt*3);
      A.g.position.set(a[0]+dx*f,a[1]+dy*f,a[2]+dz*f);A.g.rotation.set(Math.asin(dy/L),A.yaw,0);paxHide(A);continue;
    }
    A.g.position.set(A.sx,0,108);let dd=Math.PI-A.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));A.yaw+=dd*Math.min(1,dt*3);A.g.rotation.set(0,A.yaw,0);
    if(A.ph==='off'){paxMove(A,true);if(A.t>46)aiGo(A,'wait')}
    else if(A.ph==='wait'){paxHide(A);if(A.t>20)aiGo(A,'on')}
    else if(A.ph==='on'){paxMove(A,false);if(A.t>46)aiGo(A,'out')}
  }
}

// trees & biomes
for(let i=0;i<450;i++){const x=-1320+(R()-.5)*3500,z=160+R()*130;if(Math.abs(z-(190+40*Math.sin(x/260)))<18)continue;trees.push([x,z,1.5+R()*.8])}
for(let t=0;t<22000&&trees.length<6500;t++){
  const x=(R()-.5)*9000,z=-4800+R()*5100;
  if((x>-3200&&x<520&&z>-2000&&z<320)||(x>2500&&x<3400&&z>-650&&z<250)||(x>540&&x<2700&&z>-200&&z<280)||(x>-4500&&x<-3500&&z>-800&&z<-250)||(x>880&&x<1780&&z>-275&&z<-205)||(Math.abs(z+240)<18&&x>470&&x<3260)||(Math.abs(z+480)<18&&x<-3100&&x>-4150)||z>300)continue;
  trees.push([x,z,1.8+R()*1.5]);
}
const BIO={des:[-6900,-4700,-3300,300],snow:[-3000,3000,-5600,-4300],jun:[3700,5000,-2800,200]};
const inBiome=(x,z)=>Object.values(BIO).some(r=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]);
const onRoadT=(x,z)=>((x>-3170&&x<520&&z>-1970&&z<170)||(x>2620&&x<3260&&z>-500&&z<140))&&(Math.abs(x-Math.round(x/120)*120)<17||Math.abs(z-Math.round(z/120)*120)<17)||(Math.abs(z+240)<17&&x>470&&x<3260)||(Math.abs(z+480)<17&&x<-3100&&x>-5010)||(Math.abs(x+1320)<17&&z<-1900&&z>-4330)||(Math.abs(z+180)<17&&x>3230&&x<4310)||(Math.abs(x+5000)<17&&z<-470&&z>-3000)||(x>-3170&&x<490&&Math.abs(z-(190+40*Math.sin(x/260)))<19)||(Math.abs(z+330)<14&&x>470&&x<2650)||(x>470&&x<700&&Math.abs(z-120)<17)||(Math.abs(x-680)<17&&z>110&&z<252)||(Math.abs(z-240)<17&&x>670&&x<1020)||(Math.abs(x+480)<17&&z>140&&z<340)||(Math.abs(z-275)<4&&x>-3010&&x<480)||(x>780&&x<920&&z>-340&&z<-230)||(x>2180&&x<2310&&z>-340&&z<-230)||(Math.hypot(x-680,z-120)<34)||(Math.hypot(x-680,z-240)<34);
for(let i=trees.length-1;i>=0;i--)if(onRoadT(trees[i][0],trees[i][1])||inBiome(trees[i][0],trees[i][1]))trees.splice(i,1);
const T=trees.length,tmap={},tk=(x,z)=>(Math.floor(x/50)+100)*1000+Math.floor(z/50)+100;
const crown=new THREE.InstancedMesh(new THREE.ConeGeometry(1.2,3.4,6).translate(0,3,0),M(0x3f7d4a),T);
const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.2,.25,1.6,5).translate(0,.8,0),M(0x7a5638),T);
crown.castShadow=trunk.castShadow=true;
trees.forEach((t,i)=>{t[3]=i;o.position.set(t[0],0,t[1]);o.scale.setScalar(t[2]);o.rotation.y=R()*6;o.updateMatrix();crown.setMatrixAt(i,o.matrix);trunk.setMatrixAt(i,o.matrix);const key=tk(t[0],t[1]);(tmap[key]=tmap[key]||[]).push(t)});
o.rotation.y=0;o.scale.set(1,1,1);scene.add(crown,trunk);

{
  const rb=(q=>()=>(q=(q*16807)%2147483647)/2147483647)(777);
  const addT=(x,z,sz)=>{const k=tk(x,z);(tmap[k]=tmap[k]||[]).push([x,z,sz])};
  const inst=(geo,col,n)=>{const m=new THREE.InstancedMesh(geo,M(col),n);m.castShadow=true;scene.add(m);return m};
  const pt=(m,i,x,y,z,sx,sy,sz,ry)=>{o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(0,ry||0,0);o.updateMatrix();m.setMatrixAt(i,o.matrix)};
  const rnd=(r)=>[r[0]+30+rb()*(r[1]-r[0]-60),r[2]+30+rb()*(r[3]-r[2]-60)];
  const step=(cx,cz,w,h,d,c,n,col)=>{for(let i=0;i<n;i++){const k=1-i/n,ww=w*k+8,hh=h/n;blk(cx,i*hh,cz,ww,hh,ww*(d/w),col||c,1)}};
  road(880,-4560,-480,Math.PI/2,.1);road(2520,-5000,-1740,0,.05);road(2400,-1320,-3120,0,.05);road(1060,3770,-180,Math.PI/2,.1);
  flat(2200,3600,-5800,.02,-1500,0xe2c88a);
  {const dn=inst(new THREE.SphereGeometry(1,16,8),0xdcbf80,40);for(let i=0;i<40;i++){const p2=rnd(BIO.des),r=30+rb()*40;pt(dn,i,p2[0],0,p2[1],r*1.6,3,r,rb()*6)}
   const t1=inst(new THREE.CylinderGeometry(.35,.4,3.2,7).translate(0,1.6,0),0x3f7d4a,300),t2=inst(new THREE.CylinderGeometry(.2,.2,1.4,6).rotateZ(Math.PI/2),0x3f7d4a,300),t3=inst(new THREE.CylinderGeometry(.2,.2,1.6,6).translate(0,.8,0),0x3f7d4a,300);let n=0;
   for(let i=0;i<340&&n<300;i++){const p2=rnd(BIO.des);if(onRoadT(p2[0],p2[1])||Math.hypot(p2[0]+5600,p2[1]+300)<45||Math.hypot(p2[0]+5600,p2[1]+1500)<80)continue;const s2=.8+rb()*.6;pt(t1,n,p2[0],0,p2[1],s2,s2,s2);pt(t2,n,p2[0]+.8*s2,1.9*s2,p2[1],s2,s2,s2);pt(t3,n,p2[0]+1.15*s2,1.9*s2,p2[1],s2,s2,s2);addT(p2[0],p2[1],.6);n++}
   t1.count=t2.count=t3.count=n;
   const rk=inst(new THREE.IcosahedronGeometry(1,0),0x8c7a62,160);let m=0;for(let i=0;i<200&&m<160;i++){const p2=rnd(BIO.des);if(onRoadT(p2[0],p2[1]))continue;const r=1.5+rb()*3;pt(rk,m++,p2[0],r*.5,p2[1],r*1.3,r*.8,r,rb()*6);addT(p2[0],p2[1],r*.5)}rk.count=m;
   const w=new THREE.Mesh(new THREE.CircleGeometry(28,28).rotateX(-Math.PI/2),new THREE.MeshPhongMaterial({color:0x39b6d8,specular:0xffffff,shininess:80,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-8}));w.position.set(-5600,.05,-300);scene.add(w);
   for(let i=0;i<12;i++){const a=i/12*6.283,x=-5600+Math.cos(a)*34,z=-300+Math.sin(a)*34,g=new THREE.Group(),tr=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,8,6).translate(0,4,0),M(0x7a5638));tr.rotation.z=(rb()-.5)*.3;g.add(tr);
     for(let k=0;k<5;k++){const lf=new THREE.Mesh(new THREE.BoxGeometry(5,.1,1),M(0x3f8f45));lf.position.set(0,8,0);lf.rotation.y=k*1.26;lf.rotation.z=.3;g.add(lf)}g.position.set(x,0,z);g.traverse(q=>{if(q.isMesh)q.castShadow=true});scene.add(g);addT(x,z,.8)}
   step(-5600,-1500,90,56,90,0xd9b66f,7)}
  flat(6000,1300,0,.02,-4950,0xf2f6fa);
  {const tr=inst(new THREE.CylinderGeometry(.3,.4,3,6).translate(0,1.5,0),0x6b4a2a,700),cn=inst(new THREE.ConeGeometry(2.2,6,7).translate(0,4.5,0),0x2f5f45,700),cp=inst(new THREE.ConeGeometry(1.2,2.6,7).translate(0,7.4,0),0xffffff,700);let n=0;
   for(let i=0;i<800&&n<700;i++){const p2=rnd(BIO.snow);if(onRoadT(p2[0],p2[1])||Math.hypot(p2[0]-500,p2[1]+4950)<150)continue;const s2=.8+rb()*.9;pt(tr,n,p2[0],0,p2[1],s2,s2,s2);pt(cn,n,p2[0],0,p2[1],s2,s2,s2);pt(cp,n,p2[0],0,p2[1],s2,s2,s2);addT(p2[0],p2[1],s2*1.2);n++}tr.count=cn.count=cp.count=n;
   const s1=inst(new THREE.SphereGeometry(1,10,8),0xffffff,24),s2m=inst(new THREE.SphereGeometry(.75,10,8),0xffffff,24),s3=inst(new THREE.SphereGeometry(.5,10,8),0xffffff,24);
   for(let i=0;i<24;i++){const p2=rnd(BIO.snow);pt(s1,i,p2[0],1,p2[1],1,1,1);pt(s2m,i,p2[0],2.4,p2[1],1,1,1);pt(s3,i,p2[0],3.4,p2[1],1,1,1)}
   const ice=new THREE.Mesh(new THREE.CircleGeometry(140,40).rotateX(-Math.PI/2),new THREE.MeshPhongMaterial({color:0xbfe8f5,specular:0xffffff,shininess:120,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-8}));ice.position.set(500,.05,-4950);scene.add(ice);
   for(let i=0;i<6;i++){const p2=rnd(BIO.snow);if(Math.hypot(p2[0]-500,p2[1]+4950)<150||onRoadT(p2[0],p2[1]))continue;const ig=new THREE.Mesh(new THREE.SphereGeometry(5,16,8,0,Math.PI*2,0,Math.PI/2),M(0xeef6fb));ig.position.set(p2[0],0,p2[1]);ig.castShadow=true;scene.add(ig);solids.push({x:p2[0],z:p2[1],hw:5,hd:5,h:5,y0:0})}
   for(let i=0;i<4;i++){const x=-2200+i*1500+rb()*200,z=-4800-rb()*400;blk(x,0,z,10,4,8,0x7a5638,1);const rf=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4).translate(0,.5,0),M(0xf2f6fa));rf.scale.set(8.5,3,7);rf.position.set(x,4,z);scene.add(rf);blk(x+3,4,z,1,2,1,0x555a60)}}
  flat(1300,3000,4350,.02,-1300,0x2f6b3a);
  {const tr=inst(new THREE.CylinderGeometry(.4,.6,10,6).translate(0,5,0),0x5a4028,1400),c1=inst(new THREE.SphereGeometry(1,8,6),0x2a7a3a,1400),c2=inst(new THREE.SphereGeometry(1,8,6),0x3d9a45,1400);let n=0;
   for(let i=0;i<1600&&n<1400;i++){const p2=rnd(BIO.jun);if(onRoadT(p2[0],p2[1])||Math.hypot(p2[0]-4400,p2[1]+2200)<60)continue;const h=.8+rb()*.9;pt(tr,n,p2[0],0,p2[1],h,h*(1+rb()*.6),h);pt(c1,n,p2[0],9*h,p2[1],5.5*h,4*h,5.5*h);pt(c2,n,p2[0]+2,12*h,p2[1]-1,3.5*h,3*h,3.5*h);addT(p2[0],p2[1],h*1.6);n++}tr.count=c1.count=c2.count=n;
   const fn=inst(new THREE.SphereGeometry(1,7,5),0x1f6b30,600);for(let i=0;i<600;i++){const p2=rnd(BIO.jun);pt(fn,i,p2[0],.7,p2[1],1.6,.9,1.6,rb()*6)}
   const rv=new THREE.CatmullRomCurve3([[3720,0,-1800],[4100,0,-1500],[4300,0,-1200],[4600,0,-900],[4980,0,-600]].map(q=>new THREE.Vector3(q[0],q[1],q[2])),false,'centripetal');
   ribbon(rv.getSpacedPoints(60),22,.04,new THREE.MeshPhongMaterial({color:0x2a8fa0,specular:0xffffff,shininess:80,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-8}));
   step(4400,-2200,70,40,70,0x8a8f7a,5)}
}

const mts=[];
for(let i=0;i<46;i++){
  const r=160+R()*260,H=r*(.9+R()*.7),a=R()*Math.PI*2,d=3400+R()*1500;
  const x=Math.cos(a)*d,z=-Math.abs(Math.sin(a))*d-200;
  if((x>-3600&&x<3700&&z>-2500)||(x>-4600&&x<-3400&&z>-1000&&z<0))continue;
  const m=new THREE.Mesh(new THREE.ConeGeometry(r,H,8),M(i%3?0x728a7c:0xa3adab));m.position.set(x,H/2,z);scene.add(m);mts.push({x,z,r,H});
}
const clouds=[];
for(let i=0;i<30;i++){
  const g=new THREE.Group();
  for(let j=0;j<5;j++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(18+R()*20,1),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}));m.position.set(j*30-60,R()*10,R()*25);g.add(m)}
  g.position.set((R()-.5)*8000,450+R()*350,(R()-.5)*8000);clouds.push(g);scene.add(g);
}

// character, vehicles, weapons, interiors
function mkMan(shirt){
  const g=new THREE.Group(),sk2=M(0xe0b090),sh=M(shirt),pn=M(0x2d3a40),dk=M(0x111111),hr=M(0x3a2a1c);
  const add=(geo,m,x,y,z,p)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=true;(p||g).add(q);return q};
  add(new THREE.BoxGeometry(.54,.66,.3),sh,0,1.18,0);add(new THREE.BoxGeometry(.56,.1,.32),pn,0,.85,0);
  add(new THREE.CylinderGeometry(.07,.08,.1,8),sk2,0,1.56,0);add(new THREE.SphereGeometry(.17,12,10),sk2,0,1.72,0);
  add(new THREE.SphereGeometry(.18,12,8,0,Math.PI*2,0,1.45),hr,0,1.75,.01);
  add(new THREE.SphereGeometry(.025,6,5),dk,-.06,1.74,-.155);add(new THREE.SphereGeometry(.025,6,5),dk,.06,1.74,-.155);
  const mkLeg=x=>{const l=new THREE.Group();l.position.set(x,.82,0);g.add(l);add(new THREE.BoxGeometry(.21,.74,.24),pn,0,-.37,0,l);add(new THREE.BoxGeometry(.23,.1,.34),dk,0,-.77,-.04,l);return l};
  const ll=mkLeg(-.14),lr=mkLeg(.14);
  const arm=(x,rx)=>{const a=new THREE.Group();a.position.set(x,1.45,0);a.rotation.x=rx;g.add(a);add(new THREE.BoxGeometry(.15,.62,.17),sh,0,-.3,0,a);add(new THREE.SphereGeometry(.07,8,6),sk2,0,-.64,0,a);return a};
  const la=arm(-.37,0);arm(.37,1.35);
  const slot=new THREE.Group();slot.position.set(.37,1.3,-.5);g.add(slot);g.userData.gb=slot;g.userData.slot=slot;
  g.userData.ll=ll;g.userData.lr=lr;g.userData.la=la;g.userData.sh=sh;return g;
}
const man=mkMan(0xd8463a);man.visible=false;scene.add(man);
const CARLIKE={car:1,sport:1,jeep:1,pickup:1,ambulance:1,police:1};
const VS={car:[32,11,1.9],sport:[52,16,2.2],jeep:[30,12,2],pickup:[32,11,1.8],ambulance:[36,12,1.7],police:[44,14,2.1],bike:[28,11,1.9],tank:[16,11,1.1],boat:[34,10,1.5],jetski:[42,15,2.3]};
const VN={car:'drive the car',sport:'drive the sports car',jeep:'drive the jeep',pickup:'drive the pickup',ambulance:'drive the ambulance',police:'drive the police car',bike:'ride the bike',tank:'drive the tank',boat:'drive the speedboat',jetski:'ride the jet ski'};
function mkVeh(kind,col,st){
  const g=new THREE.Group(),w=[],cl2=!!CARLIKE[kind];
  const add=(geo,m,x,y,z)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=true;g.add(q);return q};
  const wgeo=new THREE.CylinderGeometry(cl2?.38:.45,cl2?.38:.45,cl2?.3:.2,12).rotateZ(Math.PI/2),wmt=M(0x111111),gl=M(0x222c33),Bx2=(a,b,c)=>new THREE.BoxGeometry(a,b,c);
  if(cl2){
    const dm=({car:[[1.9,.8,4.2,1.6,.7,2.2],[1.9,.6,4.4,1.5,.5,2],[2.1,1.1,4.7,1.9,.9,2.8],[2.1,1.5,5,1.9,1,2.2]][st||0],sport:[1.9,.55,4.4,1.5,.45,1.9],jeep:[2,1,3.8,1.8,.9,2.2],pickup:[2,.8,5.2,1.8,.8,1.6],ambulance:[2.2,1.7,5.4,2,.9,1.4],police:[1.9,.8,4.4,1.6,.7,2.2]})[kind];
    const bc=kind==='police'?0x16202b:col;
    g.userData.body=add(Bx2(dm[0],dm[1],dm[2]),M(bc),0,.22+dm[1]/2,0);
    if(kind==='pickup'){add(Bx2(dm[3],dm[4],dm[5]),gl,0,.12+dm[1]+dm[4]/2,-1.2);add(Bx2(1.9,.15,2.4),M(0x555a60),0,.22+dm[1]+.05,1.2);[-.95,.95].forEach(x=>add(Bx2(.1,.45,2.4),M(bc),x,.22+dm[1]+.25,1.2))}
    else if(kind==='jeep'){add(Bx2(1.8,.9,.1),gl,0,.12+dm[1]+.45,-.5);add(Bx2(.15,.9,.15),M(0x333333),-.85,.12+dm[1]+.45,.9);add(Bx2(.15,.9,.15),M(0x333333),.85,.12+dm[1]+.45,.9);add(Bx2(1.8,.12,.12),M(0x333333),0,.12+dm[1]+.9,.9)}
    else add(Bx2(dm[3],dm[4],dm[5]),gl,0,.12+dm[1]+dm[4]/2,.2);
    if(kind==='sport')add(Bx2(1.8,.12,.5),M(0x15181b),0,.22+dm[1]+.35,2);
    if(kind==='ambulance'||kind==='police'){
      const m1=new THREE.MeshBasicMaterial({color:0xff2020}),m2=new THREE.MeshBasicMaterial({color:0x2060ff}),top=.12+dm[1]+dm[4]+(kind==='ambulance'?.7:.05);
      add(Bx2(.5,.15,.3),m1,-.45,top,.2);add(Bx2(.5,.15,.3),m2,.45,top,.2);g.userData.sir=[m1,m2];
      if(kind==='ambulance')[-1,1].forEach(x=>add(Bx2(.04,.35,4.4),M(0xd8263a),x*1.11,1.1,0));else [-1,1].forEach(x=>add(Bx2(.04,.5,2.4),M(0xffffff),x*.96,.62,0));
    }
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>w.push(add(wgeo,wmt,q[0]*dm[0]*.5,.38,q[1]*dm[2]*.32)));
  }
  else if(kind==='tank'){const tk2=M(0x4b5a3a),dk2=M(0x222222),wgT=new THREE.CylinderGeometry(.5,.5,.5,10).rotateZ(Math.PI/2);
    add(new THREE.BoxGeometry(3.2,1.1,6),tk2,0,1.1,0);add(new THREE.BoxGeometry(2.2,.9,2.6),tk2,0,2.1,.3);add(new THREE.CylinderGeometry(.18,.18,4,8).rotateX(Math.PI/2),dk2,0,2.2,-2.4);
    [-1.9,1.9].forEach(x=>{add(new THREE.BoxGeometry(.9,1,6.6),dk2,x,.7,0);for(let k2=0;k2<5;k2++)w.push(add(wgT,tk2,x*1.27,.5,-2.4+k2*1.2))})}
  else if(kind==='boat'){add(Bx2(2.4,.9,6.5),M(col),0,.45,0);add(new THREE.ConeGeometry(1.2,2.4,4).rotateX(-Math.PI/2),M(col),0,.45,-4.4);add(Bx2(1.8,.9,2),M(0xf2f2f2),0,1.3,.6);add(Bx2(1.6,.6,.1),M(0x9fd0e6),0,1.55,-.45)}
  else if(kind==='jetski'){add(Bx2(.9,.5,2.6),M(col),0,.35,0);add(Bx2(.5,.35,.9),M(0x222222),0,.7,.4);add(Bx2(.8,.08,.08),M(0x444444),0,.95,-.5);add(new THREE.ConeGeometry(.45,1,4).rotateX(-Math.PI/2),M(col),0,.35,-1.8)}
  else{add(new THREE.BoxGeometry(.35,.5,1.8),M(col),0,.8,0);add(new THREE.BoxGeometry(.4,.25,.7),M(0x222222),0,1.1,.5);add(new THREE.BoxGeometry(1,.08,.08),M(0x444444),0,1.25,-.7);w.push(add(wgeo,wmt,0,.45,-.95),add(wgeo,wmt,0,.45,.95))}
  g.userData.w=w;return g;
}
const veh=[];
function addVeh(kind,x,z,yaw,col,st){const g=mkVeh(kind,col,st);g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);veh.push({g,kind,x,z,y:0,yaw,speed:0,hp:100,home:[x,z,yaw],rad:CARLIKE[kind]?.38:kind==='tank'?.5:.45})}
[0xe8684a,0x3b7ea1,0xf2c14e,0x2d3a40].forEach((c,i)=>addVeh('car',810+i*26,208,0,c));
[0xd8463a,0x3b7ea1,0x7bb36a].forEach((c,i)=>addVeh('bike',935+i*7,208,0,c));
addVeh('car',2884,-100,0,0xc94c4c);addVeh('bike',2892,-96,0,0x2d3a40);addVeh('car',3000,-60,0,0xffffff);
addVeh('car',500,-236,Math.PI/2,0x7bb36a);addVeh('bike',500,-250,Math.PI/2,0xe8684a);

// House
const HX=-4000,HZ=-560,HW=70,HD=44,HH=4.6,WC=0xeee6d6;
road(1000,-3620,-480,Math.PI/2,.1);
flat(340,200,-3950,.02,-530,0x6fae55);flat(12,60,HX,.05,-508,0xb8b2a6);flat(130,64,-3875,.05,-540,0x55595d);flat(HW,HD,HX,.06,HZ,0xcbb08a);
const hm=(w,h,d,x,z,col,y0,hit,tr)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),tr?new THREE.MeshLambertMaterial({color:0x9fd0e6,transparent:true,opacity:.35}):M(col));m.position.set(x,(y0||0)+h/2,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(hit)solids.push({x,z,hw:w/2,hd:d/2,h:(y0||0)+h,y0:y0||0});return m};
function hwall(ax,fix,a,b,ops){
  let p=a;const seg=(s2,e,y0,h,tr)=>{if(e-s2<.05)return;const len=e-s2,c=(s2+e)/2;if(ax==='x')hm(len,h,.6,c,fix,WC,y0,1,tr);else hm(.6,h,len,fix,c,WC,y0,1,tr)};
  ops.forEach(([s2,e,t])=>{seg(p,s2,0,HH,0);if(t==='win'){seg(s2,e,0,1,0);seg(s2,e,3,HH-3,0);seg(s2,e,1,2,1)}else seg(s2,e,2.6,HH-2.6,0);p=e});
  seg(p,b,0,HH,0);
}
hwall('x',HZ+22,HX-35,HX+35,[[HX-30,HX-26,'win'],[HX-22,HX-18,'win'],[HX-14,HX-10,'win'],[HX-2,HX+2,'door'],[HX+10,HX+14,'win'],[HX+18,HX+22,'win'],[HX+26,HX+30,'win']]);
hwall('x',HZ-22,HX-35,HX+35,[[HX-30,HX-26,'win'],[HX-22,HX-18,'win'],[HX-4,HX+4,'win'],[HX+18,HX+22,'win'],[HX+26,HX+30,'win']]);
hwall('z',HX-35,HZ-22,HZ+22,[[HZ-16,HZ-12,'win'],[HZ+8,HZ+12,'win']]);
hwall('z',HX+35,HZ-22,HZ+22,[[HZ-16,HZ-12,'win'],[HZ+8,HZ+12,'win']]);
hwall('z',HX-12,HZ-22,HZ+22,[[HZ+10,HZ+14,'door'],[HZ-14,HZ-10,'door']]);
hwall('z',HX+12,HZ-22,HZ+22,[[HZ+10,HZ+14,'door'],[HZ-14,HZ-10,'door']]);
hwall('x',HZ-2,HX-35,HX-12,[[HX-26,HX-22,'door']]);hwall('x',HZ-2,HX+12,HX+35,[[HX+22,HX+26,'door']]);hwall('x',HZ-8,HX-12,HX+12,[[HX-2,HX+2,'door']]);
hm(HW+1,.4,HD+1,HX,HZ,0xf2ede4,HH,0);
{const rf2=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4).translate(0,.5,0),M(0x8c3b3b));rf2.scale.set((HW+4)/1.414,8,(HD+4)/1.414);rf2.position.set(HX,HH+.4,HZ);rf2.castShadow=true;scene.add(rf2);
 solids.push({x:HX,z:HZ,hw:HW/2+2,hd:HD/2+2,h:HH+9,y0:HH-.3})}
const fu=(w,h,d,x,z,c)=>hm(w,h,d,HX+x,HZ+z,c,0,1);
fu(2.4,.6,3.2,-28,17,0x6b4f9a);fu(2.4,.6,3.2,-28,-14,0x3b7ea1);fu(2.4,.6,3.2,28,-14,0xc94c4c);fu(3,.8,1.5,26,17,0x7a5638);fu(.6,2.6,6,34,12,0x5a3a22);
fu(6,.9,2,-6,14,0x3b7ea1);fu(2.6,.5,1.4,-6,10,0x7a5638);fu(4,2,.4,-7,-7.5,0x111111);fu(10,1,1.5,0,-20.5,0xdddddd);fu(5,1,2,0,-14,0x555555);fu(1.5,2.2,1.5,9,-20,0xcccccc);fu(1.8,.6,4,33,-19,0xffffff);fu(3,2.5,1,-14,20,0x7a5638);fu(5,.8,2.4,6,-14,0x7a5638);
{const bc=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,150,8),new THREE.MeshBasicMaterial({color:0xffe060,transparent:true,opacity:.6}));bc.position.set(HX,75,HZ);scene.add(bc)}
for(let i=0;i<12;i++){addVeh('car',-3935+i*10.6,-526,0,cc[i%cc.length],i%4);addVeh('car',-3935+i*10.6,-554,Math.PI,cc[(i+3)%cc.length],(i+1)%4)}
for(let i=0;i<8;i++)addVeh('bike',-3935+i*6,-568,0,cc[i%cc.length]);
[['sport',0xd8263a],['jeep',0x6b7b5a],['pickup',0x3b7ea1],['police',0x16202b],['ambulance',0xffffff]].forEach((a,i)=>addVeh(a[0],826+i*26,218,0,a[1]));
[0,1,2].forEach(i=>addVeh('ambulance',-1256+i*9,-868,Math.PI,0xffffff));
addVeh('police',-1180,-835,0,0x16202b);addVeh('police',-1100,-835,Math.PI,0x16202b);
{const pier=new THREE.Mesh(new THREE.BoxGeometry(70,.6,6),M(0x7a5638));pier.position.set(-1060,.1,336);pier.receiveShadow=true;scene.add(pier)}
[0,1,2].forEach(i=>addVeh('boat',-1100+i*14,352,Math.PI,[0xe8684a,0x3b7ea1,0xffffff][i]));
[0,1,2].forEach(i=>addVeh('jetski',-1058+i*8,348,Math.PI,[0xf2c14e,0xd8263a,0x39e6ff][i]));
function goHome(){if(curV){curV.speed=0;curV=null}if(J.dead)respawn();mode='foot';Mn.inside=null;Mn.air=0;chute.visible=false;intLight.intensity=0;Mn.pos.set(HX,0,HZ+HD/2+12);Mn.yaw=0;Mn.aim=0;snap=true;updVis();renderPad()}

// weapons & gun shop
const GUNS=[
 {n:'Pistol',price:0,rate:.35,pel:1,spread:.003,range:140,pos:[.37,1.3,-.5]},
 {n:'Revolver',price:400,rate:.6,pel:1,spread:.002,range:180,pos:[.37,1.3,-.5]},
 {n:'SMG',price:500,rate:.08,pel:1,spread:.03,range:120,pos:[.37,1.3,-.5]},
 {n:'Assault rifle',price:1200,rate:.11,pel:1,spread:.012,range:220,pos:[.37,1.3,-.45]},
 {n:'Shotgun',price:900,rate:.75,pel:8,spread:.07,range:90,pos:[.37,1.3,-.45]},
 {n:'Sniper rifle',price:2500,rate:1,pel:1,spread:0,range:420,zoom:1,pos:[.37,1.3,-.4]},
 {n:'Machine gun',price:3000,rate:.06,pel:1,spread:.02,range:240,pos:[.37,1.3,-.4]},
 {n:'Rocket launcher',price:3500,rate:1.6,type:'rocket',blast:20,range:400,pos:[.3,1.55,-.1]},
 {n:'Missile launcher',price:5000,rate:2.2,type:'missile',blast:28,range:600,pos:[.3,1.55,-.1]}];
const owned=GUNS.map((g,i)=>i===0);let GUN=GUNS[0];
const gdk=M(0x15181b),gmt=M(0x6a6f75),gwd=M(0x7a4a2a),gol=M(0x4b5a3a),Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Cy=(r,l)=>new THREE.CylinderGeometry(r,r,l,8).rotateX(Math.PI/2),Cn=(r,l)=>new THREE.ConeGeometry(r,l,8).rotateX(-Math.PI/2);
const gb2=parts=>{const g=new THREE.Group();parts.forEach(([geo,m,x,y,z])=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);g.add(q)});g.visible=false;return g};
const GM=[
 gb2([[Bx(.06,.12,.3),gdk,0,0,-.05],[Bx(.05,.14,.08),gdk,0,-.1,.04]]),
 gb2([[Bx(.06,.1,.34),gmt,0,0,-.08],[Cy(.05,.12),gdk,0,-.02,.02],[Bx(.05,.14,.08),gwd,0,-.1,.08]]),
 gb2([[Bx(.07,.14,.5),gdk,0,0,-.1],[Bx(.04,.2,.06),gdk,0,-.15,-.05],[Bx(.05,.1,.14),gdk,0,-.07,.2]]),
 gb2([[Bx(.07,.12,.9),gol,0,0,-.2],[Bx(.05,.2,.08),gdk,0,-.14,-.1],[Bx(.06,.14,.3),gwd,0,-.02,.4],[Cy(.025,.4),gdk,0,.02,-.85]]),
 gb2([[Cy(.03,.9),gdk,0,.02,-.3],[Cy(.03,.9),gdk,0,-.03,-.3],[Bx(.07,.1,.4),gwd,0,-.04,.35],[Bx(.08,.08,.3),gwd,0,-.06,-.1]]),
 gb2([[Bx(.06,.11,.9),gdk,0,0,0],[Cy(.02,.9),gdk,0,.02,-.85],[Cy(.045,.35),gmt,0,.12,-.1],[Bx(.06,.15,.35),gwd,0,-.01,.5]]),
 gb2([[Bx(.1,.16,.8),gol,0,0,-.15],[Cy(.03,.7),gdk,0,.02,-.7],[Bx(.2,.1,.2),gdk,0,-.12,-.1],[Bx(.03,.3,.03),gdk,-.06,-.2,-.7],[Bx(.03,.3,.03),gdk,.06,-.2,-.7]]),
 gb2([[Cy(.1,1.3),gol,0,.1,-.2],[Cn(.13,.3),gmt,0,.1,-.95],[Bx(.06,.18,.08),gdk,0,-.08,-.05]]),
 gb2([[Cy(.13,1.5),gmt,0,.12,-.25],[Cy(.06,.2),gdk,-.1,.12,.5],[Bx(.06,.18,.1),gdk,0,-.08,-.1],[Cn(.1,.3),gdk,0,.12,-1.1]])];
GM.forEach(g=>man.userData.slot.add(g));
function equip(i){GUN=GUNS[i];GM.forEach((g,k)=>g.visible=k===i);man.userData.slot.position.set(GUN.pos[0],GUN.pos[1],GUN.pos[2])}

const projs=[],PM=M(0x555a60),PFm=new THREE.MeshBasicMaterial({color:0xffa040}),pq=new THREE.Vector3();
let bf=null,bs=null,bflash=null,bhide=0;
function explode(pos,R2){
  if(!bf){bf=mkPts(120,22,THREE.AdditiveBlending);bs=mkPts(60,30,THREE.NormalBlending);bflash=new THREE.PointLight(0xff9a40,0,200);scene.add(bflash)}
  burst(bf,pos,R2*2.5,1,6);burst(bs,pos,R2,2.2,6);bflash.position.copy(pos);bflash.intensity=6;bhide=3;sfx('boom');
  peds.forEach(pd=>{if(pd.d===0&&Math.hypot(pd.cx-pos.x,pd.cz-pos.z)<R2){pd.d=.01;pd.fy=pd.cy;kills++;money+=150;crime()}});
  for(const q of[[0,0],[R2*.6,0],[-R2*.6,0],[0,R2*.6],[0,-R2*.6]]){killBuilding(pos.x+q[0],pos.z+q[1]);killTree(pos.x+q[0],pos.z+q[1])}
}
function spawnProj(x,y,z,dir,speed,type,blast,tgt){
  const g=new THREE.Group();g.add(new THREE.Mesh(Cy(.12,1.1),PM));
  const nose=new THREE.Mesh(Cn(.12,.35),PM);nose.position.z=-.7;g.add(nose);
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.1,.7,6).rotateX(Math.PI/2),PFm);fl.position.z=.9;g.add(fl);
  g.position.set(x,y,z);scene.add(g);projs.push({g,v:new THREE.Vector3(dir.x,dir.y,dir.z).normalize().multiplyScalar(speed),life:0,type,blast,tgt});sfx('gun');
}
function launch(G){
  cam.getWorldDirection(T3);let tgt=null;
  if(G.type==='missile'){let bd=.93;peds.forEach(p=>{if(p.d>0)return;const wx=p.cx-cam.position.x,wy=1.1-cam.position.y,wz=p.cz-cam.position.z,l=Math.hypot(wx,wy,wz);if(l<30||l>G.range)return;const c2=(wx*T3.x+wy*T3.y+wz*T3.z)/l;if(c2>bd){bd=c2;tgt=p}})}
  spawnProj(Mn.pos.x-Math.sin(Mn.yaw)*1.2,Mn.pos.y+1.6,Mn.pos.z-Math.cos(Mn.yaw)*1.2,T3,G.type==='rocket'?95:75,G.type,G.blast,tgt);
}
function fireShell(v){pq.set(-Math.sin(v.yaw),.04,-Math.cos(v.yaw));spawnProj(v.x-Math.sin(v.yaw)*4.4,v.y+2.3,v.z-Math.cos(v.yaw)*4.4,pq,130,'rocket',22,null)}
function projStep(dt){
  if(bflash)bflash.intensity=Math.max(0,bflash.intensity-dt*10);
  if(bf&&bf.p.visible){bhide-=dt;fx(bf,dt,false);fx(bs,dt,true);if(bhide<0)bf.p.visible=bs.p.visible=false}
  for(let i=projs.length-1;i>=0;i--){
    const p=projs[i],q=p.g.position;p.life+=dt;
    if(p.type==='missile'&&p.tgt&&p.tgt.d===0){const sp=p.v.length();pq.set(p.tgt.cx-q.x,1.2-q.y,p.tgt.cz-q.z).normalize().multiplyScalar(sp);p.v.lerp(pq,Math.min(1,dt*2.5))}
    q.addScaledVector(p.v,dt);p.g.lookAt(q.x-p.v.x,q.y-p.v.y,q.z-p.v.z);
    let hit=q.y<.3||p.life>7||inBuilding(q.x,q.y,q.z);
    if(!hit)for(const pd of peds)if(pd.d===0&&Math.abs(pd.cx-q.x)<2.2&&Math.abs(pd.cz-q.z)<2.2&&q.y<2.6){hit=true;break}
    if(hit){explode(q,p.blast);scene.remove(p.g);projs.splice(i,1)}
  }
}
{const cx=720,cz=205,w=24,d=16,h=5,SW=(ww,hh,dd,x,z,y0)=>hm(ww,hh,dd,x,z,0x8a4a3a,y0||0,1);
 SW(w,h,.6,cx,cz-d/2);SW(.6,h,d,cx-w/2,cz);SW(.6,h,d,cx+w/2,cz);SW(10,h,.6,cx-7,cz+d/2);SW(10,h,.6,cx+7,cz+d/2);SW(4,h-3,.6,cx,cz+d/2,3);
 hm(w+1,.4,d+1,cx,cz,0x4a3a32,h,0);flat(w,d,cx,.06,cz,0x7a6a5a);hm(10,1.1,1.2,cx,cz-3,0x3a2a22,0,1);
 const sg=new THREE.Mesh(new THREE.BoxGeometry(10,1.4,.3),new THREE.MeshBasicMaterial({color:0xff3b30}));sg.position.set(cx,h+1.3,cz+d/2+.2);scene.add(sg);
 for(let i=0;i<7;i++){const gr=new THREE.Mesh(new THREE.BoxGeometry(.12,.14,1.1+(i%3)*.2),M(GUNS[i%5].col));gr.position.set(cx-9+i*3,2.2,cz-d/2+.8);scene.add(gr)}}
const shopEl=$('shop');
function renderShop(){
  shopEl.innerHTML='<b>🔫 Gun Shop</b> <span>$'+money+'</span>'+GUNS.map((g,i)=>'<div>'+(i+1)+'. '+g.n+' - '+(g.price?'$'+g.price:'free')+'<button data-i="'+i+'">'+(GUN===g?'Equipped':owned[i]?'Equip':'Buy')+'</button></div>').join('')+'<div>🪖 Tank - $4000<button id="buytank">Buy</button></div><div><small>Each kill earns $150. Keys 1-9 switch weapons.</small><button id="shopx">Close</button></div>';
  shopEl.querySelectorAll('button[data-i]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i;if(owned[i])equip(i);else if(money>=GUNS[i].price){money-=GUNS[i].price;owned[i]=true;equip(i)}renderShop()}));
  $('buytank').addEventListener('click',()=>{if(money>=4000){money-=4000;addVeh('tank',690,240,0,0x4b5a3a);note('Tank delivered in front of the shop');renderShop()}else note('Not enough money')});
  $('shopx').addEventListener('click',()=>{shopOpen=false;shopEl.style.display='none'});
}
function openShop(){shopOpen=true;shopEl.style.display='block';renderShop()}
equip(0);

// explosion & particles
const spr=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.4,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const lampMat=new THREE.MeshBasicMaterial({color:0x777777}),NL=SI.length*2;
const lh=new THREE.InstancedMesh(new THREE.SphereGeometry(.45,8,6).translate(0,6.6,0),lampMat,NL),lp=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.12,6.4,6).translate(0,3.2,0),M(0x333333),NL),pool=new THREE.InstancedMesh(new THREE.PlaneGeometry(26,26).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:spr,color:0xffd58a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),NL);
SI.forEach((q,i)=>{[[14,-14],[-14,14]].forEach((d,j)=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(q[0]+d[0],0,q[1]+d[1]);o.updateMatrix();lh.setMatrixAt(i*2+j,o.matrix);lp.setMatrixAt(i*2+j,o.matrix);o.position.y=.17;o.updateMatrix();pool.setMatrixAt(i*2+j,o.matrix)})});
scene.add(lh,lp,pool);
const hlt=new THREE.InstancedMesh(new THREE.BoxGeometry(.4,.22,.12),new THREE.MeshBasicMaterial({color:0xfff6c0}),NC*2);hlt.visible=false;hlt.count=cars.length*2;scene.add(hlt);
{const sl=new THREE.InstancedMesh(new THREE.SphereGeometry(.4,6,5),lampMat,sk.length);let n3=0;
 for(let i=2;i<sk.length-2;i+=3){const a=sk[i-1],b=sk[i+1],p=sk[i];T3.set(b.x-a.x,0,b.z-a.z).normalize();for(const sd2 of[-7.3,7.3]){o.position.set(p.x-T3.z*sd2,p.y+2,p.z+T3.x*sd2);o.updateMatrix();sl.setMatrixAt(n3++,o.matrix)}}
 sl.count=n3;scene.add(sl)}
function mkPts(n,size,blend){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3),3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size,map:spr,vertexColors:true,transparent:true,depthWrite:false,blending:blend}));p.frustumCulled=false;p.visible=false;scene.add(p);
  return{p,n,v:new Float32Array(n*3),a:new Float32Array(n),m:new Float32Array(n)};
}
const fire=mkPts(280,24,THREE.AdditiveBlending),smoke=mkPts(160,36,THREE.NormalBlending);
const ball=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xff9a40,transparent:true,opacity:.9}));ball.visible=false;scene.add(ball);
const flash=new THREE.PointLight(0xff9a40,0,600);scene.add(flash);
function burst(s,pos,sp,life,lift){
  const P=s.p.geometry.attributes.position.array;
  for(let i=0;i<s.n;i++){
    const th=R()*6.283,ph2=Math.acos(2*R()-1),v=sp*(.2+R()*.8);
    s.v[i*3]=Math.sin(ph2)*Math.cos(th)*v;s.v[i*3+1]=Math.abs(Math.cos(ph2))*v+lift;s.v[i*3+2]=Math.sin(ph2)*Math.sin(th)*v;
    s.a[i]=0;s.m[i]=life*(.5+R()*.8);P[i*3]=pos.x;P[i*3+1]=pos.y;P[i*3+2]=pos.z;
  }
  s.p.visible=true;
}
function fx(s,dt,smk){
  const P=s.p.geometry.attributes.position.array,C=s.p.geometry.attributes.color.array;
  for(let i=0;i<s.n;i++){
    s.a[i]+=dt;const u=Math.min(1,s.a[i]/s.m[i]);
    P[i*3]+=s.v[i*3]*dt;P[i*3+1]+=s.v[i*3+1]*dt;P[i*3+2]+=s.v[i*3+2]*dt;
    const dr=Math.exp(-dt*1.4);s.v[i*3]*=dr;s.v[i*3+1]=s.v[i*3+1]*dr+(smk?6:-9)*dt;s.v[i*3+2]*=dr;
    if(smk){const g=.14+u*.64;C[i*3]=g;C[i*3+1]=g+u*.06;C[i*3+2]=g+u*.08}
    else{const f=1-u;C[i*3]=f;C[i*3+1]=.55*f*f;C[i*3+2]=.1*f*f*f}
  }
  s.p.geometry.attributes.position.needsUpdate=s.p.geometry.attributes.color.needsUpdate=true;
}
const tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffe9a0}));tracer.visible=false;tracer.frustumCulled=false;scene.add(tracer);
const mflash=new THREE.PointLight(0xffd080,0,40);scene.add(mflash);

// state & controls
const J={pos:new THREE.Vector3(),yaw:0,pitch:0,roll:0,speed:0,thr:0,ground:true,dead:false,dt:0,cur:0,held:false,top:220,tn:.9,vr:65,gy:1.25,hv:new THREE.Vector3(),heli:false};
const D={pos:new THREE.Vector3(),vel:new THREE.Vector3(),yaw:0,pitch:0,thr:.25,roll:0};
const Mn={pos:new THREE.Vector3(),yaw:0,aim:0,cy:0,t:0,fire:0,speed:0};
let jet=planes[0].g,mode='jet',curV=null,view=0,crashes=0,kills=0,snap=true,time=0;
let build=false,tool=0,brot=0,night=false,money=1000,shopOpen=false;
let paused=false,tscale=1,tIdx=0,qual=2,vol=1,wxI=0,wxA=0,tod=9,todMode=0;
const views=['Chase','Cockpit','Far'],look={y:0,p:0,drag:false};
const key={},btn={up:0,dn:0,fire:0},stick={x:0,y:0};
const touch=true; // default touch true on mobile Android app
const msg=$('msg'),h1=$('h1'),h2=$('h2'),hint=$('hint'),prompt=$('prompt');
const PAD={
 jet:['✈️ Jet',[['W','Nose up'],['S','Nose down'],['A','Turn left'],['D','Turn right'],['Shift','Speed up'],['Space','Slow down'],['C','Change camera'],['X','Eject (parachute)'],['E','Get out (on ground)'],['V','Next mode']]],
 build:['🏗️ Build',[['1 - 9','Choose tool'],['[ ]','Prev / next tool'],['R','Rotate'],['Y','Bridge shape'],['P','People (new city)'],['Enter Click','Place'],['W S A D','Fly (Space up, Shift down)'],['B','Exit build']]],
 tank:['🪖 Tank',[['W S','Forward / back'],['A D','Turn left / right'],['Shift','Faster'],['F Space','Fire the cannon'],['E','Get out'],['V','Next mode']]],
 heli:['🚁 Helicopter',[['W S','Forward / back'],['A D','Turn left / right'],['Shift','Go up'],['Space','Go down'],['F','Boost'],['C','Camera view'],['X','Eject (parachute)'],['E','Get out (landed)'],['V','Next mode']]],
 drone:['🚁 Drone',[['W S','Forward / back'],['A D','Turn left / right'],['Space','Go up'],['Shift','Go down'],['Q E','Slide'],['F','Boost'],['Drag','Look around'],['K L','Record / play camera path'],['B','Build mode'],['V','Next mode']]],
 foot:['🚶 Man',[['W S','Walk / back'],['A D','Turn left / right'],['Shift','Run'],['F Click','Shoot'],['1 - 9 Wheel','Switch weapon'],['Drag','Aim up / down'],['E','Enter vehicle or building'],['H','Go to my house'],['M','Sound on / off'],['V','Next mode']]],
 car:['🚗 Car',[['W','Forward'],['S','Back / brake'],['A','Left'],['D','Right'],['Shift','Speed boost'],['Space','Horn'],['E','Get out'],['V','Next mode']]],
 bike:['🏍️ Bike',[['W','Forward'],['S','Back / brake'],['A','Left'],['D','Right'],['Shift','Speed boost'],['Space','Horn'],['E','Get out'],['V','Next mode']]]
};
function renderPad(){if(mode!=='drone')build=false;const p=PAD[mode==='jet'&&J.heli?'heli':(mode==='drone'&&build)?'build':(mode==='car'&&curV&&curV.kind==='tank')?'tank':mode];$('pad').innerHTML='<b>'+p[0]+'</b>'+p[1].concat([['N','Day / night'],['G','Weather'],['T','Airliner service'],['U','Hide screen texts'],['Z','Slow motion'],['Esc','Menu']]).map(r=>'<div>'+r[0].split(' ').map(x=>'<span class="k">'+x+'</span>').join('')+r[1]+'</div>').join('');
  $('xh').style.display=(mode==='foot'||(mode==='drone'&&build))?'block':'none';$('tools').style.display=build?'flex':'none';$('build').style.display=mode==='drone'?'block':'none';$('build').textContent=build?'Exit build (B)':'Build mode (B)';$('mode').textContent='Next: '+(mode==='jet'?'Drone':mode==='drone'?'Man':'Jet')+' (V)'}
function showHint(t){hint.textContent=t;hint.classList.remove('off');clearTimeout(showHint.h);showHint.h=setTimeout(()=>hint.classList.add('off'),6000)}
const updVis=()=>{jet.visible=!J.dead&&!(mode==='jet'&&view===1);man.visible=mode==='foot'||mode==='bike'};
function takePlane(i){
  const p=planes[i];J.cur=i;jet=p.g;scene.add(jet);J.heli=!!p.t.heli;J.hv.set(0,0,0);jet.traverse(m=>{if(m.isMesh&&m!==p.flame)m.castShadow=true});J.top=p.t.top;J.tn=p.t.tn;J.vr=p.t.vr;J.gy=p.t.gy;
  J.pos.set(p.rest.x,J.gy,p.rest.z);J.yaw=p.rest.yaw;J.pitch=J.roll=J.speed=J.thr=0;J.ground=true;J.dead=false;J.held=true;snap=true;
  p.sol.off=true;jet.position.copy(J.pos);jet.rotation.set(0,J.yaw,0);
  fire.p.visible=smoke.p.visible=ball.visible=false;flash.intensity=0;msg.style.opacity=0;updVis();renderPad();
}
function respawn(){const p=planes[J.cur];p.rest={x:p.home.x,z:p.home.z,yaw:p.home.yaw};takePlane(J.cur)}
function exitPlane(){
  const p=planes[J.cur];p.rest={x:J.pos.x,z:J.pos.z,yaw:J.yaw};p.sol.x=J.pos.x;p.sol.z=J.pos.z;p.sol.off=false;J.held=false;
  const r=p.t.r[0]+3;Mn.pos.set(J.pos.x+Math.cos(J.yaw)*r,0,J.pos.z-Math.sin(J.yaw)*r);Mn.yaw=J.yaw;Mn.aim=0;
  mode='foot';updVis();renderPad();
}
function enterVeh(v){curV=v;mode=(v.kind==='bike'||v.kind==='jetski')?'bike':'car';Mn.speed=0;updVis();renderPad();showHint(v.kind==='car'?'Driving a car':'Riding a bike')}
function exitVeh(){const v=curV;Mn.pos.set(v.x+Math.cos(v.yaw)*3,v.y,v.z-Math.sin(v.yaw)*3);Mn.yaw=v.yaw;Mn.aim=0;v.speed=0;curV=null;mode='foot';updVis();renderPad()}
function setMode(m){
  if(m===mode)return;if(J.dead)respawn();
  const f=mode==='jet'?J.pos:mode==='drone'?D.pos:mode==='foot'?Mn.pos:P3.set(curV.x,curV.y,curV.z);
  const fx0=f.x,fy0=f.y,fz0=f.z,wasJet=mode==='jet';
  if(curV){curV.speed=0;curV=null}
  mode=m;
  if(m==='drone'){D.pos.set(fx0,Math.max(fy0,25),fz0);D.yaw=wasJet?J.yaw:Mn.yaw;D.pitch=-.2;D.vel.set(0,0,0)}
  else if(m==='foot'){
    if(wasJet&&J.ground){const r=planes[J.cur].t.r[0]+3;J.held=false;const p=planes[J.cur];p.rest={x:J.pos.x,z:J.pos.z,yaw:J.yaw};p.sol.x=J.pos.x;p.sol.z=J.pos.z;p.sol.off=false;Mn.pos.set(J.pos.x+Math.cos(J.yaw)*r,0,J.pos.z-Math.sin(J.yaw)*r)}
    else if(wasJet)Mn.pos.set(860,0,190);
    else Mn.pos.set(fx0,gy(fx0,fz0,fy0),fz0);
    Mn.yaw=wasJet?J.yaw:D.yaw;Mn.aim=0;
  }else{if(!J.held)takePlane(J.cur)}
  updVis();renderPad();showHint({jet:'Jet view: hold Shift, press W at 250 km/h to take off',drone:'Drone view: it cannot pass through buildings',foot:'Man: walk to a car, bike or jet and press E. Find the other city to the east and shoot with F.'}[m]);
}
function act(){
  if(mode==='jet'){if(J.ground&&J.speed<6&&!J.dead){exitPlane()}return}
  if(mode==='car'||mode==='bike'){exitVeh();return}
  if(mode!=='foot')return;
  if(Math.hypot(Mn.pos.x-720,Mn.pos.z-205)<10){openShop();return}
  if(intAct())return;
  let bv=null,bd=36;veh.forEach(v=>{if(v.wreck)return;const d=(v.x-Mn.pos.x)**2+(v.z-Mn.pos.z)**2;if(d<bd){bd=d;bv=v}});
  let bp=-1,pd=900;planes.forEach((p,i)=>{const d=(p.rest.x-Mn.pos.x)**2+(p.rest.z-Mn.pos.z)**2;if(d<pd){pd=d;bp=i}});
  if(bv&&(bp<0||bd<pd))enterVeh(bv);
  else if(bp>=0){takePlane(bp);mode='jet';renderPad();showHint(planes[bp].t.n+': hold Shift, press W when fast enough')}
}
function crash(why){
  if(J.dead)return;J.dead=true;J.dt=0;crashes++;jet.visible=false;J.held=false;
  burst(fire,J.pos,85,1.6,12);burst(smoke,J.pos,35,3.4,10);
  ball.position.copy(J.pos);ball.visible=true;flash.position.copy(J.pos);sfx('boom');
  cam.position.set(J.pos.x+35,J.pos.y+20,J.pos.z+45);
  msg.textContent='Boom! '+why+' Restarting on the runway...';msg.style.opacity=1;
}
renderPad();
const jetHint='Left thumb steers (drag up to climb). Buttons set speed.';
hint.textContent=jetHint;
let moved=false;const used=()=>{initAudio();if(!moved){moved=true;hint.classList.add('off')}};
const cycleMode=()=>setMode(mode==='jet'?'drone':mode==='drone'?'foot':'jet');

// inputs & collision
addEventListener('keydown',e=>{
  if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
  if(!e.repeat){if(e.code==='KeyC'&&mode==='jet'){view=(view+1)%3;updVis()}if(e.code==='KeyV')cycleMode();if(e.code==='KeyE')act();if(e.code==='KeyH')goHome();if(e.code==='KeyN')cycleTod();if(e.code==='KeyT'){aiOn=!aiOn;note('Airliner service '+(aiOn?'on':'off'))}
  if(e.code==='KeyX')bail();
  if(e.code==='KeyG'){wxI=(wxI+1)%3;note('Weather: '+['Clear','Rain','Storm'][wxI])}
  if(e.code==='KeyU')document.body.classList.toggle('nui');
  if(e.code==='KeyZ'){tIdx=(tIdx+1)%4;tscale=[1,.5,.25,.1][tIdx];note('Speed x'+tscale)}
  if(e.code==='KeyK'&&mode==='drone'){recOn=!recOn;if(recOn){camRec.length=0;recT=0}note(recOn?'Recording camera path (K to stop)':'Saved '+camRec.length+' points. Press L to play')}
  if(e.code==='KeyL'&&camRec.length>1){playT=playT>=0?-1:0;document.body.classList.toggle('nui',playT>=0)}if(mode==='foot'&&!shopOpen&&e.code.startsWith('Digit')){const n=+e.code.slice(5)-1;if(n>=0&&n<9&&owned[n])equip(n)}if(e.code==='KeyB')toggleBuild();if(e.code==='Escape'){if(shopOpen){shopOpen=false;$('shop').style.display='none'}else toggleMenu()}if(build){if(e.code.startsWith('Digit')){const n=+e.code.slice(5)-1;if(n>=0&&n<9){tool=n;renderTools()}}if(e.code==='BracketLeft'||e.code==='BracketRight'){tool=(tool+(e.code==='BracketRight'?1:12))%13;renderTools()}if(e.code==='KeyR')brot=(brot+1)%4;if(e.code==='KeyY'){shape=(shape+1)%3;note('Bridge shape: '+SH[shape]);renderTools()}if(e.code==='KeyP'){popI=(popI+1)%5;renderTools()}if(e.code==='Enter')placeObj()}if(e.code==='KeyM'&&A.m)A.m.gain.value=A.m.gain.value?0:1}
  key[e.code]=1;used();
});
addEventListener('keyup',e=>key[e.code]=0);
[['up','up'],['dn','dn'],['fire','fire']].forEach(([id,n])=>{const b=$(id);if(b){b.addEventListener('pointerdown',e=>{btn[n]=1;used();try{b.setPointerCapture(e.pointerId)}catch(ex){}});['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>btn[n]=0))}});
if($('act'))$('act').addEventListener('click',act);
[['kS','ShiftLeft'],['kP','Space']].forEach(([id,k])=>{const b=$(id);if(b){b.addEventListener('pointerdown',e=>{key[k]=1;used();try{b.setPointerCapture(e.pointerId)}catch(ex){}});['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>key[k]=0))}});
if($('ej'))$('ej').addEventListener('click',()=>bail());if($('mn'))$('mn').addEventListener('click',()=>toggleMenu());
if($('vw'))$('vw').addEventListener('click',()=>{view=(view+1)%3;updVis()});
if($('mode'))$('mode').addEventListener('click',e=>{e.stopPropagation();cycleMode()});

const bindDrive=(id,code)=>{const b=$(id);if(!b)return;b.addEventListener('pointerdown',e=>{key[code]=1;used();try{b.setPointerCapture(e.pointerId)}catch(ex){}});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>key[code]=0))};
bindDrive('btnGas','KeyW');
bindDrive('btnBrake','KeyS');
bindDrive('btnLeft','KeyA');
bindDrive('btnRight','KeyD');
bindDrive('btnBoost','ShiftLeft');
bindDrive('btnHorn','Space');
if($('btnCam'))$('btnCam').addEventListener('click',()=>{view=(view+1)%3;updVis()});
if($('btnCar'))$('btnCar').addEventListener('click',()=>act());
if($('btnMenu'))$('btnMenu').addEventListener('click',()=>toggleMenu());
if($('btnReset'))$('btnReset').addEventListener('click',()=>{if(curV){curV.speed=0;curV.x=curV.home[0];curV.z=curV.home[1];curV.yaw=curV.home[2];curV.g.position.set(curV.x,0,curV.z);curV.g.rotation.set(0,curV.yaw,0);note('Car reset to start')}});
const ring=$('ring'),cvs=renderer.domElement,ptr={};
cvs.addEventListener('pointerdown',e=>{
  used();cvs.setPointerCapture(e.pointerId);
  const m=(e.pointerType==='touch'||e.clientX<innerWidth/2)?'stick':'look';
  ptr[e.pointerId]={mode:m,x:e.clientX,y:e.clientY,ox:e.clientX,oy:e.clientY,t:performance.now(),mv:0};
  if(m==='stick'){ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';ring.style.opacity=.5}else look.drag=true;
});
cvs.addEventListener('pointermove',e=>{
  const q=ptr[e.pointerId];if(!q)return;
  if(q.mode==='look'){look.y-=(e.clientX-q.x)*.006;look.p=cl(look.p-(e.clientY-q.y)*.005,-1,1);q.mv+=Math.abs(e.clientX-q.x)+Math.abs(e.clientY-q.y);q.x=e.clientX;q.y=e.clientY}
  else{stick.x=cl((e.clientX-q.ox)/42,-1,1);stick.y=cl((e.clientY-q.oy)/42,-1,1)}
});
['pointerup','pointercancel'].forEach(ev=>cvs.addEventListener(ev,e=>{
  const q=ptr[e.pointerId];if(!q)return;
  if(q.mode==='stick'){stick.x=stick.y=0;ring.style.opacity=0}else{look.drag=false;if(q.mv<8&&performance.now()-q.t<300&&ev==='pointerup'){if(mode==='foot')shoot();else if(mode==='drone'&&build)placeObj()}}
  delete ptr[e.pointerId];
}));
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});

function hits(){
  const p=J.pos,bi=Math.floor(p.x/120),bj=Math.floor(p.z/120);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(L)for(const q of L)if(p.y<q.h+1&&Math.abs(p.x-q.x)<q.hw+1.5&&Math.abs(p.z-q.z)<q.hd+1.5)return'You hit a building!'}
  for(const q of solids)if(!q.off&&p.y<q.h+1&&p.y>q.y0-1&&Math.abs(p.x-q.x)<q.hw+1.5&&Math.abs(p.z-q.z)<q.hd+1.5)return'You hit a building!';
  if(p.y<60){
    const s=skyNear(p.x,p.z,8);if(s&&Math.abs(p.y-s.y)<3&&!(J.ground&&s.y<1))return'You hit the skyway!';
    const cx=Math.floor(p.x/50),cz=Math.floor(p.z/50);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=tmap[(cx+a+100)*1000+cz+b+100];if(L)for(const t of L)if(p.y<t[2]*4.9+1&&Math.hypot(p.x-t[0],p.z-t[1])<t[2]*1.3+2)return'You hit a tree!'}
    if(p.y<6)for(const c of cars)if(Math.abs(p.x-c.x)<3.5&&Math.abs(p.z-c.z)<3.5&&Math.abs(p.y-c.y)<5)return'You hit a car!';
    if(p.y<8)for(const c of trucks)if(Math.abs(p.x-c.x)<8&&Math.abs(p.z-c.z)<8)return'You hit a truck!';
  }
  for(const m of mts){const d=Math.hypot(p.x-m.x,p.z-m.z);if(d<m.r&&p.y<m.H*(1-d/m.r)+2)return'You hit a mountain!'}
  if(AIS.some(A=>A.g.visible&&Math.hypot(p.x-A.g.position.x,p.z-A.g.position.z)<22&&Math.abs(p.y-A.g.position.y-3)<7))return'You hit the airliner!';
  return'';
}
function resolve(p,v){
  const bi=Math.floor(p.x/120),bj=Math.floor(p.z/120),test=q=>{
    if(q.off||(q.y0&&p.y<q.y0-2.5))return;
    const dx=p.x-q.x,dz=p.z-q.z,px=q.hw+2.5-Math.abs(dx),pz=q.hd+2.5-Math.abs(dz),py=q.h+2.5-p.y;
    if(px>0&&pz>0&&py>0){if(py<px&&py<pz){p.y=q.h+2.5;if(v.y<0)v.y=0}else if(px<pz){p.x+=Math.sign(dx||1)*px;v.x=0}else{p.z+=Math.sign(dz||1)*pz;v.z=0}}
  };
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(L)L.forEach(test)}
  solids.forEach(test);
  const cx=Math.floor(p.x/50),cz=Math.floor(p.z/50);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=tmap[(cx+a+100)*1000+cz+b+100];if(L)for(const t of L){
    const dx=p.x-t[0],dz=p.z-t[1],d=Math.hypot(dx,dz)||.01,r=t[2]*1.3+2.5;
    if(d<r&&p.y<t[2]*4.9+2){p.x+=dx/d*(r-d);p.z+=dz/d*(r-d)}}}
  for(const m of mts){const d=Math.hypot(p.x-m.x,p.z-m.z);if(d<m.r){const t=m.H*(1-d/m.r)+3;if(p.y<t){p.y=t;if(v.y<0)v.y=0}}}
  const s=skyNear(p.x,p.z,8);if(s&&Math.abs(p.y-s.y)<2.5){p.y=p.y>s.y?s.y+2.5:s.y-2.5;v.y=0}
  if(p.y<2.5){p.y=2.5;if(v.y<0)v.y=0}
}
function pushXZ(p,r){
  let hit=false;const bi=Math.floor(p.x/120),bj=Math.floor(p.z/120),t=q=>{
    if(q.off||q.y0>3||p.y>q.h)return;
    const dx=p.x-q.x,dz=p.z-q.z,px=q.hw+r-Math.abs(dx),pz=q.hd+r-Math.abs(dz);
    if(px>0&&pz>0){hit=true;if(px<pz)p.x+=Math.sign(dx||1)*px;else p.z+=Math.sign(dz||1)*pz}
  };
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(L)L.forEach(t)}
  solids.forEach(t);
  const cx=Math.floor(p.x/50),cz=Math.floor(p.z/50);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=tmap[(cx+a+100)*1000+cz+b+100];if(L)for(const q of L){
    const dx=p.x-q[0],dz=p.z-q[1],d=Math.hypot(dx,dz)||.01,rr=q[2]*1.3+r;if(d<rr){hit=true;p.x+=dx/d*(rr-d);p.z+=dz/d*(rr-d)}}}
  for(const m of mts){const d=Math.hypot(p.x-m.x,p.z-m.z);if(d<m.r*.6){hit=true;const dx=p.x-m.x,dz=p.z-m.z;p.x=m.x+dx/(d||1)*m.r*.6;p.z=m.z+dz/(d||1)*m.r*.6}}
  return hit;
}
function inBuilding(x,y,z){
  const bi=Math.floor(x/120),bj=Math.floor(z/120);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(L)for(const q of L)if(y<q.h&&Math.abs(x-q.x)<q.hw&&Math.abs(z-q.z)<q.hd)return true}
  for(const q of solids)if(!q.off&&y<q.h&&y>=q.y0&&Math.abs(x-q.x)<q.hw&&Math.abs(z-q.z)<q.hd)return true;
  return false;
}
const onRunway=()=>(J.pos.x>560&&J.pos.x<2560&&Math.abs(J.pos.z)<28)||uRun.some(q=>Math.abs(J.pos.x-q.x)<q.hx&&Math.abs(J.pos.z-q.z)<q.hz);
const CN=[700,1040,1380,1900,2400];
const onPave=()=>{const x=J.pos.x,z=J.pos.z;return onRunway()||(x>560&&x<2400&&Math.abs(z-60)<10)||(Math.abs(z-30)<24&&CN.some(c=>Math.abs(x-c)<10))||(x>725&&x<1035&&z>55&&z<160)||(x>1430&&x<1770&&z>55&&z<160)||(x>540&&x<2400&&z<-45&&z>-75)||(x>690&&x<1400&&z<-45&&z>-135)||(z<-14&&z>-55&&CN.some(c=>Math.abs(x-c)<11))};

// simulation loops
const fw=new THREE.Vector3(),off=new THREE.Vector3(),camT=new THREE.Vector3(),eul=new THREE.Euler(0,0,0,'YXZ'),qq=new THREE.Quaternion(),dtg=new THREE.Vector3();
function heliStep(dt){
  const f=(key.KeyW?1:0)-(key.KeyS?1:0)-stick.y,turn=(key.KeyD||key.ArrowRight?1:0)-(key.KeyA||key.ArrowLeft?1:0)+stick.x,u=(key.ShiftLeft||key.ShiftRight?1:0)-(key.Space?1:0)+btn.up-btn.dn;
  J.yaw-=turn*1.2*dt;const sp=45*(key.KeyF?1.7:1);
  dtg.set(-Math.sin(J.yaw)*f*sp,u*14,-Math.cos(J.yaw)*f*sp);J.hv.lerp(dtg,1-Math.exp(-dt*1.6));
  if(J.ground&&u<=0){J.hv.x*=.8;J.hv.z*=.8}
  J.pos.addScaledVector(J.hv,dt);J.speed=Math.hypot(J.hv.x,J.hv.z);
  if(J.pos.y<=J.gy){if(J.hv.y<-9)crash('Hard landing!');else{J.pos.y=J.gy;if(J.hv.y<0)J.hv.y=0;J.ground=true}}else J.ground=false;
  J.pos.x=cl(J.pos.x,-5200,5200);J.pos.z=cl(J.pos.z,-5600,3600);if(J.pos.y>3000)J.pos.y=3000;
  if(!J.dead){const w=hits();if(w)crash(w)}
  J.pitch+=(-f*.22-J.pitch)*Math.min(1,dt*3);J.roll+=(-turn*.3-J.roll)*Math.min(1,dt*3);
  jet.position.copy(J.pos);jet.rotation.set(J.pitch,J.yaw,J.roll);
  const rot=planes[J.cur].rotor;if(rot)rot.rotation.y+=dt*(J.ground&&u<=0?10:34);
}
function jetStep(dt){
  if(J.dead)return;
  if(J.heli){heliStep(dt);return}
  const turn=cl((key.KeyD||key.ArrowRight?1:0)-(key.KeyA||key.ArrowLeft?1:0)+stick.x,-1,1);
  const pit=cl((key.KeyW||key.ArrowUp?1:0)-(key.KeyS||key.ArrowDown?1:0)-stick.y,-1,1);
  J.thr=cl(J.thr+((key.ShiftLeft||key.ShiftRight?1:0)-(key.Space?1:0)+btn.up-btn.dn)*.4*dt,0,1);
  const acc=cl((J.thr*J.top-J.speed)*.6,-35,J.ground?12:40);
  J.speed=cl(J.speed+acc*dt-Math.sin(J.pitch)*(J.ground?0:60)*dt,0,J.top+20);
  const f=cl(J.speed/90,.25,1),tn=J.tn;
  if(J.ground){
    J.yaw-=turn*(.3+.4*cl(J.speed/25,0,1))*dt;J.roll*=.9;
    J.pitch=J.speed>=J.vr?cl(J.pitch+pit*.5*dt,0,.5):0;
    if(J.speed>=J.vr&&J.pitch>.05){J.ground=false;J.pos.y=J.gy+.1}
  }
  if(!J.ground){
    J.yaw-=turn*tn*f*dt;J.roll+=(-turn*tn*f-J.roll)*Math.min(1,dt*4);
    J.pitch=cl(J.pitch+pit*.8*f*(tn/.9)*dt-(J.speed<J.vr-3?(J.vr-3-J.speed)/(J.vr-3)*.7*dt:0),-1.35,1.35);
  }
  const n=Math.min(6,Math.ceil(J.speed*dt/4)||1),h=dt/n;
  for(let s=0;s<n&&!J.dead;s++){
    fw.set(-Math.sin(J.yaw)*Math.cos(J.pitch),Math.sin(J.pitch),-Math.cos(J.yaw)*Math.cos(J.pitch));
    J.pos.addScaledVector(fw,J.speed*h);
    J.pos.x=cl(J.pos.x,-5200,5200);J.pos.z=cl(J.pos.z,-5600,3600);if(J.pos.y>4000)J.pos.y=4000;
    if(J.ground){J.pos.y=J.gy;if(J.speed>3&&!onPave())crash('You left the pavement!')}
    else if(J.pos.y<=J.gy){
      const vy=J.speed*Math.sin(J.pitch);
      if(onRunway()&&vy>-14&&J.pitch<.35&&J.pitch>-.12&&Math.abs(J.roll)<.3){J.ground=true;J.pitch=0;J.roll=0;J.pos.y=J.gy}
      else crash(onRunway()?'Hard landing!':'You hit the ground!');
    }
    if(!J.dead){const w=hits();if(w)crash(w)}
  }
  jet.position.copy(J.pos);jet.rotation.set(J.pitch,J.yaw,J.roll);
  const fl=planes[J.cur].flame;if(fl)fl.scale.set(1,1,.2+J.thr*1.4);
}
function droneStep(dt){
  const f=(key.KeyW?1:0)-(key.KeyS?1:0)-stick.y,turn=(key.KeyA||key.ArrowLeft?1:0)-(key.KeyD||key.ArrowRight?1:0)-stick.x,
    sd=(key.KeyE?1:0)-(key.KeyQ?1:0),u=(key.Space?1:0)-(key.ShiftLeft||key.ShiftRight?1:0)+btn.up-btn.dn;
  D.yaw+=turn*1.6*dt+look.y;look.y=0;
  D.pitch=cl(D.pitch+look.p+((key.ArrowUp?1:0)-(key.ArrowDown?1:0))*dt,-1.4,1.4);look.p=0;
  const cp=Math.cos(D.pitch),fx0=-Math.sin(D.yaw)*cp,fy0=Math.sin(D.pitch),fz0=-Math.cos(D.yaw)*cp,rx=Math.cos(D.yaw),rz=-Math.sin(D.yaw);
  const sp=(25+Math.max(0,D.pos.y)*.25)*(key.KeyF?3:1);
  dtg.set((fx0*f+rx*sd)*sp,(fy0*f+u*.6)*sp,(fz0*f+rz*sd)*sp);
  D.vel.lerp(dtg,1-Math.exp(-dt*3));D.pos.addScaledVector(D.vel,dt);
  D.pos.x=cl(D.pos.x,-5200,5200);D.pos.z=cl(D.pos.z,-5600,3600);if(D.pos.y>1500)D.pos.y=1500;
  resolve(D.pos,D.vel);
}
function aimDir(out){const cp=Math.cos(Mn.aim),yw=Mn.yaw+Mn.cy;return out.set(-Math.sin(yw)*cp,Math.sin(Mn.aim),-Math.cos(yw)*cp)}
const sd3=new THREE.Vector3();
function shoot(){
  if(mode!=='foot'||shopOpen)return;
  if(GUN.type){launch(GUN);return}
  cam.getWorldDirection(T3);const org=cam.position,mx=Mn.pos.x-Math.sin(Mn.yaw)*.8,mz=Mn.pos.z-Math.cos(Mn.yaw)*.8;let ex=0,ey=0,ez=0;
  for(let k2=0;k2<GUN.pel;k2++){
    sd3.set(T3.x+(Math.random()-.5)*GUN.spread*2,T3.y+(Math.random()-.5)*GUN.spread*2,T3.z+(Math.random()-.5)*GUN.spread*2).normalize();
    let best=null,bt=GUN.range;
    peds.forEach(p=>{if(p.d>0)return;for(const hy of[1,1.55]){const wx=p.cx-org.x,wy=hy-org.y,wz=p.cz-org.z,t=wx*sd3.x+wy*sd3.y+wz*sd3.z;if(t<2||t>bt)continue;const d2=wx*wx+wy*wy+wz*wz-t*t;if(d2<1.2){best=p;bt=t;break}}});
    let end=bt<GUN.range?bt:Math.min(GUN.range,160);
    for(let s2=3;s2<end;s2+=2.5)if(inBuilding(org.x+sd3.x*s2,org.y+sd3.y*s2,org.z+sd3.z*s2)){end=s2;best=null;break}
    if(best){best.d=.01;best.fy=best.cy;kills++;money+=150;crime();note('Hit! +$150')}
    if(k2===0){ex=org.x+sd3.x*end;ey=org.y+sd3.y*end;ez=org.z+sd3.z*end}
  }
  const pa=tracer.geometry.attributes.position;pa.setXYZ(0,mx,Mn.pos.y+1.35,mz);pa.setXYZ(1,ex,ey,ez);pa.needsUpdate=true;
  tracer.visible=true;Mn.tr=.06;sfx('gun');mflash.position.set(mx,Mn.pos.y+1.4,mz);mflash.intensity=4;
}
function footStep(dt){
  if(shopOpen)return;
  if(Mn.air){
    Mn.at+=dt;const f0=(key.KeyW?1:0)-(key.KeyS?1:0)-stick.y,tn=(key.KeyA||key.ArrowLeft?1:0)-(key.KeyD||key.ArrowRight?1:0)-stick.x;
    if(!Mn.chute&&(Mn.at>1.6||key.Space)){Mn.chute=true;note('Parachute open')}
    Mn.yaw+=tn*1.2*dt;Mn.vy+=((Mn.chute?-6:-48)-Mn.vy)*Math.min(1,dt*(Mn.chute?1.5:.4));Mn.hv*=Math.exp(-dt*(Mn.chute?.5:.15));
    const sp2=Mn.hv+f0*(Mn.chute?10:3);Mn.pos.x+=-Math.sin(Mn.yaw)*sp2*dt;Mn.pos.z+=-Math.cos(Mn.yaw)*sp2*dt;Mn.pos.y+=Mn.vy*dt;pushXZ(Mn.pos,.6);
    chute.visible=Mn.chute;chute.position.copy(Mn.pos);chute.rotation.y=Mn.yaw;man.position.copy(Mn.pos);man.rotation.y=Mn.yaw;man.userData.ll.rotation.x=.3;man.userData.lr.rotation.x=.3;
    const g0=gy(Mn.pos.x,Mn.pos.z,Mn.pos.y+5);
    if(Mn.pos.y<=g0){chute.visible=false;Mn.air=0;Mn.pos.y=g0;
      if(!Mn.chute&&Mn.vy<-25){note('You hit the ground too hard');money=Math.max(0,money-200);tp(-1260,-835)}else note('Landed safely');
      if(Mn.pos.z>332&&!(Mn.pos.x>-712&&Mn.pos.x<-288))Mn.pos.z=312}
    return;
  }
  const f=(key.KeyW?1:0)-(key.KeyS?1:0)-stick.y,turn=(key.KeyA||key.ArrowLeft?1:0)-(key.KeyD||key.ArrowRight?1:0)-stick.x;
  Mn.yaw+=turn*2.2*dt;Mn.cy+=look.y;look.y=0;Mn.cy*=Math.exp(-dt*1.5);
  Mn.aim=cl(Mn.aim+look.p+((key.ArrowUp?1:0)-(key.ArrowDown?1:0))*dt,-.6,.7);look.p=0;
  const sp=(key.ShiftLeft||key.ShiftRight?7.5:3.4)*(f<0?.6:1);
  Mn.pos.x+=-Math.sin(Mn.yaw)*f*sp*dt;Mn.pos.z+=-Math.cos(Mn.yaw)*f*sp*dt;
  pushXZ(Mn.pos,.6);if(Mn.pos.y>3)deckClamp(Mn.pos);Mn.pos.y=gy(Mn.pos.x,Mn.pos.z,Mn.pos.y);
  Mn.pos.x=cl(Mn.pos.x,-5200,5200);Mn.pos.z=cl(Mn.pos.z,-5600,3600);
  Mn.t+=dt*sp*2.4*Math.abs(f);const sw=Math.sin(Mn.t)*.8*Math.min(1,Math.abs(f));
  man.userData.ll.rotation.x=sw;man.userData.lr.rotation.x=-sw;man.userData.la.rotation.x=-sw;
  man.position.copy(Mn.pos);man.rotation.y=Mn.yaw;
  Mn.fire-=dt;if((key.KeyF||btn.fire)&&Mn.fire<=0){shoot();Mn.fire=GUN.rate}
}
function driveStep(dt){
  const v=curV,car=!!CARLIKE[v.kind],tank=v.kind==='tank',f=(key.KeyW?1:0)-(key.KeyS?1:0)-stick.y,turn=(key.KeyA||key.ArrowLeft?1:0)-(key.KeyD||key.ArrowRight?1:0)-stick.x,boost=key.ShiftLeft||key.ShiftRight;
  const top=VS[v.kind][0]*(boost?(tank?1.5:1.7):1);sirenOn=!!(key.Space&&(v.kind==='ambulance'||v.kind==='police'));if(key.Space&&!v.horn&&!tank&&!sirenOn){v.horn=1;sfx('horn')}if(!key.Space)v.horn=0;
  if(tank){v.reload=(v.reload||0)-dt;if((key.KeyF||key.Space||btn.fire)&&v.reload<=0){fireShell(v);v.reload=1.2}}
  if(f>0)v.speed+=f*VS[v.kind][1]*(boost?1.6:1)*dt;else if(f<0)v.speed+=f*(v.speed>0?24:9)*dt;else v.speed*=Math.exp(-dt*.5);
  v.speed=cl(v.speed,-9,top);
  v.yaw+=turn*VS[v.kind][2]*cl(v.speed/6,-1,1)*dt;
  P3.set(v.x,v.y,v.z);P3.x+=-Math.sin(v.yaw)*v.speed*dt;P3.z+=-Math.cos(v.yaw)*v.speed*dt;
  if(tank)killTree(P3.x-Math.sin(v.yaw)*3,P3.z-Math.cos(v.yaw)*3);
  if(pushXZ(P3,tank?3.4:car?2.2:1)){hitV(v,Math.abs(v.speed));v.speed*=.35}
  for(const c of cars){if(Math.abs(c.y-v.y)>3)continue;const dx=P3.x-c.x,dz=P3.z-c.z,d=Math.hypot(dx,dz),r=car?4.4:3.4;if(d<r&&d>.01){P3.x+=dx/d*(r-d);P3.z+=dz/d*(r-d);hitV(v,Math.abs(v.speed)*.7);v.speed*=.5;c.hold=1.2}}
  for(const c of trucks)for(const q of[-4,0,4]){const dx=P3.x-(c.x+(c.v?0:q)),dz=P3.z-(c.z+(c.v?q:0)),d=Math.hypot(dx,dz),r=car?4.6:3.8;if(d<r&&d>.01){P3.x+=dx/d*(r-d);P3.z+=dz/d*(r-d);hitV(v,Math.abs(v.speed)*.7);v.speed*=.5;c.hold=1.2}}
  for(const o2 of veh){if(o2===v)continue;const dx=P3.x-o2.x,dz=P3.z-o2.z,d=Math.hypot(dx,dz);if(d<3.4&&d>.01){P3.x+=dx/d*(3.4-d);P3.z+=dz/d*(3.4-d);v.speed*=.5}}
  if(v.y>3&&deckClamp(P3))v.speed*=.7;
  const wat=v.kind==='boat'||v.kind==='jetski';if(wat&&(P3.z<318||(P3.x>-712&&P3.x<-288&&P3.z<398))){P3.x=v.x;P3.z=v.z;v.speed*=.3}
  v.x=P3.x;v.z=P3.z;v.y=wat?-.3+Math.sin(time*2.2)*.08:gy(v.x,v.z,v.y);
  v.g.position.set(v.x,v.y,v.z);v.g.rotation.set(0,v.yaw,(v.kind==='bike'||v.kind==='jetski')?-turn*.3*cl(v.speed/20,0,1):0,'YXZ');
  v.g.userData.w.forEach(w=>w.rotation.x-=v.speed*dt/v.rad);
  if(!car){man.position.set(v.x,v.y+.25,v.z);man.rotation.y=v.yaw;man.userData.ll.rotation.x=-.9;man.userData.lr.rotation.x=-.9}
}

// world update & rendering
let anim=0;
function worldStep(dt){
  const foc=mode==='foot'?Mn.pos:(mode==='car'||mode==='bike')?curV:null;
  const phs=time%16,sg0=phs<7?0:phs<8?1:phs<15?2:3,gV=sg0===0,gH=sg0===2;
  if(sg0!==sigS)setSignals(sg0);
  {const fl=Math.floor(time*4)%2;for(let i=0;i<14;i++){PLB.setColorAt(i*2,cs.set(fl?0xff2020:0x300000));PLB.setColorAt(i*2+1,cs.set(fl?0x000030:0x2060ff))}if(PLB.instanceColor)PLB.instanceColor.needsUpdate=true}
  const hold=c=>{
    if(ROADN&&!c.rail){const pre=(c.v?'V':'H')+c.line/120+':',k0=Math.floor(c.t/120);
      if(ROADOFF[pre+k0]){flip(c);c.t=c.dir>0?(k0+1)*120+4:k0*120-4}
      else if(((c.dir>0?k0+1:k0)*120-c.t)*c.dir<16&&ROADOFF[pre+(k0+c.dir)])flip(c)}
    if(c.hold>0){c.hold-=dt;return true}
    const d=((c.dir>0?Math.ceil(c.t/120):Math.floor(c.t/120))*120-c.t)*c.dir;
    if(!(c.v?gV:gH)&&d>=12&&d<=(c.tr?24:17))return true;
    for(const q of lanes[c.lk]){if(q===c)continue;const a=(q.t-c.t)*c.dir;if(a>0&&a<(c.tr?18:9))return true}
    if(foc){const dx=foc.x-c.x,dz=foc.z-c.z,fx=c.v?0:c.dir,fz=c.v?c.dir:0,ah=dx*fx+dz*fz;if(ah>0&&ah<(c.tr?14:8)&&Math.abs(dx*fz-dz*fx)<3)return true}
    return false;
  };
  cars.forEach((c,i)=>{
    if(c.gone){tm.makeScale(0,0,0);body.setMatrixAt(i,tm);cab.setMatrixAt(i,tm);for(let w=0;w<4;w++)wc.setMatrixAt(i*4+w,tm);hlt.setMatrixAt(i*2,tm);hlt.setMatrixAt(i*2+1,tm);return}
    if(c.rail||!hold(c))c.t+=c.dir*c.sp*dt;let yaw,pit=0;
    if(c.rail){
      if(c.rail.pp){if(c.t>c.L){c.t=c.L;c.dir=-1;c.off=-4}else if(c.t<0){c.t=0;c.dir=1;c.off=4}}else{if(c.t>c.L)c.t-=c.L;if(c.t<0)c.t+=c.L}
      const u=c.t/c.L;c.rail.getPointAt(u,P3);c.rail.getTangentAt(u,T3);
      c.x=P3.x-T3.z*c.off;c.z=P3.z+T3.x*c.off;c.y=(c.rail.ug?P3.y:Math.max(0,P3.y))+.1;yaw=Math.atan2(-T3.x*c.dir,-T3.z*c.dir);pit=Math.asin(cl(T3.y*c.dir,-1,1));
    }else{
      if(c.t>c.hi){c.t=c.hi-1;flip(c)}if(c.t<c.lo){c.t=c.lo+1;flip(c)}
      c.x=c.v?c.lane:c.t;c.z=c.v?c.t:c.lane;c.y=0;yaw=c.v?(c.dir>0?Math.PI:0):(c.dir>0?-Math.PI/2:Math.PI/2);
    }
    o.position.set(c.x,c.y+.62,c.z);o.rotation.set(pit,yaw,0);o.scale.set(1,1,1);o.updateMatrix();
    body.setMatrixAt(i,o.matrix);place(cab,i,o.matrix,0,.63,.2,1);
    for(let w=0;w<4;w++)place(wc,i*4+w,o.matrix,w&1?.95:-.95,-.24,w&2?1.35:-1.35,1);
    place(hlt,i*2,o.matrix,-.65,.05,-2.12,1);place(hlt,i*2+1,o.matrix,.65,.05,-2.12,1);
    if(i<14){place(PLB,i*2,o.matrix,-.4,1.68,.2,1);place(PLB,i*2+1,o.matrix,.4,1.68,.2,1)}
  });
  body.instanceMatrix.needsUpdate=cab.instanceMatrix.needsUpdate=wc.instanceMatrix.needsUpdate=hlt.instanceMatrix.needsUpdate=PLB.instanceMatrix.needsUpdate=true;
  trucks.forEach((c,i)=>{
    if(!hold(c))c.t+=c.dir*c.sp*dt;if(c.t>c.hi){c.t=c.hi-1;flip(c)}if(c.t<c.lo){c.t=c.lo+1;flip(c)}
    c.x=c.v?c.lane:c.t;c.z=c.v?c.t:c.lane;
    o.position.set(c.x,2.45,c.z);o.rotation.set(0,c.v?0:Math.PI/2,0);o.scale.set(1,1,1);o.updateMatrix();
    tb.setMatrixAt(i,o.matrix);const q=c.dir*7.8;place(tc,i,o.matrix,0,-.35,q,1);
    [-c.dir*4.5,-c.dir*3.1,q].forEach((z,j)=>{place(wt,i*6+j*2,o.matrix,-1.65,-1.88,z,1.5);place(wt,i*6+j*2+1,o.matrix,1.65,-1.88,z,1.5)});
  });
  tb.instanceMatrix.needsUpdate=tc.instanceMatrix.needsUpdate=wt.instanceMatrix.needsUpdate=true;
  o.rotation.set(0,0,0);
  peds.forEach((p,i)=>{
    if(p.d>0){p.d+=dt;if(p.d>9)p.d=0}
    let sw=0;
    if(p.d>0){if(p.d<5){o.position.set(p.cx,.3,p.cz);o.rotation.set(0,p.fy,Math.PI/2)}else{o.position.set(0,-80,0);o.rotation.set(0,0,0)}}
    else{
      const w=(time*p.sp/p.L+p.ph)%2,u=w<1?w:2-w,sg=w<1?1:-1;
      p.cx=p.x0+(p.x1-p.x0)*u;p.cz=p.z0+(p.z1-p.z0)*u;p.cy=Math.atan2((p.x1-p.x0)*sg,(p.z1-p.z0)*sg);
      o.position.set(p.cx,0,p.cz);o.rotation.set(0,p.cy,0);sw=Math.sin(time*6+p.ph*5)*.6;
    }
    o.updateMatrix();(p.cr||crowdB).set(p.ci!==undefined?p.ci:i,o.matrix,sw);
  });
  o.rotation.set(0,0,0);crowds.forEach(c=>c.up());
  clouds.forEach((c,i)=>{c.position.x+=dt*(4+i*.2);if(c.position.x>4200)c.position.x=-4200});
  if(Mn.tr>0){Mn.tr-=dt;if(Mn.tr<=0)tracer.visible=false}
  mflash.intensity=Math.max(0,mflash.intensity-dt*60);
  vehParked();parkStep(dt);airStep(dt);projStep(dt);shipStep(dt);monoStep(dt);sirenStep();damageStep(dt);
}
function vehParked(){veh.forEach(v=>{if(v!==curV){v.g.userData.w.length}})}
function chase(px,py,pz,yaw,dist,hgt,dt){
  eul.set(.12+look.p*0,yaw+look.y,0);off.set(0,hgt,dist).applyEuler(eul);camT.set(px+off.x,py+off.y,pz+off.z);
  if(snap)cam.position.copy(camT);else cam.position.lerp(camT,1-Math.exp(-dt*8));
  cam.up.set(0,1,0);cam.lookAt(px,py+1.2,pz);look.y*=Math.exp(-dt*2);
}
function camStep(dt){
  if(playT>=0&&camRec.length>1){
    playT+=dt;const f=playT/.35,i=Math.floor(f);
    if(i>=camRec.length-1){playT=-1;document.body.classList.remove('nui')}
    else{const a=camRec[i],b=camRec[i+1],u=f-i;let dy=b[3]-a[3];dy=Math.atan2(Math.sin(dy),Math.cos(dy));
      cam.position.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u);cam.rotation.set(a[4]+(b[4]-a[4])*u,a[3]+dy*u,0);
      if(cam.fov!==72){cam.fov=72;cam.updateProjectionMatrix()}return}
  }
  if(mode==='jet'&&J.dead){cam.lookAt(J.pos.x,J.pos.y+6,J.pos.z);cam.position.x+=(Math.random()-.5)*Math.max(0,1-J.dt)*1.2;return}
  if(mode==='drone'){cam.position.copy(D.pos);cam.rotation.set(D.pitch,D.yaw,0);if(cam.fov!==72){cam.fov=72;cam.updateProjectionMatrix()}return}
  if(mode==='foot'){
    aimDir(fw);eul.set(Mn.aim,Mn.yaw+Mn.cy,0);off.set(.8,.5,Mn.inside?2.2:4).applyEuler(eul);
    cam.position.set(Mn.pos.x+off.x,Mn.pos.y+1.6+off.y,Mn.pos.z+off.z);
    cam.lookAt(Mn.pos.x+fw.x*30,Mn.pos.y+1.5+fw.y*30,Mn.pos.z+fw.z*30);
    if(cam.fov!==(GUN.zoom?35:70)){cam.fov=GUN.zoom?35:70;cam.updateProjectionMatrix()}return;
  }
  if(mode==='car'||mode==='bike'){chase(curV.x,curV.y+.4,curV.z,curV.yaw,curV.kind==='tank'?13:mode==='car'?9:6.5,curV.kind==='tank'?5.5:mode==='car'?3.8:2.8,dt);snap=false;look.y*=1;if(cam.fov!==68){cam.fov=68;cam.updateProjectionMatrix()}return}
  const t=planes[J.cur].t,sf=t.sc/.6;
  fw.set(-Math.sin(J.yaw)*Math.cos(J.pitch),Math.sin(J.pitch),-Math.cos(J.yaw)*Math.cos(J.pitch));
  if(view===1){
    eul.set(J.pitch,J.yaw,J.roll);qq.setFromEuler(eul);off.set(0,.8*sf,-2.2*sf).applyQuaternion(qq);
    cam.position.copy(J.pos).add(off);cam.quaternion.copy(qq);
  }else{
    if(!look.drag){look.y*=Math.exp(-dt*2);look.p*=Math.exp(-dt*2)}
    const d=view===0?[4*sf,16*sf]:[16*sf,50*sf];
    eul.set(J.pitch*.6+look.p,J.yaw+look.y,0);off.set(0,d[0],d[1]).applyEuler(eul);camT.copy(J.pos).add(off);
    if(snap)cam.position.copy(camT);else cam.position.lerp(camT,1-Math.exp(-dt*12));
    cam.up.set(0,1,0);cam.lookAt(J.pos.x+fw.x*20,J.pos.y+fw.y*20+2,J.pos.z+fw.z*20);cam.rotateZ(J.roll*.25);
  }
  snap=false;
  const fv=62+J.speed/220*14;if(Math.abs(cam.fov-fv)>.05){cam.fov=fv;cam.updateProjectionMatrix()}
}
function promptStep(){
  let t='';
  if(mode==='foot'){
    let bv=null,bd=36;veh.forEach(v=>{if(v.wreck)return;const d=(v.x-Mn.pos.x)**2+(v.z-Mn.pos.z)**2;if(d<bd){bd=d;bv=v}});
    let bp=-1,pd=900;planes.forEach((p,i)=>{const d=(p.rest.x-Mn.pos.x)**2+(p.rest.z-Mn.pos.z)**2;if(d<pd){pd=d;bp=i}});
    if(bv&&(bp<0||bd<pd))t='Press E to '+VN[bv.kind];else if(bp>=0)t='Press E to fly the '+planes[bp].t.n;
  }
  if(mode==='foot'&&!shopOpen&&Math.hypot(Mn.pos.x-720,Mn.pos.z-205)<10)t='Press E to open the gun shop';
  if(mode==='foot'&&!shopOpen&&!Mn.air)t=intPrompt(t);prompt.textContent=t;prompt.style.opacity=t?1:0;
}

function setNight(on){todMode=on?2:1;tod=on?0:12}
function cycleTod(){todMode=(todMode+1)%3;if(todMode===1)tod=12;if(todMode===2)tod=0;note('Time: '+['Auto cycle','Day','Night'][todMode])}
$('night').addEventListener('click',e=>{e.stopPropagation();cycleTod()});

// Builder & tools
const uRun=[],userObjs=[],parkAnims=[],parkWalk=[],cursor=new THREE.Vector3();let cursorOk=false,shape=0,popI=2;
const userRec=[],removedB=[],removedT=[],SH=['Straight','Curve left','Curve right'];let quiet=false,replaying=false;
const pgeo=new THREE.BufferGeometry(),pline=new THREE.Line(pgeo,new THREE.LineBasicMaterial({color:0xffee33}));pline.frustumCulled=false;pline.visible=false;scene.add(pline);
const POPS=[0,50,100,200,400];
const TOOLS=[['Road','🛣️'],['Flyover','🌉'],['Foot bridge','🚶'],['Zebra','🦓'],['Widen road','↔️'],['House','🏠'],['Tower','🏢'],['Park + swings','🎠'],['New area','🏘️'],['New city','🏙️'],['Hangar','🛩️'],['Runway','🛫'],['Remove','🗑️']];
const GS=[[120,.4,24],[120,.5,14],[66,.5,4],[6,.3,24],[120,.4,12],[20,8,20],[26,60,26],[90,.4,90],[100,.4,100],[360,.4,360],[60,16,40],[240,.4,40],[8,30,8]];
const ghost=new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),new THREE.MeshBasicMaterial({color:0x44ff88,transparent:true,opacity:.4,depthWrite:false}));ghost.visible=false;scene.add(ghost);
const zero=new THREE.Matrix4().makeScale(0,0,0),fbMat=new THREE.MeshLambertMaterial({color:0xb0b4b8,side:THREE.DoubleSide});
const zc=document.createElement('canvas');zc.width=16;zc.height=64;{const x=zc.getContext('2d');x.fillStyle='#f4f4f4';for(let y=2;y<64;y+=8)x.fillRect(0,y,16,5)}
const zebraMat=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(zc),transparent:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-24,depthWrite:false});
function note(t){if(quiet)return;msg.textContent=t;msg.style.opacity=1;clearTimeout(note.h);note.h=setTimeout(()=>{if(!J.dead)msg.style.opacity=0},2200)}
function killBuilding(x,z){
  const bi=Math.floor(x/120),bj=Math.floor(z/120);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(!L)continue;
    for(const q of L){if(q.g&&Math.abs(x-q.x)<q.hw+4&&Math.abs(z-q.z)<q.hd+4){const g=q.g;
      for(let i=g.b0;i<g.b1;i++)BM.setMatrixAt(i,zero);for(let i=g.r0;i<g.r1;i++)RM.setMatrixAt(i,zero);for(let i=g.d0;i<g.d1;i++)DM.setMatrixAt(i,zero);
      BM.instanceMatrix.needsUpdate=RM.instanceMatrix.needsUpdate=DM.instanceMatrix.needsUpdate=true;
      for(let k2=L.length-1;k2>=0;k2--)if(L[k2].g===g)L.splice(k2,1);if(!replaying)removedB.push([x,z]);return true}}}
  return false;
}
function killTree(x,z){
  const cx=Math.floor(x/50),cz=Math.floor(z/50);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=tmap[(cx+a+100)*1000+cz+b+100];if(!L)continue;
    for(let i=0;i<L.length;i++){const t=L[i];if(t[3]!==undefined&&Math.hypot(t[0]-x,t[1]-z)<t[2]*1.5+4){crown.setMatrixAt(t[3],zero);trunk.setMatrixAt(t[3],zero);crown.instanceMatrix.needsUpdate=trunk.instanceMatrix.needsUpdate=true;L.splice(i,1);if(!replaying)removedT.push([x,z]);return true}}}
  return false;
}
function killRoad(x,z){
  const li=Math.round(x/120),lj=Math.round(z/120),kz=Math.floor(z/120),kx=Math.floor(x/120);let key=null;
  if(Math.abs(x-li*120)<14&&SEGI['V'+li+':'+kz])key='V'+li+':'+kz;else if(Math.abs(z-lj*120)<14&&SEGI['H'+lj+':'+kx])key='H'+lj+':'+kx;
  if(!key||ROADOFF[key])return false;
  const[m,i]=SEGI[key];m.setMatrixAt(i,zero);m.instanceMatrix.needsUpdate=true;ROADOFF[key]=1;ROADN++;const si=SWI[key];if(si!==undefined&&SWM){SWM.setMatrixAt(si,zero);SWM.setMatrixAt(si+1,zero);SWM.instanceMatrix.needsUpdate=true}return true;
}
const inRect=(x,z,cx,cz,a,hl,hw)=>{const dx=x-cx,dz=z-cz,c=Math.cos(a),s2=Math.sin(a);return Math.abs(dx*c+dz*s2)<hl&&Math.abs(-dx*s2+dz*c)<hw};
function clearArea(cx,cz,a,hl,hw){
  const r=hl+hw,arr=wl.geometry.attributes.position.array;let n=0;
  for(const p of POLES){if(!p.gone&&inRect(p.x,p.z,cx,cz,a,hl,hw)){p.gone=1;pm.setMatrixAt(p.id,zero);pa2.setMatrixAt(p.id,zero);p.w.forEach(o2=>{for(let k2=0;k2<24;k2++)arr[o2+k2]=0});n++}}
  pm.instanceMatrix.needsUpdate=pa2.instanceMatrix.needsUpdate=true;wl.geometry.attributes.position.needsUpdate=true;
  for(let a2=Math.floor((cx-r)/50);a2<=Math.floor((cx+r)/50);a2++)for(let b2=Math.floor((cz-r)/50);b2<=Math.floor((cz+r)/50);b2++){
    const L=tmap[(a2+100)*1000+b2+100];if(!L)continue;
    for(let i=L.length-1;i>=0;i--){const t=L[i];if(t[3]!==undefined&&inRect(t[0],t[1],cx,cz,a,hl+2,hw+2)){crown.setMatrixAt(t[3],zero);trunk.setMatrixAt(t[3],zero);L.splice(i,1);n++}}}
  crown.instanceMatrix.needsUpdate=trunk.instanceMatrix.needsUpdate=true;return n;
}
function userSolid(x,z,hw,hd,h){const q={x,z,hw,hd,h,y0:0};solids.push(q);return q}
function delObj(ob){
  if(ob.rec){const i=userRec.indexOf(ob.rec);if(i>=0)userRec.splice(i,1)}
  ob.parts.forEach(m=>scene.remove(m));ob.sol.forEach(q=>{const i=solids.indexOf(q);if(i>=0)solids.splice(i,1)});
  ob.trees.forEach(t=>{const L=tmap[tk(t[0],t[1])];if(L){const i=L.indexOf(t);if(i>=0)L.splice(i,1)}});
  if(ob.run){const i=uRun.indexOf(ob.run);if(i>=0)uRun.splice(i,1)}
  if(ob.deck){const i=decks.indexOf(ob.deck);if(i>=0)decks.splice(i,1)}
  if(ob.cars)ob.cars.forEach(c=>{c.gone=true;c.x=1e9});
  for(let i=parkAnims.length-1;i>=0;i--)if(parkAnims[i].ob===ob)parkAnims.splice(i,1);
  for(let i=parkWalk.length-1;i>=0;i--)if(parkWalk[i].ob===ob)parkWalk.splice(i,1);
  if(ob.peds)ob.peds.forEach(p=>{const i=peds.indexOf(p);if(i>=0)peds.splice(i,1)});
  if(ob.crowd){const i=crowds.indexOf(ob.crowd);if(i>=0)crowds.splice(i,1);for(const k2 of['torso','head','hair','legs','arms'])scene.remove(ob.crowd[k2])}
}
function addTree(ob,x,z,sz){
  const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,1.6,5).translate(0,.8,0),M(0x7a5638)),new THREE.Mesh(new THREE.ConeGeometry(1.2,3.4,6).translate(0,3,0),M(0x3f7d4a)));
  g.scale.setScalar(sz);g.position.set(x,0,z);g.traverse(m=>{if(m.isMesh)m.castShadow=true});scene.add(g);ob.parts.push(g);
  const t=[x,z,sz];ob.trees.push(t);(tmap[tk(x,z)]=tmap[tk(x,z)]||[]).push(t);
}
function addHouse(ob,x,z,a){
  const w=14+R()*8,d=14+R()*8,h=5+R()*6,g=new THREE.Group(),c=pal[Math.floor(R()*pal.length)],rc2=roofC[Math.floor(R()*roofC.length)],sw2=Math.round(a/(Math.PI/2))%2===1;
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));b.position.y=h/2;
  const rf=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4).translate(0,.5,0),M(rc2));rf.scale.set(w*1.05/1.414,w*.28,d*1.05/1.414);rf.position.y=h;
  const dr=new THREE.Mesh(new THREE.BoxGeometry(2.2,3.2,.2),M(0x5a3a22));dr.position.set(0,1.6,d/2+.05);g.add(b,rf,dr);
  [-1,1].forEach(q=>{const wn=new THREE.Mesh(new THREE.BoxGeometry(2.4,2,.2),M(0x9fd0e6));wn.position.set(q*w*.28,h*.55,d/2+.05);g.add(wn)});
  g.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true});g.position.set(x,0,z);g.rotation.y=-a;scene.add(g);ob.parts.push(g);
  ob.sol.push(userSolid(x,z,sw2?d/2:w/2,sw2?w/2:d/2,h+w*.28));
}
function addSwing(ob,x,z){
  const g=new THREE.Group(),fr=M(0xc94c4c),sa=M(0x3b7ea1);
  [-2.2,2.2].forEach(sx=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.2,3.2,.2),fr);l.position.set(sx,1.6,0);g.add(l)});
  const top=new THREE.Mesh(new THREE.BoxGeometry(4.8,.2,.2),fr);top.position.y=3.2;g.add(top);
  [-.9,.9].forEach((sx,i)=>{const sw=new THREE.Group();sw.position.set(sx,3.2,0);const ch=new THREE.Mesh(new THREE.BoxGeometry(.05,2.4,.05),fr);ch.position.y=-1.2;const st=new THREE.Mesh(new THREE.BoxGeometry(.7,.1,.4),sa);st.position.y=-2.4;sw.add(ch,st);g.add(sw);
    const m=mkMan(sc[Math.floor(R()*7)]);m.scale.setScalar(.8);m.userData.ll.rotation.x=-1.3;m.userData.lr.rotation.x=-1.3;m.userData.gb.visible=false;scene.add(m);ob.parts.push(m);parkAnims.push({s:sw,m,gx:x,gz:z,sx,ph:i*1.7+R()*3,ob})});
  g.position.set(x,0,z);scene.add(g);ob.parts.push(g);
}
function mkPath(pts){
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+pts[i].distanceTo(pts[i-1]));const L=cum[cum.length-1];
  const seg=u=>{const d=u*L;let i=1;while(i<pts.length-1&&cum[i]<d)i++;return[i,(d-cum[i-1])/(cum[i]-cum[i-1]||1)]};
  return{L,pp:true,ug:true,getPointAt(u,out){const[i,f]=seg(u);return out.copy(pts[i-1]).lerp(pts[i],f)},getTangentAt(u,out){const[i]=seg(u);return out.copy(pts[i]).sub(pts[i-1]).normalize()}};
}
function pathPts(cx,cz,a,kind){
  const pts=[],half=kind===2?33:60,step=kind===2?3:10;
  for(let s2=-half;s2<=half+.01;s2+=step){
    let lx=s2,lz=0;if(kind===1&&shape){const th=s2/120;lx=120*Math.sin(th);lz=(shape===1?1:-1)*120*(1-Math.cos(th))}
    const as=Math.abs(s2),y=kind===0?0:kind===1?(as<20?8:8*(60-as)/40):(as<15?6:6*(33-as)/18);
    pts.push(new THREE.Vector3(cx+lx*Math.cos(a)-lz*Math.sin(a),y,cz+lx*Math.sin(a)+lz*Math.cos(a)));
  }
  return pts;
}
function nearRoad(x,z){
  const inC=(x>-3150&&x<500&&z>-1950&&z<150)||(x>2620&&x<3260&&z>-500&&z<140);
  if(inC&&(Math.abs(x-Math.round(x/120)*120)<16||Math.abs(z-Math.round(z/120)*120)<16))return true;
  return userObjs.some(q=>q.ends&&q.ends.some(e=>Math.hypot(e.x-x,e.z-z)<16));
}
function syncCars(n){
  const prev=cars.length-n;pendingRail.forEach(c=>cars.push(c));
  body.count=cab.count=cars.length;wc.count=cars.length*4;hlt.count=cars.length*2;
  for(let i=prev;i<cars.length;i++)body.setColorAt(i,cs.set(cc[i%cc.length]));if(body.instanceColor)body.instanceColor.needsUpdate=true;
}
function pillar(ob,p,sd2,r0,r1,col){
  const q=pillar.T;const pl=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,p.y,8).translate(0,p.y/2,0),M(col));
  pl.position.set(p.x-q.z*sd2,0,p.z+q.x*sd2);pl.castShadow=true;scene.add(pl);ob.parts.push(pl);
}
pillar.T=new THREE.Vector3();
function addRoadPiece(ob,kind,cx,cz,a){
  const pts=pathPts(cx,cz,a,kind),n=pts.length;
  if(kind===0)ob.parts.push(ribbon(pts,24,.13));
  else if(kind===1){
    ob.parts.push(ribbon(pts,14,.1),wallStrip(pts,7,1.2,0xb9bdc0),wallStrip(pts,-7,1.2,0xb9bdc0));
    [2,4,8,10].forEach(i=>{const q=pts[i+1],r=pts[i-1];pillar.T.set(q.x-r.x,0,q.z-r.z).normalize();pillar(ob,pts[i],-5.5,1.1,1.4,0x9a9fa4);pillar(ob,pts[i],5.5,1.1,1.4,0x9a9fa4)});
    ob.deck={pts,r2:56};decks.push(ob.deck);
  }else{
    ob.parts.push(ribbon(pts,4,.1,fbMat),wallStrip(pts,2,1.1,0xd8463a),wallStrip(pts,-2,1.1,0xd8463a));
    [6,16].forEach(i=>{const q=pts[i+1],r=pts[i-1];pillar.T.set(q.x-r.x,0,q.z-r.z).normalize();pillar(ob,pts[i],-1.6,.25,.3,0x9a9fa4);pillar(ob,pts[i],1.6,.25,.3,0x9a9fa4)});
    ob.deck={pts,r2:11};decks.push(ob.deck);
  }
  if(kind<2){
    ob.ends=[pts[0],pts[n-1]];
    if(ob.ends.some(e=>nearRoad(e.x,e.z))&&cars.length+4<=NC){
      const path=mkPath(pts);ob.cars=[];
      for(let i=0;i<4;i++){const dir=i%2?1:-1,c={rail:path,L:path.L,dir,off:dir*4,t:R()*path.L,sp:10+R()*8,x:0,y:0,z:0};cars.push(c);ob.cars.push(c)}
      syncCars(4);note('Connected: cars started driving on it');
    }else note('Placed. Join it to a road and cars will use it');
  }
}
function newCity(ob,cx,cz){
  const ci=Math.floor(cx/120),cj=Math.floor(cz/120);
  genCity(ci-1,ci+2,cj-1,cj+2,cx,cz,260,false);
  BM.count=bn;RM.count=rn;DM.count=dn;BM.instanceMatrix.needsUpdate=RM.instanceMatrix.needsUpdate=DM.instanceMatrix.needsUpdate=true;
  NEON.count=nn;NEON.instanceMatrix.needsUpdate=true;if(NEON.instanceColor)NEON.instanceColor.needsUpdate=true;BM.instanceColor.needsUpdate=true;if(RM.instanceColor)RM.instanceColor.needsUpdate=true;if(DM.instanceColor)DM.instanceColor.needsUpdate=true;bgeo.attributes.aSeed.needsUpdate=true;
  for(let i=ci-1;i<=ci+2;i++)ob.parts.push(road(360,i*120,(cj+.5)*120,0,.06));
  for(let j=cj-1;j<=cj+2;j++)ob.parts.push(road(360,(ci+.5)*120,j*120,Math.PI/2,.11));
  for(let i=ci-1;i<=ci+2;i++)for(let j=cj-1;j<=cj+2;j++)ob.parts.push(flat(24,24,i*120,.16,j*120,0x3a3f45));
  const n=POPS[popI];
  if(n>0){
    const cr=mkCrowd(n);crowds.push(cr);ob.crowd=cr;ob.peds=[];const x0=(ci-1)*120,z0=(cj-1)*120;
    for(let i=0;i<n;i++){
      const v=R()<.5,ln=Math.floor(R()*4),off=R()<.5?15:-15;let p;
      if(v){const x=(ci-1+ln)*120+off,za=z0+10+R()*340;p={x0:x,z0:za,x1:x,z1:cl(za+(R()-.5)*160,z0+10,z0+350)}}
      else{const z=(cj-1+ln)*120+off,xa=x0+10+R()*340;p={x0:xa,z0:z,x1:cl(xa+(R()-.5)*160,x0+10,x0+350),z1:z}}
      p.L=Math.hypot(p.x1-p.x0,p.z1-p.z0)+.1;p.sp=1.1+R()*.9;p.ph=R()*2;p.d=0;p.cx=p.x0;p.cz=p.z0;p.cy=0;p.cr=cr;p.ci=i;peds.push(p);ob.peds.push(p);
    }
  }
  note('New city built with '+n+' people');
}
function placeObj(){
  if(!cursorOk)return;const x=cursor.x,z=cursor.z,a=brot*Math.PI/2;
  if(tool===12){
    const k0=userObjs.findIndex(q=>Math.hypot(q.x-x,q.z-z)<Math.max(40,q.rad||0));
    if(k0>=0){delObj(userObjs[k0]);userObjs.splice(k0,1);note('Removed')}
    else if(killBuilding(x,z))note('House removed');else if(killTree(x,z))note('Tree removed');else if(killRoad(x,z))note('Road removed: cars will turn back');else note('Nothing to remove here');
    return;
  }
  if(userObjs.length>400)return;
  const ob={parts:[],sol:[],trees:[],x,z},rec={tool,x,z,b:brot,sh:shape,pp:popI,seed:RSEED};
  const CL={0:[60,14],8:[55,55],9:[190,190],10:[32,22],11:[122,22]};
  if(CL[tool])clearArea(x,z,(tool===8||tool===9)?0:a,CL[tool][0],CL[tool][1]);
  if(tool<=2)addRoadPiece(ob,tool,x,z,a);
  else if(tool===3){const m=new THREE.Mesh(new THREE.PlaneGeometry(6,24).rotateX(-Math.PI/2),zebraMat);m.position.set(x,.2,z);m.rotation.y=-a;scene.add(m);ob.parts.push(m)}
  else if(tool===4){
    const li=Math.round(x/120),dx=x-li*120,lj=Math.round(z/120),dz=z-lj*120;
    if(Math.abs(dx)<30){const cxw=li*120+(dx<0?-18:18),czw=Math.floor(z/120)*120+60;clearArea(cxw,czw,Math.PI/2,60,7);ob.parts.push(flat(12,120,cxw,.09,czw,0x3a3f45))}
    else if(Math.abs(dz)<30){const cxw=Math.floor(x/120)*120+60,czw=lj*120+(dz<0?-18:18);clearArea(cxw,czw,0,60,7);ob.parts.push(flat(120,12,cxw,.09,czw,0x3a3f45))}
    else{note('Aim at a road');return}
  }
  else if(tool===5)addHouse(ob,x,z,a);
  else if(tool===6){const h=50+R()*70,g=new THREE.Group(),c=glass[Math.floor(R()*4)],b=new THREE.Mesh(new THREE.BoxGeometry(26,h,26),M(c)),cr=new THREE.Mesh(new THREE.BoxGeometry(16,h*.12,16),M(c));b.position.y=h/2;cr.position.y=h*1.06;g.add(b,cr);g.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true});g.position.set(x,0,z);scene.add(g);ob.parts.push(g);ob.sol.push(userSolid(x,z,13,13,h*1.12))}
  else if(tool===7){
    ob.rad=50;ob.parts.push(flat(90,90,x,.21,z,0x7fb35a));for(let i=0;i<12;i++)addTree(ob,x+(R()-.5)*80,z+(R()-.5)*80,1.4+R()*.8);
    addSwing(ob,x-14,z-10);addSwing(ob,x+14,z-10);
    for(let i=0;i<5;i++){const m=mkMan(sc[Math.floor(R()*7)]);m.userData.gb.visible=false;m.position.set(x+(R()-.5)*50,0,z+10+R()*25);scene.add(m);ob.parts.push(m);parkWalk.push({m,ob,cx:x,cz:z+15,tx:x,tz:z+20,ph:R()*6})}
  }
  else if(tool===8){ob.rad=60;ob.parts.push(flat(100,100,x,.15,z,0xd2cbbd),road(100,x,z,0,.16),road(100,x,z,Math.PI/2,.17));[[-30,-30],[30,-30],[-30,30],[30,30]].forEach(q=>addHouse(ob,x+q[0],z+q[1],0))}
  else if(tool===9){ob.rad=200;newCity(ob,x,z)}
  else if(tool===10){const sw2=brot%2===1,m=new THREE.Mesh(new THREE.BoxGeometry(60,16,40),M(0xb8bfc6));m.position.set(x,8,z);m.rotation.y=-a;m.castShadow=m.receiveShadow=true;scene.add(m);ob.parts.push(m);ob.sol.push(userSolid(x,z,sw2?20:30,sw2?30:20,16))}
  else if(tool===11){const sw2=brot%2===1,t2=rwt.clone();t2.needsUpdate=true;t2.repeat.set(6,1);const m=new THREE.Mesh(new THREE.PlaneGeometry(240,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:t2,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-26}));m.position.set(x,.14,z);m.rotation.y=-a;m.receiveShadow=true;scene.add(m);ob.parts.push(m);ob.run={x,z,hx:sw2?20:120,hz:sw2?120:20};uRun.push(ob.run)}
  ob.rec=rec;userRec.push(rec);userObjs.push(ob);
}
function parkStep(dt){
  parkAnims.forEach(q=>{const r=Math.sin(time*2+q.ph)*.5;q.s.rotation.x=r;q.m.position.set(q.gx+q.sx,3.2-2.4*Math.cos(r)-.5,q.gz-2.4*Math.sin(r))});
  parkWalk.forEach(w=>{
    const dx=w.tx-w.m.position.x,dz=w.tz-w.m.position.z,d=Math.hypot(dx,dz);
    if(d<1){w.tx=w.cx+(R()-.5)*76;w.tz=w.cz+(R()-.5)*60}else{w.m.position.x+=dx/d*1.3*dt;w.m.position.z+=dz/d*1.3*dt;w.m.rotation.y=Math.atan2(-dx,-dz)}
    const s2=Math.sin(time*5+w.ph)*.6;w.m.userData.ll.rotation.x=s2;w.m.userData.lr.rotation.x=-s2;w.m.userData.la.rotation.x=-s2;
  });
}
function pickGround(){
  cam.getWorldDirection(T3);if(T3.y>=-.02){cursorOk=false;return}
  const t=-cam.position.y/T3.y;if(t>2500){cursorOk=false;return}
  cursor.set(Math.round((cam.position.x+T3.x*t)/10)*10,0,Math.round((cam.position.z+T3.z*t)/10)*10);cursorOk=true;
}
function ghostStep(){
  if(!(build&&mode==='drone')){ghost.visible=false;pline.visible=false;return}
  pickGround();ghost.visible=cursorOk;if(!cursorOk){pline.visible=false;return}
  if(tool<=2){pgeo.setFromPoints(pathPts(cursor.x,cursor.z,brot*Math.PI/2,tool).map(q=>new THREE.Vector3(q.x,q.y+.6,q.z)));pline.visible=true}else pline.visible=false;
  const g=GS[tool];ghost.scale.set(g[0],g[1],g[2]);ghost.rotation.y=-brot*Math.PI/2;ghost.position.set(cursor.x,0,cursor.z);ghost.material.color.setHex(tool===12?0xff4444:0x44ff88);
}
function renderTools(){
  const t=$('tools');
  t.innerHTML=TOOLS.map((x,i)=>'<button data-t="'+i+'" class="'+(i===tool?'on':'')+'">'+(i<9?i+1+' ':'')+x[1]+' '+x[0]+'</button>').join('')+'<button data-t="r">Rotate (R)</button><button data-t="y">Shape: '+SH[shape]+' (Y)</button><button data-t="q">People: '+POPS[popI]+' (P)</button><button data-t="p">Place (Enter)</button>';
  t.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const v=b.dataset.t;if(v==='r')brot=(brot+1)%4;else if(v==='y'){shape=(shape+1)%3;renderTools()}else if(v==='q'){popI=(popI+1)%5;renderTools()}else if(v==='p')placeObj();else{tool=+v;renderTools()}}));
}
function toggleBuild(){if(mode!=='drone')setMode('drone');build=!build;renderPad();note(build?'Build mode: pick a tool, aim at the ground, press Enter':'Build mode off')}
$('build').addEventListener('click',e=>{e.stopPropagation();toggleBuild()});
renderTools();

const ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const FOGD=new THREE.Color(0xc7dbe5),FOGS=new THREE.Color(0xe9a070),FOGN=new THREE.Color(0x0a1020),FOGR=new THREE.Color(0x7d8791),cA=new THREE.Color(),HDc=new THREE.Color(0xdbeaff),HNc=new THREE.Color(0x8da2d8),SDc=new THREE.Color(0xfff1d6),SSc=new THREE.Color(0xffb070),SNc=new THREE.Color(0x9fb4ff);
const LD=new THREE.Vector3(0,1,0),MOON=new THREE.Vector3(-.4,.5,.3).normalize();let flashT=0,lblT=0;
function todApply(){
  const th=(tod-6)/24*Math.PI*2,sh=Math.sin(th),nf=1-ss(-.1,.22,sh),warm=cl(1-Math.abs(sh)/.3,0,1)*(1-nf*.5);
  SD.set(Math.cos(th)*.8,sh,.35).normalize();LD.copy(sh>.02?SD:MOON);
  nightU.value=nf;warmU.value=warm;night=nf>.5;
  cA.copy(FOGD).lerp(FOGS,warm).lerp(FOGN,nf).lerp(FOGR,wxA*(1-nf*.7));scene.fog.color.copy(cA);scene.background.copy(cA);scene.fog.density=.0003+wxA*.0007+nf*.00012;
  hemi.intensity=(1.05*(1-nf)+.3*nf)*(1-.3*wxA)+flashT*3;hemi.color.copy(HDc).lerp(HNc,nf);
  sun.intensity=Math.max(0,sh)*1.4*(1-.65*wxA)+.18*nf;sun.color.copy(SDc).lerp(SSc,warm).lerp(SNc,nf);
  renderer.toneMappingExposure=1.15+.25*nf;
  lampMat.color.setRGB(.47+.53*nf,.47+.47*nf,.47+.28*nf);pool.material.opacity=.6*nf;hlt.visible=nf>.35;neonMat.color.setScalar(.15+.85*nf);floodMat.color.setScalar(.3+.7*nf);
}
function todStep(dt){
  if(todMode===0)tod=(tod+dt*24/540)%24;
  wxA+=([0,.6,1][wxI]-wxA)*Math.min(1,dt*.5);
  if(wxI===2&&Math.random()<dt*.12)flashT=.25;flashT=Math.max(0,flashT-dt);
  todApply();
  lblT-=dt;if(lblT<=0){lblT=.5;const hh=Math.floor(tod),m2=Math.floor((tod-hh)*60);$('night').textContent=['Auto','Day','Night'][todMode]+' '+String(hh).padStart(2,'0')+':'+String(m2).padStart(2,'0')+' (N)'}
}
const NR=3500,rpos=new Float32Array(NR*6),roff=[];for(let i=0;i<NR;i++)roff.push([(R()-.5)*120,R()*90-20,(R()-.5)*120]);
const rainG=new THREE.BufferGeometry();rainG.setAttribute('position',new THREE.BufferAttribute(rpos,3));
const rain=new THREE.LineSegments(rainG,new THREE.LineBasicMaterial({color:0xaec8e0,transparent:true,opacity:.35}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
function rainStep(dt){
  if(wxA<.05){rain.visible=false;return}
  rain.visible=true;const cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;
  for(let i=0;i<NR;i++){const r=roff[i];r[1]-=(40+wxA*25)*dt;if(r[1]<-20)r[1]+=90;const k=i*6,x=cx+r[0],y=cy+r[1],z=cz+r[2];rpos[k]=x;rpos[k+1]=y;rpos[k+2]=z;rpos[k+3]=x+.12;rpos[k+4]=y+1.1;rpos[k+5]=z}
  rainG.attributes.position.needsUpdate=true;rainG.setDrawRange(0,Math.floor(NR*cl(wxA,0,1))*2);
}
function monoStep(dt){
  if(!mono)return;
  if(mono.wait>0){mono.wait-=dt;return}
  let near=1e9;for(const sx of mono.stops)near=Math.min(near,Math.abs(mono.x-sx));
  const v=Math.min(22,3+near*.45);mono.x+=mono.dir*v*dt;
  for(const sx of mono.stops)if(Math.abs(mono.x-sx)<1.2&&mono.lastStop!==sx){mono.lastStop=sx;mono.wait=6}
  if(near>40)mono.lastStop=null;
  if(mono.x>mono.xb){mono.x=mono.xb;mono.dir=-1;mono.wait=8;mono.lastStop=null}if(mono.x<mono.xa){mono.x=mono.xa;mono.dir=1;mono.wait=8;mono.lastStop=null}
  mono.g.position.x=mono.x+(mono.dir>0?0:36);mono.g.rotation.y=mono.dir>0?0:Math.PI;
}
function shipStep(dt){ships.forEach(q=>{q.g.position.x+=q.sp*dt;if(q.g.position.x>3300)q.g.position.x=-3300;if(q.g.position.x<-3300)q.g.position.x=3300;q.g.position.y=-.2+Math.sin(time*.8+q.ph)*.25;q.g.rotation.y=q.sp<0?Math.PI:0;q.g.rotation.z=Math.sin(time*.6+q.ph)*.012})}
const QS=[['Low',1,512],['Medium',1.2,1024],['High',1.25,1024]];
function setQuality(q){if(!QS[q])q=1;qual=q;renderer.setPixelRatio(QS[q][1]);renderer.setSize(innerWidth,innerHeight);sun.shadow.mapSize.set(QS[q][2],QS[q][2]);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}try{localStorage.setItem('jetcity.q',q)}catch(e){}}
const TPS=[['Runway',620,0],['Terminal',880,150],['Gun shop',720,215],['My house',-4000,-515],['Downtown',-1300,-900],['Port',-480,320],['City 2',2940,-180],['Hospital',-1260,-835],['Stadium',-1020,-835],['Mall',-1140,-715],['University',-1380,-715],['Marina',-1060,326],['Desert',-5000,-480],['Snow land',-1320,-4400],['Jungle',4200,-180]];
function tp(x,z){
  if(mode==='drone'){D.pos.set(x,Math.max(D.pos.y,40),z);return}
  if(curV){curV.speed=0;curV=null}if(J.dead)respawn();mode='foot';Mn.pos.set(x,0,z);Mn.yaw=0;Mn.inside=null;Mn.air=0;chute.visible=false;intLight.intensity=0;snap=true;updVis();renderPad();
}
function renderMenu(){
  const m=$('menu'),B=(att,arr,cur)=>arr.map((x,i)=>'<button '+att+'="'+i+'" class="'+(i===cur?'on':'')+'">'+x+'</button>').join('');
  m.innerHTML='<b>Menu</b><div>Quality: '+B('data-q',QS.map(x=>x[0]),qual)+'</div><div>Time: '+B('data-t',['Auto','Day','Night'],todMode)+'</div><div>Weather: '+B('data-w',['Clear','Rain','Storm'],wxI)+'</div>'
   +'<div>Volume <input id="vol" type="range" min="0" max="100" value="'+Math.round(vol*100)+'"></div><div>Teleport: '+TPS.map((x,i)=>'<button data-p="'+i+'">'+x[0]+'</button>').join('')+'</div>'
   +'<div>Missions: <button data-m="taxi">Taxi job</button><button data-m="delivery">Delivery</button><button data-m="race">Street race</button><button data-m="cancel">Cancel</button></div>'+'<div>Save slot: '+[1,2,3].map(n=>'<button data-s="'+n+'" class="'+(n===slot?'on':'')+'">Slot '+n+'</button>').join('')+' <small>(switching reloads the game)</small></div>'+'<div><button id="mph">Hide screen texts (U)</button><button id="mrs">Reset saved game</button><button id="mrc">Resume (Esc)</button></div>';
  m.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{setQuality(+b.dataset.q);renderMenu()}));
  m.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>{todMode=+b.dataset.t;if(todMode===1)tod=12;if(todMode===2)tod=0;renderMenu()}));
  m.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',()=>{wxI=+b.dataset.w;renderMenu()}));
  m.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{const q=TPS[+b.dataset.p];tp(q[1],q[2]);toggleMenu()}));
  $('vol').addEventListener('input',e=>{vol=e.target.value/100;if(A.m)A.m.gain.value=vol});
  $('mph').addEventListener('click',()=>{toggleMenu();document.body.classList.add('nui')});
  $('mrs').addEventListener('click',()=>{window.__noSave=1;try{localStorage.removeItem(saveKey())}catch(e){}location.reload()});
  m.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',()=>{saveGame();try{localStorage.setItem('jetcity.slot',b.dataset.s)}catch(e){}window.__noSave=1;location.reload()}));
  m.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>{startMission(b.dataset.m);toggleMenu()}));
  $('mrc').addEventListener('click',toggleMenu);
}
function toggleMenu(){paused=!paused;$('menu').style.display=paused?'block':'none';if(paused){document.body.classList.remove('nui');renderMenu()}}
const camRec=[];let recOn=false,recT=0,playT=-1;
const mm=$('mm'),mc2=mm.getContext('2d'),hp=new THREE.Vector3();let mmT=0;
function drawMap(fp,yaw){
  const S=12,W=180,c0=W/2,X=x=>(x-fp.x)/S+c0,Y=z=>(z-fp.z)/S+c0;
  mc2.fillStyle='#9ec27a';mc2.fillRect(0,0,W,W);
  mc2.fillStyle='#2a8fa0';const sy=Y(300);if(sy<W)mc2.fillRect(0,Math.max(0,sy),W,W);
  mc2.fillStyle='#a9a39a';mc2.fillRect(X(-3150),Y(-1950),3650/S,2100/S);mc2.fillRect(X(2620),Y(-500),640/S,640/S);
  for(const q of[[BIO.des,'#e2c88a'],[BIO.snow,'#f2f6fa'],[BIO.jun,'#2f6b3a']]){mc2.fillStyle=q[1];mc2.fillRect(X(q[0][0]),Y(q[0][2]),(q[0][1]-q[0][0])/S,(q[0][3]-q[0][2])/S)}
  mc2.lineWidth=2;mc2.strokeStyle='#3a3f45';mc2.beginPath();mc2.moveTo(X(560),Y(0));mc2.lineTo(X(2560),Y(0));mc2.stroke();
  mc2.strokeStyle='#e8c24a';mc2.beginPath();mc2.moveTo(X(480),Y(-330));mc2.lineTo(X(2640),Y(-330));mc2.moveTo(X(480),Y(-240));mc2.lineTo(X(3240),Y(-240));mc2.stroke();
  for(const q of[[-4000,-515,'#2f6fd0'],[720,205,'#d8463a'],[-480,350,'#e8684a'],[880,168,'#6b7480']]){mc2.fillStyle=q[2];mc2.fillRect(X(q[0])-3,Y(q[1])-3,6,6)}
  if(mis){const t=mis.pts[mis.i];let mx=(t[0]-fp.x)/S,my=(t[1]-fp.z)/S;const m3=Math.hypot(mx,my);if(m3>78){mx*=78/m3;my*=78/m3}mc2.fillStyle='#39e6ff';mc2.beginPath();mc2.arc(c0+mx,c0+my,4,0,6.3);mc2.fill()}
  mc2.save();mc2.translate(c0,c0);mc2.rotate(-yaw);mc2.fillStyle='#d8463a';mc2.strokeStyle='#fff';mc2.lineWidth=1.5;mc2.beginPath();mc2.moveTo(0,-8);mc2.lineTo(6,7);mc2.lineTo(-6,7);mc2.closePath();mc2.fill();mc2.stroke();mc2.restore();
}
function hudStep(dtr){
  const mv=(curV&&(mode==='car'||mode==='bike'));
  hp.copy(mode==='drone'?D.pos:mode==='foot'?Mn.pos:mv?P3.set(curV.x,curV.y,curV.z):J.pos);
  mmT+=dtr;if(mmT>.15){mmT=0;drawMap(hp,mode==='drone'?D.yaw:mode==='foot'?Mn.yaw:mv?curV.yaw:J.yaw)}
  const sp=mode==='jet'?J.speed:mv?Math.abs(curV.speed):mode==='drone'?D.vel.length():0,so=$('speedo');
  so.style.display=mode==='foot'?'none':'block';so.textContent=Math.round(sp*3.6)+' km/h'+(mv&&curV.hp!==undefined?'   ♥ '+Math.max(0,Math.round(curV.hp)):'');
  if(recOn&&mode==='drone'){recT+=dtr;if(recT>.35){recT=0;camRec.push([D.pos.x,D.pos.y,D.pos.z,D.yaw,D.pitch]);if(camRec.length>1200)recOn=false}}
}

let wanted=0,wantT=0,bustT=0,copNear=1e9,sirenOn=false,mis=null;const cops=[],cvec=new THREE.Vector3();
function crime(){wanted=Math.min(3,wanted+1);wantT=45}
function sirenStep(){const fl=Math.floor(time*4)%2,a=fl?0xff2020:0x330000,b=fl?0x000033:0x2060ff,f=v=>{const q=v.g.userData.sir;if(q){q[0].color.setHex(a);q[1].color.setHex(b)}};veh.forEach(f);cops.forEach(f)}
function copStep(dt){
  wantT-=dt;if(wantT<=0&&wanted>0){wanted--;wantT=40}
  const on=mode==='foot'||(curV&&(mode==='car'||mode==='bike')),tx=mode==='foot'?Mn.pos.x:curV?curV.x:0,tz=mode==='foot'?Mn.pos.z:curV?curV.z:0,want=on?wanted*2:0;
  while(cops.length<want){const a=Math.random()*6.283,c={g:mkVeh('police',0x16202b),x:tx+Math.cos(a)*180,z:tz+Math.sin(a)*180,yaw:0,speed:0};scene.add(c.g);cops.push(c)}
  while(cops.length>want){scene.remove(cops.pop().g)}
  let near=1e9;
  cops.forEach(c=>{
    const dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz);near=Math.min(near,d);
    let dd=Math.atan2(-dx,-dz)-c.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));c.yaw+=cl(dd,-2.5*dt,2.5*dt);
    c.speed+=(Math.min(38,12+wanted*9)*(d<6?0:1)-c.speed)*Math.min(1,dt);c.x+=-Math.sin(c.yaw)*c.speed*dt;c.z+=-Math.cos(c.yaw)*c.speed*dt;
    cvec.set(c.x,0,c.z);if(pushXZ(cvec,2.2)){c.speed*=.4;c.x=cvec.x;c.z=cvec.z}
    c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.yaw;
  });
  copNear=near;
  if(near<7){bustT+=dt;if(bustT>2.5){const lost=Math.min(money,Math.floor(money*.3)+200);money-=lost;wanted=0;bustT=0;while(cops.length)scene.remove(cops.pop().g);note('BUSTED! You paid $'+lost);tp(-1260,-835)}}else bustT=Math.max(0,bustT-dt);
}
const misMk=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,220,14,1,true),new THREE.MeshBasicMaterial({color:0x39e6ff,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));misMk.visible=false;scene.add(misMk);
function rndPt(cx,cz,minD,maxD){for(let k=0;k<40;k++){const x=(-25+Math.floor(Math.random()*28))*120,z=(-15+Math.floor(Math.random()*16))*120,d=Math.hypot(x-cx,z-cz);if(d>=minD&&d<=maxD)return[x,z]}return[-1320,-840]}
function startMission(type){
  const had=!!mis;mis=null;misMk.visible=false;if(type==='cancel'){if(had)note('Mission cancelled');return}
  const cx=hp.x,cz=hp.z,dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  if(type==='taxi'){const a=rndPt(cx,cz,150,700),b=rndPt(a[0],a[1],900,2200);mis={type,pts:[a,b],i:0,t:dist(a,[cx,cz])/9+50,name:['Pick up the passenger','Take the passenger to the destination'],rew:Math.round(dist(a,b)*.35)+150}}
  else if(type==='delivery'){const a=[-480,340],b=rndPt(-480,300,1200,2800);mis={type,pts:[a,b],i:0,t:dist(a,[cx,cz])/9+60,name:['Pick up the parcel at the port','Deliver the parcel'],rew:Math.round(dist(a,b)*.5)+200}}
  else{const pts=[];let p=rndPt(cx,cz,150,500);pts.push(p);for(let k=0;k<7;k++){p=rndPt(p[0],p[1],240,520);pts.push(p)}mis={type:'race',pts,i:0,t:140,name:null,rew:900}}
  note({taxi:'Taxi job started. Drive a vehicle to the blue beam',delivery:'Delivery started. Drive to the port',race:'Street race: drive through every checkpoint'}[mis.type]);
}
function misStep(dt){
  const bx=$('mis');if(!mis){misMk.visible=false;bx.style.display='none';return}
  const t=mis.pts[mis.i],drv=curV&&(mode==='car'||mode==='bike'),px=drv?curV.x:hp.x,pz=drv?curV.z:hp.z,d=Math.hypot(t[0]-px,t[1]-pz);
  misMk.visible=true;misMk.position.set(t[0],110,t[1]);misMk.material.color.setHex(mis.i===mis.pts.length-1?0x7dff5a:0x39e6ff);
  mis.t-=dt;
  if(d<14&&drv){mis.i++;if(mis.i>=mis.pts.length){money+=mis.rew;note('Mission complete! +$'+mis.rew);mis=null;misMk.visible=false;bx.style.display='none';return}if(mis.type!=='race')mis.t+=Math.hypot(mis.pts[mis.i][0]-t[0],mis.pts[mis.i][1]-t[1])/9+40}
  if(mis.t<=0){note('Mission failed: time is up');mis=null;misMk.visible=false;bx.style.display='none';return}
  bx.textContent=(mis.type==='race'?'Race: checkpoint '+(mis.i+1)+'/'+mis.pts.length:mis.name[mis.i])+' - '+Math.round(d)+' m - '+Math.ceil(mis.t)+' s - $'+mis.rew;bx.style.display='block';
}

const INT={},PORTALS=[[-1140,-757,10,'mall'],[-1260,-905,12,'hospital'],[-1380,-800,10,'university']];
const intLight=new THREE.PointLight(0xfff2d8,0,90);scene.add(intLight);
function ib(x,y0,z,w,h,d,c,hit,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||M(c));m.position.set(x,y0+h/2,z);m.receiveShadow=true;scene.add(m);if(hit)solids.push({x,z,hw:w/2,hd:d/2,h:y0+h,y0});return m}
function mkInt(type,cx,cz,hx,hz,H,fc,wc){
  const wm=M(wc),I={cx,cz,hx,hz,H};INT[type]=I;flat(hx*2,hz*2,cx,.03,cz,fc);
  ib(cx,0,cz-hz,hx*2,H,.6,0,1,wm);ib(cx-hx,0,cz,.6,H,hz*2,0,1,wm);ib(cx+hx,0,cz,.6,H,hz*2,0,1,wm);
  ib(cx-hx/2-1,0,cz+hz,hx-2,H,.6,0,1,wm);ib(cx+hx/2+1,0,cz+hz,hx-2,H,.6,0,1,wm);ib(cx,H-1,cz+hz,4,1,.6,0,0,wm);
  ib(cx,H,cz,hx*2+1,.5,hz*2+1,0xf2efe8,0);
  const lm=new THREE.MeshBasicMaterial({color:0xfff6dc});for(let x=-hx+6;x<hx-2;x+=10)for(let z=-hz+5;z<hz-2;z+=9){const l=new THREE.Mesh(new THREE.BoxGeometry(3,.1,1.2),lm);l.position.set(cx+x,H-.05,cz+z);scene.add(l)}
  return I;
}
{
  const F=(I,x,z,w,h,d,c,y0)=>ib(I.cx+x,y0||0,I.cz+z,w,h,d,c,1);
  let I=mkInt('house',4200,2600,13,9,4.2,0xb08a5a,0xefe6d6);
  I.sofa=F(I,-6,-5,5,.9,2,0x3b7ea1);F(I,-6,-2,2.4,.5,1.2,0x7a5638);F(I,-6,-8.3,4,2,.4,0x111111);F(I,8,-5,4,.6,5,0xb04a8a);F(I,11.5,-3,1.5,2.4,3,0x7a5638);F(I,11.2,3,1.2,1,6,0xdddddd);F(I,10.6,6,1.4,2.2,1.4,0xcccccc);F(I,2,3,4,.8,2.2,0x7a5638);
  I=mkInt('apt',4200,2800,15,10,4.5,0xc9c4b8,0xe8e4da);F(I,0,-4,8,1.1,1.6,0x555a60);[-6,0,6].forEach(x=>F(I,x,-9.3,3,3.6,.4,0xaab1b8));F(I,-10,2,5,.9,2,0xc94c4c);F(I,10,2,5,.9,2,0xc94c4c);[-12,12].forEach(x=>F(I,x,-8,1,1.2,1,0x2f6b3f));
  I=mkInt('office',4200,3000,18,12,4.5,0x8a8f94,0xe3e6ea);F(I,0,6,8,1.1,1.6,0x555a60);for(let i=0;i<4;i++)for(let j=0;j<3;j++){F(I,-12+i*8,-5+j*5,3,.8,1.4,0xb9a27a);F(I,-12+i*8,-5.4+j*5,1.2,.6,.1,0x111111,.8)}[-5,0,5].forEach(x=>F(I,x,-11.3,3,3.6,.4,0xaab1b8));
  I=mkInt('hospital',4200,3200,20,13,4.5,0xdfe6ea,0xf4f4f4);F(I,0,6,8,1.1,1.6,0x3b7ea1);for(let r=0;r<3;r++)for(let c=0;c<6;c++)F(I,-10+c*2.2,0+r*2.5,1.4,.9,1.2,0x3b7ea1);[0,1,2].forEach(i=>{F(I,-14+i*10,-10,2,.7,4,0xffffff);F(I,-14+i*10,-7.6,3,2.4,.1,0x9fd0e6)});flat(4,1,4200,.05,3200+8,0xd8263a);flat(1,4,4200,.05,3200+8,0xd8263a);
  I=mkInt('university',4200,3400,20,14,5,0xb9a27a,0xe9e2d4);F(I,0,-13.4,14,3,.2,0x2f5f45,1.2);F(I,0,-10,4,1.2,1.4,0x7a5638);for(let r=0;r<4;r++)for(let c=0;c<6;c++){F(I,-10+c*4,-4+r*3.4,2.4,.8,1.1,0x7a5638);F(I,-10+c*4,-3+r*3.4,1,.5,.9,0x3b7ea1)}
  I=mkInt('mall',3500,3000,45,28,9,0xd9d4c8,0xf0ece2);
  I.clx=I.cx-30;I.clz=I.cz+10;F(I,-30,10,6,1.1,1.4,0x3a2a22);{const sg=new THREE.Mesh(new THREE.BoxGeometry(8,1,.3),new THREE.MeshBasicMaterial({color:0xff3b6b}));sg.position.set(I.clx,3.5,I.clz-1);scene.add(sg)}
  const sc2=[0xe8684a,0x3b7ea1,0xf2c14e,0x7bb36a,0xb04a8a,0x39e6ff,0xff8a2b,0xd8463a];
  for(let i=0;i<8;i++){F(I,-38+i*11,-24,9,5,7,0xe9e4d8);const f=new THREE.Mesh(new THREE.BoxGeometry(8.4,4,.3),new THREE.MeshBasicMaterial({color:sc2[i]}));f.position.set(I.cx-38+i*11,3,I.cz-20.3);scene.add(f)}
  for(let i=0;i<4;i++){F(I,-42,-12+i*9,7,5,7,0xe9e4d8);F(I,42,-12+i*9,7,5,7,0xe9e4d8);const f1=new THREE.Mesh(new THREE.BoxGeometry(.3,4,6.4),new THREE.MeshBasicMaterial({color:sc2[i]}));f1.position.set(I.cx-38.4,3,I.cz-12+i*9);scene.add(f1);const f2=f1.clone();f2.material=new THREE.MeshBasicMaterial({color:sc2[i+4]});f2.position.set(I.cx+38.4,3,I.cz-12+i*9);scene.add(f2)}
  F(I,0,0,12,.8,12,0xaab1b8);{const w=new THREE.Mesh(new THREE.CylinderGeometry(5,5,1,24),M(0x39b6d8));w.position.set(I.cx,1,I.cz);scene.add(w);const sp=new THREE.Mesh(new THREE.ConeGeometry(.6,5,8),M(0xdfe8ee));sp.position.set(I.cx,3.5,I.cz);scene.add(sp)}
  for(let i=0;i<8;i++){F(I,-26+i*7,12,2.6,.5,.7,0x7a5638);}for(let i=0;i<6;i++){const tb=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.8,12),M(0xf2f2f2));tb.position.set(I.cx+16+(i%3)*5,.4,I.cz+14+Math.floor(i/3)*5);scene.add(tb)}
  F(I,38,20,1.2,2.2,1.2,0x2d3a40);
}
function nearBuilding(){
  const p=Mn.pos,bi=Math.floor(p.x/120),bj=Math.floor(p.z/120);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bmap[K(bi+a,bj+b)];if(!L)continue;
    for(const q of L){const dx=Math.abs(p.x-q.x)-q.hw,dz=Math.abs(p.z-q.z)-q.hd;if(p.y<2&&Math.hypot(Math.max(dx,0),Math.max(dz,0))<3.6&&Math.max(dx,dz)>-1)return q}}
  for(const s of PORTALS)if(Math.hypot(p.x-s[0],p.z-s[1])<s[2])return{type:s[3]};
  return null;
}
function enterInterior(type){
  const I=INT[type];Mn.back={x:Mn.pos.x,z:Mn.pos.z,yaw:Mn.yaw};Mn.inside=type;Mn.pos.set(I.cx,0,I.cz+I.hz-3);Mn.yaw=0;snap=true;
  intLight.position.set(I.cx,I.H-1.2,I.cz);intLight.intensity=1.3;intLight.distance=Math.max(I.hx,I.hz)*3;
  if(I.sofa)I.sofa.material.color.setHex([0x3b7ea1,0xc94c4c,0x7bb36a,0x8a6fb0][Math.floor(Math.random()*4)]);
  note('Inside. Walk to the door and press E to leave');
}
function exitInterior(){Mn.pos.set(Mn.back.x,0,Mn.back.z);Mn.yaw=Mn.back.yaw;Mn.inside=null;intLight.intensity=0;snap=true}
function intAct(){
  if(Mn.inside){const I=INT[Mn.inside];
    if(Math.hypot(Mn.pos.x-I.cx,Mn.pos.z-(I.cz+I.hz))<6){exitInterior();return true}
    if(I.clx!==undefined&&Math.hypot(Mn.pos.x-I.clx,Mn.pos.z-I.clz)<5){const cols=[0xd8463a,0x3b7ea1,0x2d3a40,0xf2c14e,0x7bb36a,0xb04a8a,0xffffff];I.ci=((I.ci||0)+1)%cols.length;man.userData.sh.color.setHex(cols[I.ci]);note('New shirt!');return true}
    return true;
  }
  const q=nearBuilding();if(q){enterInterior(q.type||(q.h<16?'house':q.h<45?'apt':'office'));return true}
  return false;
}
function intPrompt(t){
  if(Mn.inside){const I=INT[Mn.inside];if(Math.hypot(Mn.pos.x-I.cx,Mn.pos.z-(I.cz+I.hz))<6)return'Press E to leave';if(I.clx!==undefined&&Math.hypot(Mn.pos.x-I.clx,Mn.pos.z-I.clz)<5)return'Press E to change your shirt';return''}
  return(!t&&nearBuilding())?'Press E to go inside':t;
}

const DARKC=new THREE.Color(0x1a1a1a);let dsm=null,dsi=0;
function boomAt(pos,R2){if(!bf){bf=mkPts(120,22,THREE.AdditiveBlending);bs=mkPts(60,30,THREE.NormalBlending);bflash=new THREE.PointLight(0xff9a40,0,200);scene.add(bflash)}burst(bf,pos,R2*2.5,1,6);burst(bs,pos,R2,2.2,6);bflash.position.copy(pos);bflash.intensity=6;bhide=3;sfx('boom')}
function hitV(v,sp){
  if(sp<7||v.wreck||v.kind==='tank')return;
  v.hp=(v.hp===undefined?100:v.hp)-(sp-6)*1.5;
  const b=v.g.userData.body;if(b){const d=1-cl(v.hp/100,0,1);b.scale.y=1-d*.25;b.rotation.z=(Math.random()-.5)*d*.25;b.material.color.lerp(DARKC,.12)}
  if(v.hp<=0)wreckV(v);
}
function wreckV(v){
  v.wreck=true;v.wt=25;v.hp=0;boomAt(new THREE.Vector3(v.x,v.y+1,v.z),9);
  v.g.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.userData.c0=m.material.color.getHex();m.material.color.setHex(0x1a1a1a)}});
  if(curV===v)exitVeh();
}
function damageStep(dt){
  veh.forEach(v=>{if(v.wreck){v.wt-=dt;if(v.wt<=0){v.wreck=false;v.hp=100;v.x=v.home[0];v.z=v.home[1];v.yaw=v.home[2];v.speed=0;v.g.position.set(v.x,0,v.z);v.g.rotation.set(0,v.yaw,0);
      v.g.traverse(m=>{if(m.isMesh&&m.userData.c0!==undefined&&m.material.color)m.material.color.setHex(m.userData.c0)});const b=v.g.userData.body;if(b){b.scale.y=1;b.rotation.z=0}}}});
  if(curV&&curV.hp<50&&curV.hp>0&&Math.random()<dt*14){
    if(!dsm){dsm=mkPts(60,16,THREE.NormalBlending);const P0=dsm.p.geometry.attributes.position.array;for(let i=0;i<dsm.n;i++){P0[i*3+1]=-1000;dsm.a[i]=10;dsm.m[i]=1}dsm.p.visible=true}
    const i=(dsi++)%dsm.n,P=dsm.p.geometry.attributes.position.array;P[i*3]=curV.x-Math.sin(curV.yaw)*1.8+(Math.random()-.5);P[i*3+1]=curV.y+1.1;P[i*3+2]=curV.z-Math.cos(curV.yaw)*1.8;
    dsm.v[i*3]=(Math.random()-.5)*1.5;dsm.v[i*3+1]=3+Math.random()*2;dsm.v[i*3+2]=(Math.random()-.5)*1.5;dsm.a[i]=0;dsm.m[i]=1.4;
  }
  if(dsm)fx(dsm,dt,true);
}

const chute=new THREE.Group();
{const cn=new THREE.Mesh(new THREE.SphereGeometry(4,18,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xe8684a,side:THREE.DoubleSide}));cn.position.y=7;chute.add(cn);
 for(const a of[0,1.57,3.14,4.71]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,7,4),M(0xffffff));l.position.set(Math.cos(a)*2,3.5,Math.sin(a)*2);l.rotation.z=-Math.cos(a)*.3;l.rotation.x=Math.sin(a)*.3;chute.add(l)}}
chute.visible=false;scene.add(chute);
function bail(){
  if(mode!=='jet'||J.ground||J.dead)return;
  Mn.pos.copy(J.pos);Mn.yaw=J.yaw;Mn.air=1;Mn.vy=-2;Mn.chute=false;Mn.at=0;Mn.hv=J.speed*.35;Mn.inside=null;
  mode='foot';crash('You ejected, the aircraft was lost.');updVis();renderPad();snap=true;
}

const NSN=2500,snG=new THREE.BufferGeometry(),snP=new Float32Array(NSN*3),snO=[];for(let i=0;i<NSN;i++)snO.push([(Math.random()-.5)*100,Math.random()*60-10,(Math.random()-.5)*100]);
snG.setAttribute('position',new THREE.BufferAttribute(snP,3));
const snowPts=new THREE.Points(snG,new THREE.PointsMaterial({color:0xffffff,size:.35,transparent:true,opacity:.9}));snowPts.frustumCulled=false;snowPts.visible=false;scene.add(snowPts);
function snowStep(dt){
  const c=cam.position,r=BIO.snow;snowPts.visible=c.x>r[0]&&c.x<r[1]&&c.z>r[2]&&c.z<r[3]&&c.y<150;if(!snowPts.visible)return;
  for(let i=0;i<NSN;i++){const o2=snO[i];o2[1]-=(3+(i%5))*dt;if(o2[1]<-10)o2[1]+=60;snP[i*3]=c.x+o2[0]+Math.sin(time+i)*.6;snP[i*3+1]=c.y+o2[1];snP[i*3+2]=c.z+o2[2]}
  snG.attributes.position.needsUpdate=true;
}

const SAVE0='jetcity.v1';let slot=1;try{slot=+(localStorage.getItem('jetcity.slot')||1)}catch(e){}if(!(slot>=1&&slot<=3))slot=1;const saveKey=()=>slot===1?SAVE0:SAVE0+'.s'+slot;
function saveGame(){
  if(window.__noSave)return;try{
    localStorage.setItem(saveKey(),JSON.stringify({v:1,mode,night,tod,todMode,wxI,money,kills,owned,gun:GUNS.indexOf(GUN),
      jet:{cur:J.cur,held:J.held&&!J.dead,pos:[J.pos.x,J.pos.y,J.pos.z],yaw:J.yaw,pitch:J.pitch,roll:J.roll,speed:J.speed,thr:J.thr,ground:J.ground},
      planes:planes.map(q=>[q.rest.x,q.rest.z,q.rest.yaw]),man:(Mn.inside&&Mn.back)?[Mn.back.x,0,Mn.back.z,Mn.back.yaw]:[Mn.pos.x,Mn.pos.y,Mn.pos.z,Mn.yaw],drone:[D.pos.x,D.pos.y,D.pos.z,D.yaw,D.pitch],
      veh:veh.map(v=>[v.kind,v.x,v.z,v.yaw]),curV:curV?veh.indexOf(curV):-1,rec:userRec,rb:removedB,rt:removedT,ro:Object.keys(ROADOFF)}));
  }catch(e){}
}
function replayRec(rc){
  const sv=[tool,brot,shape,popI];tool=rc.tool;brot=rc.b;shape=rc.sh;popI=rc.pp;cursor.set(rc.x,0,rc.z);cursorOk=true;RSEED=rc.seed;quiet=true;placeObj();quiet=false;
  tool=sv[0];brot=sv[1];shape=sv[2];popI=sv[3];
}
function loadGame(){
  let sv=null;try{sv=JSON.parse(localStorage.getItem(saveKey())||'null')}catch(e){return}
  if(!sv||sv.v!==1)return;
  replaying=true;
  try{
    (sv.rec||[]).forEach(replayRec);
    (sv.ro||[]).forEach(k=>{const e=SEGI[k];if(e&&!ROADOFF[k]){e[0].setMatrixAt(e[1],zero);e[0].instanceMatrix.needsUpdate=true;ROADOFF[k]=1;ROADN++;const si=SWI[k];if(si!==undefined&&SWM){SWM.setMatrixAt(si,zero);SWM.setMatrixAt(si+1,zero);SWM.instanceMatrix.needsUpdate=true}}});
    (sv.rb||[]).forEach(q=>killBuilding(q[0],q[1]));(sv.rt||[]).forEach(q=>killTree(q[0],q[1]));
    removedB.push(...(sv.rb||[]));removedT.push(...(sv.rt||[]));
    if(sv.todMode!==undefined){todMode=sv.todMode;tod=sv.tod;wxI=sv.wxI||0}else setNight(!!sv.night);money=sv.money;kills=sv.kills;(sv.owned||[]).forEach((b,i)=>{owned[i]=b});equip(sv.gun>=0?sv.gun:0);
    (sv.veh||[]).forEach((q,i)=>{if(i>=veh.length)addVeh(q[0],q[1],q[2],q[3],0x4b5a3a);const v=veh[i];v.x=q[1];v.z=q[2];v.yaw=q[3];v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.yaw});
    (sv.planes||[]).forEach((q,i)=>{const p=planes[i];if(p&&(Math.hypot(q[0]-p.rest.x,q[1]-p.rest.z)>.5||Math.abs(q[2]-p.rest.yaw)>.01)){p.rest={x:q[0],z:q[1],yaw:q[2]};p.g.position.set(q[0],p.t.gy,q[1]);p.g.rotation.y=q[2];scene.add(p.g);p.sol.x=q[0];p.sol.z=q[1]}});
    const j=sv.jet;takePlane(j.cur);
    if(j.held){J.pos.set(j.pos[0],j.pos[1],j.pos[2]);J.yaw=j.yaw;J.pitch=j.pitch;J.roll=j.roll;J.speed=j.speed;J.thr=j.thr;J.ground=j.ground;jet.position.copy(J.pos);jet.rotation.set(J.pitch,J.yaw,J.roll)}
    else{planes[j.cur].sol.off=false;J.held=false}
    Mn.pos.set(sv.man[0],sv.man[1],sv.man[2]);Mn.yaw=sv.man[3];D.pos.set(sv.drone[0],sv.drone[1],sv.drone[2]);D.yaw=sv.drone[3];D.pitch=sv.drone[4];
    const m=sv.mode;
    if((m==='car'||m==='bike')&&veh[sv.curV]){curV=veh[sv.curV];mode=m}
    else if(m==='drone'||m==='foot')mode=m;
    else if(j.held)mode='jet';
    else mode='foot';
    snap=true;updVis();renderPad();
  }catch(e){}
  replaying=false;quiet=false;
}

let AC=null;const A={};
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  A.m=AC.createGain();A.m.gain.value=vol;A.m.connect(AC.destination);
  const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);let l=0;
  for(let i=0;i<d.length;i++){l=(l+.03*(Math.random()*2-1))/1.03;d[i]=l*4}
  A.nb=b;
  const loop=(f,type)=>{const s2=AC.createBufferSource();s2.buffer=b;s2.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;const g=AC.createGain();g.gain.value=0;s2.connect(fl);fl.connect(g);g.connect(A.m);s2.start();return{g,fl}};
  A.city=loop(450,'lowpass');A.wind=loop(900,'highpass');A.eng=loop(500,'lowpass');
  A.osc=AC.createOscillator();A.osc.type='sawtooth';A.og=AC.createGain();A.og.gain.value=0;A.osc.connect(A.og);A.og.connect(A.m);A.osc.start();A.sir=AC.createOscillator();A.sir.type='sawtooth';A.sg=AC.createGain();A.sg.gain.value=0;A.sir.connect(A.sg);A.sg.connect(A.m);A.sir.start();
}
function sfx(k,v){
  if(!AC||!A.nb)return;const t=AC.currentTime;
  if(k==='horn'){const o1=AC.createOscillator(),g=AC.createGain();o1.type='square';o1.frequency.value=390;g.gain.setValueAtTime(.12*(v||1),t);g.gain.setTargetAtTime(0,t+.25,.03);o1.connect(g);g.connect(A.m);o1.start(t);o1.stop(t+.5);return}
  const s2=AC.createBufferSource();s2.buffer=A.nb;const f=AC.createBiquadFilter(),g=AC.createGain();
  if(k==='gun'){f.type='bandpass';f.frequency.value=1600;g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.16)}
  else{f.type='lowpass';f.frequency.value=500;g.gain.setValueAtTime(2.2,t);g.gain.exponentialRampToValueAtTime(.001,t+2.2)}
  s2.connect(f);f.connect(g);g.connect(A.m);s2.start(t,Math.random());s2.stop(t+(k==='gun'?.2:2.4));
}
let nextHorn=3;
function audioStep(dt,fp){
  if(!AC||!A.city)return;const t=AC.currentTime;
  const dx=Math.max(-3200-fp.x,0,fp.x-520),dz=Math.max(-2000-fp.z,0,fp.z-200),dist=Math.hypot(dx,dz);
  const cv=cl(1-dist/700,0,1)*(1-cl(fp.y/500,0,1))*.5;
  A.city.g.gain.setTargetAtTime(cv,t,.3);A.city.fl.frequency.setTargetAtTime(300+cv*700,t,.3);
  const hl=mode==='jet'&&J.heli;let sp=0,eng=0,pitch=60;
  if(mode==='jet'){sp=J.speed;eng=hl?.35*(.65+.35*Math.sin(time*75)):.12+J.thr*.5;pitch=50+J.thr*90}
  else if(mode==='drone'){sp=D.vel.length();eng=.05;pitch=180}
  else if(mode==='car'||mode==='bike'){sp=Math.abs(curV.speed);eng=.05+sp/70;pitch=35+sp*4}
  A.wind.g.gain.setTargetAtTime(cl(sp/260,0,1)*.35+wxA*.25,t,.2);
  A.eng.g.gain.setTargetAtTime(eng*.8,t,hl?.02:.15);A.eng.fl.frequency.setTargetAtTime(hl?260:250+eng*1500,t,.1);
  A.og.gain.setTargetAtTime(hl?0:eng*.12,t,.1);A.osc.frequency.setTargetAtTime(pitch,t,.1);
  if(A.sg){const sv=Math.max(copNear<260?1-copNear/260:0,(sirenOn&&mode==='car')?.7:0);A.sg.gain.setTargetAtTime(sv*.05,t,.1);A.sir.frequency.setTargetAtTime(((time*1.5)%2<1)?760:960,t,.03)}
  nextHorn-=dt;if(nextHorn<0){nextHorn=4+Math.random()*8;if(cv>.25)sfx('horn',cv)}
}
const clock=new THREE.Clock();
function tick(){
  const dtr=Math.min(.05,clock.getDelta()),dt=paused?0:dtr*tscale;time+=dt;
  if(mode==='jet')jetStep(dt);else if(mode==='drone')droneStep(dt);else if(mode==='foot')footStep(dt);else driveStep(dt);
  worldStep(dt);
  if(J.dead){
    J.dt+=dt;fx(fire,dt,false);fx(smoke,dt,true);
    ball.scale.setScalar(6+J.dt*50);ball.material.opacity=Math.max(0,.9-J.dt*.8);flash.intensity=Math.max(0,8*(1-J.dt/1.3));
    if(J.dt>3.6)respawn();
  }
  camStep(dt);promptStep();ghostStep();todStep(dt);rainStep(dt);snowStep(dt);hudStep(dtr);misStep(dt);copStep(dt);
  sky.position.copy(cam.position);
  const fp=mode==='drone'?D.pos:mode==='foot'?Mn.pos:curV&&(mode==='car'||mode==='bike')?P3.set(curV.x,curV.y,curV.z):J.pos;
  sun.position.copy(fp).addScaledVector(LD,320);sun.target.position.copy(fp);sun.target.updateMatrixWorld();gar.visible=Math.hypot(fp.x-1030,fp.z+115)<1800;audioStep(dt,fp);
  h1.textContent=mode==='jet'?Math.round(J.speed*3.6)+' km/h, '+Math.round(J.pos.y)+' m'+(J.heli?'':', throttle '+Math.round(J.thr*100)+'%'):mode==='drone'?'Drone, '+Math.round(D.pos.y)+' m':mode==='foot'?'On foot':Math.round(Math.abs(curV.speed)*3.6)+' km/h';
  h2.textContent=(mode==='jet'?planes[J.cur].t.n+', view '+views[view]+', crashes '+crashes+', ':'')+'kills '+kills+', $'+money+(mode==='foot'?', '+GUN.n:'')+(wanted?'  '+'★'.repeat(wanted)+'☆'.repeat(3-wanted):'');
  renderer.render(scene,cam);
  requestAnimationFrame(tick);
}
{let q0=1;try{const v=localStorage.getItem('jetcity.q');if(v!==null)q0=+v}catch(e){}setQuality(q0)}
todApply();
takePlane(0);updVis();loadGame();
try{if(veh&&veh.length>0){const myCar=veh.find(v=>v.kind==='sport')||veh[0];enterVeh(myCar);snap=true;updVis();}}catch(e){}
scene.traverse(m=>{if(m.isInstancedMesh)m.frustumCulled=false});
setInterval(saveGame,3000);addEventListener('beforeunload',saveGame);document.addEventListener('visibilitychange',saveGame);
tick();
})();
