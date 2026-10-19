const STORAGE_KEY = "cybersafe-stories-v1";

const translations = {
  en: {
    saved: "Story saved on this device.",
    deleted: "Story removed.",
    titleRequired: "Please add a title.",
    fieldsRequired: "Please complete the required fields.",
    privacyRequired: "Please confirm that you have not included sensitive information.",
    unsafe: "Please remove passwords, verification codes, personal identifiers, confidential details, and suspicious links before saving.",
    searchPlaceholder: "Search stories / ابحث في التجارب",
    categories: {
      phishing: ["Phishing", "✉"],
      fraud: ["Fraud", "⚠"],
      account: ["Account security", "▣"],
      device: ["Device / malware", "⌘"],
      other: ["Other", "◈"]
    },
    happened: "What happened",
    lesson: "What we can learn",
    action: "Action taken: ",
    anonymous: "Shared anonymously",
    emptySearch: "No stories match your search.",
    localOnly: "Local demo only"
  },
  ar: {
    saved: "تم حفظ التجربة على هذا الجهاز.",
    deleted: "تم حذف التجربة.",
    titleRequired: "يرجى إدخال عنوان.",
    fieldsRequired: "يرجى تعبئة الحقول المطلوبة.",
    privacyRequired: "يرجى تأكيد عدم إدراج معلومات حساسة.",
    unsafe: "يرجى إزالة كلمات المرور ورموز التحقق والمعرّفات الشخصية والتفاصيل السرية والروابط المشبوهة قبل الحفظ.",
    searchPlaceholder: "ابحث في التجارب / Search stories",
    categories: {
      phishing: ["التصيد الاحتيالي", "✉"],
      fraud: ["الاحتيال", "⚠"],
      account: ["أمان الحساب", "▣"],
      device: ["الأجهزة والبرمجيات الخبيثة", "⌘"],
      other: ["أخرى", "◈"]
    },
    happened: "ماذا حدث",
    lesson: "ما الذي يمكن أن نتعلمه",
    action: "الإجراء المتخذ: ",
    anonymous: "مشاركة دون ذكر الاسم",
    emptySearch: "لا توجد تجارب تطابق البحث.",
    localOnly: "نسخة محلية فقط"
  }
};

const starterStories = [
  {
    id: "sample-1",
    category: "phishing",
    date: "2026-10-10",
    title: "A delivery message that looked real",
    titleAr: "رسالة توصيل بدت حقيقية",
    experience: "An unexpected delivery message asked me to open a link and pay a small fee. The sender and urgent wording made it look convincing.",
    experienceAr: "وصلتني رسالة توصيل غير متوقعة تطلب فتح رابط ودفع مبلغ بسيط. بدا المرسل وصياغة الرسالة المستعجلة مقنعين.",
    lesson: "Check delivery updates through the official app or website. Do not use payment links from unexpected messages.",
    lessonAr: "تحقق من تحديثات التوصيل عبر التطبيق أو الموقع الرسمي. لا تستخدم روابط الدفع الواردة في رسائل غير متوقعة.",
    action: "I did not open the link and reported the message.",
    actionAr: "لم أفتح الرابط وأبلغت عن الرسالة.",
    sample: true
  },
  {
    id: "sample-2",
    category: "account",
    date: "2026-10-08",
    title: "An unexpected sign-in approval",
    titleAr: "طلب موافقة تسجيل دخول غير متوقع",
    experience: "I received a multi-factor authentication approval request while I was not trying to sign in.",
    experienceAr: "وصلني طلب للموافقة على المصادقة متعددة العوامل رغم أنني لم أكن أحاول تسجيل الدخول.",
    lesson: "Never approve a sign-in you did not initiate. Report repeated requests to the IT or security team.",
    lessonAr: "لا توافق أبداً على تسجيل دخول لم تبدأه بنفسك. أبلغ فريق تقنية المعلومات أو الأمن عن الطلبات المتكررة.",
    action: "I denied the request and reported it to IT.",
    actionAr: "رفضت الطلب وأبلغت قسم تقنية المعلومات.",
    sample: true
  },
  {
    id: "sample-3",
    category: "fraud",
    date: "2026-10-04",
    title: "A caller pretending to be IT support",
    titleAr: "متصل ينتحل صفة الدعم الفني",
    experience: "A caller claimed there was an urgent account issue and asked me to share a verification code.",
    experienceAr: "ادعى متصل وجود مشكلة عاجلة في الحساب وطلب مني مشاركة رمز تحقق.",
    lesson: "IT support should not need your password or one-time verification code. Verify requests through known internal contact channels.",
    lessonAr: "لا يحتاج الدعم الفني إلى كلمة مرورك أو رمز التحقق لمرة واحدة. تحقق من الطلبات عبر قنوات الاتصال الداخلية المعروفة.",
    action: "I ended the call and contacted the service desk using the official directory.",
    actionAr: "أنهيت المكالمة وتواصلت مع مكتب الخدمة عبر الدليل الرسمي.",
    sample: true
  }
];

let language = "en";
let activeCategory = "all";
let userStories = [];

const $ = (id) => document.getElementById(id);
const dialog = $("storyDialog");
const form = $("storyForm");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function getStoredStories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredStories() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userStories));
    return true;
  } catch {
    showToast(language === "ar"
      ? "تعذر الحفظ في المتصفح. قد تكون مساحة التخزين ممتلئة."
      : "Could not save in this browser. Storage may be unavailable or full.");
    return false;
  }
}

function allStories() {
  return [...userStories, ...starterStories].sort((a, b) => b.date.localeCompare(a.date));
}

function currentText(story, field) {
  const arField = `${field}Ar`;
  if (language === "ar" && story[arField]) return story[arField];
  return story[field] || "";
}

function categoryLabel(category) {
  return translations[language].categories[category] || translations[language].categories.other;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHTML(dateString);
  return new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric", month: "short", year: "numeric"
  }).format(date);
}

function renderStories() {
  const query = $("searchInput").value.trim().toLocaleLowerCase();
  const filtered = allStories().filter(story => {
    const matchesCategory = activeCategory === "all" || story.category === activeCategory;
    const searchable = [
      currentText(story, "title"), currentText(story, "experience"),
      currentText(story, "lesson"), currentText(story, "action"),
      story.title, story.titleAr, story.experience, story.experienceAr,
      story.lesson, story.lessonAr, story.action, story.actionAr
    ].join(" ").toLocaleLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });

  $("postCount").textContent = allStories().length;
  $("storiesGrid").innerHTML = filtered.map(story => {
    const [categoryName, icon] = categoryLabel(story.category);
    const title = currentText(story, "title");
    const experience = currentText(story, "experience");
    const lesson = currentText(story, "lesson");
    const action = currentText(story, "action");
    const isUserStory = !story.sample;
    return `
      <article class="story-card">
        <div class="card-top">
          <span class="category">${icon} ${escapeHTML(categoryName)}</span>
          <span class="story-date">${formatDate(story.date)}</span>
        </div>
        <h3>${escapeHTML(title)}</h3>
        <p class="story-text">${escapeHTML(experience)}</p>
        <div class="lesson-box">
          <span class="lesson-label">${escapeHTML(translations[language].lesson)}</span>
          <p>${escapeHTML(lesson)}</p>
        </div>
        ${action ? `<p class="action-line">${escapeHTML(translations[language].action)}${escapeHTML(action)}</p>` : ""}
        ${isUserStory ? `<p class="action-line">${escapeHTML(translations[language].anonymous)} <button type="button" class="delete-story" data-delete="${escapeHTML(story.id)}" aria-label="${language === "ar" ? "حذف التجربة" : "Delete story"}">×</button></p>` : ""}
      </article>`;
  }).join("");

  $("emptyState").classList.toggle("hidden", filtered.length > 0);
  $("storiesGrid").classList.toggle("hidden", filtered.length === 0);
  if (filtered.length === 0 && query) {
    $("emptyState").querySelector("p").textContent = translations[language].emptySearch;
  } else {
    $("emptyState").querySelector("p").textContent = language === "ar"
      ? "كن أول من يشارك تجربة أو جرّب البحث بكلمات أخرى."
      : "Be the first to share an experience or try another search.";
  }
  document.querySelectorAll(".delete-story").forEach(button => {
    button.addEventListener("click", () => deleteStory(button.dataset.delete));
  });
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.body.dir = language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-en][data-ar]").forEach(el => {
    el.textContent = el.dataset[language];
  });
  $("languageToggle").textContent = language === "en" ? "العربية" : "English";
  $("searchInput").placeholder = translations[language].searchPlaceholder;
  $("storyTitle").placeholder = language === "ar"
    ? "مثال: رسالة توصيل احتيالية / A convincing delivery-message scam"
    : "e.g. A convincing delivery-message scam / مثال: رسالة توصيل احتيالية";
  $("storyExperience").placeholder = language === "ar"
    ? "اشرح الموقف دون أسماء أو تفاصيل حساسة..."
    : "Describe the situation without names or sensitive details...";
  $("storyLesson").placeholder = language === "ar"
    ? "ما الذي يجب أن ينتبه له الزملاء أو يفعلوه؟"
    : "What should colleagues watch for or do?";
  $("storyAction").placeholder = language === "ar"
    ? "مثال: أبلغت قسم تقنية المعلومات"
    : "e.g. Reported the message to IT";
  renderStories();
}

function openDialog() {
  $("formError").classList.add("hidden");
  form.reset();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog() {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function looksSensitive(text) {
  const patterns = [
    /\b(password|passwd|passcode)\s*[:=]\s*\S+/i,
    /\b(otp|verification code|one[- ]time code)\s*[:=]\s*\S+/i,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b(?:\d[ -]*?){13,19}\b/
  ];
  return patterns.some(pattern => pattern.test(text));
}

function submitStory(event) {
  event.preventDefault();
  const title = $("storyTitle").value.trim();
  const experience = $("storyExperience").value.trim();
  const lesson = $("storyLesson").value.trim();
  const action = $("storyAction").value.trim();
  const category = $("storyCategory").value;
  const error = $("formError");

  if (!title || !experience || !lesson) {
    error.textContent = translations[language].fieldsRequired;
    error.classList.remove("hidden");
    return;
  }
  if (!$("privacyConfirm").checked) {
    error.textContent = translations[language].privacyRequired;
    error.classList.remove("hidden");
    return;
  }
  if (looksSensitive(`${title}\n${experience}\n${lesson}\n${action}`)) {
    error.textContent = translations[language].unsafe;
    error.classList.remove("hidden");
    return;
  }

  const now = new Date();
  const story = {
    id: `story-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    date: now.toISOString().slice(0, 10),
    title,
    titleAr: "",
    experience,
    experienceAr: "",
    lesson,
    lessonAr: "",
    action,
    actionAr: "",
    sample: false
  };
  userStories.unshift(story);
  if (!saveStoredStories()) {
    userStories = userStories.filter(item => item.id !== story.id);
    return;
  }
  closeDialog();
  renderStories();
  showToast(translations[language].saved);
}

function deleteStory(id) {
  userStories = userStories.filter(story => story.id !== id);
  if (saveStoredStories()) {
    renderStories();
    showToast(translations[language].deleted);
  }
}

$("languageToggle").addEventListener("click", () => {
  language = language === "en" ? "ar" : "en";
  applyLanguage();
});
$("openFormBtn").addEventListener("click", openDialog);
$("emptyShareBtn").addEventListener("click", openDialog);
$("closeDialogBtn").addEventListener("click", closeDialog);
$("cancelDialogBtn").addEventListener("click", closeDialog);
$("searchInput").addEventListener("input", renderStories);
$("categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(filter => filter.classList.toggle("active", filter === button));
  renderStories();
});
form.addEventListener("submit", submitStory);
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeDialog();
});

userStories = getStoredStories();
applyLanguage();
