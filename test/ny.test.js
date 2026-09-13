import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {states,createSession,score,validSession} from '../dist/engine.js';
import {localizedQuestion,translate} from '../dist/i18n.js';
test('NY questions have source pages, unique choices and complete Georgian translations',()=>{
 const bank=states.ny.questions,pages=JSON.parse(readFileSync(new URL('../dist/manual-pages-ny.json',import.meta.url)));
 assert.equal(bank.length,50);assert.equal(new Set(bank.map(q=>q.id)).size,50);
 for(const q of bank){assert.ok(q.page>=29&&q.page<=75);assert.ok(pages[q.page],q.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);const ka=localizedQuestion(q,'ka');assert.match(ka.question,/[ა-ჰ]/);assert.match(ka.explanation,/[ა-ჰ]/);assert.equal(new Set(ka.options).size,4);assert.equal(ka.answer,q.answer);assert.equal(ka.page,q.page);assert.ok(ka.options.every(s=>s.length));if(q.image)assert.ok(existsSync(new URL('../dist/'+q.image,import.meta.url)));}
 for(const [title] of states.ny.chapters)assert.notEqual(translate('ka',title),title);
});
test('NY mock tests always contain 20 unique NY questions, exactly four road signs',()=>{
 for(let i=0;i<100;i++){const s=createSession('exam','',[],0,'ny');assert.equal(s.items.length,20);assert.equal(new Set(s.items.map(it=>it.id)).size,20);assert.equal(s.items.filter(it=>states.ny.questions.find(q=>q.id===it.id).roadSign).length,4);assert.ok(validSession(s));assert.ok(s.items.every(it=>it.id.startsWith('ny-')));}
});
test('NY exam requires both 14 total correct and two signs correct',()=>{
 const s=createSession('exam','',[],0,'ny');const signs=s.items.filter(it=>states.ny.questions.find(q=>q.id===it.id).roadSign),other=s.items.filter(it=>!signs.includes(it));
 function answer(n,ns){s.items.forEach(it=>{it.selected=1;it.confirmed=true;});signs.slice(0,ns).forEach(it=>it.selected=0);other.slice(0,n-ns).forEach(it=>it.selected=0);return score(s);}
 assert.equal(answer(14,2).passed,true);assert.equal(answer(13,2).passed,false);assert.equal(answer(17,1).passed,false);assert.equal(answer(20,4).passed,true);assert.equal(score(s).signsCorrect,4);
});
test('States cannot mix sessions, topic pools or mistake lists',()=>{
 const s=createSession('quick','',[],0,'ny');assert.equal(validSession({...s,state:'nj'}),false);assert.equal(validSession({...s,state:'bad'}),false);assert.throws(()=>createSession('quick','',[],0,'bad'));
 assert.throws(()=>createSession('mistakes','',['q1'],0,'ny'));
 for(const topic of states.ny.topics)assert.ok(createSession('topic',topic,[],0,'ny').items.every(it=>states.ny.questions.find(q=>q.id===it.id).topic===topic));
 const nj=createSession('quick');delete nj.state;assert.ok(validSession(nj),'Legacy NJ sessions remain valid');
});
test('All same-origin offline cache assets exist',()=>{
 const sw=readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');for(const match of sw.matchAll(/'\.\/([^']+)'/g)){const path=match[1].split('?')[0];if(path==='signs/')continue;assert.ok(existsSync(new URL('../dist/'+path,import.meta.url)),path);}
 assert.match(sw,/manual-pages-ny\.json/);assert.match(sw,/questions-ny\.js/);assert.match(sw,/states\.js/);
});
