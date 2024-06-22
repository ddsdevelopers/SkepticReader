let globalAbortController = new AbortController();

//Insert your api key here!
const userAccessToken = 'YOUR_USER_API_KEY_HERE';


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('newMessage', request);

    if (request.action !== "processContent") return;

    if (!userAccessToken) {
        console.error("User API key is not set.");
        chrome.runtime.sendMessage({ action: "error", errorMessage: "API key is missing. Please set your API key in the code." });
        return;
    }

    try {
        const response = await callOpenAI(request.content, userAccessToken);
        // Handle the response if needed
    } catch (error) {
        console.error("Error in processing:", error.message);
        chrome.runtime.sendMessage({ action: "error" });
    }

    return true;
});

async function callOpenAI(messages, token) {
    const model = "gpt-4o";
    let partialText = "";

    globalAbortController.abort();
    globalAbortController = new AbortController();

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            signal: globalAbortController.signal,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true
            }),
        });
        console.log("response ", response);
        const reader = response.body.getReader();

        if (response.status === 401) {
            chrome.runtime.sendMessage({ action: "error", errorMessage: "API_ERROR" });
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const messages = chunk.split("\n").filter(msg => msg);
            for (const message of messages) {
                if (message === 'data: [DONE]') {
                    console.log('Stream ended');
                    chrome.runtime.sendMessage({ action: "finalText", text: partialText });
                    break;
                }

                const jsonPart = message.startsWith('data: ') ? message.substring(6) : null;
                if (!jsonPart) continue;

                let data;
                try {
                    data = JSON.parse(jsonPart);
                    const text = data.choices[0].delta.content;
                    if (text) {
                        partialText += text;

                        chrome.runtime.sendMessage({ action: "updateText", text: partialText });
                    }
                } catch (ex) {
                    console.error("JSON parsing of response failed:", ex);
                    continue; // Skip this message
                }
            }
        }

    } catch (error) {
        console.error("Error in callOpenAI:", error);
        throw error;
    }
}
