// Pure teaching-state calculations. Time changes a visual narrative, not measured physiology.
export const REGION_WEIGHTS=Object.freeze({neck:.84,back:1,pelvis:.72,hips:.58,legs:.48});
const stops=[[0,[217,72,56]],[.25,[232,193,113]],[.5,[233,162,74]],[.75,[211,103,66]],[1,[174,66,59]]];
export function safeMinutes(value){return Math.max(0,Math.min(1440,Number(value)||0));}
export function getProgressTheme(minutes){const progress=Math.min(1,safeMinutes(minutes)/240);let i=1;while(i<stops.length-1&&progress>stops[i][0])i++;const [a,ca]=stops[i-1],[b,cb]=stops[i],t=(progress-a)/(b-a);const rgb=ca.map((v,k)=>Math.round(v+(cb[k]-v)*t));return {progress,color:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''),label:'静坐时长教学主题',explanation:'颜色表现持续静坐的教学进程，不是实测疲劳、损伤或恢复量。'};}
export function getRegionTheme(minutes,region='back',selected=false){const p=getProgressTheme(minutes),weight=REGION_WEIGHTS[region]??.5;return {...p,weight,size:1+p.progress*(.55+weight*.5)+(selected?.12:0),opacity:Math.min(.64,.08+p.progress*(.2+weight*.27)+(selected?.1:0))};}
export function regionFromNormalizedPosition(x,y){if(y>.72)return Math.abs(x)<.65?'neck':null;if(y>.15&&y<.72&&Math.abs(x)<.48)return 'back';if(y>-.34&&y<=.15&&Math.abs(x)<.55)return 'pelvis';if(y>-.75&&y<=-.34)return 'hips';if(y<=-.75&&y>-2.25)return 'legs';return null;}
