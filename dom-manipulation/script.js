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
});

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

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

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);
  filteredQuotes.forEach((quote) => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = `"${quote.text}" - ${quote.category}`;
    quoteDisplay.appendChild(quoteElement);
  });
}

populateCategories();
