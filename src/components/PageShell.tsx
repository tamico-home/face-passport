import type { ReactNode } from 'react';
import { AirmailBorder } from './AirmailBorder';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  footer?: ReactNode;
  bare?: boolean;
}

export function PageShell({ children, footer, bare }: PageShellProps) {
  return (
    <div className={styles.shell}>
      <AirmailBorder />
      <main className={bare ? styles.mainBare : styles.main}>{children}</main>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </div>
  );
}
