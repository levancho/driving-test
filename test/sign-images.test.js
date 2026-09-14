import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {states} from '../dist/states.js';
import {localizedQuestion} from '../dist/i18n.js';
test('All sign identification cards have existing offline-ready images in both languages',()=>{
 const sw=readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');
 for(const state of Object.values(states))for(const q of state.questions){
 if(q.roadSign||q.id.startsWith('s')||['q61','q62','q63','q64','ny-q21','ny-q22'].includes(q.id))assert.ok(q.image,q.id);
 if(q.image){assert.ok(existsSync(new URL('../dist/'+q.image,import.meta.url)),q.id);assert.equal(localizedQuestion(q,'ka').image,q.image);if(q.image.endsWith('.svg'))assert.ok(sw.includes(q.image),q.id);}
 }
});
