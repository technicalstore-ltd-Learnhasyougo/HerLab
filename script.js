/**
 * AI News June 2026 — Filter Controls
 *
 * Category filter buttons let users show/hide cards
 * by data-category attribute.
 */
(function () {
  'use strict';

  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards      = document.querySelectorAll('.card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // deactivate all buttons
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();
