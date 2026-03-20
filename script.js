const API_KEY = "6d9509eb4ed1b86239c12b81cb347afc";  // OpenWeatherMap API

let unit =  "metric";  //  temperature in celcius (°C)

// default background
document.body.className = "bg-[#1e1b4b] text-white min-h-screen p-4";


// Elements
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const toggleBtn = document.getElementById("toggleUnit");

// Events and EventListener
searchBtn.addEventListener("click", searchWeather); // since normal functions are completely Hoisted so can be called before defining them 
locationBtn.addEventListener("click", getLocationWeather);
toggleBtn.addEventListener("click", toggleUnit);

// Search
function searchWeather() {
  const city = document.getElementById("cityInput").value.trim();  // trim() array method is used to remove trailing spaces in user inputs of city

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  getWeather(city);
}

// Fetch Weather
function getWeather(city) {
  clearError();

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`)
    .then(res => {
      if (!res.ok) {   // 
        throw new Error("City not found"); // Error object 
      }
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      saveCity(city);
      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
      showError(err.message);
    });
}

// Display current weather
function displayWeather(data) {
  // show weather box
  let box = document.getElementById("weatherBox");
  box.classList.remove("hidden");

  // city name
  document.getElementById("cityName").innerHTML = data.name;

  // temp
  let temp = data.main.temp;  // data is json format of Api call  and temperature and humidity are inside main object inside it.
  let unitSymbol = unit === "metric" ? "C" : "F";
  document.getElementById("temp").innerHTML = "Temp: " + temp + "°" + unitSymbol;

  // humidity
  document.getElementById("humidity").innerHTML =
    "Humidity: " + data.main.humidity +"%";

  // wind
  let wind = data.wind.speed;
  document.getElementById("wind").innerHTML = "Wind: " + wind +"m/s";

  // condition
  let condition = data.weather[0].main;   // data.wheather is array of objects and its first elemnet provides description of condition.
  document.getElementById("condition").innerHTML =
    "Condition: " + condition;

  // if too hot show alert
  if (unit === "metric") {
    if (temp > 40) {
      showError("Too much heat!!");
    }
  }

  // Dynamic background check for Rain 
  if (condition == "Rain") {
    document.body.className = "bg-blue-900 text-white min-h-screen p-4";
  } 
}

// Forecast
 function getForecast(lat, lon) {
 fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`)
.then(res=>res.json())
.then(data=>displayForecast(data))

}

function displayForecast(data) {
  let forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  let daily = data.list.filter(item =>   // Taking data entry  from 12 PM time only
    item.dt_txt.includes("12:00:00")
  );

  daily.slice(0, 5).forEach(day => {


    forecastDiv.innerHTML += `
      <div class="bg-[#312e81] p-2 rounded text-center">
        <p>${day.dt_txt.split(" ")[0]}</p>            
        <p>Temp: ${day.main.temp}°</p>
        <p>Humidity: ${day.main.humidity}%</p>
        <p>wind: ${day.wind.speed}m/s</p>
      </div>
    `;
  });
}

// Location
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`)
      .then(res => res.json())
      .then(data => {
        displayWeather(data);
        getForecast(lat, lon);
      })
      .catch(err => {
        showError("Something went wrong");
      });
  });
}

// Toggle unit
function toggleUnit() {
  unit = (unit === "metric" ? "imperial" : "metric");    // change C to F temperature 
  showError("Unit changed. Search again.");
}

// Error handling
function showError(msg) {
  document.getElementById("errorMsg").innerHTML = msg;
}

function clearError() {
  document.getElementById("errorMsg").innerHTML = "";
}

// LocalStorage
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
  }

  loadDropdown();
}

function loadDropdown() {
  let dropdown = document.getElementById("recentCities");
  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  if (cities.length === 0) return;

  dropdown.classList.remove("hidden");
  dropdown.innerHTML = "<option>Select recent city</option>";

  cities.forEach(city => {
    dropdown.innerHTML += `<option value="${city}">${city}</option>`;
  });

   dropdown.addEventListener("change", function () {  
    if (this.value !== "Select recent city") {   // for event listeners this refers to element(DOM object) it is attached.
      getWeather(this.value);
    }
  });
}

loadDropdown();
