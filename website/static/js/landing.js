(function () {
  var scrollPosY = 0;
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('#threed-chart')) {
      return;
    }

    function transform() {
      var s = ['components'];
      s.push('state-' + Math.min(2, Math.floor(scrollPosY / 120)));
      document.querySelector('#threed-chart').className = s.join(' ');
    }

    var timer = null;

    window.addEventListener('scroll', function (e) {
      if (scrollPosY === Math.max(0, window.scrollY)) {
        return;
      }

      scrollPosY = Math.max(0, window.scrollY);

      if (!timer) {
        timer = window.requestAnimationFrame(function () {
          transform();
          timer = null;
        });
      }
    });
  });
})();
