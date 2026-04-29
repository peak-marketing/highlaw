(function () {
  const mapEl = document.getElementById('naverMap');
  if (!mapEl || !window.naver || !window.naver.maps) return;

  const highlaw = new naver.maps.LatLng(37.50056, 127.03535);
  const map = new naver.maps.Map(mapEl, {
    center: highlaw,
    zoom: 17,
    minZoom: 12,
    scaleControl: false,
    logoControl: true,
    mapDataControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT
    }
  });

  new naver.maps.Marker({
    position: highlaw,
    map,
    title: '법무법인 하이로',
    icon: {
      content: '<div class="naver-map-marker">HIGHLAW</div>',
      anchor: new naver.maps.Point(43, 46)
    }
  });
})();
