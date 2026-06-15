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
    L.imageOverlay('campus-map2.png', bounds).addTo(map);

    map.fitBounds(bounds);

    // ===== 建物ピン =====
places.forEach(place => {

  L.marker([place.y, place.x], {icon: smallIcon})
    .addTo(map)
    .on("click", () => {
      showFloorSelect(place);
    });

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

          if (result) {

  map.setView([result.y, result.x], 1);

    L.popup({
      offset: [0, -20]
    })
    .setLatLng([result.y, result.x])
    .setContent(result.name)
    .openOn(map);

} else {

  alert("見つかりません");

}
        } else {

          alert("見つかりません");

        }
      }
    });
    function showFloorSelect(place){

  document.getElementById("buildingTitle")
    .textContent = place.name;

  const floorButtons =
    document.getElementById("floorButtons");

  floorButtons.innerHTML = "";

  for(const floor in place.floors){

    const btn = document.createElement("button");

    btn.textContent = floor;

    btn.onclick = () => {
      openFloorMap(place.floors[floor]);
    };

    floorButtons.appendChild(btn);
  }

  document.getElementById("floorSelect")
    .style.display = "block";
}

function closeFloorSelect(){

  document.getElementById("floorSelect")
    .style.display = "none";
}

function openFloorMap(imagePath){

  closeFloorSelect();

  document.getElementById("floorImage").src =
    imagePath;

  document.getElementById("floorMapModal")
    .style.display = "block";
}

function closeFloorMap(){

  document.getElementById("floorMapModal")
    .style.display = "none";
}
