-- ============================================================
-- SEE EARTH V1 · 0001_init seed-test.sql · Alpha 测试数据
-- ============================================================
-- 用途:    Alpha 环境初始化测试数据
-- 来源:    派生自 src/data/cities.ts · moments.ts · liveMoments.ts
-- 数量:    12 cities + 6 moments + 12 live_events + 5 assets + 3 witness submissions
--          + 2 private_locations + 3 moderation_log + 3 rate_limit_buckets
-- ⚠️ 重要: cities / moments 表由 E-P0-02 定义（DDL 已存在）· 本文件仅做 INSERT
-- ⚠️ 重要: 不包含任何 lat/lon 列（公共 schema 物理无此字段）· 精确位置只在 private_locations
-- ============================================================

BEGIN;

-- ============================================================
-- 0. 切换到 service_role（绕开 RLS · 仅 seed 用）
-- ============================================================
SET LOCAL ROLE service_role;

-- ============================================================
-- 1. Cities（12 个 · 派生自 src/data/cities.ts）
-- ============================================================
-- ⚠️ schema 派生自 data-architecture-v1.md §3.1
--    公共域 schema 故意不包含 lat/lon 列
-- ============================================================

INSERT INTO cities (
  id, slug, name_zh, name_en, country_zh, country_en, country_code,
  timezone, layer, page_state, public_location_only, admin1_code, admin1_name,
  place_type, state_level
) VALUES
  ('kyoto',        'kyoto',        '京都',       'Kyoto',       '日本',     'Japan',         'JP', 'Asia/Tokyo',         'blue',   'B_active', TRUE, '26', 'Kyoto',    'city', 'L0_mapped'),
  ('lisbon',       'lisbon',       '里斯本',     'Lisbon',      '葡萄牙',   'Portugal',      'PT', 'Europe/Lisbon',      'blue',   'B_active', TRUE, '11', 'Lisbon',   'city', 'L0_mapped'),
  ('shanghai',     'shanghai',     '上海',       'Shanghai',    '中国',     'China',         'CN', 'Asia/Shanghai',      'yellow', 'B_active', TRUE, '31', 'Shanghai', 'city', 'L0_mapped'),
  ('mexico-city',  'mexico-city',  '墨西哥城',   'Mexico City', '墨西哥',   'Mexico',        'MX', 'America/Mexico_City','yellow', 'B_active', TRUE, 'CMX','CDMX',     'city', 'L0_mapped'),
  ('cape-town',    'cape-town',    '开普敦',     'Cape Town',   '南非',     'South Africa',  'ZA', 'Africa/Johannesburg','red',    'B_active', TRUE, 'WC', 'Western Cape', 'city', 'L0_mapped'),
  ('london',       'london',       '伦敦',       'London',      '英国',     'United Kingdom','GB', 'Europe/London',      'blue',   'B_active', TRUE, 'ENG','England',   'city', 'L0_mapped'),
  ('tokyo',        'tokyo',        '东京',       'Tokyo',       '日本',     'Japan',         'JP', 'Asia/Tokyo',         'blue',   'B_active', TRUE, '13', 'Tokyo',    'city', 'L0_mapped'),
  ('reykjavik',    'reykjavik',    '雷克雅未克', 'Reykjavík',   '冰岛',     'Iceland',       'IS', 'Atlantic/Reykjavik', 'yellow', 'B_active', TRUE, '1',  'Capital Region','city', 'L0_mapped'),
  ('marrakesh',    'marrakesh',    '马拉喀什',   'Marrakesh',   '摩洛哥',   'Morocco',       'MA', 'Africa/Casablanca',  'red',    'B_active', TRUE, '07', 'Marrakesh-Safi','city', 'L0_mapped'),
  ('paris',        'paris',        '巴黎',       'Paris',       '法国',     'France',        'FR', 'Europe/Paris',       'blue',   'B_active', TRUE, 'IDF','Île-de-France','city', 'L0_mapped'),
  ('newyork',      'newyork',      '纽约',       'New York',    '美国',     'United States', 'US', 'America/New_York',   'yellow', 'B_active', TRUE, 'NY', 'New York', 'city', 'L0_mapped'),
  ('sydney',       'sydney',       '悉尼',       'Sydney',      '澳大利亚', 'Australia',     'AU', 'Australia/Sydney',   'red',    'B_active', TRUE, 'NSW','New South Wales','city', 'L0_mapped')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Moments（6 个 · 派生自 src/data/moments.ts）
-- ============================================================
-- ⚠️ schema 派生自 data-architecture-v1.md §3.2
-- ============================================================

INSERT INTO moments (
  id, city_id, public_city_name,
  captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
  uploaded_at, published_at,
  source_type, rights_status, credit_line, credit_source_url, provenance_status,
  moderation_status, witness_id, asset_id, editorial_category,
  captions_zh, captions_en
) VALUES
  ('nyc-seed',     'newyork', '纽约',
   '2026-08-22T09:40:00Z', 'America/New_York', 'editorial', 'high',
   '2026-08-22T09:45:00Z', '2026-08-22T10:00:00Z',
   'editorial', 'cc_by', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'finance',
   'Wall Street 刚敲响开盘钟，今天纳斯达克又涨了 2%。',
   'The opening bell just rang on Wall Street — Nasdaq up 2% today.'),
  ('marrakesh-seed', 'marrakesh', '马拉喀什',
   '2026-08-22T08:00:00Z', 'Africa/Casablanca', 'editorial', 'high',
   '2026-08-22T08:05:00Z', '2026-08-22T09:00:00Z',
   'editorial', 'cc_by_sa', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'art',
   'Jemaa el-Fnaa 广场上,铜壶被慢慢摆上木桌,有人在为今天的第一壶薄荷茶备水。',
   'At Jemaa el-Fnaa, brass teapots are being set out on wooden tables — someone is preparing the first mint tea of the day.'),
  ('paris-seed',   'paris', '巴黎',
   '2026-08-22T07:00:00Z', 'Europe/Paris', 'editorial', 'high',
   '2026-08-22T07:05:00Z', '2026-08-22T08:00:00Z',
   'editorial', 'cc_by', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'art',
   '塞纳河边的旧书摊刚开张，老板在整理雨果的初版。',
   'A used bookstall on the Seine just opened — sorting Hugo first editions.'),
  ('tokyo-seed',   'tokyo', '东京',
   '2026-08-22T16:00:00Z', 'Asia/Tokyo', 'editorial', 'high',
   '2026-08-22T16:05:00Z', '2026-08-22T17:00:00Z',
   'editorial', 'cc_by', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'urban',
   '涩谷十字路口的红灯刚转绿，3000 人同时起步。',
   'Shibuya crossing just turned green — 3000 people start walking at once.'),
  ('cape-town-seed','cape-town', '开普敦',
   '2026-08-22T10:00:00Z', 'Africa/Johannesburg', 'editorial', 'high',
   '2026-08-22T10:05:00Z', '2026-08-22T11:00:00Z',
   'editorial', 'cc_by', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'nature',
   '桌山的"桌布"刚被风扯开一角，露出整片晴空。',
   'The "tablecloth" on Table Mountain just lifted — blue sky revealed.'),
  ('reykjavik-seed','reykjavik', '雷克雅未克',
   '2026-08-22T22:00:00Z', 'Atlantic/Reykjavik', 'editorial', 'high',
   '2026-08-22T22:05:00Z', '2026-08-22T23:00:00Z',
   'editorial', 'cc_by', 'Editor · SEE EARTH', NULL, 'editorial',
   'approved', NULL, NULL, 'romance',
   'Hallgrímskirkja 的尖顶在等一场极光。',
   'Hallgrímskirkja''s spire is waiting for aurora.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Live Events（12 个 · 派生自 src/data/liveMoments.ts）
-- ============================================================
-- 注: V1 不单独建 live_events 表（live moments 复用 moments 表 + source_type='editorial' + is_live=true 标记）
--     此处插入到 moments 表作为"活跃"事件
-- ============================================================

INSERT INTO moments (
  id, city_id, public_city_name,
  captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
  uploaded_at, published_at,
  source_type, rights_status, credit_line, credit_source_url, provenance_status,
  moderation_status, witness_id, asset_id, editorial_category,
  captions_zh, captions_en
) VALUES
  ('tokyo-01',  'tokyo', '东京',
   '2026-08-07T01:40:00+09:00', 'Asia/Tokyo', 'editorial', 'high',
   '2026-08-07T01:45:00Z', '2026-08-07T02:00:00Z',
   'editorial', 'cc_by', '编辑观察 · 城市日常', NULL, 'editorial',
   'approved', NULL, NULL, 'urban',
   '末班地铁刚走，第一班即将出发。地铁工作人员正在清扫站台，几位熬夜的人在便利店门口吃关东煮。',
   'Last train just left, the first is about to depart. Subway staff cleaning the platform.'),
  ('sydney-02', 'sydney', '悉尼',
   '2026-08-07T02:40:00+10:00', 'Australia/Sydney', 'local-media', 'medium',
   '2026-08-07T02:45:00Z', '2026-08-07T03:00:00Z',
   'local-media', 'cc_by_sa', '当地媒体 · 港口新闻', NULL, 'trusted_source',
   'approved', NULL, NULL, 'romance',
   '海风把夜晚留在港口。歌剧院附近的人群渐渐散去，最后一班渡轮驶向北岸，码头边的灯开始暗下来。',
   'Sea breeze holds the night at the harbor. Last ferry heading north.'),
  ('newyork-03','newyork', '纽约',
   '2026-08-06T12:40:00-04:00', 'America/New_York', 'official', 'high',
   '2026-08-06T12:45:00Z', '2026-08-06T13:00:00Z',
   'official', 'cc0', '官方数据 · 证券交易所', NULL, 'trusted_source',
   'approved', NULL, NULL, 'finance',
   '华尔街刚刚敲响开盘钟。交易大厅开始活跃，纳斯达克的数字在屏幕上快速变化。',
   'Wall Street opening bell. Trading floor active, Nasdaq numbers moving fast.'),
  ('rio-04',    'shanghai', '上海',
   '2026-08-07T08:00:00+08:00', 'Asia/Shanghai', 'community', 'medium',
   '2026-08-07T08:05:00Z', '2026-08-07T09:00:00Z',
   'community', 'cc_by', '社区观察 · 城市生活', NULL, 'self_reported',
   'approved', NULL, NULL, 'urban',
   '清晨的上海陆家嘴，晨练的老人在江边打太极。',
   'Morning Shanghai Lujiazui — elderly practicing tai chi by the river.'),
  ('kyoto-05',  'kyoto', '京都',
   '2026-08-07T07:00:00+09:00', 'Asia/Tokyo', 'editorial', 'high',
   '2026-08-07T07:05:00Z', '2026-08-07T08:00:00Z',
   'editorial', 'cc_by', '编辑观察 · 文化', NULL, 'editorial',
   'approved', NULL, NULL, 'culture',
   '清晨的伏见稻荷大社，第一个游客正在鸟居下拍照。',
   'Morning at Fushimi Inari — first visitor photographing under the torii.'),
  ('lisbon-06', 'lisbon', '里斯本',
   '2026-08-07T08:30:00+01:00', 'Europe/Lisbon', 'weather-data', 'high',
   '2026-08-07T08:35:00Z', '2026-08-07T09:00:00Z',
   'weather-data', 'cc0', '气象数据 · IPMA', NULL, 'trusted_source',
   'approved', NULL, NULL, 'weather',
   '塔霍河口的晨雾正在散去，能见度恢复到 8 公里。',
   'Tagus river morning fog clearing — visibility back to 8km.'),
  ('mexico-07', 'mexico-city', '墨西哥城',
   '2026-08-07T09:00:00-06:00', 'America/Mexico_City', 'community', 'medium',
   '2026-08-07T09:05:00Z', '2026-08-07T10:00:00Z',
   'community', 'cc_by_sa', '社区观察', NULL, 'self_reported',
   'approved', NULL, NULL, 'culture',
   'Coyoacán 街头，一个街头画家正在画 Frida Kahlo 肖像。',
   'Coyoacán street — artist painting Frida Kahlo portrait.'),
  ('paris-08',  'paris', '巴黎',
   '2026-08-07T09:00:00+02:00', 'Europe/Paris', 'transport-data', 'high',
   '2026-08-07T09:05:00Z', '2026-08-07T10:00:00Z',
   'transport-data', 'cc0', '交通数据 · RATP', NULL, 'trusted_source',
   'approved', NULL, NULL, 'transport',
   '地铁 4 号线因信号故障延误 8 分钟，影响 12 站。',
   'Metro Line 4 delayed 8 min due to signal issue, affecting 12 stations.'),
  ('cape-09',   'cape-town', '开普敦',
   '2026-08-07T10:00:00+02:00', 'Africa/Johannesburg', 'weather-data', 'high',
   '2026-08-07T10:05:00Z', '2026-08-07T11:00:00Z',
   'weather-data', 'cc0', '气象数据 · SAWS', NULL, 'trusted_source',
   'approved', NULL, NULL, 'weather',
   '桌山顶部风速达到 65 km/h，云雾正在快速形成。',
   'Table Mountain wind 65 km/h — cloud forming fast.'),
  ('london-10', 'london', '伦敦',
   '2026-08-07T09:00:00+01:00', 'Europe/London', 'official', 'high',
   '2026-08-07T09:05:00Z', '2026-08-07T10:00:00Z',
   'official', 'cc0', '官方数据 · TFL', NULL, 'trusted_source',
   'approved', NULL, NULL, 'transport',
   'Central Line 因紧急维修延误 5 分钟，影响 Bank 至 Marble Arch 区间。',
   'Central Line delayed 5 min due to emergency maintenance.'),
  ('reykjavik-11','reykjavik', '雷克雅未克',
   '2026-08-07T23:00:00+00:00', 'Atlantic/Reykjavik', 'weather-data', 'high',
   '2026-08-07T23:05:00Z', '2026-08-07T23:30:00Z',
   'weather-data', 'cc0', '气象数据 · Veðurstofa', NULL, 'trusted_source',
   'approved', NULL, NULL, 'weather',
   '今晚极光 KP 指数 6，预计 23:00 后可见。',
   'Aurora KP index 6 tonight — visible after 23:00.'),
  ('marrakesh-12','marrakesh', '马拉喀什',
   '2026-08-07T12:00:00+01:00', 'Africa/Casablanca', 'community', 'medium',
   '2026-08-07T12:05:00Z', '2026-08-07T13:00:00Z',
   'community', 'cc_by_sa', '社区观察 · 市集', NULL, 'self_reported',
   'approved', NULL, NULL, 'culture',
   '麦地那老城的香料市集刚刚开门，第一个摊主正在摆放藏红花罐。',
   'Medina spice market opening — first vendor arranging saffron jars.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Photo Assets（5 个 · 最小可工作）
-- ============================================================
-- 注: witness_id 模拟 cookie 中的 hash（V1 用 SHA-256(client_secret + session_id)）
-- 注: checksum_sha256 用 64 位 hex dummy 值（实际部署从 Sharp 处理后写入）
-- ============================================================

INSERT INTO assets (
  witness_id, status, media_type, mime, bytes, width, height, checksum_sha256,
  raw_storage_path, variants, exif_stripped, processed_at,
  uploaded_ip_hash, retention_until, created_at
) VALUES
  -- Asset 1: 已 ready · variants 已生成 · EXIF 已剥离
  ('w_hash_seed_alpha_001', 'ready', 'photo_camera', 'image/jpeg',
   2456789, 4032, 3024, 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
   'witness-raw/asset_seed_001', '[]'::jsonb, TRUE, '2026-08-20T12:10:00Z',
   'h_ip_seed_001', NOW() + INTERVAL '30 days', '2026-08-20T12:05:00Z'),

  -- Asset 2: ready
  ('w_hash_seed_alpha_002', 'ready', 'photo_library', 'image/jpeg',
   1876543, 4032, 3024, 'b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1',
   'witness-raw/asset_seed_002', '[]'::jsonb, TRUE, '2026-08-22T16:35:00Z',
   'h_ip_seed_002', NOW() + INTERVAL '30 days', '2026-08-22T16:30:00Z'),

  -- Asset 3: uploaded（待 Sharp 处理）
  ('w_hash_seed_alpha_003', 'uploaded', 'live_photo', 'image/heic',
   3567890, 4032, 3024, 'c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2',
   'witness-raw/asset_seed_003', '[]'::jsonb, FALSE, NULL,
   'h_ip_seed_003', NOW() + INTERVAL '30 days', '2026-08-23T08:00:00Z'),

  -- Asset 4: requested（仅 metadata，尚未上传）
  ('w_hash_seed_alpha_004', 'requested', 'photo_camera', 'image/jpeg',
   0, NULL, NULL, 'd4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3',
   NULL, '[]'::jsonb, FALSE, NULL,
   'h_ip_seed_004', NOW() + INTERVAL '30 days', '2026-08-23T09:00:00Z'),

  -- Asset 5: failed（处理失败 · 保留 audit 痕迹）
  ('w_hash_seed_alpha_005', 'failed', 'photo_camera', 'image/png',
   12345678, 4096, 3072, 'e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4',
   'witness-raw/asset_seed_005', '[]'::jsonb, FALSE, NULL,
   'h_ip_seed_005', NOW() + INTERVAL '30 days', '2026-08-23T10:00:00Z')
;

-- ============================================================
-- 5. Witness Submissions（3 个 · 覆盖 draft / submitted / published 三态）
-- ============================================================
-- 注: status_history 由触发器自动追加（初始 from=null to=draft）
-- ============================================================

-- 5.1 已 published（submission 1 · 对应 asset 1）
INSERT INTO witness_submissions (
  client_key, witness_id, status,
  media_type, asset_id,
  city_id, location_mode,
  captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
  description_text, description_locale, description_redacted,
  ip_hash, user_agent_class,
  submitted_at, reviewed_at, reviewed_by, published_at
) VALUES (
  'seed_alpha_001_publish_abc123def', 'w_hash_seed_alpha_001', 'published',
  'photo_camera', (SELECT id FROM assets WHERE witness_id = 'w_hash_seed_alpha_001' AND status = 'ready' LIMIT 1),
  'kyoto', 'auto_gps_city',
  '2026-08-20T12:00:00Z', 'Asia/Tokyo', 'exif', 'high',
  '今天京都下了一场短暂的雨', 'zh', 'present',
  'h_ip_seed_001', 'desktop_chrome',
  '2026-08-20T12:05:00Z', '2026-08-20T12:30:00Z', 'mod_hash_001', '2026-08-20T13:00:00Z'
);

-- 5.2 已 submitted（submission 2 · 对应 asset 2 · 待审核）
INSERT INTO witness_submissions (
  client_key, witness_id, status,
  media_type, asset_id,
  city_id, location_mode,
  captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
  description_text, description_locale, description_redacted,
  ip_hash, user_agent_class,
  submitted_at
) VALUES (
  'seed_alpha_002_submit_xyz789ghi', 'w_hash_seed_alpha_002', 'submitted',
  'photo_library', (SELECT id FROM assets WHERE witness_id = 'w_hash_seed_alpha_002' AND status = 'ready' LIMIT 1),
  'lisbon', 'manual_city',
  '2026-08-22T16:30:00Z', 'Europe/Lisbon', 'user_confirmed', 'manual',
  NULL, 'zh', 'absent',
  'h_ip_seed_002', 'ios_app',
  '2026-08-22T16:32:00Z'
);

-- 5.3 draft（submission 3 · 对应 asset 3 · 尚未提交）
INSERT INTO witness_submissions (
  client_key, witness_id, status,
  media_type, asset_id,
  city_id, location_mode,
  captured_at, captured_at_tz, captured_at_source, captured_at_confidence,
  description_text, description_locale, description_redacted,
  ip_hash, user_agent_class
) VALUES (
  'seed_alpha_003_draft_jkl012345mno', 'w_hash_seed_alpha_003', 'draft',
  'live_photo', (SELECT id FROM assets WHERE witness_id = 'w_hash_seed_alpha_003' AND status = 'uploaded' LIMIT 1),
  'reykjavik', 'auto_gps_city',
  '2026-08-23T08:00:00Z', 'Atlantic/Reykjavik', 'user_confirmed', 'manual',
  NULL, 'zh', 'absent',
  'h_ip_seed_003', 'mobile_safari'
);

-- ============================================================
-- 6. Private Locations（2 个 · 仅 submission 1/2 有 GPS · 明文存储供调试）
-- ============================================================
-- ⚠️ 实际生产: latitude/longitude 应为 BYTEA + pgp_sym_encrypt(per data-architecture-v1.md §4.1)
--    本 seed 用明文 DECIMAL(9,6) 便于 Alpha 调试 · 迁移到 V1.1 时改 BYTEA
-- ============================================================

INSERT INTO private_locations (
  submission_id, city_id, latitude, longitude, accuracy_meters, source
) VALUES
  ((SELECT id FROM witness_submissions WHERE client_key = 'seed_alpha_001_publish_abc123def'),
   'kyoto', 35.011665, 135.768326, 12.50, 'gps'),
  ((SELECT id FROM witness_submissions WHERE client_key = 'seed_alpha_002_submit_xyz789ghi'),
   'lisbon', 38.722301, -9.139337, 25.00, 'gps')
;

-- ============================================================
-- 7. Moderation Log（3 条 · 覆盖 assign / publish / reject 三种 action）
-- ============================================================
-- 注: V1 不实现 moderator UI · 仅保留数据用于未来 review
-- 注: RULE 阻止 UPDATE/DELETE · 测试可通过尝试 UPDATE 验证
-- ============================================================

INSERT INTO moderation_log (
  submission_id, moderator_id_hash, action,
  before_status, after_status,
  reason_code, public_reason, internal_notes,
  request_id, ip_hash
) VALUES
  -- 7.1 assign（指派给审核员）
  ((SELECT id FROM witness_submissions WHERE client_key = 'seed_alpha_001_publish_abc123def'),
   'mod_hash_001', 'assign',
   'submitted', 'under_review',
   NULL, NULL, '自动分配给 Kyoto 区域审核员',
   'req_seed_001_assign', 'h_ip_mod_001'),

  -- 7.2 publish（通过审核）
  ((SELECT id FROM witness_submissions WHERE client_key = 'seed_alpha_001_publish_abc123def'),
   'mod_hash_001', 'publish',
   'under_review', 'published',
   NULL, '高质量照片，已通过', '符合 V1 内容指南',
   'req_seed_001_publish', 'h_ip_mod_001'),

  -- 7.3 reject（拒绝 · 演示 audit log 不可变性）
  ((SELECT id FROM witness_submissions WHERE client_key = 'seed_alpha_002_submit_xyz789ghi'),
   'mod_hash_002', 'reject',
   'under_review', 'rejected',
   'low_quality', '照片模糊，请重新上传', '对焦不准，建议重拍',
   'req_seed_002_reject', 'h_ip_mod_002')
;

-- ============================================================
-- 8. Rate Limit Buckets（3 个 · 测试 5/h/IP 限流）
-- ============================================================
-- bucket_key 格式: witness_create:{ip_hash}:YYYYMMDDHH
-- ============================================================

INSERT INTO rate_limit_buckets (
  bucket_key, counter, window_start, window_end
) VALUES
  ('witness_create:h_ip_seed_001:2026082012', 3,
   '2026-08-20T12:00:00Z', '2026-08-20T13:00:00Z'),

  ('witness_create:h_ip_seed_002:2026082216', 1,
   '2026-08-22T16:00:00Z', '2026-08-22T17:00:00Z'),

  ('witness_create:h_ip_seed_003:2026082308', 5,
   '2026-08-23T08:00:00Z', '2026-08-23T09:00:00Z')
ON CONFLICT (bucket_key) DO NOTHING;

-- ============================================================
-- 9. Sanity Counts（应返回预期行数）
-- ============================================================
-- 注: 仅在直接执行 SQL 时显示结果 · 脚本化部署时此段输出会被忽略
-- ============================================================

-- SELECT 'cities'           AS table_name, COUNT(*) AS rows FROM cities
-- UNION ALL SELECT 'moments',          COUNT(*) FROM moments
-- UNION ALL SELECT 'assets',           COUNT(*) FROM assets
-- UNION ALL SELECT 'witness_submissions', COUNT(*) FROM witness_submissions
-- UNION ALL SELECT 'private_locations',   COUNT(*) FROM private_locations
-- UNION ALL SELECT 'moderation_log',      COUNT(*) FROM moderation_log
-- UNION ALL SELECT 'rate_limit_buckets',  COUNT(*) FROM rate_limit_buckets;

COMMIT;