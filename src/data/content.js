export const sources = {
  sleep: { name: 'CDC · About Sleep', org: '美国疾病预防控制中心', url: 'https://www.cdc.gov/sleep/about/', detail: '18–60 岁成年人通常需要每晚至少 7 小时睡眠；睡眠质量和规律性同样重要。' },
  activity: { name: 'WHO · Physical activity', org: '世界卫生组织', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', detail: '成年人每周宜进行 150–300 分钟中等强度有氧活动，或等量高强度活动，并每周至少两天进行肌力活动。' },
  sedentary: { name: 'WHO · 活动与久坐指南', org: '世界卫生组织', url: 'https://www.who.int/publications/i/item/9789240015128', detail: '减少久坐，以任何强度的身体活动替代久坐都有益。指南没有给出适用于所有成年人的每日久坐安全上限。' },
  diet: { name: 'WHO · Healthy diet', org: '世界卫生组织', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', detail: '饮食应多样化，多选蔬菜、水果、全谷物和豆类；游离糖应低于每日总能量的 10%，成年人每日盐摄入少于 5 克。' },
};

export const organData = {
  brain: { name: '大脑', en: 'BRAIN', icon: 'brain', topic: '睡眠与注意力', input: 'sleep', source: 'sleep', description: '睡眠支持注意力、记忆和情绪调节。足够的睡眠时间之外，稳定的作息和良好的睡眠质量也很重要。', action: '今晚给自己留出充足的睡眠时间，尝试固定起床时间。', location: [0, 2.35, 0.08] },
  heart: { name: '心脏', en: 'HEART', icon: 'heart', topic: '运动与心肺适能', input: 'activity', source: 'activity', description: '规律活动为心肺提供锻炼机会。快走、骑行和日常通勤都可以成为身体活动的一部分，少量活动也比完全不活动好。', action: '从一次 10 分钟的快走开始，逐步增加活动量。', location: [0.13, 1.14, 0.24] },
  lungs: { name: '肺部', en: 'LUNGS', icon: 'wind', topic: '呼吸与有氧活动', input: 'activity', source: 'activity', description: '有氧活动需要呼吸与循环系统协作。中等强度活动时，呼吸会加快，通常仍能交谈，但难以唱歌。', action: '选择适合自己的活动，循序渐进，避免突然增加负荷。', location: [-0.34, 1.24, 0.04] },
  metabolism: { name: '消化系统', en: 'DIGESTION', icon: 'leaf', topic: '食物与营养', input: 'diet', source: 'diet', description: '食物经消化吸收为身体提供能量与营养。饮食结构和长期习惯比一顿饭更有意义；含糖饮料是游离糖的常见来源。', action: '下一杯饮料优先选水，下一餐增加一种蔬菜。', location: [0, 0.45, 0.18] },
  muscle: { name: '骨骼肌肉', en: 'MUSCLE', icon: 'activity', topic: '久坐与活动间歇', input: 'sitting', source: 'sedentary', description: '长时间保持同一姿势会减少活动机会。用走动、伸展和日常活动替代部分久坐，可以帮助形成更活跃的生活方式。', action: '给学习或工作安排活动间歇，起身走一走。', location: [-0.36, -0.48, 0.1] },
};

export const experiments = [
  { id: 'sleep', name: '睡眠实验室', en: 'SLEEP LAB', icon: 'moon', organ: 'brain', title: '给大脑一点恢复的时间', description: '调整每晚睡眠时间，看看科普提示如何变化。', mechanism: ['结束一天的活动', '稳定的睡眠机会', '注意力与记忆的支持'], note: '时长只是睡眠的一部分；这段动画不反映真实脑活动。', source: 'sleep' },
  { id: 'activity', name: '运动实验室', en: 'MOVEMENT LAB', icon: 'activity', organ: 'heart', title: '每一次活动，都算数', description: '比较不同周活动量，理解心肺与肌肉如何协作。', mechanism: ['肌肉开始活动', '呼吸与循环协作', '长期适能的支持'], note: '这里输入中等强度有氧活动分钟数；高强度活动和肌力训练需另行考虑。', source: 'activity' },
  { id: 'diet', name: '饮食实验室', en: 'NUTRITION LAB', icon: 'leaf', organ: 'metabolism', title: '让下一餐多一种选择', description: '改变饮食场景，观察消化吸收的简化过程。', mechanism: ['食物摄入', '消化与吸收', '营养与能量供给'], note: '消化动画只展示流程，不模拟实时血糖、代谢速度或器官功能。', source: 'diet' },
  { id: 'sitting', name: '久坐实验室', en: 'SITTING LAB', icon: 'chair', organ: 'muscle', title: '起身，让身体换一个节奏', description: '比较连续久坐与活动间歇，找到适合自己的活动机会。', mechanism: ['长时间相同姿势', '加入活动间歇', '用活动替代部分久坐'], note: '每 45 分钟起身一次是本项目的可选行动示例，并非医学安全阈值。', source: 'sedentary' },
];

export const stages = [
  { label: '现在', en: 'NOW', title: '从看见习惯开始', text: '这是你输入的生活方式画像。找到一件容易做到的小事，为改变留下起点。' },
  { label: '7 天', en: '7 DAYS', title: '尝试一个小小的改变', text: '用一周体验更规律的作息、更多活动或更丰富的饮食，记录可行性与主观感受。' },
  { label: '30 天', en: '30 DAYS', title: '让行动慢慢成为习惯', text: '持续实践并调整计划，关注是否更容易坚持。个人感受和适应速度可能不同。' },
  { label: '长期', en: 'LONG TERM', title: '把选择带进日常生活', text: '长期保持有益的生活方式支持健康。这里呈现习惯选择的科普情景，不预测个人健康结局。' },
];

export const questions = [
  { question: '对 18–60 岁成年人，通常建议每晚至少睡多久？', options: ['5 小时', '6 小时', '7 小时'], answer: 2, explanation: 'CDC 建议该年龄段每晚至少 7 小时。需求因人而异，质量和规律性也很重要。', source: 'sleep' },
  { question: '成年人每周中等强度有氧活动的推荐范围是？', options: ['150–300 分钟', '越多越好，没有上限', '只在周末运动 10 分钟'], answer: 0, explanation: 'WHO 推荐每周 150–300 分钟中等强度有氧活动，或等量高强度活动；也建议肌力训练。少量活动同样有益。', source: 'activity' },
  { question: '关于久坐，哪种说法更准确？', options: ['每天坐 8 小时以内绝对安全', '运动后可以无限久坐', '尽量用活动替代部分久坐'], answer: 2, explanation: 'WHO 建议减少久坐，以任何强度的活动替代久坐。没有一个适用于所有成年人的统一安全时长。', source: 'sedentary' },
  { question: '这份数字人体能告诉你什么？', options: ['未来患病的精确概率', '生活方式相关的科普知识', '真实器官的损伤程度'], answer: 1, explanation: '人体颜色是界面的科普情景编码，动画是教学示意。本平台不测量器官状态，也不做个体疾病预测。', source: 'diet' },
];

export const dietOptions = [
  { value: 'frequent', label: '常喝甜饮 / 外卖', short: '甜饮较多' },
  { value: 'mixed', label: '搭配有待改善', short: '搭配一般' },
  { value: 'balanced', label: '多样搭配 / 水优先', short: '多样饮食' },
];
