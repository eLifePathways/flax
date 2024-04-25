# Flax

Eleventy themne for Kotahi, Ketty and other Coko products.

## basics

All files pushed to the content being css will be copied to the static folder (it’s not the best behavior) 


## plugins

- `pluginTOC`: generate a table of contents from a document 

## available filters

### array filters

- `reorderPage`: sort the collection by  `sequenceIndex` key
- `limitData`: only use a subset of the array,  `{{collection | limitData(0, 4)}}` will use the first 5 entry of the array
- `shouldShowEllipses`: add ellipses to pagination  
- `reorderJournal`: sort collection by their `page` key
- `groupBy(key)`: group item of the collection under a new array made from their `key` (for example `groupBy("issue")`)
- `transformVolume`: recreate volumes object from collection: `volumes: [ issues : [ articles ]]`
- `arrayToString`: transform an array in a string joined by ` — `


### string filters

- `addIDtoTitles`: automatically add ID to all h1-h6 elements
- `cleanLink`: replaces `static/` by `/outputs/`
- `markdownifying` and `markdownifyingInline` convert markdown to html.
- `dejats`: transform `<jats:p>` into `<p>`
- `makeSvgFromLatex`: will transform any latex Math into math (dependencies: mathjax and cheerio, he)

### date filter

- `postDate` takes a valid date and return a formatted date like 'Oct 14, 1983' using Luxon
- `dateWrangler("lang", "short" | "short")` takes a valid date and return a formatted date like 'Oct 14, 1983' using javascript. allow for custom languages and long/short months
- `getYear`: return the year of a valid date as a string

### unknown filters

- `imagesHandler` not seems to be used
