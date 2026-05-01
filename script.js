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
      init(); // IMPORTANT
    });

  function init() {

    const searchInput = document.getElementById("searchInput");
    const suggestions = document.getElementById("suggestions");

    // 🔍 Suggestions
    if (searchInput && suggestions) {
      searchInput.addEventListener("input", function () {

        const value = this.value.trim();
        suggestions.innerHTML = "";

        let selectedCategory = "all";
const categoryEl = document.getElementById("categoryFilter");
if (categoryEl) {
  selectedCategory = categoryEl.value;
}

// If BOTH empty input AND "all" category → do nothing
if (value === "" && selectedCategory === "all") {
  suggestions.style.display = "none";
  return;
}

       const results = companies.filter(c => {

  const nameMatch = normalize(c.name).includes(normalize(value));

  const productMatch =
    Array.isArray(c.products) &&
    c.products.some(p => normalize(p).includes(normalize(value)));

  const categoryMatch =
    selectedCategory === "all" || c.category === selectedCategory;

  // 🔑 Key logic:
  if (value === "") {
    return categoryMatch; // only filter by category
  }

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
              "results.html?search=" + company.name;
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

    // 📄 Results page
    const resultsList = document.getElementById("resultsList");

    if (resultsList) {
      const params = new URLSearchParams(window.location.search);
      const search = (params.get("search") || "").trim();

      const filtered = companies.filter(c => {

  const nameMatch = normalize(c.name).includes(normalize(search));

  const productMatch =
    Array.isArray(c.products) &&
    c.products.some(p => normalize(p).includes(normalize(search)));

  return nameMatch || productMatch;
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
    window.location.href = "results.html?search=" + query;
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
}

  // ESC closes popup
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const popup = document.getElementById("popup");
      if (popup) popup.classList.add("hidden");
    }
  });

});
