document.addEventListener("DOMContentLoaded", function () {

document.addEventListener("click", function (e) {
  const suggestions = document.getElementById("suggestions");
  const searchInput = document.getElementById("searchInput");

  if (!suggestions || !searchInput) return;

  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = "none";
  }
});
  
  function normalize(str) {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  let companies = [];

const resultsList = document.getElementById("resultsList");
if (resultsList) {
  resultsList.innerHTML = "<p>Loading...</p>";
}
  
  fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSgCX7yjBf65usJKdHP6YbfSQd4Ru3it7KvyKde6SN7SIxdH9vln-tCws3ulVidW1wpvlAoL0MtlNHA/pub?output=csv")
  .then(res => res.text())
  .then(csv => {
    companies = parseCSV(csv);
    init();
  });

  function parseCSV(csv) {
  const lines = csv.split("\n").map(l => l.trim()).filter(l => l);

  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {

    // 🔥 FIX: handle quoted values
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

    const obj = {};
    headers.forEach((h, i) => {
      let value = values[i] || "";

      // remove quotes
      value = value.replace(/^"|"$/g, "").trim();

      obj[h.trim()] = value;
    });

    // Convert products → array
    if (obj.products) {
      obj.products = obj.products.split(",").map(p => p.trim());
    }

    return obj;
  });
}

  function init() {

    const searchInput = document.getElementById("searchInput");
    const suggestions = document.getElementById("suggestions");
    const categoryFilter = document.getElementById("categoryFilter");
const lastUpdatedEl = document.getElementById("lastUpdated");
const cachedTime = localStorage.getItem("companiesDataTime");

if (lastUpdatedEl && cachedTime) {
  const date = new Date(parseInt(cachedTime));
  lastUpdatedEl.textContent = "Last updated: " + date.toLocaleTimeString();
}

    
    // 🔍 Suggestions
    if (searchInput && suggestions) {

      function updateSuggestions() {
        const value = searchInput.value.trim();
        const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : "all";

        suggestions.innerHTML = "";

        const hasSearch = value !== "";

        const results = companies.filter(c => {

          const categoryMatch =
            selectedCategory === "all" ||
            (c.category && c.category.toLowerCase() === selectedCategory);

          if (!hasSearch) {
  return false; // prevents dropdown when only category is selected
}

          const nameMatch = normalize(c.name).includes(normalize(value));

          const productMatch =
            Array.isArray(c.products) &&
            c.products.some(p => normalize(p).includes(normalize(value)));

          return (nameMatch || productMatch) && categoryMatch;
        });

        if (results.length === 0) {
          suggestions.style.display = "none";
          return;
        }

        suggestions.style.display = "block";

        results.slice(0, 5).forEach(company => {
          const li = document.createElement("li");

          const colorClass = company.rating === "green" ? "green" : "red";

          li.innerHTML = `
            <span class="circle ${colorClass}"></span>
            ${company.name}
          `;

          li.onclick = function () {
            window.location.href =
              "results.html?search=" + encodeURIComponent(company.name) +
              "&category=" + selectedCategory;
          };

          suggestions.appendChild(li);
        });
      }

      searchInput.addEventListener("input", updateSuggestions);

      if (categoryFilter) {
        categoryFilter.addEventListener("change", function () {
  suggestions.style.display = "none";
  updateSuggestions();
});
      }

      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          goToResults();
        }
      });
    }

    // 📄 Results page
    const resultsList = document.getElementById("resultsList");

    if (resultsList) {

      resultsList.innerHTML = "";
      const params = new URLSearchParams(window.location.search);

      const search = (params.get("search") || "").trim();
      const category = (params.get("category") || "all").toLowerCase();

      const hasSearch = search !== "";

      const filtered = companies.filter(c => {

        const categoryMatch =
          category === "all" ||
          (c.category && c.category.toLowerCase() === category);

        if (!hasSearch) {
  return false; // prevents dropdown when only category is selected
}

        const nameMatch = normalize(c.name).includes(normalize(search));

        const productMatch =
          Array.isArray(c.products) &&
          c.products.some(p => normalize(p).includes(normalize(search)));

        return (nameMatch || productMatch) && categoryMatch;
      });

      if (filtered.length === 0) {
        resultsList.innerHTML = "<p>No companies found.</p>";
      }

      filtered.forEach(company => {
        const li = document.createElement("li");

        const colorClass = company.rating === "green" ? "green" : "red";

        li.innerHTML = `
          <span class="circle ${colorClass}"></span>
          ${company.name}
        `;

        li.onclick = function () {
          showPopup(company);
        };

        resultsList.appendChild(li);
      });
    }
  }

  // 🔘 Navigation
  window.goToResults = function () {
    const query = document.getElementById("searchInput")?.value.trim() || "";
    const category = document.getElementById("categoryFilter")?.value || "all";

    window.location.href =
      "results.html?search=" + encodeURIComponent(query) +
      "&category=" + category;
  };

  window.goHome = function () {
    window.location.href = "index.html";
  };

  window.goBack = function () {
    window.history.back();
  };

  // 🪟 Popup
  function showPopup(company) {
    const popup = document.getElementById("popup");
    const popupBody = document.getElementById("popupBody");

    if (!popup || !popupBody) return;

    const colorClass = company.rating === "green" ? "green" : "red";
    const label = company.rating === "green" ? "Green" : "Red";

    popupBody.innerHTML = `
      ${company.logo ? `<img src="${company.logo}" style="width:80px; margin-bottom:10px;">` : ""}

      <div>
        <span class="circle ${colorClass}"></span>
        <strong>${label}</strong>
      </div>

      <p>${company.description}</p>

      ${Array.isArray(company.products) ? `
        <h4>Products:</h4>
        <ul>
          ${company.products.map(p => `<li>${p}</li>`).join("")}
        </ul>
      ` : ""}

      ${company.notes ? `<p><strong>Notes:</strong> ${company.notes}</p>` : ""}
    `;

    popup.classList.remove("hidden");

    document.getElementById("closeBtn").onclick = () => {
      popup.classList.add("hidden");
    };
    popup.onclick = function (e) {
  if (e.target === popup) {
    popup.classList.add("hidden");
  }
};
  }

  // ESC closes popup
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const popup = document.getElementById("popup");
      if (popup) popup.classList.add("hidden");
    }
  });

});
