chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "uploadWithReview") {
    await handleUploadWithReview(message);
  }
});

async function handleUploadWithReview(message) {
  const { title, code, questionBody, folder, url } = message;

  try {
    // Notify popup about code review
    chrome.runtime.sendMessage({
      status: "processing",
      message: "Getting code review from Ollama..."
    }).catch(() => {}); // Ignore errors if popup is closed

    // Get code review
    const googleReview = await getGoogleReview(code, title);

    // Format as markdown
    const markdown = formatAsMarkdown(title, questionBody, code, googleReview);

    // Upload to GitHub
    chrome.runtime.sendMessage({
      status: "processing",
      message: "Uploading to GitHub..."
    }).catch(() => {});

    const filePath = `${folder}/${title}.md`;
    
    // Convert markdown to UTF-8 safe base64
    const contentBase64 = btoa(unescape(encodeURIComponent(markdown)));

    // Get GitHub token from storage
    const githubToken = await getConfigValue("GITHUB_TOKEN");
    const githubRepo = await getConfigValue("GITHUB_REPO") || "Ojaswin30/Leetcode";

    if (!githubToken) {
      throw new Error("GitHub token not configured. Please go to extension settings.");
    }

    // First, try to get the existing file to get its SHA
    let sha = null;
    try {
      const getResponse = await fetch(
        "https://api.github.com/repos/" + githubRepo + "/contents/" + filePath,
        {
          method: "GET",
          headers: {
            Authorization: `token ${githubToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
        console.log("File exists, using SHA:", sha);
      }
    } catch (e) {
      console.log("File doesn't exist, creating new one");
    }

    // Now upload/update the file
    const uploadBody = {
      message: `Add ${title} solution with code review`,
      content: contentBase64,
    };

    if (sha) {
      uploadBody.sha = sha; // Include SHA if file exists
    }

    const response = await fetch(
      "https://api.github.com/repos/" + githubRepo + "/contents/" + filePath,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadBody),
      }
    );

    if (response.ok) {
      chrome.runtime.sendMessage({
        status: "success",
        message: `Repository updated! Solution saved to ${folder}/${title}.md`
      }).catch(() => {});
    } else {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
    chrome.runtime.sendMessage({
      status: "error",
      message: error.message || "Failed to process solution"
    }).catch(() => {});
  }
}

async function getGoogleReview(code, title) {
  // Ollama runs locally - no API key needed
  const OLLAMA_URL = "http://localhost:11434/api/generate";

  try {
    const prompt = `Review this LeetCode solution for "${title}":

${code}

Provide brief feedback on: code quality, complexity, edge cases, improvements.`;

    console.log("Sending request to Ollama...");
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt
      })
    });

    console.log("Ollama response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("Ollama error response:", text);
      
      if (response.status === 403) {
        return "[⚠️ Ollama blocked the request. Try: ollama pull mistral]";
      } else if (response.status === 404) {
        return "[⚠️ Ollama API endpoint not found. Make sure Ollama is running]";
      }
      return `[⚠️ Ollama error ${response.status}]`;
    }

    const data = await response.json();
    console.log("Ollama response received");
    
    if (data.response) {
      return data.response.trim();
    } else {
      return "[⚠️ No response from Ollama]";
    }
  } catch (error) {
    console.error("Error calling Ollama:", error);
    return `[⚠️ Cannot reach Ollama at localhost:11434. Make sure to run: ollama serve]`;
  }
}

async function getConfigValue(key) {
  // Try to get from chrome storage first
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      if (result[key]) {
        resolve(result[key]);
      } else {
        resolve(null);
      }
    });
  });
}

function formatAsMarkdown(title, questionBody, code, googleReview) {
  return `# ${title}

## Problem Description

${questionBody || "[Description not available]"}

---

## My Solution

\`\`\`python
${code}
\`\`\`

---

## Code Review - Ollama

${googleReview}

---

*Uploaded and reviewed on ${new Date().toLocaleString()}*
`;
}
