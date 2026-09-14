import test from 'node:test';
import assert from 'node:assert/strict';
import {createStudy} from '../dist/study.js';
import {states} from '../dist/states.js';
import {localizedQuestion} from '../dist/i18n.js';
test('Both state decks reveal answers, persist independent mastery and translate without moving cards',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 let id='nj',language='en';const study=createStudy({getState:()=>({id,config:states[id]}),getLanguage:()=>language,translate:q=>localizedQuestion(q,language),escape:String,sourceButton:p=>`page ${p}`});
 for(id of ['nj','ny']){
 study.open();assert.match(study.cards(),/1 \/ /);assert.doesNotMatch(study.cards(),/study-answer/);study.action('known');assert.match(study.cards(),/1 \/ /);
 study.action('flip');assert.match(study.cards(),/study-answer/);language='ka';assert.match(study.cards(),/პასუხი/);assert.match(study.cards(),/1 \/ /);language='en';study.action('known');
 assert.equal(Object.values(JSON.parse(memory.get('road-ready-cards-'+id))).filter(x=>x==='known').length,1);
 study.open('',true);assert.match(study.cards(),new RegExp('1 / '+(states[id].questions.length-1)));
 study.open(states[id].topics[0]);assert.ok(study.cards().includes(states[id].questions.find(q=>q.topic===states[id].topics[0]).question));
 assert.match(study.guide(x=>x),/study-grid/);
 }
 assert.ok(memory.has('road-ready-cards-nj')&&memory.has('road-ready-cards-ny'));
});
