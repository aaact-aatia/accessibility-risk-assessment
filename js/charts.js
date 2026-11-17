// Native charts: all values are visible text; visual bars are redundant.
const palette = ["#14532d","#fff4c2","#881f28","#e3f2ff","#454545","#f1e8ff"];
const make = (tag, text, className) => {
 const n = document.createElement(tag);
 if(text !== undefined) n.textContent = text;
 if(className) n.className = className;
 return n;
};
function bar(label, value, maximum, detail, color) {
 const row = make('li',undefined,'chart-row');
 const line = make('div',undefined,'chart-label');
 line.append(make('span',label),make('strong',detail));
 const track = make('div',undefined,'chart-track');
 track.setAttribute('aria-hidden','true');
 const fill = make('div',undefined,'chart-fill');
 fill.style.width = (maximum ? value/maximum*100 : 0)+'%';
 fill.style.backgroundColor = color;
 if (['#fff4c2','#e3f2ff','#f1e8ff'].includes(color) && value > 0) fill.classList.add('chart-fill-light');
 track.append(fill); row.append(line,track);
 return row;
}
function chart(title, id, headingTag='h4') {
 const section = make('section',undefined,'chart-panel');
 const heading = make(headingTag,title); heading.id=id+'-heading';
 section.setAttribute('aria-labelledby',heading.id);
 section.append(heading);
 return section;
}
function dataDialog(section, title, id, data) {
 const button=make('button','View '+title.toLowerCase()+' data table','secondary chart-dialog-button');
 button.type='button';
 button.setAttribute('aria-haspopup','dialog');
 const dialog=make('dialog',undefined,'chart-dialog');
 const heading=make('h2',title+' data table'); heading.id=id+'-dialog-title';
 dialog.setAttribute('aria-labelledby',heading.id);
 const close=make('button','Close data table','secondary'); close.type='button';
 close.setAttribute('autofocus','');
 dialog.append(heading,close,data);
 button.addEventListener('click',()=>dialog.showModal());
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(button.isConnected)button.focus();});
 const print=make('div',undefined,'chart-print-table'); print.append(data.cloneNode(true));
 section.append(button,dialog,print);
}
export function overallChart(result, complete) {
 const section=chart('Overall assessment score','score-chart','h3');
 section.classList.add('risk-summary');
 section.append(make('p',result.overall.toFixed(2)+' / 100','risk-score'));
 section.append(make('p',complete?result.risk:'Risk rating pending (provisional score)','risk-rating'));
 const bands=[["Critical risk",70,"#881f28","0–<70"],["High risk",10,"#fff4c2","70–<80"],["Moderate risk",10,"#714500","80–<90"],["Low risk",10,"#e6f5cf","90–100"]];
 const scale=make('div',undefined,'risk-scale');
 scale.setAttribute('aria-hidden','true');
 const track=make('div',undefined,'risk-track');
 for(const [label,width,color] of bands){
  const segment=make('div',undefined,'risk-segment');
  segment.style.flexBasis=width+'%';
  segment.style.backgroundColor=color;
  track.append(segment);
 }
 const pointerTrack=make('div',undefined,'risk-pointer-track');
 const pointer=make('div',undefined,'risk-pointer');
 const position=Math.max(0,Math.min(100,result.overall));
 pointer.style.left=position+'%';
 pointerTrack.append(pointer);
 scale.append(track,pointerTrack);
 section.append(scale);
 const legend=make('ul',undefined,'risk-legend');
 for(const [label,width,color,range] of bands){
  const item=make('li');
  const key=make('span',undefined,'risk-key');
  key.style.backgroundColor=color;
  key.setAttribute('aria-hidden','true');
  item.append(key,make('span',label+' ('+range+')'));
  legend.append(item);
 }
 section.append(legend);
 const totals=make('div',undefined,'risk-totals');
 for(const [label,value,max] of [['Technical accessibility',result.technicalScore,90],['Vendor governance',result.governanceScore,10]]){
  const item=make('div');
  item.append(make('span',label),make('strong',value.toFixed(2)+' / '+max));
  totals.append(item);
 }
 section.append(totals);
 return section;
}
export function statusChart(summary,total,data) {
 const section=chart('Conformance status','status-chart');
 const list=make('ul',undefined,'chart-bars');
 summary.statuses.forEach((label,i)=>{
 const n=summary.counts[i];list.append(bar(label,n,total,n+' ('+(n/total*100).toFixed(1)+'%)',palette[i]));
 });
 section.append(list);dataDialog(section,'Conformance status','status-chart',data);return section;
}
export function severityChart(summary,data) {
 const section=chart('Conformance by severity','severity-chart');
 const grid=make('div',undefined,'severity-charts');
 for(const group of summary.severity){
  const panel=make('div',undefined,'severity-chart');
  const total=group.counts.reduce((a,b)=>a+b,0);
  panel.append(make('h5',group.severity+' ('+total+' criteria)'));
  const list=make('ul',undefined,'chart-bars');
  summary.statuses.forEach((label,i)=>list.append(bar(label,group.counts[i],total,group.counts[i]+' / '+total,palette[i])));
  panel.append(list);grid.append(panel);
 }
 section.append(grid);dataDialog(section,'Conformance by severity','severity-chart',data);return section;
}
