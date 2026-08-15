/* ============================================================
   ui/ · v1.5 barrel
   - 集中 export 6 组件(Button / Tag / Stack / Card / Input / Modal)
   - 业务代码 import 路径:import { Button, Tag } from '@/components/ui'
   - 详见 ./README.md
   ============================================================ */

// 注:ui 6 组件只有 named export (export function Button {...}),没有 default
// 所以这里用 named export re-export,不要用 `export { default as ... }`

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button/Button';
export { Tag, type TagProps, type TagTone, type TagSize } from './Tag/Tag';
export { Stack, type StackProps, type StackDirection, type StackGap, type StackAlign, type StackJustify } from './Stack/Stack';
export { Card, type CardProps, type CardVariant } from './Card/Card';
export { Input, type InputProps, type InputVariant, type InputSize } from './Input/Input';
export { Modal, type ModalProps, type ModalSize } from './Modal/Modal';
