import {
  ChoroplethMap,
  parseDrivingMap,
  buildRacesRunMap,
  parseRaces as parseRacesForMap,
  getTownNames,
  buildTownIndex,
  buildRaceHorizon,
  buildRacesSoonTables,
  getMapHeight,
  computeNumberOfRacesByTown,
  computeMapFeatures
} from './choroplethMap'

import {
  Calendar,
  parseRace as parseRacesForCalendar,
  getCalendarHeight,
  rollUpDataForCalendar
} from './calendar.js'

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


function dataLoaded(mapData, drivingTimes, membersTowns, racesForMap, racesForCalendar, num_races_by_town_2017) {

  const outOfState = 'Out of State';
  const noPersonName = 'noPersonName';
  let highlightElusive = $('.ui.toggle.button').state('is active');

  const pageParameters = getPageParameters();

  const townNames = getTownNames(drivingTimes);
  const townIndex = buildTownIndex(townNames);
  const { racesRunMap, memberTownsMap } = buildRacesRunMap(membersTowns, townNames);
  const raceHorizonByTown = buildRaceHorizon(racesForMap, townNames);
  const racesSoonByTown = buildRacesSoonTables(racesForMap);
  const numberOfRacesByTown = computeNumberOfRacesByTown(num_races_by_town_2017);

  const mapFeatures = computeMapFeatures(mapData, numberOfRacesByTown);
  const calendarData = rollUpDataForCalendar(racesForCalendar, numberOfRacesByTown);
  const memberNames = [];
  membersTowns.sort((x, y) => d3.ascending(x.Name, y.Name)).forEach((row, i) => {
    memberNames.push({ 
      title: row.Name,
      description: row.Town + ' - ' + row.TotalTowns + ' towns'
    });
  });

  class PersonAndTownName {
    constructor() {
      // start with defaults
      this.name = noPersonName;
      this.town = outOfState;
    }

    update(params) {
      if(params == undefined) return;
      if('personName' in params) {
        // if a person is provided, override the town selection
        this.name = params.personName;
        this.town = memberTownsMap[this.name];
        // also set the town selector to the town to avoid confusion
        $('#townSearch').search('set value', this.town);
      } else if('townName' in params) {
        this.town = params.townName;
      }
    }

    getName() {
      return this.name;
    }

    getTown() {
      return this.town;
    }
  };

  const townName = new PersonAndTownName();

  const myCalendar = new Calendar({
    data: [
      racesForCalendar,
      calendarData
    ],
    margin: margin
  });
  const myMap = new ChoroplethMap({
    data: [
      mapFeatures,
      drivingTimes,
      racesRunMap,
      racesForMap,
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

    if('personName' in pageParameters) {
      townName.update(pageParameters);
    } else {
      townName.update(params);
    }

    const options = {
      myTown:  townName.getTown(),
      myName:  townName.getName(),
      highlightElusive: highlightElusive
    };
    Object.keys(charts).forEach( name => { charts[name].setOptions(options); } );

    // Extract the width and height that was computed by CSS.
    //const width = visualizationDiv.clientWidth;
    const containerBox = $('.ui.container').get(0).getBoundingClientRect();
    const width = containerBox.width; // + containerBox.left;
    const height = getMapHeight(width) + getCalendarHeight(width);
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
      map: {x: containerBox.left, y: 0, width: containerBox.width, height: getMapHeight(containerBox.width)},
      calendar: {x: containerBox.left, y: getMapHeight(containerBox.width), width: containerBox.width, height: getCalendarHeight(containerBox.width)}
    };

    // Render the content of the boxes (choropleth map and calendar)
    Object.keys(boxes).forEach( name => { drawBox(name, boxes[name], charts[name]); } );

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

//d3.json('https://omnisuite.net/run169data/api/data/Towns/', d => { console.log(d); } );

/*
d3.queue()
  .defer(d3.json, 'data/ct_towns_simplified.topojson')
  .defer(d3.csv, 'data/driving_times_full_symmetric.csv', parseDrivingMap)
  .defer(d3.csv, 'data/members_towns_clean.csv')
  .defer(d3.csv, 'data/races2018.csv', parseRacesForMap)
  .defer(d3.csv, 'data/races2018.csv', parseRacesForCalendar)
  .defer(d3.csv, 'data/num_races_by_town_2017.csv')
  .await(dataLoaded);
*/

const promises = [];

promises.push(d3.json('data/ct_towns_simplified.topojson'));
promises.push(d3.csv('data/driving_times_full_symmetric.csv', parseDrivingMap));
promises.push(d3.csv('data/members_towns_clean.csv'));
promises.push(d3.csv('data/races2018.csv', parseRacesForMap));
promises.push(d3.csv('data/races2018.csv', parseRacesForCalendar));
promises.push(d3.csv('data/num_races_by_town_2017.csv'));

Promise.all(promises).then(function(values) {
  dataLoaded(values[0], values[1], values[2], values[3], values[4], values[5]);
});

