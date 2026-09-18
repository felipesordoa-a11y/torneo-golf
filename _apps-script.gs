/* ============================================================
   TORNEO DE GOLF · MARTA & FELIPE
   Recoge las inscripciones del formulario en una hoja de cálculo.
   ------------------------------------------------------------
   CÓMO INSTALARLO (una sola vez, ~5 minutos)

   1. Entra en sheets.new y crea una hoja. Llámala "Torneo Golf".
   2. Menú  Extensiones → Apps Script.
   3. Borra lo que haya y pega TODO este archivo.
   4. Botón  Implementar → Nueva implementación.
        · Tipo de implementación:  Aplicación web
        · Ejecutar como:           Yo
        · Quién tiene acceso:      Cualquier persona          ← importante
   5. Autoriza cuando te lo pida (Google avisará de que la app
      no está verificada: Configuración avanzada → Ir a…).
   6. Copia la URL que termina en  /exec  y pégala en la constante
      HOJA_URL de index.html.

   Para comprobar que funciona: abre el formulario, envía una
   inscripción de prueba y mira si aparece la fila en la hoja.
   ------------------------------------------------------------
   TRAS CUALQUIER CAMBIO EN ESTE ARCHIVO

   No basta con guardar: la URL /exec sigue sirviendo la versión
   antigua hasta que publiques una nueva.
     Implementar → Administrar implementaciones → ✏️
       → Versión: Nueva versión → Implementar
   La URL no cambia, así que index.html no hay que tocarlo.
   ============================================================ */

var CABECERAS = ['Fecha', 'Nombre federación', 'Hándicap', 'Golf GameBook'];

/* Protege las operaciones de lectura y escritura. El formulario NO la
   usa: cualquiera puede inscribirse, pero solo quien tenga la clave
   puede leer la hoja o modificar celdas. */
var CLAVE = 'PON-AQUI-ALGO-LARGO-Y-RARO';

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    var hoja  = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // --- operaciones protegidas ---
    if (datos.accion) {
      if (datos.clave !== CLAVE) return respuesta({ ok: false, error: 'clave incorrecta' });

      if (datos.accion === 'leer') {
        return respuesta({ ok: true, filas: hoja.getDataRange().getValues() });
      }
      if (datos.accion === 'celda') {
        hoja.getRange(datos.fila, datos.columna).setValue(datos.valor);
        return respuesta({ ok: true });
      }
      return respuesta({ ok: false, error: 'accion desconocida' });
    }

    // La primera vez dejamos la fila de cabeceras puesta y con formato.
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(CABECERAS);
      hoja.getRange(1, 1, 1, CABECERAS.length)
          .setFontWeight('bold')
          .setBackground('#2C5741')
          .setFontColor('#FFFFFF');
      hoja.setFrozenRows(1);
    }

    hoja.appendRow([
      new Date(),
      datos.nombre,
      Number(datos.handicap),
      datos.app === 'si' ? 'Ya la tiene' : 'Aún no la tiene'
    ]);

    return respuesta({ ok: true });

  } catch (error) {
    return respuesta({ ok: false, error: String(error) });
  }
}

/* Útil para comprobar desde el navegador que el despliegue está vivo:
   abre la URL /exec y debería responder un JSON. */
function doGet() {
  return respuesta({ ok: true, mensaje: 'Formulario del torneo activo' });
}

function respuesta(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
