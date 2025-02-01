const quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    category: "Motivation",
  },
  {
    text: "Life is 10% what happens to us and 90% how we react to it.",
    category: "Life",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "Success",
  },
  { text: "Happiness depends upon ourselves.", category: "Happiness" },
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}" - <strong>${randomQuote.category}</strong></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

document.addEventListener("DOMContentLoaded", () => {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    document.getElementById(
      "quoteDisplay"
    ).innerHTML = `<p>"${lastQuote.text}" - <strong>${lastQuote.category}</strong></p>`;
  } else {
    showRandomQuote();
  }
  createAddQuoteForm();

  populateCategories();
  fetchQuotesFromServer();
});

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  postQuotesToServer(); // Post quotes to the server after saving locally
}

// Function to create the "Add Quote" form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formContainer);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Function to export quotes to a JSON file
document
  .getElementById("exportQuotes")
  .addEventListener("click", exportToJsonFile);
document
  .getElementById("importFile")
  .addEventListener("change", importFromJsonFile);

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format. Please upload a valid JSON file.");
      }
    } catch (error) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to populate categories in the filter dropdown
function populateCategories() {
  let categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) {
    categoryFilter = document.createElement("select");
    categoryFilter.id = "categoryFilter";
    categoryFilter.onchange = filterQuotes;
    document.body.insertBefore(
      categoryFilter,
      document.getElementById("quoteDisplay")
    );
  }

  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = localStorage.getItem("selectedCategory") || "all";
}

// Function to filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    return;
  }

  filteredQuotes.forEach((quote) => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = `"${quote.text}" - ${quote.category}`;
    quoteDisplay.appendChild(quoteElement);
  });
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    console.log("Fetched server data:", data);

    const existingTexts = new Set(quotes.map((q) => q.text));
    const newQuotes = data
      .map((post) => ({ text: post.title, category: "General" }))
      .filter((q) => !existingTexts.has(q.text));

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      notifyUser("New quotes have been added from the server.");
    }
  } catch (error) {
    console.error("Error fetching server data:", error);
    notifyUser("Failed to fetch quotes from the server.", true);
  }
}

// Function to post quotes to the server
async function postQuotesToServer() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotes),
    });

    if (response.ok) {
      console.log("Quotes posted to the server successfully.");
      notifyUser("Quotes synced with the server.");
    } else {
      console.error("Failed to post quotes to the server.");
      notifyUser("Failed to sync quotes with the server.", true);
    }
  } catch (error) {
    console.error("Error posting quotes to the server:", error);
    notifyUser("Failed to sync quotes with the server.", true);
  }
}

// Function to notify the user
function notifyUser(message, isError = false) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.padding = "10px";
  notification.style.backgroundColor = isError ? "red" : "green";
  notification.style.color = "white";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "1000";
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);
}

setInterval(fetchQuotesFromServer, 10 * 60 * 1000);
function syncQuotes() {
  fetchQuotesFromServer().then(() => {
    notifyUser("Quotes synced with server!");
  });
}

setInterval(syncQuotes, 20 * 60 * 1000);
populateCategories();
