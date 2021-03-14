const navSearch = document.querySelector('#search-bar');
const currLocation = document.querySelector('.map-marker');
const submitBtn = document.querySelector('#search-btn');
const randomBtn = document.querySelector('#randomize');

let lat;
let lon;
let antLon;
let antLat;

// event listeners

// current location icon - get current coordinates
currLocation.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude.toString();
    lon = position.coords.longitude.toString();
    console.log(lat, lon);

    // test to see antipode function works
    getAntipodes();
    console.log(antLat, antLon);
  });
});

// functions

// antipodal coordinates
function getAntipodes() {
  antLat = lat * -1;
  antLon = lon + 180;
}

// functions
// function getCoords() {
//   navigator.geolocation.getCurrentPosition(function (position) {
//     let lat = position.coords.latitude;
//     let lon = position.coords.longitude;
//     console.log(lat, lon);
//   });
// }
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
