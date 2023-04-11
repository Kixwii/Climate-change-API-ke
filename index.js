const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const newspapers = [
    {
        name: 'theStandard',
        address: 'https://www.standardmedia.co.ke/topic/climate-change',
    },
    {
        name: 'theNation',
        address: 'https://nation.africa/service/search/kenya/290754?pageNum=0&query=climate%20change&sortByDate=true&docType=CMArticle',
        base: 'https://nation.africa/kenya'
    }
]

const app = express()

async function scrapeArticles(newspaper) {
    const response = await axios.get(newspaper.address)
    const html = response.data
    const $ = cheerio.load(html)

    const articles = $('a:contains("climate")', html).map(function () {
        const title = $(this).text()
        const url = $(this).attr('href')
        return {
            title,
            url: newspaper.base ? newspaper.base + url : url,
            source: newspaper.name
        }
    }).get()

    return articles
}

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change news API')
})

app.get('/news', async (req, res) => {
    const articles = await Promise.all(newspapers.map(scrapeArticles).flat())
    res.json(articles)
})

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId
    const newspaper = newspapers.find(n => n.name === newspaperId)

    if (!newspaper) {
        return res.status(404).json({ error: `Newspaper ${newspaperId} not found` })
    }

    const articles = await scrapeArticles(newspaper)
    res.json(articles)
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
