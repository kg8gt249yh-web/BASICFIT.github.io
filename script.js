(() => {
  // Prix animé façon "roulette", puis stabilisation sur 15 €.
  const price = document.getElementById("heroPrice");
  if (price) {
    let frame = 0;
    const timer = setInterval(() => {
      price.textContent = String(Math.floor(Math.random() * 90) + 10);
      frame++;
      if (frame > 24) {
        clearInterval(timer);
        price.textContent = "15";
      }
    }, 55);
  }

  // Apparition progressive des sections au scroll.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Chatbot FAQ, recherche simple dans les 199 Q/R fournies.
  const data = Array.isArray(window.FAQ_DATA) ? window.FAQ_DATA : [];
  const chat = document.getElementById("chat");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const suggestions = document.getElementById("suggestions");

  const normalize = (s) => s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\p{L}\p{N}\s€]/gu," ")
    .split(/\s+/).filter(Boolean);

  const stop = new Set(["le","la","les","un","une","des","de","du","d","a","au","aux","et","ou","en","pour","avec","est","sont","je","tu","mon","ma","mes","que","quoi","comment","quel","quelle","quels","quelles","y","il","elle","on","dans","sur","pas","ce","cette","ces","combien"]);

  function score(query, item) {
    const q = normalize(query).filter(w => !stop.has(w));
    const hay = normalize(item.q + " " + item.a);
    if (!q.length) return 0;
    let hit = 0;
    q.forEach(word => {
      if (hay.includes(word)) hit += word.length >= 5 ? 2 : 1;
    });
    const exact = item.q.toLowerCase().includes(query.toLowerCase()) ? 8 : 0;
    return hit + exact;
  }

  function answer(query) {
    if (!data.length) return "Je n'ai pas encore accès à la base FAQ.";
    const ranked = data.map(item => ({item, s:score(query,item)})).sort((a,b)=>b.s-a.s);
    if (!ranked[0] || ranked[0].s < 2) {
      return "Je n'ai pas trouvé de réponse suffisamment proche dans la base FAQ. Essaie une question sur le prix, les clubs, les avantages Ultimate, l'invité, Yanga, le gel ou le paiement.";
    }
    return ranked[0].item.a;
  }

  function addBubble(text, who) {
    const el = document.createElement("div");
    el.className = "bubble " + who;
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  const popular = ["Combien coûte l'Ultimate ?", "Puis-je inviter un ami ?", "L'Ultimate fonctionne-t-il en Europe ?", "Comment trouver un club ?", "Yanga est-il inclus ?", "Comment fonctionne le gel ?"];
  popular.forEach(q => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = q;
    b.addEventListener("click", () => { input.value=q; form.requestSubmit(); });
    suggestions.appendChild(b);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addBubble(q, "user");
    input.value = "";
    setTimeout(() => addBubble(answer(q), "bot"), 220);
  });
})();