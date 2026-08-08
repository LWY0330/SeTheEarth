/* ============================================================
   看见地球 · v2.60.0 · WMO Weather Code mapping
   - 单一真相源：把 open-meteo 返回的 weather_code（WMO 编码）
     翻译成 (1) 中文简短文案 + (2) 图标名（再由 WeatherIcon 渲染 SVG）
   - 完全对齐 spec 文档第二节 #4 的 WMO 表格
     0          晴
     1, 2, 3    多云
     45, 48     雾
     51, 53, 55 毛毛雨
     61, 63, 65 雨
     71, 73, 75 雪
     80, 81, 82 阵雨
     95, 96, 99 雷暴
   ============================================================ */

/** 与 SVG 图标组件一一对应的图标名 */
export type WeatherIconName =
  | 'sun'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'unknown';

export function getWeatherSummary(code: number): string {
  if (code === 0) return '晴';
  if (code >= 1 && code <= 3) return '多云';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 55) return '毛毛雨';
  if (code >= 61 && code <= 65) return '雨';
  if (code >= 71 && code <= 75) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code >= 95) return '雷暴';
  return '未知';
}

export function getWeatherIcon(code: number): WeatherIconName {
  if (code === 0) return 'sun';
  if (code >= 1 && code <= 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 71 && code <= 75) return 'snow';
  // 80-82 阵雨复用 rain（视觉上同样是雨，强度不同）
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95) return 'thunder';
  return 'unknown';
}
