// ============================================
// HODARI — script.js
// ============================================

const WEBHOOK_URL = "";
const WHATSAPP_NUMBER = "5541999999999";
const WHATSAPP_MSG = "Oi Luan! Acabei de preencher o formulário da Hodari.";

const estado = {
  etapaAtual: 0,
  totalEtapas: 4,
  respostas: { desafio: "", tipo_negocio: "", tamanho: "", nome: "", whatsapp: "", negocio: "", cidade: "" }
};

// ============================================
// TELA DE ENTRADA
// ============================================
function iniciarWizard() {
  document.querySelector('[data-etapa="0"]').classList.remove("ativa");
  document.querySelector(".wizard-progress").style.opacity = "1";
  document.querySelector(".scroll-hint")?.style.setProperty("opacity", "0");
  // Esconde cards flutuantes ao iniciar o questionário
  document.getElementById("floatCards")?.style.setProperty("opacity", "0.3");
  estado.etapaAtual = 1;
  mostrarEtapa(1);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".wizard-progress").style.opacity = "0";
  document.querySelector(".wizard-progress").style.transition = "opacity 0.4s ease";
});

// ============================================
// NAV scroll
// ============================================
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 80);
});

// ============================================
// PARALLAX nos cards flutuantes
// ============================================
const floatCards = document.querySelectorAll(".float-card");
let mouseX = 0, mouseY = 0, scrollY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  aplicarParallax();
});

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  aplicarParallax();
});

function aplicarParallax() {
  floatCards.forEach(card => {
    const speed = parseFloat(card.dataset.speed) || 1;
    const x = mouseX * speed * 6;
    const y = mouseY * speed * 6 + scrollY * speed * 0.08;
    card.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// ============================================
// TILT 3D nos cards de serviço
// ============================================
const tiltCards = document.querySelectorAll("[data-tilt]");
tiltCards.forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateY(0)";
  });
});

// ============================================
// WIZARD
// ============================================
function atualizarProgresso() {
  document.querySelectorAll(".progress-dot").forEach((dot, i) => {
    dot.classList.remove("ativo", "completo");
    if (i + 1 === estado.etapaAtual) dot.classList.add("ativo");
    if (i + 1 < estado.etapaAtual) dot.classList.add("completo");
  });
}

function mostrarEtapa(numero) {
  document.querySelectorAll(".wizard-etapa").forEach(e => e.classList.remove("ativa"));
  document.querySelector(".wizard-final")?.classList.remove("ativa");
  if (numero > estado.totalEtapas) { finalizarWizard(); return; }
  const etapa = document.querySelector(`[data-etapa="${numero}"]`);
  if (etapa) etapa.classList.add("ativa");
  estado.etapaAtual = numero;
  atualizarProgresso();
}

document.querySelectorAll(".wizard-opcao").forEach(opcao => {
  opcao.addEventListener("click", () => {
    const etapa = opcao.closest(".wizard-etapa");
    const campo = etapa.dataset.campo;
    etapa.querySelectorAll(".wizard-opcao").forEach(o => o.classList.remove("selecionada"));
    opcao.classList.add("selecionada");
    estado.respostas[campo] = opcao.dataset.valor;
    setTimeout(() => mostrarEtapa(estado.etapaAtual + 1), 280);
  });
});

document.querySelectorAll(".btn-proximo").forEach(btn => {
  btn.addEventListener("click", () => {
    const etapa = btn.closest(".wizard-etapa");
    if (etapa.querySelector("input")) {
      const campos = etapa.querySelectorAll("input[required]");
      let valido = true;
      campos.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "#C44";
          valido = false;
          setTimeout(() => input.style.borderColor = "", 1500);
        } else { estado.respostas[input.dataset.campo] = input.value.trim(); }
      });
      if (!valido) return;
      etapa.querySelectorAll("input").forEach(input => {
        if (input.dataset.campo) estado.respostas[input.dataset.campo] = input.value.trim();
      });
    }
    mostrarEtapa(estado.etapaAtual + 1);
  });
});

document.querySelectorAll(".btn-voltar").forEach(btn => {
  btn.addEventListener("click", () => {
    if (estado.etapaAtual > 1) mostrarEtapa(estado.etapaAtual - 1);
  });
});

const inputWpp = document.querySelector('input[data-campo="whatsapp"]');
if (inputWpp) {
  inputWpp.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    e.target.value = v;
  });
}

async function finalizarWizard() {
  document.querySelectorAll(".wizard-etapa").forEach(e => e.classList.remove("ativa"));
  document.querySelector(".wizard-progress").style.opacity = "0";
  const final = document.querySelector(".wizard-final");
  final.classList.add("ativa");
  const primeiroNome = (estado.respostas.nome || "você").split(" ")[0];
  document.querySelector(".final-nome").textContent = primeiroNome + "!";
  const msg = encodeURIComponent(WHATSAPP_MSG);
  document.querySelector("#btn-final-wpp").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...estado.respostas, timestamp: new Date().toISOString(), origem: "Site Hodari" })
      });
    } catch (err) { console.warn("Webhook:", err); }
  }
}

// ============================================
// REVEAL ON SCROLL
// ============================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visivel"); });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

mostrarEtapa(0);
