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
  rollUpDataForCalendar,
  getDateHighlighter 
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


function dataLoaded(error, mapData, drivingTimes, membersTowns, racesForMap, racesForCalendar, num_races_by_town_2017) {

  const outOfState = 'Out of State';
  const noPersonName = 'noPersonName';
  let highlightElusive = $('.ui.toggle.button').state('is active');

  const townNames = getTownNames(drivingTimes);
  const townIndex = buildTownIndex(townNames);
  const { racesRunMap, memberTownsMap } = buildRacesRunMap(membersTowns, townNames);
  const raceHorizonByTown = buildRaceHorizon(racesForMap, townNames);
  const racesSoonByTown = buildRacesSoonTables(racesForMap);
  const numberOfRacesByTown = computeNumberOfRacesByTown(num_races_by_town_2017);

  const mapFeatures = computeMapFeatures(mapData, numberOfRacesByTown);
  const calendarData = rollUpDataForCalendar(racesForCalendar, numberOfRacesByTown);
  const dateHighlighter = getDateHighlighter(racesForCalendar);
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

  const charts = {
    calendar: new Calendar({
      data: [
        racesForCalendar,
        calendarData
      ],
      margin: margin
    }),
    map: new ChoroplethMap({
      data: [
        mapFeatures,
        drivingTimes,
        racesRunMap,
        racesForMap,
        townNames,
        townIndex,
        racesSoonByTown,
        raceHorizonByTown,
        dateHighlighter
      ],
      margin: margin
    })
  }

  const render = (params) => {
    setPersonAndTownName(params);

    const options = {
      myTown:  myTown,
      myName:  myName,
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

d3.queue()
  .defer(d3.json, 'data/ct_towns_simplified.topojson')
  .defer(d3.csv, 'data/driving_times_full_symmetric.csv', parseDrivingMap)
  .defer(d3.csv, 'data/members_towns_clean.csv')
  .defer(d3.csv, 'data/races2018.csv', parseRacesForMap)
  .defer(d3.csv, 'data/races2018.csv', parseRacesForCalendar)
  .defer(d3.csv, 'data/num_races_by_town_2017.csv')
  .await(dataLoaded);


