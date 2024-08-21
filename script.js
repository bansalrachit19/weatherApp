const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially need of variables
const API_KEY = "1b0a0a9829ed50cc1130afe7dfab597d";
let currentTab = userTab;
currentTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(clickedTab) {
    //check karunga if clicked tab and current tab are both different
    //kyunki tabhi, i need to change/switch the tab
    if (currentTab != clickedTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            //check if search form vala container is invisible
            //if yes then make it visible
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        }
        else {
            //this means, main pehle search tab par tha, ab your weather visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now, i am in your weather tab, so i need to display the weather too, for that lets first check local storage
            //for coordinates, if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // passing the clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // passing the clicked tab as input parameter
    switchTab(searchTab);
});

function getfromSessionStorage() {
    //checking if we have already saved our coordinates on the local storage or not
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        //agar local storage par nahin save, to pehle grant access conatiner visible karwake, local corrdiantes lo and store karvao
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(corrdiantes) {
    const { lat, lon } = corrdiantes;

    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Unable to fetch weather information");
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");

        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Failed to load weather information. Please try again.";
        errorMsg.classList.add("error-message");

        const notFoundImg = document.querySelector(".not-found-img");
        notFoundImg.style.display = "block";

        userContainer.appendChild(errorMsg);
    }
}


function renderWeatherInfo(weatherInfo) {
    //sabse pehle sab elements ko fetch karunga jinki values ui par dikhani hai
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherinfo object and put into fetched ui elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/sec `;
    humidity.innerText = `${weatherInfo?.main?.humidity} % `;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} % `;
}

//agar coordinates already local storage par saved nahin hai, then pehle ham save karvayenge
//that will be done by, first grant access button par event listener lagayenge
//then geolocation se location lenge current
//then fetch karenge, then ui par dikhadenge

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, (error) => {
            alert("Unable to retrieve your location. Please allow location access or try searching by city name.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}


function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
//fetching the grant acess button
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "")
        return;
    else
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    const notFoundImage = document.querySelector(".not-found-img");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (response.ok) {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
            notFoundImage.style.display = "none";
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFoundImage.style.display = "block";
    }
}

