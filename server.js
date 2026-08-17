const http=require('http');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'app');
const three=path.resolve(__dirname,'node_modules/three/build/three.min.js');
const threeModule=path.resolve(__dirname,'node_modules/three/build/three.module.js');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
function send404(res){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}
function send500(res){res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('Server error')}
function sendBuffer(res,file,data){res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}
function sendFile(res,file){
  fs.stat(file,(e,s)=>{
    if(e)return send404(res);
    if(s.isDirectory()){const index=path.join(file,'index.html');return fs.access(index,fs.constants.R_OK,e=>e?send404(res):sendFile(res,index))}
    fs.readFile(file,(e,data)=>{
      if(e)return send500(res);
      const ext=path.extname(file).toLowerCase();
      if(ext==='.html'){
        let html=data.toString('utf8');
        const cdns=[
          'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.min.js',
          'https://unpkg.com/three@0.179.1/build/three.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/three.js/r179/three.min.js',
          'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js'
        ];
        for(const u of cdns)html=html.split(u).join('/three.min.js');
        sendBuffer(res,file,Buffer.from(html));
        return;
      }
      sendBuffer(res,file,data);
    });
  });
}
const server=http.createServer((req,res)=>{
  try{
    let u=decodeURIComponent(new URL(req.url||'/',`http://${req.headers.host||'localhost'}`).pathname);
    if(u==='/')u='/index.html';
    if(u==='/three.min.js')return sendFile(res,three);
    if(u==='/three.module.js')return sendFile(res,threeModule);
    const f=path.resolve(root,u.replace(/^\/+/,''));
    if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden')}
    sendFile(res,f);
  }catch(e){send500(res)}
});
const port=Number(process.env.PORT)||3000;
server.listen(port,'0.0.0.0',()=>console.log(`Samarqand Drive running on http://127.0.0.1:${port}`));
