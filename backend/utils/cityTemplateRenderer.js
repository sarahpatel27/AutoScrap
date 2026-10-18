const fs = require('fs');
const path = require('path');

/**
 * Escapes characters with special meaning in HTML to prevent XSS attacks.
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const templatePath = path.join(__dirname, '../templates/cityNotFound.html');
let cachedTemplate = null;

/**
 * Loads the HTML template once from disk and caches it in memory.
 */
function getTemplate() {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(templatePath, 'utf8');
  }
  return cachedTemplate;
}

/**
 * Renders the city-not-found HTML by replacing the {{CITY_NAME}} placeholder
 * with the HTML-escaped city name.
 *
 * @param {string} cityName - Human-readable city name to display.
 * @returns {string} Fully rendered HTML string.
 */
function renderCityNotFoundHtml(cityName) {
  const safeCityName = escapeHtml(cityName);
  const template = getTemplate();
  return template.replace(/\{\{CITY_NAME\}\}/g, safeCityName);
}

module.exports = {
  renderCityNotFoundHtml,
  escapeHtml,
};
