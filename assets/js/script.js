const gScript = document.createElement('script');
console.dir(gScript);
gScript.async = 'true';
gScript.src = `https://maps.googleapis.com/maps/api/js?key=${gKey}&callback=initMap`;
document.body.append(gScript);

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
const antipodeBtn = document.querySelector('#antipodal-btn');
const locationAppendCont = document.querySelector('#location-append');
const timeEl = document.querySelector('.time');
const tempEl = document.querySelector('.temp');
const degToggle = document.querySelector('#degToggle');
const toggleF = document.querySelector('#toggleF');
const toggleC = document.querySelector('#toggleC');
const degMeasurement = document.querySelector('#degMeasurement');
const deg = '\xB0';
const infoCont = document.querySelector('.info-container');
const waterChicken = document.querySelector('.water');
let unit = degMeasurement.dataset.unit;
let titleEl;

// elements for country data from rest countries
const countryEl = document.querySelector('.countryEl');
const flagEl = document.querySelector('.flagEl');
const capitalEl = document.querySelector('.capitalEl');
const languageEl = document.querySelector('.languageEl');
const currencyEl = document.querySelector('.currencyEl');
const populationEl = document.querySelector('.populationEl');
const bordersEl = document.querySelector('.bordersEl');

// pages
const landingPg = document.querySelector('.landing-pg');
const resultsPg = document.querySelector('.results-pg');

// event listeners

// ** nav-bar ** current location icon - get current coordinates
currLocation.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    clearLocation();
    reverseGeo(lat, lon);
    getWeather(lat, lon);

    // toggles visibility for the second page successfully
    if (resultsPg.classList.contains('hide')) {
      resultsPg.classList.remove('hide');
    }
    if (landingPg.classList.contains('hide') === false) {
      landingPg.classList.add('hide');
    }
    if (antipodeBtn.classList.contains('hide')) {
      antipodeBtn.classList.remove('hide');
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

  if (antipodeBtn.classList.contains('hide')) {
    antipodeBtn.classList.remove('hide');
  }
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
    getWeather(lat, lon);

    if (resultsPg.classList.contains('hide')) {
      resultsPg.classList.remove('hide');
      landingPg.classList.add('hide');
    }
    if (searchCont.classList.contains('hide')) {
      searchCont.classList.remove('hide');
      landingPg.classList.add('hide');
    }
    if (antipodeBtn.classList.contains('hide')) {
      antipodeBtn.classList.remove('hide');
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
    landingPg.classList.add('hide');
  }
  if (searchCont.classList.contains('hide')) {
    searchCont.classList.remove('hide');
    landingPg.classList.add('hide');
  }
  if (antipodeBtn.classList.contains('hide')) {
    antipodeBtn.classList.remove('hide');
  }
});

// ** results page **
// toggle farenheight/celcius and set data-unit attribute
degToggle.addEventListener('change', function () {
  if (this.checked) {
    degMeasurement.setAttribute('data-unit', 'imperial');
    toggleF.textContent = 'F' + deg;
    toggleC.textContent = '';
  } else {
    degMeasurement.setAttribute('data-unit', 'metric');
    toggleC.textContent = 'C' + deg;
    toggleF.textContent = '';
  }
  unit = degMeasurement.getAttribute('data-unit');
  getWeather(lat, lon);
});

antipodeBtn.addEventListener('click', function () {
  getFromLocalStorage(lat, lon);
  getAntipodes(lat, lon);
  clearLocation();
  reverseGeo(antLat, antLon);
  onWater(antLat, antLon);
  getWeather(antLat, antLon);
  antipodeBtn.classList.toggle('hide');
});

// functions
// antipodal coordinates
function getAntipodes(x, y) {
  antLat = x * -1;
  if (lon >= 0) {
    antLon = y - 180;
  } else if (lon < 0) {
    antLon = y + 180;
  }
  console.log(antLat, antLon);
}

// fetch api using coordinates - https://developers.google.com/maps/documentation/geocoding/overview#geocoding-requests
async function reverseGeo(x, y, zoom = 10) {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${x},${y}&key=${gKey}`
  )
    .then(function (response) {
      if (response.status !== 200) {
        // modal
        console.log('damn');
      } else {
        return response.json().then(function (data) {
          // console.log(data);
          if (data.status === 'ZERO_RESULTS') {
            appendLocation('Oops! Swiming to Disney World!');
            setTimeout(function () {
              searchGeo('disneyworld', 15);
            }, 5000);
            return;
          }

          onWater(x, y).then(function (bool) {
            const isWater = bool;
            // console.log(isWater);

            if (!isWater) {
              const addressComp = data.results[0].address_components;

              const locality = addressComp.filter(function (obj) {
                return obj.types.includes('locality');
              })[0]?.long_name;
              const subLocality = addressComp.filter(function (obj) {
                return obj.types.includes('sublocality');
              })[0]?.long_name;
              const adminLvlOne = addressComp.filter(function (obj) {
                return obj.types.includes('administrative_area_level_1');
              })[0]?.long_name;
              const country = addressComp.filter(function (obj) {
                return obj.types.includes('country');
              })[0]?.long_name;

              const countryShort = addressComp.filter(function (obj) {
                return obj.types.includes('country');
              })[0]?.short_name;
              // console.log(countryShort);
              getCountries(countryShort);

              let cityEl;

              if (locality) {
                cityEl = locality;
              } else if (subLocality && !locality) {
                cityEl = subLocality;
              }
              clearLocation();
              appendLocation(cityEl, adminLvlOne, country);
            } else {
              const addressComp = data.results[0].address_components;
              const nature = addressComp.filter(function (obj) {
                return obj.types.includes('natural_feature');
              })[0]?.long_name;
              // console.log(nature);
              clearLocation();
              appendLocation(nature);
            }
          });
          saveToLocalStorage(lat, lon);
          initMap(x, y, zoom);
          getTime(x, y);
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

// fetch api for search bar - https://developers.google.com/maps/documentation/geocoding/overview#geocoding-requests
function searchGeo(x, zoom = 10) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${x}&key=${gKey}
  `)
    .then(function (response) {
      if (response.status !== 200) {
        // modal
      } else {
        return response.json().then(function (data) {
          console.log(data);
          lat = data.results[0].geometry.location.lat;
          lon = data.results[0].geometry.location.lng;
          console.log(lat, lon);
          if (data.status === 'ZERO_RESULTS') {
            appendLocation('Oops! Swimming to Disney World!');
            setTimeout(function () {
              searchGeo('disneyworld', 15);
            }, 5000);
            return;
          }

          onWater(lat, lon).then(function (bool) {
            const isWater = bool;
            // console.log(isWater);

            if (!isWater) {
              const addressComp = data.results[0].address_components;

              const locality = addressComp.filter(function (obj) {
                return obj.types.includes('locality');
              })[0]?.long_name;
              const subLocality = addressComp.filter(function (obj) {
                return obj.types.includes('sublocality');
              })[0]?.long_name;
              const adminLvlOne = addressComp.filter(function (obj) {
                return obj.types.includes('administrative_area_level_1');
              })[0]?.long_name;
              const country = addressComp.filter(function (obj) {
                return obj.types.includes('country');
              })[0]?.long_name;

              const countryShort = addressComp.filter(function (obj) {
                return obj.types.includes('country');
              })[0]?.short_name;
              // console.log(countryShort);
              getCountries(countryShort);

              let cityEl;

              if (locality) {
                cityEl = locality;
              } else if (subLocality && !locality) {
                cityEl = subLocality;
              }
              clearLocation();
              appendLocation(cityEl, adminLvlOne, country);
            } else {
              const addressComp = data.results[0].address_components;
              const nature = addressComp.filter(function (obj) {
                return obj.types.includes('natural_feature');
              })[0]?.long_name;
              // console.log(nature);
              clearLocation();
              appendLocation(nature);
            }
          });
          // console.log(lat, lon);
          saveToLocalStorage(lat, lon);
          initMap(lat, lon, zoom);
          getWeather(lat, lon);
          getTime(lat, lon);
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

// map https://developers.google.com/maps/documentation/javascript/overview
function initMap(x, y, zoom) {
  if (x && y) {
    document.getElementById('map').innerHTML = '';
    console.log('this is text:', zoom);
    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: x, lng: y },
      zoom: zoom,
      mapTypeId: 'hybrid',
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

//find current weather of antipodal location - https://openweathermap.org/current
function getWeather(x, y) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&units=${unit}&exclude=minutely&appid=${wKey}`
  ).then(function (response) {
    return response
      .json()
      .then(function (data) {
        console.log(data);
        const temp = Math.floor(data.current.temp);
        tempEl.textContent = temp + deg;
      })
      .catch(function (err) {
        console.log(err);
      });
  });
}

// append name of location for map
function appendLocation(x, y, z) {
  titleEl = document.createElement('div');
  titleEl.classList.add('current-location-cont');
  titleEl.innerHTML = `
  <h2>${x ? x : ''}  ${y ? y : ''}  ${z ? z : ''}</h2>`;
  locationAppendCont.appendChild(titleEl);
}

// clear name of location for map
function clearLocation() {
  if (typeof titleEl === 'undefined' || !titleEl) {
    return;
  } else {
    titleEl.remove();
    // locationAppendCont.removeChild(titleEl);
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

// on water api - https://onwater.io/ - simply gives a true or false as to whether or not the coordinates are on land. function called when we select the button to view antipodal location. If google doesn't give us anything, this still tells us whether we are on land or water.
function onWater(x, y) {
  return new Promise(function (resolve, reject) {
    fetch(
      `https://api.onwater.io/api/v1/results/${x},${y}?access_token=${owKey}`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        const water = data.water; // true or false in the json object - can use for conditional logic

        if (water === true) {
          infoCont.classList.add('hide');
          waterChicken.classList.remove('hide');
        } else {
          infoCont.classList.remove('hide');
          waterChicken.classList.add('hide');
        }

        console.log('we are drowning: ' + water);
        resolve(water);
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

// countries data https://restcountries.eu/
function getCountries(x) {
  fetch(`https://restcountries.eu/rest/v2/alpha/${x}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      countryEl.textContent = `${data.name}, ${data.alpha2Code}`;
      flagEl.src = data.flag;
      capitalEl.textContent = data.capital;
      languageEl.textContent = data.languages[0].name;
      currencyEl.textContent = `${data.currencies[0].code}, ${data.currencies[0].symbol}`;
      populationEl.textContent = data.population;

      bordersEl.textContent = '';
      data.borders.forEach(function (element) {
        const borders = document.createElement('div');
        borders.textContent = element;
        bordersEl.appendChild(borders);
      });
    })
    .catch(function (err) {
      console.log('Error:', err);
    });
}

// world clock api https://timezonedb.com/references/get-time-zone
function getTime(x, y) {
  fetch(
    `https://api.ipgeolocation.io/timezone?apiKey=${timeKey}&lat=${x}&long=${y}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      const locationTime = data.time_12.slice(0, -6);
      const am_pm = data.time_12.slice(9);
      const formattedTime = locationTime + ' ' + am_pm;
      timeEl.textContent = formattedTime;
    })
    .catch(function (err) {
      console.log(err);
    });
}

// const storedUnit = localStorage.getItem('unit');
// if (storedUnit === 'metric') {
//   const event = new Event('change', { bubbles: true });
//    // declaratively move the toggle
//   degToggle.dispatchEvent(event);
// }
