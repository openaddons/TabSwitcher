document.addEventListener("DOMContentLoaded", function () {
  // Get all open windows and their tabs
  chrome.windows.getAll({ populate: true }, function (windows) {
    // Get the tabsList element from the popup.html
    var tabsList = document.getElementById("tabsList");
    var statsList = document.getElementById("statsList");
    var urlsList = document.getElementById("urlsList"); // Get the urlsList element

    var windowCounter = 0;
    var tabCounter = 0;

    // Get the currently active window
    chrome.windows.getCurrent(function (currentWindow) {
      // Iterate through each window
      windows.forEach(function (window) {
        // Create an li element for each window
        var windowItem = document.createElement("li");
        var windowTitleElement = document.createElement("span");
        windowTitleElement.classList.add("window-title");
        // Increase the windowCounter
        windowCounter += 1;
        // Count tabs
        tabCounter += window.tabs.length;

        // Set the window title with window ID and number of tabs
        windowTitleElement.textContent =
          "Window " + window.id + " [" + window.tabs.length + " tabs]";
        windowItem.setAttribute("data-window-id", window.id);

        // Check if the current window is the active window
        if (window.id === currentWindow.id) {
          windowTitleElement.classList.add("active-window");
        }

        // Add click event listener to bring the window to the front on click
        windowTitleElement.addEventListener("click", function () {
          chrome.windows.update(window.id, { focused: true });
        });

        // Append the window title to the windowItem
        windowItem.appendChild(windowTitleElement);

        // Check if the window has tabs
        if (window.tabs) {
          // Create an ul element for the tabs
          var tabsListElement = document.createElement("ul");

          // Iterate through each tab in the window
          window.tabs.forEach(function (tab) {
            // Create an li element for each tab
            var tabItem = document.createElement("li");
            var tabLink = document.createElement("a");
            tabLink.classList.add("tab-link");

            // Set the tab link with the tab's URL and title
            tabLink.href = tab.url;
            tabLink.innerHTML = tab.title+"<br /><div class='linkit'>"+tab.url+"</div>";
            // Extract and add the URL to the urlsList
            var urlItem = document.createTextNode(tab.url+'\n');
            urlsList.appendChild(urlItem);

            // Get the favicon URL for the tab
            chrome.tabs.get(tab.id, function (currentTab) {
              var faviconURL = currentTab.favIconUrl;
              if (faviconURL) {
                // Create an img element for the favicon
                var faviconImage = document.createElement("img");
                faviconImage.src = faviconURL;
                faviconImage.classList.add("favicon");
                // Prepend the favicon to the tab link
                tabLink.prepend(faviconImage);
              } else {
                // Create an img element for the default favicon
                var faviconImage = document.createElement("img");
                faviconImage.src = 'favicon-16x16.png';
                faviconImage.classList.add("favicon");
                // Prepend the favicon to the tab link
                tabLink.prepend(faviconImage);
              }
            });

            // Check if the tab belongs to the active window and is active
            if (window.id === currentWindow.id && tab.active) {
              tabLink.classList.add("active-tab");
            }

            // Add click event listener to activate the tab on click
            tabLink.addEventListener("click", function (event) {
              event.preventDefault();

              // Check if the tab belongs to the current window
              if (tab.windowId !== currentWindow.id) {
                // Bring the tab's window to the front and activate the tab
                chrome.windows.update(tab.windowId, { focused: true }, function () {
                  chrome.tabs.update(tab.id, { active: true });
                });
              } else {
                // Activate the tab
                chrome.tabs.update(tab.id, { active: true });
              }
            });

            // Append the tab link to the tabItem
            tabItem.appendChild(tabLink);

            // Append the tabItem to the tabsListElement
            tabsListElement.appendChild(tabItem);
          });

          // Append the tabsListElement to the windowItem
          windowItem.appendChild(tabsListElement);
        }

        // Append the windowItem to the tabsList
        tabsList.appendChild(windowItem);
      });

      // Update the stats list with the window and tab count
      var statsItem = document.createElement("li");
      statsItem.textContent =
        "Total Windows: " + windowCounter + ", Total Tabs: " + tabCounter;
      statsList.appendChild(statsItem);
    });
  });

  // Find the search input element
  var searchInput = document.getElementById("searchInput");
  // Focus on the search input
  searchInput.focus();

  // Add input event listener to the search input
  searchInput.addEventListener("input", function () {
    var searchQuery = searchInput.value.toLowerCase();

    // Get all window items
    var windowItems = document.querySelectorAll("#tabsList li[data-window-id]");

    // Iterate through each window item
    windowItems.forEach(function (windowItem) {
      var tabsListElement = windowItem.querySelector("ul");
      var tabs = tabsListElement.querySelectorAll("li");

      var isWindowMatch = false;
      var isTabMatch = false;

      // Check if the window title matches the search query
      var windowTitle = windowItem.querySelector(".window-title").textContent.toLowerCase();
      if (windowTitle.includes(searchQuery)) {
        isWindowMatch = true;
      }

      // Iterate through each tab
      tabs.forEach(function (tab) {
        var tabLink = tab.querySelector("a");
        var tabTitle = tabLink.textContent.toLowerCase();
        

        // Check if the tab title matches the search query
        if (tabTitle.includes(searchQuery)) {
          tab.style.display = "block";
          isTabMatch = true;
        } else {
          tab.style.display = "none";
        }
      });
      

      // Show or hide the window item based on the search query
      if (isWindowMatch || isTabMatch) {
        windowItem.style.display = "block";
      } else {
        windowItem.style.display = "none";
      }
    });
  });

  // ...
  // Control the popup tab navigation
  const tabLabels = document.querySelectorAll(".tab-label");
  const tabContents = document.querySelectorAll(".tab-content");

  // Hide all tab contents
  tabContents.forEach(content => content.style.display = "none");

  // Show the selected tab content
  tabContents[0].style.display = "block";

  // Add listener for tab click    
  tabLabels.forEach((label, index) => {
    label.addEventListener("click", () => {
      // Hide all tab contents
      tabContents.forEach(content => content.style.display = "none");

      // Show the selected tab content
      tabContents[index].style.display = "block";

      // Focus on the search input
  searchInput.focus();
    });
  });

   // Find the copy button element
   var copyButton = document.getElementById("copyButton");

   // Add click event listener to the copy button
   copyButton.addEventListener("click", function () {
     // Find the textarea element
     var textarea = document.getElementById("urlsList");
 
     // Select the text inside the textarea
     textarea.select();
     textarea.setSelectionRange(0, textarea.value.length);
 
     // Copy the selected text to the clipboard
     document.execCommand("copy");
 
     // Deselect the text after some time (FX only ;-)
      setTimeout(function () {
        textarea.blur();
      }, 500);

   });

     // Find the about button element
  var aboutButton = document.getElementById("aboutButton");

  // Add click event listener to the about button
  aboutButton.addEventListener("click", function () {
    // Open the site in a new tab
    window.open("https://openaddons.com", "_blank");
  });

// Find the clear button element
var clearButton = document.getElementById("clearButton");

// Find the search input element
var searchInput = document.getElementById("searchInput");

// Add click event listener to the clear button
clearButton.addEventListener("click", function () {
  // Clear the search input value
  searchInput.value = "";
  // Focus on the search input
  searchInput.focus();
  
  // Trigger the search event to update the filtered list
  var searchEvent = new Event("input");
  searchInput.dispatchEvent(searchEvent);
});

});
