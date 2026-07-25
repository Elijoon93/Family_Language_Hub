const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;
function load(rel){vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',rel),'utf8'),{filename:rel});}
load('content/packs/foundation-tranche-1.js');load('js/content-registry.js');
let pass=0;function test(name,fn){try{fn();console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,e.message);process.exitCode=1;}}
function assert(x,m='assertion failed'){if(!x)throw new Error(m);}
const pack=FLH_CONTENT_PACKS[0],result=FLH_CONTENT.validatePack(pack);
test('schema validates',()=>assert(result.valid,result.errors.join('\n')));
test('eight reviewed lessons present',()=>assert(result.metrics.lessons===8));
test('all profiles and languages covered',()=>{['saeed','arezoo','elena','aria'].forEach(p=>assert(result.metrics.byProfile[p]===2));assert(result.metrics.byLanguage.en===4&&result.metrics.byLanguage.de===4);});
test('every lesson has four tasks',()=>assert(pack.lessons.every(l=>l.tasks.length===4)));
test('Arzoo remains A1 in both languages',()=>assert(FLH_CONTENT.registry.find({profile:'arezoo'}).every(l=>l.level==='A1')));
test('Elena content is interactive and private by default',()=>assert(FLH_CONTENT.registry.find({profile:'elena'}).every(l=>l.safeguarding.noPublicUpload&&l.tasks.some(t=>['drag-match','letter-trace','sound-picture'].includes(t.type)))));
test('Arya is PRE, parent-guided and has no formal writing',()=>assert(FLH_CONTENT.registry.find({profile:'aria'}).every(l=>l.level==='PRE'&&l.rubric.participationOnly&&l.safeguarding.parentRequired&&l.safeguarding.noFormalAssessment&&l.tasks.every(t=>t.gentle&&t.skill!=='writing'))));
test('Saeed Iranian identity and research path are retained',()=>{const s=JSON.stringify(FLH_CONTENT.registry.find({profile:'saeed'}));assert(s.includes('Iran'));assert(s.includes('risk prioritisation'));});
test('task queue can inject SRS and error review',()=>{const l=pack.lessons[2],q=FLH_CONTENT.buildTaskQueue(l,{weakSkill:'writing',dueErrors:[{id:'e'}],dueVocab:[{id:'v'}]});assert(q[0].type==='srs-review'&&q[1].type==='error-review');});
if(!process.exitCode)console.log(`\n${pass} content tests passed.`);
