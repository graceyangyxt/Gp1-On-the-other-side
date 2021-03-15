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
// const randomBtn = document.querySelector('#randomize');

// landing page elements
const landingSearch = document.querySelector('#landing-search-bar');
const landingCurrLoc = document.querySelector('.landing-map-marker');
const landingSubmitBtn = document.querySelector('#landing-search-btn');
// const landingRandomBtn = document.querySelector('#landing-randomize');

// results page elements
const antipodeBtn = document.querySelector('#antipdal-btn');

// pages
const landingPg = document.querySelector('#landing-pg');
const resultsPg = document.querySelector('.results-pg');

// event listeners

// ** nav-bar ** current location icon - get current coordinates
currLocation.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    // console.log(lat, lon);

    // console.log(lat, lon);
    // getAntipodes(lat, lon);
    // console.log(antLat, antLon);
    initMap(lat, lon);
    reverseGeo(lat, lon);

    // toggles visibility for the second page successfully
    if (resultsPg.classList.contains('hide')) {
      resultsPg.classList.remove('hide');
    }
    if (landingPg.classList.contains('hide') === false) {
      landingPg.classList.add('hide');
    }
  });
});

// ** nav-bar ** searched location
submitBtn.addEventListener('click', function (e) {
  e.preventDefault();
  console.log(navSearch.value);
  const searchValue = navSearch.value;
  searchGeo(searchValue);
  navSearch.value = '';
});

// ** landing page ** current location icon - get current coordinates
landingCurrLoc.addEventListener('click', function () {
  landingPg.classList.add('hide'); // toggles visibility of landing page.
  // **** we need a loading bar or animation like Robert suggested while geolocation pulls the coordinates
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log(lat, lon);

    initMap(lat, lon);
    reverseGeo(lat, lon);
    if (resultsPg.classList.contains('hide')) {
      resultsPg.classList.remove('hide');
    }
    if (searchCont.classList.contains('hide')) {
      searchCont.classList.remove('hide'); // toggles visibility of navbar
    }
  });
});

//  ** landing page ** searched location
landingSubmitBtn.addEventListener('click', function (e) {
  e.preventDefault();
  landingPg.classList.add('hide');
  console.log(landingSearch.value);
  const searchValue = landingSearch.value;
  searchGeo(searchValue);
  if (resultsPg.classList.contains('hide')) {
    resultsPg.classList.remove('hide');
  }
  if (searchCont.classList.contains('hide')) {
    searchCont.classList.remove('hide'); // toggles visibility of navbar
  }
});

// ** results page **
antipodeBtn.addEventListener('click', function () {
  getFromLocalStorage(lat, lon);
  console.log(lat, lon);
  getAntipodes(lat, lon);
  console.log(antLat, antLon);
  initMap(antLat, antLon);
});

// functions

// antipodal coordinates
function getAntipodes(x, y) {
  antLat = x * -1;
  antLon = y + 180;
}

// fetch api using coordinates - https://developers.google.com/maps/documentation/geocoding/overview#geocoding-requests
function reverseGeo(x, y) {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${x},${y}&key=${gKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const city = data.results[6].address_components[1].long_name;
      const state = data.results[6].address_components[2].long_name;
      const country = data.results[6].address_components[3].long_name;
      document.querySelector('.city').textContent = city;
      document.querySelector('.state').textContent = state;
      document.querySelector('.country').textContent = country;

      saveToLocalStorage(x, y);
    });
}

// fetch api for search bar - https://developers.google.com/maps/documentation/geocoding/overview#geocoding-requests
function searchGeo(x) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${x}&key=${gKey}
  `)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const lat = data.results[0].geometry.location.lat;
      const lon = data.results[0].geometry.location.lng;
      const city = data.results[0].address_components[0].long_name;
      const state = data.results[0].address_components[2].long_name;
      const country = data.results[0].address_components[3].long_name;
      document.querySelector('.city').textContent = city;
      document.querySelector('.state').textContent = state;
      document.querySelector('.country').textContent = country;

      saveToLocalStorage(lat, lon);
      initMap(lat, lon);
    });
}

// map https://developers.google.com/maps/documentation/javascript/overview
function initMap(x, y) {
  if (x && y) {
    console.log(document.getElementById('map'));
    document.getElementById('map').innerHTML = '';
    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: x, lng: y },
      zoom: 15,
      mapTypeId: 'satellite',
      mapTypeControl: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER,
      },
      scaleControl: false,
      streetViewControl: false,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP,
      },
      fullscreenControl: false,
    });
    map.setTilt(45);
  }
}

// save selected coordinates to local storage
function saveToLocalStorage(x, y) {
  if (x && y) {
    localStorage.setItem('lat', x);
    localStorage.setItem('lon', y);
  }
}

// get selected coordinates from local storage
function getFromLocalStorage() {
  lat = JSON.parse(localStorage.getItem('lat'));
  lon = JSON.parse(localStorage.getItem('lon'));
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
