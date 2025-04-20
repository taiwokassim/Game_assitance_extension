chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "getBottle") {
    const name = document.querySelector("h1")?.innerText;
    const price = document.querySelector("[class*=price]")?.innerText;
    sendResponse({ name, price });
  }
});