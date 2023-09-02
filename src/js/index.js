import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import _ from 'lodash'
import Notiflix from 'notiflix';
import "notiflix/dist/notiflix-3.2.6.min.css";
import { search } from './api'

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
let currentPage = 1;
let isFetching = false;
let hasMore = true;

const { elements: { searchQuery } } = form;

let options = {
    captionsData: 'alt',
    captionDelay: 250,
    disableScroll: true
};
let galleryLightbox = new SimpleLightbox('.gallery a', options);

const fetchData = async (info, page) => {
    isFetching = true;
    let response = await search(info, page);

    if(response.data?.totalHits === 0) {
        gallery.innerHTML = '';
        Notiflix.Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`,
            {timeout: 4000, useIcon: true }
        );   
        hasMore = false;
        isFetching = false;
        return
    }

    if(_.size(response.data?.hits) === 0) {
        Notiflix.Notify.warning(
            `We're sorry, but you've reached the end of search results.`,
            {timeout: 4000, useIcon: true},
        );
        hasMore = false;
        isFetching = false;
        return
    }

    let markup = await showGallery(response.data?.hits);

    if (page === 1) {
        gallery.innerHTML = markup;
        Notiflix.Notify.success(
            `Hooray! We found ${response.data.totalHits} images.`,
            { timeout: 4000, useIcon: true},
        );
    }

    gallery.insertAdjacentHTML('beforeend', markup);
    isFetching = false;
    hasMore = true;
    currentPage ++;
    galleryLightbox.refresh();
}

const submitEvent = (event) => {
    event.preventDefault();
    currentPage = 1;
    hasMore = true;
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchData(searchQuery.value, currentPage);
}

form.addEventListener('submit', submitEvent);

const showGallery = (data) => data
.map(item => 
`<li class="gallery-item">
    <a class="link" href="${item.largeImageURL}">
        <img class="image"
            src="${item.webformatURL}" 
            alt="${item.tags}" 
            width="${item.webformatWidth}" 
            height="${item.webformatHeight}">
        <ul class="legend">
            <li class="legend-item">
                <span class="legend-title">Likes</span>
                <span class="legend-value">${item.likes}</span>
            </li>
            <li class="legend-item">
                <span class="legend-title">Views</span>
                <span class="legend-value">${item.views}</span>
            </li>
            <li class="legend-item">
                <span class="legend-title">Comments</span>
                <span class="legend-value">${item.comments}</span>
            </li>
            <li class="legend-item">
                <span class="legend-title">Downloads</span>
                <span class="legend-value">${item.downloads}</span>
            </li>
        </ul>
    </a>
</li>`
).join('\n');

const trottle = () => {
    if(!isFetching && hasMore && (window.innerHeight + window.scrollY) >= document.body.offsetHeight)  fetchData(searchQuery.value, currentPage)
}

window.addEventListener('scroll', _.throttle(trottle, 300))