import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const products = [
  {id:'demo-1',sku:'MAT-001',name:'Papel A4 75g',category:'Expediente',quantity:248,minimum:80,location:'Prateleira A-01',price:29.9},
  {id:'demo-2',sku:'LIM-014',name:'Detergente neutro 5L',category:'Limpeza',quantity:18,minimum:25,location:'Prateleira B-03',price:24.5},
  {id:'demo-3',sku:'EPI-032',name:'Luva nitrílica (par)',category:'EPI',quantity:142,minimum:40,location:'Armário C-02',price:8.75},
  {id:'demo-4',sku:'INF-008',name:'Mouse óptico USB',category:'Informática',quantity:7,minimum:15,location:'Armário D-01',price:36},
  {id:'demo-5',sku:'MAT-019',name:'Caneta esferográfica azul',category:'Expediente',quantity:320,minimum:100,location:'Prateleira A-02',price:1.8},
];
const collections = {
  categories:[{id:'c1',name:'Expediente'},{id:'c2',name:'Limpeza'},{id:'c3',name:'EPI'},{id:'c4',name:'Informática'}],
  suppliers:[{id:'s1',name:'Papelaria Central',email:'contato@papelaria.test',phone:'(41) 3333-1010'},{id:'s2',name:'SupriMais',email:'vendas@suprimais.test',phone:'(41) 3333-2020'}],
  locations:[{id:'l1',name:'Prateleira A-01',description:'Corredor A'},{id:'l2',name:'Prateleira B-03',description:'Corredor B'},{id:'l3',name:'Armário C-02',description:'EPI'}],
  users:[{id:'u1',name:'Mariana Costa',email:'mariana@estoque.test',role:'Administradora'},{id:'u2',name:'Rafael Lima',email:'rafael@estoque.test',role:'Operador'},{id:'u3',name:'João Pedro',email:'joao@estoque.test',role:'Operador'}],
};
const movements = [
  {id:'m1',product:'Papel A4 75g',sku:'MAT-001',type:'Entrada',quantity:50,user:'Mariana Costa',reason:'Reposição',date:new Date().toISOString()},
  {id:'m2',product:'Mouse óptico USB',sku:'INF-008',type:'Saída',quantity:3,user:'Rafael Lima',reason:'Uso interno',date:new Date(Date.now()-3600000).toISOString()},
];
const headers={'Access-Control-Allow-Origin':'http://localhost:3000','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(req.method==='OPTIONS'){res.writeHead(204,headers);return res.end();}
  const send=(status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data));};
  const body=async()=>{let raw='';for await(const part of req)raw+=part;return JSON.parse(raw||'{}');};
  if(url.pathname==='/api/health'&&req.method==='GET')return send(200,{status:'ok',service:'inventario-backend',mode:'test',timestamp:new Date().toISOString()});
  if(url.pathname==='/api/products'&&req.method==='GET')return send(200,products);
  if(url.pathname==='/api/products'&&req.method==='POST'){
    try{const data=await body();const sku=String(data.sku||'').trim().toUpperCase();if(!data.name||!sku)return send(400,{error:'Nome e SKU são obrigatórios.'});if(products.some(p=>p.sku===sku))return send(409,{error:'Este SKU já está cadastrado.'});const item={id:randomUUID(),sku,name:String(data.name).trim(),category:String(data.category||'Geral'),quantity:Math.max(0,Number(data.quantity||0)),minimum:Math.max(0,Number(data.minimum||0)),location:String(data.location||'Sem local'),price:Math.max(0,Number(data.price||0))};products.unshift(item);return send(201,item);}catch{return send(400,{error:'JSON inválido.'});}
  }
  if(url.pathname==='/api/movements'&&req.method==='GET')return send(200,movements);
  if(url.pathname==='/api/movements'&&req.method==='POST'){
    try{const data=await body(),product=products.find(p=>p.id===data.productId||p.sku===data.sku),quantity=Number(data.quantity);if(!product)return send(404,{error:'Produto não encontrado.'});if(!Number.isInteger(quantity)||quantity<1)return send(400,{error:'Informe uma quantidade inteira maior que zero.'});const normalized=String(data.type||'Entrada').normalize('NFD').replace(/[\u0300-\u036f]/g,'');const type=normalized==='Saida'?'Saída':'Entrada';if(type==='Saída'&&product.quantity<quantity)return send(409,{error:'Estoque insuficiente para esta saída.'});product.quantity+=type==='Entrada'?quantity:-quantity;product.location=String(data.location||product.location);const item={id:randomUUID(),product:product.name,sku:product.sku,type,quantity,user:String(data.user||'Mariana Costa'),reason:String(data.reason||''),date:new Date().toISOString()};movements.unshift(item);return send(201,item);}catch{return send(400,{error:'JSON inválido.'});}
  }
  const route=url.pathname.match(/^\/api\/(categories|suppliers|locations|users)$/);
  if(route){const key=route[1],items=collections[key];if(req.method==='GET')return send(200,items);if(req.method==='POST'){try{const data=await body(),name=String(data.name||'').trim();if(!name)return send(400,{error:'O nome é obrigatório.'});const item={id:randomUUID(),...data,name};items.unshift(item);return send(201,item);}catch{return send(400,{error:'JSON inválido.'});}}}
  return send(404,{error:'Rota não encontrada.'});
});
const port=Number(process.env.PORT||4000);
server.listen(port,'0.0.0.0',()=>console.log(`API de testes ativa em http://localhost:${port}`));
