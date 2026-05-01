document.addEventListener("DOMContentLoaded", function () {

  function normalize(str) {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  let companies = [];

  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      companies = data;
      init();
    });

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

        const hasSearch = value !== "";

        const results = companies.filter(c => {

          const categoryMatch =
            selectedCategory === "all" ||
            (c.category && c.category.toLowerCase() === selectedCategory);

          if (!hasSearch) {
            return categoryMatch;
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
        categoryFilter.addEventListener("change", updateSuggestions);
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

      const params = new URLSearchParams(window.location.search);

      const search = (params.get("search") || "").trim();
      const category = (params.get("category") || "all").toLowerCase();

      const hasSearch = search !== "";

      const filtered = companies.filter(c => {

        const categoryMatch =
          category === "all" ||
          (c.category && c.category.toLowerCase() === category);

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
