(function(){
  'use strict';
  const LEVEL_ORDER={PRE:-1,A0:0,A1:1,A2:2,B1:3,B2:4,C1:5,C2:6};
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number.isFinite(+n)?+n:min));
  const nowISO=()=>new Date().toISOString();
  const dateKey=(d=new Date())=>new Date(d).toISOString().slice(0,10);
  const addDays=(date,days)=>{const d=new Date(date||Date.now());d.setUTCDate(d.getUTCDate()+days);return d.toISOString();};
  const startOfDay=(date)=>{const d=new Date(date||Date.now());d.setUTCHours(0,0,0,0);return d;};
  const isDue=(iso,at=Date.now())=>!iso||new Date(iso).getTime()<=new Date(at).getTime();
  const hashString=(value)=>{let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const rng=(seed)=>{let a=typeof seed==='number'?seed:hashString(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  const shuffle=(items,seed)=>{const a=[...items],random=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const median=(values)=>{const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};

  function normaliseAttempt(input={}){
    const score=clamp(input.score??0);
    const independence=clamp(input.independence??(input.parentGuided?55:85))/100;
    const retrieval=clamp(input.retrieval??(input.usedHint?45:80))/100;
    const completion=clamp(input.completion??100)/100;
    const confidence=clamp(input.confidence??70)/100;
    const quality=clamp((score/100)*0.62+independence*0.14+retrieval*0.12+completion*0.07+confidence*0.05,0,1);
    return{...input,score,independence,retrieval,completion,confidence,quality,occurredAt:input.occurredAt||nowISO()};
  }

  function updateMastery(existing={},attemptInput={},threshold=75,options={}){
    const attempt=normaliseAttempt(attemptInput);
    const previous={
      mastery:0,attempts:0,successfulAttempts:0,averageScore:0,stability:0,difficulty:.5,
      firstAt:null,lastAt:null,nextReviewAt:null,bestScore:0,mastered:false,...existing
    };
    if(options.participationOnly){
      const attempts=previous.attempts+1;
      const mastery=clamp(Math.round(previous.mastery*.65+Math.max(60,attempt.score)*.35));
      return{...previous,attempts,mastery,averageScore:Math.round((previous.averageScore*previous.attempts+attempt.score)/attempts),
        successfulAttempts:previous.successfulAttempts+(attempt.completion>=.5?1:0),stability:clamp(previous.stability+.08,0,1),
        firstAt:previous.firstAt||attempt.occurredAt,lastAt:attempt.occurredAt,nextReviewAt:addDays(attempt.occurredAt,2),
        bestScore:Math.max(previous.bestScore,attempt.score),mastered:attempts>=4,lastAttempt:attempt};
    }
    const attempts=previous.attempts+1;
    const alpha=attempts===1?1:attempts<4?.46:.30;
    const performance=attempt.quality*100;
    const mastery=clamp(Math.round(previous.mastery*(1-alpha)+performance*alpha));
    const averageScore=Math.round((previous.averageScore*previous.attempts+attempt.score)/attempts);
    const success=attempt.score>=70&&attempt.completion>=.75;
    const successfulAttempts=previous.successfulAttempts+(success?1:0);
    const stability=clamp(previous.stability+(success?.12:-.10)+(attempt.retrieval-.5)*.08,0,1);
    const difficulty=clamp(previous.difficulty+(.66-attempt.quality)*.14,0.12,.95);
    const reviewDays=mastery>=92&&stability>=.65?21:mastery>=85?14:mastery>=75?7:mastery>=60?3:1;
    const mastered=mastery>=threshold&&successfulAttempts>=2&&stability>=.32;
    return{...previous,mastery,attempts,successfulAttempts,averageScore,stability,difficulty,
      firstAt:previous.firstAt||attempt.occurredAt,lastAt:attempt.occurredAt,nextReviewAt:addDays(attempt.occurredAt,reviewDays),
      bestScore:Math.max(previous.bestScore,attempt.score),mastered,lastAttempt:attempt};
  }

  function scheduleCard(card={},qualityInput=3,at=nowISO()){
    const quality=clamp(qualityInput,0,5);
    let repetitions=card.repetitions||0,interval=card.interval||0,ease=card.ease||2.5,lapses=card.lapses||0;
    if(quality<3){repetitions=0;interval=1;lapses++;}
    else{
      repetitions++;
      if(repetitions===1)interval=1;
      else if(repetitions===2)interval=6;
      else interval=Math.max(1,Math.round(interval*ease));
      ease=Math.max(1.3,ease+(0.1-(5-quality)*(0.08+(5-quality)*0.02)));
    }
    return{...card,repetitions,interval,ease:+ease.toFixed(2),lapses,lastQuality:quality,lastReviewedAt:at,dueAt:addDays(at,interval),updatedAt:at};
  }

  function dueCards(state,profile,language,at=Date.now()){
    return(state.vocab||[]).filter(c=>c.profile===profile&&c.language===language&&isDue(c.dueAt,at))
      .sort((a,b)=>new Date(a.dueAt||0)-new Date(b.dueAt||0));
  }

  function dueErrors(state,profile,language,at=Date.now()){
    return(state.errorBook||[]).filter(e=>e.profile===profile&&e.language===language&&!e.resolved&&isDue(e.nextReviewAt,at))
      .sort((a,b)=>new Date(a.nextReviewAt||0)-new Date(b.nextReviewAt||0));
  }

  function weakSkills(progress={},profile={}){
    const skills=progress.skills||{};
    const weights=profile.ageBand==='preschool'
      ?{listening:1.5,speaking:1.2,vocabulary:.8}
      :profile.ageBand==='school'
        ?{listening:1.15,speaking:1.1,reading:1.05,writing:.9,vocabulary:1.1,grammar:.75,pronunciation:1.15}
        :{listening:1.05,speaking:1.2,reading:1,writing:1.1,vocabulary:1,grammar:.9,pronunciation:.9};
    return Object.keys(weights).map(skill=>({skill,value:clamp(skills[skill]||0),priority:(100-clamp(skills[skill]||0))*weights[skill]}))
      .sort((a,b)=>b.priority-a.priority);
  }

  function unitAccess(units,unit,progress={},profile={}){
    if(profile.ageBand==='preschool')return{state:'available',reason:'مسیر والد‌همراه بدون قفل ترتیبی'};
    const same=units.filter(u=>u.language===unit.language&&u.level===unit.level).sort((a,b)=>a.order-b.order);
    const idx=same.findIndex(u=>u.id===unit.id);
    if(idx<=0)return{state:'available',reason:'اولین واحد سطح'};
    const prior=same[idx-1];
    const p=progress.units?.[prior.id]||{};
    const ready=p.mastered||p.mastery>=Math.min(75,prior.masteryThreshold||75)||(p.attempts>=3&&p.averageScore>=65);
    return ready?{state:'available',reason:'واحد قبلی معیار عبور را دارد'}:{state:'locked',reason:`ابتدا «${prior.titleFa}» را به حد تسلط برسانید`};
  }

  function levelReadiness(units,progress={},level,profile={}){
    const list=units.filter(u=>u.level===level);
    if(!list.length)return{level,average:0,masteredRatio:0,skillFloor:0,ready:false};
    const records=list.map(u=>progress.units?.[u.id]||{});
    const average=Math.round(records.reduce((sum,r)=>sum+(r.mastery||0),0)/list.length);
    const masteredRatio=records.filter((r,i)=>r.mastered||r.mastery>=(list[i].masteryThreshold||75)).length/list.length;
    const relevant=weakSkills(progress,profile).map(x=>x.value);
    const skillFloor=relevant.length?Math.min(...relevant):0;
    const assessmentPassed=(progress.assessments||[]).some(a=>a.level===level&&a.passed);
    const ready=profile.ageBand==='preschool'||(masteredRatio>=.8&&average>=75&&skillFloor>=50&&assessmentPassed);
    return{level,average,masteredRatio:+masteredRatio.toFixed(2),skillFloor,assessmentPassed,ready};
  }

  function placementFromScores(scores={},profile={}){
    if(profile.ageBand==='preschool')return'PRE';
    const allowed=profile.ageBand==='school'?['A0','A1','A2','B1']:['A0','A1','A2','B1','B2','C1','C2'];
    let recommended='A0';
    for(const level of allowed){const value=clamp(scores[level]??0);if(value>=70)recommended=level;else break;}
    return recommended;
  }

  function eventTime(e){return new Date(e.updatedAt||e.createdAt||e.occurredAt||0).getTime();}
  function mergeEvents(local=[],remote=[]){
    const map=new Map();
    for(const e of [...local,...remote]){
      if(!e||!e.id)continue;
      const prev=map.get(e.id);
      if(!prev||eventTime(e)>=eventTime(prev))map.set(e.id,e);
    }
    return[...map.values()].sort((a,b)=>eventTime(a)-eventTime(b)||String(a.id).localeCompare(String(b.id)));
  }

  function mergeEntityArray(local=[],remote=[],key='id'){
    const map=new Map();
    for(const item of [...local,...remote]){
      if(!item||!item[key])continue;
      const prev=map.get(item[key]);
      if(!prev||eventTime(item)>=eventTime(prev))map.set(item[key],item);
    }
    return[...map.values()];
  }

  function computeStreak(heat={}){
    let streak=0;
    const today=startOfDay();
    for(let i=0;i<366;i++){
      const d=new Date(today);d.setUTCDate(d.getUTCDate()-i);
      const minutes=heat[dateKey(d)]||0;
      if(minutes>0)streak++;
      else if(i===0)continue;
      else break;
    }
    return streak;
  }

  function sessionSeed(ctx,unit,date=dateKey()){
    return hashString([date,ctx.profile.id,ctx.language,ctx.level,unit?.id||'none',ctx.goal||''].join('|'));
  }

  function selectPriorities(state,ctx,unit){
    const weak=weakSkills(ctx.progress,ctx.profile);
    return{
      seed:sessionSeed(ctx,unit),
      dueVocab:dueCards(state,ctx.profile.id,ctx.language),
      dueErrors:dueErrors(state,ctx.profile.id,ctx.language),
      weakSkills:weak,
      primarySkill:weak[0]?.skill||'vocabulary',
      secondarySkill:weak[1]?.skill||'listening'
    };
  }

  function xpForAttempt(previousLesson,attempt){
    if(previousLesson?.done)return 0;
    const score=clamp(attempt.score||0);
    return Math.max(3,Math.round(score/12));
  }

  function gradeObjective(task,response={}){
    if(task.gentle)return{score:100,correct:true,quality:4};
    const selected=response.selected??response.answer??response.value;
    if(['visual-choice','sound-picture','listen-mcq'].includes(task.type)){
      const correct=String(selected??'')===String(task.answer??'');
      return{score:correct?100:25,correct,quality:correct?5:1,userAnswer:selected,correctAnswer:task.answer};
    }
    if(task.type==='story-sequence'){
      const actual=Array.isArray(response.sequence)?response.sequence.join(','):String(response.sequence||'');
      const correct=actual===String(task.answer||'');
      const partial=actual&&task.answer?actual.split(',').filter((x,i)=>x===String(task.answer).split(',')[i]).length/Math.max(1,String(task.answer).split(',').length):0;
      return{score:correct?100:Math.round(partial*70),correct,quality:correct?5:2,userAnswer:actual,correctAnswer:task.answer};
    }
    if(task.type==='memory'){
      const pairs=Number(response.pairs||0),total=Math.max(1,Number(response.totalPairs||task.items?.length||1));
      const score=clamp(Math.round(pairs/total*100));return{score,correct:score>=80,quality:score>=90?5:score>=70?4:2};
    }
    const score=clamp(response.score??(response.completed?85:70));
    return{score,correct:score>=70,quality:score>=90?5:score>=75?4:score>=60?3:2};
  }

  window.FLH_CORE={
    version:'6.1.0-core',LEVEL_ORDER,clamp,nowISO,dateKey,addDays,isDue,hashString,rng,shuffle,median,
    normaliseAttempt,updateMastery,scheduleCard,dueCards,dueErrors,weakSkills,unitAccess,levelReadiness,
    placementFromScores,mergeEvents,mergeEntityArray,computeStreak,sessionSeed,selectPriorities,xpForAttempt,gradeObjective
  };
})();
