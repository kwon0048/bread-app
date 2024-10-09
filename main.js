// Global variables
let items = [];
let frequentTags = [];

// Fetch items from JSON file
function fetchItems() {
    fetch('data/items.json')
        .then(response => response.json())
        .then(data => {
            items = data;
            frequentTags = getFrequentTags(items);
            displayFrequentTags();
            displayResults(items);
        })
        .catch(error => console.error('Error:', error));
}

// Get frequent tags from items
function getFrequentTags(items) {
    const tagCounts = {};
    items.forEach(item => {
        item.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
}

// Display frequent tags in the Collapsible
function displayFrequentTags() {
    const scrollContainer = document.querySelector('.scroll-container');
    scrollContainer.innerHTML = '';
    frequentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'scroll-item';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => toggleTag(tag, tagElement));
        scrollContainer.appendChild(tagElement);
    });
}

// Toggle tag selection
function toggleTag(tag, tagElement) {
    const searchInput = document.getElementById('search');
    const currentTags = searchInput.value.split(' ').filter(t => t.length > 0);
    
    if (currentTags.includes(tag)) {
        // Remove tag
        searchInput.value = currentTags.filter(t => t !== tag).join(' ');
        tagElement.style.backgroundColor = ''; // Reset to default color
    } else {
        // Add tag
        searchInput.value = [...currentTags, tag].join(' ');
        tagElement.style.backgroundColor = '#4caf50';
    }
    
    // Trigger search
    searchItems();
}

function searchItems() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const keywords = searchInput.split(' ').filter(keyword => keyword.length > 0);
    
    const filteredItems = items.filter(item => {
        return keywords.every(keyword =>
            item.chineseItemName.toLowerCase().includes(keyword) ||
            item.englishItemName.toLowerCase().includes(keyword) ||
            item.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
    });

    displayResults(filteredItems);
    updateTagColors(keywords);
}

function updateTagColors(selectedTags) {
    const tagElements = document.querySelectorAll('.scroll-item');
    tagElements.forEach(tagElement => {
        if (selectedTags.includes(tagElement.textContent.toLowerCase())) {
            tagElement.style.backgroundColor = '#4caf50';
        } else {
            tagElement.style.backgroundColor = '';
        }
    });
}

function displayResults(results) {
    const collectionContainer = document.querySelector('.collection');
    collectionContainer.innerHTML = '';

    results.forEach(item => {
        const li = document.createElement('li');
        li.className = 'collection-item avatar';
        li.innerHTML = `
            <i class="material-icons circle red-icon">${item.chineseItemName[0]}</i>
            <span class="title">${item.chineseItemName}</span>
            <p>
                <span class="ellipsis">${item.englishItemName}</span>
                <br>
                <span>${item.tags.join(', ')}</span>
            </p>
            <div class="secondary-content" style="font-size: 35px;top: 30px;">${item.itemNumber}</div>
        `;
        collectionContainer.appendChild(li);
    });
}

function clearSearch() {
    console.log('Clear search');
    const searchInput = document.getElementById('search');
    searchInput.value = '';
    searchItems(); // Trigger search to reset results and tag colors
}

// Add event listeners and fetch items when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', searchItems);
    
    const closeButton = document.querySelector('.material-icons');
    closeButton.addEventListener('click', clearSearch);
    // Fetch items when the page loads
    fetchItems();


});