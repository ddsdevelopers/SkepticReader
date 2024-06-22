console.log("content script running");

function extractReadableContent() {
    let content = '';
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
        content += p.innerText + '\n';
    });
    return content;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractContent') {
        const content = extractReadableContent();
        console.log("text content:", content)
        if (content.trim() === '') {
            chrome.runtime.sendMessage({ action: "error", errorMessage: "CONTENT_ERROR" });
        } else {
            sendResponse({ extractedContent: content });
            
        }
    } 

});

console.log("content script finish running");
