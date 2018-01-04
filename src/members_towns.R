# Run this script first, then clean_races.R

# Load libraries ----
library(tidyverse)
library(stringi)
library(curl)
library(readxl)
library(lubridate)

# Get data ----
curl_download('https://onedrive.live.com/Download.aspx?resid=FCE36160BC09E014!365&app=Excel&authkey=!ADVujkY8Qh3SXfc', destfile='data/members_towns.xlsx')
members <- read_excel('data/members_towns.xlsx')
#members <- read_csv('data/members_towns.csv')

# Data wrangling ----

# drop some columns
members <- members %>% select(-`No.`, -`Fishers island`)

# simplify column names
columns <- names(members)
columns[1:3] <- c('Name', 'Town', 'TotalTowns')
names(members) <- columns

# remove rows with no name
members <- members %>% filter(!is.na(Name))

townNames <- columns[4:172]

# Clean name of each member's town of origin
# translate unicode (e.g., no-break spoace) to ascii
members$Town <- stri_trans_general(members$Town, 'latin-ascii')
# remove asterisks and + (used to mark ambassadors)
members <- members %>% mutate(Town = gsub('[*+]', '', Town))
# fix a few town names
members <- members %>% mutate(Town = gsub('South windsor', 'South Windsor', Town))
members <- members %>% mutate(Town = gsub('Naugatauck', 'Naugatuck', Town))
members <- members %>% mutate(Town = gsub('Woobridge', 'Woodbridge', Town))
members <- members %>% mutate(Town = gsub('WestHartford', 'West Hartford', Town))
members <- members %>% mutate(Town = gsub('Werst Hartford', 'West Hartford', Town))
members <- members %>% mutate(Town = gsub('Walligford', 'Wallingford', Town))
members <- members %>% mutate(Town = gsub('East Hamptom', 'East Hampton', Town))
members <- members %>% mutate(Town = gsub('East Hamton', 'East Hampton', Town))
members <- members %>% mutate(Town = gsub('Cromwell†', 'Cromwell', Town))
members <- members %>% mutate(Town = gsub('Waterbury†', 'Waterbury', Town))
members <- members %>% mutate(Town = gsub('Southimgton', 'Southington', Town))

# note that there are people from out of state
levels(as.factor(members$Town))
# see all people who are not from known towns - hand check that there are no CT towns
outTowns <- members %>% filter(!(Town %in% townNames)) %>% select(Town)
# change out of state towns to 'Out of State'
members <- members %>% mutate(Town = ifelse(Town %in% townNames, Town, 'Out of State'))

# check for repeated names
# (we won't do anything with them here - just assume they're different people)
repeatedNames <- members %>% count(Name) %>% filter(n>1)
repeatedMembers <- members %>% filter(Name %in% repeatedNames$Name)

write_csv(members, 'data/members_towns_clean.csv')

# Update the timestamp ----
last_downloaded <- format(today(), format='%b %d, %Y')
write_lines(last_downloaded, 'data/last_downloaded.txt') # overwrites the file
