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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__calendar_js__ = __webpack_require__(2);




const margin = { left: 0, right: 0, top: 0, bottom: 0 };

const visualization = d3.select('#visualization');
const visualizationDiv = visualization.node();
const svg = visualization.select('svg');

function drawBox(name, box, chart) {
  // From sample code
  // https://bl.ocks.org/curran/ad6d4eaa6cf39bf58769697307ec5f3a
  const x = box.x;
  const y = box.y;
  const width = box.width;
  const height = box.height;

  // set up a group for this box
  // this is the "managing one thing" version of the General Update Pattern
  let g = svg.selectAll('.' + name).data([null]);
  const gEnter = g.enter().append('g').attr('class', name);
  g = gEnter.merge(g)
      .attr('transform', 'translate(' + x + ',' + y + ')');

  // call the specific renderer
  chart.setContainer(g);
  chart.setBox(box);
  chart.draw();
};

function getPageParameters() {
  const paramsArray = location.search.substring(1).split("&");
  // make it a dictionary
  const paramsDict = {};
  for(const p of paramsArray) {
    const x = p.split("=");
    // replace %20 with spaces, etc.
    paramsDict[x[0]] = decodeURI(x[1]);
  }
  return paramsDict;
};

const run169urlPrefix = 'https://www.omnisuite.net/run169data/api/data/';
const racesUrl = run169urlPrefix + 'Races/All/';
const membersUrl = run169urlPrefix + 'Members_Min';

function dataLoaded(values) {

  // unpack parameters
  const [
    mapData,
    drivingTimes, 
    villages_to_towns, 
    races, 
    num_races_by_town_2017,
    listOfMembers
  ] = values;

  // need to do the parsing here because d3.json doesn't accept
  // the "row" parameter
  races.forEach(row => Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["i" /* parseRaces */])(row));

  const outOfState = 'Out of State';
  const noPersonName = 'noPersonName';
  let highlightElusive = $('.ui.toggle.button').state('is active');

  const pageParameters = getPageParameters();

  const villagesToTownsMap = {}
  villages_to_towns.forEach(row => {
    villagesToTownsMap[row.Village] = row.Town;
  });

  const townNames = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["g" /* getTownNames */])(drivingTimes);
  const townIndex = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["d" /* buildTownIndex */])(townNames);
  const raceHorizonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["b" /* buildRaceHorizon */])(races, townNames);
  const racesSoonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["c" /* buildRacesSoonTables */])(races);

  const elusiveTowns = {};
  num_races_by_town_2017.forEach(row => { elusiveTowns[row.Town] = row.isElusive == '1'; });

  const mapFeatures = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["e" /* computeMapFeatures */])(mapData, elusiveTowns);
  const calendarData = Object(__WEBPACK_IMPORTED_MODULE_1__calendar_js__["c" /* rollUpDataForCalendar */])(races, elusiveTowns);

  // prepare list of members for use in search box
  listOfMembers.forEach( row => {
    row['Name'] = row._LastName + ', ' + row._FirstName;
    //row['Town'] = row.State == 'CT' ? row.City : outOfState;
    if(row._City in villagesToTownsMap) {
      row['Town'] = villagesToTownsMap[row._City];
    } else {
      row['Town'] = row._City;
    }
  });
  const memberNames = [];
  listOfMembers.sort((x, y) => d3.ascending(x.Name, y.Name)).forEach((row, i) => {
    memberNames.push({ 
      title: row.Name,
      description: row.Town
    });
  });
  // create a map from memberName -> town in which member is registered
  // Note: this assumes no repeated names
  const memberTownsMap = {};
  listOfMembers.forEach(row => {
    memberTownsMap[row.Name] = row.Town;
  });

  class PersonAndTownName {
    constructor() {
      // start with defaults
      this.name = noPersonName;
      this.town = outOfState;
      // to avoid multiple web requests, cache towns run
      this.townsRun = {};
      // fill towns run for the default "noPerson"
      this.townsRun[noPersonName] = {};
      townNames.forEach( town => {
        this.townsRun[noPersonName][town] = false;
      });
    }

    update(params) {
      if(params == undefined || !('personName' in params || 'townName' in params)) return new Promise( (resolve, reject) => {
        resolve({
          myTown: this.town,
          myName: this.name,
          townsRun: this.townsRun[this.name]
        });
      });
      if('personName' in params) {
        // if a person is provided, override the town selection
        this.name = params.personName;
        this.town = memberTownsMap[this.name];
        // also set the town selector to the town to avoid confusion
        $('#townSearch').search('set value', this.town);
        // get the towns run by this person if the person is new
        if(this.name in this.townsRun) {
          return new Promise( (resolve, reject) => {
            resolve({
              myTown: this.town,
              myName: this.name,
              townsRun: this.townsRun[this.name]
            });
          });
        } else {
          return this.getUserInfoFromApi();
        }
      } else if('townName' in params) {
        this.town = params.townName;
        return new Promise( (resolve, reject) => {
          resolve({
            myTown: this.town,
            myName: this.name,
            townsRun: this.townsRun[this.name]
          });
        });
      }
    }

    getName() {
      return this.name;
    }

    getTown() {
      return this.town;
    }

    getUserInfoFromApi() {
      const [lastName, firstName] = this.name.split(', ');
      const townsRunUrl = run169urlPrefix + 'member/' + firstName + '/' + lastName + '/TownsComp';
      return new Promise( (resolve, reject) => {
        d3.json(townsRunUrl).then( d => {
          this.townsRun[this.name] = {};
          // mark towns already run
          d.forEach( row => {
            this.townsRun[this.name][row.Town] = true;
          });
          // fill the other towns with "false"
          townNames.forEach( town => {
            this.townsRun[this.name][town] = town in this.townsRun[this.name];
          });
          resolve({
            myTown: this.town,
            myName: this.name,
            townsRun: this.townsRun[this.name]
          });
        });
      });
    }
  };

  const townName = new PersonAndTownName();

  const myCalendar = new __WEBPACK_IMPORTED_MODULE_1__calendar_js__["a" /* Calendar */]({
    data: [
      races,
      calendarData
    ],
    margin: margin
  });
  const myMap = new __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["a" /* ChoroplethMap */]({
    data: [
      mapFeatures,
      drivingTimes,
      races,
      townNames,
      townIndex,
      racesSoonByTown,
      raceHorizonByTown,
      myCalendar.getDateHighlighter()
    ],
    margin: margin
  });

  myCalendar.setTownHighlighter(myMap.getTownHighlighter());

  const charts = {
    calendar: myCalendar,
    map: myMap
  };

  const render = (params) => {
   
    if('personName' in pageParameters) {
      $('#personSearch').hide();
      $('#townSearch').hide();
    }

    let promise = NaN;
    if('personName' in pageParameters) {
      promise = townName.update(pageParameters);
    } else {
      promise = townName.update(params);
    }

    let showDrivingFilter = true;
    if('sparseLayout' in pageParameters) {
      // Remove lots of elements
      $('.hideable').hide();
      showDrivingFilter = false;
    }

    // Extract the width and height that was computed by CSS.
    //const width = visualizationDiv.clientWidth;
    const containerBox = $('.ui.container').get(0).getBoundingClientRect();
    const width = containerBox.width; // + containerBox.left;
    const height = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(width, showDrivingFilter) + Object(__WEBPACK_IMPORTED_MODULE_1__calendar_js__["b" /* getCalendarHeight */])(width);
    // include a left margin inside the svg, to account for elements
    // that overflow (e.g., d3-tips)
    svg
      .attr('width', width + containerBox.left)
      .attr('height', height);

    const box = {
      width: width,
      height: height
    };

    const boxes = {
      map: {x: containerBox.left, y: 0, width: containerBox.width, height: Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(containerBox.width, showDrivingFilter)},
      calendar: {x: containerBox.left, y: Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(containerBox.width, showDrivingFilter), width: containerBox.width, height: Object(__WEBPACK_IMPORTED_MODULE_1__calendar_js__["b" /* getCalendarHeight */])(containerBox.width)}
    };

    promise.then(options => {
      // add another option
      options['highlightElusive'] = highlightElusive;
      options['showDrivingFilter'] = showDrivingFilter;
      Object.keys(charts).forEach( name => { charts[name].setOptions(options); } );

      // Render the content of the boxes (choropleth map and calendar)
      Object.keys(boxes).forEach( name => { drawBox(name, boxes[name], charts[name]); } );
    });

  }

  // Draw for the first time to initialize.
  render();

  // Redraw based on the new size whenever the browser window is resized.
  window.addEventListener('resize', render);

  $('#personSearch').search({
    source: memberNames,
    maxResults: 12,
    searchFields: [
      'title'
    ],
    searchFullText: false,
    onSelect: (result, response) => {
      // hack to prevent inconsistent display when result is selected
      // after entering a partial match
      $('#searchPersonText').val(result.title);
      if(result.title != '') render({ personName: result.title });
    }
  });

  $('#townSearch').search({
    source: [outOfState].concat(townNames).map(d => ({title: d})),
    maxResults: 12,
    searchFields: [ 'title' ],
    searchFullText: false,
    onSelect: (result, response) => {
      $('#searchTownText').val(result.title);
      if(result.title != '') render({townName: result.title});
    }
  });

  $('.ui.toggle.button').state({
    text : {
      active: 'Hide elusive towns',
      inactive: 'Show elusive towns'
    }
  });
  $('.ui.toggle.button').on('click', () => {
    highlightElusive = $('.ui.toggle.button').state('is active');
    charts.calendar.setElusiveHighlight(highlightElusive);
    charts.map.setElusiveHighlight(highlightElusive);
    render();
  });
}

const promises = [];

promises.push(d3.json('data/ct_towns_simplified.topojson'));
promises.push(d3.csv('data/driving_times_full_symmetric.csv', __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["h" /* parseDrivingMap */]));
promises.push(d3.csv('data/ct_villages_and_towns.csv'));
promises.push(d3.json(racesUrl)); // for map & calendar
promises.push(d3.csv('data/num_races_by_town_2017.csv'));
promises.push(d3.json(membersUrl));

Promise.all(promises).then(function(values) {
  dataLoaded(values);
});



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChoroplethMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return parseDrivingMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return parseRaces; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return getTownNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return buildTownIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return buildRaceHorizon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return buildRacesSoonTables; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return getMapHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return computeMapFeatures; });
function getMapHeight(width, showDrivingFilter) {
  const threshold_width = 800;
  const factor = showDrivingFilter ? 3/4 : 2/3; // shorter if no filter
  return width >= threshold_width ? threshold_width*factor : width*factor;
}

function getTownNames(drivingTimeData) {
  return drivingTimeData.columns;
}

function buildTownIndex(townNames) {
  // create reverse mapping: townIndex[townName] == index
  return townNames.reduce((accumulator, currentValue, currentIndex) => {
    accumulator[currentValue] = currentIndex;
    return accumulator;
  }, {});
}

function drivingTimeToString(drivingTimeMins) {
  // convert driving time in minutes into a string
  const hours = Math.floor(drivingTimeMins/60);
  const mins = Math.round(drivingTimeMins - 60*hours);
  const hoursString = (hours == 0) ? '' : hours + 'h ';
  return hoursString + mins + " min";
}

function parseDrivingMap(row) {
  // convert driving time to numeric value in minutes
  Object.keys(row).forEach(k => { row[k] = +Math.round(row[k]/60); });
  return row;
}

function createNewNameIfNeeded(name, namesAlreadySeen) {
  let currentName = name;
  let suffixIndex = 2;
  while(currentName in namesAlreadySeen) {
    currentName = name + ' (' + suffixIndex + ')';
    suffixIndex++;
  }
  return currentName;
}

function buildRaceHorizon(races, townNames) {
  const today = d3.timeDay(new Date());
  const raceHorizonByTown = {};
  races.forEach(row => {
    const daysToRace = d3.timeDay.count(today, row.raceDay);
    if(daysToRace >= 0 && daysToRace <= 14) {
      const raceType = daysToRace <= 1 ? 
        'hasRaceTodayOrTomorrow' : 
        daysToRace <= 7 ? 'hasRaceVerySoon' : 'hasRaceSoon'; 
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
  });
  // complete race horizon table with missing towns
  townNames.forEach(t => {
    if(!(t in raceHorizonByTown)) {
      raceHorizonByTown[t] = { 'daysToRace': 400, 'raceType': ''};
    }
  });
  return raceHorizonByTown;
}

function buildRacesSoonTables(races) {
  const today = d3.timeDay(new Date());
  const racesSoonByTown = {};
  races.forEach(row => {
    const daysToRace = d3.timeDay.count(today, row.raceDay);
    if(daysToRace >= 0 && daysToRace <= 14) {
      const raceString = "<tr><td><span class='racedate'>" + 
          row.DateStringForMap +  " " + row.DateTime.toTimeString().slice(0, 5) + 
          "</span></td><td><span class='racedistance'>" + 
          row.Distance + "</span></td><td><span class='racename'>" + 
          row.Name + "</span></td></tr>";          
      if(row.Town in racesSoonByTown) {
        racesSoonByTown[row.Town] += raceString;
      } else {
        racesSoonByTown[row.Town] = "<table>" + raceString;
      }
    }
  });
  return racesSoonByTown;
}

function cleanTownName(name) {
  return name.replace(' (E)', '');
}

function parseRaces(row) {
  const fmt = d3.format("02");
  row.Town = cleanTownName(row.Town);
  row.DateTime = new Date(row.Date_Time);
  row.Year = row.DateTime.getFullYear();
  row.Month = row.DateTime.getMonth() + 1; // correct for zero-based
  row.Day = row.DateTime.getDate();
  row.DateStringForMap = fmt(row.Month) + "/" + fmt(row.Day);
  row.DateStringForCalendar = fmt(row.Year) + "-" + fmt(row.Month) + "-" + fmt(row.Day);
  row.raceDay = d3.timeDay(row.DateTime);
  row.Name = row.RaceName;
  return row;
}

const tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0]);

d3.selectAll('svg').call(tip);

function getSliderParameters(width, height, showDrivingFilter) {
  const scale = getMapScale(width, height, showDrivingFilter);
  return { 
    x: width/2 - scale/12000*50, 
    y: height/2 - scale/12000*160, 
    width: scale/12000*180,
    scale: scale/120000
  };
}

function getMapScale(width, height, showDrivingFilter) {
  // known size of CT image for given scale
  const baseScale = 12000;
  const baseWidth = 453;
  const factor = showDrivingFilter ? 1 : (2/3)/(3/4);
  const baseHeight = factor*379;

  const scale1 = baseScale*width/baseWidth;
  const scale2 = baseScale*height/baseHeight;
  return d3.min([scale1, scale2]);
}

function completeTooltipTables(racesSoonByTown) {
  Object.keys(racesSoonByTown).forEach(
    town => { racesSoonByTown[town] += "</table>"; }
  );
}

function computeMapFeatures(mapData, elusiveTowns) {
  // Pre-compute map features for all & elusive towns
  const mapFeatures = {};
  mapFeatures.all = topojson.feature(mapData, mapData.objects.townct_37800_0000_2010_s100_census_1_shp_wgs84).features;

  mapFeatures.elusive = mapFeatures.all.filter(d => elusiveTowns[d.properties.NAME10]);

  return mapFeatures;
}


const carSlider = {value: 40};


class ChoroplethMap {
  constructor(opts) {
    this.data = opts.data;
    this.margin = opts.margin;
  }

  getTownHighlighter() {
    // collect towns for each date
    // access elements as townsPerDate[<dateString>] 
    // yields a set of unique town names
    // TODO: do not access data by index--fragile to changes
    this.townsPerDate = this.data[2].reduce((accumulator, currentValue) => {
      const ds = currentValue.DateStringForMap;
      if(!(ds in accumulator)) {
        accumulator[ds] = new Set();
      }
      accumulator[ds].add(currentValue.Town);
      return accumulator;
    }, {});

    return d => { this.highlightTownsPerDate(d); };
  }

  highlightTownsPerDate(date) {

    const width = this.box.width;
    const height = this.box.height;
    const centerX = width/2;
    const centerY = height/2;

    const mapScale = getMapScale(width, height, this.options.showDrivingFilter);
    const CT_coords = [-72.7,41.6032];
    const projection = d3.geoMercator()
      .center(CT_coords)
      .scale(mapScale)
      .translate([centerX, centerY]);
    const path = d3.geoPath().projection(projection);

    function getDateString(d) {
      const fmt = d3.format("02");
      const mo = d.getMonth() + 1;
      const day = d.getDate();
      return fmt(mo) + "/" + fmt(day);
    }

    // TODO: do not access data by index--fragile to changes
    const mapFeatures = this.data[0];
    let data = []; // default is nothing --> will remove highlighting

    if(date != undefined) {
      // set up data to highlight
      const ds = getDateString(date);
      data = mapFeatures.all.filter(mf => this.townsPerDate[ds].has(mf.properties.NAME10));
    }

    const highlightTownClassName = 'highlightedTownArea';

    let highlightAreas = this.mapAndLegendG
      .selectAll('.' + highlightTownClassName)
      .data(data);

    highlightAreas
      .enter().append('path')
        .attr('class', highlightTownClassName)
        .attr('fill', '#4575b4')
        .attr('stroke-width', 1)
      .merge(highlightAreas)
        .attr('stroke', '#888')
        .attr('d', path);

    highlightAreas.exit().remove();
  }

  draw() {
    const [
      mapFeatures,
      drivingTimes,
      racesForMap,
      townNames,
      townIndex,
      racesSoonByTown,
      raceHorizonByTown,
      dateHighlighter
    ] = this.data;

    const myTown = this.options.myTown;
    const myName = this.options.myName;
    const townsRun = this.options.townsRun;
    const highlightElusive = this.options.highlightElusive;
    const showDrivingFilter = this.options.showDrivingFilter;

    // string marker
    // TODO: find a 'DRY' way of doing this -- these are also set in index.js
    const outOfState = 'Out of State'; 
    const noPersonName = 'noPersonName';

    const myTownIndex = townIndex[myTown];

    completeTooltipTables(racesSoonByTown);

    // note: these colors must match the css above
    // TODO: DRY principle: perhaps do colors programmatically
    const legendColors = ['#d73027', '#fc8d59', '#fee090', '#abd9e9'];
    const legendLabels = ['Race today or tomorrow', 'Race within 1 week', 'Race within 2 weeks', 'Town already run'];

    // Extract the width and height that was computed by CSS.
    const width = this.box.width;
    const height = this.box.height;
    const innerWidth = width - this.margin.left - this.margin.right;
    const innerHeight = height - this.margin.top - this.margin.bottom;

    const centerX = width/2;
    const centerY = height/2;

    // Slider
    const sliderParameters = getSliderParameters(width, height, showDrivingFilter);

    const sliderScale = d3.scaleLinear()
      .domain([0, sliderParameters.width])
      .range([0, 150])
      .clamp(true);

    carSlider.x = sliderScale.invert(carSlider.value);

    // define some vars
    let sliderG, drivingTimeLabel, carLine, car, carScale, carLabel;
    if(showDrivingFilter) {
      sliderG = this.container.selectAll('.sliderGroup').data([sliderParameters]);
      sliderG = sliderG
        .enter().append('g')
          .attr('class', 'sliderGroup')
        .merge(sliderG)
          .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

      const labelText = myTown;
      drivingTimeLabel = sliderG.selectAll('.townLabel').data([labelText]);
      drivingTimeLabel = drivingTimeLabel
        .enter().append('text')
          .attr('class', 'townLabel')
          .attr('text-anchor', 'end')
        .merge(drivingTimeLabel)
          .attr('x', -10*sliderParameters.scale)
          .attr('y', 160*sliderParameters.scale)
          .attr('font-size', (175*sliderParameters.scale) + 'px')
          .text(d => d);

      carLine = sliderG.selectAll('.carLine').data([carSlider]);
      carLine = carLine
        .enter().append('rect')
          .attr('class', 'carLine')
        .merge(carLine)
          .attr('x', 0)
          .attr('y', 100*sliderParameters.scale)
          .attr('width', d => d.x)
          .attr('height', 10*sliderParameters.scale);

      car = sliderG.selectAll('.car').data([carSlider]);
      const pathString = "m 25,0 c -4.53004,0.0112 -12.12555,0.69055 -14.0625,6.05859 -5.07703,1.58895 -10.49326,2.14878 -10.14649,9.23437 l 6.23633,0.75782 c 0,0 0.45836,3.05148 3.51563,3.13672 3.05727,0.0852 4.03125,-2.89454 4.03125,-2.89454 l 28.49609,0.0684 c 0,0 1.50286,3.40622 5.20508,3.37696 3.70222,-0.0293 4.85742,-4.37696 4.85742,-4.37696 1.52171,0.005 3.11558,0.0922 4.37695,-0.20703 0.72421,-1.0742 0.63022,-2.1633 -0.33203,-2.23828 -0.0635,-0.005 0.70644,-2.07399 -0.16797,-3.46484 l -0.0859,-1.51563 c -0.85704,-0.4383 -1.83605,-0.7606 -2.92969,-0.74023 -1.55827,-2.22881 -10.56728,-1.44901 -16.36719,-1.96485 -1.45014,-0.83459 -2.9249,-2.47089 -4.51367,-4.27343 0,0 -2.90328,-0.91128 -4.92774,-0.89453 -0.50611,0.004 -1.67553,-0.0662 -3.18554,-0.0625 z m 1.83594,1.23437 c 1.42376,-0.0226 4.15534,0.26141 4.65625,0.51563 0.66787,0.33894 3.90428,3.44039 3.58398,3.87695 -0.3203,0.43656 -8.54696,0.58251 -9.01953,0.26758 -0.47258,-0.31493 -0.28696,-4.16971 -0.0762,-4.52344 0.0527,-0.0884 0.38088,-0.12919 0.85547,-0.13672 z m -3.3418,0.16016 c 0.19862,0.0111 0.33328,0.0434 0.38281,0.10156 0.39621,0.46517 0.29788,4.24032 -0.0234,4.38477 -0.26357,0.11849 -7.94003,0.75278 -8.31054,0.43945 -0.37051,-0.31334 0.16129,-2.35076 1.14648,-3.24024 0.86204,-0.77829 5.41436,-1.76307 6.80469,-1.68554 z"
      carScale = 10*sliderParameters.scale;

      car = car
        .enter().append('g')
        .merge(car)
          .attr('class', myTown == outOfState ? 'car inactive' : 'car')
          .attr('transform', d => 'translate(' + d.x + ') scale(' + carScale + ')')
          .call(d3.drag()
              .on('start', myTown == outOfState ? () => {} : dragstarted)
              .on('drag', myTown == outOfState ? () => {} : dragged)
              .on('end', myTown == outOfState ? () => {} : dragended));

      // Add an invisible rectangle on top, to enlarge the sensitive area.
      // This makes it easier to click on a cell phone.
      const carRect = car.selectAll('rect').data([carSlider]);
      carRect
        .enter().append('rect')
          .attr('stroke', 'none')
          .attr('fill', '#fff')
          .attr('y', -20)
          .attr('width', 60)
          .attr('height', 45);

      // draw the label with the driving time
      carLabel = car.selectAll('.carLabel').data([carSlider]);
      carLabel = carLabel
        .enter().append('text')
          .attr('class', 'carLabel')
          .attr('text-anchor', 'middle')
        .merge(carLabel)
          .attr('opacity', myTown == outOfState ? 0.3 : 1)
          .text(d => drivingTimeToString(sliderScale(d.x)))
          .attr('x', 27)
          .attr('y', -7)
          .attr('font-size', '1em');


      // draw the actual car
      const carCar = car.selectAll('path').data([carSlider]);
      carCar
        .enter().append('path')
          .attr('d', pathString)
        .merge(carCar);
    }


    tip
      .html(d => '<span class="townname">' + d.properties.NAME10 + '</span>'
          + (myTown == outOfState ? '' :
            '<span>: ' + drivingTimeToString(drivingTimes[myTownIndex][d.properties.NAME10])
          + ' drive</span>')
          + '<span>' 
          + (d.properties.NAME10 in racesSoonByTown ?
            racesSoonByTown[d.properties.NAME10]
            : '')
          + '</span>'
      );

    // for vertical shift if driving filter is missing
    const y_shift = showDrivingFilter ? 0 : -50*sliderParameters.scale;
    // group the map and legend
    this.mapAndLegendG = this.container.selectAll('#mapAndLegendG').data([sliderParameters]); // singleton
    this.mapAndLegendG = this.mapAndLegendG
      .enter().append('g')
        .attr('id', 'mapAndLegendG')
      .merge(this.mapAndLegendG)
        .attr('transform', d => 'translate(0,' + y_shift + ')');

    // draw the color legend manually
    let colorLegendG = this.mapAndLegendG.selectAll('.mapColorLegendG').data([sliderParameters]);
    colorLegendG = colorLegendG
      .enter().append('g')
        .attr('class', 'mapColorLegendG')
      .merge(colorLegendG)
        .attr("transform", d => "translate(" + (d.x + 1200*d.scale) + "," + (d.y + 2800*d.scale) + ")");

    const colorLegend = colorLegendG.selectAll('rect').data(legendColors);
    const legendLineHeight = 140*sliderParameters.scale;
    colorLegend
      .enter().append('rect')
        .attr('x', 0)
      .merge(colorLegend)
        .attr('fill', d => d)
        .attr('width', legendLineHeight*.9)
        .attr('height', legendLineHeight*.9)
        .attr('y', (d, i) => (i-0.3)*legendLineHeight);
    
    const colorLegendText = colorLegendG.selectAll('text').data(legendLabels);
    colorLegendText
      .enter().append('text')
        .attr('fill', d => d)
        .attr('fill', '#666')
        .attr('alignment-baseline', 'middle')
        .html(d => d)
      .merge(colorLegendText)
        .attr('font-size', 0.75*legendLineHeight)
        .attr('x', legendLineHeight)
        .attr('y', (d, i) => (i + 0.2)*(legendLineHeight));

    if(showDrivingFilter) {
      // add instructions and title
      const instructions = this.container.selectAll('.instructions').data([sliderParameters]);
      instructions
        .enter().append('text')
          .attr('class', 'instructions')
        .merge(instructions)
          .text(
            myTown == outOfState ?
              'select a town to filter by driving time' :
              'drag car to filter by driving time'
          )
          .attr('x', d => d.x + 3*legendLineHeight)
          .attr('y', d => d.y + 2.2*legendLineHeight)
          .attr('font-size', d => 0.75*legendLineHeight);
    }

    function isReachable(town) {
      return (myTown == outOfState || !showDrivingFilter) ? true : drivingTimes[myTownIndex][town] <= Math.round(carSlider.value);
    }

    // Start work on the choropleth map
    // idea from https://www.youtube.com/watch?v=lJgEx_yb4u0&t=23s
    const mapScale = getMapScale(width, height, showDrivingFilter);
    const CT_coords = [-72.7,41.6032];
    const projection = d3.geoMercator()
      .center(CT_coords)
      .scale(mapScale)
      .translate([centerX, centerY]);
    const path = d3.geoPath().projection(projection);

    const pathClassName = 'areapath';
    let areas = this.mapAndLegendG.selectAll('.' + pathClassName)
      .data(mapFeatures.all);

    areas = areas
      .enter().append('path')
        .on('mouseover', d => { tip.show(d); dateHighlighter(d.properties.NAME10); } )
        .on('mouseout', d => { tip.hide(d); dateHighlighter(); } )
      .merge(areas)
        .attr('d', path)
        .attr('class', d => {
          const reachableClass = isReachable(d.properties.NAME10) ?
            ' reachable' : ' unreachable';
          return myName != noPersonName && townsRun[d.properties.NAME10] ? 
              pathClassName + ' area alreadyRun' + reachableClass : 
              pathClassName + ' area ' + raceHorizonByTown[d.properties.NAME10].raceType + reachableClass;
        });

    const highlightPathClassName = 'highlightareapath';
    let highlightAreas = this.mapAndLegendG.selectAll('.' + highlightPathClassName)
      .data(mapFeatures.elusive);

    highlightAreas = highlightAreas
      .enter().append('path')
        .attr('class', highlightPathClassName)
        .attr('fill', 'none')
        .attr('stroke-width', 3)
      .merge(highlightAreas)
        .attr('stroke', highlightElusive ? 'black' : 'none')
        .attr('d', path);

    function dragstarted(d) {
      d3.select(this).raise().classed('active', true);
    }

    function dragged(d) {
      d.x = d3.event.x < 0 ?
        0 : 
        d3.event.x >  sliderParameters.width ?
          sliderParameters.width :
          d3.event.x;

      d.value = sliderScale(d.x);

      // note trick: scale(1) before translate to ensure 1-to-1 ratio
      // of pixels dragged and pixels translated
      d3.select(this)
          .attr('transform', 'scale(1) translate('+ d.x + ') scale(' + carScale + ')');

      carLabel.merge(carLabel)
          .text(d => drivingTimeToString(sliderScale(d.x)));

      carLine.merge(carLine)
        .attr('x', 0)
        .attr('width', d => d.x);

      areas.merge(areas)
          .attr("class", d => {
              const reachableClass = isReachable(d.properties.NAME10) ?
                ' reachable' : ' unreachable';
              return myName != noPersonName && townsRun[d.properties.NAME10] ? 
                pathClassName + ' area alreadyRun' + reachableClass : 
                pathClassName + ' area ' + raceHorizonByTown[d.properties.NAME10].raceType + reachableClass;
          });
    }

    function dragended(d) {
      d3.select(this).classed('active', false);
    }
  }

  setOptions(options) {
    this.options = options;
  }

  setContainer(container) {
    this.container = container;
  }

  setBox(box) {
    this.box = box;
  }

  setElusiveHighlight(trueFalse) {
    this.options.highlightElusive = trueFalse;
  }
}





/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Calendar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getCalendarHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return rollUpDataForCalendar; });
const formatCell = d3.format("0");
const fmt2 = d3.timeFormat("%Y-%m-%d");

const nWeeks = 52;
const nDays = 7;

function getNumRows(width) {
  return width > 800 ? 1 : width > 400 ? 2 : 4;
}

function getCellSize(width) {
  return width/(nWeeks+13*getNumRows(width))*getNumRows(width);
}

function getCalendarHeight(width) {
  return getCellSize(width)*10 * getNumRows(width);
}

function rollUpDataForCalendar(racesData, elusiveTowns) {
  // Compute data needed for the calendar
  // roll up data for all races

  const calendarData = d3.nest()
      .key(d => d.DateStringForCalendar)
      .rollup(d => {
        // collect together different distances for same race
        const summary = d3.nest()
          .key(x => x.Town + x.Name)
          .rollup(
            x => {
              return {
                Town: x[0].Town,
                Name: x[0].Name,
                Distances: x.map(u => u.Distance).join('/')
              };
            }
          ).entries(d);
        return { 
          length: summary.length,
          races: '<table>' + 
            summary.map(
              x => '<tr><td>' + x.value.Town + '</td>' +
                '<td><span class="racedistance-calendar">' + x.value.Distances + '</span></td>' +
                '<td><span class="racename-calendar">' +  x.value.Name + '</span></td></tr>'
            ).sort().join('\n') + '</table>'
        }; 
      })
    .object(racesData);

  // roll up data, but only for races in elusive towns
  const calendarDataElusive = d3.nest()
      .key(d => d.DateStringForCalendar)
      .rollup(d => { return { length: d.length } } )
    .object(racesData.filter(d => elusiveTowns[d.Town]));

  return { all: calendarData, elusive: calendarDataElusive };
}

class Calendar {
  constructor(opts) {
    this.data = opts.data;
    this.margin = opts.margin;
    // Show the current year
    this.shownYear = (new Date()).getFullYear();
    this.tip = d3.tip()
        .attr('class', 'd3-tip-calendar')
        .offset([-10, 0]);

    d3.selectAll('svg').call(this.tip);
  }

  setTownHighlighter(townHighlighter) {
    this.townHighlighter = townHighlighter;
  }

  drawYearLabel(container) {
    // year label
    const yearLabel = container.selectAll('.yearLabel').data([null]);
    const cs = this.cellSize;
    yearLabel
      .enter()
      .append("text")
        .attr("class", "yearLabel")
        .attr("text-anchor", "middle")
        .text(this.shownYear)
      .merge(yearLabel)
        .attr("transform", "translate(-" + 1.9*cs + "," + cs * 3.5 + ")rotate(-90)")
        .attr("font-size", cs*1.6);
  }

  setCellSize(width) {
    this.cellSize = getCellSize(width);
  }

  setNumRows(width) {
    this.nRows = getNumRows(width);
  };

  getQuarter(d) {
    return Math.floor(d.getMonth()/3);
  }

  getRow(d) {
    return Math.floor(this.getQuarter(d)/4*this.nRows);
  }

  getColumn(d) {
    const week = d3.timeWeek.count(d3.timeYear(d), d);
    return week - this.getRow(d)*(52/this.nRows);
  }

  getDateX(d) {
    return this.getColumn(d)*this.cellSize;
  }

  getDateY(d) {
    return d.getDay()*this.cellSize + this.getRow(d)*10*this.cellSize;
  }

  drawBackgroundGrid(container) {
    // draw the background grid
    // Note: this relies on the top-left corner of this group being (0,0)
    const calendarData = this.data[1];
    const calendarRectClass = 'calendarRect';
    let rect = container
      .selectAll('.' + calendarRectClass)
      .data(d3.timeDays(new Date(this.shownYear, 0, 1), new Date(this.shownYear + 1, 0, 1)));

    rect = rect
      .enter().append('rect')
        .attr('class', calendarRectClass)
        .attr('fill', 'none')
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
      .merge(rect)
        .attr("width", this.cellSize)
        .attr("height", this.cellSize)
        .attr("x", d => this.getDateX(d))
        .attr("y", d => this.getDateY(d));

    this.tip
      .html(d => '<span class="racedate-calendar">' + fmt2(d) + '</span>'
        + calendarData.all[fmt2(d)].races
      );

    // fill the rects for each day
    rect.filter(d => fmt2(d) in calendarData.all)
        .attr("fill", d => this.color(calendarData.all[fmt2(d)].length))
        .attr("class", calendarRectClass + ' day_with_race')
        .on('mouseover', d => { this.tip.show(d); this.townHighlighter(d); } )
        .on('mouseout', d => { this.tip.hide(d); this.townHighlighter(); } );
  }

  setColors() {
    this.legendColors = ['#fff', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
    this.legendLabels = [null, '&nbsp;&nbsp;1&ndash;5', '&nbsp;&nbsp;6&ndash;10', '11&ndash;15', '16&ndash;20', 'over 20'];
    this.color = d3.scaleThreshold()
        .domain([1, 6, 11, 16, 21])
        .range(this.legendColors);
  }

  pathMonth(t0) {
    const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
        d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    const c0 = this.getColumn(t0), c1 = this.getColumn(t1);
    const cs = this.cellSize;
    const rowOffset = this.getRow(t0)*10*cs;
    return "M" + (c0 + 1)*cs + "," + (d0*cs + rowOffset)
        + "H" + c0*cs + "V" + (7*cs + rowOffset)
        + "H" + c1 * cs + "V" + ((d1 + 1)*cs + rowOffset)
        + "H" + (c1 + 1) * cs + "V" + rowOffset
        + "H" + (c0 + 1) * cs + "Z";
  }

  draw() {
    const [
      racesData,
      calendarData
    ] = this.data;

    const highlightElusive = this.options.highlightElusive;

    const width = this.box.width, height = this.box.height;

    // note: wrapping algorithm designed for nRows = 1, 2, and 4
    this.setNumRows(width);
    const nRows = this.nRows;
    this.setCellSize(width);
    const cellSize = this.cellSize;
   
    this.setColors();
    const legendColors = this.legendColors;
    const legendLabels = this.legendLabels;
    const color = this.color;

    const currentYear = (new Date()).getFullYear();

    // use the "manage only one thing" GUP
    // Calendar group
    let calendarG = this.container.selectAll('.calendargroup').data([null]);
    calendarG = calendarG
      .enter().append('g')
        .attr('class', 'calendargroup')
      .merge(calendarG)
        .attr("transform", "translate(" + 
          ((width - cellSize * 53/nRows) / 2 - 1*2*cellSize/nRows) + "," + 
          2*cellSize + ")");
    this.calendarG = calendarG;

    this.drawYearLabel(calendarG);

    this.drawBackgroundGrid(calendarG);

    // draw the color legend manually
    // use the "manage only one thing" version of the General Update Pattern
    let colorLegendG = calendarG.selectAll('.calendarLegendG').data([null]);
    colorLegendG = colorLegendG
      .enter().append('g')
        .attr('class', 'calendarLegendG')
      .merge(colorLegendG)
        .attr("transform", "translate(" + (54*cellSize/nRows) + "," + (0.5*cellSize) + ")");

    const colorLegend = colorLegendG.selectAll('rect').data(legendColors.slice(1));
    const legendLineHeight = cellSize*1.4;
    colorLegend
      .enter().append('rect')
        .attr('x', 0)
      .merge(colorLegend)
        .attr('fill', d => d)
        .attr('width', legendLineHeight*.9)
        .attr('height', legendLineHeight*.9)
        .attr('y', (d, i) => (i-0.3)*legendLineHeight);
    
    const colorLegendText = colorLegendG.selectAll('text').data(legendLabels.slice(1));
    colorLegendText
      .enter().append('text')
        .attr('fill', d => d)
        .attr('fill', '#666')
        .attr('alignment-baseline', 'middle')
        .html(d => d)
      .merge(colorLegendText)
        .attr('font-size', cellSize)
        .attr('x', cellSize*2)
        .attr('y', (d, i) => (i + 0.2)*(legendLineHeight));

    // legend title
    const legendTitle = colorLegendG.selectAll('.legendTitle').data([null]);
    legendTitle
      .enter()
      .append("text")
        .attr("class", "legendTitle")
        .attr('fill', '#666')
        .text('# of Races')
      .merge(legendTitle)
        .attr('transform', 'translate(0,-' + cellSize + ')')
        .attr("font-size", cellSize*1.2);


    // monthOutlines
    let monthOutlinesG = calendarG.selectAll('#monthOutlines').data([null]);
    monthOutlinesG = monthOutlinesG
      .enter().append('g')
        .attr('id', 'monthOutlines')
      .merge(monthOutlinesG)
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('stroke-width', d3.min([2, cellSize/5]));

    const monthOutlines = monthOutlinesG.selectAll('.monthPath')
      .data(d3.timeMonths(new Date(this.shownYear, 0, 1), new Date(this.shownYear + 1, 0, 1)));
    monthOutlines
      .enter().append('path')
        .attr('class', 'monthPath')
      .merge(monthOutlines)
        .attr('d', t => this.pathMonth(t) );

    // for days with elusive races
    const elusiveRectClass = 'elusiveRect';
    let elusiveRect = calendarG
      .selectAll('.' + elusiveRectClass)
      .data(d3.timeDays(
        new Date(this.shownYear, 0, 1), new Date(this.shownYear + 1, 0, 1)
      ).filter(d => fmt2(d) in calendarData.elusive));

    elusiveRect = elusiveRect
      .enter().append('rect')
        .attr('class', elusiveRectClass)
        .attr('fill', 'none')
        .attr("stroke-width", 3)
      .merge(elusiveRect)
        .attr('stroke', highlightElusive ? 'black' : 'none')
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", d => this.getDateX(d))
        .attr("y", d => this.getDateY(d));

    // frame for today's date: only if relevant
    if(currentYear == this.shownYear) {
      const today = d3.timeDay(new Date());
      const todayMarker = calendarG.selectAll('.todayDate').data([today]);
      todayMarker
        .enter().append('circle')
          .attr('class', 'todayDate')
          .attr('fill', 'none')
          .attr('stroke', '#d73027')
        .merge(todayMarker)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('r', 1.6*cellSize/2)
          .attr('stroke-width', d3.min([3, cellSize/5]))
          .attr("cx", d => this.getDateX(d) + cellSize/2)
          .attr("cy", d => this.getDateY(d) + cellSize/2);
    }


    // get bounding box for each month outline
    const mp = document.getElementById("monthOutlines").childNodes;
    const BB = Array.prototype.slice.call(mp).map(d => d.getBBox());
    const monthX = BB.map(d => d.x + d.width/2);
    // add the labels
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabels = calendarG.selectAll('.monthLabel').data(months);
    function getMonthLabelRow(m) {
      return Math.floor(m/(12/nRows));
    }
    monthLabels
      .enter().append('text')
        .attr('class', 'monthLabel')
        .text(d => d)
      .merge(monthLabels)
        .attr('x', (d, i) => monthX[i])
        .attr('y', (d, i) => -10 + getMonthLabelRow(i)*10*cellSize)
        .attr('font-size', cellSize*1.2);

    const weekDayText = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const weekDayLabels = calendarG.selectAll('.weekDayLabel').data(weekDayText);
    weekDayLabels
      .enter().append('text')
        .attr('class', 'weekDayLabel')
        .text(d => d)
        .attr('fill', '#666')
      .merge(weekDayLabels)
        .attr('x', -1.4*cellSize)
        .attr("font-size", 0.8*cellSize)
        .attr('y', (d, i) => cellSize*(i + 0.8));

  }

  getDateHighlighter() {
    // collect dates for each town
    // access elements as datesPerTown['Canton'] 
    // yields a set of unique date strings for each town
    this.datesPerTown = this.data[0].reduce((accumulator, currentValue) => {
      if(!(currentValue.Town in accumulator)) {
        accumulator[currentValue.Town] = new Set();
      }
      const yr = parseInt(currentValue.DateStringForCalendar.substr(0,4));
      const mo = parseInt(currentValue.DateStringForCalendar.substr(5,2));
      const dy = parseInt(currentValue.DateStringForCalendar.substr(8));
      const d = new Date(yr, mo - 1, dy);
      if(yr == this.shownYear) {
        // use getTime to have set equality avoid duplicate dates
        accumulator[currentValue.Town].add(d.getTime());
      }
      return accumulator;
    }, {});
    // create highlighter based on list of dates
    // return highlighter after binding to data

    return townName => { this.highlightDatesForTown(townName); };
  }
  
  highlightDatesForTown(townName) {
    // if town is empty, remove highlighting
    const highlightRectClass = 'highlightTownRect';
    let data = [];
    if(townName in this.datesPerTown) {
      data = Array.from(this.datesPerTown[townName], d => new Date(d));
    }
    let highlightRect = this.calendarG
      .selectAll('.' + highlightRectClass)
      .data(data);

    highlightRect
      .enter().append('rect')
        .attr('class', highlightRectClass)
        .attr('fill', '#d73027')
        .attr("stroke-width", 2)
      .merge(highlightRect)
        .attr('stroke', '#000')
        .attr("width", this.cellSize)
        .attr("height", this.cellSize)
        .attr("x", d => this.getDateX(d))
        .attr("y", d => this.getDateY(d));

    highlightRect.exit().remove();
  }

  setOptions(options) {
    this.options = options;
  }
  
  setContainer(container) {
    this.container = container;
  }

  setBox(box) {
    this.box = box;
  }

  setElusiveHighlight(trueFalse) {
    this.options.highlightElusive = trueFalse;
  }
}





/***/ })
/******/ ]);