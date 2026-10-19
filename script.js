
const STORAGE_KEY = "cybersafeEmployeeStories";

let language = "en";
let activeCategory = "all";
let stories = loadStories();

const $ = id => document.getElementById(id);

const categoryNames = {
  en: {
    phishing: "Phishing",
    hacking: "Hacking",
    fraud: "Fraud",
    account: "Account security",
    other: "Other",
    lesson: "What we can learn",
    anonymous: "Shared anonymously",
    action: "Action taken: ",
    by: "Shared by: "
  },
  ar: {
    phishing: "التصيد الاحتيالي",
    hacking: "الاختراق",
    fraud: "الاحتيال",
    account: "أمان الحساب",
    other: "أخرى",
    lesson: "ما الذي يمكن أن نتعلمه",
    anonymous: "مشاركة مجهولة",
    action: "الإجراء المتخذ: ",
    by: "شاركها: "
  }
};

// Escape text before displaying user-submitted content.
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function loadStories() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveStories() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stories)
    );
    return true;
  } catch {
    showToast(
      language === "ar"
        ? "تعذر حفظ التجربة في المتصفح."
        : "Could not save the story in this browser."
    );
    return false;
  }
}

function getCategoryName(category) {
  return categoryNames[language][category] || categoryNames[language].other;
}

function getDate(date) {
  return new Intl.DateTimeFormat(
    language === "ar" ? "ar-AE" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  ).format(new Date(date + "T12:00:00"));
}

function renderStories() {
  const query = $("searchInput").value
    .trim()
    .toLocaleLowerCase();

  const filtered = stories.filter(story => {
    const categoryMatches =
      activeCategory === "all" ||
      story.category === activeCategory;

    const text = [
      story.title,
      story.experience,
      story.lesson,
      story.action,
      story.author,
      story.category
    ].join(" ").toLocaleLowerCase();

    return categoryMatches &&
      (!query || text.includes(query));
  });

  $("postCount").textContent = stories.length;

  $("stories").innerHTML = filtered.map(story => {
    const category = escapeHTML(getCategoryName(story.category));

    const author = story.sharingMode === "named"
      ? `<span>${escapeHTML(categoryNames[language].by)}${escapeHTML(story.author)}</span>`
      : `<span>${escapeHTML(categoryNames[language].anonymous)}</span>`;

    const action = story.action
      ? `<p class="author">${escapeHTML(categoryNames[language].action)}${escapeHTML(story.action)}</p>`
      : "";

    return `
      <article class="story-card">
        <div class="card-top">
          <span class="category">${category}</span>
          <span class="story-date">${escapeHTML(getDate(story.date))}</span>
        </div>

        <h3>${escapeHTML(story.title)}</h3>

        <p class="story-text">${escapeHTML(story.experience)}</p>

        <div class="lesson">
          <strong>${escapeHTML(categoryNames[language].lesson)}</strong>
          <p>${escapeHTML(story.lesson)}</p>
        </div>

        ${action}

        <div class="author">
          ${author}
          <button
            type="button"
            class="delete-btn"
            data-delete="${escapeHTML(story.id)}">
            ${language === "ar" ? "حذف" : "Delete"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  $("emptyState").classList.toggle(
    "hidden",
    filtered.length > 0
  );

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deleteStory(button.dataset.delete);
    });
  });
}

function applyLanguage() {
  document.documentElement.lang = language;

  document.body.dir =
    language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.textContent = element.dataset[language];
  });

  $("languageToggle").textContent =
    language === "en" ? "العربية" : "English";

  $("searchInput").placeholder =
    language === "en"
      ? "Search experiences / ابحث في التجارب"
      : "ابحث في التجارب / Search experiences";

  renderStories();
}

function openForm() {
  $("storyForm").reset();

  // Anonymous sharing is the default.
  document.querySelector(
    'input[name="sharingMode"][value="anonymous"]'
  ).checked = true;

  $("nameField").classList.add("hidden");
  $("employeeName").required = false;
  $("formError").classList.add("hidden");

  $("storyDialog").showModal();
}

function closeForm() {
  $("storyDialog").close();
}

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Basic warning checks only; this is not a security scanner.
function containsSensitivePattern(text) {
  const patterns = [
    /\b(password|passwd|passcode)\s*[:=]\s*\S+/i,
    /\b(otp|verification code|one-time code)\s*[:=]\s*\S+/i,
    /\b\d{3}-\d{2}-\d{4}\b/
  ];

  return patterns.some(pattern => pattern.test(text));
}

// Show or hide the employee name field.
document.querySelectorAll(
  'input[name="sharingMode"]'
).forEach(radio => {
  radio.addEventListener("change", () => {
    const isNamed =
      document.querySelector(
        'input[name="sharingMode"]:checked'
      ).value === "named";

    $("nameField").classList.toggle(
      "hidden",
      !isNamed
    );

    $("employeeName").required = isNamed;

    if (!isNamed) {
      $("employeeName").value = "";
    }
  });
});

// Submit a story.
$("storyForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("title").value.trim();
  const experience = $("experience").value.trim();
  const lesson = $("lesson").value.trim();
  const action = $("action").value.trim();
  const category = $("category").value;

  const sharingMode = document.querySelector(
    'input[name="sharingMode"]:checked'
  ).value;

  const author = $("employeeName").value.trim();

  let errorMessage = "";

  if (!title || !experience || !lesson) {
    errorMessage = language === "ar"
      ? "يرجى تعبئة جميع الحقول المطلوبة."
      : "Please complete all required fields.";
  } else if (sharingMode === "named" && !author) {
    errorMessage = language === "ar"
      ? "يرجى كتابة اسمك."
      : "Please enter your name.";
  } else if (!$("privacyConfirm").checked) {
    errorMessage = language === "ar"
      ? "يرجى تأكيد عدم إدراج معلومات سرية."
      : "Please confirm that no confidential information is included.";
  } else if (
    containsSensitivePattern(
      [title, experience, lesson, action].join("\n")
    )
  ) {
    errorMessage = language === "ar"
      ? "يبدو أن النص يحتوي على معلومات حساسة. راجعه قبل الحفظ."
      : "The text may contain sensitive information. Review it before saving.";
  }

  if (errorMessage) {
    $("formError").textContent = errorMessage;
    $("formError").classList.remove("hidden");
    return;
  }

  const newStory = {
    id: Date.now().toString() +
      Math.random().toString(36).slice(2, 7),

    date: new Date().toISOString().slice(0, 10),
    title,
    category,
    experience,
    lesson,
    action,

    // Never store a name when anonymous sharing is selected.
    sharingMode,
    author: sharingMode === "named" ? author : ""
  };

  const previousStories = stories;
  stories = [newStory, ...stories];

  if (!saveStories()) {
    stories = previousStories;
    return;
  }

  closeForm();
  renderStories();

  showToast(
    language === "ar"
      ? "تم حفظ تجربتك بنجاح."
      : "Your experience was saved successfully."
  );
});

// Search experiences.
$("searchInput").addEventListener(
  "input",
  renderStories
);

// Filter experiences by category.
$("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle("active", filter === button);
  });

  renderStories();
});

// Delete a story saved in this browser.
function deleteStory(id) {
  const confirmed = window.confirm(
    language === "ar"
      ? "هل تريد حذف هذه التجربة من هذا المتصفح؟"
      : "Delete this story from this browser?"
  );

  if (!confirmed) return;

  const previousStories = stories;
  stories = stories.filter(story => story.id !== id);

  if (!saveStories()) {
    stories = previousStories;
    return;
  }

  renderStories();

  showToast(
    language === "ar"
      ? "تم حذف التجربة."
      : "Story deleted."
  );
}

// Interface controls.
$("languageToggle").addEventListener("click", () => {
  language = language === "en" ? "ar" : "en";
  applyLanguage();
});

$("openForm").addEventListener("click", openForm);
$("closeForm").addEventListener("click", closeForm);
$("cancelForm").addEventListener("click", closeForm);

// Close the form when the user clicks outside it.
$("storyDialog").addEventListener("click", event => {
  if (event.target === $("storyDialog")) {
    closeForm();
  }
});

// Start the website.
applyLanguage();
