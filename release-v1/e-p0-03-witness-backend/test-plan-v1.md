---
title: SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Test Plan · v1
type: engineering-test-plan
tags: [release-v1, e-p0-03, witness-backend, test-plan, unit, integration, performance, see-earth]
task_id: E-P0-03
brief_anchor: "Release Strategy Brief §5 E-P0-03 §G"
track: engineering
owner: Engineer Agent #4 (external Owner = 您)
created: 2026-08-24
status: DRAFT · IN REVIEW
target_gate: Gate A · Internal Alpha
source_brief: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/SEE-EARTH-Release-Strategy-v1-Design-Engineering-Task-Brief.md
source_task_card: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/06-PM Agent 交接/2026-08-22-task-card-e-p0-03-minimal-witness-backend.md
related_docs:
  - ./architecture-v1.md
  - ./state-machine-v1.md
  - ./schema-v1.md
  - ./endpoints-v1.md
  - ./error-handling-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/api-contract/error-code-dict-v1.md
  - /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/alpha-environment/env-decision-v1.md
canonical_obsidian_path: /Users/lwy/Documents/Obsidian Vault/项目/看见地球 设计/05-项目现状/release-v1/e-p0-03-witness-backend/test-plan-v1.md
workspace_canonical_path: /Users/lwy/Documents/ChatGPT/看见地球/release-v1/e-p0-03-witness-backend/test-plan-v1.md
sync_required: true · sandbox 拒绝写入 Obsidian
---

# SEE EARTH V1 · E-P0-03 · Minimal Witness Backend · Test Plan · v1

> **作者**：Engineer Agent #4（外部 Owner = 您）
> **派发时间**：2026-08-24 · Round 4
> **目标**：交付 Witness 后端**完整测试覆盖矩阵** —— 单元测试 + 集成测试 + 隐私测试 + 性能测试 + 验收测试
> **覆盖目标**：任务卡 §G 强制（状态机 / 完整流程 / 隐私 / 性能）+ V1 Acceptance Criteria 10 项

---

## 0. 阅读指南

- **§1** 测试金字塔（Unit / Integration / E2E / Privacy / Performance）
- **§2** 单元测试覆盖矩阵（state machine + validation + 序列化）
- **§3** 集成测试场景（完整 submission 流程）
- **§4** 隐私测试（位置不泄漏 + EXIF 剥离 + PII 不外泄）
- **§5** 性能测试（限流 + 大文件上传 + p95 预算）
- **§6** 验收测试（与 D-P0-02 6 段流程对齐）
- **§7** CI / CD 流水线
- **§8** 测试数据 fixture
- **§9** 测试覆盖率目标

---

## 1. 测试金字塔

```text
                    ┌──────────────┐
                    │  E2E (Playwright) │  ← 5 端点真实流程 · 1%
                    └──────────────┘
                ┌────────────────────────┐
                │  Integration (Vitest + Test DB) │  ← 完整 submission 流程 · 25%
                └────────────────────────┘
        ┌──────────────────────────────────────┐
        │  Unit (Vitest)                         │  ← state machine / validation / serialization · 70%
        └──────────────────────────────────────┘
   ┌──────────────────────────────────────────────┐
   │  Privacy Leak Test (CI grep + exiftool)       │  ← 强制 · 每个 PR
   └──────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────┐
   │  Performance (k6 / Vercel Analytics)          │  ← 每周 · pre-release
   └──────────────────────────────────────────────┘
```

| 层级 | 工具 | 覆盖范围 | 频率 | 通过门槛 |
|---|---|---|---|---|
| **Unit** | Vitest | state machine transitions · Zod schemas · serialization · helpers | 每次 commit | 100% line coverage on critical paths |
| **Integration** | Vitest + Test DB (Postgres in Docker) | 完整 submission flow · DB triggers · RLS | 每次 commit | 所有 5 端点 + 9 状态转换 |
| **E2E** | Playwright | 6 段流程（Web UI + API） | 每次 PR to alpha | 全部 PASS |
| **Privacy Leak** | bash script + exiftool + ripgrep | 公共 API payload · 图片 EXIF · 客户端 bundle | 每次 PR | **0 命中** |
| **Performance** | k6 + Vercel Analytics | 限流 · 大文件上传 · p95 | 每周 / pre-release | p50/p95 在预算内 |

---

## 2. 单元测试覆盖矩阵

### 2.1 State Machine Tests（14 条合法转换 + 5 类非法转换）

```typescript
// tests/unit/stateMachine.test.ts

describe('WitnessSubmissionStateMachine', () => {
  describe('legal transitions (14)', () => {
    test('null → draft', async () => {
      const result = transition(null, 'draft', 'submission_created');
      expect(result.ok).toBe(true);
    });

    test('draft → uploading', async () => { /* ... */ });
    test('uploading → uploaded', async () => { /* ... */ });
    test('uploaded → validating', async () => { /* ... */ });
    test('validating → submitted', async () => { /* ... */ });
    test('submitted → under_review', async () => { /* ... */ });
    test('under_review → published', async () => { /* ... */ });
    test('under_review → rejected', async () => { /* ... */ });
    test('published → withdrawn', async () => { /* ... */ });
    test('draft → withdrawn', async () => { /* ... */ });
    test('uploading → failed_terminal (sharp fail)', async () => { /* ... */ });
    test('validating → failed_terminal (EXIF fail)', async () => { /* ... */ });
    test('submitted → failed_terminal (data integrity)', async () => { /* ... */ });
    test('under_review → failed_terminal (write fail)', async () => { /* ... */ });
  });

  describe('illegal transitions (5 classes)', () => {
    test('terminal → any (rejected/withdrawn/failed_terminal)', async () => {
      await expect(transition('rejected', 'published', 'test')).rejects.toThrow('submission_invalid_transition');
      await expect(transition('withdrawn', 'published', 'test')).rejects.toThrow('submission_invalid_transition');
      await expect(transition('failed_terminal', 'uploading', 'test')).rejects.toThrow('submission_invalid_transition');
    });

    test('skipping states (draft → submitted)', async () => {
      await expect(transition('draft', 'submitted', 'test')).rejects.toThrow('submission_invalid_transition');
    });

    test('backwards (under_review → uploaded)', async () => {
      await expect(transition('under_review', 'uploaded', 'test')).rejects.toThrow('submission_invalid_transition');
    });

    test('invalid reason_code on reject', async () => {
      await expect(transition('under_review', 'rejected', 'invalid_reason')).rejects.toThrow('validation_failed');
    });

    test('self-transition (draft → draft)', async () => {
      await expect(transition('draft', 'draft', 'test')).rejects.toThrow('submission_invalid_transition');
    });
  });

  describe('status_history JSONB shape', () => {
    test('initial history on insert', async () => {
      const result = await createDraft({ /* ... */ });
      expect(result.status_history).toHaveLength(1);
      expect(result.status_history[0]).toMatchObject({
        from: null,
        to: 'draft',
        reason: 'submission_created',
        actor: { type: 'witness', id: expect.any(String) },
      });
    });

    test('appended history on update', async () => {
      const draft = await createDraft({ /* ... */ });
      await transitionStatus(draft.id, 'uploading', 'asset_committed');
      const updated = await getById(draft.id);
      expect(updated.status_history).toHaveLength(2);
      expect(updated.status_history[1]).toMatchObject({
        from: 'draft',
        to: 'uploading',
        reason: 'asset_committed',
      });
    });

    test('history size limit (64KB)', async () => {
      // 模拟 64KB+ history
      const result = await createDraft({ /* ... */ });
      for (let i = 0; i < 1000; i++) {
        await transitionStatus(result.id, 'uploading', 'test');
      }
      await expect(getById(result.id)).rejects.toThrow('check_violation');
    });
  });
});
```

### 2.2 Zod Schema Tests（5 端点）

```typescript
describe('WitnessSubmissionSchemas', () => {
  describe('CreateWitnessSubmissionSchema', () => {
    test('valid input passes', async () => {
      const valid = {
        client_key: '550e8400-e29b-41d4-a716-446655440000',
        media_type: 'photo_camera',
        location: {
          mode: 'auto_gps_city',
          public_city_id: 'kyoto',
          captured_at_tz: 'Asia/Tokyo',
          precise: { latitude: 35.01, longitude: 135.77 },
        },
        captured_at_claim: {
          captured_at: '2026-08-24T03:00:00Z',
          captured_at_tz: 'Asia/Tokyo',
          captured_at_source: 'exif',
          captured_at_confidence: 'high',
        },
        description: { text: 'test', locale: 'zh' },
      };
      const result = CreateWitnessSubmissionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    test.each([
      ['client_key too short', { client_key: 'short' }],
      ['media_type invalid', { media_type: 'invalid' }],
      ['location.mode invalid', { location: { mode: 'gps_only' } }],
      ['city_id missing', { location: { mode: 'auto_gps_city', captured_at_tz: 'UTC' } }],
      ['lat out of range', { location: { precise: { latitude: 91, longitude: 0 } } }],
      ['captured_at in future', { captured_at_claim: { captured_at: '2099-01-01T00:00:00Z' } }],
      ['description too long', { description: { text: 'a'.repeat(201) } }],
    ])('rejects %s', (_, patch) => {
      const invalid = { /* base */, ...patch };
      const result = CreateWitnessSubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // ... UpdateWitnessSubmissionSchema, AssetUploadRequest, AssetCompleteRequest, ModerationDecisionRequest
});
```

### 2.3 Public Schema Strip Tests（关键）

```typescript
describe('PublicWitnessSubmissionSchema strictness', () => {
  test('rejects precise.latitude', () => {
    const publicRecord = { /* public fields */, precise: { latitude: 35.01 } };
    const result = PublicWitnessSubmissionSchema.strict().safeParse(publicRecord);
    expect(result.success).toBe(false);
  });

  test('rejects description.text (only description_redacted allowed)', () => {
    const publicRecord = { /* ... */, description: { text: 'private' } };
    const result = PublicWitnessSubmissionSchema.strict().safeParse(publicRecord);
    expect(result.success).toBe(false);
  });

  test('rejects ip_hash', () => {
    const publicRecord = { /* ... */, ip_hash: 'a1b2c3...' };
    const result = PublicWitnessSubmissionSchema.strict().safeParse(publicRecord);
    expect(result.success).toBe(false);
  });

  test('rejects raw EXIF', () => {
    const publicRecord = { /* ... */, exif: { GPS: '37.7749' } };
    const result = PublicWitnessSubmissionSchema.strict().safeParse(publicRecord);
    expect(result.success).toBe(false);
  });

  test('9 → 8 status mapping', () => {
    expect(publicStatus('validating')).toBe('uploading');
    expect(publicStatus('failed_terminal')).toBe('failed');
    expect(publicStatus('submitted')).toBe('submitted');
  });
});
```

### 2.4 其他单元测试

| 测试 | 数量 | 覆盖 |
|---|:---:|---|
| `clientKeyIdempotency` | 5 | 幂等性各种场景 |
| `rateLimiter` | 8 | 限流边界（5/h 命中 + reset） |
| `hmacIP` | 3 | IP hash 一致性 |
| `parseUAClass` | 8 | UA class 解析（8 个 enum） |
| `sharpMetadataStrip` | 6 | EXIF 剥离（GPS / Camera / DateTime / MakerNote） |
| `errorEnvelope` | 12 | 错误码 → HTTP 映射 |

**Unit 总计**：约 80 个测试用例

---

## 3. 集成测试场景

### 3.1 完整 Submission 流程（成功路径）

```typescript
// tests/integration/submissionFlow.test.ts

describe('E2E submission flow (success)', () => {
  test('create → upload → commit → validate → submit → review → publish', async () => {
    // Setup: witness_id cookie + Supabase Storage mock

    // 1. POST /submissions (create draft)
    const createRes = await request(app)
      .post('/v1/witness/submissions')
      .set('Cookie', `see_earth_witness_session=${mockWitnessCookie}`)
      .send({
        client_key: '550e8400-e29b-41d4-a716-446655440000',
        media_type: 'photo_camera',
        location: { mode: 'auto_gps_city', public_city_id: 'kyoto', captured_at_tz: 'Asia/Tokyo', precise: { latitude: 35.01, longitude: 135.77 } },
        captured_at_claim: { captured_at: '2026-08-24T03:00:00Z', captured_at_tz: 'Asia/Tokyo', captured_at_source: 'exif', captured_at_confidence: 'high' },
        description: { text: '京都雨天', locale: 'zh' },
      });
    expect(createRes.status).toBe(201);
    const submissionId = createRes.body.data.id;

    // 2. POST /upload-url
    const uploadUrlRes = await request(app)
      .post(`/v1/witness/submissions/${submissionId}/upload-url`)
      .send({ media_type: 'photo_camera', size_bytes: 12345, checksum_sha256: 'a1b2c3...', mime: 'image/jpeg' });
    expect(uploadUrlRes.status).toBe(201);
    const { asset_id, upload_url } = uploadUrlRes.body.data;

    // 3. Client PUT raw image (mocked)
    await request(app)
      .put(upload_url)
      .set('Content-Type', 'image/jpeg')
      .send(mockJpegBuffer);

    // 4. POST /commit
    const commitRes = await request(app)
      .post(`/v1/witness/submissions/${submissionId}/commit`)
      .send({ asset_id, checksum_sha256: 'a1b2c3...', size_bytes: 12345 });
    expect(commitRes.status).toBe(200);
    expect(commitRes.body.data.submission_status).toBe('uploading');

    // 5. Wait for sharp worker (mocked to complete immediately)
    await waitFor(() => db.getStatus(submissionId) === 'submitted', 5000);

    // 6. GET /submissions/:id
    const getRes = await request(app).get(`/v1/witness/submissions/${submissionId}`);
    expect(getRes.body.data.status).toBe('submitted');

    // 7. POST /admin/.../moderate (accept)
    const moderateRes = await request(app)
      .post(`/v1/admin/witness/submissions/${submissionId}/moderate`)
      .set('Authorization', `Bearer ${mockModeratorJwt}`)
      .send({ decision: 'accepted', public_reason: '感谢分享' });
    expect(moderateRes.status).toBe(200);
    expect(moderateRes.body.data.status).toBe('published');

    // 8. Verify side effects
    const moment = await db.moments.findByWitnessSubmissionId(submissionId);
    expect(moment).toBeTruthy();
    expect(moment.moderation_status).toBe('approved');

    // status_history should have 7 entries
    const submission = await db.witnessSubmissions.findById(submissionId);
    expect(submission.status_history).toHaveLength(7);
    expect(submission.status_history.map(h => h.to)).toEqual([
      'draft', 'uploading', 'uploaded', 'validating', 'submitted', 'under_review', 'published'
    ]);
  });
});
```

### 3.2 幂等性测试

```typescript
describe('Idempotency', () => {
  test('same client_key returns same submission (200)', async () => {
    const input = { /* ... */ };
    const res1 = await request(app).post('/v1/witness/submissions').send(input);
    const res2 = await request(app).post('/v1/witness/submissions').send(input);
    expect(res1.body.data.id).toBe(res2.body.data.id);
    expect(res1.status).toBe(201);
    expect(res2.status).toBe(200);  // replay
  });

  test('same client_key + different payload returns 409', async () => {
    const input = { /* ... */ };
    await request(app).post('/v1/witness/submissions').send(input);
    const res2 = await request(app).post('/v1/witness/submissions').send({ ...input, media_type: 'photo_library' });
    expect(res2.status).toBe(409);
    expect(res2.body.error_code).toBe('duplicate_submission');
  });

  test('after soft delete, client_key can be reused', async () => {
    const input = { /* ... */ };
    const res1 = await request(app).post('/v1/witness/submissions').send(input);
    // soft delete (e.g., expired draft)
    await db.witnessSubmissions.softDelete(res1.body.data.id);
    const res2 = await request(app).post('/v1/witness/submissions').send(input);
    expect(res2.status).toBe(201);  // new record
  });
});
```

### 3.3 限流测试

```typescript
describe('Rate limit (5/h/IP)', () => {
  test('5 creates succeed, 6th fails', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/v1/witness/submissions')
        .set('X-Forwarded-For', '1.2.3.4')
        .send({ /* unique client_key per req */ });
      expect(res.status).toBe(201);
    }
    const res6 = await request(app)
      .post('/v1/witness/submissions')
      .set('X-Forwarded-For', '1.2.3.4')
      .send({ /* unique */ });
    expect(res6.status).toBe(429);
    expect(res6.body.error_code).toBe('rate_limited_witness');
    expect(res6.headers['retry-after']).toBeTruthy();
  });

  test('different IPs counted separately', async () => {
    for (const ip of ['1.1.1.1', '2.2.2.2']) {
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/v1/witness/submissions')
          .set('X-Forwarded-For', ip)
          .send({ /* unique */ });
        expect(res.status).toBe(201);
      }
    }
  });

  test('window resets after 1h', async () => {
    // Mock clock
    vi.setSystemTime('2026-08-24T00:00:00Z');
    for (let i = 0; i < 5; i++) {
      await request(app).post('/v1/witness/submissions').set('X-Forwarded-For', '1.2.3.4').send({ /* */ });
    }
    vi.setSystemTime('2026-08-24T01:00:01Z');
    const res = await request(app).post('/v1/witness/submissions').set('X-Forwarded-For', '1.2.3.4').send({ /* */ });
    expect(res.status).toBe(201);  // window reset
  });
});
```

### 3.4 状态机集成测试

```typescript
describe('State machine via API', () => {
  test('cannot PATCH withdrawn on published if not owner', async () => {
    const sub = await createPublishedSubmission();
    const otherWitnessCookie = mockWitnessCookie({ witnessId: 'other_witness' });
    const res = await request(app)
      .patch(`/v1/witness/submissions/${sub.id}`)
      .set('Cookie', `see_earth_witness_session=${otherWitnessCookie}`)
      .send({ client_key: sub.client_key, status: 'withdrawn' });
    expect(res.status).toBe(403);
  });

  test('cannot moderate already-rejected submission', async () => {
    const sub = await createRejectedSubmission();
    const res = await request(app)
      .post(`/v1/admin/witness/submissions/${sub.id}/moderate`)
      .set('Authorization', `Bearer ${mockModeratorJwt}`)
      .send({ decision: 'accepted' });
    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe('submission_invalid_transition');
  });
});
```

### 3.5 RLS 集成测试

```typescript
describe('Row Level Security', () => {
  test('anon cannot SELECT other witness submission', async () => {
    const sub = await createSubmission({ witness_id: 'w_hash_a' });
    const res = await request(app)
      .get(`/v1/witness/submissions/${sub.id}`)
      .set('Cookie', `see_earth_witness_session=${mockWitnessCookie({ witnessId: 'w_hash_b' })}`);
    expect(res.status).toBe(404);  // RLS hides as 404
  });

  test('anon cannot SELECT private_locations', async () => {
    const sub = await createSubmission({ withLocation: true });
    const res = await db.query(
      'SELECT latitude FROM private_locations WHERE submission_id = $1',
      [sub.id],
      { role: 'anon' }
    );
    expect(res.rows).toHaveLength(0);  // RLS denies
  });

  test('moderator can SELECT private_locations', async () => {
    const sub = await createSubmission({ withLocation: true });
    const res = await db.query(
      'SELECT latitude FROM private_locations WHERE submission_id = $1',
      [sub.id],
      { role: 'moderator' }
    );
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].latitude).toBeGreaterThan(-90);
  });

  test('moderation_log is immutable (UPDATE fails)', async () => {
    const log = await db.moderationLog.create({ /* ... */ });
    await expect(
      db.query('UPDATE moderation_log SET action = $1 WHERE id = $2', ['reassigned', log.id])
    ).rejects.toThrow();
  });
});
```

### 3.6 Cron / 清理集成测试

```typescript
describe('pg_cron cleanup', () => {
  test('24h draft expired and soft-deleted', async () => {
    const draft = await createDraft({ /* ... */ });
    // Backdate created_at
    await db.query("UPDATE witness_submissions SET created_at = NOW() - INTERVAL '25 hours' WHERE id = $1", [draft.id]);
    // Run cleanup
    await db.query("SELECT witness_cleanup_drafts()");
    // Verify
    const result = await db.witnessSubmissions.findById(draft.id);
    expect(result.status).toBe('withdrawn');
    expect(result.deleted_at).toBeTruthy();
  });

  test('precise location auto-deleted after 90d', async () => {
    const loc = await createPrivateLocation({ /* ... */ });
    await db.query("UPDATE private_locations SET retention_until = NOW() - INTERVAL '1 day' WHERE id = $1", [loc.id]);
    await db.query("SELECT witness_cleanup_precise_locations()");
    const result = await db.privateLocations.findById(loc.id);
    expect(result.deleted_at).toBeTruthy();
  });
});
```

---

## 4. 隐私测试（关键 · 强制）

### 4.1 公共 API 扫描（CI · 每次 PR）

```bash
#!/bin/bash
# tests/privacy/scan_public_api.sh
# 在 CI 中执行；任何命中即失败

set -e

echo "🛡️ Privacy leak test · 公共 API payload 扫描"

# 1. 启动 Vercel function 本地
vercel dev --port 3001 &
DEV_PID=$!
sleep 10

# 2. 触发所有公共 endpoint
declare -a endpoints=(
  "GET /v1/witness/submissions/test-id"
  "POST /v1/witness/submissions"
)

# 3. 抓取所有响应
> /tmp/api_responses.txt
for ep in "${endpoints[@]}"; do
  curl -s -X ${ep%% *} http://localhost:3001${ep##* } >> /tmp/api_responses.txt
  echo "" >> /tmp/api_responses.txt
done

# 4. 扫描禁采字段（regex）
declare -a forbidden_patterns=(
  '"latitude"\s*:\s*[0-9]'
  '"longitude"\s*:\s*[0-9]'
  '"lat"\s*:\s*[0-9]'
  '"lng"\s*:\s*[0-9]'
  '"accuracy_m"\s*:\s*[0-9]'
  '"precise"\s*:'
  '"raw_coordinates"\s*:'
  '"raw_location"\s*:'
  '"exif"\s*:'
  '"GPSLatitude"'
  '"GPSLongitude"'
  '"street_address"'
  '"place_id"'
  '"ip_hash"'
  '"client_key"\s*:\s*"[a-f0-9-]+"'  # client_key 仅 GET 自己时返回；公共列表不返
)

for pattern in "${forbidden_patterns[@]}"; do
  if grep -E "$pattern" /tmp/api_responses.txt > /tmp/match.txt; then
    echo "❌ Privacy violation: pattern '$pattern' matched"
    cat /tmp/match.txt
    kill $DEV_PID
    exit 1
  fi
done

echo "✅ No privacy leaks in public API"
kill $DEV_PID
```

### 4.2 EXIF 剥离验证

```bash
#!/bin/bash
# tests/privacy/scan_exif.sh
# 每次 sharp 处理后执行

set -e

echo "🛡️ EXIF strip test · 上传公开 variant 后扫描"

# 1. 找到 witness-public bucket 中最新上传的图片
LATEST=$(supabase storage list witness-public --limit 1)

# 2. 下载并扫描 EXIF
curl -s "$LATEST" -o /tmp/uploaded.jpg

# 3. exiftool 扫描禁采字段
exiftool /tmp/uploaded.jpg | grep -iE "(GPS|Geo|Location|Latitude|Longitude|CameraSerial|UserComment|Software|MakerNote)" > /tmp/exif_match.txt

if [ -s /tmp/exif_match.txt ]; then
  echo "❌ EXIF violation:"
  cat /tmp/exif_match.txt
  exit 1
fi

# 4. 允许保留的字段（orientation + color profile）
ALLOWED=$(exiftool /tmp/uploaded.jpg | grep -iE "(Orientation|ColorSpace|ProfileDescription)" | wc -l)
if [ "$ALLOWED" -eq 0 ]; then
  echo "⚠️ Warning: no orientation/color metadata preserved"
fi

echo "✅ EXIF stripped correctly"
```

### 4.3 客户端 bundle 扫描

```bash
#!/bin/bash
# tests/privacy/scan_bundle.sh
# CI · 每次 PR

set -e

echo "🛡️ Client bundle privacy scan"

# 构建 production bundle
pnpm run build

# 扫描客户端 bundle 不含禁采字段
declare -a patterns=(
  "VITE_.*SECRET"
  "VITE_.*PRIVATE_KEY"
  "WITNESS_IP_HASH_SECRET"
  "WITNESS_SESSION_SECRET"
  "MODERATOR_JWT_SECRET"
)

for pattern in "${patterns[@]}"; do
  if grep -rE "$pattern" dist/ 2>/dev/null; then
    echo "❌ Secret leaked in client bundle: $pattern"
    exit 1
  fi
done

echo "✅ Client bundle clean"
```

### 4.4 隐私测试 checklist

- [ ] 公共 API payload 不含 `lat` / `lng` / `latitude` / `longitude` / `precise.*`
- [ ] 公共 API payload 不含 raw EXIF
- [ ] 公共 API payload 不含 `ip_hash` / `user_agent_hash`
- [ ] 公共 API payload 不含 `description.text`（仅 `description_redacted`）
- [ ] 公共 API payload 不含 `street_address` / `place_id`
- [ ] 上传至 witness-public 的图片 exiftool 扫描无 GPS / CameraSerial / UserComment
- [ ] 客户端 bundle 不含 secrets
- [ ] Moderator API 仅 moderator JWT 可访问
- [ ] private_locations 表 anon role 拒绝 SELECT
- [ ] moderation_log 表 UPDATE/DELETE 被 RULE 拒绝

---

## 5. 性能测试

### 5.1 性能预算（来自 endpoints-v1.md §8）

| 端点 | p50 | p95 |
|---|---|---|
| POST /submissions | 80ms | 200ms |
| POST /upload-url | 100ms | 250ms |
| POST /commit | 150ms | 350ms |
| GET /submissions/:id | 60ms | 150ms |
| POST /moderate | 120ms | 300ms |

### 5.2 k6 压测脚本

```javascript
// tests/performance/witness_load.js

import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp up
    { duration: '2m', target: 50 },    // normal load
    { duration: '30s', target: 100 },  // peak
    { duration: '1m', target: 10 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500'],  // 全局 p50/p95
    errors: ['rate<0.01'],  // 错误率 < 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    client_key: `k6_${__VU}_${__ITER}_${Date.now()}`,
    media_type: 'photo_camera',
    location: { mode: 'auto_gps_city', public_city_id: 'kyoto', captured_at_tz: 'Asia/Tokyo' },
    captured_at_claim: { captured_at: '2026-08-24T03:00:00Z', captured_at_tz: 'Asia/Tokyo', captured_at_source: 'exif', captured_at_confidence: 'high' },
  });

  const res = http.post('https://alpha-see-earth.vercel.app/api/v1/witness/submissions', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const ok = check(res, {
    'status is 201': (r) => r.status === 201,
    'p95 < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(!ok);
}
```

### 5.3 大文件上传测试

```javascript
// tests/performance/upload_25mb.js

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 5,
  duration: '2m',
};

const fakeJpeg25MB = open('/tmp/fake_25mb.jpg', 'b');

export default function () {
  // Step 1: create submission
  const create = http.post('https://alpha-see-earth.vercel.app/api/v1/witness/submissions',
    JSON.stringify({
      client_key: `upload_${__VU}_${__ITER}_${Date.now()}`,
      media_type: 'photo_camera',
      location: { mode: 'auto_gps_city', public_city_id: 'kyoto', captured_at_tz: 'Asia/Tokyo' },
      captured_at_claim: { captured_at: '2026-08-24T03:00:00Z', captured_at_tz: 'Asia/Tokyo', captured_at_source: 'exif', captured_at_confidence: 'high' },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const submissionId = JSON.parse(create.body).data.id;

  // Step 2: get upload-url
  const uploadUrlRes = http.post(`https://alpha-see-earth.vercel.app/api/v1/witness/submissions/${submissionId}/upload-url`,
    JSON.stringify({ media_type: 'photo_camera', size_bytes: fakeJpeg25MB.length, checksum_sha256: 'mock_sha256', mime: 'image/jpeg' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const { upload_url } = JSON.parse(uploadUrlRes.body).data;

  // Step 3: PUT 25MB
  const upload = http.put(upload_url, fakeJpeg25MB, {
    headers: { 'Content-Type': 'image/jpeg' },
  });

  check(upload, {
    'upload 25MB status 200': (r) => r.status === 200,
    'upload 25MB duration < 30s': (r) => r.timings.duration < 30000,
  });
}
```

### 5.4 限流压测

```javascript
// tests/performance/rate_limit.js

import http from 'k6/http';

export const options = {
  vus: 1,
  iterations: 10,  // 1 IP, 10 requests
};

export default function () {
  const res = http.post('https://alpha-see-earth.vercel.app/api/v1/witness/submissions',
    JSON.stringify({
      client_key: `rl_${__VU}_${__ITER}_${Date.now()}`,
      media_type: 'photo_camera',
      location: { mode: 'auto_gps_city', public_city_id: 'kyoto', captured_at_tz: 'Asia/Tokyo' },
      captured_at_claim: { captured_at: '2026-08-24T03:00:00Z', captured_at_tz: 'Asia/Tokyo', captured_at_source: 'exif', captured_at_confidence: 'high' },
    }),
    { headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '1.2.3.4' } }
  );

  if (__ITER >= 5) {
    // 第 6 次起应被限流
    if (res.status !== 429) throw new Error(`Expected 429 at iteration ${__ITER}, got ${res.status}`);
  } else {
    if (res.status !== 201) throw new Error(`Expected 201 at iteration ${__ITER}, got ${res.status}`);
  }
}
```

### 5.5 性能测试通过门槛

| 维度 | 门槛 |
|---|---|
| p50 latency（5 端点） | 在预算内（详见 §5.1） |
| p95 latency（5 端点） | 在预算内 |
| 25MB 上传完成时间 | < 30s（网络条件：broadband） |
| Sharp 处理时间（4 variants） | < 30s（中等配置机器） |
| 错误率 | < 1% |
| 限流生效 | 第 6 次请求 429 |

---

## 6. 验收测试（与 D-P0-02 6 段流程对齐）

### 6.1 E2E 测试（Playwright）

```typescript
// tests/e2e/witness_flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Witness Flow (D-P0-02 6 段)', () => {
  test('成功路径：段 0-6 全流程', async ({ page }) => {
    // 段 0: 入口
    await page.goto('/witness');
    await expect(page.locator('h1')).toContainText('留下一个 Moment');
    await page.click('text=继续');

    // 段 1: 选图（模拟已选图）
    await page.click('text=从相册选');
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/test_with_exif.jpg');
    await page.click('text=继续');

    // 段 2: 时间确认
    await expect(page.locator('[data-testid="captured-at"]')).toBeVisible();
    await page.click('text=确认');

    // 段 3: 位置（mock GPS）
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition = (success) =>
        success({ coords: { latitude: 35.0116, longitude: 135.7683, accuracy: 12 } });
    });
    await page.click('text=使用当前位置');
    await page.click('text=继续');

    // 段 4: 描述
    await page.fill('textarea', '京都雨天');
    await page.click('text=继续');

    // 段 5: 公开预览
    await expect(page.locator('text=城市：京都')).toBeVisible();
    await expect(page.locator('text=不会显示')).toBeVisible();
    await page.click('text=确认提交');

    // 段 6a: 上传中
    await expect(page.locator('[data-testid="uploading"]')).toBeVisible();

    // 段 6b: 结果（等待服务端处理）
    await page.waitForSelector('[data-testid="result-success"]', { timeout: 30000 });
    await expect(page.locator('text=你的 Moment 已提交')).toBeVisible();
  });

  test('权限拒绝：位置被拒 → 手动选城市', async ({ page }) => {
    await page.goto('/witness/photo');
    // 跳过选图（假设 mock）
    // ...
    await page.goto('/witness/location');
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition = (_, error) =>
        error({ code: 1, message: 'User denied' });
    });
    await page.click('text=使用当前位置');
    await expect(page.locator('text=手动选择城市')).toBeVisible();
    await page.click('text=手动选择城市');
    await page.click('text=京都');
    await page.click('text=继续');
    // ...
  });

  test('上传失败 → 重试', async ({ page }) => {
    // Mock fetch failure
    await page.route('**/api/v1/witness/submissions/*/commit', route => route.abort());
    // ... submit
    await page.waitForSelector('[data-testid="retry-button"]');
    // unmock and retry
    await page.unroute('**/api/v1/witness/submissions/*/commit');
    await page.click('[data-testid="retry-button"]');
    await page.waitForSelector('[data-testid="result-success"]');
  });

  test('公共预览不含精确位置', async ({ page }) => {
    // ...
    await expect(page.locator('text=/\\d+\\.\\d+\\.\\d+\\.\\d+/')).not.toBeVisible();  // 不显示 IP-like
    await expect(page.locator('text=/latitude/i')).not.toBeVisible();
    await expect(page.locator('text=/GPS/i')).not.toBeVisible();
  });
});
```

### 6.2 验收清单（与 D-P0-02 Acceptance Criteria 对齐）

- [ ] 段 0-6 全流程可走通
- [ ] 权限拒绝时显示 C-06 Banner + 替代路径
- [ ] 公开预览仅显示 city + 时间 + 描述 + 缩略图
- [ ] 上传中显示进度条
- [ ] 上传失败显示重试按钮
- [ ] 成功后显示 submission_id 卡片
- [ ] iOS first-pass 字段映射正确（与 web-ios-mapping-v1.md 对齐）

---

## 7. CI / CD 流水线

### 7.1 GitHub Actions workflow

```yaml
# .github/workflows/witness-backend.yml

name: Witness Backend CI

on:
  pull_request:
    paths:
      - 'api/witness/**'
      - 'api/admin/witness/**'
      - 'lib/witness/**'
      - 'tests/**'
  push:
    branches: [main, alpha]

jobs:
  unit:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports: ['543:5432']
        options: --health-cmd pg_isready --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - run: pnpm run test:unit --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_PASSWORD: test }
        ports: ['543:5432']
      storage:
        image: supabase/storage-api:latest
    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/witness_test
      SUPABASE_URL: http://localhost:54321
      SUPABASE_KEY: test_key
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: psql $DATABASE_URL -f migrations/V1.0.0__init_witness_schema.sql
      - run: pnpm run test:integration

  privacy-leak:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm run build
      - run: bash tests/privacy/scan_bundle.sh
      - run: bash tests/privacy/scan_public_api.sh
      - run: bash tests/privacy/scan_exif.sh

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install
      - run: pnpm run test:e2e

  performance:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm run test:performance
```

### 7.2 Pre-commit hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: privacy-bundle-scan
        name: Privacy bundle scan
        entry: bash tests/privacy/scan_bundle.sh
        language: system
        pass_filenames: false
```

---

## 8. 测试数据 Fixture

### 8.1 测试图片

```text
tests/fixtures/
├── test_with_exif.jpg       (3 MB · 含 GPS + DateTimeOriginal)
├── test_without_exif.png    (1 MB · 截图 · 无 EXIF)
├── test_25mb.jpg            (25 MB · 上传上限测试)
├── test_corrupt.jpg         (10 KB · 损坏文件 · 触发 failed_terminal)
├── test_screenshot.png      (500 KB · 无 EXIF · 无 GPS)
└── test_animated.gif        (2 MB · 不支持格式 · 触发 mime error)
```

### 8.2 测试账户 / 角色

| 角色 | witness_id | 用途 |
|---|---|---|
| `witness_alpha_001` | `w_hash_alpha_001` | 正常用户 · 完整提交 |
| `witness_alpha_002` | `w_hash_alpha_002` | 完整提交 + 撤回 |
| `moderator_alpha_01` | `m_hash_alpha_01` | accept 测试 |
| `moderator_alpha_02` | `m_hash_alpha_02` | reject 测试 |

### 8.3 测试城市

仅使用 Seed 12 城内：`kyoto`, `lisbon`, `reykjavik` 等（详见 `src/data/cities.ts`）。

---

## 9. 测试覆盖率目标

| 模块 | 行覆盖率 | 分支覆盖率 | 关键函数 100% |
|---|:---:|:---:|:---:|
| `stateMachine.ts` | 100% | 100% | ✅ |
| `serializers/publicWitnessSubmission.ts` | 100% | 100% | ✅ |
| `handlers/createWitnessSubmission.ts` | 90% | 85% | ✅ |
| `handlers/uploadUrl.ts` | 90% | 85% | ✅ |
| `handlers/commit.ts` | 95% | 90% | ✅ |
| `handlers/getWitnessSubmission.ts` | 95% | 90% | ✅ |
| `handlers/moderate.ts` | 95% | 90% | ✅ |
| `lib/sharpMetadata.ts` | 100% | 100% | ✅ |
| `lib/rateLimit.ts` | 100% | 100% | ✅ |
| `lib/hmac.ts` | 100% | 100% | ✅ |
| **总计** | **≥ 90%** | **≥ 85%** | 关键函数 100% |

---

## 10. 自验收（任务卡 §G 强制覆盖 + Acceptance Criteria）

| # | 验收项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 单元测试 state machine transitions | ✅ | §2.1 (14 合法 + 5 非法 + 3 JSONB) |
| 2 | 集成测试完整 submission 流程 | ✅ | §3.1 |
| 3 | 隐私测试精确位置不泄漏 | ✅ | §4.1 / §4.2 |
| 4 | 性能测试限流 + 大文件上传 | ✅ | §5.3 / §5.4 |
| 5 | 9 状态状态机完整覆盖 | ✅ | §2.1 + §3.4 |
| 6 | 5 端点 + 错误码 + 性能预算测试 | ✅ | §2.2 + §5 |
| 7 | CI 流水线（unit / integration / privacy / e2e） | ✅ | §7 |
| 8 | 不修改 D-P0-02 LOCKED 组件 | ✅ | §6 E2E 测试不动 LOCKED |

---

**End of test-plan-v1.md · E-P0-03 子产物 6/7**