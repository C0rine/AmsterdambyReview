# Necessary imports and declerations
import json
import pprint
import csv
from decimal import *
from googleplaces import GooglePlaces, types, lang
import numpy as np
import requests

filename = "db/db_art_amdam.csv"


#only needed one time: making header
file = csv.writer(open(filename, "wb+"))
toprow = ['name'
        ,'rating'
        ,'place_id'
        ,'formatted_address'
        ,'vicinity'
        ,'website'
        ,'international_phone_number'
        ,'formatted_phone_number'
        ,'icon'
        ,'id'
        ,'url'
        ,'types'
        ,'geometry'
        ,'opening_hours'
        ,'reviews']


file.writerow(toprow)


# Get the data through the Google Places API and store it in a CSV file
fulljson = []

# Our Google API key
API_KEY_CORINE = # Put key here <------------------------------
API_KEY_NOUT = # Put key here <--------------------------------

google_places = GooglePlaces(API_KEY_NOUT)

locs = [0]*10
locs[0] = '52.370874, 4.854673' #west
locs[1] = '52.373434, 4.893826' #centre
locs[2] = '52.344458, 4.890263' #south
locs[3] = '52.357532, 4.938624' #east
locs[4] = '52.358918, 4.990226' #ijburg
locs[5] = '52.398644, 4.910710' #north
locs[6] = '52.316900, 4.957390' #bijlmer

locs[7] = '52.363778, 4.912813' #kriterion area
locs[8] = '52.387138, 4.907383' #EYE area


place_types = ['unknown']*10
place_types[0] = [types.TYPE_BAR, types.TYPE_CAFE]
place_types[1] = [types.TYPE_RESTAURANT]
#place_types[2] = [types.TYPE_PARK] #not gonna use, maybe still find another type
place_types[3] = [types.TYPE_MUSEUM, types.TYPE_ART_GALLERY]
place_types[4] = [types.TYPE_MOVIE_THEATER]
place_types[5] = [types.TYPE_GYM]
place_types[6] = [types.TYPE_LODGING]
place_types[7] = [types.TYPE_DEPARTMENT_STORE, types.TYPE_CLOTHING_STORE, types.TYPE_SHOPPING_MALL , types.TYPE_BOOK_STORE, types.TYPE_SHOE_STORE]
place_types[8] = [types.TYPE_PLACE_OF_WORSHIP] #check if mosque, church, hindu temple etc. are all included. If many strange results occur, than use specific seperate types MOSQUE, CHURCH, HINDU_TEMPLE etc
place_types[9] = [types.TYPE_BAKERY]


file = csv.writer(open(filename, "a"))
columns_zero_deep = ['formatted_address', 'rating','formatted_phone_number','icon','id','international_phone_number','name', 'place_id','website','url','vincinity']



def parsejsonitem(json):
    onerow = ['unknown']*15
    
    for key, value in enumerate(json):
        #print value
        if value in columns_zero_deep:
            if value == 'name':
                try: 
                    onerow[0] = json[value].encode('utf-8')
                except:
                    onerow[0] = json[value]
            if value == 'rating':
                try: 
                    onerow[1] = json[value].encode('utf-8')
                except:
                    onerow[1] = json[value]
            if value == 'place_id':
                try: 
                    onerow[2] = json[value].encode('utf-8')
                except:
                    onerow[2] = json[value]
            if value == 'formatted_address':
                try: 
                    onerow[3] = json[value].encode('utf-8')
                except:
                    onerow[3] = json[value]
            if value == 'vicinity':
                try: 
                    onerow[4] = json[value].encode('utf-8')
                except:
                    onerow[4] = json[value]
            if value == 'website':
                try: 
                    onerow[5] = json[value].encode('utf-8')
                except:
                    onerow[5] = json[value]
            if value == 'international_phone_number':
                try: 
                    onerow[6] = json[value].encode('utf-8')
                except:
                    onerow[6] = json[value]
            if value == 'formatted_phone_number':
                try: 
                    onerow[7] = json[value].encode('utf-8')
                except:
                    onerow[7] = json[value]
            if value == 'icon':
                try: 
                    onerow[8] = json[value].encode('utf-8')
                except:
                    onerow[8] = json[value]
            if value == 'id':
                try: 
                    onerow[9] = json[value].encode('utf-8')
                except:
                    onerow[9] = json[value]
            if value == 'url':
                try: 
                    onerow[10] = json[value].encode('utf-8')
                except:
                    onerow[10] = json[value]
        elif value == 'types':
            subitems = ''
            for item in json[value]:
                subitems += str(item).encode('utf-8') + ', '
            onerow[11] = subitems[:-2]
        elif value == 'reviews': 
            reviewtext = ''
            for i, review in enumerate(json[value]):
                reviewtext += json[value][i]['text'].encode('utf-8') + ', '
            onerow[14] = reviewtext[:-2]
        elif value == 'geometry':
            coordinates = ''
            coordinates = str(json[value]['location']['lat']) + ', ' + str(json[value]['location']['lng']).encode('utf-8')
            onerow[12] = coordinates
        elif value == 'opening_hours':
            openhours = ''
            schedule = json[value]['weekday_text']
            for day in schedule:
                openhours += day.encode('utf-8') + ', '
            onerow[13] = openhours[:-2]
    return onerow


def writeResults(locatie, types, rad, q):
    loc = locatie
    r = rad
    ttt = types
    query = q


    # Perform a query to google maps
    query_result = google_places.nearby_search(
            location=loc, keyword=query,
            radius=r, types=ttt)

    if query_result.has_attributions:
        print query_result.html_attributions

    # For each place we find with the query above
    for key, place in enumerate(query_result.places):
        place.get_details()
        fulljson.append(place.details)

    print len(fulljson)


    for i, item in enumerate(fulljson):
        newrow = parsejsonitem(item)
        file.writerow([eachitem for eachitem in newrow])


for loc in locs:
    writeResults(loc, place_types[3], 1250, '')
    fulljson = []


# Adding a sentiment analysis column

# Open a csv file with the places
placetype = "worship"
filename = "db/db_" + placetype + "_amdam.csv"
originalfile = csv.reader(open(filename, 'r'))
# Create a new file in which we also store the sentiment analysis
newfilename = "db/db_" + placetype + "_withsentiment_amdam.csv"
newfile = csv.writer(open(newfilename, "a"))

# Go through each place
for i, row  in enumerate(originalfile):
    # The first row is the table header, to which we need to a column for the sentiment analysis
    if i == 0:
        row.append("sentiment")
        newfile.writerow(row)
    else:
        if str(row[-1]) == 'unkown' or str(row[-1]) == '':
            row.append('0.5')
            newfile.writerow(row)
        else: 
            # get the sentiment analysis for the review
            r = requests.post('http://text-processing.com/api/sentiment/', data = "text=" + str(row[-1]))
            # add the pos value of the sentiment analysis to the end of the row and save to new file
            row.append(json.loads(r.text).get("probability").get("pos"))
            newfile.writerow(row)
        
print 'Finished writing sentiment analysis to ' + newfilename + '...'


# Conversion of CSV to JSON document 
placetype = "worship"
filename = "db/db_" + placetype + "_withsentiment_amdam.csv"

csvfile = open(filename, 'r')
jsonfilename = filename[:-4] + '.json'

jsonfile = open(jsonfilename, 'w')

fieldnames = ("name","rating","place_id","formatted_address","vicinity","website","international_phone_number","formatted_phone_number","icon","id","url","types","geometry","opening_hours","reviews","sentiment")

reader = csv.DictReader(csvfile, fieldnames)
for i, row in enumerate(reader):
    if i == 0:
        #Do nothing, we do not want the first row, since this is just the table header
        pass
    else:
        json.dump(row, jsonfile)
        jsonfile.write('\n')
    
print 'Finished conversion of ' + filename + ' to ' + jsonfilename

# Conversion of CSV to JSON document SPECIFICALLY FOR THE KIBANA BULK IMPORT

filenameplacetypes = ['art', 'bakery', 'bars', 'gym', 'lodging', 'movie', 'restaurants', 'shopping', 'worship']

# open a new json file to store the complete db in in the format that kibana requires
kibanajsonname = 'db/db_completeforkibana_withsentiment.json'
jsonfile = open(kibanajsonname, 'w')

counter = 1
unique_names = []


for item in filenameplacetypes:
    
    print counter

    filename = "db/db_" + item + "_withsentiment_amdam.csv"
    csvfile = open(filename, 'r')

    fieldnames = ("name","rating","place_id","formatted_address","vicinity","website","international_phone_number","formatted_phone_number","icon","id","url","types","geometry","opening_hours","reviews","sentiment")

    reader = csv.DictReader(csvfile, fieldnames)
    for i, row in enumerate(reader):
        if i == 0 or row.get('rating') == 'rating':
            #Do nothing, we do not want the first row, since this is just the table header also if rating = rating it is a table header and we do not want that
            pass
        else:
            if row["name"] not in unique_names:
                # add the index for kibana
                index = {"index": {"_id" : counter}}
                json.dump(index, jsonfile)
                jsonfile.write('\n')
                # add the actual json entry
                json.dump(row, jsonfile)
                jsonfile.write('\n')
                # update counter
                counter += 1
                unique_names.append(row["name"])

print 'Finished conversions'
