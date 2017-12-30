# Run this script after members_towns.R:  it assumes members_towns_clean.csv exists

# Load libraries ----
library(tidyverse)
library(lubridate)
library(curl)
library(readxl)


# Get data ----
races_basefilename <- 'data/DEBTiConnSchedule'
races_xlsx_name <- paste0(races_basefilename, '.xlsx')
curl_download('https://docs.google.com/spreadsheets/d/1UK8io2jFMPs2KDEMxX1xgXNwa2JKFJT5w0SpvalAqxI/export?format=xlsx&id=1UK8io2jFMPs2KDEMxX1xgXNwa2JKFJT5w0SpvalAqxI', destfile=races_xlsx_name)
races <- read_excel(races_xlsx_name, sheet='2017 Races')

# Data wrangling ----

# Remove columns
races <- races %>% select(-Results, -`Timing Co.`)

# Remove non-races (e.g., headers for months)
races <- races %>% filter(!is.na(Name))

# Create a true Date/Time column - no longer needed: read_excel extracts POSIXct - just copy
races <- races %>% mutate(DateTime=`Date/Time`)

# re-create the Date/Time column
races <- races %>% mutate(`Date/Time` = format(DateTime, '%a, %m/%d %H:%M'))


# Extract the month
races <- races %>% mutate(Month=month(DateTime))
# Extract the day
races <- races %>% mutate(Day=day(DateTime))
# Extract the weekday
races <- races %>% mutate(Weekday=format(DateTime, '%u'))

# Check town names against a known good list:
members <- read_csv('data/members_towns_clean.csv')
# extract town names column names
columns <- names(members)
townNames <- columns[4:172]

# remove the (E) and (SE) markers (& leading space)
races <- races %>% mutate(Town=gsub(' \\(.*\\)', '', Town))

# fix known problems
races <- races %>% mutate(Town = gsub('MIddlebury', 'Middlebury', Town))
races <- races %>% mutate(Town = gsub('CHaplin', 'Chaplin', Town))

# find races with towns not in the list - check by hand
towns_not_in_list <- races %>% filter(!(Town %in% townNames)) %>% select(Town)

# fix remaining problems if needed

# write results
write_csv(races, 'data/races2017.csv')
