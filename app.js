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
    this.cargarRegistros();
  }

  async cargarRegistros() {
    const resultado = await fetch("./json/productos.json");
    this.productos = await resultado.json();
    cargarProductos(this.productos);
    console.log(this.productos);
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

  registrosPorCategoria(categoria) {
    return this.productos.filter((producto) => producto.categoria == categoria);
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

  vaciar() {
    this.total = 0;
    this.cantidadProductos = 0;
    this.carrito = [];
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  listar() {
    this.total = 0;
    this.cantidadProductos = 0;
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
    const productosSeleccionadosTitulo = document.getElementById(
      "productosSeleccionadosTitulo"
    );
    const totalTitulo = document.getElementById("totalTitulo");

    if (this.cantidadProductos === 0) {
      productosSeleccionadosTitulo.style.display = "none";
      totalTitulo.style.display = "none";
    } else {
      productosSeleccionadosTitulo.style.display = "block";
      totalTitulo.style.display = "block";
    }
    spanCantidadProductosModal.innerText = this.cantidadProductos;
    spanTotalCarritoModal.innerText = this.total;
  }
}

const spanCantidadProductosModal = document.querySelector(
  "#cantidadProductosModal"
);
const divCarritoModalContenido = document.querySelector(
  "#carritoModalContenido"
);
const spanTotalCarritoModal = document.querySelector("#totalCarritoModal");
const divProductos = document.querySelector("#productos");
const inputBuscar = document.querySelector("#inputBuscar");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategoria = document.querySelectorAll(".btnCategoria");

const bd = new BaseDeDatos();

const carrito = new Carrito();

botonesCategoria.forEach((boton) => {
  boton.addEventListener("click", () => {
    const categoria = boton.dataset.categoria;
    if (categoria == "todas") {
      cargarProductos(bd.traerRegistros());
    } else {
      cargarProductos(bd.registrosPorCategoria(categoria));
    }
  });
});

cargarProductos(bd.traerRegistros());

function cargarProductos(productos) {
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
      Swal.fire({
        icon: "success",
        title: "Producto agregado al carrito",
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }
}

inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});

botonComprar.addEventListener("click", (event) => {
  event.preventDefault();
  if (carrito.cantidadProductos === 0) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "El carrito está vacío",
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Compra realizada",
      showConfirmButton: false,
      timer: 1500,
    });
    carrito.vaciar();
  }
});
