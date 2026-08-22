/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 A · Reveal 节奏配置
   ------------------------------------------------------------
   - 5 stage Reveal:1(UTC ?) → 2(23° N) → 3(完整坐标) → 4(进入按钮) → 5(城市)
   - 节奏 per spec d10-unknown-coordinate-first-pass.md §2.1
   - 5s / 8s / 12s + 800ms CSS transition
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

/**
 * RevealConfig · 5 stage Reveal 节奏配置。
 *
 * 默认节奏(per spec d10 §2.1):
 * - Stage 1 → Stage 2:5 秒
 * - Stage 2 → Stage 3:8 秒
 * - Stage 3 → Stage 4:12 秒
 * - Stage 4 → Stage 5:用户点击(无自动)
 * - 每个 transition:CSS 800ms
 */
export interface RevealConfig {
  /** Stage 1 → Stage 2 自动推进延迟(ms)*/
  readonly stage1ToStage2Delay: number;
  /** Stage 2 → Stage 3 自动推进延迟(ms)*/
  readonly stage2ToStage3Delay: number;
  /** Stage 3 → Stage 4 自动推进延迟(ms)*/
  readonly stage3ToStage4Delay: number;
  /** 每个 stage 之间的 CSS transition 时长(ms,仅记录,不参与定时器逻辑)*/
  readonly transitionDuration: number;
}

/**
 * DEFAULT_REVEAL_CONFIG · 生产节奏(per spec d10)。
 *
 * 测试时通过 createRevealController(config) 注入更短 delay(100ms 等)
 */
export const DEFAULT_REVEAL_CONFIG: RevealConfig = Object.freeze({
  stage1ToStage2Delay: 5000,
  stage2ToStage3Delay: 8000,
  stage3ToStage4Delay: 12000,
  transitionDuration: 800,
});

/**
 * TEST_REVEAL_CONFIG · 测试用快速节奏(50/80/120ms,生产节奏 / 100)。
 *
 * Phase 2+ 测试可调;不导出到 production build。
 */
export const TEST_REVEAL_CONFIG: RevealConfig = Object.freeze({
  stage1ToStage2Delay: 50,
  stage2ToStage3Delay: 80,
  stage3ToStage4Delay: 120,
  transitionDuration: 8,
});

/**
 * delayForTransition · 计算从当前 stage 推进到下一 stage 的延迟。
 *
 * @returns 下一 stage 的延迟(ms);若已是 stage 5,返回 null(无自动推进)
 */
export function delayForTransition(config: RevealConfig, currentStage: 1 | 2 | 3 | 4): number {
  switch (currentStage) {
    case 1: return config.stage1ToStage2Delay;
    case 2: return config.stage2ToStage3Delay;
    case 3: return config.stage3ToStage4Delay;
    case 4: return null as never; // Stage 4 → 5 由用户点击触发
  }
}