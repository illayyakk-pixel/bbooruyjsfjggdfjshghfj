// Normalize (for search)
document.addEventListener("DOMContentLoaded", function () {

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

let companies = [];

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    companies = data;
  });

// Homepage elements
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

// Suggestions (homepage)
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

const categoryFilter = document.getElementById("categoryFilter");

if (categoryFilter && searchInput) {
  categoryFilter.addEventListener("change", function () {
    searchInput.dispatchEvent(new Event("input"));
  });
}

  // Enter key
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      goToResults();
    }
  });
}

function goBack() {
  window.history.back();
}

function goHome() {
  window.location.href = "index.html";
}

// Go to results
function goToResults() {
  const query = document.getElementById("searchInput")?.value.trim() || "";
  const category = document.getElementById("categoryFilter")?.value || "all";

  window.location.href =
    "results.html?search=" + query + "&category=" + category;
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

// Popup
function showPopup(company) {
  const popup = document.getElementById("popup");
  const popupBody = document.getElementById("popupBody");

  if (!popup || !popupBody) return;

  const colorClass = company.rating === "green" ? "green" : "red";
  const label = company.rating === "green" ? "Green" : "Red";

popupBody.innerHTML = `
  <img src="${company.logo}" alt="${company.name}" style="width:80px; margin-bottom:10px;">

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

  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.onclick = function () {
      popup.classList.add("hidden");
    };
  }

  // click outside
  popup.onclick = function (e) {
    if (e.target === popup) {
      popup.classList.add("hidden");
    }
  };
}

// ESC works globally
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const popup = document.getElementById("popup");
    if (popup) {
      popup.classList.add("hidden");
    }
  }
  function showPopup(company) {
  const popup = document.getElementById("popup");
  const popupBody = document.getElementById("popupBody");

  if (!popup || !popupBody) return;

  popupBody.innerHTML = `
    <strong>${company.name}</strong>
    <p>${company.description}</p>
  `;

  popup.classList.remove("hidden");

  document.getElementById("closeBtn").onclick = () => {
    popup.classList.add("hidden");
  };
}
});
});
