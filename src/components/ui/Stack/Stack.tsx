/* ============================================================
   Stack · v1.5 · ui/Stack
   - Flex / Grid 间距 token 化
   - direction: row / column
   - gap: space-N (引用 --space-1..13)
   - align / justify: 8 档标准 flex
   ============================================================ */

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Children } from 'react';
import styles from './Stack.module.css';

export type StackDirection = 'row' | 'column';
export type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type StackAlign =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline';
export type StackJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around';

export type StackProps = {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  block?: boolean;
  separator?: ReactNode;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

const alignMap: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};

function splitWithSeparator(
  children: ReactNode,
  separator: ReactNode,
): ReactNode[] {
  const arr = Children.toArray(children).filter(Boolean);
  const out: ReactNode[] = [];
  arr.forEach((child, i) => {
    if (i > 0) out.push(<span key={`sep-${i}`} aria-hidden="true">{separator}</span>);
    out.push(child);
  });
  return out;
}

/**
 * 间距 / 布局容器。取代 .module.css 内联的 flex + gap 写法。
 *
 * @example 上下结构
 *   <Stack direction="column" gap={5}>
 *     <h2>标题</h2>
 *     <p>正文</p>
 *   </Stack>
 *
 * @example 水平 nav
 *   <Stack direction="row" gap={4} align="center">
 *     <Link>城市</Link>
 *     <Link>日志</Link>
 *     <Link>关于</Link>
 *   </Stack>
 *
 * @example chip 列表
 *   <Stack direction="row" gap={2} wrap>
 *     <Tag>东京</Tag>
 *     <Tag>雷克雅未克</Tag>
 *     <Tag>罗马</Tag>
 *   </Stack>
 */
export function Stack({
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap = false,
  block = false,
  separator,
  className,
  children,
  style,
  ...rest
}: StackProps) {
  // CSS 变量通过 as 断言绕过类型检查(React CSSProperties 类型不含自定义属性)
  const inlineStyle = {
    ...(style as Record<string, string | number> | undefined),
    '--stack-gap': `var(--space-${gap})`,
  } as CSSProperties;

  if (align) (inlineStyle as Record<string, string>).alignItems = alignMap[align];
  if (justify) (inlineStyle as Record<string, string>).justifyContent = justifyMap[justify];
  if (wrap) (inlineStyle as Record<string, string>).flexWrap = 'wrap';
  if (block) (inlineStyle as Record<string, string>).display = 'flex';

  const cls = [
    styles.stack,
    styles[`d-${direction}`],
    block ? styles.block : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (separator) {
    return (
      <div className={cls} style={inlineStyle} {...rest}>
        {splitWithSeparator(children, separator)}
      </div>
    );
  }
  return (
    <div className={cls} style={inlineStyle} {...rest}>
      {children}
    </div>
  );
}
