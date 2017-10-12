/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__choroplethMap__ = __webpack_require__(1);


const margin = { left: 120, right: 300, top: 20, bottom: 120 };

const visualization = d3.select('#visualization');
const visualizationDiv = visualization.node();
const svg = visualization.select('svg');

/***** parsing code for choropleth *********/

const drivingTimesMap = {};
const build_driving_map = row => {
  drivingTimesMap[row.Town] = {};
  drivingTimesMap[row.Town].time = +row.DrivingTime;
  const hours = Math.floor(+row.DrivingTime/60);
  const mins = +row.DrivingTime - 60*hours;
  if(hours > 0) {
    drivingTimesMap[row.Town].timeString = hours + "h " + mins + " min";
  } else {
    drivingTimesMap[row.Town].timeString = mins + " min";
  }
  if(!(row.Town in raceHorizonByTown)) {
    raceHorizonByTown[row.Town] = { 'daysToRace': 400, 'raceType': ""};
  }
  return row;
};

const racesRunMap = {};
const build_races_run_map = row => {
  racesRunMap[row.Town] = {};
  racesRunMap[row.Town].distance = row.Distance;
  return row;
};

const today = d3.timeDay(new Date());
const racesSoonByTown = {};
const raceHorizonByTown = {};
const fmt = d3.format("02");
const parseRaces = row => {
  row.Month = +row.Month;
  row.Day = +row.Day;
  row.Weekday = +row.Weekday;
  row.DateString = fmt(row.Month) + "/" + fmt(row.Day);
  row.raceDay = d3.timeDay(new Date(2017, row.Month-1, row.Day));
  const daysToRace = d3.timeDay.count(today, row.raceDay);
  if(daysToRace >= 0 && daysToRace <= 14) {
    const raceString = "<tr><td><span class='racedate'>" + 
          row["Date/Time"] + 
          "</span></td><td><span class='racedistance'>" + 
          row.Distance + "</span></td><td><span class='racename'>" + 
          row.Name + "</span></td></tr>";          
    if(row.Town in racesSoonByTown) {
      racesSoonByTown[row.Town] += raceString;
    } else {
      racesSoonByTown[row.Town] = "<table>" + raceString;
    }
    const raceType = daysToRace <= 7 ? "hasRaceVerySoon" : "hasRaceSoon"; 
    if(row.Town in raceHorizonByTown) {
      if(daysToRace < raceHorizonByTown[row.Town].daysToRace) {
        raceHorizonByTown[row.Town] = { 
          'daysToRace': daysToRace, 
          'raceType': raceType 
        };            
      }            
    } else {
      raceHorizonByTown[row.Town] = { 
        'daysToRace': daysToRace, 
        'raceType': raceType 
      };            
    }
  }
  return row;
};




function dataLoaded(error, mapData, drivingTimes, racesRun, races) {
  const colorScale = d3.scaleOrdinal()
    .domain(["Race within 1 week", "Race within 2 weeks", "Town already run"])
    .range(["#f03b20", "#feb24c", "#16a"]);
  const colorLegend = d3.legendColor()
    .scale(colorScale)
    .shapeWidth(40)
    .shapeHeight(20);



  const colorLegendG = svg.append("g")
    .attr("transform",`translate(10,10)`);
  colorLegendG.call(colorLegend)
    .attr("class", "color-legend");



  const render = () => {

    // Extract the width and height that was computed by CSS.
    svg
      .attr('width', visualizationDiv.clientWidth)
      .attr('height', visualizationDiv.clientHeight);

    // Render the choropleth map.
    Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["a" /* default */])(svg, {
      mapData,
      drivingTimes,
      racesRun,
      races,
      racesRunMap,
      drivingTimesMap,
      racesSoonByTown,
      raceHorizonByTown,
      margin
    });


  }

  // Draw for the first time to initialize.
  render();

  // Redraw based on the new size whenever the browser window is resized.
  window.addEventListener('resize', render);
}

d3.queue()
  .defer(d3.json, "data/ct_towns_simplified.topojson")
  .defer(d3.csv, "data/driving_times_from_avon.csv", build_driving_map)
  .defer(d3.csv, "data/towns_run.csv", build_races_run_map)
  .defer(d3.csv, "data/races2017.csv", parseRaces)
  .await(dataLoaded);




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (svg, props) {
  const {
    mapData,
    drivingTimes,
    racesRun,
    races,
    racesRunMap,
    drivingTimesMap,
    racesSoonByTown,
    raceHorizonByTown,
    margin
  } = props;

  const tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(d => "<span class='townname'>" + d.properties.NAME10 + ":</span> <span>"
          + drivingTimesMap[d.properties.NAME10].timeString
          + " driving</span>" 
          + "<span>" 
          + (d.properties.NAME10 in racesSoonByTown ?
            racesSoonByTown[d.properties.NAME10]
            : "")
          + "</span>"
          );

  function getMapScale(width, height) {
    // known size of CT image for given scale
    const baseScale = 12000;
    const baseWidth = 453;
    const baseHeight = 379;

    const scale1 = baseScale*width/baseWidth;
    const scale2 = baseScale*height/baseHeight;
    return d3.min([scale1, scale2]);
  }

  function completeTooltipTables() {
    Object.keys(racesSoonByTown).forEach(
        key => { racesSoonByTown[key] += "</table>"; }
    );
  }

  svg.call(tip);

  completeTooltipTables();

  // Extract the width and height that was computed by CSS.
  const width = svg.attr('width');
  const height = svg.attr('height');
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const centerX = width/2;
  const centerY = height/2;

  // Start work on the choropleth map
  // idea from https://www.youtube.com/watch?v=lJgEx_yb4u0&t=23s
  const mapScale = getMapScale(width, height);
  const CT_coords = [-72.7,41.6032];
  const projection = d3.geoMercator()
    .center(CT_coords)
    .scale(mapScale)
    .translate([centerX, centerY]);
  const path = d3.geoPath().projection(projection);

  const group = svg.selectAll(".path")
    .data(topojson.feature(mapData, mapData.objects.townct_37800_0000_2010_s100_census_1_shp_wgs84).features);

  const areas = group
    .enter()
    .append("g").attr("class", "path").append("path")
      .attr("d", path)
      .attr("class", d => 
          d.properties.NAME10 in racesRunMap ? 
            "area alreadyRun" : 
            "area " + raceHorizonByTown[d.properties.NAME10].raceType
           )
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  areas.merge(group).selectAll("path")
      .attr("d", path);


});



/***/ })
/******/ ]);