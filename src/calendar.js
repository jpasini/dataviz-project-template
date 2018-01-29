const fmt = d3.format("02");
const parseRace = d => {
  d.Month = +d.Month;
  d.Day = +d.Day;
  d.Weekday = +d.Weekday;
  d.DateString = "2018-" + fmt(d.Month) + "-" + fmt(d.Day);
  return d;
};

const formatCell = d3.format("0");
const fmt2 = d3.timeFormat("%Y-%m-%d");

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
      .rollup(d => {
        return { 
          length: d.length,
          races: '<table>' + d.map(
            x => '<tr><td>' + x.Town + '</td><td><span class="racedistance">' + x.Distance + '</span></td><td><span class="racename">' +  x.Name + '</span></td></tr>'
          ).sort().join("\n") + '</table>'
        }; 
      })
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

class Calendar {
  constructor(opts) {
    this.data = opts.data;
    this.margin = opts.margin;
    this.shownYear = 2018;
    this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0]);

    d3.selectAll('svg').call(this.tip);
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
      .html(d => '<span class="racedate">' + fmt2(d) + '</span>'
        + calendarData.all[fmt2(d)].races
      );

    // fill the rects for each day
    rect.filter(d => fmt2(d) in calendarData.all)
        .attr("fill", d => this.color(calendarData.all[fmt2(d)].length))
        .attr("class", calendarRectClass + ' day_with_race')
        .on('mouseover', d => { this.tip.show(d); townHighlighter(d); } )
        .on('mouseout', d => { this.tip.hide(d); townHighlighter(); } );
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
      const yr = currentValue.DateString.substr(0,4);
      const mo = currentValue.DateString.substr(5,2);
      const dy = currentValue.DateString.substr(8);
      const d = new Date(yr, mo - 1, dy);
      // use getTime to have set equality avoid duplicate dates
      accumulator[currentValue.Town].add(d.getTime());
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

export { Calendar, parseRace, getCalendarHeight, rollUpDataForCalendar, getDateHighlighter };

