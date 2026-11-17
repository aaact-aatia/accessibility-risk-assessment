import {score,summarize} from './scoring.js';
const $ = id => document.getElementById(id);
const el = (tag, text, attrs={}) => {
  const node = document.createElement(tag);
  if(text !== undefined) node.textContent = text;
  for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
  return node;
};
const fields = [
 ['vendor','Vendor name','text',true],['product','Product name','text',true],
 ['version','Product version','text'],['website','Product website','url'],
 ['acrUrl','Accessibility Conformance Report URL','url'],['acrDate','Accessibility Conformance Report date','date'],
 ['evaluator','Evaluator name','text'],['date','Assessment date','date',true],
 ['use','Intended product use','textarea'],['notes','Additional notes','textarea']
];
const groups = ['Perceivable','Operable','Understandable','Robust'];
const localDate = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const fmt = n => n.toFixed(2);
const form = $('assessment');
let config;
const controls = new Map();
function field(parent,id,label,type,required=false) {
  const wrap=el('div',undefined,{class:type==='textarea'?'wide':'field'});
  const input=el(type==='textarea'?'textarea':'input',undefined,{id,name:id});
  if(type!=='textarea')input.type=type;
  if(required)input.required=true;
  wrap.append(el('label',label+(required?' (required)':''),{for:id}), input);
  parent.append(wrap);controls.set(id,input);return input;
}
function question(parent,item,kind,factors) {
  const id=kind+'-'+item.id, box=el('fieldset'), row=el('div',undefined,{class:'criterion'});
  const heading=kind==='technical'?item.id+' '+item.title:item.title;
  box.append(el('legend',heading));box.append(row);
  row.append(el('p',(item.level?'Level '+item.level+' · '+item.severity+' · ':'')+item.points+' possible points',{class:'meta'}));
  const wrap=el('div'), select=el('select',undefined,{id,name:id,required:''});
  select.append(el('option','Choose a response',{value:''}));
  for(const value of Object.keys(factors))select.append(el('option',value,{value}));
  wrap.append(el('label','Response (required)',{for:id}),select);row.append(wrap);controls.set(id,select);
  field(row,id+'-notes','Notes / evidence','textarea');
  parent.append(box);
}
function build(){
  for(const args of fields)field($('fields'),...args);
  $('date').value=localDate();
  for(const [index,name] of groups.entries()){
    const section=el('section',undefined,{class:'group','aria-labelledby':'group-'+index});
    section.append(el('h3',name,{id:'group-'+index}));
    const criteria=config.criteria.filter(i=>i.id.startsWith((index+1)+'.')).sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
    for(const item of criteria)question(section,item,'technical',config.technicalFactors);
    $('criteria').append(section);
  }
  for(const item of config.governance)question($('questions'),item,'governance',config.governanceFactors);
}
function collect(){
 const information=Object.fromEntries(fields.map(([id])=>[id,controls.get(id).value]));
 const answers=kind=>Object.fromEntries((kind==='technical'?config.criteria:config.governance).map(i=>[i.id,controls.get(kind+'-'+i.id).value]));
 const notes=kind=>Object.fromEntries((kind==='technical'?config.criteria:config.governance).map(i=>[i.id,controls.get(kind+'-'+i.id+'-notes').value]));
 return {schemaVersion:1,methodologyVersion:config.version,standard:config.standard,information,technical:answers('technical'),governance:answers('governance'),technicalNotes:notes('technical'),governanceNotes:notes('governance')};
}
function table(title,headers,rows){
 const wrap=el('div',undefined,{class:'table-scroll',tabindex:'0',role:'region','aria-label':title});
 const t=el('table');t.append(el('caption',title));
 const head=el('thead'), hr=el('tr');for(const h of headers)hr.append(el('th',h,{scope:'col'}));head.append(hr);t.append(head);
 const body=el('tbody');for(const row of rows){const tr=el('tr');row.forEach((v,i)=>tr.append(el(i?'td':'th',String(v),i?{class:'notes'}:{scope:'row'})));body.append(tr);}
 t.append(body);wrap.append(t);return wrap;
}
function metric(label,value){const d=el('div',undefined,{class:'metric'});d.append(el('span',label),el('strong',value));return d;}
let previousStatus = null;
function render(){
 const a=collect(),r=score(config,a),s=summarize(config,r),target=$('results');
 const valid=fields.filter(f=>f[3]).every(([id])=>controls.get(id).value.trim() && controls.get(id).validity.valid) && fields.every(([id])=>controls.get(id).validity.valid);
 const complete=!!r.risk && valid;
 returnStatus(r, complete);
 $('report-state').textContent=complete?'Complete assessment · '+config.standard:'Incomplete assessment — '+r.answered+' of '+r.count+' responses entered. A final risk rating requires all responses and valid product information.';
 const metrics=el('div',undefined,{class:'metrics'});
 metrics.append(metric('Technical score',fmt(r.technicalScore)+' / 90'),metric('Governance score',fmt(r.governanceScore)+' / 10'),metric('Overall score',fmt(r.overall)+' / 100'),metric('Risk rating',complete?r.risk:'Pending'));
 const info=el('dl');for(const [id,label] of fields)info.append(el('dt',label),el('dd',a.information[id]||'Not provided'));
 const status=table('Conformance status summary',['Response','Count','Share of 49 criteria'],s.statuses.map((v,i)=>[v,s.counts[i],(s.counts[i]/config.criteria.length*100).toFixed(1)+'%']));
 const severity=table('Responses by severity',['Severity',...s.statuses],s.severity.map(v=>[v.severity,...v.counts]));
 const technical=table('Criterion-level results',['Success criterion','Level','Severity','Response','Points awarded / possible','Notes / evidence'],r.technical.map(i=>[i.id+' '+i.title,i.level,i.severity,i.status||'Unanswered',fmt(i.awarded)+' / '+i.points,a.technicalNotes[i.id]||'—']));
 const governance=table('Governance results',['Question','Response','Points awarded / possible','Notes / evidence'],r.governance.map(i=>[i.title,i.status||'Unanswered',fmt(i.awarded)+' / '+i.points,a.governanceNotes[i.id]||'—']));
 target.replaceChildren(metrics,el('p','Risk bands: Low 90–100; Moderate 80–89.99; High 70–79.99; Critical below 70. Scores are not a certification of accessibility.'),el('h3','Product information'),info,el('h3','Technical accessibility summary'),status,severity,technical,el('h3','Vendor governance summary'),governance);
}
// Announce only changes to the score, progress or final risk rating.
function returnStatus(result, complete) {
 const message = result.answered+' of '+result.count+' responses completed. Current score: '+fmt(result.overall)+' out of 100.'+(complete?' Risk rating: '+result.risk+'.':' Final risk rating pending.');
 if(previousStatus !== null && message !== previousStatus) {
   $('assessment-status').textContent=message;
 }
 previousStatus=message;
}
function validateImport(a){
 if(!a || a.schemaVersion!==1 || a.methodologyVersion!==config.version || a.standard!==config.standard)throw Error('Unsupported assessment file or methodology version.');
 const object=v=>v && typeof v==='object' && !Array.isArray(v);
 const sections=['information','technical','governance','technicalNotes','governanceNotes'];
 for(const key of sections)if(!object(a[key]))throw Error('Missing or invalid '+key+'.');
 for(const [id] of fields)if(typeof a.information[id]!=='string')throw Error('Invalid product information field: '+id);
 for(const [kind,items,factors] of [['technical',config.criteria,config.technicalFactors],['governance',config.governance,config.governanceFactors]]){
  for(const item of items){
   const response=a[kind][item.id];
   if(typeof response!=='string'||(response!==''&&!Object.hasOwn(factors,response)))throw Error('Invalid response for '+item.id);
   if(typeof a[kind+'Notes'][item.id]!=='string')throw Error('Invalid notes for '+item.id);
  }
 }
}
function apply(a){
 for(const [id] of fields)controls.get(id).value=a.information[id];
 for(const [kind,items] of [['technical',config.criteria],['governance',config.governance]])for(const item of items){
   controls.get(kind+'-'+item.id).value=a[kind][item.id];
   controls.get(kind+'-'+item.id+'-notes').value=a[kind+'Notes'][item.id];
 }
 render();
}
async function init(){
 const response=await fetch('./data/scoring.json');
 if(!response.ok)throw Error('Unable to load scoring configuration.');
 config=await response.json();build();render();
 // Update immediately as users type or select a response.
 form.addEventListener('input',render);
 form.addEventListener('change',render);
 form.addEventListener('submit',event=>{event.preventDefault();render();$('report-heading').focus();});
 $('export').addEventListener('click',()=>{
  const a=collect(),blob=new Blob([JSON.stringify(a,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=el('a');
  link.href=url;link.download=(a.information.product.replace(/[^a-z0-9_-]+/gi,'-').slice(0,80)||'assessment')+'.json';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('message').textContent='Assessment export requested.';
 });
 $('import').addEventListener('click',()=>$('file').click());
 $('file').addEventListener('change',async()=>{
  const file=$('file').files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw Error('File exceeds 5 MB.');
   const a=JSON.parse(await file.text());validateImport(a);
   if(confirm('Replace the current assessment with the imported file?')){apply(a);$('message').textContent='Assessment imported.';}
  }catch(error){$('message').textContent='Import failed: '+error.message;}
  finally{$('file').value='';}
 });
 $('reset').addEventListener('click',()=>{if(confirm('Clear all current responses and product information? Export first if you need a copy.')){form.reset();$('date').value=localDate();render();$('message').textContent='New assessment started.';}});
 $('print').addEventListener('click',()=>window.print());
 $('loading').hidden=true;$('application').hidden=false;
}
init().catch(error=>{$('loading').textContent='The application could not load. '+error.message;});
