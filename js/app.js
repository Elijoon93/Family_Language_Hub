(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const store=FLH_STORE, engine=FLH_ENGINE;
  let currentView='today';
  let plan=null;
  let gateDraft=null;
  let timer={seconds:0,total:0,interval:null,running:false};
  const pageMeta={today:['برنامه تطبیقی امروز','امروز'],path:['نقشه راه از صفر تا تسلط','مسیر یادگیری'],practice:['آزمایشگاه مهارت و عملکرد','تمرین'],library:['منابع، سناریوها و مسیرهای تخصصی','کتابخانه'],family:['دید کلی بدون مقایسه ناسالم','خانواده'],me:['تنظیمات، داده و پذیرش دستگاه','من']};

  function init(){
    registerSW();
    bindGlobal();
    store.subscribe(()=>{renderShell();renderView();});
    renderShell();
    switchView(store.get().active.view||'today');
    $('#boot').classList.add('hidden');$('#app').classList.remove('hidden');
    const s=store.get();
    if(!s.sessions.length)setTimeout(()=>openSessionGate(),350);
  }
  function registerSW(){if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  function bindGlobal(){
    $('#mainNav').addEventListener('click',e=>{const b=e.target.closest('button[data-view]');if(b)switchView(b.dataset.view);});
    $('#openSessionGate').onclick=openSessionGate;$('#activeIdentity').onclick=openSessionGate;$('#activeIdentity').title='تغییر عضو، زبان و سطح';
    $('#focusBtn').onclick=openFocus;
    $('#backupBtn').onclick=backup;
    $('#restoreInput').onchange=restore;
    $('#sessionForm').addEventListener('submit',e=>{e.preventDefault();applyGate();});
    $('#sessionGate').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
    window.addEventListener('online',updateSyncBadge);window.addEventListener('offline',updateSyncBadge);
  }
  function renderShell(){
    const s=store.get(),ctx=engine.active();document.body.dataset.profile=ctx.profile.id;document.body.dataset.language=ctx.language;
    $('#familyRail').innerHTML=Object.values(FLH_PROFILES).map(p=>familyButton(p,s.active.profile)).join('');
    $$('.family-button').forEach(b=>b.onclick=()=>selectProfile(b.dataset.profile));
    $('#activeIdentity').innerHTML=`${avatarHTML(ctx.profile)}<div><strong>${ctx.profile.name}</strong><small>${FLH_LANGUAGE_META[ctx.language].flag} ${FLH_LANGUAGE_META[ctx.language].fa} · ${levelLabel(ctx.level)}</small></div>`;
    updateSyncBadge();
  }
  function familyButton(p,active){const s=store.get(),lang=s.active.profile===p.id?s.active.language:p.defaultLanguage,level=p.id==='aria'?'PRE':p.levels[lang];return`<button class="family-button ${p.id===active?'active':''}" data-profile="${p.id}">${avatarHTML(p)}<div><strong>${p.name}</strong><small>${p.role}</small></div><span class="level-pill">${FLH_LANGUAGE_META[lang].flag} ${level}</span></button>`;}
  function avatarHTML(p){return`<div class="avatar">${p.avatar?`<img src="${p.avatar}" alt="${p.name}">`:`<span>${p.icon}</span>`}</div>`;}
  function selectProfile(pid){
    const p=FLH_PROFILES[pid],lang=p.defaultLanguage,level=p.id==='aria'?'PRE':p.levels[lang];
    store.update(s=>{s.active.profile=pid;s.active.language=lang;s.active.level=level;s.active.duration=p.dailyMinutes;s.active.goal=p.goals[lang][0];return s;},'select-profile');
    plan=engine.buildDailyPlan({force:true});store.savePlan(plan);switchView('today');
  }
  function switchView(view){currentView=view;store.update(s=>{s.active.view=view;return s;},'view');const m=pageMeta[view];$('#eyebrow').textContent=m[0];$('#pageTitle').textContent=m[1];$$('#mainNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));renderView();}
  function renderView(){const root=$('#viewRoot');if(!root)return;const render={today:renderToday,path:renderPath,practice:renderPractice,library:renderLibrary,family:renderFamily,me:renderMe}[currentView]||renderToday;root.innerHTML=render();bindView();}
  function bindView(){
    $$('[data-action="start-session"]').forEach(b=>b.onclick=()=>{plan=engine.buildDailyPlan();renderView();openFirstIncomplete();});
    $$('[data-task-id]').forEach(b=>b.onclick=()=>openTask(b.dataset.taskId));
    $$('[data-open-unit]').forEach(b=>b.onclick=()=>openUnit(b.dataset.openUnit));
    $$('[data-practice]').forEach(b=>b.onclick=()=>launchPractice(b.dataset.practice));
    $$('[data-speak]').forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.speak)));
    $$('[data-switch-profile]').forEach(b=>b.onclick=()=>selectProfile(b.dataset.switchProfile));
    const ex=$('#exportBtn');if(ex)ex.onclick=backup;
    const im=$('#importBtn');if(im)im.onclick=()=>$('#restoreInput').click();
    const rs=$('#resetBtn');if(rs)rs.onclick=resetApp;
    const sync=$('#syncConfigBtn');if(sync)sync.onclick=showSyncHelp;
    $$('[data-setting]').forEach(el=>el.onchange=()=>updateSetting(el.dataset.setting,el.type==='checkbox'?el.checked:el.value));
  }
  function renderToday(){
    const ctx=engine.active();plan=plan&&plan.profile===ctx.profile.id&&plan.language===ctx.language&&plan.date===engine.todayKey()?plan:engine.buildDailyPlan();if(store.get().activePlan?.id!==plan.id)setTimeout(()=>store.savePlan(plan),0);
    const pct=engine.sessionProgress(plan),levelPct=engine.levelProgress(ctx),p=ctx.progress;
    return `<div class="stack">
      <section class="hero card"><div class="hero-content"><div><span class="badge language">${FLH_LANGUAGE_META[ctx.language].flag} ${FLH_LANGUAGE_META[ctx.language].fa} · ${levelLabel(ctx.level)}</span><h2>${greeting(ctx.profile)}؛ برنامه امروز آماده است</h2><p>${todayNarrative(ctx,plan.unit)} مسیر امروز از واحد «${plan.unit.titleFa}» ساخته شده است. اولویت موتور: ${engine.skillFa(plan.priorities?.primarySkill||'vocabulary')}؛ مرور سررسید: ${(plan.priorities?.dueErrors||0)+(plan.priorities?.dueVocab||0)} مورد.</p><div class="hero-actions"><button class="primary-btn" data-action="start-session">شروع/ادامه نشست</button><button class="secondary-btn" onclick="document.getElementById('openSessionGate').click()">تغییر زبان و هدف</button></div></div><div class="hero-progress" style="--pct:${pct}%"><div><strong>${pct}%</strong><small>نشست امروز</small></div></div></div></section>
      <div class="metric-grid">${metric('🔥',p.streak||0,'روز پیوسته')}${metric('⏱️',p.totalMinutes||0,'دقیقه مطالعه')}${metric('⭐',p.xp||0,'امتیاز یادگیری')}${metric('🧭',levelPct+'%','پیشرفت سطح')}</div>
      <div class="view-grid"><div class="stack">
        <section class="card"><div class="card-head"><div><h2>نشست هدایت‌شده امروز</h2><p>${plan.steps.length} گام · حدود ${plan.steps.reduce((a,x)=>a+x.minutes,0)} دقیقه · ${plan.unit.titleFa}</p></div><span class="badge">${plan.goal}</span></div><div class="session-list">${plan.steps.map((x,i)=>sessionStep(x,i,ctx)).join('')}</div></section>
        <section class="card"><div class="card-head"><div><h2>پیشرفت مهارت‌ها</h2><p>امتیازها بر اساس عملکرد ثبت‌شده، نه صرف بازکردن صفحه</p></div></div>${skillRows(p.skills)}</section>
      </div><div class="stack">
        <section class="card"><div class="card-head"><div><h3>پیشنهاد مربی تطبیقی</h3><p>براساس مسیر، سن و عملکرد</p></div></div><div class="recommendations">${engine.recommendations(ctx).map(r=>`<div class="recommendation"><strong>${r.title}</strong><small>${r.text}</small></div>`).join('')}</div></section>
        <section class="card"><div class="card-head"><div><h3>فعالیت ۱۴ روز اخیر</h3><p>شدت رنگ = زمان یادگیری</p></div></div>${heatmap(p.heat)}</section>
        <section class="card"><div class="card-head"><div><h3>واحد فعلی</h3><p>${plan.unit.title}</p></div></div><div class="recommendation"><strong>${plan.unit.titleFa}</strong><small>${plan.unit.grammar||'یادگیری سن‌محور'} · ${plan.unit.project}</small><div class="progress-track" style="margin-top:10px"><i style="--pct:${engine.unitStatus(plan.unit,p).score}%"></i></div></div></section>
      </div></div>
    </div>`;
  }
  function sessionStep(x,i,ctx){const done=ctx.progress.lessons[x.id]?.done;return`<button class="session-step ${done?'done':''}" data-task-id="${x.id}"><span class="step-index">${done?'✓':i+1}</span><span><strong>${x.title}</strong><small>${x.description}</small></span><span class="step-meta"><span class="badge">${engine.skillFa(x.skill)}</span><small>${x.minutes} دقیقه</small></span></button>`;}
  function metric(icon,value,label){return`<div class="metric"><span>${icon}</span><strong>${value}</strong><small>${label}</small></div>`;}
  function skillRows(skills){return`<div class="skill-radar">${Object.entries(skills).map(([k,v])=>`<div class="skill-row"><span>${engine.skillFa(k)}</span><div class="progress-track"><i style="--pct:${Math.min(100,v)}%"></i></div><b>${Math.min(100,v)}</b></div>`).join('')}</div>`;}
  function heatmap(heat){const days=[];for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*86400000),k=d.toISOString().slice(0,10),m=heat[k]||0,int=m===0?0:m<10?1:m<25?2:m<45?3:4;days.push(`<div class="heat-day" data-intensity="${int}" title="${k}: ${m} دقیقه"></div>`);}return`<div class="heatmap">${days.join('')}</div>`;}
  function greeting(p){const h=new Date().getHours(),g=h<12?'صبح بخیر':h<18?'روز بخیر':'عصر بخیر';return`${p.name}، ${g}`;}
  function todayNarrative(ctx,unit){if(ctx.profile.id==='saeed')return'امروز یک خروجی قابل استفاده برای IELTS، اپلای، مقاله یا ارتباط حرفه‌ای تولید می‌کنید.';if(ctx.profile.id==='arezoo')return'امروز زبان را در یک موقعیت واقعی خانه، خرید، مدرسه یا فناوری به کار می‌برید.';if(ctx.profile.id==='elena')return'امروز با صدا، داستان، بازی و یک پروژه کوتاه یاد می‌گیری.';return'امروز فقط چند دقیقه بازی، شنیدن و ارتباط مثبت با والد کافی است.';}

  function renderPath(){
    const ctx=engine.active();const allowed=ctx.profile.id==='aria'?['PRE']:ctx.profile.id==='elena'?['A0','A1','A2','B1']:['A0','A1','A2','B1','B2','C1','C2'];
    const sections=allowed.map((l,li)=>{const units=engine.levelUnits(ctx.language,l,ctx.profile.id),lp=FLH_LEVELS[l];if(!units.length)return'';const prev=li>0?allowed[li-1]:null,prevReady=prev?engine.levelReadiness(prev,ctx).ready:true;const currentOrPast=FLH_LEVELS[l].order<=FLH_LEVELS[ctx.level].order;const levelLocked=!currentOrPast&&!prevReady;const readiness=engine.levelReadiness(l,ctx);return`<section class="level-section ${levelLocked?'locked-level':''}"><header class="level-head"><div class="level-icon">${lp.emoji}</div><div><strong>${l} — ${lp.label}</strong><small>${levelDescriptor(l,ctx.language,ctx.profile)}</small></div><span class="badge">${Math.round(readiness.masteredRatio*100)}% تسلط · ${readiness.assessmentPassed?'ارزیابی ✓':'ارزیابی لازم'}</span></header><div class="unit-grid">${units.map(u=>unitCard(u,ctx,levelLocked)).join('')}</div></section>`;}).join('');
    return`<div class="stack"><section class="hero card"><div class="hero-content"><div><span class="badge language">${FLH_LANGUAGE_META[ctx.language].flag} مسیر کامل ${ctx.profile.name}</span><h2>از ${ctx.profile.id==='aria'?'تماس زبانی':'صفر'} تا ${ctx.profile.id==='elena'?'استقلال مدرسه‌ای':'C2'}</h2><p>قفل‌ها براساس تسلط واحد، حداقل دو عملکرد موفق، کف مهارت و ارزیابی سطح باز می‌شوند؛ صرف زمان یا کلیک‌کردن کافی نیست.</p><div class="hero-actions"><button class="primary-btn" data-practice="diagnostic">ارزیابی سطح فعلی</button></div></div><div class="hero-progress" style="--pct:${engine.levelProgress(ctx)}%"><div><strong>${engine.levelProgress(ctx)}%</strong><small>سطح فعلی</small></div></div></div></section><div class="level-map">${sections}</div></div>`;
  }
  function levelDescriptor(l,lang,p){if(l==='PRE')return'بازی، شنیدن، اشاره، حرکت و مشارکت داوطلبانه';const d={A0:'الفبا، صدا، واژه‌های پایه و اولین جمله‌ها',A1:'ارتباط ساده و انجام موقعیت‌های ضروری',A2:'استقلال در زندگی روزمره و موقعیت‌های تکرارشونده',B1:'گفت‌وگوی پیوسته، روایت، کار و تحصیل',B2:'عملکرد حرفه‌ای، استدلال و متن‌های پیچیده',C1:'گفتمان دانشگاهی، تخصصی و کنترل ظرافت',C2:'دقت، سبک، استنباط و تسلط چندژانری'};return d[l];}
  function unitCard(u,ctx,levelLocked){const st=engine.unitStatus(u,ctx.progress),access=levelLocked?{state:'locked',reason:'سطح قبلی هنوز آماده ارتقا نیست'}:engine.unitAccess(u,ctx),locked=access.state==='locked';return`<article class="unit-card ${locked?'locked':''} ${st.done?'done':''}"><strong>${st.done?'✓ ':locked?'🔒 ':''}${u.order}. ${u.titleFa}</strong><p>${u.grammar||'مسیر بازی و شنیدن'}<br>${u.project}</p>${locked?`<small class="muted">${access.reason}</small>`:''}<footer><span class="badge">${st.score}% · ${st.attempts} تلاش</span><button ${locked?'disabled':''} data-open-unit="${u.id}">${st.done?'مرور':'شروع'}</button></footer></article>`;}

  function renderPractice(){const ctx=engine.active(),cards=practiceCards(ctx);return`<div class="stack"><section class="hero card"><div class="hero-content"><div><span class="badge language">تمرین هدفمند ${FLH_LANGUAGE_META[ctx.language].flag}</span><h2>تمرین بر اساس ضعف، هدف و سن</h2><p>تمرین‌ها از واحد فعلی، خطانامه، مرور فاصله‌دار و مسیر شخصی شما ساخته می‌شوند. این بخش جای «کلیک و تماشا» نیست؛ هر تمرین یک پاسخ ثبت‌شده دارد.</p></div></div></section><div class="practice-grid">${cards.map(c=>`<article class="practice-card"><span class="icon">${c.icon}</span><h3>${c.title}</h3><p>${c.text}</p><button class="secondary-btn" data-practice="${c.id}">${c.action||'شروع تمرین'}</button></article>`).join('')}</div></div>`;}
  function practiceCards(ctx){const base=[
    {id:'vocab',icon:'🧠',title:'مرور هوشمند واژگان',text:'کارت‌های موعددار با بازیابی فعال و ثبت میزان یادآوری.'},
    {id:'listening',icon:'🎧',title:'آزمایشگاه شنیدار',text:'شنیدن عبارت، تشخیص معنی، جزئیات و واژه‌های کلیدی.'},
    {id:'speaking',icon:'🎙️',title:'گفتار و تلفظ',text:'تکرار مدل، پاسخ زمان‌دار و ثبت خروجی صوتی یا خودارزیابی.'},
    {id:'writing',icon:'✍️',title:'کارگاه نوشتن',text:'از جمله‌سازی تا متن دانشگاهی با معیار بازبینی روشن.'},
    {id:'grammar',icon:'🧩',title:'گرامر در عمل',text:'ساختارها در سناریو و خروجی واقعی، نه حفظ قانون جدا از کاربرد.'},
    {id:'errorbook',icon:'🩹',title:'خطانامه شخصی',text:'خطاهای واقعی شما با زمان‌بندی مرور و حل دوباره.'},
    {id:'diagnostic',icon:'🧭',title:'ارزیابی سطح فعلی',text:'ارزیابی کوتاه چهارمهارتی برای شرط عبور سطح و تنظیم مسیر.'}
  ];
  if(ctx.profile.id==='elena')base.push(
    {id:'alphabet',icon:'🔤',title:'الفبا، فونیک و ردگیری',text:'حرف، تصویر، صدای واژه و بوم ردگیری با انگشت یا ماوس.'},
    {id:'visual-match',icon:'🖼️',title:'بازی تصویر و واژه',text:'انتخاب تصویر درست با شنیدن یا خواندن واژه.'},
    {id:'memory',icon:'🧠',title:'حافظه تصویری',text:'جفت‌کردن تصویر و واژه در یک بازی کوتاه.'},
    {id:'story-sequence',icon:'📖',title:'داستان تصویری',text:'چیدن رویدادها و تعریف داستان کوتاه به ترتیب.'}
  );
  if(ctx.profile.id==='aria')return[
    {id:'parent-session',icon:'🧸',title:'بازی والد‌همراه',text:'نشست ۵ تا ۸ دقیقه‌ای شامل شنیدن، اشاره، حرکت و جشن پایان.'},
    {id:'picture-talk',icon:'🖼️',title:'لمس تصویر',text:'سه تصویر بزرگ، صدای آرام و انتخاب داوطلبانه کودک.'},
    {id:'sound-match',icon:'🔊',title:'گوش کن و پیدا کن',text:'پخش واژه و لمس تصویر درست بدون فشار یا نمره منفی.'},
    {id:'movement-game',icon:'🤸',title:'واژه و حرکت',text:'عبارت کوتاه همراه با حرکت بدن، خنده و پایان مثبت.'}
  ];
  if(ctx.profile.id==='arezoo')base.push({id:'shopping',icon:'🛒',title:'خرید و ضروریات',text:'فهرست خرید، مقدار، قیمت، پرداخت، رسید و مرجوعی.'},{id:'it',icon:'💻',title:'فناوری و کار',text:'معرفی مهارت، محیط کار، ایمیل و عیب‌یابی ساده.'});
  if(ctx.profile.id==='saeed')base.push({id:'research',icon:'🔬',title:'آزمایشگاه پژوهش',text:'FMEA، مونت‌کارلو، P90، عدم‌قطعیت و مصاحبه دکتری.'},{id:'ielts',icon:'🎓',title:'IELTS Center',text:'چهار مهارت، آزمون زمان‌دار، خطایابی و هدف‌گذاری Band.'});return base;}

  function renderLibrary(){const ctx=engine.active();const phraseGroups=Object.entries(FLH_CURRICULUM.phrases[ctx.language]||{});const specials=[];if(ctx.profile.id==='saeed')specials.push(...FLH_CURRICULUM.special.ielts,...FLH_CURRICULUM.special.research);if(ctx.profile.id==='arezoo')specials.push(...FLH_CURRICULUM.special.life.map(x=>({...x,language:ctx.language})));return`<div class="stack"><section class="card"><div class="card-head"><div><h2>مسیرهای تخصصی ${ctx.profile.name}</h2><p>ماژول‌های مستقل که روی مسیر عمومی سوار می‌شوند</p></div></div><div class="library-grid">${specials.length?specials.map(x=>`<article class="library-card"><span class="kicker">${x.level||ctx.level} · ${engine.skillFa(x.skills?.[0]||'speaking')}</span><h3>${x.titleFa}</h3><p>${x.project}</p><button class="secondary-btn" data-practice="${x.id}">بازکردن مسیر</button></article>`).join(''):`<article class="library-card"><h3>مسیر عمومی فعال است</h3><p>با پیشرفت در سطح، سناریوهای تخصصی بیشتری باز می‌شوند.</p></article>`}</div></section><section class="card"><div class="card-head"><div><h2>بانک عبارت عملی</h2><p>پخش صوتی، ترجمه و استفاده در سناریو</p></div></div><div class="library-grid">${phraseGroups.map(([k,items])=>`<article class="library-card"><span class="kicker">${k}</span><h3>${libraryTitle(k)}</h3><p>${items.slice(0,2).map(x=>x[0]).join('<br>')}</p><button class="secondary-btn" data-speak="${encodeURIComponent(items[0]?.[0]||'')}">پخش نمونه</button></article>`).join('')}</div></section></div>`;}
  function libraryTitle(k){return({introductions:'معرفی و اطلاعات',shopping:'خرید و قیمت',kitchen:'آشپزخانه و آشپزی',school:'مدرسه و خانواده',it:'کامپیوتر و فناوری',research:'پژوهش و دانشگاه',hse:'ایمنی و HSE'})[k]||k;}

  function renderFamily(){const s=store.get();return`<div class="stack"><section class="hero card"><div class="hero-content"><div><span class="badge">حساب خانوادگی · حداکثر دو دستگاه</span><h2>چهار مسیر مستقل، یک محیط مشترک</h2><p>گزارش‌ها برای مدیریت برنامه هستند، نه رتبه‌بندی اعضای خانواده. سن، هدف و نوع خروجی هر فرد متفاوت است.</p></div></div></section><div class="family-dashboard">${Object.values(FLH_PROFILES).map(p=>familyCard(p,s)).join('')}</div><section class="card"><div class="card-head"><div><h2>قواعد خانوادگی یادگیری</h2><p>اصول ثابت برای حفظ کیفیت و استمرار</p></div></div><div class="recommendations">${['هر نشست با انتخاب عضو و زبان آغاز شود.','پیشرفت کودکان با بزرگسالان مقایسه نشود.','برای آریا پایان مثبت مهم‌تر از تعداد واژه است.','برای النا هر هفته یک پروژه قابل نمایش تولید شود.','برای آرزو هر هفته یک مأموریت واقعی زندگی یا فناوری انجام شود.','برای سعید هر هفته یک خروجی قابل استفاده در IELTS، مقاله یا مصاحبه ثبت شود.'].map(x=>`<div class="recommendation"><strong>✓ ${x}</strong></div>`).join('')}</div></section></div>`;}
  function familyCard(p,s){const en=s.progress[p.id].en,de=s.progress[p.id].de;return`<article class="family-card">${avatarHTML(p)}<h3>${p.name}</h3><p>${p.description}</p><div class="metric-grid">${metric('🇬🇧',en.totalMinutes,'دقیقه انگلیسی')}${metric('🇩🇪',de.totalMinutes,'دقیقه آلمانی')}</div><button class="secondary-btn" style="margin-top:12px" data-switch-profile="${p.id}">ورود به مسیر</button></article>`;}

  function renderMe(){const s=store.get();return`<div class="stack"><section class="card"><div class="card-head"><div><h2>تنظیمات یادگیری</h2><p>تنظیمات برنامه و تمرکز</p></div></div><div class="settings-grid"><div class="setting-box"><h3>جلسه و تمرکز</h3><label class="field">هدف هفتگی (دقیقه)<input type="number" min="30" max="3000" value="${s.settings.weeklyGoalMinutes}" data-setting="weeklyGoalMinutes"></label><label class="field">پومودورو پیش‌فرض<select data-setting="focusPreset">${[15,25,50,90].map(x=>`<option ${x==s.settings.focusPreset?'selected':''} value="${x}">${x} دقیقه</option>`).join('')}</select></label><label class="field"><span><input type="checkbox" ${s.settings.sound?'checked':''} data-setting="sound"> پخش صدا فعال</span></label></div><div class="setting-box"><h3>داده و پشتیبان</h3><div class="recommendations"><div class="recommendation"><strong>${s.version} · Schema ${s.schema}</strong><small>آخرین ذخیره: ${formatDate(s.updatedAt)}</small></div><div class="recommendation"><strong>دستگاه فعلی</strong><small class="ltr">${s.devices.deviceId}</small></div></div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px"><button id="exportBtn" class="secondary-btn">خروجی JSON</button><button id="importBtn" class="secondary-btn">بازیابی</button><button id="resetBtn" class="danger-btn">بازنشانی</button></div></div><div class="setting-box"><h3>هسته یادگیری</h3><div class="recommendations"><div class="recommendation"><strong>Adaptive Planner</strong><small>برنامه پایدار روزانه، ضعف مهارت و مرور سررسید</small></div><div class="recommendation"><strong>Mastery + SRS</strong><small>تسلط، پایداری، خطانامه و مرور فاصله‌دار</small></div><div class="recommendation"><strong>Event Merge</strong><small>ادغام رویدادهای دو دستگاه بدون بازنویسی کور</small></div></div></div><div class="setting-box"><h3>همگام‌سازی دو دستگاه</h3><p class="muted" style="font-size:10px;line-height:1.9">معماری رویدادمحور آماده است. برای همگام‌سازی زنده باید Supabase URL و کلید عمومی در config.js ثبت شود. کلید Service Role نباید وارد برنامه شود.</p><button id="syncConfigBtn" class="primary-btn">راهنمای اتصال</button></div><div class="setting-box"><h3>مرکز پذیرش PWA</h3><div class="recommendations">${acceptanceChecks().map(x=>`<div class="recommendation"><strong>${x.ok?'✅':'⚠️'} ${x.label}</strong><small>${x.text}</small></div>`).join('')}</div></div></div></section></div>`;}
  function acceptanceChecks(){return[
    {label:'Secure Context',ok:window.isSecureContext||location.hostname==='localhost',text:window.isSecureContext?'فعال':'برای نصب و میکروفن به HTTPS نیاز است'},
    {label:'LocalStorage roundtrip',ok:testStorage(),text:'ذخیره محلی و مهاجرت داده'},
    {label:'Service Worker',ok:'serviceWorker'in navigator,text:'کش آفلاین و PWA'},
    {label:'Speech Synthesis',ok:'speechSynthesis'in window,text:'تلفظ انگلیسی و آلمانی'},
    {label:'Microphone API',ok:!!navigator.mediaDevices?.getUserMedia,text:'ضبط و تمرین گفتار روی دستگاه واقعی'},
    {label:'Online Sync Config',ok:!!(FLH_CONFIG.supabaseUrl&&FLH_CONFIG.supabaseAnonKey),text:'اتصال Supabase هنوز نیازمند تنظیم است'}
  ];}
  function testStorage(){try{localStorage.setItem('__flh_test','1');const ok=localStorage.getItem('__flh_test')==='1';localStorage.removeItem('__flh_test');return ok;}catch(e){return false;}}

  function openSessionGate(){
    const s=store.get();gateDraft={profile:s.active.profile,language:s.active.language,level:s.active.level,duration:s.active.duration,goal:s.active.goal};renderGate();$('#sessionGate').showModal();
  }
  function renderGate(){const p=FLH_PROFILES[gateDraft.profile];$('#gateProfiles').innerHTML=Object.values(FLH_PROFILES).map(x=>`<button type="button" class="profile-choice ${x.id===p.id?'active':''}" data-g-profile="${x.id}">${avatarHTML(x)}<strong>${x.name}</strong><small>${x.role}</small></button>`).join('');$('#gateLanguages').innerHTML=Object.values(FLH_LANGUAGE_META).map(l=>`<button type="button" class="choice-card ${l.id===gateDraft.language?'active':''}" data-g-language="${l.id}"><strong>${l.flag} ${l.fa}</strong><small>${l.name}</small></button>`).join('');const levels=allowedLevels(p);$('#gateLevels').innerHTML=levels.map(id=>{const l=FLH_LEVELS[id];return`<button type="button" class="level-choice ${id===gateDraft.level?'active':''}" data-g-level="${id}"><strong>${l.emoji} ${id}</strong><small>${l.label}</small></button>`;}).join('');const durations=p.id==='aria'?[5,7,8]:p.id==='elena'?[15,22,30]:[15,25,45,60,90];$('#gateDurations').innerHTML=durations.map(x=>`<button type="button" class="choice-card ${x==gateDraft.duration?'active':''}" data-g-duration="${x}"><strong>${x} دقیقه</strong><small>${durationLabel(x,p)}</small></button>`).join('');const goals=p.goals[gateDraft.language];$('#gateGoal').innerHTML=goals.map(g=>`<option ${g===gateDraft.goal?'selected':''}>${g}</option>`).join('');if(!goals.includes(gateDraft.goal))gateDraft.goal=goals[0];$('#gateGoal').value=gateDraft.goal;$('#gateSummary').textContent=`${p.name} · ${FLH_LANGUAGE_META[gateDraft.language].fa} · ${levelLabel(gateDraft.level)} · ${gateDraft.duration} دقیقه`;
    $$('[data-g-profile]').forEach(b=>b.onclick=()=>{const np=FLH_PROFILES[b.dataset.gProfile];gateDraft.profile=np.id;gateDraft.language=np.defaultLanguage;gateDraft.level=np.id==='aria'?'PRE':np.levels[gateDraft.language];gateDraft.duration=np.dailyMinutes;gateDraft.goal=np.goals[gateDraft.language][0];renderGate();});$$('[data-g-language]').forEach(b=>b.onclick=()=>{gateDraft.language=b.dataset.gLanguage;const np=FLH_PROFILES[gateDraft.profile];gateDraft.level=np.id==='aria'?'PRE':np.levels[gateDraft.language];gateDraft.goal=np.goals[gateDraft.language][0];renderGate();});$$('[data-g-level]').forEach(b=>b.onclick=()=>{gateDraft.level=b.dataset.gLevel;renderGate();});$$('[data-g-duration]').forEach(b=>b.onclick=()=>{gateDraft.duration=+b.dataset.gDuration;renderGate();});$('#gateGoal').onchange=e=>{gateDraft.goal=e.target.value;$('#gateSummary').textContent=`${p.name} · ${FLH_LANGUAGE_META[gateDraft.language].fa} · ${levelLabel(gateDraft.level)} · ${gateDraft.duration} دقیقه`;};
  }
  function allowedLevels(p){if(p.id==='aria')return['PRE'];if(p.id==='elena')return['A0','A1','A2','B1'];return['A0','A1','A2','B1','B2','C1','C2'];}
  function durationLabel(x,p){if(p.id==='aria')return x<=5?'تماس خیلی کوتاه':x<=7?'بازی استاندارد':'حداکثر پیشنهادی';if(x<=15)return'مرور سریع';if(x<=30)return'جلسه معمول';if(x<=60)return'جلسه عمیق';return'تمرکز بلند';}
  function applyGate(){store.update(s=>{s.active={...s.active,...gateDraft,view:'today'};s.sessions.push({id:FLH_STORE.uid('session'),...gateDraft,startedAt:new Date().toISOString()});return s;},'new-session');store.clearPlan();plan=engine.buildDailyPlan({force:true});store.savePlan(plan);$('#sessionGate').close();switchView('today');}
  function levelLabel(id){const l=FLH_LEVELS[id];return l?`${l.emoji} ${id} ${l.label}`:id;}

  function openFirstIncomplete(){const ctx=engine.active(),t=plan.steps.find(x=>!ctx.progress.lessons[x.id]?.done)||plan.steps[0];if(t)openTask(t.id);}
  function openTask(id){const task=plan?.steps.find(x=>x.id===id);if(!task)return;renderTaskDialog(task);$('#taskDialog').showModal();}
  function renderTaskDialog(task){const b=$('#taskDialogBody');b.innerHTML=`<div class="dialog-shell"><header class="dialog-head"><div><span class="badge">${engine.skillFa(task.skill)} · ${task.minutes} دقیقه</span><h2>${task.title}</h2><small class="muted">${task.unitTitle}</small></div><button class="close-btn" id="closeTask">×</button></header><div class="dialog-body">${taskBody(task)}</div><footer class="dialog-actions"><button class="secondary-btn" id="skipTask">بعداً</button><button class="primary-btn" id="completeTask">ثبت و ادامه</button></footer></div>`;$('#closeTask').onclick=()=>$('#taskDialog').close();$('#skipTask').onclick=()=>$('#taskDialog').close();bindTaskControls(task);$('#completeTask').onclick=()=>finishTask(task);}
  function taskBody(t){
    if(t.type==='visual-choice'||t.type==='sound-picture')return`<div class="visual-task">
      <div class="task-prompt"><p>${escapeHTML(t.prompt)}</p><button class="primary-btn" data-dialog-speak="${encodeURIComponent(t.audio||'')}">🔊 پخش واژه</button>${t.gentle?'<small class="gentle-note">در این سن، مشاهده و مشارکت داوطلبانه هم موفقیت محسوب می‌شود.</small>':''}</div>
      <div class="picture-grid">${(t.items||[]).map(x=>`<button class="picture-card" data-visual-answer="${escapeAttr(x.id)}" style="--picture-bg:${x.color||'#f8fafc'}"><span class="picture-emoji">${x.emoji}</span><strong class="ltr">${escapeHTML(x.word)}</strong><small>${escapeHTML(x.fa)}</small></button>`).join('')}</div>
      <div id="taskFeedback"></div>
    </div>`;
    if(t.type==='trace-letter')return`<div class="trace-layout">
      <div class="letter-model" style="--trace-accent:${document.body.dataset.profile==='elena'?'#4f46e5':'#0e7490'}"><span>${escapeHTML(t.letter)}</span><div><strong class="ltr">${escapeHTML(t.word)}</strong><small>${t.emoji} ${escapeHTML(t.translation)}</small><button class="secondary-btn" data-dialog-speak="${encodeURIComponent(t.word)}">🔊 شنیدن واژه</button></div></div>
      <div class="trace-board"><canvas id="traceCanvas" width="760" height="360" data-letter="${escapeAttr(t.letter)}"></canvas><div class="trace-actions"><button class="secondary-btn" type="button" id="clearTrace">پاک‌کردن</button><span id="traceStatus">با انگشت یا ماوس روی حرف حرکت کن.</span></div></div>
    </div>`;
    if(t.type==='memory')return`<div class="task-prompt"><p>${escapeHTML(t.prompt)}</p></div><div id="memoryBoard" class="memory-board">${engine.shuffle((t.items||[]).flatMap(x=>[
      `<button class="memory-card" data-memory-key="${escapeAttr(x.id)}" data-memory-kind="image"><span>${x.emoji}</span></button>`,
      `<button class="memory-card" data-memory-key="${escapeAttr(x.id)}" data-memory-kind="word"><strong class="ltr">${escapeHTML(x.word)}</strong></button>`
    ]),t.seed||t.id).join('')}</div><div id="taskFeedback"></div>`;
    if(t.type==='story-sequence')return`<div class="task-prompt"><p>${escapeHTML(t.prompt)}</p></div><div id="storyBoard" class="story-board">${(t.steps||[]).map(x=>`<button class="story-card" data-story-order="${x.order}"><span>${x.emoji}</span><strong class="ltr">${escapeHTML(x.text)}</strong><small>برای انتخاب ترتیب لمس کن</small></button>`).join('')}</div><div id="storySequence" class="sequence-strip"></div><div id="taskFeedback"></div>`;
    if(t.type==='movement')return`<div class="movement-card"><span>${t.emoji||'🤸'}</span><h2>${escapeHTML(t.prompt)}</h2><strong class="ltr">${escapeHTML(t.model||'')}</strong><button class="primary-btn" data-dialog-speak="${encodeURIComponent(t.model||'')}">🔊 پخش و اجرا</button><small>سه بار انجام دهید و قبل از خستگی پایان دهید.</small></div>`;
    if(t.type==='echo')return`<div class="movement-card"><span>${t.emoji||'🗣️'}</span><h2 class="ltr">${escapeHTML(t.model||'')}</h2><p>${escapeHTML(t.translation||'')}</p><button class="primary-btn" data-dialog-speak="${encodeURIComponent(t.model||'')}">🔊 پخش آرام</button><small>${escapeHTML(t.prompt)}</small></div>`;
    if(t.type==='flash')return`<div class="task-prompt" style="text-align:center"><h2 class="ltr">${escapeHTML(t.prompt)}</h2><p>${escapeHTML(t.translation)}</p><button class="secondary-btn" data-dialog-speak="${encodeURIComponent(t.prompt)}">🔊 پخش تلفظ</button></div><div class="answer-grid">${t.items.slice(0,5).map(x=>`<div class="answer-option"><strong class="ltr">${escapeHTML(x.target)}</strong><small>${escapeHTML(x.fa)}</small></div>`).join('')}</div>`;
    if(t.type==='listen-mcq')return`<div class="task-prompt"><p>${t.prompt}</p><button class="primary-btn" data-dialog-speak="${encodeURIComponent(t.audio)}">▶ پخش عبارت</button></div><div class="answer-grid">${t.choices.map(c=>`<button class="answer-option" data-answer="${escapeAttr(c)}">${escapeHTML(c)}</button>`).join('')}</div><div id="taskFeedback"></div>`;
    if(t.type==='speak')return`<div class="task-prompt"><p>${t.prompt}</p><p class="ltr"><strong>${escapeHTML(t.model||'')}</strong></p><button class="secondary-btn" data-dialog-speak="${encodeURIComponent(t.model||'')}">🔊 شنیدن مدل</button></div><div class="recommendation" style="margin-top:12px"><strong>خودارزیابی گفتار</strong><small>آیا پیام روشن بود؟ آیا مکث‌ها کنترل شد؟ آیا واژه هدف را استفاده کردید؟</small></div>`;
    if(t.type==='lesson'||t.type==='reading')return`<div class="task-prompt"><p>${t.prompt}</p>${t.explanation?`<p>${t.explanation}</p>`:''}${t.model?`<p class="ltr"><strong>${escapeHTML(t.model)}</strong></p>`:''}${t.question?`<hr><strong>${t.question}</strong>`:''}</div><textarea id="taskText" class="text-answer" placeholder="یادداشت یا پاسخ خود را بنویسید…"></textarea>`;
    if(t.type==='writing'||t.type==='recall'||t.type==='reflection'||t.type==='review')return`<div class="task-prompt"><p>${t.prompt}</p>${t.criteria?`<ul>${t.criteria.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</div><textarea id="taskText" class="text-answer" placeholder="پاسخ شما…"></textarea>`;
    if(t.type==='build')return`<div class="task-prompt"><p>${t.prompt}</p><div id="buildTokens" style="display:flex;gap:6px;flex-wrap:wrap">${t.tokens.map((x,i)=>`<button class="secondary-btn" data-token="${i}">${escapeHTML(x)}</button>`).join('')}</div><div id="builtAnswer" class="answer-option ltr" style="margin-top:12px;min-height:45px"></div></div><div id="taskFeedback"></div>`;
    if(t.type==='mission')return`<div class="task-prompt"><p>${t.prompt}</p></div><div class="answer-grid">${t.checklist.map((x,i)=>`<label class="answer-option"><input type="checkbox" data-check> ${x}</label>`).join('')}</div><textarea id="taskText" class="text-answer" placeholder="خروجی یا یادداشت ماموریت…"></textarea>`;
    if(t.type==='parent-check')return`<div class="task-prompt"><p>${t.prompt}</p></div><div class="answer-grid">${t.choices.map(x=>`<label class="answer-option"><input type="checkbox" data-check> ${x}</label>`).join('')}</div>`;
    if(t.type==='parent'||t.type==='note')return`<div class="task-prompt"><p>${t.prompt}</p>${t.model?`<p class="ltr"><strong>${t.model}</strong></p><button class="secondary-btn" data-dialog-speak="${encodeURIComponent(t.model)}">🔊 پخش آرام</button>`:''}</div>`;
    return`<div class="task-prompt"><p>${t.prompt}</p></div>`;
  }
  function bindTaskControls(t){
    $$('[data-dialog-speak]').forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.dialogSpeak)));
    $$('[data-answer]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.answer===t.answer;$$('[data-answer]').forEach(x=>x.disabled=true);
      b.style.borderColor=ok?'#22c55e':'#ef4444';
      $('#taskFeedback').innerHTML=`<div class="feedback ${ok?'good':'bad'}">${ok?'درست است.':'پاسخ درست: '+escapeHTML(t.answer)}</div>`;
      b.dataset.score=ok?'100':'35';
    });
    $$('[data-visual-answer]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.visualAnswer===t.answer;
      $$('[data-visual-answer]').forEach(x=>{x.disabled=true;x.classList.toggle('correct',x.dataset.visualAnswer===t.answer);});
      b.classList.add(ok?'selected-good':'selected-bad');b.dataset.score=ok?'100':(t.gentle?'80':'40');
      $('#taskFeedback').innerHTML=`<div class="feedback ${ok?'good':'bad'}">${ok?'آفرین؛ تصویر درست انتخاب شد.':t.gentle?'اشکالی ندارد؛ تصویر درست روشن شد.':'دوباره به واژه گوش کن و تصویر سبز را ببین.'}</div>`;
      
    });
    let built=[];$$('[data-token]').forEach(b=>b.onclick=()=>{built.push(t.tokens[+b.dataset.token]);b.disabled=true;$('#builtAnswer').textContent=built.join(' ');$('#builtAnswer').dataset.value=built.join(' ');});
    bindTraceCanvas(t);
    bindMemory(t);
    bindStory(t);
  }
  function bindTraceCanvas(t){
    const canvas=$('#traceCanvas');if(!canvas)return;
    const ctx=canvas.getContext('2d');let drawing=false,points=0;
    const fit=()=>{const r=canvas.getBoundingClientRect();canvas.width=Math.max(320,Math.floor(r.width*devicePixelRatio));canvas.height=Math.max(220,Math.floor(r.height*devicePixelRatio));ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);drawGuide();};
    const drawGuide=()=>{const w=canvas.clientWidth||760,h=canvas.clientHeight||360;ctx.clearRect(0,0,w,h);ctx.save();ctx.globalAlpha=.13;ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--primary')||'#4f46e5';ctx.font=`900 ${Math.min(h*.78,w*.55)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.letter,w/2,h/2);ctx.restore();ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--primary')||'#4f46e5';ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';};
    const pos=e=>{const r=canvas.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:p.clientX-r.left,y:p.clientY-r.top};};
    const start=e=>{drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault();};
    const move=e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();points++;canvas.dataset.drawn=points>8?'yes':'';$('#traceStatus').textContent=points>8?'ردگیری ثبت شد؛ حالا واژه را بلند بگو.':'ادامه بده…';e.preventDefault();};
    const end=()=>{drawing=false;};
    canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',end,{once:false});
    $('#clearTrace').onclick=()=>{points=0;canvas.dataset.drawn='';drawGuide();$('#traceStatus').textContent='با انگشت یا ماوس روی حرف حرکت کن.';};
    requestAnimationFrame(fit);
  }
  function bindMemory(t){
    const board=$('#memoryBoard');if(!board)return;let open=[],matched=0,moves=0;
    $$('.memory-card',board).forEach(card=>card.onclick=()=>{
      if(card.classList.contains('matched')||open.includes(card)||open.length===2)return;
      card.classList.add('open');open.push(card);
      if(open.length===2){moves++;const ok=open[0].dataset.memoryKey===open[1].dataset.memoryKey&&open[0].dataset.memoryKind!==open[1].dataset.memoryKind;
        setTimeout(()=>{if(ok){open.forEach(x=>x.classList.add('matched'));matched+=2;}else open.forEach(x=>x.classList.remove('open'));open=[];board.dataset.score=matched===board.children.length?String(Math.max(60,100-(moves-4)*5)):board.dataset.score||'';if(matched===board.children.length)$('#taskFeedback').innerHTML='<div class="feedback good">همه جفت‌ها پیدا شدند.</div>';},450);
      }
    });
  }
  function bindStory(t){
    const board=$('#storyBoard'),strip=$('#storySequence');if(!board||!strip)return;const order=[];
    $$('.story-card',board).forEach(card=>card.onclick=()=>{if(card.disabled)return;card.disabled=true;card.classList.add('chosen');order.push(+card.dataset.storyOrder);strip.innerHTML=order.map((x,i)=>`<span>${i+1} ← کارت ${x}</span>`).join('');strip.dataset.value=order.join(',');if(order.length===t.steps.length){const ok=strip.dataset.value===t.answer;strip.dataset.score=ok?'100':'45';$('#taskFeedback').innerHTML=`<div class="feedback ${ok?'good':'bad'}">${ok?'ترتیب داستان درست است.':'ترتیب درست را یک‌بار دیگر با متن کارت‌ها مرور کن.'}</div>`;}});
  }
  function finishTask(t){
    let score=100,result={};const ans=$('[data-answer][data-score]');
    if(t.type==='listen-mcq'&&!ans){toast('ابتدا یک پاسخ انتخاب کنید','bad');return;}
    if(ans){score=+ans.dataset.score;result.userAnswer=ans.dataset.answer;result.correctAnswer=t.answer;result.correct=ans.dataset.answer===t.answer;}
    if(t.type==='visual-choice'||t.type==='sound-picture'){
      const selected=$('[data-visual-answer][data-score]');
      if(!selected){if(t.gentle){score=75;result.observation='مشاهده بدون انتخاب';result.correct=true;}else{toast('ابتدا یک تصویر انتخاب کن','bad');return;}}
      else{score=+selected.dataset.score;result.userAnswer=selected.dataset.visualAnswer;result.correctAnswer=t.answer;result.correct=selected.dataset.visualAnswer===t.answer;}
    }
    if(t.type==='trace-letter'){if($('#traceCanvas')?.dataset.drawn!=='yes'){toast('ابتدا کمی روی حرف ردگیری کن','bad');return;}score=100;result.letter=t.letter;result.correct=true;}
    if(t.type==='memory'){const board=$('#memoryBoard');if(!board?.dataset.score){toast('بازی حافظه را کامل کن','bad');return;}score=+board.dataset.score;result.pairs=t.items?.length||0;result.totalPairs=t.items?.length||0;result.correct=score>=80;}
    if(t.type==='story-sequence'){const strip=$('#storySequence');if(!strip?.dataset.score){toast('همه کارت‌های داستان را انتخاب کن','bad');return;}score=+strip.dataset.score;result.sequence=strip.dataset.value;result.userAnswer=strip.dataset.value;result.correctAnswer=t.answer;result.correct=strip.dataset.value===t.answer;}
    if(t.type==='build'){const v=$('#builtAnswer')?.dataset.value||'';score=normalise(v)===normalise(t.answer)?100:45;result.userAnswer=v;result.correctAnswer=t.answer;result.correct=score===100;}
    const text=$('#taskText')?.value?.trim();
    if(['writing','recall','reflection','review','reading','mission'].includes(t.type)&&!text){toast('یک پاسخ کوتاه ثبت کنید.','bad');return;}
    if(t.type==='mission'){const checks=$$('[data-check]:checked').length;score=Math.round(checks/Math.max(1,t.checklist.length)*70+(text?30:0));result.completed=checks===t.checklist.length;result.correct=score>=70;}
    if(t.type==='parent-check'){score=100;result.observations=$$('[data-check]:checked').map(x=>x.parentElement.textContent.trim());result.parentGuided=true;result.correct=true;}
    if(t.type==='movement'||t.type==='echo'||t.type==='parent'||t.type==='note'){score=100;result.parentGuided=true;result.correct=true;}
    if(['writing','recall','reflection','review','reading','lesson','speak','flash'].includes(t.type)&&result.correct===undefined)result.correct=score>=70;
    result.text=text||'';result.confidence=score>=90?85:score>=70?70:45;
    const saved=engine.completeTask(t,{score,minutes:t.minutes,...result});$('#taskDialog').close();renderView();toast(`فعالیت ثبت شد · امتیاز ${saved.score}`,'good');setTimeout(openNextTask,200);
  }

  function openNextTask(){if(!plan)return;const ctx=engine.active(),next=plan.steps.find(x=>!ctx.progress.lessons[x.id]?.done);if(next&&confirm('گام بعدی را باز کنیم؟'))openTask(next.id);}
  function normalise(s){return(s||'').toLowerCase().replace(/[.,!?؛،]/g,'').replace(/\s+/g,' ').trim();}

  function openUnit(id){const ctx=engine.active(),u=engine.allUnits(ctx.language,ctx.profile.id).find(x=>x.id===id);if(!u)return;store.update(s=>{s.progress[ctx.profile.id][ctx.language].currentUnit=u.id;s.active.level=u.level;return s;},'select-unit');store.clearPlan();plan=engine.buildDailyPlan({unit:u,level:u.level,force:true});store.savePlan(plan);switchView('today');toast(`واحد «${u.titleFa}» فعال شد`,'good');}
  function launchPractice(id){
    const ctx=engine.active();
    if(id==='errorbook'){showErrorBook();return;}
    if(id==='diagnostic'){showDiagnostic(ctx);return;}
    if(id==='vocab'&&showVocabularyReview(ctx))return;
    if(id==='alphabet'){showAlphabetLab(ctx.language);return;}
    if(id==='visual-match'||id==='picture-talk'){showVisualPractice(ctx,id);return;}
    if(id==='sound-match'){showVisualPractice(ctx,'sound');return;}
    if(id==='memory'){showMemoryPractice(ctx);return;}
    if(id==='story-sequence'||id==='story'){showStoryPractice(ctx);return;}
    if(id==='movement-game'||id==='songs'){showMovementPractice(ctx);return;}
    if(id==='parent-session'){plan=engine.buildDailyPlan({force:true});store.savePlan(plan);openFirstIncomplete();return;}
    const current=engine.currentUnit(ctx);const fake=makePracticeTask(id,current,ctx);renderTaskDialog(fake);$('#taskDialog').showModal();
  }
  function makePracticeTask(id,u,ctx){const ph=engine.phrasesFor(u,ctx.profile,ctx.language),pair=ph[0]||{target:u.title,fa:u.titleFa},base={id:`practice-${id}-${Date.now()}`,unitId:u.id,unitTitle:u.titleFa,targetLanguage:ctx.language,minutes:10,skill:id==='listening'?'listening':id==='writing'?'writing':id==='grammar'?'grammar':id==='vocab'?'vocabulary':'speaking',profile:ctx.profile.id};if(id==='vocab')return{...base,type:'flash',title:'مرور واژگان',prompt:pair.target,translation:pair.fa,items:ph};if(id==='listening')return{...base,type:'listen-mcq',title:'شنیدار',prompt:'گوش کنید و معنی درست را انتخاب کنید.',audio:pair.target,answer:pair.fa,choices:engine.shuffle([pair.fa,...ph.slice(1).map(x=>x.fa),'گزینه دیگر']).slice(0,4)};if(id==='writing')return{...base,type:'writing',title:'کارگاه نوشتن',prompt:`یک خروجی کاربردی درباره «${u.titleFa}» بنویسید.`,criteria:['هدف روشن','ساختار مناسب سطح','واژگان واحد','بازبینی']};if(id==='grammar')return{...base,type:'lesson',title:'گرامر در عمل',prompt:`ساختار: ${u.grammar}`,explanation:`سه مثال بسازید و یکی را در یک موقعیت واقعی «${u.titleFa}» استفاده کنید.`,model:pair.target};if(id==='research'||id.startsWith('research-'))return{...base,type:'speak',title:'آزمایشگاه پژوهش',prompt:'پژوهش خود را با ساختار مسئله، روش، نتیجه، نوآوری و محدودیت توضیح دهید.',model:'My research examines whether risk-prioritisation decisions remain stable under defensible model assumptions.'};if(id==='ielts'||id.startsWith('ielts-'))return{...base,type:'writing',title:'IELTS Practice',prompt:'Some people believe technology always improves workplace safety. To what extent do you agree or disagree?',criteria:['موضع روشن','دو استدلال توسعه‌یافته','مثال مرتبط','نتیجه‌گیری']};if(id==='shopping')return{...base,type:'mission',title:'ماموریت خرید',prompt:'فهرست خرید بنویسید، مقدار و قیمت بپرسید، روش پرداخت را مشخص و رسید را کنترل کنید.',checklist:['۵ قلم کالا','۲ عبارت مقدار','یک سؤال قیمت','یک سؤال پرداخت','کنترل رسید']};return{...base,type:'speak',title:'تمرین گفتار',prompt:`درباره «${u.titleFa}» پاسخ بدهید.`,model:pair.target};}
  function visualBase(ctx,id,skill='vocabulary',minutes=7){
    const unit=engine.currentUnit(ctx);return{id:`visual-${id}-${Date.now()}`,unitId:unit.id,unitTitle:unit.titleFa,targetLanguage:ctx.language,minutes,skill,profile:ctx.profile.id};
  }
  function showVisualPractice(ctx,mode='visual'){
    const unit=engine.currentUnit(ctx),set=FLH_VISUALS.pick(unit,ctx.language,ctx.profile.id==='aria'?3:4),target=set.items[0],base=visualBase(ctx,mode,'listening',ctx.profile.id==='aria'?4:8);
    const task={...base,type:mode==='sound'?'sound-picture':'visual-choice',title:mode==='sound'?'گوش کن و تصویر را پیدا کن':'تصویر و واژه',prompt:mode==='sound'?'واژه را گوش کن و تصویر درست را لمس کن.':`تصویر «${target.word}» را پیدا کن.`,audio:target.word,answer:target.id,items:engine.shuffle(set.items),gentle:ctx.profile.id==='aria'};
    renderTaskDialog(task);$('#taskDialog').showModal();
  }
  function showMemoryPractice(ctx){
    const unit=engine.currentUnit(ctx),set=FLH_VISUALS.pick(unit,ctx.language,4),task={...visualBase(ctx,'memory','vocabulary',10),type:'memory',title:'بازی حافظه تصویر و واژه',prompt:'کارت‌ها را باز کن و هر تصویر را با واژه خودش جفت کن.',items:set.items};
    renderTaskDialog(task);$('#taskDialog').showModal();
  }
  function showStoryPractice(ctx){
    const unit=engine.currentUnit(ctx),steps=FLH_VISUALS.story(ctx.language,unit.order),task={...visualBase(ctx,'story','reading',10),type:'story-sequence',title:'داستان تصویری',prompt:'کارت‌ها را به ترتیب منطقی داستان انتخاب کن.',steps:engine.shuffle(steps),answer:steps.map(x=>x.order).join(',')};
    renderTaskDialog(task);$('#taskDialog').showModal();
  }
  function showMovementPractice(ctx){
    const unit=engine.currentUnit(ctx),[phrase,fa,emoji]=FLH_VISUALS.movement(ctx.language,unit.order),task={...visualBase(ctx,'movement','listening',5),type:'movement',title:'واژه و حرکت',prompt:`با هم انجام دهید: ${fa}`,model:phrase,emoji};
    renderTaskDialog(task);$('#taskDialog').showModal();
  }
  function showVocabularyReview(ctx){
    const cards=FLH_CORE.dueCards(store.get(),ctx.profile.id,ctx.language);if(!cards.length)return false;
    const render=()=>{const remaining=FLH_CORE.dueCards(store.get(),ctx.profile.id,ctx.language),card=remaining[0];if(!card){$('#taskDialog').close();toast('مرورهای سررسیدشده تمام شد','good');renderView();return;}
      $('#taskDialogBody').innerHTML=`<div class="dialog-shell"><header class="dialog-head"><div><span class="badge">SRS · ${remaining.length} کارت</span><h2>مرور فاصله‌دار</h2></div><button class="close-btn" id="closeTask">×</button></header><div class="dialog-body"><div class="movement-card"><span>🧠</span><h2 class="ltr">${escapeHTML(card.front)}</h2><button id="revealCard" class="primary-btn">نمایش معنی</button><p id="cardBack" class="hidden">${escapeHTML(card.back||'—')}</p></div><div id="qualityRow" class="hidden" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button class="secondary-btn" data-card-q="1">فراموش کردم</button><button class="secondary-btn" data-card-q="3">سخت بود</button><button class="secondary-btn" data-card-q="4">خوب بود</button><button class="primary-btn" data-card-q="5">کاملاً بلد بودم</button></div></div></div>`;
      $('#closeTask').onclick=()=>$('#taskDialog').close();$('#revealCard').onclick=()=>{$('#cardBack').classList.remove('hidden');$('#qualityRow').classList.remove('hidden');};$$('[data-card-q]').forEach(b=>b.onclick=()=>{engine.reviewVocab(card.id,+b.dataset.cardQ);render();});};
    render();$('#taskDialog').showModal();return true;
  }
  function showDiagnostic(ctx){
    if(ctx.profile.id==='aria'){toast('برای آریا ارزیابی رسمی استفاده نمی‌شود','bad');return;}
    const unit=engine.currentUnit(ctx),phrases=engine.phrasesFor(unit,ctx.profile,ctx.language),p1=phrases[0]||{target:unit.title,fa:unit.titleFa},p2=phrases[1]||p1;
    const wrong=[...new Set(phrases.slice(1).map(x=>x.fa).filter(x=>x!==p1.fa))].slice(0,2);const choices=engine.shuffle([p1.fa,...wrong,'هیچ‌کدام'],`diagnostic-${ctx.profile.id}-${ctx.language}-${ctx.level}`);
    $('#taskDialogBody').innerHTML=`<div class="dialog-shell"><header class="dialog-head"><div><span class="badge">${ctx.level} · ارزیابی هسته</span><h2>ارزیابی کوتاه چهارمهارتی</h2><small>این آزمون جایگزین آزمون رسمی نیست؛ برای تنظیم مسیر داخلی برنامه است.</small></div><button class="close-btn" id="closeTask">×</button></header><div class="dialog-body"><div class="stack"><div class="task-prompt"><strong>۱. شنیدار و واژگان</strong><p>عبارت را گوش کن و معنی درست را انتخاب کن.</p><button class="secondary-btn" id="diagSpeak">🔊 پخش</button><div class="answer-grid">${choices.map(c=>`<label class="answer-option"><input type="radio" name="diagListen" value="${escapeAttr(c)}"> ${escapeHTML(c)}</label>`).join('')}</div></div><div class="task-prompt"><strong>۲. نوشتن/ساخت جمله</strong><p class="ltr">${escapeHTML(p2.target)}</p><textarea id="diagText" class="text-answer" placeholder="معنی یا یک جمله مرتبط بنویسید…"></textarea></div><div class="task-prompt"><strong>۳. گفتار</strong><p>عبارت بالا را بگویید و میزان استقلال خود را انتخاب کنید.</p><input id="diagSpeaking" type="range" min="0" max="100" step="10" value="60"><small>۰ = نتوانستم · ۱۰۰ = روان و مستقل</small></div><div class="task-prompt"><strong>۴. خواندن</strong><p class="ltr">${escapeHTML(p1.target)} ${escapeHTML(p2.target)}</p><input id="diagReading" type="range" min="0" max="100" step="10" value="60"></div></div></div><footer class="dialog-actions"><button class="primary-btn" id="saveDiagnostic">ثبت ارزیابی</button></footer></div>`;
    $('#closeTask').onclick=()=>$('#taskDialog').close();$('#diagSpeak').onclick=()=>speak(p1.target);$('#saveDiagnostic').onclick=()=>{const selected=$('input[name="diagListen"]:checked')?.value;if(!selected){toast('پاسخ شنیدار را انتخاب کنید','bad');return;}const text=$('#diagText').value.trim();if(!text){toast('یک پاسخ کوتاه بنویسید','bad');return;}const scores={listening:selected===p1.fa?100:35,vocabulary:selected===p1.fa?100:40,writing:Math.min(100,40+text.split(/\s+/).length*10),speaking:+$('#diagSpeaking').value,reading:+$('#diagReading').value};const r=engine.recordAssessment(ctx.level,scores,ctx);$('#taskDialog').close();renderView();toast(`ارزیابی ثبت شد · میانگین ${r.average} · ${r.passed?'عبور':'نیاز به تمرین بیشتر'}`,r.passed?'good':'bad');};
    $('#taskDialog').showModal();
  }
  function showErrorBook(){const s=store.get(),ctx=engine.active(),errs=s.errorBook.filter(e=>e.profile===ctx.profile.id&&e.language===ctx.language&&!e.resolved);$('#taskDialogBody').innerHTML=`<div class="dialog-shell"><header class="dialog-head"><div><h2>خطانامه شخصی</h2><small>${errs.length} مورد باز</small></div><button class="close-btn" id="closeTask">×</button></header><div class="dialog-body"><div class="answer-grid">${errs.length?errs.map(e=>`<div class="answer-option"><strong>${escapeHTML(e.userAnswer||'—')}</strong><small>درست: ${escapeHTML(e.correctAnswer||'—')}</small><div style="margin-top:7px"><button class="secondary-btn" data-review-error="${e.id}" data-q="5">بلدم</button> <button class="secondary-btn" data-review-error="${e.id}" data-q="2">دوباره مرور</button></div></div>`).join(''):'<div class="recommendation"><strong>خطای ثبت‌شده‌ای ندارید.</strong><small>خطاها از تمرین‌های واقعی وارد این بخش می‌شوند.</small></div>'}</div></div></div>`;$('#closeTask').onclick=()=>$('#taskDialog').close();$$('[data-review-error]').forEach(b=>b.onclick=()=>{engine.reviewError(b.dataset.reviewError,+b.dataset.q);showErrorBook();});$('#taskDialog').showModal();}
  function showAlphabetLab(lang){
    const letters=FLH_VISUALS.alphabet(lang);
    $('#taskDialogBody').innerHTML=`<div class="dialog-shell"><header class="dialog-head"><div><h2>الفبا، تصویر و ردگیری</h2><small>${letters.length} حرف/نویسه · لمس برای تمرین</small></div><button class="close-btn" id="closeTask">×</button></header><div class="dialog-body"><div class="alphabet-grid">${letters.map((x,i)=>`<button class="alphabet-card" data-letter-index="${i}" style="--letter-bg:${['#dbeafe','#fce7f3','#dcfce7','#fef3c7','#ede9fe'][i%5]}"><span class="alphabet-emoji">${x[2]}</span><strong>${x[0]} ${x[0].toLowerCase()}</strong><small class="ltr">${escapeHTML(x[1])}</small></button>`).join('')}</div></div></div>`;
    $('#closeTask').onclick=()=>$('#taskDialog').close();
    $$('[data-letter-index]').forEach(b=>b.onclick=()=>{const [letter,word,emoji,fa]=letters[+b.dataset.letterIndex],ctx=engine.active(),unit=engine.currentUnit(ctx);const task={id:`alphabet-${lang}-${letter}-${Date.now()}`,unitId:unit.id,unitTitle:'الفبا و فونیک',targetLanguage:lang,minutes:6,skill:'pronunciation',profile:ctx.profile.id,type:'trace-letter',title:`حرف ${letter}`,prompt:`حرف ${letter} را گوش کن، ردگیری کن و واژه را بگو.`,letter,word,emoji,translation:fa,model:word};renderTaskDialog(task);});
    $('#taskDialog').showModal();
  }

  function openFocus(){renderFocus();$('#focusDialog').showModal();}
  function renderFocus(){const preset=store.get().settings.focusPreset||25;timer.total=timer.total||preset*60;timer.seconds=timer.seconds||timer.total;const pct=timer.total?Math.round((timer.total-timer.seconds)/timer.total*100):0;$('#focusDialogBody').innerHTML=`<div class="focus-shell"><button class="close-btn" id="closeFocus" style="float:left">×</button><h2>تمرکز بدون حواس‌پرتی</h2><p class="muted">زمان تمرکز در گزارش یادگیری ثبت می‌شود.</p><div class="timer-ring" style="--pct:${pct}%"><strong>${fmtTimer(timer.seconds)}</strong></div><div class="timer-presets">${[15,25,50,90].map(x=>`<button data-preset="${x}">${x} دقیقه</button>`).join('')}</div><div style="display:flex;justify-content:center;gap:8px;margin-top:14px"><button id="timerToggle" class="primary-btn">${timer.running?'توقف':'شروع'}</button><button id="timerReset" class="secondary-btn">بازنشانی</button><button id="timerFinish" class="secondary-btn">پایان و ثبت</button></div></div>`;$('#closeFocus').onclick=()=>$('#focusDialog').close();$$('[data-preset]').forEach(b=>b.onclick=()=>{stopTimer();timer.total=timer.seconds=+b.dataset.preset*60;renderFocus();});$('#timerToggle').onclick=()=>timer.running?stopTimer(true):startTimer();$('#timerReset').onclick=()=>{stopTimer();timer.seconds=timer.total;renderFocus();};$('#timerFinish').onclick=finishFocus;}
  function startTimer(){timer.running=true;timer.interval=setInterval(()=>{timer.seconds--;if(timer.seconds<=0){finishFocus();return;}renderFocus();},1000);renderFocus();}
  function stopTimer(render=false){clearInterval(timer.interval);timer.interval=null;timer.running=false;if(render)renderFocus();}
  function finishFocus(){stopTimer();const minutes=Math.max(1,Math.round((timer.total-timer.seconds)/60));if(minutes>0){const s=store.get(),ctx=engine.active();store.update(st=>{const p=st.progress[ctx.profile.id][ctx.language];p.totalMinutes+=minutes;p.heat[engine.todayKey()]=(p.heat[engine.todayKey()]||0)+minutes;return st;},'focus');store.addEvent('focus_completed',{minutes});toast(`${minutes} دقیقه تمرکز ثبت شد`,'good');}timer.seconds=timer.total;$('#focusDialog').close();}
  function fmtTimer(sec){return`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}

  function backup(){const blob=new Blob([store.exportJSON()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`family-language-os-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('فایل پشتیبان ساخته شد','good');}
  async function restore(e){const f=e.target.files?.[0];if(!f)return;try{store.importJSON(await f.text());toast('داده‌ها بازیابی شدند','good');renderShell();renderView();}catch(err){toast('فایل پشتیبان معتبر نیست','bad');}e.target.value='';}
  function resetApp(){if(confirm('همه داده‌های محلی حذف و برنامه از نو ساخته شود؟')){store.reset();plan=null;renderShell();switchView('today');openSessionGate();}}
  function showSyncHelp(){alert('برای اتصال دو دستگاه:\n1) پروژه Supabase بسازید.\n2) supabase/schema.sql را اجرا کنید.\n3) URL و Anon/Publishable Key را در config.js قرار دهید.\n4) هر دو دستگاه با یک حساب خانوادگی وارد شوند.\nService Role را هرگز در برنامه قرار ندهید.');}
  function updateSetting(k,v){store.update(s=>{s.settings[k]=k==='weeklyGoalMinutes'||k==='focusPreset'?+v:v;return s;},'setting');toast('تنظیم ذخیره شد','good');}
  function updateSyncBadge(){const s=store.get(),el=$('#syncState');if(!el)return;const cloud=!!(FLH_CONFIG.supabaseUrl&&FLH_CONFIG.supabaseAnonKey);el.querySelector('i').style.background=navigator.onLine?'#22c55e':'#ef4444';el.querySelector('span').textContent=cloud?(navigator.onLine?'ابر آماده':'آفلاین؛ صف محلی'):'ذخیره محلی فعال';}

  function speak(text){if(!text||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.lang=FLH_LANGUAGE_META[store.get().active.language].voice;u.rate=store.get().active.profile==='aria'?.75:.9;speechSynthesis.cancel();speechSynthesis.speak(u);}
  function toast(text,type=''){let w=$('.toast-wrap');if(!w){w=document.createElement('div');w.className='toast-wrap';document.body.appendChild(w);}const t=document.createElement('div');t.className=`toast ${type}`;t.textContent=text;w.appendChild(t);setTimeout(()=>t.remove(),3300);}
  function formatDate(s){try{return new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(s));}catch(e){return s;}}
  function escapeHTML(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function escapeAttr(s){return escapeHTML(s).replace(/`/g,'&#96;');}

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
