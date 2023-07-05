const express = require('express');
const router = express.Router();
const getReviewsUrl = 'https://store.steampowered.com/appreviews';
const getAppDetailsUrl = 'https://store.steampowered.com/api/appdetails';
let limit = null;

getReviews = async function(req, res) {
    const { gameid } = req.params;
    limit = req.query.limit !== null ? parseInt(req.query.limit) : 20;
    const dayrange = req.query.dayrange !== null ? parseInt(req.query.dayrange) : null;
    let requestString;
    if (!dayrange) {
        requestString = `${getReviewsUrl}/${gameid}?json=1&num_per_page=30`;
    } else {
        requestString = `${getReviewsUrl}/${gameid}?json=1&num_per_page=30&day_range=${dayrange}`;
    }
    let appDetailsString = `${getAppDetailsUrl}?appids=${gameid}&filters=basic,release_date`;
    let rawReviews = await fetchReviews(requestString);
    let appDetailsResponse = await fetch(appDetailsString);
    const appDetails = await appDetailsResponse.json();
    const reviews = rawReviews.map((elem) => {
        return { review: elem.review };
    })
    let about = appDetails[gameid]?.success ? appDetails[gameid]?.data?.detailed_description : '';
    res.json(JSON.stringify({ about, reviews }));
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
        if (reviews.length >= limit) {
            break;
        }
        reviews = reviews.slice(0, limit);
        // Получение нового значения cursor из ответа
        cursor = data.cursor;

        // Проверка на повторение значения cursor
        if (visitedCursors.has(cursor)) {
            break;
        }
    }
    limit = null;
    return reviews;
}

router.get('/:gameid', getReviews);

module.exports = router;