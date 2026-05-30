/* ============================================
   HODARI MARKETING ESTRATÉGICO
   script.js — Lógica principal
   ============================================ */

// =============================================
// CONFIGURAÇÕES — edite aqui
// =============================================
const WEBHOOK_URL = ""; // cole aqui sua URL do Make/n8n
const WHATSAPP_NUMBER = "5541999999999"; // seu número com DDI+DDD
const WHATSAPP_MSG = "Oi Luan! Acabei de preencher o formulário da Hodari.";

// =============================================
// ESTADO DO WIZARD
// =============================================
const estado = {
  etapaAtual: 1,
  totalEtapas: 4,
  respostas: {
    tipo_negocio: "",
    necessidade: "",
    orcamento: "",
    nome: "",
    whatsapp: "",
    negocio: "",
    cidade: ""
  }
};

// =============================================
// CURSOR CUSTOMIZADO
// =============================================
const cursor = document.querySelector(".cursor");
const cursorRing = document.querySelector(".cursor-ring");

if (cursor && cursorRing) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    setTimeout(() => {
      cursorRing.style.left = e.clientX + "px";
      cursorRing.style.top = e.clientY + "px";
    }, 80);
  });

  document.querySelectorAll("a, button, .wizard-opcao").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(2)";
      cursorRing.style.width = "48px";
      cursorRing.style.height = "48px";
      cursorRing.style.borderColor = "rgba(107, 0, 245, 0.6)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursorRing.style.width = "32px";
      cursorRing.style.height = "32px";
      cursorRing.style.borderColor = "rgba(107, 0, 245, 0.4)";
    });
  });
}

// =============================================
// NAV — efeito ao rolar
// =============================================
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// =============================================
// WIZARD — LÓGICA PRINCIPAL
// =============================================
function atualizarProgresso() {
  document.querySelectorAll(".progress-dot").forEach((dot, i) => {
    dot.classList.remove("ativo", "completo");
    if (i + 1 === estado.etapaAtual) dot.classList.add("ativo");
    if (i + 1 < estado.etapaAtual) dot.classList.add("completo");
  });
}

function mostrarEtapa(numero) {
  // Esconde todas as etapas
  document.querySelectorAll(".wizard-etapa").forEach(e => e.classList.remove("ativa"));
  document.querySelector(".wizard-final")?.classList.remove("ativa");

  if (numero > estado.totalEtapas) {
    // Mostra tela final
    finalizarWizard();
    return;
  }

  const etapa = document.querySelector(`[data-etapa="${numero}"]`);
  if (etapa) {
    etapa.classList.add("ativa");
  }

  estado.etapaAtual = numero;
  atualizarProgresso();
}

// Seleção de opções
document.querySelectorAll(".wizard-opcao").forEach(opcao => {
  opcao.addEventListener("click", () => {
    const etapa = opcao.closest(".wizard-etapa");
    const campo = etapa.dataset.campo;

    // Remove seleção anterior na mesma etapa
    etapa.querySelectorAll(".wizard-opcao").forEach(o => o.classList.remove("selecionada"));
    opcao.classList.add("selecionada");

    // Salva resposta
    estado.respostas[campo] = opcao.dataset.valor;

    // Avança automaticamente após delay visual
    setTimeout(() => {
      mostrarEtapa(estado.etapaAtual + 1);
    }, 280);
  });
});

// Botão próximo (etapa de campos)
document.querySelectorAll(".btn-proximo").forEach(btn => {
  btn.addEventListener("click", () => {
    const etapa = btn.closest(".wizard-etapa");

    // Valida campos obrigatórios se for a etapa de texto
    if (etapa.querySelector("input")) {
      const campos = etapa.querySelectorAll("input[required]");
      let valido = true;

      campos.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "#ff4444";
          valido = false;
          setTimeout(() => input.style.borderColor = "", 1500);
        } else {
          // Salva valor
          estado.respostas[input.dataset.campo] = input.value.trim();
        }
      });

      if (!valido) return;

      // Salva todos os campos
      etapa.querySelectorAll("input").forEach(input => {
        if (input.dataset.campo) {
          estado.respostas[input.dataset.campo] = input.value.trim();
        }
      });
    }

    mostrarEtapa(estado.etapaAtual + 1);
  });
});

// Botão voltar
document.querySelectorAll(".btn-voltar").forEach(btn => {
  btn.addEventListener("click", () => {
    if (estado.etapaAtual > 1) {
      mostrarEtapa(estado.etapaAtual - 1);
    }
  });
});

// Máscara de telefone
const inputWhatsapp = document.querySelector('input[data-campo="whatsapp"]');
if (inputWhatsapp) {
  inputWhatsapp.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    }
    e.target.value = v;
  });
}

// =============================================
// FINALIZAR WIZARD
// =============================================
async function finalizarWizard() {
  // Esconde etapas e progresso
  document.querySelectorAll(".wizard-etapa").forEach(e => e.classList.remove("ativa"));
  document.querySelector(".wizard-progress").style.opacity = "0";

  // Mostra tela final
  const final = document.querySelector(".wizard-final");
  final.classList.add("ativa");

  // Personaliza com o nome
  const nome = estado.respostas.nome || "você";
  const primeiroNome = nome.split(" ")[0];
  document.querySelector(".final-nome").textContent = primeiroNome + "!";

  // Monta link WhatsApp
  const msg = encodeURIComponent(WHATSAPP_MSG);
  document.querySelector(".btn-whatsapp").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

  // Envia para webhook se configurado
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...estado.respostas,
          timestamp: new Date().toISOString(),
          origem: "Site Hodari — Wizard"
        })
      });
    } catch (err) {
      console.warn("Webhook não enviado:", err);
    }
  }
}

// =============================================
// FADE IN AO ROLAR
// =============================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visivel");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));

// =============================================
// INICIALIZA
// =============================================
mostrarEtapa(1);
