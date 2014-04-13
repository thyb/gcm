Service = require('../framework/Service')
config = require('../config')

module.exports = class DocumentManagerService extends Service
	constructor: (@github)->
		@documents = {}

		href = window.location.href
		res = href.match /^http:\/\/([a-zA-Z0-9_-]+).github.io\/([a-zA-Z0-9_-]+)\/.*$/i
		console.log 'Regexp url', res
		if not res
			@repo = @github.getRepo config.username, config.repository
		else
			@repo = @github.getRepo res[1], res[2]

	create: (params, callback) ->

		#TODO check params
		@documents[params.slug] =
			name: params.name
			extension: params.extension
			created: Date.now()
			path: ''
			filename: params.slug + '.' + params.extension

		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Create document ' + params.slug + ' in documents.json', (err) =>
			return callback err if err
			@repo.branch params.slug, (err) ->
				return callback err if err
				callback()

	release: (slug, filename, content, message, callback) ->
		console.log 'release', slug, filename, content, message
		@documents[slug].updated = Date.now()
		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + slug, (err) =>
			return callback err if err
			console.log 'documents.json updated', filename, content, message
			@repo.write 'master', filename, content, message, callback

	saveDraft: (slug, filename, content, message, callback) ->
		console.log 'saveDraft', slug, filename, content, message
		@documents[slug].updated = Date.now()
		@repo.write slug, 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + slug, (err) =>
			return callback err if err
			console.log 'documents.json updated', filename, content, message
			@repo.write slug, filename, content, message, callback

	getDocument: (slug, callback) ->
		console.log 'getDocument', slug, @documents
		if Object.equal @documents, {}
			@repo.read 'master', 'documents.json', (err, data) =>
				@documents = JSON.parse(data)
				doc = @documents[slug]
				@repo.read slug, doc.filename, (err, content) =>
					callback doc, content
		else
			callback @documents[slug]

	getReleaseHistory: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		@repo.getCommits path: @documents[slug].filename, sha: 'master', callback

	#getDraftHistory: () ->

	getDocumentHistory: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		@repo.getCommits path: @documents[slug].filename, sha: slug, callback

	mergeHistory: (releaseHistory, documentHistory) ->
		console.log releaseHistory, documentHistory
		history = new Array()
		v.imgType = 'img/release-dot.png' for v in releaseHistory
		v.imgType = 'img/draft-dot.png' for v in documentHistory
		history = releaseHistory.add documentHistory
		console.log history
		history = history.sortBy ((elem) ->
			return new Date(elem.commit.author.date)
		), true

		console.log history
		return history

	remove: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		filename = @documents[slug].filename
		delete @documents[slug]
		i = 0
		console.log 'remove document', slug, filename, @documents
		@repo.deleteRef 'heads/' + slug, (err) =>
			console.log 'error updaing documents.json', err if err
			callback(null, true) if callback and ++i == 3
		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Remove ' + slug, (err) =>
			console.log 'error updating documents.json', err if err
			callback(null, true) if callback and ++i == 3
		@repo.delete 'master', filename, (err) =>
			console.log 'error removing ' + filename , err if err
			callback(null, true) if callback and ++i == 3

	diffToRelease: (slug, callback) ->
		@repo.compare 'master', slug, callback

	diff: (slug, v1, v2) ->

	list: (callback) ->
		@repo.read 'master', 'documents.json', (err, data) =>
			if not err
				@documents = JSON.parse data
			else
				@documents = {}
			list = new Array()
			for slug of @documents
				list.push $.extend(slug: slug, @documents[slug])

			callback err, list if callback
