// Load Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// Track page view
ga('create', 'UA-90997706-2', 'auto');
ga('send', 'pageview');

// Track outbound links
window.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var hit_fallback;

  // Clear the timer to prevent the fallback code being executed while navigating back (bfcache)
  window.addEventListener('pagehide', function () { window.clearTimeout(hit_fallback); });

  [].forEach.call(document.querySelectorAll('a[href^="http"]'), function ($link) {
    $link.addEventListener('click', function (event) {
      if ($link.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return false;
      }

      ga('send', 'event', 'Outbound Link', 'click', $link.href, {
        'transport': 'beacon',
        'hitCallback': function () { document.location = $link.href; }
      });

      // Fallback when the `hitCallback` function doesn't work for some reason
      hit_fallback = window.setTimeout(function () { document.location = $link.href; }, 1000);

      event.preventDefault();
      event.stopPropagation();

      return false;
    });
  });
}, { once: true });
