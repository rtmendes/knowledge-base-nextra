import { execSync } from 'child_process';
execSync('npx esbuild lib/kb-tree.ts --outfile=/tmp/kb-tree.mjs --format=esm', {cwd:process.cwd()});
const T = await import('/tmp/kb-tree.mjs');
let pass=0,fail=0;
const eq=(n,g,w)=>{const a=JSON.stringify(g),b=JSON.stringify(w);if(a===b){pass++;console.log('  ✓',n)}else{fail++;console.log('  ✗',n,'\n    got ',a,'\n    want',b)}};
const ids=a=>a.map(n=>`${n.id}@${n.depth}`);
// Tree: A[A1, A2], B   (sort_order within siblings)
const cats=[
  {id:'A',parent_category_id:null,sort_order:0},
  {id:'A1',parent_category_id:'A',sort_order:0},
  {id:'A2',parent_category_id:'A',sort_order:1},
  {id:'B',parent_category_id:null,sort_order:1},
];
const flat=T.flattenTree(cats);
eq('flatten DFS order', ids(flat), ['A@0','A1@1','A2@1','B@0']);
console.log('BUG: subtree travels');
// drag A (has 2 kids) below B → A,A1,A2 move after B, depth 0
eq('category subtree moves together', ids(T.moveSubtree(flat,'A','B',0)), ['B@0','A@0','A1@1','A2@1']);
console.log('BUG: nest into populated parent keeps order + depth');
// drag B onto A2 with +1 indent → B becomes child of A after A2
eq('nest as child preserves siblings', ids(T.moveSubtree(flat,'B','A2',16)), ['A@0','A1@1','B@1','A2@1']); // B nests under A among its children
console.log('SAFETY');
eq('cannot drop into own subtree', ids(T.moveSubtree(flat,'A','A1',16)), ids(flat));
console.log('DERIVE updates → parent_category_id + sort_order');
const moved=T.moveSubtree(flat,'A','B',0); // B@0, A@0, A1@1, A2@1
eq('derive parent+order', T.deriveUpdates(moved), [
  {id:'B',parent_category_id:null,sort_order:0},
  {id:'A',parent_category_id:null,sort_order:1},
  {id:'A1',parent_category_id:'A',sort_order:0},
  {id:'A2',parent_category_id:'A',sort_order:1},
]);
eq('diff = only changed rows', T.diffUpdates(cats, T.deriveUpdates(flat)).length, 0);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
