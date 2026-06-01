// ===== 画像サイズ =====
    const imageWidth = 1000;
    const imageHeight = 1500;

    // ===== 地図作成 =====
    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -2
    });
    const smallIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

    iconSize: [20, 30], // 幅、高さ
    iconAnchor: [10, 30]
    });

    // ===== 画像範囲 =====
    const bounds = [[0, 0], [imageHeight, imageWidth]];

    // ===== キャンパスマップ画像 =====
    L.imageOverlay('campus-map.png', bounds).addTo(map);

    map.fitBounds(bounds);

    // ===== 建物ピン =====
    places.forEach(place => {
      L.marker([place.y, place.x],{icon: smallIcon})
        .addTo(map)
        .bindPopup(place.name);
    });
    map.on('click', function(e) {
  alert(e.latlng);
});

    // ===== 現在地ピン =====
    let currentMarker = L.marker([800, 500],{icon: smallIcon})
      .addTo(map)
      .bindPopup("現在地");

    // ===== 現在地へ移動 =====
    function showCurrentLocation() {
      map.setView([800, 500], 0);
      currentMarker.openPopup();
    }

    // ===== 拡大 =====
    function zoomIn() {
      map.zoomIn();
    }

    // ===== 縮小 =====
    function zoomOut() {
      map.zoomOut();
    }

    // ===== 検索 =====
    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("keypress", function(event) {

      if (event.key === "Enter") {

        const input = searchBox.value;

        const result = places.find(place =>
          place.name.includes(input)
        );

        if (result) {

          map.setView([result.y, result.x], 1);

          L.marker([result.y, result.x])
            .addTo(map)
            .bindPopup(result.name)
            .openPopup();

        } else {

          alert("見つかりません");

        }
      }
    });
