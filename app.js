document.addEventListener('DOMContentLoaded', () => {

  // Estado global con reclamos propios, reclamos de comunidad y registro de apoyos
  let estado = {
    usuarioActual: null,
    gps: null,
    foto: null,
    analisisIA: null,
    reclamosPropios: [
      {
        id: "REC-2026-87926",
        dni: "46868103",
        direccion: "Punta Larrea, Barrio Casa Grande, Chacras de Coria (-32.989084, -68.876038)",
        lat: -32.989084,
        lng: -68.876038,
        descripcion: "Se reporta una falla urbana detectada en la ubicación: Punta Larrea, Barrio Casa Grande. Se solicita inspección técnica.",
        fecha: "4/11/2026 14:30:00",
        hash: "0xf564eff42913b411d4ba4d59e5b804530aee15b6",
        apoyos: ["38920112", "41029481"] // DNIs de vecinos que apoyaron
      }
    ],
    reclamosComunidad: [
      {
        id: "REC-2026-51204",
        dni: "38920112",
        vecino: "Vecino (Distrito Vistalba)",
        direccion: "Guardia Vieja 1250, Vistalba (-33.021100, -68.892300)",
        lat: -33.021100,
        lng: -68.892300,
        descripcion: "Luminaria pública fuera de servicio en tramo oscuro de la calzada.",
        fecha: "3/11/2026 19:15:00",
        hash: "0x89abf120149acb7d60921fe58c92a104231b409e",
        apoyos: ["35492102", "29102381", "33109283"]
      },
      {
        id: "REC-2026-33912",
        dni: "41029481",
        vecino: "Vecino (Distrito Carrodilla)",
        direccion: "San Martín y Paso, Carrodilla (-32.968500, -68.849200)",
        lat: -32.968500,
        lng: -68.849200,
        descripcion: "Acumulación de escombros sobre vereda peatonal obstruyendo rampa accesible.",
        fecha: "2/11/2026 10:05:00",
        hash: "0x77c29d012489ae91c28f9a21b44081c73a49e290",
        apoyos: ["38920112"]
      },
      {
        id: "REC-2026-90123",
        dni: "35492102",
        vecino: "Vecino (Distrito Perdriel)",
        direccion: "Ruta 15 y Quintana, Perdriel (-33.085000, -68.871000)",
        lat: -33.085000,
        lng: -68.871000,
        descripcion: "Bache profundo en la calzada lateral de la avenida principal.",
        fecha: "1/11/2026 16:40:00",
        hash: "0x33e8a9104b921efca7120aef1024bc99d140b991",
        apoyos: ["41029481", "38920112", "29102381", "30918231", "34918231"]
      }
    ]
  };

  let mapaForm = null;
  let marcadorForm = null;
  let mapaComunidad = null;

  const LUJAN_CENTRO = [-33.0375, -68.8778];

  const COORDENADAS_POLIGONO_LUJAN = [
    [-32.9650, -68.8950],
    [-32.9650, -68.8400],
    [-33.0000, -68.8100],
    [-33.0700, -68.8000],
    [-33.1200, -68.8300],
    [-33.1400, -68.9300],
    [-33.0900, -69.0200],
    [-33.0100, -68.9600]
  ];

  function puntoEnPoligono(lat, lng, vs) {
    let x = lat, y = lng;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i][0], yi = vs[i][1];
      let xj = vs[j][0], yj = vs[j][1];
      let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function getUsuariosDB() {
    try {
      return JSON.parse(localStorage.getItem('usuarios_db')) || [];
    } catch (e) {
      return window._usuariosDB || [];
    }
  }

  function saveUsuarioDB(usuario) {
    try {
      const db = getUsuariosDB();
      db.push(usuario);
      localStorage.setItem('usuarios_db', JSON.stringify(db));
    } catch (e) {
      window._usuariosDB = window._usuariosDB || [];
      window._usuariosDB.push(usuario);
    }
  }

  // Elementos DOM
  const secAuth = document.getElementById('sec-auth');
  const secCrear = document.getElementById('sec-crear');
  const secIA = document.getElementById('sec-ia');
  const secHistorial = document.getElementById('sec-historial');
  const secComunidad = document.getElementById('sec-comunidad');

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  const userDisplay = document.getElementById('user-display');
  const btnLogout = document.getElementById('btn-logout');
  const btnVerMisReclamos = document.getElementById('btn-ver-mis-reclamos');
  const btnVerComunidad = document.getElementById('btn-ver-comunidad');

  const btnGps = document.getElementById('btn-gps');
  const gpsInfo = document.getElementById('gps-info');
  const inputDireccion = document.getElementById('input-direccion-editable');
  const inputFoto = document.getElementById('input-foto');
  const previewBox = document.getElementById('preview-box');
  const imgPreview = document.getElementById('img-preview');
  const btnAnalizar = document.getElementById('btn-analizar');

  const formConfirmar = document.getElementById('form-confirmar');
  const inputDesc = document.getElementById('input-desc');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnNuevo = document.getElementById('btn-nuevo');
  const listaReclamos = document.getElementById('lista-reclamos');
  const listaComunidad = document.getElementById('lista-comunidad');

  // PESTAÑAS LOGIN / REGISTRO
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', (e) => {
      e.preventDefault();
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', (e) => {
      e.preventDefault();
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    });
  }

  // REGISTRO
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const dni = document.getElementById('reg-dni').value;
      const email = document.getElementById('reg-email').value;
      const tel = document.getElementById('reg-tel').value;
      const pass = document.getElementById('reg-pass').value;

      const usuarios = getUsuariosDB();
      if (usuarios.find(u => u.dni === dni)) {
        alert('El DNI ingresado ya se encuentra registrado.');
        return;
      }

      saveUsuarioDB({ dni, email, tel, pass });
      alert('¡Registro exitoso! Ya podés ingresar.');
      tabLogin.click();
      document.getElementById('login-dni').value = dni;
    });
  }

  // INICIO SESIÓN
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const dni = document.getElementById('login-dni').value;
      const pass = document.getElementById('login-pass').value;

      const usuarios = getUsuariosDB();
      let usuarioValido = usuarios.find(u => u.dni === dni && u.pass === pass);

      if (!usuarioValido) {
        usuarioValido = { dni: dni || "46868103", email: "vecino@vozreclamos.gob.ar", tel: "2615551234", pass: pass || "123456" };
        saveUsuarioDB(usuarioValido);
      }

      estado.usuarioActual = usuarioValido;
      userDisplay.innerHTML = `<i class="fa-solid fa-user"></i> Vecino (DNI: ${usuarioValido.dni})`;
      btnLogout.classList.remove('hidden');
      btnVerMisReclamos.classList.remove('hidden');
      btnVerComunidad.classList.remove('hidden');

      renderHistorial();
      secAuth.classList.add('hidden');
      secCrear.classList.add('hidden');
      secIA.classList.add('hidden');
      secComunidad.classList.add('hidden');
      secHistorial.classList.remove('hidden');
    });
  }

  // NAVEGACIÓN MIS RECLAMOS
  if (btnVerMisReclamos) {
    btnVerMisReclamos.addEventListener('click', () => {
      renderHistorial();
      secCrear.classList.add('hidden');
      secIA.classList.add('hidden');
      secComunidad.classList.add('hidden');
      secHistorial.classList.remove('hidden');
    });
  }

  // NAVEGACIÓN COMUNIDAD
  if (btnVerComunidad) {
    btnVerComunidad.addEventListener('click', () => {
      renderComunidad();
      secAuth.classList.add('hidden');
      secCrear.classList.add('hidden');
      secIA.classList.add('hidden');
      secHistorial.classList.add('hidden');
      secComunidad.classList.remove('hidden');

      setTimeout(() => {
        inicializarMapaComunidad();
      }, 200);
    });
  }

  // LOGOUT
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      estado.usuarioActual = null;
      userDisplay.innerHTML = `<i class="fa-solid fa-user-circle"></i> No autenticado`;
      btnLogout.classList.add('hidden');
      btnVerMisReclamos.classList.add('hidden');
      btnVerComunidad.classList.add('hidden');

      secCrear.classList.add('hidden');
      secIA.classList.add('hidden');
      secHistorial.classList.add('hidden');
      secComunidad.classList.add('hidden');
      secAuth.classList.remove('hidden');
    });
  }

  // MAPA DEL FORMULARIO DE RECLAMO
  if (btnGps) {
    btnGps.addEventListener('click', () => {
      btnGps.disabled = true;
      btnGps.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Desplegando Perímetro...`;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            if (puntoEnPoligono(lat, lng, COORDENADAS_POLIGONO_LUJAN)) {
              actualizarDireccionYMapa(lat, lng);
            } else {
              actualizarDireccionYMapa(LUJAN_CENTRO[0], LUJAN_CENTRO[1]);
            }
          },
          () => { actualizarDireccionYMapa(LUJAN_CENTRO[0], LUJAN_CENTRO[1]); },
          { timeout: 4000 }
        );
      } else {
        actualizarDireccionYMapa(LUJAN_CENTRO[0], LUJAN_CENTRO[1]);
      }
    });
  }

  async function actualizarDireccionYMapa(lat, lng) {
    gpsInfo.classList.remove('hidden');
    const latFixed = parseFloat(lat).toFixed(6);
    const lngFixed = parseFloat(lng).toFixed(6);

    let dirTexto = `San Martín 250, Luján de Cuyo, Mendoza (${latFixed}, ${lngFixed})`;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latFixed}&lon=${lngFixed}`);
      const data = await response.json();
      if (data && data.display_name) {
        const partes = data.display_name.split(',');
        dirTexto = `${partes.slice(0, 3).join(',')} (${latFixed}, ${lngFixed})`;
      }
    } catch (e) {
      console.warn("Dirección de respaldo.");
    }

    estado.gps = { lat: latFixed, lng: lngFixed, direccion: dirTexto };
    inputDireccion.value = dirTexto;
    inputFoto.disabled = false;
    btnGps.disabled = false;
    btnGps.innerHTML = `<i class="fa-solid fa-check"></i> Jurisdicción Luján Activa`;

    inicializarOActualizarMapaForm(latFixed, lngFixed);
  }

  function inicializarOActualizarMapaForm(lat, lng) {
    if (!mapaForm) {
      mapaForm = L.map('mapa-container', { center: [lat, lng], zoom: 13, minZoom: 11, maxZoom: 19 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap - Luján' }).addTo(mapaForm);

      const pol = L.polygon(COORDENADAS_POLIGONO_LUJAN, { color: '#7c3aed', weight: 3, fillColor: '#8b5cf6', fillOpacity: 0.15 }).addTo(mapaForm);
      mapaForm.fitBounds(pol.getBounds());

      marcadorForm = L.marker([lat, lng], { draggable: true }).addTo(mapaForm);

      marcadorForm.on('dragend', function (e) {
        const coord = e.target.getLatLng();
        if (puntoEnPoligono(coord.lat, coord.lng, COORDENADAS_POLIGONO_LUJAN)) {
          actualizarDireccionPorCoordenadas(coord.lat, coord.lng);
        } else {
          marcadorForm.setLatLng([estado.gps.lat, estado.gps.lng]);
          alert("¡Ubicación denegada! Solo dentro de Luján de Cuyo.");
        }
      });

      mapaForm.on('click', function (e) {
        if (puntoEnPoligono(e.latlng.lat, e.latlng.lng, COORDENADAS_POLIGONO_LUJAN)) {
          marcadorForm.setLatLng(e.latlng);
          actualizarDireccionPorCoordenadas(e.latlng.lat, e.latlng.lng);
        } else {
          alert("Solo podés marcar dentro de Luján de Cuyo.");
        }
      });
    } else {
      mapaForm.setView([lat, lng], 13);
      marcadorForm.setLatLng([lat, lng]);
    }
    setTimeout(() => { mapaForm.invalidateSize(); }, 300);
  }

  async function actualizarDireccionPorCoordenadas(lat, lng) {
    const latFixed = parseFloat(lat).toFixed(6);
    const lngFixed = parseFloat(lng).toFixed(6);
    let dirTexto = `Luján de Cuyo, Mendoza (${latFixed}, ${lngFixed})`;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latFixed}&lon=${lngFixed}`);
      const data = await response.json();
      if (data && data.display_name) {
        const partes = data.display_name.split(',');
        dirTexto = `${partes.slice(0, 3).join(',')} (${latFixed}, ${lngFixed})`;
      }
    } catch (e) {
      console.warn("Uso de dirección genérica.");
    }

    estado.gps = { lat: latFixed, lng: lngFixed, direccion: dirTexto };
    inputDireccion.value = dirTexto;
  }

  // MAPA DE COMUNIDAD
  function inicializarMapaComunidad() {
    if (!mapaComunidad) {
      mapaComunidad = L.map('mapa-comunidad-container', { center: LUJAN_CENTRO, zoom: 12 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapaComunidad);

      L.polygon(COORDENADAS_POLIGONO_LUJAN, { color: '#0284c7', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.1 }).addTo(mapaComunidad);
    }

    const todosLosReclamos = [...estado.reclamosPropios, ...estado.reclamosComunidad];
    todosLosReclamos.forEach(r => {
      if (r.lat && r.lng) {
        L.marker([r.lat, r.lng])
          .addTo(mapaComunidad)
          .bindPopup(`<b>${r.id}</b><br>${r.direccion}<br><small>${r.descripcion}</small><br><b>👍 Apoyos: ${r.apoyos ? r.apoyos.length : 0}</b>`);
      }
    });

    setTimeout(() => { mapaComunidad.invalidateSize(); }, 300);
  }

  // SUBIR FOTO
  if (inputFoto) {
    inputFoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          estado.foto = evt.target.result;
          imgPreview.src = estado.foto;
          previewBox.classList.remove('hidden');
          btnAnalizar.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
      }
    });
  }

  // IA
  if (btnAnalizar) {
    btnAnalizar.addEventListener('click', () => {
      const dirFinal = inputDireccion.value || "Luján de Cuyo, Mendoza";
      estado.analisisIA = {
        tipo: "Bache / Anomalía Urbana Detectada",
        score: "94%",
        area: "Obras Públicas / Servicios Públicos",
        borrador: `Se reporta una falla urbana detectada en la ubicación: ${dirFinal}. Se solicita inspección técnica de Luján de Cuyo.`
      };

      document.getElementById('ia-tipo').textContent = estado.analisisIA.tipo;
      document.getElementById('ia-score').textContent = estado.analisisIA.score;
      document.getElementById('ia-area').textContent = estado.analisisIA.area;
      inputDesc.value = estado.analisisIA.borrador;

      secCrear.classList.add('hidden');
      secIA.classList.remove('hidden');
    });
  }

  // CONFIRMAR RECLAMO
  if (formConfirmar) {
    formConfirmar.addEventListener('submit', (e) => {
      e.preventDefault();
      const descFinal = inputDesc.value;
      const ticketId = 'REC-2026-' + Math.floor(10000 + Math.random() * 90000);
      const hash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

      const nuevoReclamo = {
        id: ticketId,
        dni: estado.usuarioActual ? estado.usuarioActual.dni : "46868103",
        direccion: inputDireccion.value || "Luján de Cuyo, Mendoza",
        lat: estado.gps ? parseFloat(estado.gps.lat) : -33.0375,
        lng: estado.gps ? parseFloat(estado.gps.lng) : -68.8778,
        descripcion: descFinal,
        fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        hash: hash,
        apoyos: []
      };

      estado.reclamosPropios.unshift(nuevoReclamo);
      renderHistorial();

      secIA.classList.add('hidden');
      secHistorial.classList.remove('hidden');
    });
  }

  // FUNCIÓN PARA APAYAR / RETIRAR APOYO A UN RECLAMO
  window.toggleApoyo = function(idReclamo) {
    if (!estado.usuarioActual) return;
    const userDni = estado.usuarioActual.dni;

    const todos = [...estado.reclamosPropios, ...estado.reclamosComunidad];
    const reclamo = todos.find(r => r.id === idReclamo);

    if (reclamo) {
      reclamo.apoyos = reclamo.apoyos || [];
      const index = reclamo.apoyos.indexOf(userDni);

      if (index === -1) {
        reclamo.apoyos.push(userDni);
      } else {
        reclamo.apoyos.splice(index, 1);
      }

      renderComunidad();
      renderHistorial();
    }
  };

  // RENDER MIS RECLAMOS
  function renderHistorial() {
    listaReclamos.innerHTML = '';
    if (estado.reclamosPropios.length === 0) {
      listaReclamos.innerHTML = `<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>No tenés reclamos registrados todavía.</p></div>`;
      return;
    }
    estado.reclamosPropios.forEach(r => {
      const cantidadApoyos = r.apoyos ? r.apoyos.length : 0;
      const div = document.createElement('div');
      div.className = 'reclamo-card';
      div.innerHTML = `
        <div class="reclamo-header">
          <strong><i class="fa-solid fa-ticket"></i> ${r.id}</strong>
          <span class="badge-status"><i class="fa-solid fa-clock"></i> REPORTADO</span>
        </div>
        <p><strong>Ubicación GPS:</strong> ${r.direccion}</p>
        <p><strong>Detalle:</strong> ${r.descripcion}</p>
        <div class="hash-box"><i class="fa-solid fa-link"></i> <strong>Hash Criptográfico Blockchain:</strong><br>${r.hash}</div>
        <div class="reclamo-footer">
          <span style="font-size: 13px; color: #94a3b8;"><i class="fa-solid fa-thumbs-up"></i> Apoyos de Vecinos: <strong>${cantidadApoyos}</strong></span>
        </div>
      `;
      listaReclamos.appendChild(div);
    });
  }

  // RENDER RECLAMOS COMUNITARIOS CON BOTÓN DE APOYO VECINAL
  function renderComunidad() {
    listaComunidad.innerHTML = '';
    const todos = [...estado.reclamosPropios, ...estado.reclamosComunidad];
    const userDni = estado.usuarioActual ? estado.usuarioActual.dni : "46868103";

    todos.forEach(r => {
      const esPropio = r.dni === userDni;
      r.apoyos = r.apoyos || [];
      const yaApoyo = r.apoyos.includes(userDni);
      const cantidadApoyos = r.apoyos.length;

      const div = document.createElement('div');
      div.className = 'reclamo-card';
      div.innerHTML = `
        <div class="reclamo-header">
          <strong><i class="fa-solid fa-ticket"></i> ${r.id} ${esPropio ? '<span class="badge-vecino">Mi Reclamo</span>' : `<span class="badge-vecino">${r.vecino || 'Vecino Verificado'}</span>`}</strong>
          <span class="badge-status"><i class="fa-solid fa-clock"></i> REPORTADO</span>
        </div>
        <p><strong>Ubicación:</strong> ${r.direccion}</p>
        <p><strong>Detalle:</strong> ${r.descripcion}</p>
        <div class="hash-box"><i class="fa-solid fa-link"></i> <strong>Hash Blockchain:</strong><br>${r.hash}</div>
        <div class="reclamo-footer">
          <button class="btn-apoyar ${yaApoyo ? 'apoyado' : ''}" onclick="toggleApoyo('${r.id}')">
            <i class="fa-solid ${yaApoyo ? 'fa-thumbs-up' : 'fa-hand-back-fist'}"></i>
            ${yaApoyo ? '¡Apoyado!' : 'Apoyar Reclamo'} (${cantidadApoyos})
          </button>
        </div>
      `;
      listaComunidad.appendChild(div);
    });
  }

  // BOTONES DE NAVEGACIÓN
  if (btnNuevo) {
    btnNuevo.addEventListener('click', () => {
      previewBox.classList.add('hidden');
      btnAnalizar.classList.add('hidden');
      inputFoto.value = '';
      secHistorial.classList.add('hidden');
      secComunidad.classList.add('hidden');
      secCrear.classList.remove('hidden');
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      secIA.classList.add('hidden');
      secCrear.classList.remove('hidden');
    });
  }

});