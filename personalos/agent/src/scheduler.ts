import Bree from 'bree';
import path from 'path';

const scheduler = new Bree({
  root: path.join(__dirname, '../jobs'),
  jobs: [
    {
      name: 'morning-overview',
      cron: '0 8 * * *', // 8:00 AM daily
    },
    // Phase 2: Add more jobs
    // {
    //   name: 'email-scanner',
    //   interval: '1h', // Every hour
    // },
    // {
    //   name: 'relationship-refresh',
    //   cron: '0 9 * * 1', // Monday 9am
    // },
  ],
});

export default scheduler;
