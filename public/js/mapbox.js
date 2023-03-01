/* eslint-disable */


export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGhhZmVyaHMxIiwiYSI6ImNsZW1wdzV5dDE3b2QzcHBnOWUybW10a3MifQ.AJUJisk4vPgJbJacztw9eQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dhaferhs1/clemsh1y0000201kq49fp33jd/draft',
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    //create Marker
    const el = document.createElement('div');
    el.className = 'marker';
    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    }).setLngLat(location.coordinates).addTo(map);
    // add a popup
    new mapboxgl.Popup({
      offset: 30,
    }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);
    // extends the map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    }
  });

};