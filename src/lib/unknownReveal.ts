/* ============================================================
   看见地球 · v1.6.3 · PROMPT 43 v1 任务 A · Reveal 引擎
   ------------------------------------------------------------
   - 5 stage Reveal 状态机(setTimeout 5/8/12s 自动推进)
   - 用户 hover 暂停,停止 hover 恢复,点击重置
   - 订阅者模式:onRevealStageChange(callback)
   - 手动覆盖:advance(stage) for PM 评审
   - 0 依赖(setTimeout + 纯 TS)
   - 不动业务文件;不改 Phase 0/1/2 类型
   ============================================================ */

import {
  DEFAULT_REVEAL_CONFIG,
  delayForTransition,
  type RevealConfig,
} from './unknownReveal.config.ts';

/**
 * RevealStage · 5 阶段(per spec d10 §2.1)
 *
 * - Stage 1: UTC ?(仅时间 + 温度)
 * - Stage 2: 23° N · 102° W(粗坐标)
 * - Stage 3: 23.6345° N · 102.5528° W(精确坐标)
 * - Stage 4: 进入此刻 →(按钮)
 * - Stage 5: MEXICO CITY(城市出现)
 */
export type RevealStage = 1 | 2 | 3 | 4 | 5;

/**
 * RevealState · 引擎状态快照。
 */
export interface RevealState {
  stage: RevealStage;
  isPaused: boolean;
  isRunning: boolean;
}

/**
 * RevealListener · 状态变化回调。
 */
export type RevealListener = (state: RevealState) => void;

/**
 * RevealController · 引擎接口(createRevealController 返回值)。
 */
export interface RevealController {
  /** 启动自动 Reveal(从 stage 1 开始) */
  start(): void;
  /** 暂停(用户 hover 时调用) */
  pause(): void;
  /** 恢复(用户停止 hover) */
  resume(): void;
  /** 重置(回到 stage 1) */
  reset(): void;
  /** 手动跳转到指定 stage(PM 评审用) */
  advance(stage: RevealStage): void;
  /** 当前状态 */
  getState(): RevealState;
  /** 订阅状态变化,返回 unsubscribe 函数 */
  subscribe(listener: RevealListener): () => void;
  /** 销毁(清除定时器 + 订阅者) */
  destroy(): void;
}

/**
 * createRevealController · 工厂函数。
 *
 * 返回独立的 controller 实例(可创建多个,各自管理)。
 * 不动业务文件;不改 Phase 0/1/2 类型。
 */
export function createRevealController(
  config: RevealConfig = DEFAULT_REVEAL_CONFIG,
): RevealController {
  let state: RevealState = {
    stage: 1,
    isPaused: false,
    isRunning: false,
  };
  const listeners = new Set<RevealListener>();
  let timerId: ReturnType<typeof setTimeout> | null = null;

  /**
   * notify · 通知所有订阅者。
   */
  function notify(): void {
    for (const listener of listeners) {
      listener(state);
    }
  }

  /**
   * setState · 更新状态 + 通知。
   */
  function setState(next: Partial<RevealState>): void {
    state = { ...state, ...next };
    notify();
  }

  /**
   * scheduleAdvance · 调度下一 stage 自动推进。
   *
   * 注意:使用 setState 内的 stage 值,避免闭包陷阱。
   */
  function scheduleAdvance(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (!state.isRunning || state.isPaused) return;
    if (state.stage === 5) return; // 终态

    const delay = delayForTransition(config, state.stage as 1 | 2 | 3 | 4);
    if (delay === null || delay === undefined) return;

    timerId = setTimeout(() => {
      // 用 state.stage 而非闭包变量(可能在等待中被 advance 修改)
      const currentStage = state.stage;
      if (currentStage >= 5) return;
      setState({ stage: (currentStage + 1) as RevealStage });
      // 继续推进下一 stage
      if (state.stage < 5 && !state.isPaused && state.isRunning) {
        scheduleAdvance();
      }
    }, delay);
  }

  return {
    start(): void {
      if (state.isRunning) return; // 防止重复启动
      setState({ isRunning: true, isPaused: false });
      scheduleAdvance();
    },

    pause(): void {
      if (!state.isRunning) return;
      if (state.isPaused) return; // 防止重复暂停
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      setState({ isPaused: true });
    },

    resume(): void {
      if (!state.isRunning || !state.isPaused) return;
      setState({ isPaused: false });
      scheduleAdvance();
    },

    reset(): void {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      setState({ stage: 1, isPaused: false, isRunning: false });
    },

    advance(stage: RevealStage): void {
      // 手动覆盖:清除 timer,直接跳到目标 stage
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      setState({ stage });
      // 若 isRunning 且 stage < 5 且 未暂停,继续自动推进
      if (state.isRunning && !state.isPaused && state.stage < 5) {
        scheduleAdvance();
      }
    },

    getState(): RevealState {
      return { ...state };
    },

    subscribe(listener: RevealListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    destroy(): void {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      listeners.clear();
      state = { stage: 1, isPaused: false, isRunning: false };
    },
  };
}