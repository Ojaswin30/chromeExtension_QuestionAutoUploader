const githubTokenInput = document.getElementById("githubToken");
const githubRepoInput = document.getElementById("githubRepo");
const saveBtn = document.getElementById("saveBtn");
const statusDiv = document.getElementById("status");

// Load saved settings on page load
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["GITHUB_TOKEN", "GITHUB_REPO"], (result) => {
    if (result.GITHUB_TOKEN) githubTokenInput.value = result.GITHUB_TOKEN;
    if (result.GITHUB_REPO) githubRepoInput.value = result.GITHUB_REPO;
  });
});

// Save settings
saveBtn.addEventListener("click", () => {
  const githubToken = githubTokenInput.value.trim();
  const githubRepo = githubRepoInput.value.trim();

  if (!githubToken) {
    showStatus("error", "❌ Please enter your GitHub Token");
    return;
  }

  if (!githubRepo) {
    showStatus("error", "❌ Please enter your GitHub Repository");
    return;
  }

  // Save to chrome storage
  chrome.storage.sync.set({
    GITHUB_TOKEN: githubToken,
    GITHUB_REPO: githubRepo
  }, () => {
    showStatus("success", "✅ Settings saved successfully!");
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 3000);
  });
});

function showStatus(type, message) {
  statusDiv.className = type;
  statusDiv.textContent = message;
  statusDiv.style.display = "block";
}
