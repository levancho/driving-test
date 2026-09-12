import {questions,topics} from './questions.js';
export {questions,topics};
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createSession(mode,topic='',missed=[],minutes=0){
 if(!['quick','exam','topic','mistakes'].includes(mode))throw new Error('Unknown practice mode');
 if(mode==='topic'&&!topics.includes(topic))throw new Error('Unknown topic');
 const pool=questions.filter(q=>mode==='topic'?q.topic===topic:mode==='mistakes'?missed.includes(q.id):true);
 if(!pool.length)throw new Error('No questions available for this practice');
 const selected=shuffle(pool).slice(0,mode==='exam'?50:mode==='quick'?10:pool.length);
 return {mode,topic,items:selected.map(q=>({id:q.id,order:shuffle([0,1,2,3]),selected:null,confirmed:false})),index:0,started:Date.now(),deadline:mode==='exam'&&minutes>0?Date.now()+minutes*60000:null,finished:false};
}
export function score(session){const correct=session.items.filter(it=>it.confirmed&&it.selected===questions.find(q=>q.id===it.id).answer).length;return {correct,total:session.items.length,percent:Math.round(correct/session.items.length*100),passed:correct/session.items.length>=.8};}
export function recordAnswer(stats,q,selected){const good=selected===q.answer;stats.answers++;stats.correct+=Number(good);stats.seen=[...new Set([...stats.seen,q.id])];stats.missed=good?stats.missed.filter(id=>id!==q.id):[...new Set([...stats.missed,q.id])];const t=stats.topics[q.topic]??{answers:0,correct:0};t.answers++;t.correct+=Number(good);stats.topics[q.topic]=t;return good;}
export function blankStats(){return {answers:0,correct:0,seen:[],missed:[],topics:{},history:[]};}
export function validSession(s){return s&&Array.isArray(s.items)&&s.items.length>0&&Number.isInteger(s.index)&&s.index>=0&&s.index<s.items.length&&s.items.every(it=>questions.some(q=>q.id===it.id)&&Array.isArray(it.order)&&[...it.order].sort().join()==='0,1,2,3'&&(it.selected===null||[0,1,2,3].includes(it.selected)));}
