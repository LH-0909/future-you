from pathlib import Path
p=Path(r'E:\LH\future-you\src\components\LifeExperiments.jsx')
s=p.read_text(encoding='utf-8')
a=s.index('export function SittingTimeline');b=s.index('export function InterruptionLab')
section=s[a:b]
pos=section.index('<div className="le-end">')
section=section[:pos]+'<HumanReference minute={tab==="minutes"?minute:0}/>'+section[pos:]
s=s[:a]+section+s[b:]
a=s.index('export function InterruptionLab');b=s.index('const scenes=',a)
section=s[a:b]
needle='height={570}/>'
if needle not in section:
 print(section[-2600:]);raise RuntimeError('inspect model height')
section=section.replace(needle,needle+'{activeSegment.movement===5&&<StepPreview kind="walking"/>}',1)
s=s[:a]+section+s[b:]
p.write_text(s,encoding='utf-8')
