import type {ReactNode} from 'react';
import styles from './styles.module.css';

export default function CenteredImage({ src, alt }): ReactNode {
  return (
    <div>
        <div className={styles.center}>
            <article>
                <img src={src} alt={alt}/>
            </article>
        </div>
        <p className={styles.caption}>{alt}</p>
    </div>
  );
}
