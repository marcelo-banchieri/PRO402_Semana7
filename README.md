# Ficha Médica — PRO402

Aplicación web simple (HTML/CSS/JS) que permite:
- Ingresar fichas de pacientes con **validaciones** (RUT, email, teléfono, fecha).
- **Guardar** registros en `localStorage` (persisten en el navegador).
- **Sobrescribir** si el RUT ya existe (se consulta al usuario).
- **Buscar** por apellido.
- Botones: **Guardar**, **Limpiar**, **Cerrar**.

## Estructura
```
/ (raíz)
├── index.html
├── styles.css
└── app.js
```

## Cómo usar localmente
1. Descarga estos archivos y ábrelos con un navegador (doble clic en `index.html`).

## Cómo publicar (GitHub Pages)
1. Crea un repo nuevo (p. ej. `ficha-medica-app`).
2. Sube los 3 archivos.
3. En **Settings → Pages**, elige **Deploy from a branch**, selecciona la rama (`main`) y carpeta `/ (root)`.
4. Guarda; espera a que se genere el enlace (generalmente bajo `https://usuario.github.io/ficha-medica-app`).

## Notas de validación
- RUT validado por algoritmo **Módulo 11** (incluye formateo `12.345.678-5`).
- Email validado por regex básica.
- Teléfono: de 8 a 12 dígitos (se toleran espacios y símbolos, se normaliza).
- Fecha de nacimiento: edad 0–120 años.

## Pruebas sugeridas
- **Caso positivo**: Ingresar datos válidos y guardar.
- **Registro duplicado**: mismo RUT → confirmar y sobrescribir.
- **Campos inválidos**: marcar borde ámbar y mensaje de error.
- **Búsqueda**: ingresar parte del apellido y verificar listado.
- **Limpiar**: debe resetear el formulario y estilos.
