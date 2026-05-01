// Normalize (for search)
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

let companies = [];

// Load JSON
fetch("./data.json")
  .then(res => res.json())
  .then(data => {
    console.log("DATA LOADED:", data);
    companies = data;
    initApp();
  })
  .catch(err => console.error("FETCH ERROR:", err));

function initApp() {

  // Homepage elements
  const searchInput = document.getElementById("searchInput");
  const suggestions = document.getElementById("suggestions");

  if (searchInput && suggestions) {

    searchInput.addEventListener("input", function () {
      const value = this.value.trim();
      suggestions.innerHTML = "";

      if (value === "") {
        suggestions.style.display = "none";
        return;
      }

      let selectedCategory = "all";
      const categoryEl = document.getElementById("categoryFilter");
      if (categoryEl) {
        selectedCategory = categoryEl.value;
      }

      const results = companies.filter(function (c) {
        const nameMatch = normalize(c.name).includes(normalize(value));
        const categoryMatch =
          selectedCategory === "all" || c.category === selectedCategory;

        return nameMatch && categoryMatch;
      });

      if (results.length === 0) {
        suggestions.style.display = "none";
        return;
      }

      suggestions.style.display = "block";

      results.slice(0, 5).forEach(function (company) {
        const li = document.createElement("li");

        const colorClass = company.rating === "green" ? "green" : "red";

        li.innerHTML = `
          <span class="circle ${colorClass}"></span>
          ${company.name}
        `;

        li.onclick = function () {
          window.location.href =
            "results.html?search=" + company.name + "&category=" + selectedCategory;
        };

        suggestions.appendChild(li);
      });
    });

    // Enter key
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        goToResults();
      }
    });
  }

  // Results page
  const resultsList = document.getElementById("resultsList");

  if (resultsList) {
    const params = new URLSearchParams(window.location.search);
    const search = (params.get("search") || "").trim();
    const category = params.get("category") || "all";

    const filtered = companies.filter(function (c) {
      const nameMatch = normalize(c.name).includes(normalize(search));
      const categoryMatch =
        category === "all" || c.category === category;

      return nameMatch && categoryMatch;
    });

    if (filtered.length === 0) {
      resultsList.innerHTML = "<p>No companies found.</p>";
    }

    filtered.forEach(function (company) {
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

// Search button
function goToResults() {
  const query = document.getElementById("searchInput")?.value.trim() || "";
  const category = document.getElementById("categoryFilter")?.value || "all";

  window.location.href =
    "results.html?search=" + query + "&category=" + category;
}
