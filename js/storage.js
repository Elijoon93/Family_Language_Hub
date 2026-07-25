(function(){
  'use strict';
  const KEY='family_language_os_v6';
  const OLD_KEYS=['family_language_hub_v5','family_language_hub_v4','family_language_hub_v3'];
  const schema=window.FLH_CONFIG?.schemaVersion||24;
  const version=window.FLH_CONFIG?.appVersion||'6.1.0-core';
  const core=()=>window.FLH_CORE;
  const now=()=>new Date().toISOString();
  const memoryStorage=(()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>[...m.keys()][i]||null,get length(){return m.size;}};})();
  const safeStorage=(()=>{try{const k='__flh_storage_probe__';window.localStorage.setItem(k,'1');window.localStorage.removeItem(k);return window.localStorage;}catch(_e){return memoryStorage;}})();
  const uid=(prefix='e')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
  const baseProgress=()=>({
    xp:0,streak:0,lastStudyDate:null,totalMinutes:0,
    skills:{listening:0,speaking:0,reading:0,writing:0,vocabulary:0,grammar:0,pronunciation:0},
    skillAttempts:{listening:0,speaking:0,reading:0,writing:0,vocabulary:0,grammar:0,pronunciation:0},
    units:{},lessons:{},assessments:[],heat:{},currentUnit:null,currentLevelStartedAt:null,promotions:[]
  });
  function getDeviceId(){let id=safeStorage.getItem('flh_device_id');if(!id){id=uid('device');safeStorage.setItem('flh_device_id',id);}return id;}
  function defaultState(){
    const progress={};Object.keys(FLH_PROFILES).forEach(pid=>{progress[pid]={en:baseProgress(),de:baseProgress()};});
    return{
      schema,version,createdAt:now(),updatedAt:now(),
      active:{profile:'saeed',language:'en',level:'B1',duration:45,goal:'IELTS و اپلای دکتری',view:'today'},
      activePlan:null,progress,events:[],sessions:[],attempts:[],vocab:[],errorBook:[],notes:[],shopping:[],diagnostics:[],missions:[],
      settings:{uiLanguage:'fa',sound:true,autoSpeak:false,focusPreset:25,weeklyGoalMinutes:300,childSafeMode:true,adaptiveMode:true,resumeSession:true},
      devices:{deviceId:getDeviceId(),registered:[],max:2},
      sync:{enabled:false,lastSyncAt:null,pending:0,status:'local',conflicts:[],lastMergeAt:null}
    };
  }
  function normalizeProgress(p={}){
    const base=baseProgress();
    return{...base,...p,skills:{...base.skills,...(p.skills||{})},skillAttempts:{...base.skillAttempts,...(p.skillAttempts||{})},units:p.units||{},lessons:p.lessons||{},heat:p.heat||{},assessments:Array.isArray(p.assessments)?p.assessments:[],promotions:Array.isArray(p.promotions)?p.promotions:[]};
  }
  function normalize(state){
    const d=defaultState();state=state&&typeof state==='object'?state:{};const out={...d,...state};
    out.schema=schema;out.version=version;out.updatedAt=now();out.active={...d.active,...(state.active||{})};out.settings={...d.settings,...(state.settings||{})};
    out.devices={...d.devices,...(state.devices||{}),deviceId:getDeviceId()};out.sync={...d.sync,...(state.sync||{})};out.progress=out.progress||{};
    Object.keys(FLH_PROFILES).forEach(pid=>{out.progress[pid]=out.progress[pid]||{};['en','de'].forEach(lang=>{out.progress[pid][lang]=normalizeProgress(out.progress[pid][lang]||{});});});
    ['events','sessions','attempts','vocab','errorBook','notes','shopping','diagnostics','missions'].forEach(k=>{if(!Array.isArray(out[k]))out[k]=[];});
    if(out.activePlan&&typeof out.activePlan!=='object')out.activePlan=null;
    return out;
  }
  function migrateLegacy(){
    for(const k of OLD_KEYS){try{const raw=safeStorage.getItem(k);if(!raw)continue;const old=JSON.parse(raw),n=defaultState();
      if(old.activeProfile)n.active.profile=old.activeProfile;if(old.activeLang)n.active.language=old.activeLang;if(old.profile)n.active.profile=old.profile;if(old.language)n.active.language=old.language;
      if(Array.isArray(old.events))n.events=old.events.map(e=>({...e,id:e.id||uid('legacy'),migratedFrom:k}));if(Array.isArray(old.shopping))n.shopping=old.shopping;
      if(old.state?.events)n.events=n.events.concat(old.state.events);n.migration={from:k,at:now()};safeStorage.setItem(KEY,JSON.stringify(n));return n;
    }catch(_e){}}
    return null;
  }
  function load(){try{const raw=safeStorage.getItem(KEY);if(raw)return normalize(JSON.parse(raw));return normalize(migrateLegacy()||defaultState());}catch(e){console.warn('state load failed',e);return normalize(defaultState());}}
  let state=load(),listeners=[];
  function save(reason='update'){state.updatedAt=now();try{safeStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.error('state save failed',e);}listeners.forEach(fn=>{try{fn(state,reason);}catch(_e){}});return state;}
  function get(){return state;}
  function set(next,reason='set'){state=normalize(next);return save(reason);}
  function patch(patchObj,reason='patch'){state=normalize({...state,...patchObj});return save(reason);}
  function update(fn,reason='update'){const result=fn(state)||state;state=normalize(result);return save(reason);}
  function addEvent(type,payload={}){const event={id:payload.id||uid(type),type,profile:payload.profile||state.active.profile,language:payload.language||state.active.language,deviceId:getDeviceId(),createdAt:payload.createdAt||now(),updatedAt:now(),...payload};state.events=core()?.mergeEvents?core().mergeEvents(state.events,[event]):[...state.events,event];state.sync.pending=(state.sync.pending||0)+1;save(type);return event;}
  function savePlan(plan){const next=plan?JSON.parse(JSON.stringify(plan)):null;if(state.activePlan?.id===next?.id&&state.activePlan?.engineVersion===next?.engineVersion)return state.activePlan;state.activePlan=next;save('save-plan');return state.activePlan;}
  function clearPlan(){state.activePlan=null;save('clear-plan');}
  function exportJSON(){return JSON.stringify({app:'Family Language OS',version,schema,exportedAt:now(),state},null,2);}
  function importJSON(text){const parsed=JSON.parse(text),incoming=parsed.state||parsed;state=normalize(incoming);save('restore');return state;}
  function mergeRemoteSnapshot(remoteInput){
    const remote=normalize(remoteInput?.state||remoteInput||{}),local=state,C=core();
    if(!C)throw new Error('Learning Core not loaded');
    const merged=normalize({...local,...remote,
      createdAt:local.createdAt||remote.createdAt,
      active:local.active,
      events:C.mergeEvents(local.events,remote.events),attempts:C.mergeEntityArray(local.attempts,remote.attempts),
      vocab:C.mergeEntityArray(local.vocab,remote.vocab),errorBook:C.mergeEntityArray(local.errorBook,remote.errorBook),
      notes:C.mergeEntityArray(local.notes,remote.notes),shopping:C.mergeEntityArray(local.shopping,remote.shopping),
      diagnostics:C.mergeEntityArray(local.diagnostics,remote.diagnostics),missions:C.mergeEntityArray(local.missions,remote.missions),
      sync:{...local.sync,lastMergeAt:now(),status:'merged'}
    });
    // Progress is kept per record by newest unit/lesson timestamps instead of replacing an entire device snapshot.
    Object.keys(FLH_PROFILES).forEach(pid=>['en','de'].forEach(lang=>{
      const lp=local.progress[pid][lang],rp=remote.progress[pid][lang],mp=merged.progress[pid][lang];
      const remoteUnits={...(rp.units||{})},remoteLessons={...(rp.lessons||{})},remoteHeat={...(rp.heat||{})};
      mp.units={...lp.units};for(const [id,val] of Object.entries(remoteUnits)){const prev=mp.units[id];if(!prev||new Date(val.lastAt||0)>=new Date(prev.lastAt||0))mp.units[id]=val;}
      mp.lessons={...lp.lessons};for(const [id,val] of Object.entries(remoteLessons)){const prev=mp.lessons[id];if(!prev||new Date(val.completedAt||0)>=new Date(prev.completedAt||0))mp.lessons[id]=val;}
      mp.assessments=C.mergeEntityArray(lp.assessments,[...(rp.assessments||[])]);
      mp.promotions=C.mergeEntityArray(lp.promotions,[...(rp.promotions||[])]);
      mp.heat={...lp.heat};for(const [d,m] of Object.entries(remoteHeat))mp.heat[d]=Math.max(mp.heat[d]||0,m||0);
      mp.totalMinutes=Math.max(lp.totalMinutes||0,rp.totalMinutes||0);mp.xp=Math.max(lp.xp||0,rp.xp||0);
      for(const skill of Object.keys(mp.skills)){mp.skills[skill]=Math.max(lp.skills?.[skill]||0,rp.skills?.[skill]||0);mp.skillAttempts[skill]=Math.max(lp.skillAttempts?.[skill]||0,rp.skillAttempts?.[skill]||0);}
      mp.streak=C.computeStreak(mp.heat);mp.lastStudyDate=[lp.lastStudyDate,rp.lastStudyDate].filter(Boolean).sort().pop()||null;
    }));
    state=merged;save('merge-remote');return state;
  }
  function reset(){state=normalize(defaultState());save('reset');}
  function subscribe(fn){listeners.push(fn);return()=>{listeners=listeners.filter(x=>x!==fn);};}
  window.FLH_STORE={KEY,get,set,patch,update,save,addEvent,savePlan,clearPlan,exportJSON,importJSON,mergeRemoteSnapshot,reset,subscribe,uid,getDeviceId,normalize};
})();
