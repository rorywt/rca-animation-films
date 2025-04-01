document.addEventListener('DOMContentLoaded', function() {
    const videoGrid = document.getElementById('videoGrid');
    const shuffleButton = document.getElementById('shuffleButton');
    let videoUrls = [];
    let videoTitles = []; // New array to store video titles
    let videoYears = []; // New array to store video years
    let videoDirFirstnames = []; // New array to store directors
    let videoDirSurnames = []; // New array to store directors
    let videoFilmTypes = []; // NEW: Array to store gradfilm status
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
        displayVideoTitles()
        event.stopPropagation() /*Added line*/
    });

    shuffleButton.addEventListener('touchstart', function() {
	this.classList.add('touched'); // Add a class when touched
    });

    shuffleButton.addEventListener('touchend', function() {
        this.classList.remove('touched'); // Remove the class when touch ends
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
    
    function parseCSV(csvData) {
        // Normalize line endings to just '\n'
        csvData = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); //Best practice
        
        const lines = csvData.split('\n');
        const header = lines[0].split(',');
        //console.log("Header array:", header);

        const urlIndex = header.indexOf('video_url');
        const titleIndex = header.indexOf('film_title'); // Assuming a 'film_title' column
        const yearIndex = header.indexOf('film_year');
        const dirFirstnameIndex = header.indexOf('dir_firstname');
        const dirSurnameIndex = header.indexOf('dir_surname');
        const filmtypeIndex = header.indexOf('film_type');
    
        if (urlIndex === -1) {
            console.error("CSV does not contain a 'video_url' column.");
            return;
        }
        if (titleIndex === -1) {
            console.error("CSV does not contain a 'film_title' column.");
            return;
        }
        if (yearIndex === -1) {
            console.error("CSV does not contain a 'film_year' column.");
            return;
        }
        if (dirFirstnameIndex === -1) {
            console.warn("CSV does not contain a 'director' column. Data will be missing.");
        }
        if (dirSurnameIndex === -1) {
            console.warn("CSV does not contain a 'director' column. Data will be missing.");
        }
        if (filmtypeIndex === -1) {
            console.warn("CSV does not contain a 'film_type' column. Data will be missing.");
        }
        
    
        // Regex to split by commas but respect quoted fields.
        const regex = /(?:([^",\r\n]+)|(?:"([^"\r\n]+)"))(?:,|$)/g;
    
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); // trim line.
            if (!line) continue; //skip empty lines
            const values = [];
            let match;
    
            // Use regex to extract values from the line
            while ((match = regex.exec(line)) !== null) {
                const value = match[1] || match[2] || "";
                values.push(value.trim()); //trim whitespace from each value
            }
    
            if (values[urlIndex] && values[titleIndex] && values[yearIndex]) {
                videoUrls.push(values[urlIndex]);
                videoTitles.push(values[titleIndex]);
                videoYears.push(values[yearIndex]);
                videoDirFirstnames.push(values[dirFirstnameIndex]);
                videoDirSurnames.push(values[dirSurnameIndex]);
                videoFilmTypes.push(filmtypeIndex !== -1 ? values[filmtypeIndex] : "");
            }
        }
    }

    // Function to create the video grid with a specified number of videos
    function createVideoGrid(urls) {
        videoGrid.innerHTML = ''; // Clear existing content
    
        urls.forEach(url => {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('videoContainer');
    
            let embedCode = '';
    
            // Check if the URL is a Vimeo URL
            const vimeoIdMatch = url.match(/(?:https?:\/\/)?vimeo\.com\/(\d+)/);
    
            if (vimeoIdMatch) {
                const videoId = vimeoIdMatch[1];
                embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
            } else {
                // Check if the URL is a YouTube URL
                const youtubeIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    
                if (youtubeIdMatch) {
                    const videoId = youtubeIdMatch[1];
                    embedCode = `<iframe width="640" height="360" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                } else {
                    console.warn("Invalid Video URL:", url);
                    videoContainer.textContent = "Invalid Video URL";
                }
            }
    
            // Add the embed code to the video container
            if (embedCode) {
                videoContainer.innerHTML = embedCode;
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


    // Function to display the existing video titles in alphabetical order
    function displayVideoTitles() {

        const filmCount = videoUrls.length;
        const filmCountElement = document.createElement('p');
        filmCountElement.textContent = `Total of ${filmCount} films. * denotes grad film.`;
        filmCountElement.id = 'filmCount'; // Add an ID so we can find it later to remove.

        // Get a reference to the content element in websitePopup
        const websitePopupContent = document.querySelector('#websitePopup .popup-content');

        // Clear any existing film count element (if it exists)
        const existingFilmCountElement = websitePopupContent.querySelector('#filmCount');
         if (existingFilmCountElement) {
            websitePopupContent.removeChild(existingFilmCountElement);
         }

    // Get a reference to the videoTitlesList element
    const videoTitlesList = document.getElementById('videoTitlesList');

    // Insert the filmCountElement before the videoTitlesList
    websitePopupContent.insertBefore(filmCountElement, videoTitlesList);

        // Reset the List to make sure it's clear if the code is running again.
        document.querySelector("#videoTitlesList").innerHTML = "";

        // The list needs to be alphabetical and links to the video
        let titleUrl = [];
        for (let i = 0; i < videoUrls.length; i++) {
            titleUrl.push({"title":videoTitles[i], "link":videoUrls[i], "director":videoDirFirstnames[i]+" "+videoDirSurnames[i]+" | "+videoYears[i], "filmtype": videoFilmTypes[i]});
        }

         // Sort the titles alphabetically by comparing the string.
         titleUrl = titleUrl.sort((a, b) => a.title.localeCompare(b.title));

         // Display all of the title information that we have gathered from the JSON API.
         for (let i = 0; i < titleUrl.length; i++) {
            let obj = titleUrl[i];
            if (obj.filmtype === "Grad film") { // Case-insensitive check
                gradfilmIndicator = "*";
            }
            else {
                gradfilmIndicator = "";
            }
             // Add them to the bulleted list.
            document.querySelector("#videoTitlesList").innerHTML +=
                 `<li><a href='${obj.link}' target="_blank" >${obj.title}${gradfilmIndicator}</a>${obj.director}</li>`;
         }
     }
});