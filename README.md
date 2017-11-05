This is a visualization to help members of [Run169](http://www.debticonn.org/)
explore races in Connecticut to help them plan what races to run in order to
reach the goal of running a race in every one of Connecticut's 169 towns.

## The visualization (and interactions)

This visualization has two parts

* On top, a map of Connecticut shows towns with races "soon" (today or
    tomorrow, within one week, or within two weeks).
    * Hovering over a town shows details of the races coming soon.
    * Once a member is chosen, it also shows in blue those towns the
        member has already run.
    * If a town is chosen, the "car" icon becomes active and can be
        used to filter towns by driving time (assuming low traffic).
    * When a member is chosen, the town automatically changes to the
        town in which the member is registered, but overriden by
        selecting a new town afterward.
* Below, a calendar shows the number of races in every day of the
    year. 
    * Hovering over a date shows the races scheduled for that day.
        Note: this hovering action does not work on cell phones yet.
    * Note how most races are on Saturdays and Sundays, except during
        the warmer months.
* "Elusive" towns only have one race a year. The show/hide button
    displays elusive towns on the map and dates on the calendar with
    races in elusive towns.

The image below shows the map after a member has been selected, the
car icon has been dragged to filter out towns farther than 53 minutes,
and elusive towns are shown in a black frame on the map and calendar.

![screenshot_2017-11-05_13-03-32](https://user-images.githubusercontent.com/5590117/32417597-e34ea5e4-c229-11e7-88cb-adeca44b6ee4.png)

## Tasks

This visualization was designed to help Run 169 members answer the
following questions:

* What races are happening soon? This includes short-term
    (today/tomorrow) as well as medium term (next week, next two
    weeks). The [color
    scheme](http://colorbrewer2.org/#type=diverging&scheme=RdYlBu&n=7)
    was chosen to represent urgency.
* How am I doing on my *Run 169 Towns* journey?
* I only want to focus on towns in which I haven't already run.
* If I'm only willing to drive *x* minutes, which towns are
    reachable? This is encoded through opacity.
* If I'm looking farther into the future (or the past!), what races
    are happening on a specific date?
* When are races going on in *elusive* towns?
* I'd like to see the pattern in time of races: when do they tend to
    happen?

## Source data

The data for this visualization comes from three sources. The first
two are published by
[Run169](http://www.debticonn.org/):

* [Race
    schedule](https://docs.google.com/spreadsheets/d/1UK8io2jFMPs2KDEMxX1xgXNwa2JKFJT5w0SpvalAqxI/edit?usp=sharing):
    we manually extract the data from the sheet for the current year
    (see issue #33). Columns include:
    * County
    * Town
    * Date/Time
    * Distance
    * Race name
* [Member
    data](https://onedrive.live.com/View.aspx?resid=FCE36160BC09E014!365&app=Excel&authkey=!ADVujkY8Qh3SXfc):
    what towns has each member run.
* Driving times between all town pairs in Connecticut. This was
    obtained via the [Google Maps Distance Matrix
    API](https://developers.google.com/maps/documentation/distance-matrix/).

### Data cleanup

#### Town names

The town names are a key piece of information, so I took pains to
ensure these were correct in both the member data and the race
schedule. This required first acquiring a correct list of town names,
then checking by hand all towns that didn't match any CT town. In some
cases these were misspelt; in others, the member's town was from out
of state. All the errors were encoded into a set of cleanup rules, so
they could be fixed every time the data was refreshed.

#### Member names

There is always the possibility that two people have the same name. In
this data set there is a handful of duplicate names. Some have all
other data equal, some have different data. E.g., you may find the
same first and last name registered in different towns. These could be
two different people, or the same person after moving. I did not want
to make a call, so I simply disambiguate the names by making them
slightly different, like this: "Smith, John" and "Smith, John (2)". To
help members figure out which one is the right one, the member search
box also shows the town of registration and the number of towns
completed.

## Future work

* Connect directly to the source data, so it's automatically
    up-to-date.
* Add links to the registration page for each race.
* Fix the year transition: currently, we're only reading the race
    schedule for the current year. This means the "races in the next
    two weeks" will miss some as we approach the end of the year.


## Development

This project uses NPM and Webpack. To get started, clone the repository
and install dependencies:

```
cd run169
npm install
```

To see the page run (once it's built--see deployment below), you'll need to
serve the site using a local HTTP server.

```
npm install -g http-server
http-server
```

Now the site should be available at localhost:8080.

I prefer to use automatic refreshing during development by using the Webpack
Dev Server like this:

```
npm run serve
```

## Deployment

To deploy the code a static bundle needs to be built. To deploy it to
the [project website](https://jpasini.github.io/run169), the built code
needs to be put into the gh-pages branch:

You'll need to build the JavaScript bundle using WebPack, using this command:

```
npm run build
```

The bundle is mentioned in `.gitignore`, so the first time the *force*
option needs to be used:

```
git add -f dist/bundle.js
```

After the first time, the full sequence is

```
git checkout gh-pages
git merge master
npm run build
git add dist/bundle.js
git commit -m 'updated bundle'
git push
```


