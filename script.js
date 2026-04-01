const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_RxbQZQ0nDUult_rjh40QWj7QT5p4KoHfHhPudwf1jMw8MyRrR3Y3g3Wqu6jdKmJP8KWx_IIy0HOO/pub?output=csv';
let carrito = [];
let categoriaActual = 'todos'; // Variable global para el filtro

let intervaladorPromo; // Variable global para el contador

async function init() {
    try {
        const res = await fetch(url);
        const data = await res.text();
        const rows = data.split('\n').slice(1).map(r => r.split(','));
        
        const promoContainer = document.getElementById('seccion-promociones');
        const prodContainer = document.getElementById('product-container');
        const catNav = document.getElementById('lista-categorias');
        
        let cats = new Set();
        let promosHtml = '';
        let prodsHtml = '';
        let fechaFinPromo = null; // Para guardar la fecha de expiración

        rows.forEach((row, index) => {
            if(!row[0] || row[0].trim() === "") return;
            
            const item = {
                id: index,
                cat: row[0].trim(),
                name: row[1].trim(),
                price: parseFloat(row[2]?.replace(/[^0-9.-]+/g,"")) || 0,
                now: parseFloat(row[3]?.replace(/[^0-9.-]+/g,"")) || 0,
                presentacion: row[4]?.trim() || '',
                desc: row[5]?.trim() || '',
                vencimiento: row[6]?.trim() || '' // Nueva Columna 7
            };

            const precioFinal = item.now > 0 ? item.now : item.price;

            if(item.cat.toLowerCase().includes('promocion')) {
                // --- LÓGICA DE VENCIMIENTO ---
                if(item.vencimiento) {
                    const partes = item.vencimiento.split('/');
                    // Formato: Año, Mes (0-11), Día, Hora
                    const fechaExp = new Date(partes[2], partes[1] - 1, partes[0], 23, 59, 59);
                    const ahora = new Date();

                    if (fechaExp < ahora) return; // Si ya pasó, no se agrega al HTML
                    
                    // Guardamos la fecha más próxima para el cronómetro
                    if (!fechaFinPromo || fechaExp < fechaFinPromo) {
                        fechaFinPromo = fechaExp;
                    }
                }

                promosHtml += `
                    <div class="promo-card" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <div style="flex: 1;">
                            <h4 style="color:var(--deep-magenta); font-size:1.2rem; margin: 0;">${item.name}</h4>
                            <span class="product-presentation">${item.presentacion}</span>
                            <p class="product-description" style="-webkit-line-clamp: 2; margin-top:10px;">${item.desc}</p>
                        </div>
                        <div class="price-container">
                            <div>
                                <span class="price-before" style="display: block; font-size: 0.8rem;">$${item.price.toLocaleString()}</span>
                                <span class="price-now">$${item.now.toLocaleString()}</span>
                            </div>
                            <button class="btn-add" onclick="agregarAlCarrito('${item.name}', ${precioFinal})">+</button>
                        </div>
                    </div>`;
            } else {
                cats.add(item.cat);
                prodsHtml += `
                    <div class="product-card" data-cat="${item.cat}" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <h4>${item.name}</h4>
                        <span class="product-presentation">${item.presentacion}</span>
                        <p class="product-description" style="margin-top:10px;">${item.desc}</p>
                        <div class="price-container">
                            <div class="price-now">$${item.price.toLocaleString()}</div>
                            <button class="btn-add" onclick="agregarAlCarrito('${item.name}', ${item.price})">+</button>
                        </div>
                    </div>`;
            }
        });

        // Renderizado de Promociones con el Cronómetro al lado del título
        if(promosHtml) {
            promoContainer.innerHTML = `
                <div class="promo-banner">
                    <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-bottom:20px; flex-wrap:wrap;">
                        <h2 style="color:var(--deep-magenta); margin:0;">✨ Ofertas ✨</h2>
                        <div id="promo-timer" style="background:var(--hot-pink); color:white; padding:5px 15px; border-radius:50px; font-weight:bold; font-size:0.9rem;">
                            Cargando...
                        </div>
                    </div>
                    <div class="promo-grid">${promosHtml}</div>
                </div>`;
            
            if(fechaFinPromo) iniciarCronometro(fechaFinPromo);
        } else {
            promoContainer.innerHTML = ''; // Si no hay promos vigentes, se limpia la sección
        }
        
        prodContainer.innerHTML = prodsHtml;

        // --- CATEGORÍAS ---
        catNav.innerHTML = '';
        
        // Botón Ver Todo
        const btnTodos = document.createElement('button');
        btnTodos.className = 'filter-btn active';
        btnTodos.innerText = 'Ver Todo';
        btnTodos.onclick = (e) => seleccionarCategoria('todos', e.target);
        catNav.appendChild(btnTodos);

        // Botón Promociones (Solo si hay promos vigentes)
        if(promosHtml) {
            const btnPromos = document.createElement('button');
            btnPromos.className = 'filter-btn';
            btnPromos.innerText = 'Promociones';
            btnPromos.onclick = (e) => seleccionarCategoria('promociones', e.target);
            catNav.appendChild(btnPromos);
        }
        
        cats.forEach(c => {
            if(c.toLowerCase().includes('promocion')) return;
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.innerText = c;
            btn.onclick = (e) => seleccionarCategoria(c, e.target);
            catNav.appendChild(btn);
        });

    } catch(e) {
        console.error("Error cargando el catálogo:", e);
    }
}

// --- FUNCIÓN DEL CRONÓMETRO ---
function iniciarCronometro(destino) {
    if(intervaladorPromo) clearInterval(intervaladorPromo);

    intervaladorPromo = setInterval(() => {
        const ahora = new Date().getTime();
        const diferencia = destino - ahora;

        if (diferencia <= 0) {
            clearInterval(intervaladorPromo);
            document.getElementById('seccion-promociones').innerHTML = '';
            return;
        }

        const d = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const h = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diferencia % (1000 * 60)) / 1000);

        const timerDisplay = document.getElementById('promo-timer');
        if(timerDisplay) {
            timerDisplay.innerHTML = `Termina en: ${d}d ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}

// --- LÓGICA DE FILTROS (REPARADA) ---
function seleccionarCategoria(cat, btn) {
    categoriaActual = cat;
    
    // Actualizar estados visuales de los botones
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Cambiar título
    document.getElementById('titulo-filtro').innerText = cat === 'todos' ? 'Nuestro Catálogo' : cat;
    
    ejecutarFiltros();

    // Scroll suave en móvil
    if(window.innerWidth < 992) {
        window.scrollTo({ top: document.getElementById('titulo-filtro').offsetTop - 100, behavior: 'smooth' });
    }
}

function ejecutarFiltros() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const productos = document.querySelectorAll('.product-card');
    const bannerPromos = document.querySelector('.promo-banner');
    const promoCards = document.querySelectorAll('.promo-card');

    // Lógica para el Banner de Promociones
    // Solo se muestra si la categoría es 'todos' o 'promociones'
    const mostrarSeccionPromos = (categoriaActual === 'todos' || categoriaActual === 'promociones');
    
    if (bannerPromos) {
        let promosVisibles = 0;
        promoCards.forEach(promo => {
            const matchesSearch = promo.getAttribute('data-name').includes(query) || 
                                  promo.getAttribute('data-desc').includes(query);
            
            // La tarjeta individual se muestra si coincide con la búsqueda Y la categoría lo permite
            const visible = mostrarSeccionPromos && matchesSearch;
            promo.classList.toggle('hidden', !visible);
            if(visible) promosVisibles++;
        });

        // Ocultar todo el bloque si no hay promos que mostrar
        bannerPromos.classList.toggle('hidden', promosVisibles === 0);
    }

    // Lógica para Productos Normales
    productos.forEach(p => {
        const pCat = p.getAttribute('data-cat');
        const pName = p.getAttribute('data-name');
        const pDesc = p.getAttribute('data-desc');

        // Si elegimos 'promociones', ocultamos todos los productos normales
        const coincideCat = (categoriaActual === 'promociones') ? false : (categoriaActual === 'todos' || pCat === categoriaActual);
        const coincideBusqueda = (pName.includes(query) || pDesc.includes(query));

        p.classList.toggle('hidden', !(coincideCat && coincideBusqueda));
    });
}

// --- LÓGICA DEL CARRITO (MANTENIDA) ---
function agregarAlCarrito(nombre, precio) {
    const itemExistente = carrito.find(i => i.nombre === nombre);
    if(itemExistente) {
        itemExistente.cant++;
    } else {
        carrito.push({ nombre, precio, cant: 1 });
    }
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    const count = carrito.reduce((acc, item) => acc + item.cant, 0);
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0);
    
    document.getElementById('cart-count').innerText = count;
    document.getElementById('cart-total-btn').innerText = `$${total.toLocaleString()}`;
    document.getElementById('cart-total-price').innerText = `$${total.toLocaleString()}`;
    
    const btnFlotante = document.getElementById('cart-floating-btn');
    if(count > 0) {
        btnFlotante.classList.remove('cart-btn-hidden');
    } else {
        btnFlotante.classList.add('cart-btn-hidden');
    }

    const container = document.getElementById('cart-items-container');
    container.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h5>${item.nombre}</h5>
                <span>$${item.precio.toLocaleString()}</span>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="cambiarCant(${index}, -1)">-</button>
                <span>${item.cant}</span>
                <button class="qty-btn" onclick="cambiarCant(${index}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

function cambiarCant(index, delta) {
    carrito[index].cant += delta;
    if(carrito[index].cant <= 0) carrito.splice(index, 1);
    actualizarInterfazCarrito();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    
    drawer.classList.toggle('drawer-opened');
    overlay.style.display = drawer.classList.contains('drawer-opened') ? 'block' : 'none';
}

function enviarWhatsApp() {
    const nombre = document.getElementById('ship-name').value.trim();
    const direccion = document.getElementById('ship-address').value.trim();

    if(!nombre || !direccion) return alert("Por favor completa los datos de envío");
    if(carrito.length === 0) return alert("El carrito está vacío");

    let mensaje = `*NUEVO PEDIDO - RAYENBODY*%0A%0A`;
    mensaje += `*Cliente:* ${nombre}%0A`;
    mensaje += `*Dirección:* ${direccion}%0A%0A`;
    mensaje += `*PRODUCTOS:*%0A`;
    
    carrito.forEach(item => {
        mensaje += `- ${item.cant}x ${item.nombre} ($${(item.precio * item.cant).toLocaleString()})%0A`;
    });

    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0);
    mensaje += `%0A*TOTAL ESTIMADO: $${total.toLocaleString()}*`;

    const tel = "573001325698";
    window.open(`https://wa.me/${tel}?text=${mensaje}`, '_blank');
}

init();