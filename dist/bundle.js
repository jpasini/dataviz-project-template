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

const functions = {
  calendar: __WEBPACK_IMPORTED_MODULE_1__calendar_js__["a" /* calendar */],
  map: __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["e" /* choroplethMap */],
  selector: () => {},
  drivingTimesFilter: () => {}
}

function drawBox(name, box, functions, props) {
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

  /*
  // Draw a box (will remove this later)
  const rect = g.selectAll('.boxFrame').data([null]);
  rect
    .enter().append('rect')
      .attr('class', 'boxFrame')
      .attr('fill', 'none')
      .attr('stroke', '#666')
    .merge(rect)
      .attr('width', width)
      .attr('height', height);
  */

  // call the specific renderer
  functions[name](g, props[name], box);
};


const layout = {
  orientation: "vertical",
  children: [
    {
      orientation: "horizontal",
      children: [
        "map"
      ],
      size: 3
    },
    "calendar"
  ]
};

const sizes = {
  calendar: {
    size: 1
  },
  map: {
    size: 2
  }
};


function dataLoaded(error, mapData, drivingTimes, membersTowns, racesForMap, racesForCalendar) {

  const outOfState = 'Out of State';
  const noPersonName = 'noPersonName';

  const townNames = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["g" /* getTownNames */])(drivingTimes);
  const townIndex = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["d" /* buildTownIndex */])(townNames);
  const { racesRunMap, memberTownsMap } = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["b" /* buildRacesRunMap */])(membersTowns, townNames);
  const raceHorizonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["a" /* buildRaceHorizon */])(racesForMap, townNames);
  const racesSoonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["c" /* buildRacesSoonTables */])(racesForMap);

  const memberNames = [];
  membersTowns.sort((x, y) => d3.ascending(x.Name, y.Name)).forEach((row, i) => {
    memberNames.push({ 
      title: row.Name,
      description: row.Town + ' - ' + row.TotalTowns + ' towns'
    });
  });

  // defaults
  let myName = noPersonName;
  let myTown = outOfState;

  function setPersonAndTownName(params) {
    if(params == undefined) return;
    if('personName' in params) {
      // if a person is provided, override the town selection
      myName = params.personName;
      myTown = memberTownsMap[myName];
      // also set the town selector to the town to avoid confusion
      $('#townSearch').search('set value', myTown);
    } else if('townName' in params) {
      myTown = params.townName;
    }
  }

  const render = (params) => {
    const defaultName = memberNames[0].title;

    setPersonAndTownName(params);

    const props = {
      calendar: {
        data: [
          racesForCalendar
        ],
        margin: margin
      },
      map: {
        data: [
          mapData,
          drivingTimes,
          racesRunMap,
          racesForMap,
          townNames,
          townIndex,
          racesSoonByTown,
          raceHorizonByTown,
          myTown,
          myName
        ],
        margin: margin
      }
    };

    // Extract the width and height that was computed by CSS.
    //const width = visualizationDiv.clientWidth;
    const containerBox = $('.ui.container').get(0).getBoundingClientRect();
    const width = containerBox.width + containerBox.left;
    const height = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(width) + Object(__WEBPACK_IMPORTED_MODULE_1__calendar_js__["b" /* getCalendarHeight */])(width);
    svg
      .attr('width', width)
      .attr('height', height);

    const box = {
      width: width,
      height: height
    };

    //const boxes = d3.boxes(layout, sizes, box);

    const boxes = {
      map: {x: containerBox.left, y: 0, width: containerBox.width, height: Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(containerBox.width)},
      calendar: {x: containerBox.left, y: Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getMapHeight */])(containerBox.width), width: containerBox.width, height: Object(__WEBPACK_IMPORTED_MODULE_1__calendar_js__["b" /* getCalendarHeight */])(containerBox.width)}
    };



    // Render the choropleth map.
    Object.keys(boxes).forEach( name => { drawBox(name, boxes[name], functions, props); } );

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

}

d3.queue()
  .defer(d3.json, 'data/ct_towns_simplified.topojson')
  .defer(d3.csv, 'data/driving_times_full_symmetric.csv', __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["h" /* parseDrivingMap */])
  .defer(d3.csv, 'data/members_towns_clean.csv')
  .defer(d3.csv, 'data/races2017.csv', __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["i" /* parseRaces */])
  .defer(d3.csv, 'data/races2017.csv', __WEBPACK_IMPORTED_MODULE_1__calendar_js__["c" /* parseRace */])
  .await(dataLoaded);




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return choroplethMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return parseDrivingMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return buildRacesRunMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return parseRaces; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return getTownNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return buildTownIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return buildRaceHorizon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return buildRacesSoonTables; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return getMapHeight; });
function getMapHeight(width) {
  return width*3/4;
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
  }
  return currentName;
}

function buildRacesRunMap(memberTownsRun, townNames) {
  // access result as racesRunMap['Pasini, Jose']['Canton']
  // and as memberTownsMap['Pasini, Jose']
  const racesRunMap = {};
  const memberTownsMap = {};
  memberTownsRun.forEach(row => {
    const newName = createNewNameIfNeeded(row.Name, racesRunMap);
    row.Name = newName;
    memberTownsMap[row.Name] = row.Town;
    racesRunMap[row.Name] = townNames.reduce((accumulator, currentValue) => {
      accumulator[currentValue] = row[currentValue] == '1';
      return accumulator;
    }, {});
  });
  return { racesRunMap, memberTownsMap };
}

function parseTownsRunByMembers(row) {
  row.TotalTowns = +row.TotalTowns;
  return row;
}

function buildRaceHorizon(races, townNames) {
  const today = d3.timeDay(new Date());
  const raceHorizonByTown = {};
  races.forEach(row => {
    const daysToRace = d3.timeDay.count(today, row.raceDay);
    if(daysToRace >= 0 && daysToRace <= 14) {
      const raceType = daysToRace <= 7 ? 'hasRaceVerySoon' : 'hasRaceSoon'; 
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
          row["Date/Time"] + 
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

function parseRaces(row) {
  const fmt = d3.format("02");
  row.Month = +row.Month;
  row.Day = +row.Day;
  row.Weekday = +row.Weekday;
  row.DateString = fmt(row.Month) + "/" + fmt(row.Day);
  row.raceDay = d3.timeDay(new Date(2017, row.Month-1, row.Day));
  return row;
}

const tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0]);

d3.selectAll('svg').call(tip);

function getSliderParameters(width, height) {
  const scale = getMapScale(width, height);
  return { 
    x: width/2 - scale/12000*50, 
    y: height/2 - scale/12000*160, 
    width: scale/12000*180,
    scale: scale/120000
  };
}

function getMapScale(width, height) {
  // known size of CT image for given scale
  const baseScale = 12000;
  const baseWidth = 453;
  const baseHeight = 379;

  const scale1 = baseScale*width/baseWidth;
  const scale2 = baseScale*height/baseHeight;
  return d3.min([scale1, scale2]);
}

function completeTooltipTables(racesSoonByTown) {
  Object.keys(racesSoonByTown).forEach(
    town => { racesSoonByTown[town] += "</table>"; }
  );
}


const carSlider = {value: 40};

function choroplethMap(container, props, box) {
  const [
    mapData,
    drivingTimes,
    racesRunMap,
    racesForMap,
    townNames,
    townIndex,
    racesSoonByTown,
    raceHorizonByTown,
    myTown,
    myName
  ] = props.data;

  // string marker
  // TODO: find a 'DRY' way of doing this -- these are also set in index.js
  const outOfState = 'Out of State'; 
  const noPersonName = 'noPersonName';

  const myTownIndex = townIndex[myTown];

  completeTooltipTables(racesSoonByTown);

  // note: these colors must match the css above
  // TODO: DRY principle: perhaps do colors programmatically
  const legendColors = ["#67001f", "#d6604d", "#92c5de"];
  const legendLabels = ["Race within 1 week", "Race within 2 weeks", "Town already run"];

  // Extract the width and height that was computed by CSS.
  const width = box.width;
  const height = box.height;
  const innerWidth = width - props.margin.left - props.margin.right;
  const innerHeight = height - props.margin.top - props.margin.bottom;

  const centerX = width/2;
  const centerY = height/2;

  // Slider
  const sliderParameters = getSliderParameters(width, height);

  const sliderScale = d3.scaleLinear()
    .domain([0, sliderParameters.width])
    .range([0, 150])
    .clamp(true);

  carSlider.x = sliderScale.invert(carSlider.value);

  let sliderG = container.selectAll('.sliderGroup').data([sliderParameters]);
  sliderG = sliderG
    .enter().append('g')
      .attr('class', 'sliderGroup')
    .merge(sliderG)
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  const labelText = myTown;
  let drivingTimeLabel = sliderG.selectAll('.townLabel').data([labelText]);
  drivingTimeLabel = drivingTimeLabel
    .enter().append('text')
      .attr('class', 'townLabel')
      .attr('text-anchor', 'end')
    .merge(drivingTimeLabel)
      .attr('x', -10*sliderParameters.scale)
      .attr('y', 160*sliderParameters.scale)
      .attr('font-size', (175*sliderParameters.scale) + 'px')
      .text(d => d);

  let carLine = sliderG.selectAll('.carLine').data([carSlider]);
  carLine = carLine
    .enter().append('rect')
      .attr('class', 'carLine')
    .merge(carLine)
      .attr('x', 0)
      .attr('y', 100*sliderParameters.scale)
      .attr('width', d => d.x)
      .attr('height', 10*sliderParameters.scale);

  let carLabel = sliderG.selectAll('.carLabel').data([carSlider]);
  carLabel = carLabel
    .enter().append('text')
      .attr('class', 'carLabel')
      .attr('text-anchor', 'middle')
    .merge(carLabel)
      .text(d => drivingTimeToString(sliderScale(d.x)))
      .attr('x', d => d.x + 300*sliderParameters.scale)
      .attr('y', -50*sliderParameters.scale)
      .attr('font-size', (120*sliderParameters.scale) + 'px');


  const car = sliderG.selectAll('.car').data([carSlider]);
  const pathString = "m 25,0 c -4.53004,0.0112 -12.12555,0.69055 -14.0625,6.05859 -5.07703,1.58895 -10.49326,2.14878 -10.14649,9.23437 l 6.23633,0.75782 c 0,0 0.45836,3.05148 3.51563,3.13672 3.05727,0.0852 4.03125,-2.89454 4.03125,-2.89454 l 28.49609,0.0684 c 0,0 1.50286,3.40622 5.20508,3.37696 3.70222,-0.0293 4.85742,-4.37696 4.85742,-4.37696 1.52171,0.005 3.11558,0.0922 4.37695,-0.20703 0.72421,-1.0742 0.63022,-2.1633 -0.33203,-2.23828 -0.0635,-0.005 0.70644,-2.07399 -0.16797,-3.46484 l -0.0859,-1.51563 c -0.85704,-0.4383 -1.83605,-0.7606 -2.92969,-0.74023 -1.55827,-2.22881 -10.56728,-1.44901 -16.36719,-1.96485 -1.45014,-0.83459 -2.9249,-2.47089 -4.51367,-4.27343 0,0 -2.90328,-0.91128 -4.92774,-0.89453 -0.50611,0.004 -1.67553,-0.0662 -3.18554,-0.0625 z m 1.83594,1.23437 c 1.42376,-0.0226 4.15534,0.26141 4.65625,0.51563 0.66787,0.33894 3.90428,3.44039 3.58398,3.87695 -0.3203,0.43656 -8.54696,0.58251 -9.01953,0.26758 -0.47258,-0.31493 -0.28696,-4.16971 -0.0762,-4.52344 0.0527,-0.0884 0.38088,-0.12919 0.85547,-0.13672 z m -3.3418,0.16016 c 0.19862,0.0111 0.33328,0.0434 0.38281,0.10156 0.39621,0.46517 0.29788,4.24032 -0.0234,4.38477 -0.26357,0.11849 -7.94003,0.75278 -8.31054,0.43945 -0.37051,-0.31334 0.16129,-2.35076 1.14648,-3.24024 0.86204,-0.77829 5.41436,-1.76307 6.80469,-1.68554 z"
  const carScale = 10*sliderParameters.scale;

  car
    .enter().append('path')
      .attr('d', pathString)
    .merge(car)
      .attr('class', myTown == outOfState ? 'car inactive' : 'car')
      .attr('transform', d => 'translate(' + d.x + ') scale(' + carScale + ')')
      .call(d3.drag()
          .on('start', myTown == outOfState ? () => {} : dragstarted)
          .on('drag', myTown == outOfState ? () => {} : dragged)
          .on('end', myTown == outOfState ? () => {} : dragended));

  tip
    .html(d => '<span class="townname">' + d.properties.NAME10 + '</span>'
        + (myTown == outOfState ? '' :
          '<br><span>' + drivingTimeToString(drivingTimes[myTownIndex][d.properties.NAME10])
        + ' driving</span>')
        + '<span>' 
        + (d.properties.NAME10 in racesSoonByTown ?
          racesSoonByTown[d.properties.NAME10]
          : '')
        + '</span>'
    );

  // draw the color legend manually
  let colorLegendG = container.selectAll('.mapColorLegendG').data([sliderParameters]);
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

  // add instructions and title
  const instructions = container.selectAll('.instructions').data([sliderParameters]);
  instructions
    .enter().append('text')
      .attr('class', 'instructions')
      .text('drag car to filter by driving time')
    .merge(instructions)
      .attr('x', d => d.x + 3*legendLineHeight)
      .attr('y', d => d.y + 2.2*legendLineHeight)
      .attr('font-size', d => 0.75*legendLineHeight);

  function isReachable(town) {
    return myTown == outOfState ? true : drivingTimes[myTownIndex][town] <= Math.round(carSlider.value);
  }

  // Start work on the choropleth map
  // idea from https://www.youtube.com/watch?v=lJgEx_yb4u0&t=23s
  const mapScale = getMapScale(width, height);
  const CT_coords = [-72.7,41.6032];
  const projection = d3.geoMercator()
    .center(CT_coords)
    .scale(mapScale)
    .translate([centerX, centerY]);
  const path = d3.geoPath().projection(projection);

  const pathClassName = 'areapath';
  let areas = container.selectAll('.' + pathClassName)
    .data(topojson.feature(mapData, mapData.objects.townct_37800_0000_2010_s100_census_1_shp_wgs84).features);

  areas = areas
    .enter().append('path')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
    .merge(areas)
      .attr('d', path)
      .attr('class', d => {
        const reachableClass = isReachable(d.properties.NAME10) ?
          ' reachable' : ' unreachable';
        return myName != noPersonName && racesRunMap[myName][d.properties.NAME10] ? 
            pathClassName + ' area alreadyRun' + reachableClass : 
            pathClassName + ' area ' + raceHorizonByTown[d.properties.NAME10].raceType + reachableClass;
      });

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
        .attr('x', d.x + 300*sliderParameters.scale)
        .text(d => drivingTimeToString(sliderScale(d.x)));

    carLine.merge(carLine)
      .attr('x', 0)
      .attr('width', d => d.x);

    areas.merge(areas)
        .attr("class", d => {
            const reachableClass = isReachable(d.properties.NAME10) ?
              ' reachable' : ' unreachable';
            return myName != noPersonName && racesRunMap[myName][d.properties.NAME10] ? 
              pathClassName + ' area alreadyRun' + reachableClass : 
              pathClassName + ' area ' + raceHorizonByTown[d.properties.NAME10].raceType + reachableClass;
        });
  }

  function dragended(d) {
    d3.select(this).classed('active', false);
  }
}





/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return calendar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return parseRace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getCalendarHeight; });
const fmt = d3.format("02");
const parseRace = d => {
  d.Month = +d.Month;
  d.Day = +d.Day;
  d.Weekday = +d.Weekday;
  d.DateString = "2017-" + fmt(d.Month) + "-" + fmt(d.Day);
  return d;
};

const formatCell = d3.format("0");

const nWeeks = 52;
const nDays = 7;

function getNumRows(width) {
  return width > 800 ? 1 : width > 400 ? 2 : 4;
}

function getCellSize(width) {
  return width/(nWeeks+13)*Math.sqrt(getNumRows(width));
}

function getCalendarHeight(width) {
  return getCellSize(width)*10 * getNumRows(width);
}

function calendar(container, props, box) {
  const [racesData] = props.data;


  const width = box.width, height = box.height;

  // note: wrapping algorithm designed for nRows = 1, 2, and 4
  const nRows = getNumRows(width);
  const cellSize = getCellSize(width);
  
  //const legendColors = ['#fff', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];
  const legendColors = ['#fff', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
  const legendLabels = [null, '&nbsp;&nbsp;1&ndash;5', '&nbsp;&nbsp;6&ndash;10', '11&ndash;15', '16&ndash;20', 'over 20'];
  const color = d3.scaleThreshold()
      .domain([1, 6, 11, 16, 21])
      .range(legendColors);

  const currentYear = 2017;

  // use the "manage only one thing" GUP
  // Calendar group
  let calendarG = container.selectAll('.calendargroup').data([null]);
  const calendarEnter = calendarG
    .enter().append('g')
      .attr('class', 'calendargroup');
  calendarG = calendarEnter.merge(calendarG)
      .attr("transform", "translate(" + 
        ((width - cellSize * 53/nRows) / 2 - 1*2*cellSize/nRows) + "," + 
        2*cellSize + ")");

  // year label
  const yearLabel = calendarG.selectAll('.yearLabel').data([null]);
  yearLabel
    .enter()
    .append("text")
      .attr("class", "yearLabel")
      .attr("text-anchor", "middle")
      .text(currentYear)
    .merge(yearLabel)
      .attr("transform", "translate(-" + 1.9*cellSize + "," + cellSize * 3.5 + ")rotate(-90)")
      .attr("font-size", cellSize*1.6);

  const data = d3.nest()
      .key(d => d.DateString)
      .rollup(d => { return {"length": d.length, "races": d.map(x => x.Town + " (" + x.Distance + "): " +  x.Name).sort().join("\n")}; })
    .object(racesData);

  // draw the background grid
  // Note: this relies on the top-left corner of this group being (0,0)
  let rect = calendarG
    .selectAll('rect')
    .data(d3.timeDays(new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)));


  function getQuarter(d) {
    return Math.floor(d.getMonth()/3);
  }

  function getRow(d) {
    return Math.floor(getQuarter(d)/4*nRows);
  }

  function getColumn(d) {
    const week = d3.timeWeek.count(d3.timeYear(d), d);
    return week - getRow(d)*(52/nRows);
  }

  function getDateX(d) {
    return getColumn(d)*cellSize;
  }

  function getDateY(d) {
    return d.getDay()*cellSize + getRow(d)*10*cellSize;
  }

  rect = rect
    .enter().append("rect")
      .attr('fill', 'none')
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
    .merge(rect)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", d => getDateX(d))
      .attr("y", d => getDateY(d));

  // fill the rects for each day
  const fmt2 = d3.timeFormat("%Y-%m-%d");
  rect.filter(d => fmt2(d) in data)
      .attr("fill", d => color(data[fmt2(d)].length))
      .attr("class", "day_with_race")
    .append("title")
      .text(d => fmt2(d) + ": " + formatCell(data[fmt2(d)].length) + " races\n" +  data[fmt2(d)].races);

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


  // frame for today's date
  const today = d3.timeDay(new Date());
  const todayRect = calendarG.selectAll('.todayDate').data([today]);
  todayRect
    .enter().append('rect')
      .attr('class', 'todayDate')
      .attr('fill', 'none')
      .attr('stroke', 'black')
    .merge(todayRect)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('stroke-width', d3.min([3, cellSize/5]))
      .attr("x", d => getDateX(d))
      .attr("y", d => getDateY(d));

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
    .data(d3.timeMonths(new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)));
  monthOutlines
    .enter().append('path')
      .attr('class', 'monthPath')
    .merge(monthOutlines)
      .attr('d', pathMonth);


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


  function pathMonth(t0) {
    const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
        d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    const c0 = getColumn(t0), c1 = getColumn(t1);
    const rowOffset = getRow(t0)*10*cellSize;
    return "M" + (c0 + 1)*cellSize + "," + (d0*cellSize + rowOffset)
        + "H" + c0*cellSize + "V" + (7*cellSize + rowOffset)
        + "H" + c1 * cellSize + "V" + ((d1 + 1)*cellSize + rowOffset)
        + "H" + (c1 + 1) * cellSize + "V" + rowOffset
        + "H" + (c0 + 1) * cellSize + "Z";
  }
}





/***/ })
/******/ ]);