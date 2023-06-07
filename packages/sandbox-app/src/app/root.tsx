// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './root.module.css';
import { Nav } from './nav';
import { Outlet } from 'react-router';

export function Root() {
  return (
    <div className={styles.workspace}>
      <Outlet />
    </div>
  );
}

export default Root;
