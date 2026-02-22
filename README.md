# 📝 LeetCode Solution Uploader

A Chrome extension that automatically uploads your LeetCode solutions to GitHub with AI-powered code reviews from ChatGPT.

## ✨ Features

- 🎯 **One-click upload** - Save your LeetCode solutions directly to GitHub
- 🤖 **ChatGPT code review** - Get automatic code reviews for every solution
- 📊 **Markdown formatting** - Solutions saved with problem description, your code, and ChatGPT's review
- 🎨 **Beautiful UI** - Modern, responsive interface with real-time status updates
- 🏷️ **Difficulty sorting** - Organize solutions by Easy/Medium/Hard
- 🔐 **Secure** - API keys stored locally in Chrome sync storage

## 📦 Installation

### 1. Clone or Download this Repository
```bash
git clone https://github.com/Ojaswin30/chromeExtension_QuestionAutoUploader.git
cd chromeExtension_QuestionAutoUploader
```

### 2. Set Up API Keys

You'll need:
- **OpenAI API Key** (for ChatGPT code reviews)
- **GitHub Personal Access Token** (to upload files)

#### Get OpenAI API Key:
1. Visit https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't see it again!)

#### Get GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (full control of private repositories)
4. Generate and copy the token

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Navigate to the `Extension` folder and select it

### 4. Configure Settings

1. Right-click the extension icon
2. Click **"Options"**
3. Enter your:
   - OpenAI API Key
   - GitHub Personal Access Token
   - GitHub Repository (format: `username/repo-name`)
4. Click **"Save Settings"**

## 🚀 Usage

1. **Open a LeetCode problem** (https://leetcode.com/problems/...)
2. **Write or paste your solution** in the code editor
3. **Click the extension icon** and select difficulty level
4. **Click "Upload & Review with ChatGPT"**
5. ✅ Solution will be uploaded to your repository!

## 📁 File Structure

```
Extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup UI
├── popup.js              # Popup logic
├── background.js         # Background service worker (handles API calls)
├── settings.html         # Settings page for API keys
├── settings.js           # Settings logic
├── config.example.js     # Example configuration
└── README.md             # This file
```

## 📋 Output Format

Solutions are saved as `.md` files with this format:

```markdown
# Problem Title

## Problem Description
[Full problem statement from LeetCode]

---

## My Solution
\`\`\`python
[Your code here]
\`\`\`

---

## Code Review - ChatGPT
[ChatGPT's code review with feedback on:
 - Code quality and readability
 - Time and space complexity
 - Edge cases
 - Possible improvements]
```

## 🔒 Security & Privacy

- ✅ API keys are stored **locally** in Chrome sync storage
- ✅ Keys are **never** sent to external servers (except to their respective APIs)
- ✅ `.gitignore` prevents accidental commit of config files
- ✅ GitHub token requires explicit scopes
- ✅ **Never commit your API keys** to git!

## 🛠️ Troubleshooting

### "API key not configured" error
- Go to extension settings (`chrome://extensions/` → right-click extension → Options)
- Make sure you've saved your OpenAI API Key

### "GitHub token not configured" error
- Go to extension settings
- Make sure you've saved your GitHub Personal Access Token
- Verify the token hasn't expired

### "GitHub API error" on upload
- Check that your GitHub repository exists
- Verify your GitHub token has `repo` scope
- Ensure the token hasn't expired

### Questions not being extracted
- Make sure you're on a valid LeetCode problem page
- Try refreshing the page
- Check the browser console for errors

## 📝 Example Output

A solution file might look like:

```markdown
# Two Sum

## Problem Description
Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

---

## My Solution
\`\`\`python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

---

## Code Review - ChatGPT
Your solution is excellent! Here are my observations:

**✅ Strengths:**
- Time Complexity: O(n) - excellent!
- Space Complexity: O(n) - optimal
- Clean and readable code

**💡 Suggestions:**
- Consider adding type hints for production code
- Add docstring to explain the algorithm
```

## 🤝 Contributing

Feel free to fork and improve this project!

## ⚠️ Important Notes

- **Create a separate GitHub repo** for your solutions
- **Keep your API keys safe** - treat them like passwords
- **Monitor your OpenAI usage** - ChatGPT reviews use credits
- **Test with one solution first** before uploading many

## 📄 License

MIT License - feel free to use this project

---

**Happy coding! 🚀**
