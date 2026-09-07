import React, { useState } from "react";
import { jsPDF } from "jspdf";
import rqLogo from "./assets/rq-logo.svg";
import rqLogoWhite from "./assets/rq-logo-white.svg";
import lessLogoWhite from "./assets/less-logo-white.svg";
import cfiaLogo from "./assets/cfia-logo.svg";
import ukFlag from "./assets/uk-flag.svg";

function App() {
  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [correo, setCorreo] = useState("");
  const [producto, setProducto] = useState("Transferencia Automática 400A");
  const [cantidad, setCantidad] = useState(1);
  const [costo, setCosto] = useState(2400);
  const [costoInput, setCostoInput] = useState("2400");
  const [margen, setMargen] = useState(0);
  const [tiempoEntrega, setTiempoEntrega] = useState("1 semana despues de recibida la O.C.");
  const [condicionesPago, setCondicionesPago] = useState("50% con orden de compra y 50% contra entrega.");
  const [items, setItems] = useState([]);

  const precioCalculado = costo * (1 + (margen / 100));
  const itemActualValido = Boolean(producto.trim()) && cantidad > 0 && costo > 0;
  const subtotalItems = items.reduce((acumulado, item) => acumulado + (item.cantidad * item.precio), 0);
  const subtotalItemActual = itemActualValido ? (cantidad * precioCalculado) : 0;

  const subtotal = subtotalItems + subtotalItemActual;
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const formatoMoneda = (valor) => {
    const numero = new Intl.NumberFormat("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);

    return `$${numero}`;
  };

  const parsearNumeroManual = (valor) => {
    const limpio = valor.replace(/[^\d.,]/g, "");

    if (!limpio) {
      return 0;
    }

    const ultimoPunto = limpio.lastIndexOf(".");
    const ultimaComa = limpio.lastIndexOf(",");
    const separadorDecimal = Math.max(ultimoPunto, ultimaComa);

    if (separadorDecimal === -1) {
      return Number(limpio.replace(/[.,]/g, ""));
    }

    const parteEntera = limpio.slice(0, separadorDecimal).replace(/[.,]/g, "");
    const parteDecimal = limpio.slice(separadorDecimal + 1).replace(/[.,]/g, "");
    const normalizado = `${parteEntera || "0"}.${parteDecimal || "0"}`;

    return Number(normalizado);
  };

  const manejarCambioCosto = (valor) => {
    setCostoInput(valor);
    setCosto(parsearNumeroManual(valor));
  };

  const manejarCambioMargen = (valor) => {
    const soloDigitos = valor.replace(/[^\d]/g, "");
    setMargen(soloDigitos ? Number(soloDigitos) : 0);
  };

  const agregarItem = () => {
    if (!itemActualValido) {
      return;
    }

    setItems((previos) => [
      ...previos,
      {
        producto: producto.trim(),
        cantidad,
        costo,
        margen,
        precio: precioCalculado
      }
    ]);

    setProducto("");
    setCantidad(1);
    setCosto(0);
    setCostoInput("");
    setMargen(0);
  };

  const convertirLogoAPng = async (logoSrc) => {
    const imagen = new Image();
    imagen.src = logoSrc;

    await new Promise((resolve, reject) => {
      imagen.onload = resolve;
      imagen.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = imagen.naturalWidth;
    canvas.height = imagen.naturalHeight;

    const contexto = canvas.getContext("2d");
    contexto.drawImage(imagen, 0, 0);

    return canvas.toDataURL("image/png");
  };

  const generarPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const fecha = new Date();
    const numeroCotizacion = `RQ-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}-${String(fecha.getHours()).padStart(2, "0")}${String(fecha.getMinutes()).padStart(2, "0")}`;

    const colorPrimario = [10, 45, 87];
    const colorSecundario = [28, 166, 109];
    const colorGris = [243, 246, 250];
    const colorTexto = [33, 37, 41];

    doc.setDrawColor(220, 226, 234);
    doc.setLineWidth(0.2);

    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 34, "F");
    doc.setFillColor(...colorSecundario);
    doc.rect(0, 30, 210, 4, "F");

    doc.setTextColor(230, 237, 245);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.3);
    doc.text("Empresa incorporada al", 105, 5.3, { align: "center" });

    try {
      const logoPng = await convertirLogoAPng(rqLogoWhite);
      doc.addImage(logoPng, "PNG", 8, 8, 74, 17);
    } catch (error) {
      // Si el logo no carga, se mantiene el flujo de generacion.
    }

    try {
      const lessLogoPng = await convertirLogoAPng(lessLogoWhite);
      doc.addImage(lessLogoPng, "PNG", 70, 9.5, 30, 10);
    } catch (error) {
      // Si el logo no carga, se mantiene el flujo de generacion.
    }

    try {
      const cfiaLogoPng = await convertirLogoAPng(cfiaLogo);
      doc.addImage(cfiaLogoPng, "PNG", 103, 9.8, 18, 9);
    } catch (error) {
      // Si el logo no carga, se mantiene el flujo de generacion.
    }

    doc.setTextColor(230, 237, 245);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.4);
    doc.text("R.Q. INGENIERIA S.A.", 140, 10);
    doc.text("Heredia, Costa Rica.", 140, 13.1);
    doc.text("Tel. (506) 2263 4726", 140, 16.2);
    doc.text("WhatsApp: (506) 8426 5179", 140, 19.3);
    doc.text("www.rqingenieria.net", 140, 22.4);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("COTIZACION", 198, 11.2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.6);
    doc.text(`No: ${numeroCotizacion}`, 198, 16.2, { align: "right" });
    doc.text(`Fecha: ${fecha.toLocaleDateString("es-CR")}`, 198, 20.1, { align: "right" });

    doc.setTextColor(...colorTexto);
    doc.setFillColor(...colorGris);
    doc.roundedRect(12, 40, 186, 36, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Datos del cliente", 16, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Empresa: ${empresa || "No especificada"}`, 16, 56);
    doc.text(`Contacto: ${contacto || "No especificado"}`, 16, 63);
    doc.text(`Correo / Telefono: ${correo || "No especificado"}`, 16, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Detalle del producto", 12, 88);

    doc.setFillColor(232, 238, 246);
    doc.rect(12, 92, 186, 10, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Producto", 15, 98.5);
    doc.text("Cantidad", 130, 98.5);
    doc.text("Precio unitario", 155, 98.5);
    doc.text("Subtotal", 184, 98.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFillColor(255, 255, 255);
    const alturaFila = 10;
    const yInicialFilas = 102;
    const itemActual = {
      producto: producto.trim() || "Sin descripcion",
      cantidad,
      costo,
      margen,
      precio: precioCalculado
    };
    const itemsParaPDF = itemActualValido ? [...items, itemActual] : items;
    const listaFinalPDF = itemsParaPDF.length ? itemsParaPDF : [{ producto: "Sin descripcion", cantidad: 0, precio: 0 }];
    const maxItemsPDF = 5;
    const listaVisiblePDF = listaFinalPDF.slice(0, maxItemsPDF);
    const alturaTabla = listaVisiblePDF.length * alturaFila;
    doc.rect(12, yInicialFilas, 186, alturaTabla, "F");
    doc.rect(12, 92, 186, 10 + alturaTabla, "S");

    listaVisiblePDF.forEach((item, indice) => {
      const yFila = yInicialFilas + (indice * alturaFila) + 6.5;
      const subtotalItem = item.cantidad * item.precio;

      doc.text(doc.splitTextToSize(item.producto || "Sin descripcion", 110), 15, yFila);
      doc.text(String(item.cantidad), 132, yFila);
      doc.text(formatoMoneda(item.precio), 155, yFila);
      doc.text(formatoMoneda(subtotalItem), 194, yFila, { align: "right" });

      if (indice < listaVisiblePDF.length - 1) {
        doc.setDrawColor(220, 226, 234);
        doc.line(12, yInicialFilas + ((indice + 1) * alturaFila), 198, yInicialFilas + ((indice + 1) * alturaFila));
      }
    });

    if (listaFinalPDF.length > maxItemsPDF) {
      doc.setFontSize(8);
      doc.setTextColor(98, 110, 124);
      doc.text(`Se muestran ${maxItemsPDF} de ${listaFinalPDF.length} items en el detalle.`, 12, yInicialFilas + alturaTabla + 5);
      doc.setTextColor(...colorTexto);
      doc.setFontSize(9);
    }

    doc.setFillColor(247, 250, 253);
    const yResumen = yInicialFilas + alturaTabla + 10;
    doc.roundedRect(118, yResumen, 80, 42, 2, 2, "F");
    doc.rect(118, yResumen, 80, 42, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal:", 123, yResumen + 12);
    doc.text(formatoMoneda(subtotal), 194, yResumen + 12, { align: "right" });
    doc.text("IVA (13%):", 123, yResumen + 21);
    doc.text(formatoMoneda(iva), 194, yResumen + 21, { align: "right" });

    doc.setDrawColor(...colorPrimario);
    doc.line(123, yResumen + 25, 194, yResumen + 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 123, yResumen + 35);
    doc.text(formatoMoneda(total), 194, yResumen + 35, { align: "right" });

    const lineasCondiciones = [
      `Forma de pago: ${condicionesPago || "No especificado."}`,
      "Moneda: Dolares Americanos de los Estados Unidos de America (US$).",
      `Tiempo de entrega: ${tiempoEntrega || "No especificado."}`,
      "Validez de la oferta: 30 dias naturales a partir de la fecha indicada en la oferta.",
      "Responsabilidad del cliente: revisar detalladamente la oferta y sus alcances.",
      "RQ Ingenieria S.A. no asume cambios posteriores no incluidos en esta oferta.",
      "Contacto: Ing. Olman Ramirez Quiros | Tel/Fax: (506) 2263-4726 | Cel: (506) 8426-5179",
      "Correo: oramirez@rqingenieria.net"
    ];

    const yCondiciones = Math.max(yResumen + 50, 183);

    doc.setTextColor(...colorTexto);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    doc.text("CONDICIONES COMERCIALES", 12, yCondiciones);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    let yTexto = yCondiciones + 7;
    lineasCondiciones.forEach((bloque) => {
      const lineas = doc.splitTextToSize(bloque, 186);
      doc.text(lineas, 12, yTexto);
      yTexto += (lineas.length * 3.9) + 1.7;
    });

    doc.setFillColor(...colorPrimario);
    doc.rect(0, 282, 210, 15, "F");
    doc.setTextColor(230, 237, 245);
    doc.setFontSize(8.5);
    doc.text("RQ Ingenieria | Contacto tecnico y soporte especializado", 105, 291, { align: "center" });

    doc.save("cotizacion.pdf");
  };

  const compartirWhatsApp = () => {
    const mensaje = `Cotización RQ Ingeniería\nProducto: ${producto}\nCantidad: ${cantidad}\nTotal: ${formatoMoneda(total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-row">
            <div className="brand-main">
              <img className="brand-logo" src={rqLogo} alt="RQ Ingeniería" />
              <div className="company-cert-row">
                <p className="header-cert">Empresa incorporada al CFIA</p>
                <img className="header-cfia" src={cfiaLogo} alt="CFIA" />
              </div>
            </div>
            <div className="brand-less">
              <img className="less-logo" src={lessLogoWhite} alt="LESS" />
              <img className="uk-flag" src={ukFlag} alt="Bandera del Reino Unido" />
            </div>
            <div className="brand-contact">
              <p>R.Q. INGENIERIA S.A.</p>
              <p>Heredia, Costa Rica.</p>
              <p>Tel. (506) 2263 4726</p>
              <p>WhatsApp: (506) 8426 5179</p>
              <p>Correo: oramirez@rqingenieria.net</p>
              <p>www.rqingenieria.net</p>
            </div>
          </div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="hero-copy">
          <h2>Cotizador Rápido</h2>
          <p>Genere cotizaciones en terreno con una vista clara, ordenada y lista para compartir.</p>
        </section>

        <form className="quote-form" aria-label="Formulario de cotización">
          <section className="form-card">
            <h3>Información del Cliente</h3>
            <div className="field-grid field-grid-client">
              <label>
                Empresa
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </label>
              <label>
                Contacto
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                />
              </label>
              <label>
                Correo / Teléfono
                <input
                  type="text"
                  placeholder="Info de contacto"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="form-card">
            <h3>Selección de Productos</h3>
            <div className="field-grid field-grid-product">
              <label className="span-2">
                Producto
                <input
                  type="text"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                />
              </label>
              <label>
                Cantidad
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </label>
              <label>
                Costo
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="$0"
                  value={costoInput}
                  onChange={(e) => manejarCambioCosto(e.target.value)}
                />
              </label>
              <label>
                Margen (%)
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={margen || ""}
                  onChange={(e) => manejarCambioMargen(e.target.value)}
                />
              </label>
              <label>
                Precio Unitario
                <input
                  type="text"
                  value={precioCalculado > 0 ? formatoMoneda(precioCalculado) : "$0"}
                  readOnly
                />
              </label>
              <button type="button" className="btn btn-add-item" onClick={agregarItem}>Agregar Ítem</button>
            </div>

            <div className="items-list" aria-label="Ítems agregados">
              {items.map((item, index) => (
                <div className="item-row" key={`${item.producto}-${index}`}>
                  <span>{item.producto}</span>
                  <strong>
                    Cant: {item.cantidad} | Costo: {formatoMoneda(item.costo || 0)} | Margen: {item.margen || 0}% | Precio: {formatoMoneda(item.precio)} | Subtotal: {formatoMoneda(item.cantidad * item.precio)}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="form-card">
            <h3>Condiciones Comerciales</h3>
            <div className="field-grid field-grid-conditions">
              <label>
                Tiempo de entrega
                <textarea
                  placeholder="Ej. 1 semana despues de recibida la O.C."
                  value={tiempoEntrega}
                  onChange={(e) => setTiempoEntrega(e.target.value)}
                  rows={3}
                />
              </label>
              <label>
                Condiciones de pago
                <textarea
                  placeholder="Ej. 50% con orden de compra y 50% contra entrega"
                  value={condicionesPago}
                  onChange={(e) => setCondicionesPago(e.target.value)}
                  rows={3}
                />
              </label>
            </div>
          </section>

          <section className="summary-card" aria-label="Resumen de cotización">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatoMoneda(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>IVA (13%)</span>
              <strong>{formatoMoneda(iva)}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <strong>{formatoMoneda(total)}</strong>
            </div>
          </section>

          <div className="action-row">
            <button
              type="button"
              onClick={compartirWhatsApp}
              className="btn btn-whatsapp"
            >
              Compartir por WhatsApp
            </button>
            <button
              type="button"
              onClick={generarPDF}
              className="btn btn-primary"
            >
              Generar PDF
            </button>
          </div>
        </form>
      </main>

      <footer className="app-footer">
        <p>© 2026 RQ Ingeniería. Todos los derechos reservados.</p>
        <div className="footer-contact">
          <p>R.Q. INGENIERIA S.A.</p>
          <p>Heredia, Costa Rica.</p>
          <p>Tel./Fax: (506) 2263 4726</p>
          <p>WhatsApp: (506) 8426 5179</p>
          <p>Correo: oramirez@rqingenieria.net</p>
          <p>www.rqingenieria.net</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
