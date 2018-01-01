# Given a year, use the cleaned races data to compute a list of "elusive" towns

# Load libraries ----
library(tidyverse)
library(lubridate)
library(RecordLinkage)

year_of_interest <- 2017

filename <- paste0('data/races', year_of_interest, '.csv')

races <- read_csv('data/races2017.csv')

# make sure we don't count the same race more than once
# This is relevant for single events that have multiple distances.
# It works most of the time. The exceptions are those cases in which the 'Name'
# column changes because it includes the distance.
# Examples:
# 3/18/17: Bristol Shamrock
# 4/01/17: Savin Rock Marathon (and Half-)
# 4/02/17: Danbury Road Races


distinct_races <- races %>% select(Town, Name, Month, Day) %>% distinct()

# Solution: use the Levenshtein Similarity (in [0,1]) with threshold = 0.5
similarity_threshold <- 0.5

# group the "distinct" races by Town, Month, and Day,
# and then, within each group, check all the pairs, and see if the min
# Levenshtein similarity falls below the threshold. If so, then that
# group contains more than one race, and therefore the town is not "elusive".

min_levenshtein_sim <- function(strings) {
  # crude approach: lots of double computations
  min_lev <- 1
  n <- length(strings)
  for(s1 in strings) {
    for(s2 in strings) {
      l <- levenshteinSim(tolower(s1), tolower(s2))
      min_lev <- min(l, min_lev)
    }
  }
  return(min_lev)
}

duplicates <- distinct_races %>% group_by(Town, Month, Day) %>% summarize(n2 = n()-1, min_lev = min_levenshtein_sim(Name)) %>% filter(n2 > 0 & min_lev > similarity_threshold)

joined <- left_join(distinct_races %>% count(Town, Month, Day), duplicates)
joined$n2[is.na(joined$n2)] <- 0
joined <- joined %>% mutate(totalPerDay = n - n2) %>% ungroup()
numRacesByTown <- joined %>% group_by(Town) %>% summarize(numRaces = sum(totalPerDay))

# get full list of towns, see if any is missing - that would be an elusive town
# Check town names against a known good list:
members <- read_csv('data/members_towns_clean.csv')
# extract town names column names
columns <- names(members)
townNames <- data.frame(Town=columns[4:172])

# this join will put NA in any missing towns
numRacesByTown <- left_join(townNames, numRacesByTown)

# replace NA rows
numRacesByTown$numRaces[is.na(numRacesByTown$numRaces)] <- 0

# mark as elusive anything with less than two races
numRacesByTown <- numRacesByTown %>% mutate(isElusive = ifelse(numRaces < 2,  1, 0))

# write results
write_csv(numRacesByTown, 'data/num_races_by_town_2017.csv')
