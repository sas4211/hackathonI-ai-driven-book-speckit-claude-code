import React from 'react';
import Layout from '@theme/Layout';
import ProgressDashboard from '../components/ProgressTracker/ProgressDashboard';
import styles from './progress.module.css';

export default function ProgressPage(): JSX.Element {
  return (
    <Layout
      title="Learning Progress"
      description="Track your progress through the AI & ML Interactive Book"
    >
      <div className={styles.progressPage}>
        <ProgressDashboard />
      </div>
    </Layout>
  );
}