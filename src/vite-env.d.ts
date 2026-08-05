/// <reference types="vite/client" />

/* CSS Modules — type augmentation for `import styles from './x.module.css'`. */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
