import DefaultLayout from '@theme-original/Layout'; 
import React, { JSX } from 'react';
import type { Props } from '@theme/Layout';
import styles from './Layout.module.css';
import OfflineStatus from '../OfflineStatus';
import InstallPWA from '../InstallPWA';

export default function Layout(props: Props): JSX.Element {
  return (
    <>
      <DefaultLayout {...props} />
      <OfflineStatus />
      <InstallPWA />
    </>
  );
}