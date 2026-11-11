// ---------- jQuery effects ----------
$(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. smooth scroll to in-page anchors (stop(true) so quick repeated clicks do not stack)
  $('a[href^="#"]').on('click', function (event) {
    const id = this.getAttribute('href');
    const $target = id.length > 1 ? $(id) : $();
    if (!$target.length) return;
    event.preventDefault();
    const top = $target.offset().top - ($('.navbar').outerHeight() || 0);
    $('html, body').stop(true).animate({ scrollTop: top }, reduceMotion ? 0 : 600);
    history.replaceState(null, '', id);
  });

  // 2. accordion for the events on the home page
  $('.event-toggle').on('click', function () {
    const $button = $(this);
    const $panel = $('#' + $button.attr('aria-controls'));
    $panel.stop(true, true); // finish a running animation first, then toggle
    if ($button.attr('aria-expanded') === 'true') {
      $panel.slideUp(250, () => $button.attr('aria-expanded', 'false'));
    } else {
      $panel.slideDown(250, () => $button.attr('aria-expanded', 'true'));
    }
  });

  // 3. menu cards fade in every time the list is rebuilt (search, filter, sort)
  document.addEventListener('menu:rendered', () => {
    $('#menuGrid .dish').fadeTo(0, 0).fadeTo(300, 1);
  });

  // 4. floating "your order" button fades in and out with the cart
  document.addEventListener('cart:changed', event => {
    const $fab = $('#cartFab');
    if (!$fab.length) return;
    const visible = $fab.css('display') !== 'none';
    if (event.detail.count > 0 && !visible) {
      $fab.stop(true, true).css({ display: 'inline-flex', opacity: 0 }).fadeTo(250, 1);
    } else if (event.detail.count === 0 && visible) {
      $fab.stop(true, true).fadeTo(200, 0, () => $fab.css('display', 'none'));
    }
  });

  // 5. success message slides down, and slides away when the visitor edits the form again
  document.addEventListener('order:placed', () => {
    $('#formMsg').stop(true, true).slideDown(300);
  });
  $('#orderForm').on('input change', () => {
    const $msg = $('#formMsg');
    if ($msg.is(':visible')) $msg.stop(true, true).slideUp(200);
  });

  // 6. loyalty page: join confirmation slides down, and away when the visitor edits the form again
  document.addEventListener('join:done', () => {
    $('#joinMsg').stop(true, true).slideDown(300);
  });
  $('#joinForm').on('input change', () => {
    const $msg = $('#joinMsg');
    if ($msg.is(':visible')) $msg.stop(true, true).slideUp(200);
  });

  // 7. card builder: the preview flickers softly when it changes, the saved message slides down
  document.addEventListener('card:changed', () => {
    $('#clubCard').stop(true, true).fadeTo(90, 0.75).fadeTo(180, 1);
  });
  document.addEventListener('card:saved', () => {
    $('#cardMsg').stop(true, true).slideDown(300);
  });
  $('#cardForm').on('input', () => {
    const $msg = $('#cardMsg');
    if ($msg.is(':visible')) $msg.stop(true, true).slideUp(200);
  });
});
