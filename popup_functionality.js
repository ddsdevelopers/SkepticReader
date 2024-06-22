
let globalAbortController = new AbortController();





document.addEventListener('DOMContentLoaded', function () {
    const promptSelectionDropdown = document.getElementById('promptSelection');
    promptSelectionDropdown.addEventListener('change', handlePromptSelection);
    document.querySelector('.loader').style.display = 'inline-block'; //////
    triggerContentAnalysis("Please analyze the article below with the following points: -Bias analysis: Examine the language and tone used to identify any suggestive or emotionally charged words? Also, analyze the sources cited for their diversity and credibility. How well does the article balance different viewpoints, and what relevant facts or perspectives might it omit?  Check if the media outlet or the journalist may be biased by political affiliation or conflict of interests. -Logical Fallacies:  Pinpoint any common logical fallacies, such as ad hominem, straw man, appeal to authority, slippery slope, false dilemma, etc., within this article? For each fallacy identified, please provide an explanation of why it is considered a logical error and discuss its potential impact on the article's argument and credibility. -Counter Arguments Provide up to four counter-arguments that challenge the ideas presented in the article below. I'm interested in diverse perspectives that could come from different fields or lines of reasoning. For each counter-argument identified, please analyze its implications on the credibility and argumentation of the original article, offering insights into how these alternative viewpoints might provide a more nuanced understanding of the topic. Be concise and don’t repeat yourself. -Gaps of information: Identify any gaps where the article below may be lacking in information or context, assess the depth and quality of the research conducted, and evaluate the reliability and potential bias in the data presented? Make a bulleted list of insights. -Implications and Consequences: Discuss potential implications or consequences. Skip if none are apparent.  Make a bulleted list of insights.");
});



function handlePromptSelection() {

    globalAbortController.abort();
    globalAbortController = new AbortController();

    const promptSelectionDropdown = document.getElementById('promptSelection');
    const selectedOption = promptSelectionDropdown.value;

    let prompt;
    if (selectedOption === 'fullAnalysis') {
        prompt = "Please analyze the article below with the following points: -Bias analysis: Examine the language and tone used to identify any suggestive or emotionally charged words? Also, analyze the sources cited for their diversity and credibility. How well does the article balance different viewpoints, and what relevant facts or perspectives might it omit?  Check if the media outlet or the journalist may be biased by political affiliation or conflict of interests. -Logical Fallacies:  Pinpoint any common logical fallacies, such as ad hominem, straw man, appeal to authority, slippery slope, false dilemma, etc., within this article? For each fallacy identified, please provide an explanation of why it is considered a logical error and discuss its potential impact on the article's argument and credibility. -Counter Arguments Provide up to four counter-arguments that challenge the ideas presented in the article below. I'm interested in diverse perspectives that could come from different fields or lines of reasoning. For each counter-argument identified, please analyze its implications on the credibility and argumentation of the original article, offering insights into how these alternative viewpoints might provide a more nuanced understanding of the topic. Be concise and don’t repeat yourself. -Gaps of information: Identify any gaps where the article below may be lacking in information or context, assess the depth and quality of the research conducted, and evaluate the reliability and potential bias in the data presented? Make a bulleted list of insights. -Implications and Consequences: Discuss potential implications or consequences. Skip if none are apparent.  Make a bulleted list of insights.";
    } else if (selectedOption === 'counterarg') {
        prompt = "Provide up to four counter-arguments that challenge the ideas presented in the article below. I'm interested in diverse perspectives that could come from different fields or lines of reasoning. For each counter-argument identified, please analyze its implications on the credibility and argumentation of the original article, offering insights into how these alternative viewpoints might provide a more nuanced understanding of the topic. Be concise and don’t repeat yourself.";
    } else if (selectedOption === 'fall') {
        prompt = "Please analyze the article below with the two points: -Bias analysis: Examine the language and tone used to identify any suggestive or emotionally charged words? Also, analyze the sources cited for their diversity and credibility. How well does the article balance different viewpoints, and what relevant facts or perspectives might it omit?  Check if the media outlet or the journalist may be biased by political affiliation or conflict of interests. -Logical Fallacies:  Pinpoint any common logical fallacies, such as ad hominem, straw man, appeal to authority, slippery slope, false dilemma, etc., within this article? For each fallacy identified, please provide an explanation of why it is considered a logical error and discuss its potential impact on the article's argument and credibility. Make a bulleted list of insights.";
    } else if (selectedOption === 'criticalass') {
        prompt = "Identify any gaps where the article below may be lacking in information or context, assess the depth and quality of the research conducted, and evaluate the reliability and potential bias in the data presented? Make a bulleted list of insights.";
    } else if (selectedOption === 'summarize') {
        prompt = "Make a bulleted list summarizing the following article.";
    }

    triggerContentAnalysis(prompt);
}

function triggerContentAnalysis(promptType) {

    const output = document.getElementById('output');
    output.innerHTML = ''; // Clear the output box

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractContent' }, async function (response1) {
            const content = response1.extractedContent;
            const messages = [
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": `${promptType} The article I want you to analyze is: ${content}` }
            ];

            chrome.runtime.sendMessage({ action: 'processContent', content: messages, promptType: prompt, newOperation: true });
        });
    });
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    const output = document.getElementById('output');
    output.innerHTML = ''
    const loader = document.querySelector('.loader'); //////////

    if (message.action === 'updateText' && message.text) {
        accumulatedText = message.text;
        output.style = 'background-color: #F0F0F0; border-radius: 15px; width: 300px; min-height: 150px; max-height: 300px; margin: 0 auto; padding: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); position: relative; overflow-y: auto;';
        output.innerHTML = accumulatedText.replace(/\n/g, '<br>');

        loader.style.display = 'none'; ////

    } else if (message.action === 'finalText' && message.text) {
        console.log("final text ");
        output.style = 'background-color: #F0F0F0; border-radius: 15px; width: 300px; min-height: 150px; max-height: 300px; margin: 0 auto; padding: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); position: relative; overflow-y: auto;';
        output.innerHTML = message.text.replace(/\n/g, '<br>');
        accumulatedText = '';



    } else if (message.action === 'error') {
        loader.style.display = 'none';
        if (message.errorMessage.includes("BodyStreamBuffer was aborted")) {
            output.innerHTML = '';
        } else {
            switch (message.errorMessage) {
                case '{"code":"UNAUTHORIZED"}':
                    output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                    output.innerHTML = '<div style="text-align: center;">' +
                        '<img src="icon/error_copy.png" alt="Error Image" style="width:200px; display: block; margin: 10px auto;">' +
                        '<div>It seems that you are not connected to ChatGPT. Please ' +
                        '<a id="chatlink" target="_blank" href="https://chat.openai.com/auth/login">log in</a>, ' +
                        'refresh the page, and try again!</div>' +
                        '</div>';

                    break;
                case '{ code: "CLOUDFLARE" }':
                    output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                    output.innerHTML = '<img src="icon/error_copy.png" alt="Error Image" style="width:200px; margin: 0 auto;">I don’t know what is going on, but the plugin is not working, come later or reset your browser.';
                    break;
                case 'Failed to fetch':
                    output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                    output.innerHTML = '<img src="icon/noconnection.png" alt="Error Image" style="width:200px; margin: 0 auto;">Your internet network seems to be less reliable than William Hearstnews objectivity. Check your connection please.';
                    break;
                case ' DOMException: BodyStreamBuffer was aborted':
                    output.style = 'background-color: #F0F0F0; border-radius: 15px; width: 300px; min-height: 150px; max-height: 300px; margin: 0 auto; padding: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); position: relative; overflow-y: auto;';
                    output.innerHTML = ''
                    break;

                case 'CONTENT_ERROR':
                    output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                    output.innerHTML = '<img src="icon/no-read2.png" alt="Error Image" style="width:200px; margin: 0 auto;"><br>Ouch! I can’t read this article, try to find it in another website.';
                    break;
                case 'API_ERROR':
                    output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                    output.innerHTML = `<div style="text-align: center;">
                        <img src="icon/keynotfound.png" alt="Error Image" style="width:150px; margin: 0 auto;">
                        <p>Sorry, try again writing the API key; this one doesn’t work.</p>
                        <input class="apiKeyInput" type="text" id="apiKeyInput" placeholder="Enter API key here" style="margin-bottom: 10px;"/>
                        <button class= "submit" id="submit-api">Submit</button>
                    </div>`;
                    document.getElementById('submit-api').addEventListener('click', saveUserApiKey)
                    break;
                default:

                    if (output.innerHTML === '') {
                        output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
                        output.innerHTML = '<img src="icon/error_copy.png" alt="Error Image" style="width:200px; margin: 0 auto;">I don’t know what is going on, but the plugin is not working, come later or reset your browser.';
                    }
                    break;
            }
        }
    } 
    

});


function saveUserApiKey() {
    console.log("into saveUserapikey")
    const userApiKey = document.getElementById('apiKeyInput').value;
    if (userApiKey) {
        chrome.storage.local.set({ 'userAccessToken': userApiKey }, () => {

            triggerContentAnalysis("Please analyze the article below with the following points: -Bias analysis: Examine the language and tone used to identify any suggestive or emotionally charged words? Also, analyze the sources cited for their diversity and credibility. How well does the article balance different viewpoints, and what relevant facts or perspectives might it omit?  Check if the media outlet or the journalist may be biased by political affiliation or conflict of interests. -Logical Fallacies:  Pinpoint any common logical fallacies, such as ad hominem, straw man, appeal to authority, slippery slope, false dilemma, etc., within this article? For each fallacy identified, please provide an explanation of why it is considered a logical error and discuss its potential impact on the article's argument and credibility. -Counter Arguments Provide up to four counter-arguments that challenge the ideas presented in the article below. I'm interested in diverse perspectives that could come from different fields or lines of reasoning. For each counter-argument identified, please analyze its implications on the credibility and argumentation of the original article, offering insights into how these alternative viewpoints might provide a more nuanced understanding of the topic. Be concise and don’t repeat yourself. -Gaps of information: Identify any gaps where the article below may be lacking in information or context, assess the depth and quality of the research conducted, and evaluate the reliability and potential bias in the data presented? Make a bulleted list of insights. -Implications and Consequences: Discuss potential implications or consequences. Skip if none are apparent.  Make a bulleted list of insights.");
        });
    } else {
        output.style = 'display: flex; justify-content: center; flex-direction: column; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0);'
        output.innerHTML = `<div style="text-align: center;">
                        <img src="icon/keynotfound.png" alt="Error Image" style="width:150px; margin: 0 auto;">
                        <p style="margin-top: 0px;">Sorry, try again writing the API key; this one doesn’t work.</p>
                        <input class="apiKeyInput" type="text" id="apiKeyInput" placeholder="Enter API key here" style="margin-bottom: 10px;"/>
                        <button class= "submit" id="submit-api">Submit</button>
                    </div>`;
        document.getElementById('submit-api').addEventListener('click', saveUserApiKey)
    }
}


const closeButton = document.getElementById("closeButton");
closeButton.addEventListener("click", () => {
    window.close();
});





var x, i, j, l, ll, selElmnt, a, b, c;
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");

    for (j = 0; j < ll; j++) {
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    var event = new Event('change');
                    s.dispatchEvent(event);
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    this.parentNode.classList.add("select-hide");
                    h.classList.remove("select-arrow-active");

                    break;
                }
            }
            e.stopPropagation();
        });
        b.appendChild(c);
    }

    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}




function closeAllSelect(elmnt) {

    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

document.addEventListener("click", closeAllSelect);



