/* ============================================================
   v1.6.3 · unknownReveal 引擎测试
   - 18 测试覆盖 5 阶段状态机 + 暂停/恢复/重置 + 订阅 + 边界
   - 使用 TEST_REVEAL_CONFIG 加速测试(50/80/120ms)
   ============================================================ */

// @ts-ignore -- node:test 类型声明缺失
import { test } from 'node:test';
// @ts-ignore -- node:assert/strict 类型声明缺失
import assert from 'node:assert/strict';
import {
  createRevealController,
  type RevealState,
  type RevealStage,
} from './unknownReveal.ts';
import {
  TEST_REVEAL_CONFIG,
  DEFAULT_REVEAL_CONFIG,
  delayForTransition,
} from './unknownReveal.config.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('createRevealController · 初始状态 stage=1, not running, not paused', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const s = c.getState();
  assert.equal(s.stage, 1);
  assert.equal(s.isRunning, false);
  assert.equal(s.isPaused, false);
  c.destroy();
});

test('start · 启动后 isRunning=true,订阅者收到通知', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const events: RevealState[] = [];
  c.subscribe((s) => events.push({ ...s }));
  c.start();
  assert.equal(c.getState().isRunning, true);
  assert.ok(events.length >= 1);
  c.destroy();
});

test('start · 5/8/12s 自动推进(测试用 50/80/120ms)', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const stages: RevealStage[] = [];
  c.subscribe((s) => stages.push(s.stage));
  c.start();

  await sleep(60); // > stage1ToStage2Delay(50)
  assert.equal(c.getState().stage, 2);

  await sleep(90); // > stage2ToStage3Delay(80) total ~150
  assert.equal(c.getState().stage, 3);

  await sleep(140); // > stage3ToStage4Delay(120) total ~290
  assert.equal(c.getState().stage, 4);

  c.destroy();
});

test('pause · 暂停后定时器清除,stage 不再推进', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  await sleep(30); // partway through stage1ToStage2Delay
  c.pause();
  assert.equal(c.getState().isPaused, true);
  const stageAtPause = c.getState().stage;

  await sleep(200); // 远超过 stage1ToStage2Delay
  assert.equal(c.getState().stage, stageAtPause, 'paused 后 stage 不变');
  c.destroy();
});

test('resume · 恢复后从暂停 stage 继续推进', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  await sleep(30);
  c.pause();
  const stageAtPause = c.getState().stage;
  c.resume();
  assert.equal(c.getState().isPaused, false);

  await sleep(80); // 足够让 stage 1 → 2 推进
  assert.ok(c.getState().stage > stageAtPause, 'resume 后 stage 推进');
  c.destroy();
});

test('reset · 重置回 stage=1, isRunning=false', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.advance(3);
  c.reset();
  assert.equal(c.getState().stage, 1);
  assert.equal(c.getState().isRunning, false);
  c.destroy();
});

test('advance · 手动跳转到任意 stage', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.advance(4);
  assert.equal(c.getState().stage, 4);
  c.advance(5);
  assert.equal(c.getState().stage, 5);
  c.destroy();
});

test('advance · 跳到 stage 5 后不再自动推进', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.advance(5);
  await sleep(200);
  assert.equal(c.getState().stage, 5, 'stage 5 是终态');
  c.destroy();
});

test('subscribe · 状态变化时通知所有订阅者', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  let count1 = 0;
  let count2 = 0;
  c.subscribe(() => count1++);
  c.subscribe(() => count2++);
  c.start();
  c.advance(2);
  c.pause();
  assert.ok(count1 >= 3, `count1 应 >= 3,actual=${count1}`);
  assert.ok(count2 >= 3, `count2 应 >= 3,actual=${count2}`);
  c.destroy();
});

test('subscribe · unsubscribe 函数正确移除订阅', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  let count = 0;
  const unsub = c.subscribe(() => count++);
  c.start();
  const afterStart = count;
  unsub();
  c.advance(3);
  assert.equal(count, afterStart, 'unsub 后不再收到通知');
  c.destroy();
});

test('start · 重复启动不重复推进', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.start(); // 重复
  c.start(); // 重复
  await sleep(60);
  assert.equal(c.getState().stage, 2, '不应推进到 stage 3');
  c.destroy();
});

test('pause · 未启动时 pause 是 no-op', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.pause(); // 未 start
  assert.equal(c.getState().isPaused, false);
  c.destroy();
});

test('pause · 重复 pause 不重置状态', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.pause();
  c.pause(); // 重复
  assert.equal(c.getState().isPaused, true);
  c.destroy();
});

test('reset · 重置后再次 start 从 stage 1 重新开始', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  await sleep(60);
  c.reset();
  c.start();
  await sleep(60);
  assert.equal(c.getState().stage, 2);
  c.destroy();
});

test('getState · 返回对象副本,不影响内部状态', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const s1 = c.getState();
  // mutate 副本对象
  (s1 as { stage: number }).stage = 99;
  const s2 = c.getState();
  assert.equal(s2.stage, 1, 'getState 返回副本,不影响内部');
  c.destroy();
});

test('destroy · 清除定时器 + 订阅者,后续操作无效', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  let count = 0;
  c.subscribe(() => count++);
  c.destroy();
  c.start(); // 应该 no-op(已销毁)
  c.advance(2);
  assert.equal(count, 0, 'destroy 后订阅者不收到通知');
  c.destroy();
});

test('delayForTransition · 各阶段延迟正确', () => {
  assert.equal(delayForTransition(DEFAULT_REVEAL_CONFIG, 1), 5000);
  assert.equal(delayForTransition(DEFAULT_REVEAL_CONFIG, 2), 8000);
  assert.equal(delayForTransition(DEFAULT_REVEAL_CONFIG, 3), 12000);
});

test('DEFAULT_REVEAL_CONFIG · 锁定 5/8/12s + 800ms', () => {
  assert.equal(DEFAULT_REVEAL_CONFIG.stage1ToStage2Delay, 5000);
  assert.equal(DEFAULT_REVEAL_CONFIG.stage2ToStage3Delay, 8000);
  assert.equal(DEFAULT_REVEAL_CONFIG.stage3ToStage4Delay, 12000);
  assert.equal(DEFAULT_REVEAL_CONFIG.transitionDuration, 800);
  assert.equal(Object.isFrozen(DEFAULT_REVEAL_CONFIG), true);
});

test('TEST_REVEAL_CONFIG · 测试用快速节奏', () => {
  assert.ok(TEST_REVEAL_CONFIG.stage1ToStage2Delay < 1000);
  assert.equal(Object.isFrozen(TEST_REVEAL_CONFIG), true);
});

// ─── 边缘 case 补全 ───

test('start · 启动后 stage 从 1 自动推进(不阻塞)', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const stages: number[] = [];
  c.subscribe((s) => stages.push(s.stage));
  c.start();
  await sleep(300); // 足够全部推进
  assert.ok(stages.length >= 4, '订阅者收到 >= 4 次通知');
  c.destroy();
});

test('pause · 暂停 0 次仍是 running=true', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  assert.equal(c.getState().isPaused, false);
  assert.equal(c.getState().isRunning, true);
  c.destroy();
});

test('advance · 跳到 stage 1 重置位置(不变化)', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.advance(3);
  c.advance(1);
  assert.equal(c.getState().stage, 1);
  c.destroy();
});

test('advance · 跳到 stage 5 后 start 状态保留', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  c.advance(5);
  assert.equal(c.getState().stage, 5);
  // 即使 running=true,stage 5 是终态,不再自动推进
  assert.equal(c.getState().isRunning, true);
  c.destroy();
});

test('reset · 不启动时 reset 不报错', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.reset(); // no-op
  assert.equal(c.getState().stage, 1);
  c.destroy();
});

test('subscribe · destroy 后订阅者不接收任何通知', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  let count = 0;
  c.subscribe(() => count++);
  c.destroy();
  // destroy 后,不应有任何调用
  assert.equal(count, 0);
  c.destroy();
});

test('getState · 5 stage 全部返回 stage 字段正确', () => {
  for (const s of [1, 2, 3, 4, 5] as const) {
    const c = createRevealController(TEST_REVEAL_CONFIG);
    c.start();
    c.advance(s);
    assert.equal(c.getState().stage, s, `advance(${s}) 应设置 stage=${s}`);
    c.destroy();
  }
});

test('delayForTransition · TEST_REVEAL_CONFIG 锁定 50/80/120ms', () => {
  assert.equal(delayForTransition(TEST_REVEAL_CONFIG, 1), 50);
  assert.equal(delayForTransition(TEST_REVEAL_CONFIG, 2), 80);
  assert.equal(delayForTransition(TEST_REVEAL_CONFIG, 3), 120);
});

test('start · 启动后 subscribe 立即收到当前状态', () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  const states: RevealState[] = [];
  c.subscribe((s) => states.push({ ...s }));
  c.start();
  // start() 调用了 setState({ isRunning: true, ... })+ scheduleAdvance
  // 至少 1 次通知
  assert.ok(states.length >= 1, 'subscribe 应至少收到 1 次通知');
  assert.equal(states[states.length - 1].isRunning, true);
  c.destroy();
});

test('pause → resume → reset → start 完整生命周期', async () => {
  const c = createRevealController(TEST_REVEAL_CONFIG);
  c.start();
  await sleep(30);
  c.pause();
  c.resume();
  await sleep(20);
  c.reset();
  c.start();
  await sleep(60);
  // 重新从 stage 1 推进,至少到 stage 2
  assert.equal(c.getState().stage, 2);
  c.destroy();
});