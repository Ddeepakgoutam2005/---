import cron from 'node-cron';
import { processNewsFeeds } from '../services/newsProcessor.js';

export function startScheduler() {
    console.log('Starting News Scheduler (Every 6 hours)...');

    // Run every 6 hours: '0 */6 * * *'
    cron.schedule('0 */6 * * *', async () => {
        console.log('[Scheduler] Starting automated news fetch & classification...');
        try {
            const results = await processNewsFeeds();
            console.log(`[Scheduler] Completed. Processed ${results.length} items.`);
        } catch (err) {
            console.error('[Scheduler] Error processing news:', err);
        }
    });
}
