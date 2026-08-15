/* ============================================================
   看见地球 · v1.3 · HotkeyHelp (PR #13)
   - 中央 Modal：9 个快捷键清单
   - 受控：父组件 open + onClose
   - 关闭由 useHotkeys 处理（`?` / `Esc` → actions.hideHelp）
   - 半透明遮罩 + 居中卡片，纯 inline style（无新增 css 文件）
   ============================================================ */

import { Button } from '@/components/ui';

export type HotkeyHelpProps = {
  open: boolean;
  onClose: () => void;
};

const ROWS: ReadonlyArray<readonly [string, string]> = [
  ['← / →',           '板块 2 上一城 / 下一城'],
  ['j / k',           '板块 2 列表向下 / 向上移动焦点'],
  ['/',               '聚焦搜索框'],
  ['?',               '打开 / 关闭本快捷键面板'],
  ['Esc',             '关闭 Modal / Drawer / 退出当前态'],
  ['g h',             '跳到首屏 home (/)'],
  ['g c',             '跳到 /cities 索引'],
  ['g a',             '跳到 /about 关于页'],
  ['← 移动端',         '快捷键在移动端自动禁用（触屏主导）'],
];

export function HotkeyHelp({ open, onClose }: HotkeyHelpProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="快捷键帮助"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          color: '#1a1a1a',
          borderRadius: 12,
          padding: '24px 24px 16px',
          minWidth: 360,
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            快捷键 · Hotkeys
          </h2>
          {/* v1.5 · PROMPT 17 · Stage 3 · Button 接入 close icon */}
          <Button variant="ghost" size="md" onClick={onClose} aria-label="关闭">
            ×
          </Button>
        </header>

        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <tbody>
            {ROWS.map(([k, desc], i) => (
              <tr
                key={k + ':' + i}
                style={{ borderTop: i === 0 ? 'none' : '1px solid #eee' }}
              >
                <td
                  style={{
                    padding: '10px 16px 10px 0',
                    width: '40%',
                    verticalAlign: 'top',
                  }}
                >
                  {k.split(' ').map((part, idx) => (
                    <span key={idx}>
                      {idx > 0 && ' '}
                      <kbd
                        style={{
                          background: '#f4f4f4',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 12,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {part}
                      </kbd>
                    </span>
                  ))}
                </td>
                <td style={{ padding: '10px 0', color: '#333' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p
          style={{
            marginTop: 14,
            color: '#777',
            fontSize: 12,
            textAlign: 'right',
          }}
        >
          按 <kbd style={kbdFootStyle}>?</kbd> 或{' '}
          <kbd style={kbdFootStyle}>Esc</kbd> 关闭
        </p>
      </div>
    </div>
  );
}

const kbdFootStyle = {
  background: '#f4f4f4',
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: '1px 5px',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  fontSize: 11,
} as const;

export default HotkeyHelp;
