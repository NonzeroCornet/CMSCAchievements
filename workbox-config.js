module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{png,js,css,html}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};