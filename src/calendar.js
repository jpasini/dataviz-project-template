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

function rollUpDataForCalendar(racesData, numberOfRacesByTown) {
  // Compute data needed for the calendar
  // roll up data for all races
  const calendarData = d3.nest()
      .key(d => d.DateString)
      .rollup(d => { return {"length": d.length, "races": d.map(x => x.Town + " (" + x.Distance + "): " +  x.Name).sort().join("\n")}; })
    .object(racesData);

  // roll up data, but only for races in elusive towns
  function isElusive(town) {
    return numberOfRacesByTown[town] <= 1;
  }

  const calendarDataElusive = d3.nest()
      .key(d => d.DateString)
      .rollup(d => { return { length: d.length } } )
    .object(racesData.filter(d => isElusive(d.Town)));

  return { all: calendarData, elusive: calendarDataElusive };
}

function calendar(container, props, box) {
  const [
    racesData,
    highlightElusive,
    calendarData
  ] = props.data;


  const width = box.width, height = box.height;

  // note: wrapping algorithm designed for nRows = 1, 2, and 4
  const nRows = getNumRows(width);
  const cellSize = getCellSize(width);
  
  const legendColors = ['#fff', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
  const legendLabels = [null, '&nbsp;&nbsp;1&ndash;5', '&nbsp;&nbsp;6&ndash;10', '11&ndash;15', '16&ndash;20', 'over 20'];
  const color = d3.scaleThreshold()
      .domain([1, 6, 11, 16, 21])
      .range(legendColors);

  const currentYear = 2017;

  // use the "manage only one thing" GUP
  // Calendar group
  let calendarG = container.selectAll('.calendargroup').data([null]);
  calendarG = calendarG
    .enter().append('g')
      .attr('class', 'calendargroup')
    .merge(calendarG)
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

  // draw the background grid
  // Note: this relies on the top-left corner of this group being (0,0)
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

  const calendarRectClass = 'calendarRect';
  let rect = calendarG
    .selectAll('.' + calendarRectClass)
    .data(d3.timeDays(new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)));

  rect = rect
    .enter().append('rect')
      .attr('class', calendarRectClass)
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
  rect.filter(d => fmt2(d) in calendarData.all)
      .attr("fill", d => color(calendarData.all[fmt2(d)].length))
      .attr("class", calendarRectClass + ' day_with_race')
    .append("title")
      .text(d => fmt2(d) + ": " + formatCell(calendarData.all[fmt2(d)].length) + " races\n" +  calendarData.all[fmt2(d)].races);

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
    .data(d3.timeMonths(new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)));
  monthOutlines
    .enter().append('path')
      .attr('class', 'monthPath')
    .merge(monthOutlines)
      .attr('d', pathMonth);

  // for days with elusive races
  const elusiveRectClass = 'elusiveRect';
  let elusiveRect = calendarG
    .selectAll('.' + elusiveRectClass)
    .data(d3.timeDays(
      new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)
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
      .attr("x", d => getDateX(d))
      .attr("y", d => getDateY(d));

  // frame for today's date
  const today = d3.timeDay(new Date());
  const todayRect = calendarG.selectAll('.todayDate').data([today]);
  todayRect
    .enter().append('circle')
      .attr('class', 'todayDate')
      .attr('fill', 'none')
      .attr('stroke', '#d73027')
    .merge(todayRect)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('r', 1.6*cellSize/2)
      .attr('stroke-width', d3.min([3, cellSize/5]))
      .attr("cx", d => getDateX(d) + cellSize/2)
      .attr("cy", d => getDateY(d) + cellSize/2);


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

export { calendar, parseRace, getCalendarHeight, rollUpDataForCalendar};

