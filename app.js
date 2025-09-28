// ==== Utilidades de validación ====
const onlyDigits = (str) => /^[0-9]+$/.test(str);

function normalizaRut(rut) {
  return rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
}

function formatoRut(rut) {
  rut = normalizaRut(rut);
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + dv;
}

// Valida RUT chileno con algoritmo Módulo 11
function validaRut(rut) {
  rut = normalizaRut(rut);
  if (rut.length < 2) return false;
  const cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);

  if (!onlyDigits(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = suma % 11;
  const digitoEsperado = 11 - resto;
  let dvCalculado = '';

  if (digitoEsperado === 11) dvCalculado = '0';
  else if (digitoEsperado === 10) dvCalculado = 'K';
  else dvCalculado = String(digitoEsperado);

  return dv.toUpperCase() === dvCalculado;
}

// Valida email básico
function validaEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

// Teléfono: 8 a 12 dígitos
function validaTelefono(tel) {
  const digits = tel.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 12;
}

// Fecha razonable: edad 0–120
function validaNacimiento(fechaStr) {
  const d = new Date(fechaStr);
  if (isNaN(d)) return false;
  const hoy = new Date();
  const min = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
  const max = hoy;
  return d >= min && d <= max;
}

// ==== Persistencia en LocalStorage ====
const STORAGE_KEY = 'fichasMedicas';

function getAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function findByRut(rut) {
  const arr = getAll();
  const norm = normalizaRut(rut);
  return arr.find(x => normalizaRut(x.rut) === norm);
}

function upsertFicha(ficha) {
  const arr = getAll();
  const norm = normalizaRut(ficha.rut);
  const idx = arr.findIndex(x => normalizaRut(x.rut) === norm);
  if (idx >= 0) {
    arr[idx] = ficha;
  } else {
    arr.push(ficha);
  }
  saveAll(arr);
}

// ==== UI ====
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

const form = $('#fichaForm');
const msg = $('#formMsg');
const tablaBody = $('#tablaResultados tbody');

function setMsg(text, type='success') {
  msg.className = type;
  msg.textContent = text;
}

function limpiaMsg() { setMsg('', ''); }

function getFormData() {
  return {
    rut: $('#rut').value.trim(),
    nombres: $('#nombres').value.trim(),
    apellidos: $('#apellidos').value.trim(),
    direccion: $('#direccion').value.trim(),
    ciudad: $('#ciudad').value.trim(),
    telefono: $('#telefono').value.trim(),
    email: $('#email').value.trim(),
    fechaNacimiento: $('#fechaNacimiento').value,
    estadoCivil: $('#estadoCivil').value,
    comentarios: $('#comentarios').value.trim()
  };
}

function setFormData(data) {
  $('#rut').value = data.rut || '';
  $('#nombres').value = data.nombres || '';
  $('#apellidos').value = data.apellidos || '';
  $('#direccion').value = data.direccion || '';
  $('#ciudad').value = data.ciudad || '';
  $('#telefono').value = data.telefono || '';
  $('#email').value = data.email || '';
  $('#fechaNacimiento').value = data.fechaNacimiento || '';
  $('#estadoCivil').value = data.estadoCivil || '';
  $('#comentarios').value = data.comentarios || '';
}

// ==== Funciones para manejo de errores por campo ====
function clearFieldErrors() {
  document.querySelectorAll('.error-text').forEach(el => el.remove());
  $$('#fichaForm input, #fichaForm select, #fichaForm textarea')
    .forEach(el => el.classList.remove('invalid'));
}

function setFieldError(inputEl, message) {
  const label = inputEl.closest('label');
  if (!label) return;
  let msgEl = label.querySelector('.error-text');
  if (!msgEl) {
    msgEl = document.createElement('small');
    msgEl.className = 'error-text';
    label.insertBefore(msgEl, label.firstChild);
  }
  msgEl.textContent = message;
  inputEl.classList.add('invalid');
}

// ==== Validación del formulario ====
function validaFormulario() {
  limpiaMsg();
  clearFieldErrors();
  let ok = true;
  const data = getFormData();

  if (!validaRut(data.rut)) { setFieldError($('#rut'), 'RUT inválido'); ok = false; }
  if (data.nombres.length < 2) { setFieldError($('#nombres'), 'Nombres inválidos (mínimo 2 caracteres)'); ok = false; }
  if (data.apellidos.length < 2) { setFieldError($('#apellidos'), 'Apellidos inválidos (mínimo 2 caracteres)'); ok = false; }
  if (data.direccion.length < 3) { setFieldError($('#direccion'), 'Dirección inválida (mínimo 3 caracteres)'); ok = false; }
  if (data.ciudad.length < 2) { setFieldError($('#ciudad'), 'Ciudad inválida (mínimo 2 caracteres)'); ok = false; }
  if (!validaTelefono(data.telefono)) { setFieldError($('#telefono'), 'Teléfono inválido (8–12 dígitos)'); ok = false; }
  if (!validaEmail(data.email)) { setFieldError($('#email'), 'Email inválido'); ok = false; }
  if (!validaNacimiento(data.fechaNacimiento)) { setFieldError($('#fechaNacimiento'), 'Fecha de nacimiento inválida'); ok = false; }
  if (!data.estadoCivil) { setFieldError($('#estadoCivil'), 'Debe seleccionar estado civil'); ok = false; }
  // comentarios opcional

  if (!ok) setMsg('Por favor, corrige los campos marcados.', 'error');
  return ok;
}


function renderResultados(items) {
  tablaBody.innerHTML = '';
  for (const x of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatoRut(x.rut)}</td>
      <td>${x.nombres}</td>
      <td>${x.apellidos}</td>
      <td>${x.ciudad}</td>
      <td>${x.telefono}</td>
      <td>${x.email}</td>
    `;
    tablaBody.appendChild(tr);
  }
  const count = items.length;
  const lbl = document.getElementById('contadorResultados');
  lbl.textContent = count ? `${count} resultado(s)` : 'Sin resultados';
}

// ==== Eventos ====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Guardar
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validaFormulario()) return;

    const data = getFormData();
    const existente = findByRut(data.rut);

    if (existente) {
      const resp = confirm(`El RUT ${formatoRut(data.rut)} ya existe. ¿Desea sobrescribir el registro?`);
      if (!resp) {
        setMsg('Operación cancelada por el usuario.', 'error');
        return;
      }
    }
    upsertFicha(data);
    setMsg('Registro guardado correctamente.', 'success');
  });

// Limpiar con confirmación
document.getElementById('btnLimpiar').addEventListener('click', () => {
  const resp = confirm('¿Seguro que desea limpiar el formulario?');
  if (!resp) return;
  form.reset();
  limpiaMsg();
  clearFieldErrors();
});

  // Cerrar
  document.getElementById('btnCerrar').addEventListener('click', () => {
    limpiaMsg();
    setMsg('Intentando cerrar la pestaña…', 'success');
    // window.close() solo funciona si la pestaña fue abierta por script
    window.close();
  });

  // Formateo visual del RUT al perder foco
  document.getElementById('rut').addEventListener('blur', (e) => {
    const v = e.target.value;
    if (v.trim()) e.target.value = formatoRut(v);
  });

  // Buscar por apellido
  const inputBusq = document.getElementById('busquedaApellido');
  const doBuscar = () => {
    const q = inputBusq.value.trim().toLowerCase();
    const data = getAll();
    if (!q) { renderResultados([]); return; }
    const res = data.filter(x => (x.apellidos || '').toLowerCase().includes(q));
    renderResultados(res);
  };
  document.getElementById('btnBuscar').addEventListener('click', doBuscar);
  inputBusq.addEventListener('keyup', (e) => { if (e.key === 'Enter') doBuscar(); });
  document.getElementById('btnLimpiarBusqueda').addEventListener('click', () => {
    inputBusq.value = '';
    renderResultados([]);
  });
});
