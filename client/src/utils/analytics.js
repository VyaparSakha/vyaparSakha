/**
 * Google Analytics (gtag.js) Utility Helpers
 * Measurement ID: G-5NHJF9Q5ZS
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5NHJF9Q5ZS";

/**
 * Log pageview to Google Analytics
 * @param {string} url - Current path/URL
 */
export const pageview = (url) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * Log specific custom event to Google Analytics
 * @param {Object} eventParams
 * @param {string} eventParams.action - Name of the event (e.g. 'generate_bill', 'sign_up')
 * @param {string} [eventParams.category] - Event category (e.g. 'Billing', 'Store')
 * @param {string} [eventParams.label] - Event label (e.g. 'Offline Bill Created')
 * @param {number} [eventParams.value] - Optional numeric value
 * @param {Object} [eventParams.params] - Additional key-value parameters
 */
export const trackEvent = ({ action, category, label, value, ...params }) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};
