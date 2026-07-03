import styles from './Disclaimer.module.css';

interface DisclaimerProps {
  compact?: boolean;
}

export function Disclaimer({ compact }: DisclaimerProps) {
  return (
    <div className={compact ? styles.compact : styles.block}>
      <p>本診断はエンタメです。人種・民族・国籍・ルーツを判定するものではありません。</p>
      <p>写真はスマホの中だけで処理され、送信・保存されません。</p>
    </div>
  );
}
