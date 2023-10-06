class Producto {
  constructor(id, nombre, precio, categoria, imagen) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

class BaseDeDatos {
  constructor() {
    this.productos = [];
    this.agregarRegistro(
      1,
      "Japi Lager",
      500,
      "cerveza rubia",
      "./images/lager.jpg"
    );
    this.agregarRegistro(2, "Japi Ipa", 600, "cerveza ipa", "./images/ipa.jpg");
    this.agregarRegistro(
      3,
      "Japi Negra",
      500,
      "cerveza negra",
      "./images/negra.jpg"
    );
    this.agregarRegistro(
      4,
      "Japi Roja",
      600,
      "cerveza roja",
      "./images/roja.jpg"
    );
    this.agregarRegistro(
      5,
      "Japi Ipa X6",
      3200,
      "cerveza ipa",
      "./images/ipagroup.jpg"
    );
    this.agregarRegistro(
      6,
      "Japi Lager X6",
      2800,
      "cerveza rubia",
      "./images/lagergroup.jpg"
    );
    this.agregarRegistro(
      7,
      "Japi Roja X6",
      3200,
      "cerveza roja",
      "./images/rojagroup.jpg"
    );
    this.agregarRegistro(
      8,
      "Japi Negra X6",
      2800,
      "cerveza negra",
      "./images/negragroup.jpg"
    );
  }

  agregarRegistro(id, nombre, precio, categoria, imagen) {
    const producto = new Producto(id, nombre, precio, categoria, imagen);
    this.productos.push(producto);
  }

  traerRegistros() {
    return this.productos;
  }

  registroPorId(id) {
    return this.productos.find((producto) => producto.id == id);
  }

  registrosPorNombre(palabra) {
    return this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(palabra.toLowerCase())
    );
  }
}

class Carrito {
  constructor() {
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));

    this.carrito = carritoStorage || [];
    this.total = 0;
    this.cantidadProductos = 0;
    this.listar();
  }

  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);

    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
      productoEnCarrito.cantidad++;
    }

    localStorage.setItem("carrito", JSON.stringify(this.carrito));

    this.listar();
  }

  quitar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id == id);
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      this.carrito.splice(indice, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  listar() {
    this.total = 0;
    this.cantidadProductos = 0;
    const divCarritoModalContenido = document.querySelector(
      "#carritoModalContenido"
    );

    divCarritoModalContenido.innerHTML = "";

    for (const producto of this.carrito) {
      divCarritoModalContenido.innerHTML += `
              <div class="productoCarrito">
                <h2>${producto.nombre}</h2>
                <p>$${producto.precio}</p>
                <p>Cantidad:${producto.cantidad}</p>
                <a href="#" class="btnQuitar btn btn-danger bold" data-id="${producto.id}">Quitar</a>
              </div>
            `;
      this.total += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
    }

    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        const idProducto = +boton.dataset.id;
        this.quitar(idProducto);
      });
    }

    const spanCantidadProductosModal = document.querySelector(
      "#cantidadProductosModal"
    );
    const spanTotalCarritoModal = document.querySelector("#totalCarritoModal");

    spanCantidadProductosModal.innerText = this.cantidadProductos;
    spanTotalCarritoModal.innerText = this.total;
  }
}

const bd = new BaseDeDatos();

const spanCantidadProductosModal = document.querySelector(
  "#cantidadProductosModal"
);
const spanTotalCarritoModal = document.querySelector("#totalCarritoModal");
const divProductos = document.querySelector("#productos");
const inputBuscar = document.querySelector("#inputBuscar");

const carrito = new Carrito();

cargarProductos(bd.traerRegistros());

function cargarProductos(productos) {
  const divProductos = document.querySelector("#productos");
  divProductos.innerHTML = "";

  let row = null;

  for (let i = 0; i < productos.length; i++) {
    if (i % 4 === 0) {
      row = document.createElement("div");
      row.classList.add("row-custom");
      divProductos.appendChild(row);
    }

    const producto = productos[i];

    const card = document.createElement("div");
    card.classList.add("card", "mb-4", "box-shadow", "card-custom");

    card.innerHTML = `
          <img src="${producto.imagen}" class="card-img-top" alt="Imagen del producto">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text precio">$${producto.precio}</p>
            <a href="#" class="btnAgregar btn btn-primary bold" data-id="${producto.id}">Agregar</a>
          </div>
        `;

    row.appendChild(card);
  }

  const botonesAgregar = document.querySelectorAll(".btnAgregar");

  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      const idProducto = +boton.dataset.id;
      const producto = bd.registroPorId(idProducto);
      carrito.agregar(producto);
    });
  }
}

inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});
