function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function findBestMatch(name, list) {
  let best = null, score = Infinity;
  list.forEach(item => {
    let dist = levenshtein(name.toLowerCase(), item.name.toLowerCase());
    if (dist < score) {
      score = dist;
      best = item;
    }
  });
  return best;
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  chrome.scripting.executeScript(
    { target: { tabId: tabs[0].id }, function: () => {
      return {
        name: document.querySelector("h1")?.innerText || "Unknown",
        price: document.querySelector("[class*=price]")?.innerText || "N/A"
      };
    }},
    async (injectionResults) => {
      const result = injectionResults[0].result;
      document.getElementById("bottleInfo").innerText = `${result.name} - ${result.price}`;

      const baxusData = await fetch(`https://api.baxus.co/search?q=${encodeURIComponent(result.name)}`).then(res => res.json());
      const match = findBestMatch(result.name, baxusData.items || []);
      
      if (match) {
        const link = document.createElement('a');
        link.href = match.url;
        link.innerText = `See BAXUS: ${match.name} @ ${match.price}`;
        link.target = "_blank";
        document.getElementById("bottleInfo").appendChild(link);
      } else {
        document.getElementById("bottleInfo").append("No match found on BAXUS.");
      }
    }
  );
});