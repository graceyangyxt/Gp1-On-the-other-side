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

// landing page elements
const landingSearch = document.querySelector('#landing-search-bar');
const landingCurrLoc = document.querySelector('.landing-map-marker');
const landingSubmitBtn = document.querySelector('#landing-search-btn');

// results page elements
const antipodeBtn = document.querySelector('#antipdal-btn');
const locationAppendCont = document.querySelector('#location-append');
let titleEl;

// pages
const landingPg = document.querySelector('#landing-pg');
const resultsPg = document.querySelector('.results-pg');

// event listeners

// ** nav-bar ** current location icon - get current coordinates
currLocation.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    clearLocation();
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
  const searchValue = navSearch.value;
  clearLocation();
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

    clearLocation();
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

  const searchValue = landingSearch.value;

  clearLocation();
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
  getAntipodes(lat, lon);
  clearLocation();
  reverseGeo(antLat, antLon);
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
      if (response.status !== 200) {
        // modal
        console.log('damn');
      } else {
        return response.json().then(function (data) {
          console.log(data);
          if (data.results[0].address_components.length >= 4) {
            const city = data.results[0].address_components[3].long_name;
            const state = data.results[0].address_components[5].long_name;
            const country = data.results[0].address_components[6].long_name;

            appendLocation(city, state, country);
          } else if (data.results[0].address_components.length >= 3) {
            const state = data.results[0].address_components[1].long_name;
            const country = data.results[0].address_components[2].long_name;

            appendLocation(state, country);
          } else {
            const state = data.results[0].formatted_address;
            console.log(state);

            appendLocation(state);
          }

          saveToLocalStorage(lat, lon);
          initMap(x, y);
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

// fetch api for search bar - https://developers.google.com/maps/documentation/geocoding/overview#geocoding-requests
function searchGeo(x) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${x}&key=${gKey}
  `)
    .then(function (response) {
      if (response.status !== 200) {
        // modal
      } else {
        return response.json().then(function (data) {
          console.log(data);
          const lat = data.results[0].geometry.location.lat;
          const lon = data.results[0].geometry.location.lng;

          if (data.results[0].address_components.length >= 4) {
            const city = data.results[0].address_components[1].long_name;
            const state = data.results[0].address_components[2].long_name;
            const country = data.results[0].address_components[3].long_name;

            appendLocation(city, state, country);
          } else if (data.results[0].address_components.length >= 3) {
            const state = data.results[0].address_components[1].long_name;
            const country = data.results[0].address_components[2].long_name;

            appendLocation(state, country);
          } else {
            const state = data.results[0].formatted_address;
            console.log(state);

            appendLocation(state);
          }

          saveToLocalStorage(lat, lon);
          initMap(lat, lon);
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

// map https://developers.google.com/maps/documentation/javascript/overview
function initMap(x, y) {
  if (x && y) {
    document.getElementById('map').innerHTML = '';
    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: x, lng: y },
      zoom: 10,
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

// append name of location for map
function appendLocation(x, y, z) {
  titleEl = document.createElement('div');
  titleEl.classList.add('current-location-cont');
  if (x && y && z) {
    titleEl.innerHTML = `
  <div class="location-header">
  <h2>${x},</h2>
  <h2>${y}</h2>
  </div>
  <h2>${z}</h2>
  </div>`;
    locationAppendCont.appendChild(titleEl);
    console.log(locationAppendCont.appendChild(titleEl));
  } else if (y && z) {
    titleEl.innerHTML = `
  <div class="location-header">
  <h2>${y},</h2>
  <h2>${z}</h2>
  </div>
  </div>`;
    locationAppendCont.appendChild(titleEl);
  } else if (y) {
    titleEl.innerHTML = `
    <div class="location-header>
    <h2>${y}</h2>
    </div>`;
    locationAppendCont.appendChild(titleEl);
    console.log(locationAppendCont.appendChild(titleEl));
  }
}

// clear name of location for map
function clearLocation() {
  if (titleEl === true) {
    locationAppendCont.removeChild(titleEl);
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

// function getNasa(x,y) {
//   fetch(
//     `https://api.nasa.gov/planetary/earth/assets?lon=-${x}&lat=${y}&date=2018-01-01&&dim=0.10&api_key=8nssXB6HM9dQ02LP8ZPLLNxSbtsSIt4hIWisVIVG`
//   )
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       console.log(data);
//     });
// }
