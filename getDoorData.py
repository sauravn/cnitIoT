import urllib2
import csv


#Dictionary of google sheets export urls
DataUrls = {
	'Wireless_Door_Lab':'https://spreadsheets.google.com/feeds/download/spreadsheets/Export?key=147Gf1f3z-r1weIikSwSSd741baTqqqRkc06716gF09c&exportFormat=csv'
}

#Retrieves data from dict of urls & places CSV data into corresponding dict
def getCSVData(urls):
	csvData = {}
	for urlName in urls.keys():
		csvData[urlName] = csv.reader(urllib2.urlopen(urls[urlName]))

	return csvData




#Example usage, downloads and prints data for the Wireless Door Lab
for event in getCSVData(DataUrls)['Wireless_Door_Lab']:
	for field in event:
		print field + '\t'

