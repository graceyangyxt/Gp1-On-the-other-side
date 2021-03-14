const gKey = 'AIzaSyCRp2lbrs-v_gZuyA8HJfvw6Ih4XKXCyI4';

let lat;
let lon;
let antLon;
let antLat;

// nav elements
const searchCont = document.querySelector('.search-container');
const navSearch = document.querySelector('#search-bar');
const currLocation = document.querySelector('.map-marker');
const submitBtn = document.querySelector('#search-btn');
const randomBtn = document.querySelector('#randomize');

// landing page elements
const landingSearch = document.querySelector('#landing-search-bar');
const landingCurrLoc = document.querySelector('.landing-map-marker');
const landingSubmitBtn = document.querySelector('#landing-search-btn');
const landingRandomBtn = document.querySelector('#landing-randomize');

// pages
const landingPg = document.querySelector('#landing-pg');
const initLocationPg = document.querySelector('.initial-location-pg');

// event listeners

// **nav-bar** current location icon - get current coordinates
currLocation.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log(lat, lon);

    initMap(lat, lon);
    // toggles visibility for the second page successfully
    if (initLocationPg.classList.contains('hide')) {
      initLocationPg.classList.remove('hide');
    }
    if (landingPg.classList.contains('hide') === false) {
      landingPg.classList.add('hide');
    }
  });
});

// ** landing page** current location icon - get current coordinates
landingCurrLoc.addEventListener('click', function () {
  landingPg.classList.add('hide'); // toggles visibility of landing page.
  // **** we need a loading bar or animation like Robert suggested while geolocation pulls the coordinates
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log(lat, lon);

    initMap(lat, lon);
    reverseGeo(lat, lon);
    if (initLocationPg.classList.contains('hide')) {
      initLocationPg.classList.remove('hide');
    }
    if (searchCont.classList.contains('hide')) {
      searchCont.classList.remove('hide'); // toggles visibility of navbar
    }
  });
});

// functions

// antipodal coordinates
function getAntipodes(x, y) {
  antLat = x * -1;
  antLon = y + 180;
}

// fetch api using coordinates
function reverseGeo(x, y) {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${x},${y}&key=${gKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
    });
}

function initMap(x, y) {
  if (x && y) {
    var z = 1;
    var interval = setInterval(increment, 1500);
    function increment() {
      if (z < 20) {
        z = (z % 20) + 3;
        const map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: x, lng: y },
          zoom: z,
          mapTypeId: 'satellite',
        });
        map.setTilt(45);
      }
    }
  }
}

// // fetch for fish data
// function getFish() {
//   fetch('https://fishbase.ropensci.org/species?offset=100')
//     .then(function (response) {
//       console.log(response);
//       return response.json();
//     })
//     .then(function (data) {
//       console.log(data);
//     });
// }

// getFish();
