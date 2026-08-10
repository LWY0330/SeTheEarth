/* ============================================================
   看见地球 · v2.90.0 · AboutPage · /about
   - 5 section 编辑视角说明：是什么 / 编辑方法 / 数据来源 / 不个性化 / 关于
   - 复用 CityPage 的 numbered-section 风格
   ============================================================ */

import Meta from '@/components/Meta';
import { Link } from '@/router/Router';
import styles from './AboutPage.module.css';

const SECTIONS = [
  {
    no: '01',
    title: '是什么',
    titleEn: 'What is See Earth',
    body: `看见地球是一个编辑视角的地球观察项目。

12 座城市，1 个当下时刻。我们把每一座城市的天气、时区、日出日落、一句编辑观察，摆在同一张页面上。

它不是地图，不是攻略，不是 AI 生成的内容。它更像一本会动的纸面杂志——你打开，就是 2026 年 8 月某一天，地球另一头的一座城市，现在长什么样。`,
  },
  {
    no: '02',
    title: '编辑方法',
    titleEn: 'Editorial Method',
    body: `选城市的标准不是"网红"或"必去"。我们选 12 座能体现"地球多样性"的城市——跨大洲、跨时区、跨文化。

每个城市配 4 张不同时段的图：morning / afternoon / evening / night，由编辑在不同时段采拍或挑选。

每一句"编辑观察"由编辑本人写，不是 AI 生成。文字以"诗性观察"为目标，避免"旅游攻略"语气。

数据层全部接真实 API——Open-Meteo 拿天气、sunrise-sunset.org 拿日出日落、Intl.DateTimeFormat 拿时区。`,
  },
  {
    no: '03',
    title: '数据来源',
    titleEn: 'Data Sources',
    body: `weather    Open-Meteo    https://open-meteo.com/   CC BY 4.0, 免费非商用
sun    sunrise-sunset.org   https://sunrise-sunset.org/   公共 API, 无 key
timezone    浏览器原生 Intl.DateTimeFormat   无第三方依赖
cities    编辑整理, 参考 Wikipedia / 各国家地区官方资料
images    Unsplash 摄影师授权   https://unsplash.com/license`,
    isPre: true,
  },
  {
    no: '04',
    title: '我们不做什么',
    titleEn: "What we don't do",
    body: `不收集 cookie。
不收集用户行为。
不建用户画像。
不推送通知。
不"为你推荐"。
不"智能排序"。

你看到的首页和别人一样。同一时刻的京都，对所有人是同一个京都。

没有"我的关注城市"。没有"收藏"。没有"评论"。

这是一份编辑视角的内容产品，不是一个用户增长工具。`,
  },
  {
    no: '05',
    title: '关于',
    titleEn: 'About',
    body: `独立项目。1 人编辑。

如果你有反馈、勘误、合作意向，可以发邮件到 hello@see-earth.com。

源代码与数据在 GitHub 公开：
https://github.com/lwy0330/SeTheEarth

最后更新于 2026 年 8 月。`,
  },
];

export function AboutPage() {
  return (
    <div className={styles.page}>
      <Meta
        title="关于 · 看见地球"
        description="看见地球是一个编辑视角的地球观察项目。12 座城市，1 个当下时刻。"
        ogType="website"
        canonicalPath="/about"
      />

      {/* 顶部导航 */}
      <header className={styles.nav}>
        <Link href="/" className={styles.navBack}>
          <span aria-hidden="true">←</span> 返回 See Earth
        </Link>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroKicker}>ABOUT</span>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroTitleZh}>关于看见地球</span>
          <span className={styles.heroTitleEn}>About See Earth</span>
        </h1>
        <p className={styles.heroLede}>一份编辑视角的地球观察。</p>
      </section>

      {/* 5 sections */}
      {SECTIONS.map((s) => (
        <section key={s.no} className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>{s.no}</span>
            <h2 className={styles.sectionTitle}>{s.title}</h2>
            <span className={styles.sectionHint}>{s.titleEn}</span>
          </header>
          {s.isPre ? (
            <pre className={styles.pre}>{s.body}</pre>
          ) : (
            s.body.split('\n\n').map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))
          )}
        </section>
      ))}

      {/* 底部 */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLink}>
          <span aria-hidden="true">↑</span> 回到 See Earth 主页
        </Link>
      </footer>
    </div>
  );
}

export default AboutPage;
