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




const margin = { left: 120, right: 300, top: 20, bottom: 120 };

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
  // call the specific renderer
  functions[name](g, props[name], box);
};


const layout = {
  orientation: "vertical",
  children: [
    "calendar",
    {
      orientation: "horizontal",
      children: [
        "selector",
        "drivingTimesFilter",
        "map"
      ],
      size: 3
    }
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

  const townNames = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["f" /* getTownNames */])(drivingTimes);
  const townIndex = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["d" /* buildTownIndex */])(townNames);
  const { racesRunMap, memberTownsMap } = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["b" /* buildRacesRunMap */])(membersTowns, townNames);
  const raceHorizonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["a" /* buildRaceHorizon */])(racesForMap, townNames);
  const racesSoonByTown = Object(__WEBPACK_IMPORTED_MODULE_0__choroplethMap__["c" /* buildRacesSoonTables */])(racesForMap);

  const memberNames = [];
  membersTowns.sort((x, y) => d3.ascending(x.Name, y.Name)).forEach((row, i) => {
    memberNames.push({ 
      title: row.Name,
      description:  row.Town + ' - ' + row.TotalTowns + ' towns'
    });
  });


  const render = () => {
    const defaultName = memberNames[0].title;

    let myName = $('.ui.search').search('get value');
    if(!(myName in memberTownsMap)) myName = defaultName;
    const myTown = memberTownsMap[myName];
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
      },
      selector: { },
      drivingTimesFilter: { }
    };

    // Extract the width and height that was computed by CSS.
    const width = visualizationDiv.clientWidth;
    const height = visualizationDiv.clientHeight;
    svg
      .attr('width', width)
      .attr('height', height);

    const box = {
      width: width,
      height: height
    };

    const boxes = d3.boxes(layout, sizes, box);

    // Render the choropleth map.
    Object.keys(boxes).forEach( name => { drawBox(name, boxes[name], functions, props); } );

  }

  // Draw for the first time to initialize.
  render();

  // Redraw based on the new size whenever the browser window is resized.
  window.addEventListener('resize', render);

  $('.ui.search').search({
    source: memberNames,
    maxResults: 10,
    onSelect: function(result, response) {
      // hack to prevent inconsistency when result is selected after
      // entering a partial match
      $('#searchText').val(result.title);
      render();
    }
  });

}

d3.queue()
  .defer(d3.json, 'data/ct_towns_simplified.topojson')
  .defer(d3.csv, 'data/driving_times_full_symmetric.csv', __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["g" /* parseDrivingMap */])
  .defer(d3.csv, 'data/members_towns_clean.csv')
  .defer(d3.csv, 'data/races2017.csv', __WEBPACK_IMPORTED_MODULE_0__choroplethMap__["h" /* parseRaces */])
  .defer(d3.csv, 'data/races2017.csv', __WEBPACK_IMPORTED_MODULE_1__calendar_js__["b" /* parseRace */])
  .await(dataLoaded);




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return choroplethMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return parseDrivingMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return buildRacesRunMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return parseRaces; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return getTownNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return buildTownIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return buildRaceHorizon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return buildRacesSoonTables; });
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
  const mins = drivingTimeMins - 60*hours;
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

  // TODO: fix if town is 'Out of State'
  const myTownIndex = townIndex[myTown];

  completeTooltipTables(racesSoonByTown);

  const colorScale = d3.scaleOrdinal()
    .domain(["Race within 1 week", "Race within 2 weeks", "Town already run"])
    .range(["#f03b20", "#feb24c", "#16a"]);
  // TODO: have legend scale with plot
  const colorLegend = d3.legendColor()
    .scale(colorScale)
    .shapeWidth(40)
    .shapeHeight(20);

  // use the "manage only one thing" version of the General Update Pattern
  const colorLegendG = container.selectAll(".color-legend").data([null])
    .enter().append('g')
    .attr("transform",`translate(10,10)`);
  colorLegendG.call(colorLegend)
    .attr("class", "color-legend");

  // Extract the width and height that was computed by CSS.
  const width = box.width;
  const height = box.height;
  const innerWidth = width - props.margin.left - props.margin.right;
  const innerHeight = height - props.margin.top - props.margin.bottom;

  const centerX = width/2;
  const centerY = height/2;

  tip
    .html(d => '<span class="townname">' + d.properties.NAME10 + '</span>'
        + (myTown == 'Out of State' ? '' :
          '<br><span>' + drivingTimeToString(drivingTimes[myTownIndex][d.properties.NAME10])
        + ' driving</span>')
        + '<span>' 
        + (d.properties.NAME10 in racesSoonByTown ?
          racesSoonByTown[d.properties.NAME10]
          : '')
        + '</span>'
    );


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
  const areas = container.selectAll('.' + pathClassName)
    .data(topojson.feature(mapData, mapData.objects.townct_37800_0000_2010_s100_census_1_shp_wgs84).features);

  areas
    .enter()
    .append('path')
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(areas)
      .attr('class', d =>
          racesRunMap[myName][d.properties.NAME10] ? 
            pathClassName + " area alreadyRun" : 
            pathClassName + " area " + raceHorizonByTown[d.properties.NAME10].raceType
      )
      .attr('d', path);
}





/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return calendar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return parseRace; });
const fmt = d3.format("02");
const parseRace = d => {
  d.Month = +d.Month;
  d.Day = +d.Day;
  d.Weekday = +d.Weekday;
  d.DateString = "2017-" + fmt(d.Month) + "-" + fmt(d.Day);
  return d;
};

const formatCell = d3.format("0");

function calendar(container, props, box) {
  const [racesData] = props.data;

  const nWeeks = 52;
  const nDays = 7;

  const width = box.width,
    height = box.height,
    cellSize = d3.min([width/(nWeeks+13), height/(nDays+8)]);

  
  const legendColors = ['#fff', '#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
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
        ((width - cellSize * 53) / 2 - 2*cellSize) + "," + 
        (height - cellSize * 7 - 1)/2 + ")");

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

  rect = rect
    .enter().append("rect")
      .attr('fill', 'none')
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
    .merge(rect)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
      .attr("y", d => d.getDay() * cellSize);

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
      .attr("transform", "translate(" + (54*cellSize) + "," + (0.5*cellSize) + ")");

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
      //.attr('text-anchor', 'middle')
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
  const todayRect = calendarG.selectAll('.todayDate').data([null]);
  todayRect
    .enter().append('rect')
      .attr('class', 'todayDate')
      .attr('fill', 'none')
      .attr('stroke', 'black')
    .merge(todayRect)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('stroke-width', d3.min([3, cellSize/5]))
      .attr('x', d3.timeWeek.count(d3.timeYear(today), today)*cellSize)
      .attr('y', today.getDay() * cellSize);

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
  monthLabels
    .enter().append('text')
      .attr('class', 'monthLabel')
      .attr('y', -10)
      .text(d => d)
    .merge(monthLabels)
      .attr('x', (d,i) => monthX[i])
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
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }
}





/***/ })
/******/ ]);