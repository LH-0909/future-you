export async function exportActionCard({goals,start,complete=0,share=false}){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  const bg=ctx.createLinearGradient(0,0,1080,1440);bg.addColorStop(0,'#173548');bg.addColorStop(1,'#0b1827');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1440);
  ctx.strokeStyle='#356174';ctx.lineWidth=2;
  for(let radius of [240,290,340]){ctx.beginPath();ctx.arc(1040,90,radius,0,Math.PI*2);ctx.stroke();}
  ctx.font='24px "Microsoft YaHei", sans-serif';ctx.fillStyle='#8ec8c9';ctx.fillText('FUTURE YOU / MY ACTION CARD',80,115);
  ctx.font='bold 82px "Microsoft YaHei", sans-serif';ctx.fillStyle='#e7f5f4';ctx.fillText('未来的你',80,260);ctx.fillStyle='#99edd7';ctx.fillText('从今天开始。',80,365);
  ctx.font='28px "Microsoft YaHei", sans-serif';ctx.fillStyle='#adc7d3';ctx.fillText(`七日行动 · ${start} 开始`,85,450);
  goals.forEach((g,i)=>{const y=540+i*165;ctx.fillStyle='#1c3848';ctx.beginPath();ctx.roundRect(80,y,920,135,16);ctx.fill();ctx.fillStyle='#8adfce';ctx.font='28px sans-serif';ctx.fillText(`0${i+1}`,110,y+54);ctx.fillStyle='#e7f3f4';ctx.font='36px "Microsoft YaHei", sans-serif';ctx.fillText(g.title,180,y+56);ctx.fillStyle='#9fbccc';ctx.font='25px "Microsoft YaHei", sans-serif';ctx.fillText(g.note,180,y+103);});
  ctx.fillStyle='#8ee5d0';ctx.font='bold 58px sans-serif';ctx.fillText(`${complete} / 21`,85,1135);ctx.fillStyle='#aac2cf';ctx.font='26px "Microsoft YaHei", sans-serif';ctx.fillText('已记录行动 · 按自己的节奏继续',85,1190);
  ctx.strokeStyle='#315062';ctx.beginPath();ctx.moveTo(80,1280);ctx.lineTo(1000,1280);ctx.stroke();ctx.font='22px "Microsoft YaHei", sans-serif';ctx.fillStyle='#89a7b9';ctx.fillText('一般生活方式科普示例，不提供诊断或个人风险预测。',80,1332);ctx.fillText('让今天的一个小选择，成为明天的好习惯。',80,1380);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Export failed');
  const file=new File([blob],`未来的你_七日行动_${start}.png`,{type:'image/png'});
  if(share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'我的七日健康行动',files:[file]});return 'shared';}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return 'downloaded';
}
