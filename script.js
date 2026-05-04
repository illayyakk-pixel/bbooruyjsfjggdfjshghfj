document.addEventListener("DOMContentLoaded", function () {

  // 🔒 Close suggestions when clicking outside
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

  // 🔄 Loading message
  const resultsList = document.getElementById("resultsList");
  if (resultsList) {
    resultsList.innerHTML = "<p>Loading...</p>";
  }

  // 🌐 Fetch data
  fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSgCX7yjBf65usJKdHP6YbfSQd4Ru3it7KvyKde6SN7SIxdH9vln-tCws3ulVidW1wpvlAoL0MtlNHA/pub?output=csv")
    .then(res => res.text())
    .then(csv => {
      companies = parseCSV(csv);
      init();
    });

  // 🧠 Parse CSV
  function parseCSV(csv) {
    const lines = csv.split("\n").map(l => l.trim()).filter(l => l);
    const headers = lines[0].split(",");

    return lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

      const obj = {};
      headers.forEach((h, i) => {
        let value = values[i] || "";
        value = value.replace(/^"|"$/g, "").trim();
        obj[h.trim()] = value;
      });

      // products → array
      if (obj.products) {
        obj.products = obj.products.split(",").map(p => p.trim());
      }

      // category → array (🔥 FIXED)
      if (obj.category) {
        obj.category = obj.category
          .split(",")
          .map(c => c.trim().toLowerCase())
          .filter(c => c);
      } else {
        obj.category = [];
      }

      return obj;
    });
  }

  function init() {

    const searchInput = document.getElementById("searchInput");
    const suggestions = document.getElementById("suggestions");
    const categoryFilter = document.getElementById("categoryFilter");

    // 🔍 Suggestions
    if (searchInput && suggestions) {

      function updateSuggestions() {
        const value = searchInput.value.trim();
        const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : "all";

        suggestions.innerHTML = "";

        if (value === "") {
          suggestions.style.display = "none";
          return;
        }

        const results = companies.filter(c => {

          const categoryMatch =
            selectedCategory === "all" ||
            (Array.isArray(c.category) &&
             c.category.includes(selectedCategory));

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
          (Array.isArray(c.category) &&
           c.category.includes(category));

        if (!hasSearch) {
          return categoryMatch;
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

    setTimeout(() => {
  const btn = document.querySelector(".why-btn");
  const text = document.querySelector(".why-text");

  if (btn && text) {
    btn.onclick = () => {
      text.style.display = text.style.display === "block" ? "none" : "block";
    };
  }
}, 0);

    if (!popup || !popupBody) return;

    const colorClass = company.rating === "green" ? "green" : "red";
    const label = company.rating === "green" ? "Green" : "Red";

    popupBody.innerHTML = `
      ${company.logo ? `<img src="${company.logo}" style="width:80px; margin-bottom:10px;">` : ""}

      <div>
        <span class="circle ${colorClass}"></span>
        <strong>${label}</strong>
      </div>

      <div class="why-section">
        <button class="why-btn">Why?</button>
        <div class="why-text">${company.description}</div>
      </div>

      const maxProducts = 5;

const productsHTML = Array.isArray(company.products)
  ? `
    <h4>Products:</h4>
    <ul id="productList">
      ${company.products.slice(0, maxProducts).map(p => `<li>${p}</li>`).join("")}
    </ul>
    ${
      company.products.length > maxProducts
        ? `<button id="showMoreBtn">Show more</button>`
        : ""
    }
  `
  : "";

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
