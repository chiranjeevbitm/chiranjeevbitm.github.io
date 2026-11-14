/* Arogya Rx demo: router, language + theme, landing renderers, and the clinic app (home, schedule, intake, OPD, patients, settings). */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const X=window.ARX;const svg=X.svg;
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};

/* ---------------- language & theme ---------------- */
let LANG=(document.documentElement.lang==='hi')?'hi':'en';
const t=k=>(I18N[LANG]&&I18N[LANG][k])||I18N.en[k]||k;
const L=o=>o&&typeof o==='object'?(o[LANG]||o.en):o;
function applyLang(){
 document.documentElement.lang=LANG;
 $$('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n);});
 $$('[data-i18n-ph]').forEach(e=>{e.placeholder=t(e.dataset.i18nPh);});
 $$('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===LANG?'true':'false'));
 renderLanding();
 if(!$('#page-app').hidden)renderApp();
}
function setLang(l){LANG=l;try{localStorage.setItem('arx-lang',l);}catch(e){}applyLang();}
function setTheme(th){document.documentElement.setAttribute('data-theme',th);try{localStorage.setItem('arx-theme',th);}catch(e){}
 $('#themeBtn').innerHTML=th==='dark'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';}

/* ---------------- landing ---------------- */
let ff='all',bill='m';
function renderLanding(){
 const F=X.FEATURES;
 ['all','live','pilot','road'].forEach(k=>{const el=$('#fc-'+k);if(el)el.textContent=k==='all'?F.length:F.filter(f=>f.st===k).length;});
 const stLbl={live:t('feat.live'),pilot:t('feat.pilot'),road:t('feat.road')},stCls={live:'good',pilot:'acc',road:'warn'};
 $('#fgrid').innerHTML=F.filter(f=>ff==='all'||f.st===ff).map((f,i)=>`<article class="fcard"><div class="top-row"><span class="ic">${svg(f.ic)}</span><span class="tag ${stCls[f.st]}">${esc(stLbl[f.st])}</span></div><h3>${esc(L(f.t))}</h3><p>${esc(L(f.d))}</p><div class="phase">${esc(f.ph)}</div></article>`).join('');
 $('#road').innerHTML=X.ROADMAP.map(r=>`<div class="phase-card ${r.now?'now':''}">${r.now?`<span class="tag acc" style="align-self:flex-start">${LANG==='hi'?'अभी':'Now'}</span>`:''}<div class="when">${esc(r.when)}</div><h3>${esc(L(r.t))}</h3><ul>${L(r.items).map(i=>`<li>${esc(i)}</li>`).join('')}</ul><div class="gate">${esc(L(r.gate))}</div></div>`).join('');
 $('#plans').innerHTML=X.PLANS.map(p=>{const price=bill==='m'?p.m:p.y;const per=bill==='m'?(LANG==='hi'?'/ महीना':'/ month'):(LANG==='hi'?'/ साल':'/ year');
  return `<div class="plan ${p.feat?'feat':''}">${p.feat?`<span class="tag acc" style="align-self:flex-start">${LANG==='hi'?'ज़्यादातर क्लिनिक':'Most clinics'}</span>`:''}<h3>${esc(L(p.t))}</h3><div class="price">₹${price.toLocaleString('en-IN')}<small> ${price?per:''}${p.per?(LANG==='hi'?' प्रति डॉक्टर':' per doctor'):''}</small></div><ul>${L(p.items).map(i=>`<li>${esc(i)}</li>`).join('')}</ul><p class="note">${esc(L(p.note))}</p><a class="btn ${p.feat?'primary':''}" href="${p.m?'#contact':'#login'}">${p.m?(LANG==='hi'?'डेमो विज़िट माँगें':'Book a demo visit'):(LANG==='hi'?'मुफ़्त शुरू करें':'Start free')}</a></div>`;}).join('');
 $('#teamGrid').innerHTML=X.TEAM.map(m=>`<div class="member"><span class="pic">${esc(m.ini)}</span><h3>${esc(m.name)}</h3><div class="role">${esc(L(m.role))}</div><p>${esc(L(m.bio))}</p><div class="links">${m.links.map(l=>`<a class="btn sm" href="${l[1]}" ${l[1].startsWith('http')||l[1].endsWith('.pdf')?'target="_blank" rel="noopener"':''}>${esc(l[0])}</a>`).join('')}</div></div>`).join('');
 $('#faqGrid').innerHTML=X.FAQ.map(q=>`<details><summary>${esc(L(q[0]))}</summary><p>${esc(L(q[1]))}</p></details>`).join('');
 renderPapers();
}

/* ---------------- clinic state ---------------- */
const FORM={tab:'TAB.',cap:'CAP.',syp:'SYP.',inh:'INH.',sach:'SACHET'};
const FREQ={'1-0-0':{en:'morning',hi:'सुबह',n:1},'0-1-0':{en:'afternoon',hi:'दोपहर',n:1},'0-0-1':{en:'night',hi:'रात को',n:1},'1-0-1':{en:'morning & night',hi:'सुबह और रात',n:2},'1-1-1':{en:'thrice daily',hi:'सुबह, दोपहर और रात',n:3},'SOS':{en:'when needed',hi:'ज़रूरत पड़ने पर',n:1},'Weekly':{en:'once a week',hi:'हफ़्ते में एक बार',n:1/7}};
const TIMING={after:{en:'after food',hi:'खाने के बाद'},before:{en:'before food',hi:'खाने से पहले'},empty:{en:'empty stomach',hi:'खाली पेट'},any:{en:'',hi:''}};
const DRUG=Object.fromEntries(X.DRUGS.map(d=>[d.id,d]));
const LH0={doctor:'Dr. Rakesh Sinha',doctorHi:'डॉ. राकेश सिन्हा',degrees:'MBBS, MD (General Medicine)',reg:'BCMR 00000 (sample)',clinic:'Sinha Clinic',clinicHi:'सिन्हा क्लिनिक',address:'Club Road, near Kalyani Chowk, Muzaffarpur, Bihar 842001',phone:'+91 90000 00000',timings:'सुबह 8–11 · शाम 5–8 · रविवार बंद',ink:'#1d3a8a',layout:'center',fee:500};
const INKS=[['#1d3a8a','Ink blue'],['#7a1f2b','Maroon'],['#1f5e46','Green'],['#23262e','Black']];
let uid=0;
const defDose=d=>d.f==='syp'?'10 ml':d.f==='inh'?'2 puffs':'1';
const mkMed=a=>({uid:++uid,id:a[0],freq:a[1],timing:a[2],days:a[3],dose:a[4]||defDose(DRUG[a[0]])});
const newRx=()=>({co:'',v:{bp:'',pulse:'',temp:'',spo2:'',wt:'',grbs:''},dx:'',meds:[],inv:[],adv:[],fu:0,hindi:true});
function rxFrom(key,co,v){const T=X.TPL[key];const r=newRx();r.co=co||'';Object.assign(r.v,v||{});r.dx=T.dx;r.meds=T.meds.map(mkMed);r.inv=T.inv.slice();r.adv=T.adv.slice();r.fu=T.fu;return r;}
function seed(){uid=0;
 const P=JSON.parse(JSON.stringify(X.PATIENTS));
 P.forEach(p=>{p.id='p'+p.tok;p.visits=p.visits||[];p.rx=p.tpl?rxFrom(p.tpl,p.co,p.v):newRx();if(!p.tpl)p.rx.co=p.co;});
 const r=P.find(p=>p.tok===3);r.rx=rxFrom('dm','Sugar follow-up. Tingling in both feet for 2 months.',{bp:'138/86',pulse:'82',spo2:'98',wt:'74',grbs:'186'});r.rx.dx='Type 2 DM with early peripheral neuropathy';r.rx.meds.push(mkMed(['bcomp','1-0-0','after',30]));r.rx.inv.push('Lipid profile');r.start=Date.now()-17000;
 const appts=P.map(p=>({id:'a'+p.tok,pid:p.id,name:p.name,phone:p.phone,day:0,time:p.slot,reason:p.co,src:p.src,status:p.status==='done'?'seen':'arrived'}));
 [['Kavita Sharma','10:40','Thyroid review, fatigue','WhatsApp',0],['Mahesh Yadav','11:00','HTN review','WhatsApp',1],['Rubi Khatoon','09:20','ANC follow-up','Walk-in',1],['Vinod Paswan','10:00','COPD review','WhatsApp',2],['Neha Gupta','08:40','Acne, PCOS review','WhatsApp',3]].forEach((a,i)=>appts.push({id:'b'+i,pid:null,name:a[0],phone:'9xxxxx'+(1200+i*37),day:a[4],time:a[1],reason:a[2],src:a[3],status:'booked'}));
 return {lh:Object.assign({},LH0,store.get('arx-lh',{})),patients:P,appts,cur:'p3',sent:3,doc:'rx',userShot:false,chat:[],chatDone:false};}
let S=seed();
const cur=()=>S.patients.find(p=>p.id===S.cur);

/* helpers */
const today=new Date();
const addDays=n=>{const d=new Date(today);d.setDate(d.getDate()+n);return d;};
const fmtD=d=>d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const fmtHi=d=>{try{return d.toLocaleDateString('hi-IN',{day:'numeric',month:'long'});}catch(e){return fmtD(d);}};
const fmtT=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const doseNum=m=>m.dose==='½'?0.5:(parseFloat(m.dose)||1);
function qty(m){const d=DRUG[m.id];if(d.f==='syp'||d.f==='inh')return 1;if(m.freq==='Weekly')return Math.ceil(m.days/7);return Math.ceil((FREQ[m.freq]||{n:1}).n*m.days*doseNum(m));}
function cost(rx){let b=0,j=0;rx.meds.forEach(m=>{const d=DRUG[m.id],q=qty(m);b+=q*d.bp;j+=q*d.jp;});return {b,j,s:b-j};}
const sigCode=m=>/^\d-\d-\d$/.test(m.freq)?m.freq.split('-').join(' – '):m.freq;
function doseEn(m,d){if(d.f==='tab')return m.dose+' tab';if(d.f==='cap')return m.dose+' cap';if(d.f==='sach')return '1 sachet in 1 L water';return m.dose;}
function doseHi(m,d){if(d.f==='tab')return m.dose+' गोली';if(d.f==='cap')return m.dose+' कैप्सूल';if(d.f==='inh')return m.dose.replace('puffs','पफ');if(d.f==='sach')return '1 पैकेट, 1 लीटर पानी में घोलकर';return m.dose;}
const daysHi=m=>m.freq==='Weekly'?Math.round(m.days/7)+' हफ़्ते':m.days+' दिन';
const daysEn=m=>m.freq==='Weekly'?Math.round(m.days/7)+' weeks':m.days+' days';
function vflag(k,val){val=String(val||'').trim();if(!val)return '';
 if(k==='bp'){const p=val.split('/').map(Number);if(p.length<2||isNaN(p[0])||isNaN(p[1]))return '';if(p[0]>=180||p[1]>=110)return 'crit';if(p[0]>=140||p[1]>=90||p[0]<90)return 'warn';return 'ok';}
 const n=parseFloat(val);if(isNaN(n))return '';
 if(k==='pulse')return n>120||n<50?'crit':(n>100||n<60?'warn':'ok');
 if(k==='temp')return n>=103?'crit':(n>=99.5?'warn':'ok');
 if(k==='spo2')return n<90?'crit':(n<95?'warn':'ok');
 if(k==='grbs')return n>300||n<70?'crit':(n>180?'warn':'ok');return '';}
function alertsFor(p){const out=[];const rx=p.rx;
 rx.meds.forEach(m=>{const d=DRUG[m.id];
  if(p.all.includes('Sulfa')&&d.cls==='sulfa')out.push(['crit',`Allergy: ${p.name} is allergic to sulfa drugs. ${d.g} contains sulfamethoxazole. Remove it or confirm.`]);
  if(p.all.includes('Penicillin')&&d.cls==='pen')out.push(['crit',`Allergy: ${p.name} is allergic to penicillin. ${d.g} is a penicillin. Consider azithromycin or cefixime.`]);});
 const g={ah:'antihistamines',ppi:'acid reducers',pcm:'paracetamol-containing medicines',nsaid:'painkillers'};
 Object.keys(g).forEach(c=>{const ms=rx.meds.filter(m=>DRUG[m.id].cls===c);if(ms.length>1)out.push(['warn',`Duplicate: ${ms.length} ${g[c]} (${ms.map(m=>DRUG[m.id].g).join(', ')}).`]);});
 const seen={};rx.meds.forEach(m=>{if(seen[m.id])out.push(['warn',DRUG[m.id].g+' is listed twice.']);seen[m.id]=1;});
 if(p.cond.some(c=>c.startsWith('T2DM'))&&rx.meds.some(m=>DRUG[m.id].cls==='nsaid'))out.push(['warn','NSAID in a diabetic patient: check kidney function.']);
 return out;}

/* ---------------- the paper ---------------- */
function parchi(p){const Lh=S.lh,rx=p.rx,v=rx.v,fuDate=rx.fu?addDays(rx.fu):null;
 const vit=[['BP',v.bp,'bp','mmHg'],['Pulse',v.pulse,'pulse','/min'],['Temp',v.temp,'temp','°F'],['SpO₂',v.spo2,'spo2','%'],['GRBS',v.grbs,'grbs','mg/dL']].filter(x=>x[1]);
 const head=Lh.layout==='left'
  ?`<div class="lh left"><div class="lh-logo">℞</div><div><div class="lh-names"><span class="lh-hi">${esc(Lh.clinicHi)}</span><span class="lh-en">${esc(Lh.clinic)}</span></div><div class="lh-doc">${esc(Lh.doctor)} <span style="font-weight:500">· ${esc(Lh.doctorHi)}</span></div><div class="lh-deg">${esc(Lh.degrees)} · Reg. ${esc(Lh.reg)}</div><div class="lh-contact">${esc(Lh.address)} · ${esc(Lh.phone)}<br>${esc(Lh.timings)}</div></div></div>`
  :`<div class="lh center"><div class="lh-names"><span class="lh-hi">${esc(Lh.clinicHi)}</span><span class="lh-en">| ${esc(Lh.clinic)}</span></div><div class="lh-doc">${esc(Lh.doctor)}</div><div class="lh-deg">${esc(Lh.degrees)} · Reg. No. ${esc(Lh.reg)}</div><div class="lh-contact">${esc(Lh.address)} · ${esc(Lh.phone)}</div><div class="lh-contact">${esc(Lh.timings)}</div></div>`;
 const meds=rx.meds.length?rx.meds.map(m=>{const d=DRUG[m.id],tm=TIMING[m.timing]||TIMING.any;
  return `<li><div class="m-en"><b>${FORM[d.f]} ${esc(d.g)} ${esc(d.s.toUpperCase())}</b> <small>(${esc(d.b)})</small></div><div class="m-sig">${esc(doseEn(m,d))} · ${esc(sigCode(m))} · ${esc([FREQ[m.freq]?FREQ[m.freq].en:'',tm.en].filter(Boolean).join(', '))} · ${esc(daysEn(m))}</div>${rx.hindi?`<div class="m-hi">${esc(doseHi(m,d))} · ${esc(FREQ[m.freq]?FREQ[m.freq].hi:'')}${tm.hi?' · '+tm.hi:''} · ${esc(daysHi(m))}</div>`:''}</li>`;}).join('')
  :'<li style="list-style:none;color:var(--paper-muted)">Medicines appear here as you add them.</li>';
 return `<div class="parchi" style="--lh:${esc(Lh.ink)}"><div class="wm">DEMO · Chiranjeev Kumar</div>${head}
 <div class="prow"><div><span>Name</span><b>${esc(p.name)}</b></div><div><span>Age/Sex</span>${esc(p.age)} / ${esc(p.sex)}</div><div><span>Date</span>${fmtD(today)}</div><div><span>UHID</span>${esc(p.uhid||'—')}</div><div><span>Wt</span>${v.wt?esc(v.wt)+' kg':'—'}</div><div><span>Token</span>${esc(p.tok)}</div></div>
 <div class="pbody"><div class="pleft">
  ${rx.co?`<div><h5>C/O</h5><p>${esc(rx.co)}</p></div>`:''}
  ${vit.length?`<div><h5>O/E</h5><div class="pv">${vit.map(x=>`<span>${x[0]}</span><span class="${['crit','warn'].includes(vflag(x[2],x[1]))?'hi':''}">${esc(x[1])} ${x[3]}</span>`).join('')}</div></div>`:''}
  ${p.all.length?`<div><h5>Allergy</h5><p style="color:#B2261E;font-weight:600">${esc(p.all.join(', '))}</p></div>`:''}
  ${rx.dx?`<div><h5>Diagnosis</h5><p><b>${esc(rx.dx)}</b></p></div>`:''}
  ${rx.inv.length?`<div><h5>Investigations</h5><p>${esc(rx.inv.join(', '))}</p></div>`:''}
 </div><div class="pright" style="display:flex;flex-direction:column;gap:8px"><div class="rxs">℞</div><ol class="pmeds">${meds}</ol>
  ${rx.adv.length?`<div class="padv"><h5>Advice</h5>${rx.adv.map(i=>`<div>• ${esc(X.ADVICE[i].en)}${rx.hindi?` <span class="hi">/ ${esc(X.ADVICE[i].hi)}</span>`:''}</div>`).join('')}</div>`:''}
 </div></div>
 <div class="pfu"><div class="fu">${fuDate?`Follow-up: ${fmtD(fuDate)}${rx.hindi?` <span style="color:var(--lh)">(${esc(fmtHi(fuDate))} को दिखाएँ)</span>`:''}`:'&nbsp;'}</div><div class="sign"><div class="s">${esc(Lh.doctor)}</div><div class="l">${esc(Lh.doctor)} · ${esc(Lh.reg)}</div></div></div>
 <div class="pfoot"><span>Generic names as per NMC guidance · Valid for 7 days</span><span>Made with Arogya Rx</span></div></div>`;}
function renderPapers(){const p=cur()||S.patients[2];const h=parchi(p);['#heroPaper','#shotPaper','#sidePaper','#studioPaper'].forEach(s=>{const e=$(s);if(e)e.innerHTML=h;});}

/* ---------------- app shell ---------------- */
const VIEWS=[['home','home'],['schedule','cal'],['intake','inbox'],['opd','rx'],['patients','users'],['settings','gear']];
let VIEW='home';
function renderApp(){
 $('#sidebar').innerHTML=VIEWS.map(v=>`<button data-go="${v[0]}" ${VIEW===v[0]?'aria-current="page"':''}>${svg(v[1])}<span>${esc(t('app.'+v[0]))}</span></button>`).join('')+
  `<button data-act="logout">${svg('out')}<span>${esc(t('app.logout'))}</span></button><div class="doc"><span class="av">${esc(S.lh.doctor.replace(/^Dr\.?\s*/,'').split(' ').map(w=>w[0]).join('').slice(0,2))}</span><span><b>${esc(S.lh.doctor)}</b>${esc(S.lh.clinic)}</span></div>`;
 ({home:vHome,schedule:vSchedule,intake:vIntake,opd:vOpd,patients:vPatients,settings:vSettings})[VIEW]();
}
function go(v){VIEW=v;location.hash='#app-'+v;}

/* HOME */
const QUICK=['Diabetic patients with HbA1c above 7','Who is due for follow-up this week?','Summarise Ramesh Prasad','How many patients came on WhatsApp today?','Patients with allergies'];
let chatLog=[];
function answer(q){const s=q.toLowerCase();const P=S.patients;
 if(/hba1c|diabet|sugar/.test(s)){const r=P.filter(p=>p.hba1c&&p.hba1c>7||p.cond.some(c=>/T2DM/.test(c))&&(p.hba1c||0)>7);return `Found ${r.length} diabetic patients with HbA1c above 7%:<ul>${r.map(p=>`<li><b>${esc(p.name)}</b>, ${p.age}${p.sex}, HbA1c ${p.hba1c}% · token ${p.tok}</li>`).join('')}</ul>`;}
 if(/follow|due|recall/.test(s)){return `5 follow-ups are due in the next 5 days:<ul>${[['Ramesh Prasad','T2DM review',1],['Kavita Sharma','Thyroid review',2],['Mahesh Yadav','HTN review',2],['Rubi Khatoon','ANC follow-up',4],['Vinod Paswan','COPD review',5]].map(f=>`<li><b>${f[0]}</b> · ${f[1]} · ${fmtD(addDays(f[2]))}</li>`).join('')}</ul>WhatsApp reminders go out automatically the day before.`;}
 if(/ramesh|summar/.test(s)){const p=P.find(x=>x.tok===3);return `<b>Ramesh Prasad, 52M</b> · T2DM 6 years, HTN. HbA1c falling: 8.4 → 7.2% since February. Today: tingling in both feet for 2 months, GRBS 186. Consider screening for peripheral neuropathy. Current: Metformin SR 500 BD, Glimepiride 1 mg OD, Atorvastatin 10 HS.`;}
 if(/whatsapp|online|book/.test(s)){const n=S.appts.filter(a=>a.day===0&&a.src==='WhatsApp').length;return `${n} of today's ${S.appts.filter(a=>a.day===0).length} appointments were booked on WhatsApp.`;}
 if(/allerg/.test(s)){const r=P.filter(p=>p.all.length);return `${r.length} patients today have recorded allergies:<ul>${r.map(p=>`<li><b>${esc(p.name)}</b>: ${esc(p.all.join(', '))}</li>`).join('')}</ul>`;}
 const hit=P.filter(p=>s.split(/\s+/).some(w=>w.length>2&&(p.name.toLowerCase().includes(w)||p.co.toLowerCase().includes(w)||p.cond.join(' ').toLowerCase().includes(w))));
 if(hit.length)return `Matching patients:<ul>${hit.map(p=>`<li><b>${esc(p.name)}</b> · ${esc(p.co)}</li>`).join('')}</ul>`;
 return 'In the full product, Ask Arogya searches all your records in plain language. In this demo, try one of the suggestions.';}
function vHome(){const P=S.patients;const done=P.filter(p=>p.status==='done');const todays=S.appts.filter(a=>a.day===0&&a.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time));
 const avg=done.length?done.reduce((s,p)=>s+p.time,0)/done.length:0;
 $('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('home.hi'))} ${esc(S.lh.doctor.split(' ').slice(0,2).join(' '))}, ${esc(t('home.help'))}</h2><p>${today.toLocaleDateString(LANG==='hi'?'hi-IN':'en-IN',{weekday:'long',day:'numeric',month:'long'})} · ${esc(S.lh.clinic)}</p></div><button class="btn primary" data-go="opd">${svg('rx')} ${LANG==='hi'?'OPD खोलें':'Open OPD'}</button></div>
 <div class="kpis"><div class="kpi"><span>${LANG==='hi'?'आज देखे':'Seen today'}</span><b class="mono">${done.length}</b><small>of ${todays.length} appointments</small></div><div class="kpi"><span>${LANG==='hi'?'औसत समय':'Avg time per parchi'}</span><b class="mono">${fmtT(avg)}</b><small>save to save</small></div><div class="kpi"><span>WhatsApp</span><b class="mono">${S.sent}</b><small>parchis sent in Hindi</small></div><div class="kpi"><span>${LANG==='hi'?'मरीज़ों की बचत':'Patients saved'}</span><b class="mono">${inr(done.reduce((s,p)=>s+cost(p.rx).s,0))}</b><small>generics vs brands</small></div></div>
 <div class="grid2"><div class="card assistant"><h3>✦ Ask Arogya</h3><form class="q" id="askForm"><input class="inp" id="askIn" placeholder="${esc(t('home.ask'))}" autocomplete="off"><button class="btn primary" type="submit">Ask</button></form>
  <div class="chips" style="margin-top:10px">${QUICK.map(q=>`<button class="chip" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <div class="ans" id="ans">${chatLog.map(m=>`<div class="msg ${m[0]}">${m[1]}</div>`).join('')||'<div class="msg ai">Ask about your patients in plain words. Try a suggestion above.</div>'}</div></div>
  <div class="card"><h3>${esc(t('home.today'))}</h3>${todays.map(a=>{const p=a.pid&&P.find(x=>x.id===a.pid);return `<div class="appt"><span class="av">${esc(a.name.split(' ').map(w=>w[0]).join('').slice(0,2))}</span><span style="min-width:0"><b>${esc(a.name)}</b><br><small style="color:var(--muted)">${esc(a.time)} · ${esc(a.reason)} · ${esc(a.src)}</small></span>${p?(p.status==='done'?'<span class="tag good">Seen</span>':`<button class="btn sm" data-start="${p.id}">${esc(t('home.start'))}</button>`):`<span class="tag">${esc(a.status)}</span>`}</div>`;}).join('')}</div></div>`;
 $('#askForm').addEventListener('submit',e=>{e.preventDefault();ask($('#askIn').value);});}
function ask(q){q=(q||'').trim();if(!q)return;chatLog.push(['me',esc(q)]);chatLog.push(['ai',answer(q)]);chatLog=chatLog.slice(-6);vHome();}

/* SCHEDULE */
let sDay=0;
function vSchedule(){const list=S.appts.filter(a=>a.day===sDay).sort((a,b)=>a.time.localeCompare(b.time));
 $('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('app.schedule'))}</h2><p>Patients book on WhatsApp or at the desk. Arrived patients get a token in your OPD queue.</p></div></div>
 <div class="dates">${[0,1,2,3,4,5,6].map(d=>{const dt=addDays(d);return `<button class="date" data-day="${d}" aria-pressed="${d===sDay}"><small>${dt.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>${dt.getDate()}</b><small>${S.appts.filter(a=>a.day===d&&a.status!=='cancelled').length} appts</small></button>`;}).join('')}</div>
 <div class="card"><h3>${fmtD(addDays(sDay))} · ${list.length} appointments</h3>${list.length?list.map(a=>`<div class="slot ${a.status==='cancelled'?'cancelled':''}"><b class="mono">${esc(a.time)}</b><span class="av">${esc(a.name.split(' ').map(w=>w[0]).join('').slice(0,2))}</span><span style="min-width:0"><b>${esc(a.name)}</b> <span class="tag ${a.src==='WhatsApp'?'good':''}">${esc(a.src)}</span><br><small style="color:var(--muted)">${esc(a.reason)} · ${esc(a.phone)}</small></span><span class="acts">${a.status==='booked'?`<button class="btn sm primary" data-arrive="${a.id}">Mark arrived</button><button class="btn sm" data-resched="${a.id}">+1 day</button><button class="btn sm" data-cancel="${a.id}">Cancel</button>`:`<span class="tag ${a.status==='seen'?'good':a.status==='cancelled'?'crit':'acc'}">${esc(a.status)}</span>`}</span></div>`).join(''):'<div class="empty">No appointments. Add one below.</div>'}</div>
 <form class="card addform" id="apptForm"><div class="field"><label for="ap-name">Patient name</label><input class="inp" id="ap-name" required></div><div class="field"><label for="ap-phone">Mobile</label><input class="inp" id="ap-phone"></div><div class="field"><label for="ap-time">Time</label><input class="inp" id="ap-time" type="time" value="11:20" required></div><div class="field"><label for="ap-reason">Reason</label><input class="inp" id="ap-reason" placeholder="e.g. fever, BP check"></div><button class="btn primary" type="submit">${esc(t('common.add'))}</button></form>`;
 $('#apptForm').addEventListener('submit',e=>{e.preventDefault();S.appts.push({id:'n'+Date.now(),pid:null,name:$('#ap-name').value.trim(),phone:$('#ap-phone').value||'—',day:sDay,time:$('#ap-time').value,reason:$('#ap-reason').value||'General check-up',src:'Desk',status:'booked'});toast('Appointment added. WhatsApp confirmation sent (demo).');vSchedule();});}
function arrive(id){const a=S.appts.find(x=>x.id===id);if(!a)return;const tok=Math.max(...S.patients.map(p=>p.tok))+1;
 const p={tok,id:'p'+tok,name:a.name,age:35,sex:'F',phone:a.phone,uhid:'SC-0'+(600+tok),status:'waiting',co:a.reason,cond:[],all:[],visits:[],rx:newRx(),slot:a.time,src:a.src};p.rx.co=a.reason;
 p.voice={text:'Teen din se bukhar aur body ache. BP 120 by 80, temp 100.6. Viral fever. Paracetamol 650 teen baar, cetirizine raat ko. CBC. Teen din baad.',tpl:'fever',co:a.reason,v:{bp:'120/80',temp:'100.6'},dx:'Acute febrile illness (viral)'};
 if(/thyroid/i.test(a.reason)){p.cond=['Hypothyroid'];p.age=38;}
 S.patients.push(p);a.pid=p.id;a.status='arrived';a.day=0;toast(`Token ${tok} created for ${a.name}`);}

/* INTAKE */
function vIntake(){
 $('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('app.intake'))}</h2><p>Before the visit: WhatsApp booking with symptoms and reports. At the visit: photograph the patient's old prescriptions and lab slips.</p></div></div>
 <div class="grid2"><div class="card"><h3>WhatsApp booking assistant</h3><p style="color:var(--muted);font-size:14px;margin-bottom:10px">A patient messages your clinic number. The assistant books the slot, asks for symptoms and reports, and prepares a summary for you.</p>
  <div class="phone"><div class="wa-top"><span class="av"></span><span><b>${esc(S.lh.clinic)}</b><small>Business account · auto-replies</small></span></div><div class="wa-body" id="waBody">${S.chat.map(bubble).join('')}</div></div>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-act="play-chat" ${S.chatDone?'disabled':''}>${S.chatDone?'Booking received':S.chat.length?'Receiving…':'Play an incoming booking'}</button>${S.chatDone?'<button class="btn" data-act="reset-chat">Replay</button>':''}</div>
  ${S.chatDone?`<div class="summary" style="margin-top:12px"><b>Pre-visit summary · Kavita Sharma, 38F · token 9 · 10:40</b><br>Known hypothyroid on levothyroxine. Fatigue and hair fall for 2 weeks. TSH report attached (7.8 mIU/L, high). Suggest reviewing thyroxine dose.<div style="margin-top:8px"><button class="btn sm primary" data-act="chat-to-queue">Add to today's queue</button></div></div>`:''}
 </div>
 <div class="card"><h3>Photo intake</h3><div class="seg" role="group" aria-label="Document type" style="margin-bottom:10px"><button data-doc="rx" aria-pressed="${S.doc==='rx'}">Old prescription</button><button data-doc="lab" aria-pressed="${S.doc==='lab'}">Lab report</button></div>
  <div class="drop-zone" id="dropZone"><div class="shot-img" id="shotWrap"></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><label class="btn primary" for="fileIn">Upload a photo</label><input id="fileIn" type="file" accept="image/*" capture="environment" hidden><button class="btn" data-act="sample-shot">Use sample photo</button></div><small style="color:var(--muted)">Drop a JPG or PNG here. On a phone, this opens the camera.</small></div>
  <div style="margin-top:12px"><div class="fs-h"><span class="lbl">Extracted for ${esc((cur()||{}).name||'—')}</span><span class="tag" id="intakeState">Waiting</span></div><div id="extract"></div></div>
 </div></div>`;
 sampleShot();
 const dz=$('#dropZone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('over');}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('over');}));dz.addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files[0];if(f)readFile(f);});}
function bubble(m){return `<div class="bub ${m[0]==='in'?'in':''}">${esc(m[1])}<div class="tm">${m[0]==='in'?'':'✓✓'}</div></div>`;}
function playChat(){S.chat=[];S.chatDone=false;vIntake();let i=0;const step=()=>{if(i>=X.INTAKE_CHAT.length){S.chatDone=true;vIntake();return;}S.chat.push(X.INTAKE_CHAT[i++]);const b=$('#waBody');if(b){b.insertAdjacentHTML('beforeend',bubble(S.chat[S.chat.length-1]));b.scrollTop=b.scrollHeight;}setTimeout(step,reduce?0:900);};step();}
const SAMPLE={
 rx:{title:'Handwritten prescription · 3 Mar 2026',lines:['C/O cough, fever x 4 days','Rx','1) T. Azee 500   1-0-0 x 3d','2) T. Pan D       1-0-0 BF x 10d','3) Syp Ascoril LS  2 tsp TDS','4) T. Dolo 650   SOS','Adv: CBC, steam'],
  items:[['Medicine','AZITHROMYCIN 500 mg · 1-0-0 · 3 days',96,'azi500'],['Medicine','PANTOPRAZOLE + DOMPERIDONE · before food · 10 days',91,'rabdsr'],['Medicine','AMBROXOL + LEVOSALBUTAMOL syrup · 10 ml thrice daily',88,'coughls'],['Medicine','PARACETAMOL 650 mg · when needed',97,'pcm650'],['Complaint','Cough and fever for 4 days',93,null],['Test','CBC',90,null]]},
 lab:{title:'Lab report · Shree Diagnostics · 22 Oct 2026',lines:['Test            Result    Ref range','Haemoglobin     9.1 g/dL  12-15','HbA1c           7.2 %     <5.7','FBS             132 mg/dL 70-100','S. Creatinine   1.1 mg/dL 0.6-1.2','TSH             3.4 mIU/L 0.4-4.0'],
  items:[['Lab','Haemoglobin 9.1 g/dL · low (12–15)',98,'low'],['Lab','HbA1c 7.2% · high (<5.7)',97,'high'],['Lab','FBS 132 mg/dL · high (70–100)',96,'high'],['Lab','S. creatinine 1.1 mg/dL · normal',95,'ok'],['Lab','TSH 3.4 mIU/L · normal',94,'ok']]}};
function sampleCanvas(kind){const c=document.createElement('canvas');c.width=640;c.height=kind==='rx'?470:400;const g=c.getContext('2d');const p=cur();
 g.fillStyle='#fbfaf6';g.fillRect(0,0,c.width,c.height);
 if(kind==='rx'){g.strokeStyle='#c9cfdc';for(let y=110;y<c.height;y+=42){g.beginPath();g.moveTo(24,y);g.lineTo(616,y);g.stroke();}
  g.fillStyle='#7a1f2b';g.font='700 26px Georgia, serif';g.fillText('Jha Clinic',24,46);g.font='15px Georgia, serif';g.fillText('Dr. S. N. Jha, MBBS · Sitamarhi',24,72);
  g.fillStyle='#22306b';g.font='500 30px Caveat, "Segoe Print", cursive';let y=104;g.fillText((p?p.name+'   '+p.age+'/'+p.sex:'Patient'),40,y);y+=42;
  SAMPLE.rx.lines.forEach((ln,i)=>{g.save();g.translate(40+(i%2)*4,y);g.rotate((i%3-1)*0.006);g.fillText(ln,0,0);g.restore();y+=42;});}
 else{g.fillStyle='#0f3d6e';g.fillRect(0,0,c.width,64);g.fillStyle='#fff';g.font='700 22px Arial, sans-serif';g.fillText('SHREE DIAGNOSTICS',24,40);g.font='13px Arial';g.fillText('Muzaffarpur',520,40);
  g.fillStyle='#222';g.font='15px Arial';g.fillText('Patient: '+(p?p.name+'  '+p.age+'/'+p.sex:'—')+'      Date: 22-10-2026',24,96);
  let y=140;SAMPLE.lab.lines.forEach((ln,i)=>{g.font=(i?'':'600 ')+'15px "Courier New", monospace';g.fillText(ln,24,y);if(!i)g.fillRect(24,y+8,592,1);y+=40;});
  g.font='italic 12px Arial';g.fillStyle='#777';g.fillText('Sample report for demo only',24,c.height-18);}
 return c;}
function showShot(src){const w=$('#shotWrap');if(!w)return;w.innerHTML='';if(src instanceof HTMLCanvasElement)w.appendChild(src);else{const im=new Image();im.alt='Uploaded document';im.src=src;w.appendChild(im);}
 const sl=document.createElement('div');sl.className='scanline';w.appendChild(sl);$('#intakeState').className='tag acc';$('#intakeState').textContent='Reading…';$('#extract').innerHTML='<p style="color:var(--muted);font-size:14px">Finding text, separating medicines from notes, matching names to the catalogue…</p>';
 setTimeout(()=>{sl.remove();renderExtract();},reduce?0:1400);}
function renderExtract(){const s=SAMPLE[S.doc];const p=cur();const st=$('#intakeState');if(!st)return;st.className='tag good';st.textContent='Done · '+s.items.length+' items';
 $('#extract').innerHTML=`<div style="font-weight:600;margin:6px 0 4px">${esc(s.title)}</div>${S.userShot?'<p style="font-size:13px;color:var(--warn)">Demo: your photo is shown, but the result below is a sample. The real app reads it with document AI.</p>':''}
 ${s.items.map(it=>`<div class="ex-row"><span class="tag ${it[0]==='Lab'?(['low','high'].includes(it[3])?'warn':'good'):'acc'}">${it[0]}</span><span>${esc(it[1])}</span><span class="conf">${it[2]}%</span></div>`).join('')}
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn primary sm" data-act="intake-history">Add to ${esc(p?p.name:'patient')}'s history</button><button class="btn sm" data-act="intake-rx">${S.doc==='rx'?'Continue these medicines today':'Add abnormal values to notes'}</button></div>`;}
function sampleShot(){S.userShot=false;showShot(sampleCanvas(S.doc));}
function readFile(f){if(!/^image\//.test(f.type)){toast('Please choose a photo (JPG or PNG)');return;}const r=new FileReader();r.onload=()=>{S.userShot=true;showShot(r.result);};r.readAsDataURL(f);}
function intakeTo(kind){const p=cur();if(!p){toast('Open a patient in OPD first');return;}const s=SAMPLE[S.doc];
 if(kind==='history'){p.visits.unshift([S.doc==='rx'?'3 Mar 2026':'22 Oct 2026',S.doc==='rx'?'Old prescription (scanned)':'Lab report (scanned)',s.items.map(i=>i[1].split(' · ')[0]).join(', ')]);toast(`Added to ${p.name}'s history`);}
 else{if(S.doc==='rx'){s.items.filter(i=>i[3]&&DRUG[i[3]]).forEach(i=>p.rx.meds.push(mkMed([i[3],i[3]==='pcm650'?'SOS':i[3]==='coughls'?'1-1-1':'1-0-0',i[3]==='rabdsr'?'before':'after',5])));toast("Medicines added to today's parchi");}
  else{const ab=s.items.filter(i=>['low','high'].includes(i[3])).map(i=>i[1].split(' · ')[0]);p.rx.co=(p.rx.co?p.rx.co+' ':'')+'Reports: '+ab.join(', ')+'.';toast('Abnormal values added to complaints');}
  go('opd');}}

/* OPD */
function vOpd(){$('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('app.opd'))}</h2><p>Call a token, tap a template or speak the consult. Try adding Cotrimoxazole for Sita Devi to see the allergy check.</p></div><button class="btn" data-act="reset">Reset demo</button></div>
 <div class="opd"><aside class="queue"><h3><span>Tokens</span><span class="mono" id="qCount"></span></h3><div class="q-list" id="qList"></div></aside><div class="consult" id="consult"></div><aside class="side"><div class="side-h"><b>Live parchi</b><span class="tag acc">updates as you type</span></div><div id="sidePaper"></div></aside></div>`;
 renderQueue();renderConsult();}
function renderQueue(){const P=S.patients;const q=$('#qList');if(!q)return;$('#qCount').textContent=P.filter(p=>p.status==='done').length+'/'+P.length;
 q.innerHTML=P.map(p=>`<button class="q-item ${p.id===S.cur?'on':''} ${p.status==='done'?'done':''}" data-open="${p.id}"><span class="q-tok">${p.tok}</span><span style="min-width:0"><span class="q-name">${esc(p.name)} ${p.all.length?'<span class="tag crit" style="font-size:10px">ALLERGY</span>':''}</span><span class="q-sub">${p.status==='done'?'Done · '+fmtT(p.time):p.status==='with'?'With doctor':esc(p.age+p.sex+' · '+p.co)}</span></span></button>`).join('');}
function renderConsult(){const p=cur();const el=$('#consult');if(!el)return;
 if(!p){el.innerHTML='<div class="empty">All tokens seen.</div>';renderPapers();return;}const rx=p.rx;
 el.innerHTML=`<div class="pt-head"><div><div class="pt-name">${esc(p.name)}</div><div class="pt-meta">${esc(p.age)} yrs · ${p.sex==='M'?'Male':'Female'} · Token ${p.tok} · ${esc(p.uhid)} · ${esc(p.phone)}</div>
  <div class="pt-tags">${p.cond.map(c=>`<span class="tag acc">${esc(c)}</span>`).join('')}${p.all.map(a=>`<span class="tag crit">Allergic: ${esc(a)}</span>`).join('')}${!p.cond.length&&!p.all.length?'<span class="tag">No known conditions</span>':''}</div></div>
  <div class="timer"><span class="mono" id="tmr">0:00</span><small>${p.status==='done'?'final time':'time on this parchi'}</small></div></div>
 ${p.summary?`<div class="summary"><b>Summary of past visits:</b> ${esc(p.summary)}</div>`:''}
 <div class="tools"><button class="tool" data-act="voice" ${p.status==='done'||!p.voice?'disabled':''}><span class="ic">${svg('mic')}</span><span><b>Speak the consult</b><span>Hinglish voice to a draft prescription (simulated)</span></span></button><button class="tool" data-go="intake"><span class="ic">${svg('cam')}</span><span><b>Scan old parchi or report</b><span>Photo to medicines and lab values</span></span></button></div>
 <div class="voicebox" id="voicebox" hidden><div class="t" id="vtext"></div><div class="meta"><span id="vstate"></span><span>Demo: the transcript is scripted.</span></div></div>
 <fieldset class="fs" id="f-co"><div class="fs-h"><label for="in-co">Complaints</label></div><textarea class="inp" id="in-co" data-bind="co" rows="2">${esc(rx.co)}</textarea><div class="chips">${X.COMPLAINTS.map(c=>`<button class="chip" data-addco="${esc(c)}">+ ${esc(c)}</button>`).join('')}</div></fieldset>
 <fieldset class="fs" id="f-v"><div class="fs-h"><span class="lbl">Vitals</span><span class="tag">flags update as you type</span></div><div class="vitals">${[['bp','BP','120/80'],['pulse','Pulse','72'],['temp','Temp °F','98.6'],['spo2','SpO₂ %','98'],['grbs','GRBS','110'],['wt','Weight kg','60']].map(x=>`<label class="vital"><span>${x[1]}</span><input data-bind="v.${x[0]}" value="${esc(rx.v[x[0]])}" placeholder="${x[2]}" class="${vflag(x[0],rx.v[x[0]])}" inputmode="decimal"></label>`).join('')}</div></fieldset>
 <fieldset class="fs" id="f-dx"><div class="fs-h"><label for="in-dx">Diagnosis · one-tap templates</label></div><div class="chips">${Object.keys(X.TPL).map(k=>`<button class="chip" data-tpl="${k}">${esc(X.TPL[k].name)} <span class="n">${X.TPL[k].meds.length} Rx</span></button>`).join('')}</div><input class="inp" id="in-dx" data-bind="dx" value="${esc(rx.dx)}" placeholder="Provisional diagnosis"></fieldset>
 <fieldset class="fs" id="f-meds"><div class="fs-h"><label for="medSearch">Medicines</label><span class="tag good">Jan Aushadhi price shown</span></div><div class="search"><input class="inp" id="medSearch" placeholder="Type a generic or brand name, e.g. pan, dolo, telmi" autocomplete="off"><div class="drop" id="drop" hidden></div></div><div class="meds-wrap" id="medsTable"></div><div class="alerts" id="alerts"></div><div class="cost" id="cost"></div></fieldset>
 <div class="two"><fieldset class="fs"><div class="fs-h"><span class="lbl">Investigations</span></div><div class="chips">${X.INV.map(i=>`<button class="chip ${rx.inv.includes(i)?'on':''}" data-inv="${esc(i)}">${esc(i)}</button>`).join('')}</div></fieldset>
 <fieldset class="fs"><div class="fs-h"><span class="lbl">Advice (English + हिंदी)</span></div><div class="chips">${X.ADVICE.map((a,i)=>`<button class="chip ${rx.adv.includes(i)?'on':''}" data-adv="${i}" title="${esc(a.hi)}">${esc(LANG==='hi'?a.hi:a.en)}</button>`).join('')}</div></fieldset></div>
 <fieldset class="fs" id="f-fu"><div class="fs-h"><span class="lbl">Follow-up</span></div><div class="chips">${[0,3,5,7,10,14,30].map(d=>`<button class="chip ${rx.fu===d?'on':''}" data-fu="${d}">${d?d+' days':'None'}</button>`).join('')}</div></fieldset>
 <div class="actions"><label class="toggle"><input type="checkbox" id="hindiTgl" ${rx.hindi?'checked':''}> Hindi line for patient</label><span style="flex:1"></span><button class="btn" data-act="print">${svg('print')} Print A5</button><button class="btn" data-act="wa">${svg('wa')} WhatsApp</button><button class="btn primary" data-act="next" ${p.status==='done'?'disabled':''}>${svg('next')} Save & call next</button></div>`;
 renderMeds();renderPapers();tick();}
function renderMeds(){const p=cur();const el=$('#medsTable');if(!p||!el)return;const rx=p.rx;
 el.innerHTML=rx.meds.length?`<table class="meds"><thead><tr><th>Medicine (generic first)</th><th>Dose</th><th>When</th><th>Food</th><th>Days</th><th>Qty</th><th></th></tr></thead><tbody>${rx.meds.map(m=>{const d=DRUG[m.id];return `<tr data-uid="${m.uid}" id="mr-${m.uid}"><td class="drug"><b>${FORM[d.f]} ${esc(d.g)}</b><small>${esc(d.s)} · ${esc(d.b)}</small></td><td>${['tab','cap'].includes(d.f)?`<select data-mf="dose" aria-label="Dose">${['½','1','2'].map(x=>`<option ${m.dose===x?'selected':''}>${x}</option>`).join('')}</select>`:`<span class="mono">${esc(m.dose)}</span>`}</td><td><select data-mf="freq" aria-label="Frequency">${Object.keys(FREQ).map(f=>`<option value="${f}" ${m.freq===f?'selected':''}>${f}</option>`).join('')}</select></td><td><select data-mf="timing" aria-label="Food">${Object.keys(TIMING).map(x=>`<option value="${x}" ${m.timing===x?'selected':''}>${x==='any'?'—':TIMING[x].en}</option>`).join('')}</select></td><td><input type="number" min="1" max="365" data-mf="days" value="${m.days}" aria-label="Days"></td><td class="mono">${qty(m)}</td><td><button class="rm" data-rm="${m.uid}" aria-label="Remove">×</button></td></tr>`;}).join('')}</tbody></table>`:'<div class="empty">No medicines yet. Tap a template above or search.</div>';renderAlerts();}
function renderAlerts(){const p=cur();if(!p||!$('#alerts'))return;$('#alerts').innerHTML=alertsFor(p).map(a=>`<div class="alert ${a[0]}"><span class="ic">!</span><span>${esc(a[1])}</span></div>`).join('');const c=cost(p.rx);$('#cost').innerHTML=`<div><span>Branded</span><b>${inr(c.b)}</b></div><div><span>Jan Aushadhi</span><b>${inr(c.j)}</b></div><div class="save"><span>Patient saves</span><b>${inr(c.s)}</b></div>`;}
function tick(){const p=cur();const tm=$('#tmr');if(!p||!tm)return;if(p.status==='done'){tm.textContent=fmtT(p.time);return;}if(!p.start)p.start=Date.now();tm.textContent=fmtT((Date.now()-p.start)/1000);}
setInterval(tick,1000);
function openPatient(id){const prev=cur();if(prev&&prev.status==='with'&&prev.id!==id)prev.status='waiting';S.cur=id;const p=cur();if(p.status==='waiting'){p.status='with';p.start=Date.now();}if(VIEW!=='opd')go('opd');else{renderQueue();renderConsult();}}
function fl(id){const e=document.getElementById(id);if(!e)return;e.classList.remove('flashbox');void e.offsetWidth;e.classList.add('flashbox');}
function applyTpl(k){const p=cur(),T=X.TPL[k],rx=p.rx;rx.dx=T.dx;rx.meds=T.meds.map(mkMed);rx.inv=T.inv.slice();rx.adv=T.adv.slice();rx.fu=T.fu;renderConsult();['f-dx','f-meds','f-fu'].forEach(fl);toast(`${T.name}: ${T.meds.length} medicines, tests and advice filled`);}
function addDrug(id){const p=cur(),d=DRUG[id];const m=mkMed([id,d.f==='inh'?'SOS':d.f==='syp'?'1-1-1':'1-0-1',d.cls==='ppi'?'before':'after',5]);p.rx.meds.push(m);renderMeds();renderPapers();const r=document.getElementById('mr-'+m.uid);if(r)r.classList.add('flash');if(alertsFor(p).some(a=>a[0]==='crit'))toast('Allergy check triggered');}
function saveNext(){const p=cur();if(!p)return;if(!p.rx.meds.length){toast('Add at least one medicine first');return;}if(alertsFor(p).some(a=>a[0]==='crit')){toast('Resolve the allergy alert before saving');fl('f-meds');return;}
 p.time=(Date.now()-(p.start||Date.now()))/1000;p.status='done';S.sent++;const a=S.appts.find(x=>x.pid===p.id);if(a)a.status='seen';
 const nx=S.patients.find(x=>x.status==='waiting');toast(`Saved. Parchi for ${p.name} took ${fmtT(p.time)}${nx?'. Calling token '+nx.tok:''}`);if(nx)openPatient(nx.id);else{renderQueue();renderConsult();}}
let voiceBusy=false;
function runVoice(){const p=cur();if(!p||voiceBusy||!p.voice)return;voiceBusy=true;const box=$('#voicebox');box.hidden=false;const tx=$('#vtext');tx.textContent='';$('#vstate').innerHTML='<span class="wave"><i></i><i></i><i></i><i></i></span>Listening…';
 const txt=p.voice.text;let i=0;const iv=setInterval(()=>{i+=reduce?txt.length:3;tx.textContent=txt.slice(0,i);if(i>=txt.length){clearInterval(iv);$('#vstate').textContent='Structuring into a prescription…';
  setTimeout(()=>{const v=p.voice,rx=p.rx,T=X.TPL[v.tpl];rx.co=v.co;Object.assign(rx.v,v.v);rx.dx=v.dx;rx.meds=T.meds.map(mkMed).concat((v.extra||[]).map(mkMed));rx.inv=T.inv.concat(v.inv||[]).filter((x,k,a)=>a.indexOf(x)===k);rx.adv=T.adv.slice();rx.fu=T.fu;voiceBusy=false;renderConsult();$('#voicebox').hidden=false;$('#vtext').textContent=txt;$('#vstate').innerHTML='<b style="color:var(--good)">Draft ready.</b> Check it, then save.';['f-co','f-v','f-dx','f-meds','f-fu'].forEach(fl);},reduce?0:700);}},reduce?0:20);}
let hl=0;
function doSearch(q){const dd=$('#drop');q=q.trim().toLowerCase();if(q.length<2){dd.hidden=true;return;}const r=X.DRUGS.filter(d=>d.g.toLowerCase().includes(q)||d.b.toLowerCase().includes(q)).slice(0,8);hl=0;
 dd.innerHTML=r.length?`<div class="head">${r.length} matches · demo list (full catalogue: 205,507)</div>`+r.map((d,i)=>`<button type="button" data-pick="${d.id}" class="${i?'':'hl'}"><span><span class="g">${FORM[d.f]} ${esc(d.g)} ${esc(d.s)}</span><br><span class="b">${esc(d.b)}${d.cls==='sulfa'?' · sulfa':''}${d.cls==='pen'?' · penicillin':''}</span></span><span class="pr">Brand ₹${d.bp}<br><span class="ja">JA ₹${d.jp}</span> / unit</span></button>`).join(''):'<div class="head">No match in the demo list.</div>';dd.hidden=false;}

/* PATIENTS */
let pSel='p3',pq='';
function trendSVG(tr){const W=560,H=200,l=44,r=20,tp=24,b=34;const vals=tr.pts.map(x=>x[1]).concat([tr.target]);let mn=Math.min(...vals),mx=Math.max(...vals);const pad=(mx-mn)*0.2||1;mn-=pad;mx+=pad;
 const Xs=i=>l+i*(W-l-r)/(tr.pts.length-1),Y=v=>tp+(mx-v)/(mx-mn)*(H-tp-b);const pts=tr.pts.map((p,i)=>Xs(i)+','+Y(p[1])).join(' ');
 return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tr.label)} trend"><line class="ax" x1="${l}" x2="${W-r}" y1="${H-b}" y2="${H-b}"/><line class="tgt" x1="${l}" x2="${W-r}" y1="${Y(tr.target)}" y2="${Y(tr.target)}"/><text class="tg" x="${W-r}" y="${Y(tr.target)-6}" text-anchor="end">target ${tr.target}</text><path class="ar" d="M${Xs(0)},${H-b} L${tr.pts.map((p,i)=>Xs(i)+','+Y(p[1])).join(' L')} L${Xs(tr.pts.length-1)},${H-b} Z"/><polyline class="ln" points="${pts}"/>${tr.pts.map((p,i)=>`<circle class="${i===tr.pts.length-1?'last':'pt'}" cx="${Xs(i)}" cy="${Y(p[1])}" r="${i===tr.pts.length-1?5:4}"/><text class="v" x="${Xs(i)}" y="${Y(p[1])-10}" text-anchor="middle">${p[1]}</text><text x="${Xs(i)}" y="${H-12}" text-anchor="middle">${p[0]}</text>`).join('')}</svg>`;}
function vPatients(){const list=S.patients.filter(p=>!pq||(p.name+' '+p.uhid+' '+p.phone+' '+p.cond.join(' ')+' '+p.co).toLowerCase().includes(pq));const p=S.patients.find(x=>x.id===pSel)||S.patients[0];
 $('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('app.patients'))}</h2><p>${S.patients.length} patients · search by name, UHID, phone or condition</p></div></div>
 <div class="pview"><div class="plist"><input class="inp" id="pSearch" placeholder="e.g. Sita, SC-0412, T2DM" value="${esc(pq)}">${list.map(x=>`<button class="q-item ${x.id===p.id?'on':''}" data-psel="${x.id}"><span class="q-tok">${esc(x.name.split(' ').map(w=>w[0]).join('').slice(0,2))}</span><span style="min-width:0"><span class="q-name">${esc(x.name)}</span><span class="q-sub">${esc(x.uhid)} · ${esc(x.age+x.sex)} · ${x.visits.length+(x.status==='done'?1:0)} visits</span></span></button>`).join('')||'<div class="empty">No match.</div>'}</div>
 <div class="card" style="display:flex;flex-direction:column;gap:16px"><div class="pt-head"><div><div class="pt-name">${esc(p.name)}</div><div class="pt-meta">${esc(p.age)} yrs · ${p.sex==='M'?'Male':'Female'} · ${esc(p.uhid)} · ${esc(p.phone)} · ABHA: not linked</div><div class="pt-tags">${p.cond.map(c=>`<span class="tag acc">${esc(c)}</span>`).join('')}${p.all.map(a=>`<span class="tag crit">Allergic: ${esc(a)}</span>`).join('')}</div></div><button class="btn sm primary" data-open="${p.id}">Open in OPD</button></div>
  ${p.trend?`<div><div class="fs-h"><span class="lbl">${esc(p.trend.label)} · last 5 visits</span><span class="tag ${p.trend.pts.at(-1)[1]<=p.trend.target?'good':'warn'}">${p.trend.pts.at(-1)[1]<=p.trend.target?'at target':'above target'}</span></div>${trendSVG(p.trend)}</div>`:'<p style="color:var(--muted);font-size:14px">Trend charts appear once a patient has repeat BP, sugar or HbA1c readings.</p>'}
  <div><div class="fs-h" style="margin-bottom:8px"><span class="lbl">Visit history</span></div><div class="timeline">${['done','with'].includes(p.status)?`<div class="tl"><div class="d">${fmtD(today)} · today</div><b>${esc(p.rx.dx||'In progress')}</b><p>${esc(p.rx.meds.map(m=>DRUG[m.id].g).join(', ')||'—')}</p></div>`:''}${p.visits.map(v=>`<div class="tl"><div class="d">${esc(v[0])}</div><b>${esc(v[1])}</b><p>${esc(v[2])}</p></div>`).join('')||'<div class="tl"><b>First visit</b><p>No earlier records. Use photo intake to add old prescriptions.</p></div>'}</div></div></div></div>`;}

/* SETTINGS */
function vSettings(){const l=S.lh;
 $('#view').innerHTML=`<div class="view-h"><div><h2>${esc(t('app.settings'))} · Letterhead</h2><p>Type your details. Every parchi, the hero on the website and the WhatsApp PDF update at once. Saved in this browser.</p></div><button class="btn" data-act="lh-reset">Reset</button></div>
 <div class="studio"><form class="card studio-form" id="studio" autocomplete="off">${[['doctor',"Doctor's name"],['doctorHi','नाम (हिंदी)'],['degrees','Degrees','full'],['clinic','Clinic name'],['clinicHi','क्लिनिक का नाम (हिंदी)'],['reg','Registration no.'],['phone','Clinic phone'],['address','Address','full'],['timings','Timings','full']].map(f=>`<div class="field ${f[2]||''}"><label for="lh-${f[0]}">${f[1]}</label><input class="inp" id="lh-${f[0]}" data-lh="${f[0]}" value="${esc(l[f[0]])}"></div>`).join('')}
  <div class="field"><label>Ink colour</label><div class="swatches">${INKS.map(k=>`<button type="button" class="sw" style="background:${k[0]}" data-ink="${k[0]}" aria-label="${k[1]}" aria-pressed="${l.ink===k[0]}"></button>`).join('')}</div></div>
  <div class="field"><label>Layout</label><div class="seg"><button type="button" data-layout="center" aria-pressed="${l.layout==='center'}">Centred</button><button type="button" data-layout="left" aria-pressed="${l.layout==='left'}">Logo left</button></div></div></form>
 <div id="studioPaper"></div></div>`;renderPapers();}

/* modal, WhatsApp, print */
function openModal(title,html){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modal').hidden=false;$('#modal .btn').focus();}
function closeModal(){$('#modal').hidden=true;}
function printView(){const p=cur();openModal('A5 print preview · '+p.name,`<p style="color:var(--muted);font-size:14px;margin-bottom:12px">In the clinic this goes to your printer on A5, or onto your pre-printed pad with the header switched off.</p><div class="a5">${parchi(p)}</div><div style="text-align:center;margin-top:12px"><button class="btn primary" data-act="real-print">${svg('print')} Print now</button></div>`);}
function waView(){const p=cur(),rx=p.rx,Lh=S.lh;if(!rx.meds.length){toast('Add medicines first');return;}const fuD=rx.fu?addDays(rx.fu):null;S.sent++;
 const lines=rx.meds.map(m=>{const d=DRUG[m.id],tm=TIMING[m.timing];const nm=d.g.split(' ')[0];return `<li><b>${esc(nm.charAt(0)+nm.slice(1).toLowerCase())}</b>: ${esc(doseHi(m,d))}, ${esc(FREQ[m.freq].hi)}${tm.hi?', '+tm.hi:''}, ${esc(daysHi(m))}</li>`;}).join('');
 openModal('WhatsApp preview · '+p.phone,`<div class="wa-grid"><div><p>The patient gets the PDF and a Hindi schedule they can read at home. A reminder goes out the day before follow-up.</p><ul style="color:var(--muted);font-size:14px;margin-top:10px;padding-left:18px"><li>From your clinic's WhatsApp Business number</li><li>About 15 paise per message</li><li>Sent only after the patient agrees at reception</li></ul><p style="font-size:13px;color:var(--warn);margin-top:12px">Demo: nothing is actually sent.</p></div>
 <div class="phone"><div class="wa-top"><span class="av"></span><span><b>${esc(Lh.clinic)}</b><small>Business account</small></span></div><div class="wa-body"><div class="bub"><div class="pdf"><span class="ic">PDF</span><span><b>Parchi_${esc(p.name.replace(/[^A-Za-z]/g,''))}.pdf</b><br><small>1 page · ${esc(Lh.doctor)}</small></span></div><div class="tm">✓✓</div></div>
 <div class="bub">नमस्ते ${esc(p.name)} जी, ${esc(Lh.doctor)} की पर्ची ऊपर है। दवा ऐसे लें:<ul class="wa-meds">${lines}</ul>${rx.adv.length?'<div style="margin-top:6px">सलाह: '+rx.adv.map(i=>esc(X.ADVICE[i].hi)).join(', ')+'</div>':''}${fuD?`<div style="margin-top:6px"><b>${esc(fmtHi(fuD))}</b> को दोबारा दिखाएँ। 1 लिखकर भेजें, टोकन बुक हो जाएगा।</div>`:''}<div class="tm">✓✓</div></div>
 <div class="bub in">1</div><div class="bub">टोकन बुक हो गया ✔ ${fuD?esc(fmtHi(fuD))+', सुबह 8 बजे के बाद।':''}<div class="tm">✓✓</div></div></div></div></div>`);}

/* toast */
let tt;function toast(m){const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(tt);tt=setTimeout(()=>e.hidden=true,3200);}

/* ---------------- router ---------------- */
function route(){const h=location.hash||'#top';
 const authed=store.get('arx-auth',false);
 const isApp=h.startsWith('#app-'),isLogin=h==='#login';
 $('#page-landing').hidden=isApp||isLogin;$('#page-login').hidden=!isLogin;$('#page-app').hidden=!isApp;$('#footer').hidden=isApp;
 $('#loginBtn').textContent=authed?(LANG==='hi'?'डैशबोर्ड':'Dashboard'):t('nav.login');$('#loginBtn').setAttribute('href',authed?'#app-home':'#login');
 $('#nav').classList.remove('open');
 if(isApp){if(!authed){location.hash='#login';return;}const v=h.slice(5);VIEW=VIEWS.some(x=>x[0]===v)?v:'home';renderApp();window.scrollTo(0,0);}
 else if(isLogin){window.scrollTo(0,0);}
 else if(h.length>1){const el=document.getElementById(h.slice(1));if(el)setTimeout(()=>el.scrollIntoView({behavior:reduce?'auto':'smooth'}),0);}
}

/* ---------------- events ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-open]');if(!b)return;const d=b.dataset;
 if(d.lang){setLang(d.lang);return;}
 if(d.ff){ff=d.ff;$$('[data-ff]').forEach(x=>x.classList.toggle('on',x.dataset.ff===ff));renderLanding();return;}
 if(d.bill){bill=d.bill;$$('[data-bill]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.bill===bill?'true':'false'));renderLanding();return;}
 if(d.go){go(d.go);return;}
 if(d.start){openPatient(d.start);return;}
 if(d.open){openPatient(d.open);return;}
 if(d.ask){ask(d.ask);return;}
 if(d.day!==undefined){sDay=+d.day;vSchedule();return;}
 if(d.arrive){arrive(d.arrive);vSchedule();return;}
 if(d.resched){const a=S.appts.find(x=>x.id===d.resched);a.day=Math.min(6,a.day+1);toast(`${a.name} moved to ${fmtD(addDays(a.day))}. WhatsApp update sent (demo).`);vSchedule();return;}
 if(d.cancel){const a=S.appts.find(x=>x.id===d.cancel);a.status='cancelled';toast('Cancelled. Slot is free again.');vSchedule();return;}
 if(d.psel){pSel=d.psel;vPatients();return;}
 if(d.tpl){applyTpl(d.tpl);return;}
 if(d.pick){addDrug(d.pick);$('#medSearch').value='';$('#drop').hidden=true;$('#medSearch').focus();return;}
 if(d.rm){const p=cur();p.rx.meds=p.rx.meds.filter(m=>m.uid!=+d.rm);renderMeds();renderPapers();return;}
 if(d.inv){const rx=cur().rx;rx.inv=rx.inv.includes(d.inv)?rx.inv.filter(x=>x!==d.inv):rx.inv.concat(d.inv);b.classList.toggle('on');renderPapers();return;}
 if(d.adv){const rx=cur().rx,i=+d.adv;rx.adv=rx.adv.includes(i)?rx.adv.filter(x=>x!==i):rx.adv.concat(i);b.classList.toggle('on');renderPapers();return;}
 if(d.fu!==undefined){const rx=cur().rx;rx.fu=+d.fu;$$('[data-fu]').forEach(x=>x.classList.toggle('on',+x.dataset.fu===rx.fu));renderPapers();return;}
 if(d.addco){const rx=cur().rx;rx.co=rx.co?rx.co.replace(/\.?\s*$/,', ')+d.addco.toLowerCase():d.addco;$('#in-co').value=rx.co;renderPapers();return;}
 if(d.ink){S.lh.ink=d.ink;store.set('arx-lh',S.lh);$$('[data-ink]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.ink===d.ink?'true':'false'));renderPapers();return;}
 if(d.layout){S.lh.layout=d.layout;store.set('arx-lh',S.lh);$$('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.layout===d.layout?'true':'false'));renderPapers();return;}
 if(d.doc){S.doc=d.doc;$$('[data-doc]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.doc===S.doc?'true':'false'));sampleShot();return;}
 const a=d.act;if(!a)return;
 const ACT={voice:runVoice,next:saveNext,print:printView,wa:waView,close:closeModal,'real-print':()=>window.print(),'sample-shot':sampleShot,'intake-history':()=>intakeTo('history'),'intake-rx':()=>intakeTo('rx'),'play-chat':playChat,'reset-chat':()=>{S.chat=[];S.chatDone=false;vIntake();},
  'chat-to-queue':()=>{const ap=S.appts.find(x=>x.name==='Kavita Sharma');if(ap&&ap.status==='booked'){arrive(ap.id);const p=S.patients.at(-1);p.cond=['Hypothyroid'];p.age=38;p.co='Fatigue and hair fall for 2 weeks. TSH 7.8 (high).';p.rx.co=p.co;p.rx.inv=['TSH'];}else toast('Already in the queue');},
  logout:()=>{store.set('arx-auth',false);location.hash='#top';toast('Logged out');},
  reset:()=>{const lh=S.lh;S=seed();S.lh=lh;chatLog=[];vOpd();toast('Demo reset');},
  'lh-reset':()=>{S.lh=Object.assign({},LH0);store.set('arx-lh',{});vSettings();}};
 if(ACT[a])ACT[a]();
});
document.addEventListener('input',e=>{const el=e.target,d=el.dataset;
 if(d.bind){const p=cur();if(!p)return;if(d.bind.startsWith('v.')){const f=d.bind.slice(2);p.rx.v[f]=el.value;el.className=vflag(f,el.value);}else p.rx[d.bind]=el.value;renderPapers();return;}
 if(d.mf){const p=cur(),u=+el.closest('tr').dataset.uid,m=p.rx.meds.find(x=>x.uid===u);if(!m)return;m[d.mf]=d.mf==='days'?Math.max(1,parseInt(el.value)||1):el.value;const q=el.closest('tr').querySelector('td.mono');if(q)q.textContent=qty(m);renderAlerts();renderPapers();return;}
 if(d.lh){S.lh[d.lh]=el.value;store.set('arx-lh',S.lh);renderPapers();return;}
 if(el.id==='medSearch'){doSearch(el.value);return;}
 if(el.id==='pSearch'){pq=el.value.toLowerCase();const pos=el.selectionStart;vPatients();const n=$('#pSearch');n.focus();n.setSelectionRange(pos,pos);}
});
document.addEventListener('change',e=>{if(e.target.id==='hindiTgl'){cur().rx.hindi=e.target.checked;renderPapers();}if(e.target.id==='fileIn'&&e.target.files[0])readFile(e.target.files[0]);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();const dd=$('#drop');if(dd)dd.hidden=true;$('#creditPop').hidden=true;}
 if(e.target.id==='medSearch'){const items=$$('#drop [data-pick]');if(!items.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();hl=(hl+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((x,i)=>x.classList.toggle('hl',i===hl));}if(e.key==='Enter'){e.preventDefault();items[hl].click();}}});
document.addEventListener('focusout',e=>{if(e.target.id==='medSearch')setTimeout(()=>{const dd=$('#drop');if(dd&&!(document.activeElement&&document.activeElement.closest('#drop')))dd.hidden=true;},150);});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
$('#themeBtn').addEventListener('click',()=>setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));
$('#menuBtn').addEventListener('click',()=>{const n=$('#nav');n.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',String(n.classList.contains('open')));});
$('#creditBtn').addEventListener('click',()=>{const p=$('#creditPop');p.hidden=!p.hidden;$('#creditBtn').setAttribute('aria-expanded',String(!p.hidden));});
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();store.set('arx-auth',true);toast(LANG==='hi'?'लॉग इन हो गया':'Logged in to the demo clinic');location.hash='#app-home';});
$('#leadForm').addEventListener('submit',e=>{e.preventDefault();const n=$('#lf-name').value,c=$('#lf-clinic').value,ph=$('#lf-phone').value,pt=$('#lf-pts').value;
 const msg=`Hello Chiranjeev, I'd like an Arogya Rx demo.\nDoctor: ${n}\nClinic: ${c}\nMobile: ${ph}\nPatients per day: ${pt}`;
 const done=$('#leadDone');done.hidden=false;done.innerHTML=`<span>${esc(t('form.done'))}</span><span style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary sm" href="https://wa.me/919546519953?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn sm" href="mailto:chiranjeevkumar47@gmail.com?subject=${encodeURIComponent('Arogya Rx demo request')}&body=${encodeURIComponent(msg)}">Email</a></span>`;});
window.addEventListener('hashchange',route);

/* boot */
setTheme(document.documentElement.getAttribute('data-theme')||'light');
applyLang();route();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(VIEW==='intake'&&!$('#page-app').hidden&&!S.userShot)sampleShot();});
})();
