import axios from "axios";
import _ from 'lodash'

const key = '39209960-26c19d9aafc07d13a5914997d'

const search = (query, page) => {
    const params = new URLSearchParams({
        key: key,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page
    });
    return axios({
        method: 'get',
        baseURL: 'https://pixabay.com/api',
        url: `?${params.toString()}`
    })
    .then((response) => {
        if (!response.data) return new Error(response.status);
        return response;
    })
    .catch(error => console.log(error))
}

module.exports = {
    search
}