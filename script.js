const apiKey = "aa5926ecec7c28f11f310797bea3d947";
var cityLon = 0;
var cityLat = 0;
const lastSearch = JSON.parse(localStorage.getItem("lastSearch"));
const lastForecast = JSON.parse(localStorage.getItem("lastForecast"));

function DailyForecast() {
    this.feelslike = "";
    this.temp = "";
    this.hum = "";
};

var forecast = {
    day1: new DailyForecast,
    day2: new DailyForecast,
    day3: new DailyForecast,
    day4: new DailyForecast,
    day5: new DailyForecast,
};

$(document).ready(function () {
    $("#cityname").text(lastSearch.city + " " + currentDay).attr("style", "bolder");
    $("#feelslike").attr("src", lastSearch.icon);
    $("#temperature").text("Temperature: " + lastSearch.temp + " \xBAF");
    $("#humidity").text("Humidity: " + lastSearch.humid + " %");
    $("#windspeed").text("Wind Speed: " + lastSearch.wind + " MPH");

    if (lastSearch.index < 5) {
        $("#uvindex > span").text(lastSearch.index).attr("style", "background-color: yellow;");
    } else if (lastSearch.index < 7) {
        $("#uvindex > span").text(lastSearch.index).attr("style", "background-color: orange;");
    } else {
        $("#uvindex > span").text(lastSearch.index).attr("style", "background-color: red;");
    }

    for (x = 0; x < 5; x++) {

        const day = "day" + (x + 1);

        $("#date" + (x + 1)).text(lastForecast[day].day).attr("style", "color:white");
        $("#img" + (x + 1)).attr("src", lastForecast[day].feelslike);
        $("#temp" + (x + 1)).text("Temp: " + lastForecast[day].temp + " \xBAF").attr("style", "color:white");
        $("#hum" + (x + 1)).text("Humidity: " + lastForecast[day].hum + " %").attr("style", "color:white");
    };
});

$("#citysearch").on("click", function () {

    var city = $("#cityinput").val();
    console.log(city);
    console.log(currentDay);

    const lastCity = $("<button>").text(city).attr("class", "list-group-item").attr("id", city).attr("type", "button");

    $("#searchHistory").prepend(lastCity);

    function runQuery() {

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        })
            // After the data comes back from the API
            .then(function (response) {

                const currentCity = response.name;
                var currentTemp = response.main.temp;
                const currentHum = response.main.humidity;
                const currentWind = response.wind.speed;
                var cityLon = response.coord.lon;
                var cityLat = response.coord.lat;

                var Search = {
                    city: response.name,
                    temp: response.main.temp,
                    humid: response.main.humidity,
                    wind: response.wind.speed,
                    icon: "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
                };

                // temp conversions
                tempK = parseFloat(response.main.temp);
                tempF = Math.round(((tempK-273.15)*1.8)+32);
                currentTemp = tempF;
                Search.temp = tempF;


                $("#cityname").text(currentCity + " (" + currentDay + ")").attr("style", "bolder");
                $("#feelslike").attr("src", Search.icon);
                $("#temperature").text("Temperature: " + currentTemp + " \xBAF");
                $("#humidity").text("Humidity: " + currentHum + " %");
                $("#windspeed").text("Wind Speed: " + currentWind + " MPH");

                var queryUVRL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + apiKey;

                $.ajax({
                    url: queryUVRL,
                    method: "GET",
                })
                    // After the data comes back from the API
                    .then(function (response) {
                        const currentUV = response.value;

                        if (currentUV < 5) {
                            $("#uvindex > span").text(currentUV).attr("style", "background-color: yellow;");
                        } else if (currentUV < 8) {
                            $("#uvindex > span").text(currentUV).attr("style", "background-color: orange;");
                        } else {
                            $("#uvindex > span").text(currentUV).attr("style", "background-color: red;");
                        };

                        Search["index"] = currentUV;

                        var storedSearch = JSON.stringify(Search);
                        localStorage.setItem("lastSearch", storedSearch);
                    });

                var queryDaily = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLon + "&exclude=hourly&appid=" + apiKey;

                $.ajax({
                    url: queryDaily,
                    method: "GET",
                })
                    .then(function (response) {

                        moment().format("MM/DD/YYYY")

                        forecast.day1["day"] = moment().add(1, 'days').format("MM/DD/YYYY");
                        forecast.day2["day"] = moment().add(2, 'days').format("MM/DD/YYYY");
                        forecast.day3["day"] = moment().add(3, 'days').format("MM/DD/YYYY");
                        forecast.day4["day"] = moment().add(4, 'days').format("MM/DD/YYYY");
                        forecast.day5["day"] = moment().add(5, 'days').format("MM/DD/YYYY");

                        for (x = 0; x < 5; x++) {

                            const day = "day" + (x + 1);

                            forecast[day].feelslike = "http://openweathermap.org/img/w/" + response.daily[x].weather[0].icon + ".png";
                            forecast[day].temp = Math.round(((parseFloat(response.daily[x].temp.day)-273.15)*1.8)+32);
                            forecast[day].hum = response.daily[x].humidity;

                            dailyDay = $("#date" + (x + 1)).text(forecast[day].day).attr("style", "color:white");
                            dailyFeel = $("#img" + (x + 1)).attr("src", forecast[day].feelslike);
                            dailyTemp = $("#temp" + (x + 1)).text("Temp: " + forecast[day].temp + " \xBAF").attr("style", "color:white");
                            dailyHum = $("#hum" + (x + 1)).text("Humidity: " + forecast[day].hum + " %").attr("style", "color:white");

                            $("#" + day).append(dailyDay, dailyFeel, dailyTemp, dailyHum);

                            var storedForecast = JSON.stringify(forecast);
                            localStorage.setItem("lastForecast", storedForecast);
                        };
                    });
            });
    };

    runQuery();

    $("ul > button").on("click", function () {
        console.log(this.id);
        city = this.id;
        runQuery();
    });
});

