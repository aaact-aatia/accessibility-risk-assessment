import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {score,summarize} from '../js/scoring.js';
const config = JSON.parse(readFileSync(new URL('../data/scoring.json',import.meta.url)));
const loadSample = id => JSON.parse(readFileSync(new URL('../data/samples/'+id+'.json',import.meta.url)));
const sample = loadSample('original-example');
const all = (technical, governance) => ({technical:Object.fromEntries(config.criteria.map(i=>[i.id,technical])),governance:Object.fromEntries(config.governance.map(i=>[i.id,governance]))});
test('source workbook sample',()=>{const r=score(config,sample);assert.equal(r.technicalScore,65.90625);assert.equal(r.governanceScore,10);assert.equal(r.overall,75.90625);assert.equal(r.risk,'High Risk');assert.deepEqual(summarize(config,r).counts,[27,13,3,4,2,0]);assert.deepEqual(summarize(config,r).severity.map(i=>i.counts),[[3,3,2,0,0,0],[5,2,0,1,0,0],[14,5,0,1,1,0],[5,3,1,2,1,0]]);});
test('maximum and applicability',()=>{for(const a of [all('Support','Yes'),all('Not Applicable','Not Required')]){const r=score(config,a);assert.equal(r.technicalScore,90);assert.equal(r.overall,100);assert.equal(r.risk,'Low Risk');}});
test('partial and zero scores',()=>{assert.equal(score(config,all('Partially Support','No')).overall,45);assert.equal(score(config,all('Not Tested','No')).overall,0);assert.equal(score(config,all('Does Not Support','No')).risk,'Critical Risk');});
test('incomplete and unknown responses',()=>{const r=score(config,{technical:{'1.1.1':'unknown'}});assert.equal(r.answered,0);assert.equal(r.risk,null);assert.equal(r.overall,0);});
test('configuration coverage',()=>{assert.equal(config.criteria.length,49);assert.equal(new Set(config.criteria.map(i=>i.id)).size,49);assert.equal(config.governance.length,4);assert.deepEqual(['Critical','High','Medium','Low'].map(s=>config.criteria.filter(i=>i.severity===s).length),[8,8,21,12]);});

test('all downloadable sample assessments',()=>{
 const scenarios = [
 ['original-example',75.90625,'High Risk',53],
 ['perfect-score',100,'Low Risk',53],
 ['low-risk',94,'Low Risk',53],
 ['moderate-risk',86.1875,'Moderate Risk',53],
 ['high-risk',78.875,'High Risk',53],
 ['critical-risk',10,'Critical Risk',53],
 ['incomplete',20.3125,null,10]
 ];
 for(const [id,overall,risk,answered] of scenarios){
  const a=loadSample(id),r=score(config,a);
  assert.equal(a.schemaVersion,1,id);
  assert.equal(a.methodologyVersion,config.version,id);
  assert.equal(a.standard,config.standard,id);
  for(const [kind,items,factors] of [['technical',config.criteria,config.technicalFactors],['governance',config.governance,config.governanceFactors]]){
   assert.deepEqual(Object.keys(a[kind]).sort(),items.map(i=>i.id).sort(),id);
   for(const item of items){assert.ok(a[kind][item.id]===''||Object.hasOwn(factors,a[kind][item.id]),id);assert.equal(typeof a[kind+'Notes'][item.id],'string',id);}
  }
  assert.equal(r.overall,overall,id);
  assert.equal(r.risk,risk,id);
  assert.equal(r.answered,answered,id);
 }
});
