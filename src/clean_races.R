# Run this script after members_towns.R:  it assumes members_towns_clean.csv exists

# Load libraries ----
suppressMessages(library(tidyverse, warn.conflicts = FALSE, quietly = TRUE))
suppressMessages(library(lubridate, warn.conflicts = FALSE, quietly = TRUE))
suppressMessages(library(curl, warn.conflicts = FALSE, quietly = TRUE))
suppressMessages(library(readxl, warn.conflicts = FALSE, quietly = TRUE))


# Get data ----
year_of_interest <- 2018

races_basefilename <- 'data/DEBTiConnSchedule'
races_xlsx_name <- paste0(races_basefilename, '.xlsx')
curl_download('https://docs.google.com/spreadsheets/d/1UK8io2jFMPs2KDEMxX1xgXNwa2JKFJT5w0SpvalAqxI/export?format=xlsx&id=1UK8io2jFMPs2KDEMxX1xgXNwa2JKFJT5w0SpvalAqxI', destfile=races_xlsx_name)
# races <- suppressMessages(read_excel(races_xlsx_name, sheet=paste0(year_of_interest, ' Races')))
races <- suppressMessages(read_excel(races_xlsx_name, sheet = 'Future Races'))

# Data wrangling ----

# select relevant columns - to make robust to added material in other columns
races <- races %>% select(Town, `Date/Time`, Distance, `Race Name`, Cost, Results)
races <- races %>% rename(Name = `Race Name`)

# Remove postponed races
regexp_for_erasing <- 'postponed|moved to|cancelled|canceled|cancalled'
regexp_for_keeping <- 'postponed from'
removed_races <- races %>% 
  filter(
         grepl(regexp_for_erasing, Cost, ignore.case = T) & !grepl(regexp_for_keeping, Cost, ignore.case = T)
         )
# keep track of what was removed
write_csv(removed_races, 'data/removed_races.csv') # overwrites the file
races <- races %>% 
  filter(
         !grepl(regexp_for_erasing, Cost, ignore.case = T) | grepl(regexp_for_keeping, Cost, ignore.case = T)
         )

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
# Extract the year
races <- races %>% mutate(Year=year(DateTime))

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
races <- races %>% mutate(Town = gsub('South WIndsor', 'South Windsor', Town))
races <- races %>% mutate(Town = gsub('WIndsor Locks', 'Windsor Locks', Town))
races <- races %>% mutate(Town = gsub('PReston', 'Preston', Town))

# find races with towns not in the list - if so, write file to alert
towns_not_in_list <- races %>% filter(!(Town %in% townNames)) %>% select(Town)
if(nrow(towns_not_in_list) > 0) {
  write_csv(towns_not_in_list, 'data/towns_not_in_list.csv') # overwrites the file
}

# fix remaining problems if needed

# write results
write_csv(races, paste0('data/races', year_of_interest, '.csv'))

