# CSS Tokens · 完整文档

> v1.6.4 · PROMPT 46 v1 引用
> 设计依据:`d11-css-tokens-extraction.md` LOCKED(12 类 token)
> 完整 token 见 `05-项目现状/d11-css-tokens-extraction.md`(341 行)

## 1. 颜色 Tokens

### 1.1 Foundation
| Token | HEX | 用途 |
|---|---|---|
| `--bg-page` | `#F4F7FA` | 全站底色 |
| `--bg-hero-mist` | `#F8FBFD` | Hero 微亮 |
| `--surface-base` | `#FAFAFA` | Card / Section base |
| `--surface-overlay` | `rgba(7, 14, 20, 0.X)` | Hero 暗 gradient |

### 1.2 Text
| Token | HEX | 用途 |
|---|---|---|
| `--text-primary` | `#11161B` | 主文字 |
| `--text-secondary` | `#4D5A66` | 副文字 |
| `--text-tertiary` | `#7B8792` | Meta / Hint |
| `--text-inverse` | `#F7FAFC` | Hero 白文字 |
| `--text-quaternary` | `rgba(17, 22, 27, 0.5)` | 占位 |

### 1.3 Layer Palette(v1.3 §2.1.9)
| Token | HEX | 占比 |
|---|---|---|
| `--earth-blue` | `#1A4D7E` | ≤ 3% |
| `--earth-blue-deep` | `#264A73` | ≤ 3% |
| `--earth-blue-subtle` | `#DCECFB` | ≤ 5% |
| `--atmosphere-blue` | `#8EBBEF` | ≤ 3% |
| `--layer-yellow` | `#D8B15C` | ≤ 3% |
| `--layer-red` | `#D96A5F` | ≤ 5% |
| `--success-green` | `#4A8A4A` | ≤ 3% |

### 1.4 Border
| Token | 用途 |
|---|---|
| `--border-hairline` | `rgba(17, 22, 27, 0.08)` 全局细线 |
| `--border-subtle` | `rgba(0, 0, 0, 0.12)` 中等 |
| `--border-strong` | `rgba(0, 0, 0, 0.20)` 强调 |
| `--border-accent` | `var(--earth-blue)` 强调边框 |
| `--focus-ring` | `rgba(26, 77, 126, 0.40)` 焦点圈 |

## 2. 字号 Tokens

### 2.1 Display
| Token | 数值 | 字体 |
|---|---|---|
| `--fs-display-xl` | 120px | Cormorant Garamond Serif |
| `--fs-display-l` | 72px | Cormorant Garamond Serif |
| `--fs-display-m` | 64px | Cormorant Garamond Serif |
| `--fs-display-s` | 48px | Cormorant Garamond Serif |

### 2.2 Heading
| Token | 数值 | 字体 |
|---|---|---|
| `--fs-h2` | 36px | Fraunces Italic Serif |
| `--fs-h3` | 28px | Fraunces Italic Serif |
| `--fs-h4` | 22px | Fraunces Italic Serif |

### 2.3 Body
| Token | 数值 |
|---|---|
| `--fs-body-l` | 18px |
| `--fs-body` | 17px |
| `--fs-body-s` | 14px |

### 2.4 Meta / Caption
| Token | 数值 | 用途 |
|---|---|---|
| `--fs-meta` | 12px | LocationMeta / DistanceNavigation |
| `--fs-caption` | 11px | SectionHeader kicker |
| `--fs-micro` | 9-10px | Footer |

### 2.5 Time
| Token | 数值 | 字体 |
|---|---|---|
| `--fs-time-xl` | 64-80px | JetBrains Mono |
| `--fs-time-l` | 32-42px | JetBrains Mono |
| `--fs-time-m` | 22px | JetBrains Mono |
| `--fs-time-s` | 14-16px | JetBrains Mono |

## 3. 字重 / 行高 / 字间距

### 3.1 字重
| Token | 数值 |
|---|---|
| `--fw-regular` | 400 |
| `--fw-medium` | 500 |
| `--fw-light` | 300 |

### 3.2 行高
| Token | 数值 | 用途 |
|---|---|---|
| `--lh-tight` | 1.0 | Display / Time |
| `--lh-snug` | 1.05 | Display |
| `--lh-normal` | 1.5 | Body 短段 |
| `--lh-relaxed` | 1.65 | Body 长段 |
| `--lh-loose` | 1.85 | 默认 |

### 3.3 字间距
| Token | 数值 | 用途 |
|---|---|---|
| `--ls-tight` | -0.02em | Display |
| `--ls-normal` | 0 | Body / Serif |
| `--ls-meta` | 0.16em | Meta 11-12px |
| `--ls-wide` | 0.18em | Kicker |
| `--ls-xwide` | 0.28em | LogoEn |

## 4. 间距(4px base grid)
| Token | 数值 | 用途 |
|---|---|---|
| `--s-1` | 4px | 最小间距 |
| `--s-2` | 8px | 紧密 |
| `--s-3` | 12px | kicker 下边距 |
| `--s-4` | 16px | 标准 |
| `--s-5` | 20px | 段落 |
| `--s-6` | 24px | 子区域 |
| `--s-7` | 32px | section padding |
| `--s-8` | 40px | 组件间 |
| `--s-9` | 48px | Hero 边距 |
| `--s-10` | 64px | 大章节 |
| `--s-11` | 80px | 章节间距 |
| `--s-12` | 128px | 屏距 |
| `--s-13` | 160px | 大屏分隔 |

## 5. 容器 / 断点
| Token | 数值 |
|---|---|
| `--content-max-width-1440` | 1376px |
| `--content-max-width-1680` | 1616px |
| `--content-max-width-1920` | 1856px |
| `--page-padding-x` | 32px |
| `--header-height` | 72px |
| `--hero-height-detail` | 720px |
| `--hero-height-unknown` | 100vh |

## 6. 字体族
| Token | 值 |
|---|---|
| `--font-display` | `"Cormorant Garamond", "Fraunces", "Songti SC", serif` |
| `--font-editorial` | `"Fraunces", "Songti SC", serif` |
| `--font-sans` | `"Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif` |
| `--font-mono` | `"JetBrains Mono", "SF Mono", Menlo, monospace` |

## 7. Motion
| Token | 数值 | 缓动 | 用途 |
|---|---|---|---|
| `--motion-fast` | 120ms | `cubic-bezier(.22,.61,.36,1)` | Active scale 0.99 |
| `--motion-base` | 220ms | `cubic-bezier(.22,.61,.36,1)` | Hover / Focus |
| `--motion-slow` | 700ms | `ease-out` | Hero scale |
| `--motion-reveal` | 800ms | `ease-out` | Unknown Reveal |

## 8. State / Cursor / Z-index

### 8.1 State
| Token | 数值 | 用途 |
|---|---|---|
| `--state-default-bg` | `transparent` | 默认无底色 |
| `--state-hover-bg` | `var(--bg-hero-mist)` | Hover 浅底色 |
| `--state-focus-ring` | `0 0 0 2px var(--focus-ring)` | 焦点圈 |
| `--state-active-scale` | `scale(0.99)` | Active 按下 |
| `--state-disabled-opacity` | 0.5 | Disabled 半透 |
| `--state-success-color` | `var(--success-green)` 或 `var(--layer-red)` | Success 对勾 |

### 8.2 Cursor
| Token | 数值 |
|---|---|
| `--cursor-pointer` | `pointer` |
| `--cursor-text` | `text` |
| `--cursor-not-allowed` | `not-allowed` |

### 8.3 Z-index
| Token | 数值 | 用途 |
|---|---|---|
| `--z-base` | 1 | 基础 |
| `--z-sticky` | 100 | GlobalHeader |
| `--z-overlay` | 500 | Modal / Tooltip |
| `--z-modal` | 1000 | 全屏 modal |

---

## v1.2 / v1.3 引用关系

✅ **v1.2 VALIDATED**(直接引用):
- `--earth-blue`, `--layer-yellow`, `--layer-red`(v1.3 §2.1.9 对齐)
- `--bg-page`, `--bg-hero-mist`, `--text-primary/secondary/tertiary/inverse`
- `--border-hairline`, `--font-display/editorial/sans/mono`
- `--fs-h1/h3/body/body-s/meta`, `--s-2 ~ s-13`
- `--content-max-width`, `--page-padding-x`, `--header-height`

✅ **v1.3 §2.1.9 增量补完**:
- Layer Palette 3 HEX + 全局规则(≤ 3-5% viewport)
- Earth Blue `#1A4D7E`(深,冷光 + 地球蓝)
- Layer Yellow `#D8B15C`, Layer Red `#D96A5F`

✅ **v1.6.4 first pass 新增**:
- Layer Deep / Subtle / Atmosphere 3 Earth Blue 衍生
- Success Green `#4A8A4A`
- Border subtle / strong / accent
- Overlay 4 种 hero gradient
- Time 系列字号
- Motion 4 档时长

---

## 强约束(per A2 LOCKED)

- ✅ 0 阴影 / 0 大圆角
- ✅ Mono 字体 tabular-nums
- ✅ Layer color ≤ 3-5% viewport
- ✅ 不引入新视觉系统
- ✅ 不引入新依赖

---

## 反馈

完整 token 定义见 `05-项目现状/d11-css-tokens-extraction.md`。任何补充直接修订该源文件。