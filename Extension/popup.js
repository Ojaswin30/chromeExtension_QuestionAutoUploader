const uploadBtn = document.getElementById("uploadBtn");
const statusDiv = document.getElementById("status");

uploadBtn.addEventListener("click", async () => {
    const selectFolder = document.getElementById("folderSelect").value;
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    
    const tab = tabs[0];
    uploadBtn.disabled = true;
    showStatus("loading", "<span class='spinner'></span>Extracting question data...");

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: extractQuestionData,
        args: [selectFolder]
    });
});

// Settings link handler
const settingsLink = document.querySelector('a[href="settings.html"]');
if (settingsLink) {
    settingsLink.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
}

chrome.runtime.onMessage.addListener((response) => {
    if (response.status === "processing") {
        showStatus("loading", `<span class='spinner'></span>${response.message}`);
    } else if (response.status === "success") {
        showStatus("success", response.message);
        uploadBtn.disabled = false;
        setTimeout(() => window.close(), 2000);
    } else if (response.status === "error") {
        showStatus("error", response.message);
        uploadBtn.disabled = false;
    }
});

function showStatus(type, message) {
    statusDiv.className = type;
    statusDiv.innerHTML = message;
}

function extractQuestionData(folder) {
    // Find the title
    const titleElement = document.querySelector('[class*="title"]');
    if (!titleElement) {
        chrome.runtime.sendMessage({
            status: "error",
            message: "Could not find question title"
        });
        return;
    }
    
    let title = titleElement.innerText?.trim() || "Untitled";
    title = title.replace(/^\d+\.\s+/, '');
    
    console.log("Extracted title:", title);
    
    // Extract question body - aggressive noise filtering
    let questionBody = "";
    
    // Find text blocks that contain the problem description
    const allElements = document.querySelectorAll('div, article, section, p');
    let foundDescription = false;
    
    for (let elem of allElements) {
        let text = elem.innerText?.trim();
        if (!text || text.length < 100) continue;
        
        // These are metadata/UI sections - skip them
        if (text.includes("Similar Questions") || 
            text.includes("Hint 1") || text.includes("Hint 2") || text.includes("Hint 3") ||
            text.includes("Seen this question in a real interview") ||
            text.includes("Acceptance Rate") ||
            text.includes("Problem List") || 
            text.includes("Appearance") || 
            text.includes("Sign Out") ||
            text.includes("My Playgrounds")) {
            continue;
        }
        
        // Skip metadata tags
        if (text.includes("Solved") && text.includes("Easy") && text.includes("Topics") && 
            text.length < 500) {
            continue;
        }
        
        // Look for the actual problem description
        // It typically starts with "Given" or "You" and contains Examples + Constraints
        if ((text.includes("Given ") || text.includes("You ")) && 
            text.includes("Example") && 
            text.includes("Constraints") &&
            text.length > 300) {
            
            // Clean the text
            let lines = text.split('\n').map(line => {
                let trimmed = line.trim();
                
                // Skip lines that are UI noise
                if (trimmed.includes("Solved") || trimmed.includes("Easy") ||
                    trimmed.includes("Topics") || trimmed.includes("Companies") ||
                    trimmed.includes("Hint") || trimmed.includes("Similar") ||
                    trimmed === "Yes" || trimmed === "No" ||
                    trimmed.includes("Accept") || trimmed.includes("Interview")) {
                    return null;
                }
                
                return trimmed ? trimmed : null;
            }).filter(line => line !== null);
            
            questionBody = lines.join('\n').substring(0, 2500);
            foundDescription = true;
            console.log("Found clean problem description");
            break;
        }
    }
    
    // Find the code - more flexible extraction
    let code = "";
    
    // Try textarea first (most reliable)
    const allTextareas = document.querySelectorAll('textarea');
    for (let ta of allTextareas) {
        let text = ta.value?.trim() || "";
        // Accept ANY non-trivial code (>20 chars is likely code, not just UI text)
        if (text && text.length > 10) {
            code = text;
            console.log("✓ Found code in textarea, length:", code.length);
            break;
        }
    }
    
    // If no textarea, try contenteditable areas (Monaco/CodeMirror)
    if (!code) {
        const editableDivs = document.querySelectorAll('[contenteditable="true"], [role="textbox"]');
        for (let div of editableDivs) {
            let text = div.textContent?.trim() || "";
            if (text && text.length > 10 && !text.includes("codicon")) {
                code = text;
                console.log("✓ Found code in contenteditable, length:", code.length);
                break;
            }
        }
    }
    
    // Last resort: Look in pre/code elements, take the largest one
    if (!code) {
        const preElements = document.querySelectorAll('pre, code');
        let largestCode = "";
        
        for (let elem of preElements) {
            let text = elem.textContent?.trim() || "";
            // Skip if it's in the problem description area or example
            if (text && text.length > 10 && !text.includes("Input:") && !text.includes("Output:") && !text.includes("Example")) {
                if (text.length > largestCode.length) {
                    largestCode = text;
                }
            }
        }
        
        if (largestCode) {
            code = largestCode;
            console.log("✓ Found code in pre block, length:", code.length);
        }
    }
    
    if (!code) {
        console.log("❌ No code found - check console for debug info");
    }

    chrome.runtime.sendMessage({
        action: "uploadWithReview",
        title: title,
        code: code || "[No code found in editor]",
        questionBody: questionBody || "[Problem description not found]",
        folder: folder,
        url: window.location.href
    });
}

function extractQuestionDescription() {
    // Try multiple selectors to find the question description
    const descSelectors = [
        '[class*="description"]',
        '[data-testid="description"]',
        'article',
        '[class*="content"]'
    ];
    
    for (let selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.innerText.trim();
        }
    }
    
    return "";
}