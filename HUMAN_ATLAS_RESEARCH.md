# Human Atlas 脊柱交互研究与实现

研究仓库：https://github.com/ashemag/human-atlas ，浅克隆于 C:\GitHubResearch\repos\human-atlas。

已读取 app/scene.tsx 第86–127行、app/explosion-layout.ts、README.md 与 LICENSE。

- scene.tsx 86–95：PointerTap区分拖动和点击；Raycaster先用包围盒筛选，随后用独立拾取网格选择部件。
- scene.tsx 104–115：可见系统/选中ID形成可见部件集合；平移、显示与高亮分别控制。几何保持静态，通过平移形成拆解效果。
- explosion-layout.ts 4–13：按部件投影宽高分配独立格子，避免完整展开后挤压；仅处理当前可见部件。
- scene.tsx 119–123：隔离后依据选中部件包围盒与可用窗口自动适配镜头。

本项目独立实现13个腰段结构的真实网格探索，数据从已有.asset-source按ID提取，无额外网格简化，保留原坐标和来源概念ID。拆解只平移网格；姿势比较使用单独教学关节链。

源部件：L1–L5腰椎5枚、各腰椎下方椎间盘5件、骶骨1件、左右髋骨2件。数据提取脚本 scripts/prepare-spine.mjs，输出public/models/spine.json与spine.bin。总27075顶点、34550三角形、901968字节。提取时检查索引不越界、顶点有限、必需ID存在。

许可：Human Atlas代码 LICENSE 为MIT，Copyright (c) 2026 ashemag；几何数据为BodyParts3D 4.0，CC BY4.0，与代码许可分开。没有复制其代码实现；几何沿用已有数据与署名，见public/models/ATTRIBUTION.md及UPSTREAM-ATTRIBUTION.md。

当前增强：搜索部件、具体椎骨高亮、隔离观察、隐藏/显示、标签、视角切换、镜头适配、截图和拆解复原。实体制造与姿势受力计算未在本轮实现。
