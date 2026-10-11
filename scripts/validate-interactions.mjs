import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createExplosionLayout} from '../app/core/explosion-layout.ts';
import {PointerTap} from '../app/core/pointer-tap.ts';
import {atlasTools} from '../app/core/agent-tools.ts';
import {randomOrganCandidates,pickRandomOrgan} from '../app/core/random-organ.ts';
import {privacyHiddenParts,isPartVisible,readPrivacyMode,PRIVACY_MODE_STORAGE_KEY} from '../app/core/privacy-mode.ts';

for (const file of ['atlas.json', 'atlas-female.json']) {
  const atlas=JSON.parse(await readFile(new URL(`../public/models/${file}`,import.meta.url)));
  const model=atlas.sex;
  const organs=randomOrganCandidates(atlas,model);
  assert.deepEqual(privacyHiddenParts(atlas,false),[]);
  const hidden=new Set(privacyHiddenParts(atlas,true));
  const allSystems=new Set(atlas.parts.map(p=>p.system));
  const visibleDefault=atlas.parts.filter(p=>isPartVisible(p,allSystems,new Set(),false,hidden));
  if(model==='male') {
    assert.ok(hidden.size>12,'Privacy also hides genital vessels outside the reproductive system');
    for(const part of atlas.parts.filter(p=>p.system==='reproductive' || /penis|testicular/i.test(p.name))) {
      assert.ok(hidden.has(part.id),`Sensitive structure not hidden: ${part.name}`);
      assert.equal(isPartVisible(part,allSystems,new Set(),false,hidden),false);
      assert.equal(isPartVisible(part,allSystems,new Set(),true,hidden),false);
      assert.equal(isPartVisible(part,new Set(),new Set([part.id]),true,hidden),true,'Explicit search selection remains available');
      assert.equal(isPartVisible(part,allSystems,new Set([part.id]),false,hidden),true,'Explicit selection can be shown with surroundings');
      assert.equal(isPartVisible(part,allSystems,new Set(),false,new Set()),true,'Turning privacy off restores the structure');
    }
    assert.ok(visibleDefault.some(p=>p.conceptId==='FMA7148'),'Unrelated organs remain visible');
    assert.equal(organs.filter(c=>!c.elements.some(id=>hidden.has(id))).length,17,'Private organs are excluded from random exploration');
  } else {
    assert.equal(hidden.size,0,'Female geometry is unchanged');
    assert.equal(visibleDefault.length,atlas.parts.length);
  }
  assert.equal(organs.length,20,`${model}: all common and model-specific organs are available`);
  assert.equal(new Set(organs.map(c=>c.id)).size,organs.length);
  const partIds=new Set(atlas.parts.map(p=>p.id));
  for(const organ of organs) assert.ok(organ.elements.length && organ.elements.every(id=>partIds.has(id)));
  assert.ok(organs.find(c=>c.id==='FMA7088').elements.length>1,'The whole heart includes its component meshes');
  assert.ok(!organs.some(c=>['FMA7203','FMA7210','HRA:VH_F_ovary','PART_FJ1895'].includes(c.id)),'Avoid bilateral groups and duplicate organ fragments');
  assert.equal(organs.filter(c=>c.id.startsWith('HRA:')).length,model==='female'?3:0);
  assert.equal(organs.filter(c=>['FMA7211','FMA7212','FMA9600'].includes(c.id)).length,model==='male'?3:0);
  assert.deepEqual(randomOrganCandidates(atlas,model==='male'?'female':'male'),[]);
  const broken={...atlas,parts:atlas.parts.filter(p=>p.id!==organs[0].elements[0])};
  assert.ok(!randomOrganCandidates(broken,model).some(c=>c.id===organs[0].id),'Incomplete organs are excluded');
  const duplicated={...atlas,concepts:[...atlas.concepts,organs[0]]};
  assert.equal(randomOrganCandidates(duplicated,model).length,organs.length);
  let previousOrgan;
  for(let i=0;i<100;i++) {
    const current=organs[(i+3)%organs.length].id;
    const next=pickRandomOrgan(organs,current,previousOrgan,()=>((i*17)%100)/100);
    assert.ok(next && next.id!==current && next.id!==previousOrgan);
    previousOrgan=next.id;
  }
  // Midpoints of equal probability intervals must select each eligible organ once.
  const eligible=organs.slice(2);
  assert.deepEqual(eligible.map((_,i)=>pickRandomOrgan(organs,organs[0].id,organs[1].id,()=>(i+.5)/eligible.length).id),eligible.map(c=>c.id));
  console.log(`${model}: whole-organ candidates, complete geometry, sex-specific filtering and nonrepeating random selection passed.`);
  const groups=[atlas.parts,...[...new Set(atlas.parts.map(p=>p.system))].map(system=>atlas.parts.filter(p=>p.system===system))];
  for(const group of groups) for(const aspect of [.46,1,1.7]) {
    const layout=createExplosionLayout(group,aspect),cells=[...layout.cells.values()];
    assert.equal(cells.length,group.length);
    for(let i=0;i<cells.length;i++) {
      const a=cells[i];
      assert.ok(Math.abs(a.x)+a.width/2<=layout.width/2+1e-8);
      assert.ok(Math.abs(a.y)+a.height/2<=layout.height/2+1e-8);
      for(let j=i+1;j<cells.length;j++) {
        const b=cells[j];
        assert.ok(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1e-8 || Math.abs(a.y-b.y)>=(a.height+b.height)/2-1e-8,'Exploded pieces overlap');
      }
    }
  }
  let selected=null;
  const [find,inspect]=atlasTools(atlas,c=>{selected=c;});
  const results=find.execute({query:'femur'});
  assert.ok(results.length>0);
  inspect.execute({id:results[0].id});
  const previous=selected;
  assert.throws(()=>inspect.execute({id:'nonexistent-structure'}));
  assert.equal(selected,previous);
  assert.throws(()=>find.execute({query:' '}));
  console.log(`${file}: packing at desktop/mobile aspect ratios and search/inspection contracts passed.`);
}
assert.deepEqual(randomOrganCandidates(null,'male'),[]);
assert.deepEqual(privacyHiddenParts(null,true),[]);
assert.equal(readPrivacyMode(),false);
assert.equal(readPrivacyMode({getItem:()=>null}),false);
assert.equal(readPrivacyMode({getItem:()=> 'invalid'}),false);
assert.equal(readPrivacyMode({getItem:()=>{throw new Error('Storage blocked');}}),false);
assert.equal(readPrivacyMode({getItem:key=>key===PRIVACY_MODE_STORAGE_KEY?'true':null}),true);
assert.equal(readPrivacyMode({getItem:()=> 'false'}),false);
assert.equal(pickRandomOrgan([]),undefined);
const one={id:'one',name:'one',elements:['mesh']},two={id:'two',name:'two',elements:['mesh2']};
assert.equal(pickRandomOrgan([one],'one','one',()=>0),one);
assert.equal(pickRandomOrgan([one,two],'two','one',()=>0),two);
assert.equal(pickRandomOrgan([one,two],'one','one',()=>0),two);
const tap=new PointerTap();
tap.down(1,10,10,5);assert.equal(tap.up(1,12,11),true);
tap.down(1,10,10,5);tap.move(1,40,10);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,12);tap.down(2,20,20,12);assert.equal(tap.up(2,20,20),false);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,5);tap.cancel(1);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,5);assert.equal(tap.up(1,10,10),true);
assert.equal(createExplosionLayout([]).cells.size,0);
console.log('Tap, drag, multitouch, cancellation, and empty-view checks passed.');
