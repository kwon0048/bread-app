// Global variables
let items = [];
let frequentTags = [];

// Constants
const LOCAL_STORAGE_KEY = 'bakeryItems';
const CUSTOM_TAGS_KEY = 'customTags';
const API_URL_KEY = 'apiUrl';
const BAKERY_ITEMS_KEY = 'bakeryItems';

// Initialize custom tags
function initializeCustomTags() {
    let customTags = localStorage.getItem(CUSTOM_TAGS_KEY);
    if (!customTags) {
      // Set default values
      customTags = JSON.stringify([
        { order: 0, name: 'T1' },
        { order: 1, name: 'T2' },
        { order: 2, name: 'T3' },
        { order: 3, name: 'T4' },
        { order: 4, name: 'T5' },
        { order: 5, name: 'H1' },
        { order: 6, name: 'C1' },
        { order: 7, name: 'C2' },
        { order: 8, name: 'C3' }
      ]);
      localStorage.setItem(CUSTOM_TAGS_KEY, customTags);
    }
  
    if (window.location.pathname.endsWith('customtags.html')) {
      displayCustomTags();
    }
  }

// Fetch items from local storage, JSON file, or API
async function fetchItems() {
    // Try to get data from local storage
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        items = JSON.parse(storedData);
        processItems();
        return;
    }

    // Get API URL from local storage
    const apiUrl = localStorage.getItem(API_URL_KEY);
    if (!apiUrl) {
        // Redirect to system.html if API URL is not set
        window.location.href = 'system.html';
        return;
    }

    try {
        // Fetch from API
        const response = await fetch(apiUrl);
        items = await response.json();
    } catch (apiError) {
        console.error('Error fetching data from API:', apiError);
        return;
    }

    // Store fetched data in local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    processItems();
}
// Process items
function processItems() {
    frequentTags = getFrequentTags(items);
    displayFrequentTags();
    displayCustomTags();
    displayResults(items);
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
    const frequentTagsContainer = document.querySelector('#FrequentTags .scroll-container');
    if (!frequentTagsContainer) return; // Exit if not on the index page

    frequentTagsContainer.innerHTML = '';
    frequentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'scroll-item';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => toggleTag(tag, tagElement));
        frequentTagsContainer.appendChild(tagElement);
    });
}

// Display custom tags in the Collapsible

function displayCustomTags() {
    const customTagsList = document.getElementById('custom_tags');
    const customTagsContainer = document.querySelector('#customTags .scroll-container');
  
    const customTags = JSON.parse(localStorage.getItem(CUSTOM_TAGS_KEY) || '[]');
  
    // Clear existing list items except the header
    if (customTagsList) {
      while (customTagsList.children.length > 1) {
        customTagsList.removeChild(customTagsList.lastChild);
      }
    }
  
    // Add custom tags to the list
    customTags.sort((a, b) => a.order - b.order).forEach(tag => {
      if (customTagsList) {
        const li = document.createElement('li');
        li.className = 'collection-item';
        li.innerHTML = `
          <div>
            ${tag.name}
            <a href="#!" class="secondary-content delete-tag" data-order="${tag.order}">
              <i class="material-icons">delete</i>
            </a>
          </div>
        `;
        customTagsList.appendChild(li);
      }
  
      if (customTagsContainer) {
        const tagElement = document.createElement('div');
        tagElement.className = 'scroll-item';
        tagElement.textContent = tag.name;
        tagElement.addEventListener('click', () => toggleTag(tag.name, tagElement));
        customTagsContainer.appendChild(tagElement);
      }
    });
  
    // Add event listeners to delete buttons
    if (customTagsList) {
      document.querySelectorAll('.delete-tag').forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const order = parseInt(this.getAttribute('data-order'));
          showDeleteConfirmation(order);
        });
      });
    }
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

// Add new custom tag
function addCustomTag(tagName) {
    const customTags = JSON.parse(localStorage.getItem(CUSTOM_TAGS_KEY));
    const newOrder = customTags.length > 0 ? Math.max(...customTags.map(tag => tag.order)) + 1 : 0;
    customTags.push({ order: newOrder, name: tagName });
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(customTags));
    displayCustomTags();
}

// Delete custom tag
function deleteCustomTag(order) {
    let customTags = JSON.parse(localStorage.getItem(CUSTOM_TAGS_KEY));
    customTags = customTags.filter(tag => tag.order !== order);
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(customTags));
    displayCustomTags();
}

// Show delete confirmation modal
function showDeleteConfirmation(order) {
    const modal = M.Modal.getInstance(document.getElementById('deleteModal'));
    modal.open();

    document.getElementById('confirmDelete').onclick = function() {
        deleteCustomTag(order);
        modal.close();
    };
}

function isValidUrl(string) {
try {
    new URL(string);
    return true;
} catch (_) {
    return false;
}
}

async function fetchData(url) {
const response = await fetch(url);
if (!response.ok) {
    throw new Error('Network response was not ok');
}
return response.json();
}

function isValidData(data) {
if (!Array.isArray(data)) return false;
return data.every(item => 
    typeof item === 'object' &&
    'itemNumber' in item &&
    'chineseItemName' in item &&
    'englishItemName' in item &&
    'description' in item &&
    Array.isArray(item.tags)
);
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize Materialize components
  
  M.AutoInit();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  // Initialize custom tags
  initializeCustomTags();

  // Add event listener for the custom tag form
  const addForm = document.getElementById('add_form');
  addForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const inputText = document.getElementById('input_text');
    if (inputText.value.trim() !== '') {
      addCustomTag(inputText.value.trim());
      inputText.value = '';
    }
  });

  // Add event listener for the API form
  const apiForm = document.getElementById('apiForm');
  apiForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const apiUrl = document.getElementById('apiUrl').value.trim();

    if (!isValidUrl(apiUrl)) {
      M.toast({html: 'Please enter a valid URL', classes: 'red'});
      return;
    }

    // Disable button to prevent multiple submissions
    const updateButton = document.getElementById('updateData');
    updateButton.disabled = true;
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'block';

    try {
      const data = await fetchData(apiUrl);
      if (isValidData(data)) {
        localStorage.setItem(BAKERY_ITEMS_KEY, JSON.stringify(data));
        localStorage.setItem(API_URL_KEY, apiUrl);
        M.toast({html: 'Data updated successfully', classes: 'green'});
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error:', error);
      M.toast({html: 'Failed to update data: ' + error.message, classes: 'red'});
    } finally {
      preloader.style.display = 'none';
      updateButton.disabled = false; // Re-enable button
    }
  });

  // Fetch items when the page loads (for the main page)
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    fetchItems();
  }
// await fetchItems();
});