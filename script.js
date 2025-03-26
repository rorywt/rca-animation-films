document.addEventListener('DOMContentLoaded', function() {
    const videoGrid = document.getElementById('videoGrid');
    const shuffleButton = document.getElementById('shuffleButton');
    let videoUrls = [];
    const videosToDisplay = 9;

    // Get references to the links and popups
    const infoLink = document.getElementById('infoLink');
    const websiteLink = document.getElementById('websiteLink');
    const infoPopup = document.getElementById('infoPopup');
    const websitePopup = document.getElementById('websitePopup');

    // Get references to the close buttons
    const infoCloseButton = infoPopup.querySelector('.close-button');
    const websiteCloseButton = websitePopup.querySelector('.close-button');

    // Function to show a popup
    function showPopup(popup) {
        popup.style.display = 'block';
        
    }

    // Function to hide a popup
    function hidePopup(popup) {
        popup.style.display = 'none';
    }


    // Event listeners for the links
    infoLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the link from navigating
        showPopup(infoPopup);
        event.stopPropagation() /*Added line*/
    });

    websiteLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the link from navigating
        showPopup(websitePopup);
        event.stopPropagation() /*Added line*/
    });


    // Event listeners for the close buttons
    infoCloseButton.addEventListener('click', function() {
        hidePopup(infoPopup);
    });

    websiteCloseButton.addEventListener('click', function() {
        hidePopup(websitePopup);
    });
    
    // Add event listener to close the popup when clicking outside the popup content
    document.addEventListener('click', function(event) {
        if (event.target.closest('.popup-content') === null) { // If click is outside .popup-content
            hidePopup(infoPopup);
            hidePopup(websitePopup);
        }
    });


    // The rest of your existing JavaScript code (parseCSV, createVideoGrid, shuffleArray, getRandomVideos, fetch, shuffleButton listener) goes here...
    
    // Function to parse the CSV and populate videoUrls array
    function parseCSV(csvData) {
        const lines = csvData.split('\n');
        const header = lines[0].split(',');
        const urlIndex = header.indexOf('video_url');

        if (urlIndex === -1) {
            console.error("CSV does not contain a 'video_url' column.");
            return;
        }

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values[urlIndex]) {
                videoUrls.push(values[urlIndex].trim());
            }
        }
    }

    // Function to create the video grid with a specified number of videos
    function createVideoGrid(urls) {
        videoGrid.innerHTML = ''; // Clear existing content

        urls.forEach(url => {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('videoContainer');

            // Extract Vimeo Video ID from URL (handles both full and short URLs)
            const videoId = url.match(/(?:https?:\/\/)?vimeo\.com\/(\d+)/)?.[1];

            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.src = `https://player.vimeo.com/video/${videoId}`;
                iframe.width = "640";
                iframe.height = "360";
                iframe.frameBorder = "0";
                iframe.allow = "autoplay; fullscreen; picture-in-picture";
                iframe.allowFullscreen = true;
                videoContainer.appendChild(iframe);
            } else {
                console.warn("Invalid Vimeo URL:", url);
                videoContainer.textContent = "Invalid Vimeo URL";
            }

            videoGrid.appendChild(videoContainer);
        });
	}

    // Function to shuffle the array of URLs (Fisher-Yates Shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // Function to get a random subset of the video URLs
    function getRandomVideos(array, count) {
        const shuffled = [...array]; // Create a copy to avoid modifying the original array
        shuffleArray(shuffled);
        return shuffled.slice(0, count); // Take the first 'count' elements
    }

    // Load the CSV file
    fetch('videos.csv')
        .then(response => response.text())
        .then(csvData => {
            parseCSV(csvData);

            // Get a random subset of the video URLs
            const initialVideos = getRandomVideos(videoUrls, videosToDisplay);
            createVideoGrid(initialVideos); // Initial grid creation with random videos
        })
        .catch(error => console.error('Error fetching or parsing CSV:', error));

    // Shuffle button event listener
    shuffleButton.addEventListener('click', function() {
        const shuffledVideos = getRandomVideos(videoUrls, videosToDisplay);
        createVideoGrid(shuffledVideos);
    });
});