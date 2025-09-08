// -------- LOGIN --------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const loginError = document.getElementById("loginError");
  const emailInput = document.getElementById("email");

  // Fuerza minúsculas mientras el usuario escribe (sin mover el cursor)
  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      const pos = e.target.selectionStart;
      e.target.value = e.target.value.toLowerCase();
      // restaura la posición del cursor
      e.target.setSelectionRange(pos, pos);
    });
  }

  const showError = () => { if (loginError) loginError.classList.remove("d-none"); };
  const hideError = () => { if (loginError) loginError.classList.add("d-none"); };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const email = (emailInput?.value || "").trim().toLowerCase();
    const password = (document.getElementById("password")?.value || "").trim();

    // Caso admin -> admin.html (email y pass en minúsculas)
    if (email === "admin@rotiya.com" && password === "admin") {
      window.location.href = "admin.html";
      return;
    }

    // Usuario normal válido (insensible a mayúsculas) -> menu.html
    if (email === "rotiya@gmail.com" && password === "1234") {
      alert("✅ Bienvenido a RotiYa!"); 
      window.location.href = "menu.html";
      return;
    }

    // Cualquier otra combinación (incluye vacíos) -> falla
    showError();
  });
}



// -------- REGISTRO --------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (pass !== confirm) {
      alert("❌ Las contraseñas no coinciden");
    } else {
      alert("✅ Registro exitoso");
      window.location.href = "menu.html"; // redirigir al menú
    }
  });
}

// -------- MENÚ (botones Añadir) --------
const botones = document.querySelectorAll(".add-to-cart");
if (botones) {
  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      alert("✅ Producto añadido al carrito");
      // acá podrías aumentar el contador del carrito
    });
  });
}

// -------- CARRITO --------
// const cartCount = document.getElementById("cart-count");
// const confirmButton = document.querySelector(".btn-success");

// if (confirmButton && cartCount) {
//   confirmButton.addEventListener("click", () => {
//     alert("✅ Pedido confirmado");
//     cartCount.textContent = "0"; // vaciar carrito
//   });
// }



const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = document.getElementById("product").value;
    const text = document.getElementById("reviewText").value;

    if (product && text) {
      // Crear nueva reseña en la lista
      const newReview = document.createElement("div");
      newReview.classList.add("list-group-item");
      newReview.innerHTML = `
        <h6 class="mb-1">${product}</h6>
        <small class="text-muted">Usuario</small>
        <p class="mb-1">${text}</p>
      `;

      const listGroup = document.querySelector(".list-group");
      listGroup.appendChild(newReview);

      // Limpiar formulario
      reviewForm.reset();

      alert("✅ Tu reseña fue publicada");
    }
  });
}

function showAdminPage(pageId) {
  document.querySelectorAll(".admin-page").forEach(page => page.classList.add("d-none"));
  document.getElementById(pageId).classList.remove("d-none");
}

// Mostrar u ocultar campos de tarjeta según método de pago
const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
  const paymentMethod = document.getElementById("paymentMethod");
  const cardData = document.getElementById("cardData");

  paymentMethod.addEventListener("change", () => {
    if (paymentMethod.value === "tarjeta" || paymentMethod.value === "debito") {
      cardData.classList.remove("d-none");
    } else {
      cardData.classList.add("d-none");
    }
  });

  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ Pago realizado con éxito. ¡Gracias por tu compra!");
    window.location.href = "menu.html"; // redirige al menú
  });
}
