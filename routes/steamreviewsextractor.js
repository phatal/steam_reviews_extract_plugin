const express = require('express');
const router = express.Router();
const getReviewsUrl = 'https://store.steampowered.com/appreviews';
const getAppDetailsUrl = 'https://store.steampowered.com/api/appdetails';
let limit = null;

getReviews = async function(req, res) {
    console.log('req.params: ', req.params);
    console.log('req.query: ', req.query);
    const { gameid } = req.params;
    limit = req.query.limit !== null ? parseInt(req.query.limit) : 20;
    const dayrange = req.query.dayrange !== null ? parseInt(req.query.dayrange) : null;
    let requestString = `${getAppDetailsUrl}?appids=${gameid}`;
    let appData = await fetchAppDetails(requestString);
    if(!dayrange){
        requestString = `${getReviewsUrl}/${gameid}?json=1&num_per_page=100`;
    }else {
        requestString = `${getReviewsUrl}/${gameid}?json=1&num_per_page=100&day_range=${dayrange}`;
    }
    let rawReviews = await fetchReviews(requestString);
    const reviews = rawReviews.map((elem) => {
        return { review: elem.review };
    })
    const gatheredAppInfo = {
        'game_description': appData.about_the_game,
        'reviews': reviews,
        'release_date': appData.release_date.date
    }
    res.json(JSON.stringify(gatheredAppInfo));
}

async function fetchAppDetails(url) {
    const response = await fetch(url);
    const jsonObj = await response.json();
    const data = jsonObj[url.split('?appids=')[1]].data;
    return data;
}

async function fetchReviews(url, cursor = '*', reviews = []) {
    const visitedCursors = new Set(); // Хранилище для посещенных значений cursor

    while (!visitedCursors.has(cursor)) {
        visitedCursors.add(cursor);
        let fullUrl = url + `&cursor=${encodeURIComponent(cursor)}`;
        const response = await fetch(fullUrl);
        const data = await response.json();

        // Получение массива отзывов из текущего ответа и добавление к существующему массиву
        const currentReviews = data.reviews;
        reviews.push(...currentReviews);
        if(reviews.length >= limit) {
            console.log('Получено необходимое число отзывов');
            break;
        }
        // Получение нового значения cursor из ответа
        cursor = data.cursor;

        // Проверка на повторение значения cursor
        if (visitedCursors.has(cursor)) {
            console.log('Значение cursor повторилось:', cursor);
            break;
        }
    }
    limit = null;
    return reviews;
}

router.get('/:gameid', getReviews);

module.exports = router;