/* ============================================================
   看见地球 · v1.6.2 · PROMPT 41 v1 · UniversalSameSecond 组件
   ------------------------------------------------------------
   - 4 屏之 03 · Same Second = Now 横向对比 (V2 Now,Page-internal Module)
   - 3 栏并置 + 1px 极细竖线 + 排除当前城市(spec §3.2.3)
   - 三栏平权:无任何一栏有图
   - layer 色时间:Blue / Red / Yellow 互补
   - Empty State:E_empty 时 hide(无对比)
   ============================================================ */

import type { City, Moment } from '@/types';
import type { CityLayer } from '../hooks/useLayerFromCity';

export interface UniversalSameSecondProps {
  city: City;
  /** 其他城市 + 其 moments 用于横向对比(排除当前 city_id) */
  otherCities: ReadonlyArray<{ city: City; moments: ReadonlyArray<Moment>; layer: CityLayer }>;
}

/**
 * UniversalSameSecond · 屏 03 · Same Second 横向对比。
 *
 * Phase 1 first pass:3 栏骨架 + 时间排版 + layer 标识
 * Phase 2+ 计划:对接 v1.3 §3.2.3 mockup,layer 色时间排版
 */
export function UniversalSameSecond({ city, otherCities }: UniversalSameSecondProps) {
  // 排除当前城市 + 选 3 个(Phase 1 简化:first 3)
  const partners = otherCities.slice(0, 3);

  return (
    <section
      className="universal-same-second"
      data-city={city.identity.city_id}
      data-partners={partners.length}
    >
      <header className="universal-same-second__header">
        <h2 className="universal-same-second__title">Same second, elsewhere</h2>
      </header>
      <div className="universal-same-second__grid">
        {partners.map(({ city: partner, layer }, i) => {
          const t = getPartnerTime(partner);
          return (
            <article
              key={partner.identity.city_id}
              className="universal-same-second__col"
              data-layer={layer}
              data-partner={partner.identity.city_id}
              data-col={i}
            >
              <span className="universal-same-second__name-cn">
                {partner.identity.local_name ?? partner.identity.canonical_name}
              </span>
              <span className="universal-same-second__name-en">
                {partner.identity.canonical_name}
              </span>
              <span className="universal-same-second__country">
                {partner.identity.country_name.toUpperCase()}
              </span>
              <span className="universal-same-second__time">{t}</span>
              <span className="universal-same-second__tz">{partner.identity.timezone}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * getPartnerTime · 城市当前 HH:MM(Intl.DateTimeFormat,DST 安全)。
 */
function getPartnerTime(partner: City): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: partner.identity.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    return '--:--';
  }
}

export default UniversalSameSecond;