(function(){
'use strict';
const LEVELS=['PRE','A0','A1','A2','B1','B2','C1','C2'];
const PROFILES=['saeed','arezoo','elena','aria'];
const LANGUAGES=['en','de'];
const REQUIRED=['id','profile','language','level','titleFa','titleTarget','objectiveFa','canDo','minutes','vocabulary','phrases','tasks','mission','rubric','tags','safeguarding'];
const clone=x=>JSON.parse(JSON.stringify(x));
const text=v=>typeof v==='string'&&v.trim().length>0;
const array=(v,min=1)=>Array.isArray(v)&&v.length>=min;
const unique=v=>new Set(v).size===v.length;
function validateLesson(l){
 const errors=[];
 for(const k of REQUIRED)if(l[k]===undefined||l[k]===null)errors.push(`${l.id||'?'} missing ${k}`);
 if(!text(l.id)||!/^[a-z0-9-]+$/.test(l.id||''))errors.push(`${l.id||'?'} invalid id`);
 if(!PROFILES.includes(l.profile))errors.push(`${l.id} invalid profile`);
 if(!LANGUAGES.includes(l.language))errors.push(`${l.id} invalid language`);
 if(!LEVELS.includes(l.level))errors.push(`${l.id} invalid level`);
 if(!text(l.titleFa)||!text(l.titleTarget)||!text(l.objectiveFa)||!text(l.canDo))errors.push(`${l.id} missing title/objective`);
 if(!(Number.isFinite(l.minutes)&&l.minutes>=5&&l.minutes<=60))errors.push(`${l.id} invalid minutes`);
 if(!array(l.vocabulary,3))errors.push(`${l.id} needs at least 3 vocabulary items`);
 if(!array(l.phrases,2))errors.push(`${l.id} needs at least 2 phrases`);
 if(!array(l.tasks,3))errors.push(`${l.id} needs at least 3 tasks`);
 if(!unique(l.tasks.map(t=>t.id)))errors.push(`${l.id} duplicate task id`);
 for(const t of l.tasks)if(!text(t.id)||!text(t.type)||!text(t.skill)||!text(t.promptFa))errors.push(`${l.id}:${t.id||'?'} invalid task`);
 if(!l.rubric||!Array.isArray(l.rubric.criteria))errors.push(`${l.id} invalid rubric`);
 if(l.profile==='aria'){
  if(l.level!=='PRE')errors.push(`${l.id} Arya must use PRE`);
  if(!l.rubric.participationOnly)errors.push(`${l.id} Arya rubric must be participation-only`);
  if(!l.safeguarding.parentRequired||!l.safeguarding.noFormalAssessment)errors.push(`${l.id} Arya safeguarding incomplete`);
  if(l.tasks.some(t=>t.skill==='writing'||!t.gentle))errors.push(`${l.id} Arya tasks must be gentle and non-writing`);
 }
 if(l.profile==='elena'&&!l.safeguarding)errors.push(`${l.id} Elena safeguarding missing`);
 if(l.profile==='arezoo'&&l.level!=='A1')errors.push(`${l.id} Arzoo foundation pack must be A1`);
 return errors;
}
function metrics(pack){
 const byProfile={},byLanguage={},byLevel={},taskTypes={},skills={};
 for(const l of pack.lessons){
  byProfile[l.profile]=(byProfile[l.profile]||0)+1;byLanguage[l.language]=(byLanguage[l.language]||0)+1;byLevel[l.level]=(byLevel[l.level]||0)+1;
  for(const t of l.tasks){taskTypes[t.type]=(taskTypes[t.type]||0)+1;skills[t.skill]=(skills[t.skill]||0)+1;}
 }
 return{lessons:pack.lessons.length,tasks:pack.lessons.reduce((s,l)=>s+l.tasks.length,0),vocabulary:pack.lessons.reduce((s,l)=>s+l.vocabulary.length,0),phrases:pack.lessons.reduce((s,l)=>s+l.phrases.length,0),byProfile,byLanguage,byLevel,taskTypes,skills};
}
function validatePack(pack){
 const errors=[];
 if(!pack||!text(pack.packId)||!array(pack.lessons))return{valid:false,errors:['invalid pack']};
 if(!unique(pack.lessons.map(x=>x.id)))errors.push('duplicate lesson id');
 const taskIds=pack.lessons.flatMap(l=>l.tasks.map(t=>`${l.id}:${t.id}`));if(!unique(taskIds))errors.push('duplicate task id across pack');
 pack.lessons.forEach(l=>errors.push(...validateLesson(l)));
 return{valid:errors.length===0,errors,metrics:metrics(pack)};
}
function index(packs){
 const lessons=(packs||[]).flatMap(p=>p.lessons.map(l=>({...clone(l),packId:p.packId,packVersion:p.version})));
 const byId=Object.fromEntries(lessons.map(l=>[l.id,l]));
 return{lessons,byId,find({profile,language,level,tags}={}){return lessons.filter(l=>(!profile||l.profile===profile)&&(!language||l.language===language)&&(!level||l.level===level)&&(!tags||tags.every(t=>l.tags.includes(t))));},get(id){return byId[id]||null;},next(currentId,q={}){const list=this.find(q),i=list.findIndex(l=>l.id===currentId);return list[i+1]||null;}};
}
function buildTaskQueue(lesson,{weakSkill,dueErrors=[],dueVocab=[],seed=1}={}){
 if(!lesson)return[];let tasks=[...lesson.tasks];if(weakSkill)tasks.sort((a,b)=>(b.skill===weakSkill)-(a.skill===weakSkill));
 if(dueErrors.length)tasks.unshift({id:`${lesson.id}-error-review`,type:'error-review',skill:weakSkill||'vocabulary',promptFa:'مرور خطاهای سررسید',items:dueErrors.slice(0,5)});
 if(dueVocab.length)tasks.unshift({id:`${lesson.id}-srs`,type:'srs-review',skill:'vocabulary',promptFa:'مرور فاصله‌دار واژگان',items:dueVocab.slice(0,8)});
 return tasks.map((t,i)=>({...clone(t),lessonId:lesson.id,queueOrder:i+1,seed}));
}
function coverage(packs,requirements=[]){const idx=index(packs),missing=[];for(const r of requirements){const found=idx.find(r).length;if(found<(r.minimum||1))missing.push({...r,found});}return{complete:missing.length===0,missing};}
window.FLH_CONTENT={version:'6.2.0-alpha1',LEVELS,PROFILES,LANGUAGES,validateLesson,validatePack,metrics,index,buildTaskQueue,coverage,registry:index(window.FLH_CONTENT_PACKS||[])};
})();
