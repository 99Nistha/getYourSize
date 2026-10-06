/**
 * GetYourSize — universal size-recommendation widget.
 *
 * Usage (automatic):
 *   <script src="getyoursize.js" data-category="tops"></script>
 *
 * Usage (manual button placement):
 *   <div id="getyoursize-btn"></div>
 *   <script src="getyoursize.js"></script>
 *
 * Usage (config override):
 *   <script>
 *     window.GetYourSizeConfig = {
 *       sizeChart: { sizes: [...], unit: 'cm', chartType: 'body' },
 *       gender: 'women',
 *       garmentType: 'kurta',
 *     };
 *   </script>
 *   <script src="getyoursize.js"></script>
 */

import { injectButton } from './ui/button.js';
import { Modal }        from './ui/modal.js';
import { scanPage }     from './core/page-scanner.js';

(async function init() {
  try {
    // Read config from window or script tag
    const scriptTag = document.currentScript;
    const config    = window.GetYourSizeConfig || {};

    const gender      = config.gender      || scriptTag?.dataset.gender      || 'women';
    const garmentType = config.garmentType || scriptTag?.dataset.category    || 'tops';

    // Scan the page for a size chart (runs in background)
    const chartPromise = config.sizeChart
      ? Promise.resolve(config.sizeChart)
      : scanPage();

    // Build modal
    const modal = new Modal();

    // Wire result callback — could dispatch a custom event for brand JS to hook into
    modal.onResult(result => {
      document.dispatchEvent(new CustomEvent('getyoursize:result', { detail: result }));
    });

    // Inject the trigger button
    injectButton(async () => {
      // Resolve chart (may already be done) before opening
      const chart = await chartPromise.catch(() => null);
      modal.setSizeChart(chart);
      modal.open();
    });

  } catch (err) {
    // Never let the widget crash the host page
    console.warn('[GetYourSize] Failed to initialise:', err);
  }
})();
