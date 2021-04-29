const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const markdownIt = require('markdown-it')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const iconsprite = require('./utils/iconsprite.js')

module.exports = function (config) {
    // Plugins
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite)

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('post', 'post.njk')
    config.addLayoutAlias('media', 'media.njk')

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')
    config.addPassthroughCopy('src/assets/media')
    config.addPassthroughCopy('src/admin')

    // Deep-Merge
    config.setDataDeepMerge(true)

    config.addFilter('filterTagList', (tags) => {
        // should match the list in tags.njk
        return (tags || []).filter(
            (tag) =>
                [
                    'all',
                    'nav',
                    'post',
                    'posts',
                    'tagList',
                    'media',
                    'person',
                    'document-type'
                ].indexOf(tag) === -1
        )
    })

    // Create an array of all tags, sort alphabetically and reverse the order
    config.addCollection('tagList', function (collection) {
        let tagSet = new Set()
        collection.getAll().forEach((item) => {
            ;(item.data.tags || []).forEach((tag) => tagSet.add(tag))
        })
        
        return [...tagSet].sort((a, b) => b.localeCompare(a)).reverse()
    })

    // Create an array of all tags
    config.addCollection('paperIdentifiers', function (collection) {
        let tagSet = new Set()
        collection.getAll().forEach((item) => {
            ;(item.data.paperId || []).forEach((tag) => tagSet.add(tag))
        })

        return [...tagSet]
    })

    config.addCollection('mediaByTitle', (collection) =>
        collection.getFilteredByGlob('src/content/media/*.md').sort((a, b) => {
            if (a.data.title > b.data.title) return -1
            else if (a.data.title < b.data.title) return 1
            else return 0
        })
    )
    // Filter related content based on front matter including its order
    config.addFilter('related', (collection = [], related = []) => {
        const filtered = collection.filter((page) => related.includes(page.data.title))
        return filtered.sort( (a, b) => related.indexOf(a.data.title) - related.indexOf(b.data.title));
    })

    // Filter related content based on front matter including its order
    config.addFilter('relatedMedia', (collection = [], related = []) => {
        const filtered = collection.filter((page) => related.includes(page.data.relatedPeople))
    })

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['md', 'njk', 'html', 'liquid', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
