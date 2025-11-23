// === CONFIG: pega aquí tu URL del WebApp (Apps Script) ===
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz7g5UoOIP6zHIUWDL-nisU3MyoU7cj-A8p4lU2nLdX4M7dSjijMYoBvhFiBmsFBL6VEQ/exec";

// === LOGIN SIMPLE (cliente-side de prueba) ===
const CRED_USER = "ZR2602";
const CRED_PASS = "260201";

// Estado de la "venta" actual
let lista = [];

document.addEventListener("DOMContentLoaded", () => {
  // login screen
  const loginScreen = document.getElementById("login-screen");
  const app = document.getElementById("app");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");

  btnLogin.addEventListener("click", () => {
    const u = document.getElementById("user").value;
    const p = document.getElementById("pass").value;
    if (u === CRED_USER && p === CRED_PASS) {
      localStorage.setItem("logueado", "1");
      loginScreen.style.display = "none";
      app.style.display = "";
      document.getElementById("codigo").focus();
    } else {
      alert("Credenciales incorrectas (prueba admin / 1234)");
    }
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("logueado");
    location.reload();
  });

  if (localStorage.getItem("logueado")) {
    loginScreen.style.display = "none";
    app.style.display = "";
    document.getElementById("codigo").focus();
  }

  // Inputs y botones
  const inputCodigo = document.getElementById("codigo");
  const inputCantidad = document.getElementById("cantidad");
  const btnAgregar = document.getElementById("btnAgregar");
  const btnRegistrarEntrada = document.getElementById("btnRegistrarEntrada");
  const btnRegistrarSalida = document.getElementById("btnRegistrarSalida");
  const status = document.getElementById("status");

  // añadir al presionar Enter en el input (simula lector)
  inputCodigo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarYAgregar(inputCodigo.value.trim(), Number(inputCantidad.value) || 1);
    }
  });

  btnAgregar.addEventListener("click", () => {
    buscarYAgregar(inputCodigo.value.trim(), Number(inputCantidad.value) || 1);
  });

  btnRegistrarEntrada.addEventListener("click", () => {
    registrarOperacion("entrada");
  });

  btnRegistrarSalida.addEventListener("click", () => {
    registrarOperacion("salida");
  });

  renderTabla();

  // Elimina fila
  document.querySelector("#tabla tbody").addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("eliminar")) {
      const idx = Number(e.target.dataset.idx);
      lista.splice(idx, 1);
      renderTabla();
    }
  });

  // FUNCIONES
  async function buscarYAgregar(codigo, cantidad) {
    status.textContent = "Buscando...";
  
    return new Promise((resolve) => {
      const callbackName = "cb_" + Date.now();
  
      window[callbackName] = function(json) {
        delete window[callbackName];
  
        if (!json.ok) {
          status.textContent = "Producto no encontrado.";
          lista.push({ codigo, nombre:"(sin nombre)", cantidad, precio:0, subtotal:0 });
        } else {
          const p = json.producto;
          const precio = Number(p.precio) || 0;
          const nombre = p.nombre;
          const subtotal = Number((precio * cantidad).toFixed(2));
  
          lista.push({ codigo, nombre, cantidad, precio, subtotal });
          status.textContent = `Agregado: ${nombre}`;
        }
  
        renderTabla();
        resolve();
      };
  
      const s = document.createElement("script");
      s.src = `${WEBAPP_URL}?accion=buscar&codigo=${codigo}&callback=${callbackName}`;
      document.body.appendChild(s);
    });
  }



  function renderTabla() {
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";
    let total = 0;
    lista.forEach((it, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${it.codigo}</td>
                      <td>${it.nombre}</td>
                      <td>${it.cantidad}</td>
                      <td>${(it.precio||0).toFixed(2)}</td>
                      <td>${(it.subtotal||0).toFixed(2)}</td>
                      <td><button class="eliminar" data-idx="${i}">Quitar</button></td>`;
      tbody.appendChild(tr);
      total += Number(it.subtotal || 0);
    });
    document.getElementById("total").textContent = total.toFixed(2);
  }

    async function registrarOperacion(tipo) {
    if (lista.length === 0) return;
  
    status.textContent = "Registrando...";
  
    for (const it of lista) {
      await new Promise((resolve) => {
        const cb = "cb_" + Math.random().toString(36).slice(2);
  
        window[cb] = function(json) {
          delete window[cb];
          resolve(json);
        };
  
        const s = document.createElement("script");
        s.src = `${WEBAPP_URL}?accion=${tipo}&codigo=${it.codigo}&cantidad=${it.cantidad}&callback=${cb}`;
        document.body.appendChild(s);
      });
    }
  
    status.textContent = "Operación completada";
    lista = [];
    renderTabla();
  }


});
