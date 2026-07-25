(function(){
  'use strict';
  const C=()=>window.FLH_CURRICULUM;
  const S=()=>window.FLH_STORE.get();
  const CORE=()=>window.FLH_CORE;
  const levels=['A0','A1','A2','B1','B2','C1','C2'];
  const todayKey=()=>CORE().dateKey();
  const clamp=(n,min=0,max=100)=>CORE().clamp(n,min,max);
  function active(){const s=S(),p=FLH_PROFILES[s.active.profile];return{state:s,profile:p,language:s.active.language,level:s.active.level,duration:s.active.duration,goal:s.active.goal,progress:s.progress[p.id][s.active.language]};}
  function levelUnits(language,level,profileId){if(profileId==='aria')return C().units.filter(u=>u.language===language&&u.level==='PRE');return C().units.filter(u=>u.language===language&&u.level===level).sort((a,b)=>a.order-b.order);}
  function allUnits(language,profileId){if(profileId==='aria')return C().units.filter(u=>u.language===language&&u.level==='PRE');return C().units.filter(u=>u.language===language&&u.level!=='PRE').sort((a,b)=>FLH_LEVELS[a.level].order-FLH_LEVELS[b.level].order||a.order-b.order);}
  function unitStatus(unit,progress){const u=progress.units[unit.id]||{},score=u.mastery||0;return{score,done:!!u.mastered||score>=(unit.masteryThreshold||75),attempts:u.attempts||0,averageScore:u.averageScore||0,stability:u.stability||0,lastAt:u.lastAt||null,nextReviewAt:u.nextReviewAt||null};}
  function unitAccess(unit,ctx=active()){return CORE().unitAccess(allUnits(ctx.language,ctx.profile.id),unit,ctx.progress,ctx.profile);}
  function currentUnit(ctx=active()){
    const list=levelUnits(ctx.language,ctx.level,ctx.profile.id);
    const explicit=ctx.progress.currentUnit&&list.find(x=>x.id===ctx.progress.currentUnit&&unitAccess(x,ctx).state!=='locked');
    if(explicit)return explicit;
    const next=list.find(u=>unitAccess(u,ctx).state!=='locked'&&!unitStatus(u,ctx.progress).done);
    return next||list.filter(u=>unitAccess(u,ctx).state!=='locked').pop()||list[0]||allUnits(ctx.language,ctx.profile.id)[0];
  }
  function classifyBank(unit,profile){const text=`${unit.title} ${unit.titleFa} ${unit.vocabulary||''}`.toLowerCase();if(/shop|einkauf|price|kauf/.test(text))return'shopping';if(/kitchen|cook|küche|koch/.test(text))return'kitchen';if(/school|schule/.test(text))return'school';if(/computer|technology|digital|technik|\bit\b/.test(text))return'it';if(/risk|research|academic|wissenschaft|forschung|unsicherheit/.test(text)||profile.id==='saeed'&&/present|argument|data|interview/.test(text))return'research';if(/safety|sicherheit|health and safety/.test(text))return'hse';return'introductions';}
  function phrasesFor(unit,profile,language){const bank=classifyBank(unit,profile);return(C().phrases[language]?.[bank]||C().phrases[language]?.introductions||[]).map((x,i)=>({id:`${unit.id}-p${i+1}`,target:x[0],fa:x[1]}));}
  function stepTemplate(profile){
    if(profile.ageBand==='preschool')return[['parent-note','راهنمای والد','یک هدف ساده و بدون فشار'],['listen','گوش کن','دو یا سه واژه با صدای روشن'],['point','اشاره کن','واژه را به شیء یا تصویر وصل کنید'],['move','حرکت کن','واژه را با بدن و بازی تثبیت کنید'],['repeat','تکرار آزاد','فقط اگر کودک مایل بود'],['celebrate','جشن کوتاه','پایان مثبت و ثبت مشاهده والد']];
    if(profile.ageBand==='school')return[['warmup','گرم‌کردن','مرور کوتاه جلسه قبل'],['phonics','صدا و تلفظ','حرف، هجا یا الگوی صوتی'],['vocab','واژگان','چهار تا شش واژه در متن'],['listen','شنیدار','گوش‌دادن و انتخاب'],['read','خواندن','متن کوتاه سن‌محور'],['speak','مکالمه','پاسخ و ضبط کوتاه'],['write','نوشتن','املا یا جمله‌سازی'],['game','بازی و مأموریت','چالش کوتاه با بازخورد'],['review','مرور هوشمند','مرور خطاها و واژه‌ها'],['reflect','ثبت پیشرفت','احساس و نتیجه امروز']];
    return[['warmup','بازیابی فعال','بازیابی بدون نگاه‌کردن'],['vocab','واژگان در متن','عبارت کاربردی، نه حفظ فهرست'],['input','ورودی هدفمند','ساختار در خدمت عملکرد'],['listen','شنیدار','پیام، جزئیات و لحن'],['pronunciation','تلفظ','ریتم، تکیه و وضوح'],['read','خواندن','خواندن هدفمند و استنباط'],['speak','گفتار','پاسخ ساختاریافته'],['write','نوشتار','خروجی قابل اصلاح'],['challenge','مأموریت واقعی','زندگی، کار یا پژوهش'],['review','مرور و خطانامه','مرور فاصله‌دار و قدم بعد']];
  }
  function stableShuffle(items,seed){return CORE().shuffle(items,seed);}
  function makeTask(step,unit,ctx,index,seedBase){
    const ph=phrasesFor(unit,ctx.profile,ctx.language),pair=ph[index%Math.max(1,ph.length)]||{target:unit.title,fa:unit.titleFa};
    const seed=`${seedBase}|${step[0]}|${index}`;
    const base={id:`${todayKey()}-${ctx.profile.id}-${ctx.language}-${unit.id}-${step[0]}`,profile:ctx.profile.id,kind:step[0],title:step[1],description:step[2],unitId:unit.id,unitTitle:unit.titleFa,targetLanguage:ctx.language,minutes:ctx.profile.ageBand==='preschool'?1:Math.max(3,Math.round(ctx.duration/stepTemplate(ctx.profile).length)),skill:skillFor(step[0]),done:false,seed};
    const options={
      warmup:{type:'recall',prompt:`بدون نگاه‌کردن، سه واژه یا عبارت مرتبط با «${unit.titleFa}» بنویسید.`},
      phonics:{type:'speak',prompt:`الگوی صوتی را سه بار با ریتم طبیعی تکرار کن: ${pair.target}`,model:pair.target},
      vocab:{type:'flash',prompt:pair.target,translation:pair.fa,items:ph},
      input:{type:'lesson',prompt:`ساختار امروز: ${unit.grammar||'کاربرد عبارت‌ها در متن'}`,explanation:`ساختار باید در موقعیت «${unit.titleFa}» استفاده شود.`,model:pair.target},
      listen:{type:'listen-mcq',prompt:'عبارت را گوش کنید و معنی درست را انتخاب کنید.',audio:pair.target,answer:pair.fa,choices:stableShuffle([pair.fa,...ph.filter(x=>x.fa!==pair.fa).slice(0,3).map(x=>x.fa),'گزینه نامرتبط'],seed).slice(0,4)},
      pronunciation:{type:'speak',prompt:'عبارت را با تمرکز بر وضوح، ریتم و تکیه تکرار کنید.',model:pair.target},
      read:{type:'reading',prompt:readingText(unit,ctx,pair),question:'پیام اصلی متن چیست؟',model:`موضوع اصلی: ${unit.titleFa}`},
      speak:{type:'speak',prompt:speakingPrompt(unit,ctx),model:pair.target},
      write:{type:'writing',prompt:writingPrompt(unit,ctx),criteria:['هدف روشن','واژگان مرتبط','ساختار متناسب سطح','بازبینی خطا']},
      game:{type:'build',prompt:'کلمات را به عبارت درست تبدیل کنید:',tokens:stableShuffle(pair.target.split(' '),seed),answer:pair.target},
      challenge:{type:'mission',prompt:missionPrompt(unit,ctx),checklist:missionChecklist()},
      point:{type:'parent',prompt:`یک نمونه واقعی از «${unit.titleFa}» پیدا کنید و بگویید: ${pair.target}`,model:pair.target},
      move:{type:'parent',prompt:'برای واژه امروز یک حرکت ساده بسازید و سه بار بازی کنید.',model:pair.target},
      repeat:{type:'parent',prompt:'عبارت را آرام بگویید؛ دعوت کنید، مجبور نکنید.',model:pair.target},
      celebrate:{type:'parent-check',prompt:'امروز کودک چگونه مشارکت کرد؟',choices:['گوش داد','اشاره کرد','حرکت کرد','تکرار کرد','فقط مشاهده کرد']},
      'parent-note':{type:'note',prompt:`هدف نشست: تماس مثبت و کوتاه با زبان در موضوع «${unit.titleFa}».`,model:'جلسه را قبل از خستگی کودک تمام کنید.'},
      review:{type:'review',prompt:'دو مورد سخت امروز را ثبت کنید تا وارد خطانامه و مرور بعدی شوند.'},
      reflect:{type:'reflection',prompt:'امروز چه چیزی آسان‌تر بود و جلسه بعد چه چیزی باید مرور شود؟'}
    };
    let task={...base,...(options[step[0]]||{type:'note',prompt:step[2]})};const visual=window.FLH_VISUALS;
    if(visual&&ctx.profile.ageBand==='school'){
      const set=visual.pick(unit,ctx.language,4),target=set.items[0];
      if(step[0]==='phonics'){const li=(unit.order+new Date().getUTCDate())%visual.alphabet(ctx.language).length,[letter,word,emoji,fa]=visual.letter(ctx.language,li);task={...base,type:'trace-letter',title:'حرف، صدا و ردگیری',prompt:`حرف ${letter} را گوش کن، ردگیری کن و واژه را بگو.`,letter,word,emoji,translation:fa,model:word};}
      else if(step[0]==='vocab')task={...base,type:'visual-choice',title:'واژه تصویری',prompt:`تصویر «${target.word}» را پیدا کن.`,audio:target.word,answer:target.id,items:stableShuffle(set.items,seed)};
      else if(step[0]==='listen')task={...base,type:'sound-picture',title:'گوش کن و تصویر را انتخاب کن',prompt:'صدا را پخش و تصویر درست را انتخاب کن.',audio:target.word,answer:target.id,items:stableShuffle(set.items,seed)};
      else if(step[0]==='read'){const story=visual.story(ctx.language,unit.order);task={...base,type:'story-sequence',title:'داستان تصویری',prompt:'کارت‌ها را به ترتیب درست داستان انتخاب کن.',steps:stableShuffle(story,seed),answer:story.map(x=>x.order).join(',')};}
      else if(step[0]==='game')task={...base,type:'memory',title:'حافظه تصویر و واژه',prompt:'هر تصویر را با واژه درست جفت کن.',items:set.items.slice(0,4)};
    }
    if(visual&&ctx.profile.ageBand==='preschool'){
      const set=visual.pick(unit,ctx.language,3),target=set.items[0];
      if(step[0]==='listen')task={...base,type:'sound-picture',title:'گوش کن و لمس کن',prompt:'والد صدا را پخش کند؛ کودک در صورت تمایل تصویر را لمس کند.',audio:target.word,answer:target.id,items:stableShuffle(set.items,seed),gentle:true};
      else if(step[0]==='point')task={...base,type:'visual-choice',title:'تصویر را پیدا کن',prompt:`کدام تصویر ${target.fa} است؟`,audio:target.word,answer:target.id,items:stableShuffle(set.items,seed),gentle:true};
      else if(step[0]==='move'){const [phrase,fa,emoji]=visual.movement(ctx.language,unit.order);task={...base,type:'movement',title:'بازی حرکت',prompt:`با هم انجام دهید: ${fa}`,model:phrase,emoji};}
      else if(step[0]==='repeat')task={...base,type:'echo',title:'تکرار آزاد',prompt:'والد آرام بگوید؛ کودک فقط در صورت تمایل تکرار کند.',model:target.word,emoji:target.emoji,translation:target.fa};
    }
    return task;
  }
  function skillFor(kind){return({warmup:'vocabulary',phonics:'pronunciation',vocab:'vocabulary',input:'grammar',listen:'listening',pronunciation:'pronunciation',read:'reading',speak:'speaking',write:'writing',game:'vocabulary',challenge:'speaking',point:'listening',move:'listening',repeat:'speaking',celebrate:'speaking',review:'vocabulary',reflect:'writing'})[kind]||'vocabulary';}
  function readingText(unit,ctx,pair){if(ctx.profile.id==='saeed'&&classifyBank(unit,ctx.profile)==='research')return`${pair.target} The purpose is to communicate the method and its limits accurately. The result should support a decision without presenting a simulated indicator as a validated accident probability.`;if(ctx.language==='de')return`Heute geht es um „${unit.title}“. ${pair.target} Die Aufgabe verbindet Wortschatz, Verstehen und eine praktische Handlung.`;return`Today’s topic is “${unit.title}”. ${pair.target} The task connects vocabulary, understanding and a practical action.`;}
  function speakingPrompt(unit,ctx){if(ctx.profile.id==='saeed'&&ctx.language==='en')return`یک پاسخ ۶۰ تا ۹۰ ثانیه‌ای درباره «${unit.titleFa}» بدهید؛ ادعا، شواهد، محدودیت و نتیجه عملی را جدا نگه دارید.`;if(ctx.profile.id==='arezoo')return`در یک نقش‌آفرینی واقعی درباره «${unit.titleFa}» حداقل چهار جمله بگویید و یک سؤال بپرسید.`;if(ctx.profile.id==='elena')return`در ۳۰ تا ۴۵ ثانیه درباره «${unit.titleFa}» توضیح بده و یک مثال بزن.`;return`درباره «${unit.titleFa}» یک پاسخ روشن و ساختاریافته بدهید.`;}
  function writingPrompt(unit,ctx){const size=ctx.level==='A0'?1:ctx.level==='A1'?4:ctx.level==='A2'?7:ctx.level==='B1'?100:ctx.level==='B2'?180:ctx.level==='C1'?280:350;if(ctx.profile.ageBand==='school')return`درباره «${unit.titleFa}» ${ctx.level==='A0'?'سه واژه و یک جمله':'پنج تا هشت جمله'} بنویس.`;if(['A0','A1','A2'].includes(ctx.level))return`یک متن کاربردی درباره «${unit.titleFa}» بنویسید؛ حدود ${size} جمله.`;return`یک متن ساختاریافته درباره «${unit.titleFa}» بنویسید؛ حدود ${size} کلمه.`;}
  function missionPrompt(unit,ctx){if(ctx.profile.id==='arezoo')return`ماموریت «${unit.titleFa}» را از شروع تا پایان اجرا کنید: نیاز، سؤال، پاسخ و جمع‌بندی.`;if(ctx.profile.id==='saeed')return`موضوع «${unit.titleFa}» را برای استاد یا مدیر توضیح دهید، به یک سؤال چالشی پاسخ دهید و محدودیت ادعا را روشن کنید.`;return`ماموریت واقعی «${unit.titleFa}» را با خروجی شنیداری، گفتاری یا نوشتاری کامل کنید.`;}
  function missionChecklist(){return['هدف موقعیت را روشن کردم','حداقل سه عبارت هدف استفاده کردم','یک سؤال واقعی پرسیدم','خروجی را بازبینی کردم','یک خطا یا نکته ثبت کردم'];}
  function validPersistedPlan(ctx){const p=S().activePlan;return p&&p.date===todayKey()&&p.profile===ctx.profile.id&&p.language===ctx.language&&p.level===ctx.level&&p.duration===ctx.duration&&p.goal===ctx.goal;}
  function buildDailyPlan(overrides={}){
    const base=active(),ctx={...base,...overrides};ctx.profile=overrides.profile||base.profile;ctx.language=overrides.language||base.language;ctx.level=overrides.level||base.level;ctx.duration=overrides.duration||base.duration;ctx.goal=overrides.goal||base.goal;ctx.progress=S().progress[ctx.profile.id][ctx.language];
    if(!overrides.force&&!overrides.unit&&validPersistedPlan(ctx))return S().activePlan;
    const unit=overrides.unit||currentUnit(ctx),priorities=CORE().selectPriorities(S(),ctx,unit),template=stepTemplate(ctx.profile);
    let ordered=[...template];
    if(ctx.profile.ageBand!=='preschool'&&(priorities.dueErrors.length||priorities.dueVocab.length))ordered=stableReviewFirst(ordered);
    let steps=ordered.map((s,i)=>makeTask(s,unit,ctx,i,priorities.seed));
    const max=ctx.profile.ageBand==='preschool'?6:ctx.duration<=15?5:ctx.duration<=25?7:10;
    if(max<steps.length){const must=ctx.profile.ageBand==='school'?['warmup','phonics','vocab','listen','speak','review','reflect']:['warmup','vocab','listen','speak','challenge','review'];steps=steps.filter(x=>must.includes(x.kind)).slice(0,max);}
    const plan={id:`session_${todayKey()}_${ctx.profile.id}_${ctx.language}_${unit.id}`,date:todayKey(),profile:ctx.profile.id,language:ctx.language,level:ctx.level,duration:ctx.duration,goal:ctx.goal,unit,steps,priorities:{primarySkill:priorities.primarySkill,secondarySkill:priorities.secondarySkill,dueVocab:priorities.dueVocab.length,dueErrors:priorities.dueErrors.length},createdAt:new Date().toISOString(),engineVersion:CORE().version};
    return plan;
  }
  function stableReviewFirst(template){const review=template.find(x=>x[0]==='review');return review?[review,...template.filter(x=>x!==review)]:template;}
  function upsertVocabulary(st,task,pid,lang){if(!['flash','visual-choice','sound-picture','listen-mcq'].includes(task.type))return;const items=task.items||[];const list=items.length?items:[{id:`${task.unitId}-${task.audio||task.prompt}`,word:task.audio||task.prompt,fa:task.translation||task.answer||''}];for(const item of list.slice(0,5)){const key=`${pid}-${lang}-${item.id||item.word}`,existing=st.vocab.find(v=>v.id===key);if(existing)continue;st.vocab.push({id:key,profile:pid,language:lang,unitId:task.unitId,front:item.word||item.target||task.audio||'',back:item.fa||item.translation||'',createdAt:new Date().toISOString(),dueAt:new Date().toISOString(),interval:0,repetitions:0,ease:2.5,lapses:0});}}
  function completeTask(task,result={}){
    const pid=task.profile||S().active.profile,lang=task.targetLanguage||S().active.language,pr=S().progress[pid][lang],previousLesson=pr.lessons[task.id];
    const objective=CORE().gradeObjective(task,result),score=clamp(result.score??objective.score),minutes=result.minutes??task.minutes??3,attemptId=FLH_STORE.uid('attempt');
    const attempt={id:attemptId,taskId:task.id,unitId:task.unitId,profile:pid,language:lang,skill:task.skill,score,minutes,correct:result.correct??objective.correct,userAnswer:result.userAnswer??objective.userAnswer,correctAnswer:result.correctAnswer??objective.correctAnswer,parentGuided:!!result.parentGuided,usedHint:!!result.usedHint,confidence:result.confidence??70,completion:result.completion??100,occurredAt:new Date().toISOString(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    FLH_STORE.update(st=>{
      const p=st.progress[pid][lang],unit=C().units.find(u=>u.id===task.unitId)||{masteryThreshold:75},existing=p.units[task.unitId]||{};
      p.lessons[task.id]={done:true,score,completedAt:attempt.occurredAt,result:{...result,correct:attempt.correct},attemptId};
      p.xp+=CORE().xpForAttempt(previousLesson,attempt);p.totalMinutes+=minutes;p.heat[todayKey()]=(p.heat[todayKey()]||0)+minutes;p.lastStudyDate=todayKey();p.streak=CORE().computeStreak(p.heat);
      const count=p.skillAttempts[task.skill]||0;p.skills[task.skill]=clamp(Math.round(((p.skills[task.skill]||0)*count+score)/(count+1)));p.skillAttempts[task.skill]=count+1;
      p.units[task.unitId]=CORE().updateMastery(existing,attempt,unit.masteryThreshold||75,{participationOnly:FLH_PROFILES[pid].ageBand==='preschool'});p.currentUnit=task.unitId;
      st.attempts.push(attempt);upsertVocabulary(st,task,pid,lang);
      if(attempt.correct===false&&attempt.correctAnswer){const exists=st.errorBook.some(e=>e.taskId===task.id&&!e.resolved);if(!exists)st.errorBook.push({id:FLH_STORE.uid('err'),profile:pid,language:lang,taskId:task.id,unitId:task.unitId,userAnswer:attempt.userAnswer,correctAnswer:attempt.correctAnswer,note:'ثبت خودکار از پاسخ نادرست',createdAt:attempt.occurredAt,updatedAt:attempt.occurredAt,nextReviewAt:CORE().addDays(attempt.occurredAt,1),interval:1,repetitions:0,ease:2.3,lapses:0,resolved:false});}
      return st;
    },'complete-task');
    FLH_STORE.addEvent('task_completed',{id:`evt_${attemptId}`,profile:pid,language:lang,attemptId,taskId:task.id,unitId:task.unitId,skill:task.skill,score,minutes,correct:attempt.correct,createdAt:attempt.occurredAt});
    return{score,minutes,attemptId,correct:attempt.correct};
  }
  function recommendations(ctx=active()){
    const rec=[],weak=CORE().weakSkills(ctx.progress,ctx.profile),dueE=CORE().dueErrors(S(),ctx.profile.id,ctx.language).length,dueV=CORE().dueCards(S(),ctx.profile.id,ctx.language).length;
    if(weak[0])rec.push({title:`تقویت ${skillFa(weak[0].skill)}`,text:`امتیاز فعلی ${weak[0].value} است؛ برنامه امروز وزن بیشتری به این مهارت می‌دهد.`});
    if(dueE||dueV)rec.push({title:'مرور سررسیدشده',text:`${dueE} خطا و ${dueV} کارت واژگان برای مرور آماده است.`});
    if(ctx.profile.id==='saeed')rec.push({title:'خروجی حرفه‌ای امروز',text:'یک پاسخ صوتی یا پاراگراف قابل استفاده در IELTS، مقاله یا مصاحبه تولید کنید.'});
    if(ctx.profile.id==='arezoo')rec.push({title:'ماموریت واقعی',text:'یک سناریوی خرید، خانه، مدرسه یا فناوری را خارج از برنامه اجرا کنید.'});
    if(ctx.profile.id==='elena')rec.push({title:'پروژه کوچک',text:'یک نقاشی برچسب‌دار، صدای ضبط‌شده یا داستان کوتاه بساز.'});
    if(ctx.profile.id==='aria')rec.push({title:'اصل طلایی',text:'کوتاه، مثبت و داوطلبانه؛ مشاهده نیز مشارکت محسوب می‌شود.'});
    return rec.slice(0,3);
  }
  function skillFa(k){return({listening:'شنیدار',speaking:'گفتار',reading:'خواندن',writing:'نوشتن',vocabulary:'واژگان',grammar:'گرامر',pronunciation:'تلفظ'})[k]||k;}
  function levelProgress(ctx=active()){const units=levelUnits(ctx.language,ctx.level,ctx.profile.id);return units.length?Math.round(units.reduce((a,u)=>a+unitStatus(u,ctx.progress).score,0)/units.length):0;}
  function levelReadiness(level,ctx=active()){return CORE().levelReadiness(levelUnits(ctx.language,level,ctx.profile.id),ctx.progress,level,ctx.profile);}
  function sessionProgress(plan){const pr=S().progress[plan.profile][plan.language];return Math.round(plan.steps.filter(x=>pr.lessons[x.id]?.done).length/Math.max(1,plan.steps.length)*100)||0;}
  function addError(task,userAnswer,correctAnswer,note=''){FLH_STORE.update(st=>{st.errorBook.push({id:FLH_STORE.uid('err'),profile:task.profile||st.active.profile,language:task.targetLanguage||st.active.language,taskId:task.id,unitId:task.unitId,userAnswer,correctAnswer,note,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),nextReviewAt:CORE().addDays(new Date(),1),interval:1,repetitions:0,ease:2.3,lapses:0,resolved:false});return st;},'add-error');}
  function reviewError(id,quality){FLH_STORE.update(st=>{const e=st.errorBook.find(x=>x.id===id);if(!e)return st;Object.assign(e,CORE().scheduleCard(e,quality));e.resolved=quality===5&&e.repetitions>=4;return st;},'review-error');}
  function reviewVocab(id,quality){FLH_STORE.update(st=>{const card=st.vocab.find(x=>x.id===id);if(card)Object.assign(card,CORE().scheduleCard(card,quality));return st;},'review-vocab');}
  function recordAssessment(level,scores,ctx=active()){
    const average=Math.round(Object.values(scores).reduce((a,v)=>a+clamp(v),0)/Math.max(1,Object.keys(scores).length)),passed=average>=70,id=FLH_STORE.uid('assessment');
    FLH_STORE.update(st=>{st.progress[ctx.profile.id][ctx.language].assessments.push({id,level,scores,average,passed,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});st.diagnostics.push({id,profile:ctx.profile.id,language:ctx.language,level,scores,average,passed,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});return st;},'assessment');
    FLH_STORE.addEvent('assessment_completed',{id:`evt_${id}`,assessmentId:id,profile:ctx.profile.id,language:ctx.language,level,average,passed});return{average,passed};
  }
  function mergeSnapshot(remote){return FLH_STORE.mergeRemoteSnapshot(remote);}
  window.FLH_ENGINE={active,levels,levelUnits,allUnits,unitStatus,unitAccess,currentUnit,phrasesFor,buildDailyPlan,completeTask,recommendations,levelProgress,levelReadiness,sessionProgress,skillFa,addError,reviewError,reviewVocab,recordAssessment,mergeSnapshot,shuffle:(a,seed='manual')=>stableShuffle(a,seed),todayKey};
})();
