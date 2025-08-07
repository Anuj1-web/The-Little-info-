// local-content-sync.js

// Save uploaded content to localStorage
function saveContentLocally(category, files) {
  const storedContent = JSON.parse(localStorage.getItem("siteContent") || '{}');
  if (!storedContent[category]) storedContent[category] = [];

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      storedContent[category].push({
        name: file.name,
        type: file.type,
        data: e.target.result
      });
      localStorage.setItem("siteContent", JSON.stringify(storedContent));
    };
    reader.readAsDataURL(file);
  });
}

// Load content on content pages (e.g., trending.html, explore.html)
function loadContentByCategory(category, containerSelector) {
  const storedContent = JSON.parse(localStorage.getItem("siteContent") || '{}');
  const container = document.querySelector(containerSelector);
  if (!container || !storedContent[category]) return;

  storedContent[category].forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "topic-card";

    if (item.type.startsWith("video")) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = item.data;
      wrapper.appendChild(video);
    } else if (item.type.startsWith("audio")) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = item.data;
      wrapper.appendChild(audio);
    } else if (item.type.startsWith("image")) {
      const img = document.createElement("img");
      img.src = item.data;
      img.alt = item.name;
      wrapper.appendChild(img);
    } else {
      const p = document.createElement("p");
      p.textContent = item.name;
      wrapper.appendChild(p);
    }

    container.appendChild(wrapper);
  });
}

// Hook for admin upload page
function setupAdminUploader(formSelector, categorySelector, fileInputSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const category = document.querySelector(categorySelector).value.trim();
    const files = document.querySelector(fileInputSelector).files;
    if (category && files.length > 0) {
      saveContentLocally(category, files);
      alert("Content saved to localStorage successfully!");
    }
  });
}

// Export functions globally
window.saveContentLocally = saveContentLocally;
window.loadContentByCategory = loadContentByCategory;
window.setupAdminUploader = setupAdminUploader;
