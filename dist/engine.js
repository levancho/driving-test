import {questions,topics} from './questions.js';
import {states} from './states.js';
export {states};
export {questions,topics};
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createSession(mode,topic='',missed=[],minutes=0,state='nj'){
 if(!Object.hasOwn(states,state))throw new Error('Unknown state');
 const config=states[state],{questions,topics}=config;
 if(!['quick','exam','topic','mistakes'].includes(mode))throw new Error('Unknown practice mode');
 if(mode==='topic'&&!topics.includes(topic))throw new Error('Unknown topic');
 const pool=questions.filter(q=>mode==='topic'?q.topic===topic:mode==='mistakes'?missed.includes(q.id):true);
 if(!pool.length)throw new Error('No questions available for this practice');
 const selected=mode==='exam'&&config.signs?shuffle([...shuffle(pool.filter(q=>q.roadSign)).slice(0,config.signs),...shuffle(pool.filter(q=>!q.roadSign)).slice(0,config.count-config.signs)]):shuffle(pool).slice(0,mode==='exam'?config.count:mode==='quick'?10:pool.length);
 return {state,mode,topic,items:selected.map(q=>({id:q.id,order:shuffle([0,1,2,3]),selected:null,confirmed:false})),index:0,started:Date.now(),deadline:mode==='exam'&&minutes>0?Date.now()+minutes*60000:null,finished:false};
}
export function score(session){const config=states[session.state??'nj'];const good=it=>it.confirmed&&it.selected===config.questions.find(q=>q.id===it.id)?.answer;const correct=session.items.filter(good).length;const signItems=session.items.filter(it=>config.questions.find(q=>q.id===it.id)?.roadSign);const signsCorrect=signItems.filter(good).length;return {correct,total:session.items.length,percent:Math.round(correct/session.items.length*100),signsCorrect,signsTotal:signItems.length,passed:correct/session.items.length>=config.pass/config.count&&(session.mode!=='exam'||signsCorrect>=config.signPass)};}
export function recordAnswer(stats,q,selected){const good=selected===q.answer;stats.answers++;stats.correct+=Number(good);stats.seen=[...new Set([...stats.seen,q.id])];stats.missed=good?stats.missed.filter(id=>id!==q.id):[...new Set([...stats.missed,q.id])];const t=stats.topics[q.topic]??{answers:0,correct:0};t.answers++;t.correct+=Number(good);stats.topics[q.topic]=t;return good;}
export function blankStats(){return {answers:0,correct:0,seen:[],missed:[],topics:{},history:[]};}
export function validSession(s){const config=states[s?.state??'nj'];return !!(config&&s&&['quick','exam','topic','mistakes'].includes(s.mode)&&Array.isArray(s.items)&&s.items.length>0&&new Set(s.items.map(it=>it.id)).size===s.items.length&&Number.isInteger(s.index)&&s.index>=0&&s.index<s.items.length&&s.items.every(it=>config.questions.some(q=>q.id===it.id)&&Array.isArray(it.order)&&[...it.order].sort().join()==='0,1,2,3'&&(it.selected===null||[0,1,2,3].includes(it.selected))));}
