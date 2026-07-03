import { PageShell } from '../components/PageShell';
import styles from './PrivacyScreen.module.css';

interface PrivacyScreenProps {
  onBack: () => void;
}

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <PageShell>
      <div className={styles.wrap}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← 戻る
        </button>
        <h1 className={styles.title}>プライバシーポリシー</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>写真・映像の取り扱いについて</h2>
          <p className={styles.body}>
            「顔面パスポート」は、カメラで撮影した写真や顔の特徴データを、あなたのスマートフォン・PCの中だけで処理します。撮影した画像や解析結果がサーバーに送信されることはなく、どこにも保存されません。ブラウザのタブを閉じれば、その場でデータは消えてなくなります。
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>通信について</h2>
          <p className={styles.body}>
            初回アクセス時に、アプリ本体や顔検出のためのプログラムファイルを配信サーバー(CDN)から読み込みます。これらは事前にこのサイトに同梱されたファイルであり、あなたの写真や個人情報を含みません。撮影後の通信は一切発生しません。
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>診断結果のシェアについて</h2>
          <p className={styles.body}>
            「結果画像を保存・シェア」機能で生成される画像には、診断結果(国名・称号・グラフ)のみが含まれ、あなたの顔写真は一切含まれません。シェアするかどうかは完全にあなたの判断です。
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>アクセス解析について</h2>
          <p className={styles.body}>
            本サービスでは、現時点でアクセス解析ツールを導入していません。将来的に導入する場合も、個人を特定できないクッキーレスの解析(Cloudflare Web Analytics 等)のみを検討し、写真や診断結果を収集することはありません。
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>本診断の性質について</h2>
          <p className={styles.body}>
            本サービスはエンタメを目的としたものであり、人種・民族・国籍・ルーツを科学的に判定するものではありません。診断結果は占いと同様の娯楽コンテンツとしてお楽しみください。
          </p>
        </div>
      </div>
    </PageShell>
  );
}
