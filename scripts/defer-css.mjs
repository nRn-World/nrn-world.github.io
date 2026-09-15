/**
 * Intentionally a no-op: deferring the ~14 KB gzip CSS delayed text LCP (H1)
 * more than it helped FCP. Keep the stylesheet render-blocking.
 */
console.log('defer-css: skipped (keep CSS blocking for text LCP)');
