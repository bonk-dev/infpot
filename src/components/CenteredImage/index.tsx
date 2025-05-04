import type {ReactNode} from 'react';
import styles from './styles.module.css';

interface CenteredImageProps {
    src: string | ReactNode,
    alt?: string
};

export default function CenteredImage({ src, alt }: CenteredImageProps): ReactNode {
  return (
    <div>
        <div className={styles.center}>
            <article>
                { typeof src === 'string' 
                    ? (<img src={src} alt={alt}/>) 
                    : <span className={styles.noColorScheme + ' ' + styles.svgResize}>{src}</span> }
            </article>
        </div>
        <p className={styles.caption}>{alt}</p>
    </div>
  );
}
