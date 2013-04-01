# -*- coding: utf-8 -*-

import flickrapi
import tumblpy
import csv
import re
from datetime import datetime


class Flickr(object):
	def __init__(self):
		self.api_key = 'cda310267622c1333b6e51852d9c967c'
		self.photoset_id = '72157631721131788'
	
	def run(self):
		flickr = flickrapi.FlickrAPI(self.api_key)
		# open a csv file writer
		with open('flickr_weight.csv', 'wb') as csvfile:
			writer = csv.writer(csvfile)
		
			page = 1
			not_fetched_all_pages = True
			while not_fetched_all_pages:
			
				# retrieve all photos in a specific set
				try:
					photos = flickr.photosets_getPhotos(photoset_id = self.photoset_id, extras='tags', page=page)
					page += 1
					for photo in photos.find('photoset').findall('photo'):
						
						# check if photo contains tag 'weight'
						if re.search(r'weight', photo.attrib['tags']):
							
							print photo.attrib['title']
							
							# parse date and weight information from title -> 2013-03-29 : 45.0 kg
							re_group = re.search(r'([0-9]{4}\-[0-9]{2}\-[0-9]{2})\s\:\s([0-9]{2}\.[0-9]{1})', photo.attrib['title'])
							
							photo_date = datetime.strptime(re_group.group(1), '%Y-%m-%d')						
							writer.writerow([photo_date, photo_date.strftime('%a'), re_group.group(2)])
							
				except:
					not_fetched_all_pages = False
					print 'done!'


class Tumblr(object):
	def __init__(self):
		self.consumer_key = 'EwlzXStD2qHN46XUuZ8KXD3iCk8uUC4PkxqaEASkKXCEDt55h8'
		self.secret_key = 'kLWiJWkE2bVmftPtuM1sEvVGlEsoODWENHV569czNrTBBQgSwx'
		self.blog_url = 'eatingstats.tumblr.com'
		
	def run(self):
		tumblr = tumblpy.Tumblpy(app_key = self.consumer_key, app_secret = self.secret_key)
		
		with open('tumblr_weight.csv', 'wb') as csvfile:
			writer = csv.writer(csvfile)
			
			offset = 0
			not_fetched_all_pages = True
			while not_fetched_all_pages:
				posts = tumblr.get('posts', blog_url = self.blog_url, params = {'tag': 'weight', 'offset': offset})
				if len(posts['posts']) != 0:
					for post in posts['posts']:
						re_group = re.search(r'([0-9]{4}\-[0-9]{2}\-[0-9]{2})\&\#160\;\:\s([0-9]{2}\.[0-9]{1})', post['caption'])
						print post['caption']
						photo_date = datetime.strptime(re_group.group(1), '%Y-%m-%d')
						if photo_date < datetime.strptime('2012-09-26', '%Y-%m-%d'):
							writer.writerow([photo_date, photo_date.strftime('%a'), re_group.group(2)])
					offset += 20
				else:
					not_fetched_all_pages = False

				
class Openphil(object):
	def run(self):
		with open('weight.csv', 'wb') as csvfile:
			writer = csv.writer(csvfile)
			writer.writerow(['date', 'weekday_name', 'weight'])

			with open('tumblr_weight.csv', 'rb') as tumblr_file:
				reader = csv.reader(tumblr_file)
				rows = []
				for row in reader:
					rows.append(row)
				for i in range(len(rows)):
					writer.writerow(rows[len(rows) - i - 1])

			with open('flickr_weight.csv', 'rb') as flickr_file:
				reader = csv.reader(flickr_file)
				for row in reader:
					writer.writerow(row)

		print "done merging!"
		

# Collect the data from flickr and tumblr
	
flickr = Flickr()
flickr.run()

tumblr = Tumblr()
tumblr.run()

openphil = Openphil()
openphil.run()
