# GitHub 交互与三维科学实现研究

> 研究对象是开源项目的交互、相机和工程实现，不把 GitHub 代码当作医学证据。本文只记录实际读取过的仓库文件、提交和测试结果。

## 研究范围与方法

本轮先通过 GitHub API 获取当前账号信息，再检索并核对五个候选：`ashemag/human-atlas`、`sheevu/human-body-atlas`、`pmndrs/drei`、`mrdoob/three.js`、`followorbounce/anatomy-explorer`。对 sheevu、drei 和 three.js 做了浅克隆，对 followorbounce 做了浅克隆；现有 Human Atlas 克隆位于 `C:\GitHubResearch\repos\human-atlas`。

研究重点是当前项目需要的三个问题：点击结构后的反馈、相机平滑聚焦与边界适配、不同身体视图或动作的表达方式。研究时间点与仓库元数据以本轮 GitHub 返回为准；GitHub 的未来时间戳可能随服务环境变化，提交 SHA 比日期更适合复核。

## 五个候选比较

| 候选 | 关注点与适用性 | Stars / 最近提交 | 许可 | 测试与验证 | 结论 |
|---|---|---:|---|---|---|
| [ashemag/human-atlas](https://github.com/ashemag/human-atlas) | 2,234 个可选择 BodyParts3D 网格、系统筛选、搜索、拆解与隔离；与本项目真实脊柱资产最接近 | 4,205；`1c38bf3`，2026-09-06 | 软件 MIT；数据保留 CC BY 4.0 | 实际读 `scripts/validate-atlas.mjs`、`validate-interactions.mjs`；本轮未运行其构建/浏览器测试 | **最值得借鉴交互结构**，本项目已经借鉴了选取、拆解、边界检查思路 |
| [sheevu/human-body-atlas](https://github.com/sheevu/human-body-atlas) | React Three Fiber 全身器官 explorer，选择后聚焦、淡化周围模型、描述浮层、响应式控制 | 0；`9b8c2fe`，2026-10-10 | README称软件继承代码未重新许可；GLB 为 CC BY-SA 2.1 Japan 来源镜像条件 | `tests/anatomy-assets.test.mjs` 12项通过；GitHub Actions 执行 npm test/build；无 release，1 个开放 issue | 可借鉴选中/悬停材质反馈与相机插值；**不复制模型或许可不清的代码** |
| [pmndrs/drei](https://github.com/pmndrs/drei) | React Three Fiber 通用相机、边界、动画与控制器抽象 | 9,935；`bf6f4ad`，2026-09-30；release v10.7.9 | MIT | `test/e2e/snapshot.test.ts`；package 有 eslint/typecheck/Playwright e2e；81 个开放 issue | **最适合借鉴相机边界 API 思路**，但当前项目是 plain Three，不必为一个功能迁移整套栈 |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | Three.js 核心、GLTF 动画、AnimationMixer 与示例级动作切换 | 116,318；`3995acf`，2026-10-12；release r186 | MIT | 核心 lint、unit、addons、e2e 脚本；252 个开放 issue | **动作播放的底层参考**，适合未来有真实 skinned body 时使用 AnimationMixer |
| [followorbounce/anatomy-explorer](https://github.com/followorbounce/anatomy-explorer) | 原生 Three.js、BodyParts3D 系统二进制数据、逐器官点击、相机 focusOn、血流/神经可视化 | 0；`c59ec4e`，2026-10-08 | 本轮未在读取范围内核实 LICENSE，标记未验证 | 无可见自动测试目录或 CI（本轮未验证） | 可借鉴轻量 raycast、拖拽防误点击、系统级动作图形；**许可与工程验证不足，不直接复制** |

Stars、最近提交、开放 issue 和 release 信息来自本轮 GitHub API 查询；没有把 README 宣称的浏览器测试当成当前项目的实测结果。

## 1. Human Atlas：部件选择、拆解与交互验证

### Purpose

`ashemag/human-atlas` 将 BodyParts3D 组织为可选择的真实网格，支持系统筛选、搜索、隔离和 exploded view。README 明确描述了“2,234 individually selectable meshes”和“15 anatomical systems”，并提醒个别概念可能对应多个源网格（README.md:1-14, 38-44）。

### Tech stack 与配置

`package.json` 使用 React 19、Three.js 0.159、Vite 8、TypeScript 5.9，并提供 `npm run check`、`node scripts/validate-atlas.mjs`、`node scripts/validate-interactions.mjs`、`npm run build`（package.json:5-13, 24-54）。

### License

仓库 `LICENSE` 是软件 MIT（LICENSE:1-21），README 另行说明解剖数据 CC BY 4.0、需要保留署名（README.md:60-64）。两者不能混为同一许可。

### Maintenance 与验证

本轮 API 返回最近提交 `1c38bf35c254a891200d3cedecfd57abebe83d8d`，无 release，开放 issue 19 个（API仓库总数49包括PR）。本轮未运行该仓库测试；实际读 `scripts/validate-atlas.mjs:1-12`，检查2234部件、concept映射、索引范围、有限顶点和二进制长度。`validate-interactions.mjs` 还验证 exploded layout、搜索/检查契约和 tap/drag/multitouch 语义（该文件:7-41）。

### Worth borrowing

- 真实部件点击后显示明确选中状态，隔离和拆解是同一结构状态的不同视图。
- 当前项目可以继续采用“可读中文标签 + 学术信息折叠”，把专业 ID 留在 details 内。
- 父项目的装配任务应继续坚持 pointer tap 与 drag 分离；Human Atlas 的交互测试明确把拖动不算成点击（`validate-interactions.mjs:34-40`）。

### Do not copy

不要复制其全身数据到青年久坐页面。当前作品已经根据主题缩到颈肩、腰背、骨盆、髋部与下肢，完整器官系统会重新分散主线。也不要把几何拆解当作真实人体分离或受力结果。

## 2. sheevu/human-body-atlas：选中反馈与平滑聚焦

### Purpose 与限制

README 将它定位为 React、TypeScript、Three.js、React Three Fiber 和 Vite 的交互器官查看器（README.md:1-7）。它有选择、悬停、搜索、系统筛选、隔离和相机控制（README.md:29-40），但覆盖的是十个合并器官组和胸腔骨骼，README 明确说 skeleton 不是完整骨骼（README.md:44-52）。

### 具体源码证据

`src/components/anatomy/ExplorerScene.tsx:46-61` 在选中或悬停时设置 material color/emissive，并给未选对象设置 opacity；`ExplorerScene.tsx:62-68` 用 `event.delta > 5` 排除旋转拖动造成的误点击。这个模式适合当前项目的三维结构选择：选择后蓝色高亮，周边轻度降权，拖动相机不触发安装。

`ExplorerScene.tsx:75-104` 将目标相机位置和 OrbitControls target 存为 refs，用 `1 - Math.exp(-dt * 10)` 做帧率无关的平滑 lerp，并在 `prefers-reduced-motion` 时直接完成动画；controls 的 `onStart` 会取消正在进行的 focus。这是当前 `TeachingBody`/真实脊柱镜头可借鉴的可用模式。

### License / issues

本轮目录与 LICENSE glob 核验未发现根目录软件 LICENSE，仅有模型来源许可文件。README 明确说随附衍生 GLB 保留 CC BY-SA 2.1 Japan 条件，且没有重新给继承应用代码授权（README.md:54-60）。本轮 API 返回无 release、1 个开放 issue；GitHub Actions 执行 asset test 和 production build。不能把其软件 MIT 直接推导成所有模型均可按 MIT 使用。

### Worth borrowing / Do not copy

借鉴材质高亮、周边淡化、选中浮层和镜头插值。不要复制其器官/胸腔模型到当前作品，也不要使用它来推断久坐的医学影响；代码实现证据不是医学证据。

## 3. pmndrs/drei：可复用的相机边界模型

### Purpose 与配置

Drei 是 React Three Fiber 的通用 helpers 集合，README:10-19 说明它面向 R3F，并使用独立 `three-stdlib`。`package.json:16-19,32-47` 给出 MIT 许可、build/test/typecheck/Playwright 脚本以及发布配置。本轮 release API 返回 v10.7.9；最近提交为 `bf6f4ad...`；开放 issue 81 个。

### 具体源码证据

`src/core/Bounds.tsx:13-27` 的 API 直接暴露 `refresh`、`reset`、`moveTo`、`lookAt`、`fit` 和 `clip`，适合把“点击结构后自动聚焦”设计成一个稳定命令接口。

`Bounds.tsx:111-123` 从 Box3 计算中心、尺寸和相机距离，并同时考虑垂直与水平视野；`Bounds.tsx:271-301` 监听 controls start、处理 resize，并在需要时 refresh/reset/fit。更关键的是 `Bounds.tsx:303-341` 用受控的 start/active 状态、delta、插值函数、camera position lerp 和 quaternion slerp 更新相机，完成后再把 controls target 对齐。当前项目可以借鉴这一生命周期：focus 开始时解除拖动抢占，动画结束后恢复 target，窄屏重新 fit。

### Tests 与风险

`test/e2e/snapshot.test.ts:27-39` 使用 Playwright 等待 R3F 事件并截图 canvas；`package.json:39-40` 还规定 eslint、typecheck、prettier。GitHub issue #2867 记录 React 19 StrictMode 下 Drei `Html` 的同步 unmount 警告；因此如果当前作品未来引入 Html，不应只看成功渲染，还要验证 StrictMode cleanup。

### Worth borrowing

只借鉴 Bounds 的接口思想和相机数学；当前项目已经是 plain Three，继续用本地 `Box3`、`PerspectiveCamera` 和 OrbitControls 可以避免引入 R3F 迁移成本。

## 4. mrdoob/three.js：动画与视图基础

### Purpose 与配置

Three.js 是通用 JavaScript 3D 库（README.md:9-24）。本轮源码为提交 `3995acf...`，release r186，MIT 许可（package.json:1-7, 44-65, 90-93；LICENSE:1-21）。Stars 116,318，开放 issue 252 个。

### 具体源码证据

`examples/webgl_animation_skinning_morph.html:133-169` 创建 AnimationMixer，为每个 animation clip 创建 action，并把 states 与 emotes 分开；`examples/...:150-155` 对一次性动作设置 `clampWhenFinished` 和 `LoopOnce`；`examples/...:227-243` 用 fadeOut/fadeIn 切换动作；`examples/...:258-266` 用 timer delta 驱动 mixer.update。这是“起身—走动—坐回”的正确底层思路，但前提是有带骨骼动画的 skinned body，而当前项目真实网格是静态部件，不能伪装成已有动作捕捉。

### Worth borrowing / Do not copy

未来获得合适授权的动作模型后，可采用 Idle/Walking/Standing 等 action、短 cross-fade 和 reduced-motion 分支。当前版本继续用区域刚体近似和辅助轮廓即可，不要对静态椎骨网格硬套 AnimationMixer，也不要把动作 clip 名称解释成健康改善。

## 5. followorbounce/anatomy-explorer：原生 Three 的轻量选择

### Purpose 与源码

README 未提供在本轮读取范围内的完整说明；目录包含 `js/app.js`、按系统划分的 `.bin` 数据和 Python 构建工具。本轮 API 最近提交 `c59ec4e...` 的提交说明增加男女身体切换、髋骨和髌骨修复，软件 release 未发现，stars 0，开放 issue 0；仓库未在本轮核实 LICENSE，许可标记为**未验证**。

`js/app.js:383-405` 使用 Raycaster、筛掉不可见网格，并通过 `pointerdown` 与 click 位移差排除拖动误选；`app.js:407-428` 将 hover raycast 限制为每帧一次，降低大量 mesh 下的鼠标移动成本；`app.js:442-479` 用 geometry bounds 计算中心、最大尺寸和相机距离，实现 focusOn；`app.js:613-625` 的 rig sprite 用 `lerpVectors` 做简短可视化动画。这些是 plain Three 可直接理解的轻量模式。

### Worth borrowing / Do not copy

可借鉴 tap-versus-drag 判断、hover raycast 节流、geometry bounding box 聚焦和小型状态动画。由于本轮没有核实许可、测试和可复现构建，不复制其数据或代码到比赛作品；其动作/血流表达也不是久坐医学证据。

## 可复核的固定提交源码链

- [sheevu 选取/高亮与平滑相机](https://github.com/sheevu/human-body-atlas/blob/9b8c2fe17183bb0ee8b66f2fdac4a987351fe9dc/src/components/anatomy/ExplorerScene.tsx#L46-L104)
- [Drei Bounds边界、控制器中断与插值](https://github.com/pmndrs/drei/blob/bf6f4addf47467d3885de272d94ca5127f6ef68f/src/core/Bounds.tsx#L271-L341)
- [Three.js 动作切换](https://github.com/mrdoob/three.js/blob/3995acf2a9e79ebd2b02c0e9e7f820fa2a4838fb/examples/webgl_animation_skinning_morph.html#L133-L266)
- [Human Atlas真实部件picking与可见布局](https://github.com/ashemag/human-atlas/blob/1c38bf35c254a891200d3cedecfd57abebe83d8d/app/scene.tsx#L86-L127)
- [原生Three拖动误选排除与hover节流](https://github.com/followorbounce/anatomy-explorer/blob/c59ec4e870435e8db8c0e6ff95ef8b02351d4b33/js/app.js#L383-L428)

## 针对当前项目的明确结论

### UI 点击反馈

采用三层反馈：

1. pointerdown/up 位移小于阈值才算点击，旋转和拖放不误触。
2. hover 使用轻度 emissive/边界提示，选中结构使用蓝色或青色高亮，未选结构只轻度淡化。
3. 右侧或下方立即给出一句通俗说明，并保留键盘按钮作为三维目标的可访问替代。

这个组合分别由 sheevu 的 `ExplorerScene.tsx:46-68`、followorbounce `app.js:397-428` 和 Human Atlas `validate-interactions.mjs:34-40` 提供实现证据。

### 相机平滑 focus

对选中部件计算 `Box3` 的中心和尺寸，按当前 aspect 与 FOV 计算距离；将 camera position 和 controls target 分开作为目标值，使用 `1 - exp(-dt*k)` 或 delta 归一化插值。用户开始旋转时立即清除 focus 动画；窄屏 resize 重新计算 fit。证据来自 Drei `Bounds.tsx:111-123, 271-341` 与 sheevu `ExplorerScene.tsx:75-104`。

### 不同 full-body 动作视图

应区分三种层级：

- 静态全身热点：适合首页，明确只显示骨骼/肌肉和学习区域。
- 局部真实腰段姿态：适合03坐姿比较和02结构安装，采用透明说明的刚体近似。04/05当前用独立的关节式三维教学轮廓表示活动，避免三页反复显示同一局部骨架。
- 真正的全身动作：只有获得带骨骼动画且许可清晰的模型后，才使用 Three.js AnimationMixer 的 clip/fade/loop 机制（`webgl_animation_skinning_morph.html:133-169, 227-266`）。

当前项目不应为了视觉冲击加入大脑、心脏、肺、消化系统，也不应把静态骨骼的颜色动画描述为病理退化或恢复。

## 可复用性与许可清单

- `human-atlas` 软件代码 MIT；其 BodyParts3D 数据署名和数据许可必须单独保留。
- `sheevu/human-body-atlas` 本轮未发现根目录软件 LICENSE，README未重新许可继承代码；随附 GLB 保留 CC BY-SA 2.1 Japan 条件。当前项目不直接复制。
- `drei` 和 `three.js` MIT，复制实质代码仍需保留版权与许可声明；当前项目更适合借鉴算法结构。
- `followorbounce/anatomy-explorer` 许可本轮未验证，不复制。
- 任何 GitHub 项目的 README、issue 或源码都不能替代医学、人体运动或健康风险证据。当前项目的健康表述应继续使用权威公共卫生来源与明确的教学示意边界。

## 研究限制

本轮没有做完整浏览器截图或真实设备性能测量；仓库的浏览器测试只说明各自仓库的测试命令/报告，不能当作当前 `future-you` 的 WebGL 验收。GitHub 搜索和元数据是外部数据，报告中的结论限于实际读取的文件、行号和 API 返回内容。
