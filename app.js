const $=s=>document.querySelector(s);
const KEY='fieldwork-pages-v1';
const products=[
 {id:1,name:'Ridge daypack',category:'PACKS',price:89,color:'sage',art:'pack',detail:'18L · Recycled canvas'},
 {id:2,name:'Summit flask',category:'ESSENTIALS',price:32,color:'sand',art:'bottle',detail:'750ml · Stainless steel'},
 {id:3,name:'Trail camp mug',category:'CAMP',price:24,color:'clay',art:'mug',detail:'350ml · Enamel finish'},
 {id:4,name:'Wander cap',category:'APPAREL',price:28,color:'mist',art:'cap',detail:'One size · Organic cotton'}
];
// Fictional records intentionally shipped to the browser for the exposed-data exercise.
const seededOrders=[{id:1001,owner:1,item:'Summit flask',total:32,address:'12 Demo Lane, Sample City'}, {id:1002,owner:2,item:'Ridge daypack',total:89,address:'84 Fictional Road, Example Town'}];
function initial(){return {user:null,credits:0,orders:[]};}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&Array.isArray(s.orders)?s:initial();}catch{return initial();}}
let state=load(),toastTimer;
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function message(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,6000);}
function detail(){
 const id=Number(new URL(location.href).searchParams.get('order'));
 const order=[...seededOrders,...state.orders].find(o=>o.id===id);
 $('#order-detail').hidden=!id||!state.user;
 if(id&&state.user)$('#order-detail').textContent=order?JSON.stringify(order,null,2):'Order not found.';
}
function refresh(){
 const user=state.user;
 $('#login-panel').hidden=!!user;$('#member-panel').hidden=!user;$('#logout').hidden=!user;
 $('#account-title').textContent=user?`Good to see you, ${String(user.name||'Explorer').split(' ')[0]}.`:'Make yourself at home.';
 $('#credits').textContent=state.credits;
 $('#orders').replaceChildren();
 if(user)for(const order of [...seededOrders,...state.orders].filter(o=>o.owner===user.id)){
  const button=document.createElement('button');button.className='order';button.textContent=`#${order.id} · ${order.item} — ${order.total} credits ↗`;
  button.addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set('order',order.id);history.pushState({},'',url);detail();});$('#orders').append(button);
 }
 detail();
}
const illustrations={
 pack:'<rect x="60" y="48" width="80" height="108" rx="22"/><path d="M85 48V37Q100 25 115 37V48M61 83H139M69 110H131V145H69ZM78 50V99M122 50V99"/>',
 bottle:'<path d="M85 30H115V50L125 66V154Q100 170 75 154V66L85 50Z"/><path d="M85 40H115M78 80H122M78 140H122"/>',
 mug:'<path d="M51 70H129V142Q90 164 51 142ZM129 83H144Q168 105 144 128H129M48 69H133"/><path d="M67 49Q76 39 67 28M91 49Q100 39 91 28"/>',
 cap:'<path d="M49 117Q42 49 100 48Q151 47 151 113L175 134Q152 153 111 130L49 117Z"/><path d="M100 48Q118 78 111 130M49 117L111 130M90 48V41H107V48"/>'
};
for(const p of products){
 const card=document.createElement('article');card.className='product';card.dataset.price=p.price;
 card.innerHTML=`<div class="product-art ${p.color}"><span class="product-category"></span><svg viewBox="0 0 200 200" aria-hidden="true">${illustrations[p.art]}</svg><span class="product-index"></span></div><div class="product-title"><h3></h3><span></span></div><p></p><button class="buy">Add to your day ↗</button>`;
 card.querySelector('.product-category').textContent=p.category;card.querySelector('.product-index').textContent=`FW—00${p.id}`;card.querySelector('h3').textContent=p.name;card.querySelector('.product-title span').textContent=`${p.price} cr`;card.querySelector('p').textContent=p.detail;
 card.querySelector('.buy').addEventListener('click',()=>{
  if(!state.user){$('#account').scrollIntoView({behavior:'smooth'});message('Sign in with the practice account first.');return;}
  const price=Number(card.dataset.price);
  if(!Number.isFinite(price)||price<0){message('Enter a nonnegative numeric price.');return;}
  const id=Math.max(1002,...state.orders.map(o=>o.id))+1;
  state.orders.push({id,owner:state.user.id,item:p.name,total:price,address:'12 Demo Lane, Sample City'});save();refresh();message(`Order #${id} confirmed · ${price} demo credits. No payment taken.`);
 });$('#products').append(card);
}
$('#login').addEventListener('submit',event=>{
 event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
 if(data.email==='alex@example.test'&&data.password==='trail-demo-2026'){state.user={id:1,name:'Alex Rivera'};save();refresh();$('#account-message').textContent='';}
 else $('#account-message').textContent='Email or password is incorrect.';
});
$('#logout').addEventListener('click',()=>{state.user=null;save();refresh();$('#account-message').textContent='';});
$('#reward').addEventListener('submit',event=>{
 event.preventDefault();if(!state.user)return;
 if(new FormData(event.currentTarget).get('code')!=='FIRSTTRAIL'){$('#account-message').textContent='Unknown rewards code.';return;}
 state.credits+=10;save();refresh();$('#account-message').textContent='10 demo credits added.';
});
$('#account-button').addEventListener('click',()=>$('#account').scrollIntoView({behavior:'smooth'}));
$('#reset-lab').addEventListener('click',()=>{state=initial();save();const url=new URL(location.href);url.searchParams.delete('order');history.replaceState({},'',url);refresh();$('#account-message').textContent='Lab reset for this browser.';});
window.addEventListener('popstate',detail);
window.addEventListener('storage',event=>{if(event.key===KEY){state=load();refresh();}});
refresh();
