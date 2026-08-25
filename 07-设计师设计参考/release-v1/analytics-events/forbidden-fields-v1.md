---
title: SEE EARTH V1 · Analytics Forbidden Fields · 禁采清单
type: analytics-forbidden-fields
tags: [release-v1, design, d-p0-05, analytics, forbidden, privacy, pii, see-earth]
task_id: D-P0-05
brief_anchor: §4 D-P0-05 / §5 E-P0-05 / Brief §6 不做项
track: design
owner: 外部 Designer Owner（您）
created: 2026-08-22
status: IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
related_docs:
  - ./event-map-v1.md
  - ./trigger-diagram-v1.md
  - ./consent-placement-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/07-设计师设计参考/release-v1/analytics-events/forbidden-fields-v1.md
note: 本文件已就绪，需 PM Agent 由 Obsidian 写入权限落地到 canonical 路径。
---

# SEE EARTH V1 · Analytics Forbidden Fields（禁采清单 + 原因）

> **目的**：把"哪些信息绝对不进入 Analytics payload"逐条列清。每一条都给出**为什么禁**、**在哪里禁**、**如何验证**。这是 E-P0-05（位置隔离）+ E-P0-07（Analytics Instrumentation）的设计端 source of truth。
> **核心原则**：**默认禁**而非"默认开"。任何不在 `event-map-v1.md` 显式枚举的字段，都视为禁采。

---

## 0. 阅读指南

- **类别**：把禁采项分为 5 大类（位置 / 媒体 metadata / 自由文本 / 标识 / 网络与 URL token）。
- **字段**：明确写出"字段名 / payload 路径 / 触发来源"。
- **为什么禁**：引用 Brief / 隐私承诺 / 法规约束。
- **在哪里禁**：前端埋点 SDK 过滤 / 服务端二次过滤 / 静态扫描。
- **如何验证**：E-P0-10（监控基线）+ QA smoke + privacy leak test。

---

## 1. 禁采清单总表（设计端 source of truth）

| # | 类别 | 字段 / 内容 | 为什么禁 | 在哪里禁 | 如何验证 |
|---|---|---|---|---|---|
| F-01 | 精确位置 | `latitude` (number, 浮点) | 精确 GPS 可推断住址 / 工作地，违反 Brief §5 E-P0-05 "公共 API、Analytics、前端 payload、搜索索引、缓存、日志默认不得包含精确经纬度" | 前端埋点 SDK 拒绝 + 服务端 Analytics 接收端 reject | Privacy leak test：扫描所有事件 payload 不含 `lat` / `lng` / `latitude` / `longitude` 字段；扫描公开图片 EXIF |
| F-02 | 精确位置 | `longitude` (number, 浮点) | 同 F-01 | 同 F-01 | 同 F-01 |
| F-03 | 精确位置 | `accuracy_meters` (number) | 即使没有 lat/lng，`accuracy_meters` 也能推断精度范围 | 同 F-01 | Privacy leak test |
| F-04 | 精确位置 | `geojson_polygon` / `geojson_point` | 任何 GeoJSON 都默认精确 | 同 F-01 | Privacy leak test |
| F-05 | 精确位置 | `place_id` (Google/Mapbox) | 第三方 place_id 可反查精确坐标 | 同 F-01 | Privacy leak test |
| F-06 | 原始 EXIF | `exif.gps_latitude` / `exif.gps_longitude` | 原始 EXIF GPS = 精确位置 | EXIF 处理器在 E-P0-03 移除；前端埋点不接收原始 EXIF | Privacy leak test + 公开图片 EXIF 检查 |
| F-07 | 原始 EXIF | `exif.camera_model` / `exif.camera_serial` | 设备指纹 / 反查个人 | 前端埋点 SDK 拒绝接收；服务端 reject | Privacy leak test |
| F-08 | 原始 EXIF | `exif.user_comment` / `exif.description` / `exif.copyright` | 自由文本，可能含 PII | 同 F-07 | Privacy leak test |
| F-09 | 原始 EXIF | `exif.software` / `exif.host_software` | 软件版本可推断设备 | 同 F-07 | Privacy leak test |
| F-10 | 原始 EXIF | `exif.date_time_original`（精确到秒） | 即使事件中已有 `captured_at`，EXIF 的精确到秒的字段可被反查 | 仅保留 `captured_at`（服务端处理后），EXIF 原值不进入 payload | Privacy leak test |
| F-11 | 原始 EXIF | 整张 `exif` 对象 | 含上述所有字段及更多 | EXIF 处理器剥离后再进入埋点链 | Privacy leak test |
| F-12 | 自由文本 | Echo 正文（用户键入） | 用户自由文本可能含姓名 / 邮箱 / 心情 / 故事；隐私敏感且需要独立 moderation | Echo 文本字段属于 P1 Echo backend，独立存储；**埋点链路绝不接触 Echo 正文** | 埋点 payload 关键字扫描：`grep -E 'text|content|body' payload.json` 必须为 0 |
| F-13 | 自由文本 | Witness 短描述（用户键入） | 同 F-12 | Witness 短描述走 Witness backend 独立存储；埋点不携带 | 同 F-12 |
| F-14 | 自由文本 | 用户对 Unknown 的猜测答案 | 用户尝试猜测的内容属于隐私行为 | Unknown backend 独立存储；埋点不携带 | 埋点 payload 关键字扫描 |
| F-15 | 自由文本 | City Detail 评论 / 章节内文本 | V1 无评论系统；任何评论字段视为禁用 | 埋点 SDK 拒绝接收 | 埋点 payload 关键字扫描 |
| F-16 | 自由文本 | 搜索关键词（如果有） | V1 无搜索框；任何 `query` / `keyword` 字段视为禁用 | 埋点 SDK 拒绝接收 | 埋点 payload 关键字扫描 |
| F-17 | 标识 | `user_id` / `uid` / `device_id`（持久） | V1 无登录系统；持久用户标识 = 追踪 | 埋点 SDK 拒绝接收 | Privacy leak test |
| F-18 | 标识 | `email` / `phone` / `mobile` | PII 直接禁采 | 埋点 SDK 拒绝接收 + 服务端 reject | Privacy leak test |
| F-19 | 标识 | `ip_address`（完整 IP） | IP = 半 PII；Analytics payload 默认 hash 或丢弃 | 服务端 Analytics 接收端 hash 后丢弃原始 IP | Privacy leak test |
| F-20 | 标识 | `session_id`（持久跨 session） | 持久 session 标识 = 跨 session 追踪 | 仅在 session 内使用，且埋点 payload 不携带 `session_id`（仅用于前端去重）；session 结束即清除 | Privacy leak test |
| F-21 | 标识 | `cookie_value` / `localStorage` 中的持久键值 | 与持久用户标识等价 | 埋点 SDK 不读取 cookie / localStorage 持久键 | Privacy leak test |
| F-22 | 网络与 URL | 图片 URL 中的签名 token（`?token=...`） | 第三方图床的签名 token 可被滥用 | 埋点 SDK 在 `media_type` 之外**只记录媒体类型，不记录 URL** | Privacy leak test + 静态扫描 |
| F-23 | 网络与 URL | 上传 endpoint URL 完整路径 | endpoint URL 含 submission_id 或 token | 埋点 SDK 只记录 `error_category`，不记录 URL | Privacy leak test |
| F-24 | 网络与 URL | CDN 域名 + path | 第三方 CDN URL 含路径特征可被滥用 | 埋点 SDK 不记录 URL；如需分析图片加载，仅记录 `media_type` + `network_class` | Privacy leak test |
| F-25 | 设备指纹 | `user_agent`（完整 UA 串） | UA 可指纹 | 埋点 SDK 只记录 `app_surface` 枚举（`web_homepage` 等），不发送 UA | Privacy leak test |
| F-26 | 设备指纹 | `screen.width` × `screen.height` 精确值 | 组合后可指纹 | 不记录 | Privacy leak test |
| F-27 | 设备指纹 | `canvas_fingerprint` / `webgl_fingerprint` | 直接指纹 | 不记录 | Privacy leak test |
| F-28 | 网络信息 | `battery.level` / `battery.charging` | 设备状态可指纹 | 不记录；仅 `network_class` 枚举 | Privacy leak test |
| F-29 | 行为细节 | `mouse_path` / `scroll_depth`（精确） | 行为画像可推断身份 | V1 不引入此类事件 | Privacy leak test |
| F-30 | 行为细节 | `click_coordinates`（x, y 精确像素） | 与屏幕尺寸组合可指纹 | 不记录 | Privacy leak test |

> **总数 30 条**。新增禁采项必须更新本表 + PM 评审。

---

## 2. 与 E-P0-05 位置隔离的对齐（强制）

| E-P0-05 强制边界 | 本表覆盖 | 落地方式 |
|---|---|---|
| 公共 API、Analytics、前端 payload、搜索索引、缓存、日志默认不得包含精确经纬度 | F-01 / F-02 / F-03 / F-04 / F-05 | 前端 SDK + 服务端双重 reject；privacy leak test |
| 公共 Moment 仅返回 `public_city_id` 与经批准的城市级展示信息 | `moment_impression` / `moment_opened` 仅含 `city_id`，不含位置 | 埋点 schema 仅暴露 `city_id`，无 `lat/lng` 字段 |
| 精确位置进入独立受限字段或存储域 | `witness_submitted.location_mode` 仅记录来源模式，不记录坐标 | 字段枚举定义在 E-P0-09 锁；埋点 SDK 不接触原始坐标 |
| EXIF 中的 GPS 在公开衍生图中移除 | F-06 / F-07 / F-08 / F-09 / F-10 / F-11 | E-P0-03 EXIF 处理器剥离；埋点链不接收 EXIF |
| 后台查看精确位置必须有明确角色、用途和审计记录 | 与埋点无关；E-P0-05 内部访问控制 | 审计日志（埋点外） |

---

## 3. 与 E-P0-07 Analytics Instrumentation 的对齐（强制）

E-P0-07 在 schema 层必须：

1. **白名单模式**：只允许 `event-map-v1.md §5 字段名一致性矩阵` 中列出的字段出现在 payload 中；其他字段一律 reject。
2. **服务端 reject**：服务端 Analytics 接收端再次过滤，遇到 F-01 ~ F-30 任意字段即丢弃事件 + 告警。
3. **开发环境调试**：开发环境允许工程师临时关闭过滤（仅 dev），但生产环境不可关闭。
4. **测试流量过滤**：Alpha / Beta 流量有 `app_surface = alpha` / `beta` 标记，与生产数据隔离分析。
5. **隐私 QA smoke**：每个 Release Gate 前执行 privacy leak test，扫描所有事件 payload 不含禁采字段。

---

## 4. 隐私边界：哪些字段"看起来像 PII 但可以用"

| 字段 | 看起来像 PII | 实际可用 | 理由 |
|---|---|---|---|
| `edition_id` | 不像 | 是 | 公共标识，与用户无关 |
| `moment_id` | 不像 | 是 | 公共标识 |
| `city_id` | 不像 | 是 | 城市级公开位置（Brief §5 E-P0-05） |
| `source_type` | 不像 | 是 | 来源枚举 |
| `position` (1–12) | 不像 | 是 | Daily 12 槽位 |
| `app_surface` | 不像 | 是 | 入口形态枚举 |
| `entry_point` | 不像 | 是 | 导航入口枚举 |
| `layer` / `section` | 不像 | 是 | City 章节枚举 |
| `unknown_id` | 不像 | 是 | 公共标识 |
| `submission_id` | 像（追踪） | 是（脱敏后） | 必须保留以便 E-P0-03 状态机追踪；但埋点 payload 中可只保留前 8 位 hash 形式；待 E-P0-09 锁 |
| `permission_type` | 不像 | 是 | 权限类型枚举 |
| `result` (permission / echo) | 不像 | 是 | 结果枚举 |
| `media_type` | 不像 | 是 | 媒体类型枚举 |
| `network_class` | 不像 | 是 | 网络分级枚举 |
| `error_category` | 不像 | 是 | 错误分类枚举 |
| `retryable` | 不像 | 是 | bool |
| `location_mode` | 像（位置） | 是（仅模式） | 仅记录"GPS / 手动 / 拒绝"模式，不记录坐标 |
| `captured_at`（如果出现在事件中） | 像（时间可定位） | 限定（仅 Witness 用） | `captured_at` 在 `witness_submitted` 中是后端审计字段，埋点中**只传 ISO timestamp，不含时区 / UTC offset**（避免 timezone 推断位置） |

> **原则**：能脱敏就脱敏；能只传枚举就只传枚举；能服务端聚合就不下发明细。

---

## 5. 关于 `submission_id` 的特殊处理

- `submission_id` 用于 E-P0-03 状态机追踪（`draft / uploading / submitted / under_review / published / rejected / withdrawn / failed`）。
- 在 Analytics payload 中**不传原始 `submission_id`**，仅传 **8 位 hash**（如 `sub_a3f9b2c1`），由 E-P0-07 在服务端 join 时反查。
- Hash 算法建议：服务端用 HMAC-SHA256(`submission_id`, ANALYTICS_SALT)，截断前 8 位 hex。
- 这样既保证漏斗追踪能力，又防止外部通过 submission_id 反查用户。

---

## 6. 验证方法（E-P0-10 + QA smoke）

### 6.1 静态扫描（CI）

- 扫描所有前端代码，匹配禁采字段名（`lat` / `lng` / `latitude` / `longitude` / `exif` / `email` / `phone` 等）。
- 任何匹配必须在白名单注释（`// ALLOWED: ...`）中说明理由。
- 匹配数 > 0 且无白名单注释 → CI 失败。

### 6.2 动态拦截（埋点 SDK）

- 前端埋点 SDK 在 `send()` 前过滤 payload，遇到 F-01 ~ F-30 字段即丢弃该字段（不阻断事件发送，仅丢弃敏感字段）。
- 开发环境可启用 verbose 模式打印被丢弃字段；生产环境静默丢弃 + 上报"field_rejected"埋点事件（**内部审计，不入主埋点流**）。

### 6.3 服务端二次过滤

- Analytics 接收端再次过滤，遇到 F-01 ~ F-30 字段即 reject 整个事件 + 告警。
- 告警 owner = E-P0-10 on-call。

### 6.4 Privacy leak test（每个 Gate 前必跑）

- 在测试环境模拟发送全套 14 个事件的 payload。
- 抓取服务端实际接收的 payload，扫描禁采字段。
- 命中数 = 0 才算通过。

### 6.5 公开图片 EXIF 检查

- 抓取 Daily 12 全部公开图片，用 `exiftool` 检查是否含 GPS / Camera Serial / UserComment。
- 命中数 = 0 才算通过（与 E-P0-05 共享此测试）。

---

## 7. 与 Privacy / Consent 文案的联动

- 用户在 **首次进入 SEE EARTH** 时看到简短 Privacy / Method 摘要（不超过 1 屏）。
- 文案中**明确说明**：
  - 我们记录你看到哪些 Moment / City / Edition（用于改进产品）。
  - 我们**不**记录你的精确位置、邮箱、手机号、设备指纹。
  - Witness 提交时收集的内容仅用于审核 + 公开显示城市级位置；精确位置私密保存。
- 文案原则见 `consent-placement-v1.md`。

---

## 8. 自验收 Acceptance Criteria

- [x] 禁采清单覆盖 Brief §5 E-P0-05 + §4 D-P0-05 + 任务卡 §B.5 全部要求项
- [x] 每条禁采项都有"为什么禁 / 在哪里禁 / 如何验证"
- [x] 与 E-P0-05 位置隔离 5 条强制边界对齐
- [x] 与 E-P0-07 schema 白名单模式对齐
- [x] `submission_id` 等"看起来像 PII 但可以用"的字段有脱敏方案
- [x] 验证方法覆盖静态扫描 / SDK 过滤 / 服务端 reject / leak test / EXIF 检查
- [x] 与 `consent-placement-v1.md` 联动（Privacy 文案明确说明禁采项）

---

**End of Forbidden Fields v1**