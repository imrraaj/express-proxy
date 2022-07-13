const url = require('url');
const express = require("express");
const path = require('path');
const needle = require('needle');
const apicache = require('apicache');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const PORT = process.env.PORT || 3001;
const MOVIEDB_API = process.env.MOVIEDB_API;
const URL = process.env.URL;

const app = express();
app.use(cors());
app.use(express.json());


const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many requests came from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

const cache = apicache.middleware

const requestURLs = {
    fetchTrending: `${URL}trending/movie/week?api_key=${MOVIEDB_API}`,
    fetchTVpop: `${URL}tv/popular?api_key=${MOVIEDB_API}&language=en-US&page=1`,
    fetchNetflixOriginals: `${URL}discover/tv?with_networks=213&language=en-US&sort_by=popularity.desc&api_key=${MOVIEDB_API}`,
    fetchTopRated: `${URL}movie/top_rated?api_key=${MOVIEDB_API}&language=en-US&page=1`,
    fetchMoviepop: `${URL}movie/popular?api_key=${MOVIEDB_API}&language=en-US&page=1`,
    fetchScifi: `${URL}discover/movie?with_genres=878&sort_by=vote_average.desc&api_key=${MOVIEDB_API}`,
    fetchAction: `${URL}discover/movie?with_genres=28&sort_by=vote_average.desc&api_key=${MOVIEDB_API}`,
    fetchAdventure: `${URL}discover/movie?with_genres=12&sort_by=vote_average.desc&api_key=${MOVIEDB_API}`,
    fetchHorror: `${URL}discover/movie?with_genres=27&sort_by=vote_average.desc&api_key=${MOVIEDB_API}`,
};

app.get('/', (req, res) => {
    return res.json({ status: 'Running' });
});

app.get("/api/:url", apiLimiter, cache('23 hours'), async (req, res) => {
    try {
        const link = req.params.url
        if (!requestURLs[link]) return res.status(404).json({ msg: "Not found on the server" });
        const apiRes = await needle('get', requestURLs[link]);
        const data = apiRes.body;
        res.status(200).send(data);
    } catch (e) {
        res.status(500).json(e);
    }
});

app.get('*', (req, res) => {
    return res.status(404).json({ msg: "Not found on the server" });
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

