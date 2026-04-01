const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_RxbQZQ0nDUult_rjh40QWj7QT5p4KoHfHhPudwf1jMw8MyRrR3Y3g3Wqu6jdKmJP8KWx_IIy0HOO/pub?output=csv';
let carrito = [];
let categoriaActual = 'todos'; // Variable global para el filtro

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

        rows.forEach((row, index) => {
            if(!row[0] || row[0].trim() === "") return;
            
            const item = {
                id: index,
                cat: row[0].trim(),
                name: row[1].trim(),
                price: parseFloat(row[2]?.replace(/[^0-9.-]+/g,"")) || 0,
                now: parseFloat(row[3]?.replace(/[^0-9.-]+/g,"")) || 0,
                desc: row[5]?.trim() || ''
            };

            const precioFinal = item.now > 0 ? item.now : item.price;

            if(item.cat.toLowerCase().includes('promocion')) {
                promosHtml += `
                    <div class="promo-card" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <h4 style="color:var(--deep-magenta); font-size:1.2rem;">${item.name}</h4>
                        <p class="desc-text">${item.desc}</p>
                        <div style="margin: 15px 0;">
                            <span class="price-before">$${item.price}</span>
                            <span class="price-now">$${item.now}</span>
                        </div>
                        <button class="btn-add" onclick="agregarAlCarrito('${item.name}', ${precioFinal})">Aprovechar Oferta</button>
                    </div>`;
            } else {
                cats.add(item.cat);
                prodsHtml += `
                    <div class="product-card" data-cat="${item.cat}" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <span style="font-size:0.6rem; color:var(--hot-pink); font-weight:800;">${item.cat.toUpperCase()}</span>
                        <h4 style="margin: 8px 0; min-height:40px;">${item.name}</h4>
                        <div class="price-now" style="margin-top:auto;">$${item.price}</div>
                        <button class="btn-add" onclick="agregarAlCarrito('${item.name}', ${item.price})">Añadir al Carrito</button>
                    </div>`;
            }
        });

        if(promosHtml) {
            promoContainer.innerHTML = `
                <div class="promo-banner">
                    <h2 style="text-align:center; color:var(--deep-magenta); margin-bottom:20px;">✨ Ofertas ✨</h2>
                    <div class="promo-grid">${promosHtml}</div>
                </div>`;
        }
        
        prodContainer.innerHTML = prodsHtml;
        
        // Limpiar categorías previas (excepto "Ver Todo") y agregar las nuevas
        const btnTodos = catNav.querySelector('button[data-cat="todos"]');
        catNav.innerHTML = '';
        catNav.appendChild(btnTodos);
        
        cats.forEach(c => {
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
    
    // 1. Filtrar Productos del Catálogo
    const productos = document.querySelectorAll('.product-card');
    productos.forEach(p => {
        const pCat = p.getAttribute('data-cat');
        const pName = p.getAttribute('data-name');
        const pDesc = p.getAttribute('data-desc');

        const coincideCat = (categoriaActual === 'todos' || pCat === categoriaActual);
        const coincideBusqueda = (pName.includes(query) || pDesc.includes(query));

        p.classList.toggle('hidden', !(coincideCat && coincideBusqueda));
    });

    // 2. Filtrar Promociones
    const promociones = document.querySelectorAll('.promo-card');
    let promosVisibles = 0;

    promociones.forEach(promo => {
        const promoName = promo.getAttribute('data-name');
        const promoDesc = promo.getAttribute('data-desc');
        
        const coincideBusqueda = (promoName.includes(query) || promoDesc.includes(query));
        
        if (coincideBusqueda) {
            promo.classList.remove('hidden');
            promosVisibles++;
        } else {
            promo.classList.add('hidden');
        }
    });

    // 3. Ocultar el contenedor completo de promociones si ninguna coincide
    const bannerPromos = document.querySelector('.promo-banner');
    if (bannerPromos) {
        bannerPromos.classList.toggle('hidden', promosVisibles === 0);
    }
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