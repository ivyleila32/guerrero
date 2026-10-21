"use strict"; // Activa reglas estrictas para detectar errores comunes de JavaScript.

// ===================== Dominio =====================

// Clase que representa un arma (existe por sí sola)
class Arma {
    constructor(nombre, danio, icono) {
        this.nombre = nombre; // Guarda el nombre del arma.
        this.danio = danio; // Guarda cuánto daño agrega el arma.
        this.icono = icono; // Guarda el símbolo visual del arma.
    }
}

// Clase que representa al guerrero
class Guerrero {
    // Etapas de evolución: [vida, fuerza, defensa] que se ganan al alcanzarla
    static ETAPAS = [ // Define los requisitos y las mejoras de cada etapa.
        { xp: 0,   titulo: "Aprendiz",         bonus: [0, 0, 0] },
        { xp: 40,  titulo: "Guerrero",         bonus: [30, 5, 3] },
        { xp: 100, titulo: "Caballero",        bonus: [40, 5, 3] },
        { xp: 180, titulo: "Héroe legendario", bonus: [50, 8, 5] }
    ];

    constructor(nombre, fuerza, arma) {
        this.nombre = nombre; // Guarda el nombre del guerrero.
        this.fuerza = fuerza; // Define la fuerza inicial del guerrero.
        this.arma = arma; // AGREGACIÓN: conserva una referencia al arma creada aparte.
        this.armas = [arma]; // Inicializa la mochila con el arma inicial.
        this.vidaMax = 100; // Define el máximo inicial de vida.
        this.vida = 100; // Define la vida actual inicial.
        this.defensa = 1; // Define la defensa inicial.
        this.xp = 0; // Inicializa la experiencia acumulada.
        this.etapa = 0; // Inicia al guerrero en la primera etapa.
    }

    // Permite cambiar el arma equipada
    cambiarArma(nuevaArma) {
        this.arma = nuevaArma; // Equipa el arma recibida.
    }

    // Daño total de un golpe: fuerza + daño del arma
    poderAtaque() {
        return this.fuerza + this.arma.danio; // Suma la fuerza y el daño del arma.
    }

    // Permite atacar utilizando el arma actual
    atacar() {
        return `${this.nombre} ataca con ${this.arma.nombre} ` + // Prepara el texto con el nombre y el arma.
               `y causa ${this.poderAtaque()} puntos de daño.`;
    }

    curar(cantidad) {
        this.vida = Math.min(this.vidaMax, this.vida + cantidad); // Cura sin superar la vida máxima.
    }

    // Suma experiencia; si cambia de etapa devuelve el mensaje de evolución
    ganarXp(cantidad) {
        this.xp += cantidad; // Agrega la experiencia obtenida.
        const siguiente = Guerrero.ETAPAS[this.etapa + 1]; // Busca la etapa siguiente.
        if (siguiente && this.xp >= siguiente.xp) { // Comprueba si existe y se alcanzó esa etapa.
            this.etapa++; // Avanza una etapa.
            const [v, f, d] = siguiente.bonus; // Separa las mejoras de vida, fuerza y defensa.
            this.vidaMax += v; // Aumenta la vida máxima.
            this.vida = this.vidaMax; // Restaura la vida al nuevo máximo.
            this.fuerza += f; // Aplica la mejora de fuerza.
            this.defensa += d; // Aplica la mejora de defensa.
            return `¡${this.nombre} evoluciona a ${siguiente.titulo}! ` + // Devuelve el anuncio de evolución.
                   `Vida +${v}, fuerza +${f}, defensa +${d}.`;
        }
        return null; // Indica que no hubo evolución.
    }
}

// Objetos que se encuentran en el circuito
class Objeto {
    constructor(icono) { this.icono = icono; } // Guarda el icono común del objeto.
    aplicar(guerrero) { return { texto: "", tipo: "" }; } // Define la operación base de un objeto.
}

class ObjetoArma extends Objeto {
    constructor(arma) { super("⚔️"); this.arma = arma; } // Inicializa el objeto y guarda el arma encontrada.
    aplicar(g) {
        g.armas.push(this.arma); // Agrega el arma encontrada a la mochila.
        return { texto: `Encontraste ${this.arma.icono} ${this.arma.nombre} (daño ${this.arma.danio}). ¡Ya podés equiparla!`, tipo: "bien" }; // Devuelve el mensaje y su estilo.
    }
}

class Pocion extends Objeto {
    constructor() { super("🧪"); } // Crea una poción con su icono.
    aplicar(g) { g.curar(40); return { texto: "Poción: recuperás 40 de vida.", tipo: "bien" }; } // Cura al guerrero y devuelve el mensaje.
}

class Armadura extends Objeto {
    constructor() { super("🛡️"); } // Crea una armadura con su icono.
    aplicar(g) { g.defensa += 2; return { texto: "Armadura: defensa +2.", tipo: "bien" }; } // Aumenta la defensa y devuelve el mensaje.
}

class Amuleto extends Objeto {
    constructor() { super("💪"); } // Crea un amuleto con su icono.
    aplicar(g) { g.fuerza += 3; return { texto: "Amuleto: fuerza +3.", tipo: "bien" }; } // Aumenta la fuerza y devuelve el mensaje.
}

class Experiencia extends Objeto {
    constructor() { super("✨"); } // Crea un orbe de experiencia.
    aplicar() { return { texto: "Orbe de experiencia: +20 XP.", tipo: "bien", xp: 20 }; } // Informa que se deben sumar 20 puntos de experiencia.
}

class Enemigo extends Objeto {
    constructor(vuelta) {
        super("👹"); // Asigna el icono de enemigo.
        this.vida = 90 + vuelta * 40; // Aumenta la vida del enemigo según la vuelta.
        this.ataque = 10 + vuelta * 4; // Aumenta el ataque del enemigo según la vuelta.
    }
    aplicar(g) {
        let vidaEnemigo = this.vida; // Copia la vida para iniciar el combate.
        while (vidaEnemigo > 0 && g.vida > 0) { // Repite los golpes mientras ambos sigan en pie.
            vidaEnemigo -= g.poderAtaque() + Math.floor(Math.random() * 6); // Resta el daño del golpe con un pequeño valor aleatorio.
            if (vidaEnemigo > 0) g.vida -= Math.max(2, this.ataque - g.defensa); // Si el enemigo sobrevive, contraataca con daño mínimo de 2.
        }
        if (g.vida <= 0) {
            return { texto: "Un enemigo te derrota. Volvés a la salida con la mitad de vida.", tipo: "mal", derrota: true }; // Informa la derrota para que el turno la gestione.
        }
        return { texto: `Vencés a un enemigo con ${g.arma.nombre} (te quedan ${g.vida} de vida). +25 XP.`, tipo: "bien", xp: 25 }; // Informa la victoria y la experiencia ganada.
    }
}

// ===================== Datos del juego =====================

// Armas independientes (las tres originales + dos nuevas)
const espada = new Arma("Espada", 25, "⚔️"); // Crea la espada inicial.
const hacha = new Arma("Hacha", 35, "🪓"); // Crea un hacha que puede encontrarse.
const lanza = new Arma("Lanza", 20, "🔱"); // Crea una lanza que puede encontrarse.
const martillo = new Arma("Martillo", 45, "🔨"); // Crea un martillo que puede encontrarse.
const espadaFuego = new Arma("Espada de fuego", 55, "🗡️"); // Crea el arma más poderosa del circuito.

// El guerrero empieza con la espada
const guerrero = new Guerrero("Ragnar", 10, espada); // Crea al personaje con fuerza 10 y la espada equipada.

// Circuito: perímetro de una grilla de 8 x 6 (24 casillas)
const COLUMNAS = 8, FILAS = 6; // Define el tamaño de la grilla.
const RUTA = []; // Reserva la lista de casillas del perímetro.
for (let c = 1; c <= COLUMNAS; c++) RUTA.push([1, c]); // Agrega las casillas de la fila superior.
for (let f = 2; f <= FILAS; f++) RUTA.push([f, COLUMNAS]); // Agrega el borde derecho sin repetir la esquina.
for (let c = COLUMNAS - 1; c >= 1; c--) RUTA.push([FILAS, c]); // Agrega las casillas de la fila inferior hacia la izquierda.
for (let f = FILAS - 1; f >= 2; f--) RUTA.push([f, 1]); // Agrega el borde izquierdo hacia arriba sin repetir esquinas.

// null = casilla vacía. H/L/M/F = armas, P/R/A/X/E = otros objetos
const PLAN = [null, "H", "P", "E", "X", "R", "E", "P", "L", "A", "E", "X", // Describe los objetos de cada casilla en orden.
              "M", "P", "E", "R", "X", "F", "E", "A", "P", "X", "E", "R"];

function crearObjeto(clave, vuelta) {
    const fabrica = { // Asocia cada código del plan con la creación de su objeto.
        H: () => new ObjetoArma(hacha),
        L: () => new ObjetoArma(lanza),
        M: () => new ObjetoArma(martillo),
        F: () => new ObjetoArma(espadaFuego),
        P: () => new Pocion(),
        R: () => new Armadura(),
        A: () => new Amuleto(),
        X: () => new Experiencia(),
        E: () => new Enemigo(vuelta)
    };
    return clave ? fabrica[clave]() : null; // Crea el objeto indicado o devuelve null si la casilla está vacía.
}

let posicion = 0, vuelta = 0, ocupado = false; // Guarda la posición, la vuelta actual y si el turno está en curso.
let casillas = []; // Guarda los objetos presentes en cada casilla.

function reponerObjetos() {
    casillas = PLAN.map(clave => crearObjeto(clave, vuelta)); // Vuelve a crear los objetos y escala enemigos según la vuelta.
}

// ===================== Dibujo del muñeco (SVG) =====================

function muneco(etapa, arma) {
    const c = [{ t: "#8a5a2b", a: "#c99a62" }, { t: "#2f5d8a", a: "#9aa7b4" }, // Elige colores del personaje según su evolución.
               { t: "#6b7683", a: "#d3dae1" }, { t: "#c9a227", a: "#ffe08a" }][etapa];
    const piel = "#f0c9a0", oscuro = "#3a2f26"; // Define los colores usados en el dibujo.
    let s = `<svg viewBox="-8 -8 76 88" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Guerrero">`; // Inicia el SVG accesible del personaje.
    if (etapa === 3) s += `<path d="M20 30 L8 70 L52 70 L40 30Z" fill="#a32626"/>`; // Dibuja una capa en la etapa máxima.
    s += `<rect x="21" y="56" width="7" height="17" rx="3" fill="${oscuro}"/><rect x="32" y="56" width="7" height="17" rx="3" fill="${oscuro}"/>`; // Dibuja las piernas.
    s += `<rect x="18" y="71" width="11" height="5" rx="2.5" fill="#222"/><rect x="31" y="71" width="11" height="5" rx="2.5" fill="#222"/>`; // Dibuja las botas.
    s += `<rect x="41" y="32" width="7" height="19" rx="3.5" fill="${piel}"/>`; // Dibuja el brazo derecho.
    s += `<rect x="19" y="30" width="22" height="29" rx="6" fill="${c.t}"/><rect x="19" y="48" width="22" height="4" fill="${oscuro}"/>`; // Dibuja el torso y el cinturón.
    s += `<rect x="12" y="32" width="7" height="19" rx="3.5" fill="${piel}"/>`; // Dibuja el brazo izquierdo.
    if (etapa >= 1) s += `<path d="M4 36 H20 V48 Q12 58 4 48Z" fill="${c.a}" stroke="${oscuro}" stroke-width="1.5"/>`; // Dibuja el escudo a partir de la segunda etapa.
    s += `<circle cx="30" cy="20" r="11" fill="${piel}"/><circle cx="26" cy="21" r="1.5" fill="#222"/><circle cx="34" cy="21" r="1.5" fill="#222"/><path d="M26 26 Q30 29 34 26" stroke="#222" fill="none" stroke-width="1.3"/>`; // Dibuja la cara y sus rasgos.
    if (etapa === 0) s += `<path d="M19 19 A11 11 0 0 1 41 19 Q30 12 19 19Z" fill="#5a3a1e"/>`; // Dibuja el cabello del aprendiz.
    if (etapa >= 1) s += `<path d="M19 20 A11 11 0 0 1 41 20 Z" fill="${c.a}" stroke="${oscuro}" stroke-width="1"/>`; // Dibuja el casco de las etapas avanzadas.
    if (etapa === 2) s += `<path d="M30 8 Q40 -4 48 6 Q38 6 33 12Z" fill="#a32626"/>`; // Añade un adorno al casco del caballero.
    if (etapa === 3) s += `<path d="M20 12 L23 2 L30 9 L37 2 L40 12Z" fill="#ffd23f" stroke="#8a6a00" stroke-width="1"/>`; // Añade una corona en la etapa máxima.
    if (arma) s += `<text x="52" y="46" font-size="26" text-anchor="middle">${arma.icono}</text>`; // Muestra el icono del arma equipada.
    return s + `<circle cx="44.5" cy="51" r="3.6" fill="${piel}"/></svg>`; // Cierra el dibujo y lo devuelve.
}

// ===================== Interfaz =====================

const $ = id => document.getElementById(id); // Atajo para buscar elementos HTML por su identificador.

function registrar(texto, tipo = "") {
    const li = document.createElement("li"); // Crea una nueva entrada para el registro.
    li.className = tipo; // Asigna una clase para colorear el mensaje.
    li.textContent = texto; // Inserta el mensaje como texto.
    $("registro").prepend(li); // Agrega la entrada al principio del registro.
}

function decir(texto) {
    $("mensaje").textContent = texto; // Actualiza el mensaje principal de la interfaz.
}

// Actualiza la información de la interfaz
function actualizarPantalla() {
    const etapa = Guerrero.ETAPAS[guerrero.etapa]; // Obtiene los datos de la etapa actual.
    const siguiente = Guerrero.ETAPAS[guerrero.etapa + 1]; // Obtiene la etapa siguiente, si existe.

    $("muneco").innerHTML = muneco(guerrero.etapa, guerrero.arma); // Dibuja al guerrero en la interfaz.
    $("nombreGuerrero").textContent = guerrero.nombre; // Muestra su nombre.
    $("etapa").textContent = etapa.titulo; // Muestra su etapa.
    $("fuerza").textContent = guerrero.fuerza; // Muestra su fuerza.
    $("defensa").textContent = guerrero.defensa; // Muestra su defensa.

    $("barraVida").style.width = (guerrero.vida / guerrero.vidaMax * 100) + "%"; // Ajusta la barra de vida según el porcentaje actual.
    $("textoVida").textContent = `${guerrero.vida} / ${guerrero.vidaMax}`; // Muestra la vida actual y la máxima.

    const base = etapa.xp; // Guarda la experiencia mínima de la etapa actual.
    const porcentaje = siguiente ? (guerrero.xp - base) / (siguiente.xp - base) * 100 : 100; // Calcula el progreso hacia la siguiente etapa.
    $("barraXp").style.width = Math.min(100, porcentaje) + "%"; // Actualiza la barra sin permitir más del 100 %.
    $("textoXp").textContent = siguiente // Muestra el progreso a la siguiente etapa o el estado máximo.
        ? `${guerrero.xp} / ${siguiente.xp} para ser ${siguiente.titulo}`
        : `${guerrero.xp} (etapa máxima)`;

    $("nombreArma").textContent = guerrero.arma.nombre; // Muestra el nombre del arma equipada.
    $("danioArma").textContent = guerrero.arma.danio; // Muestra el daño del arma.
    $("iconoArma").textContent = guerrero.arma.icono; // Muestra el icono del arma.

    // Botones de la mochila: uno por cada arma que tiene el guerrero
    const contenedor = $("botonesArmas"); // Obtiene el espacio de los botones de armas.
    contenedor.innerHTML = ""; // Limpia los botones anteriores antes de regenerarlos.
    guerrero.armas.forEach(arma => {
        const b = document.createElement("button"); // Crea un botón para esta arma.
        b.textContent = `${arma.icono} ${arma.nombre}`; // Muestra el icono y el nombre.
        if (arma === guerrero.arma) b.className = "activo"; // Resalta el arma actualmente equipada.
        b.addEventListener("click", () => cambiarArma(arma.nombre)); // Equipa el arma al hacer clic.
        contenedor.appendChild(b); // Agrega el botón al contenedor.
    });

    dibujarTablero();
}

function dibujarTablero() {
    const tablero = $("tablero"); // Obtiene la grilla del circuito.
    tablero.innerHTML = ""; // Borra el dibujo anterior del tablero.
    RUTA.forEach(([fila, col], i) => {
        const d = document.createElement("div"); // Crea la casilla actual.
        const objeto = casillas[i]; // Consulta el objeto ubicado en esta posición.
        d.className = "casilla" + (i === 0 ? " inicio" : "") + // Asigna la clase base y marca la salida.
                      (i === posicion ? " aqui" : "") +
                      (i !== 0 && !objeto ? " usada" : "");
        d.style.gridRow = fila; // Ubica la casilla en la fila correspondiente.
        d.style.gridColumn = col; // Ubica la casilla en la columna correspondiente.
        d.textContent = i === 0 ? "Salida" : (objeto ? objeto.icono : "·"); // Muestra la salida, el objeto o un punto vacío.
        if (i === posicion) { // Comprueba si el guerrero está en esta casilla.
            const h = document.createElement("div"); // Crea el contenedor del personaje.
            h.className = "heroe"; // Aplica los estilos de posición y animación.
            h.innerHTML = muneco(guerrero.etapa, guerrero.arma); // Dibuja al guerrero en la casilla.
            d.appendChild(h); // Agrega el personaje a la casilla.
        }
        tablero.appendChild(d); // Agrega la casilla al tablero.
    });

    const centro = document.createElement("div"); // Crea el área central del tablero.
    centro.className = "centro"; // Centra visualmente el dado y sus controles.
    centro.innerHTML = `<div class="dado">🎲</div>
        <button id="btnDado">Tirar dado</button>
        <small>Vuelta ${vuelta + 1}</small>`;
    tablero.appendChild(centro); // Inserta el área central en el tablero.
    $("btnDado").disabled = ocupado; // Desactiva el dado si ya hay un turno en curso.
    $("btnDado").addEventListener("click", turno); // Inicia un turno al pulsar el botón.
}

// Cambia el arma del guerrero (busca en su mochila por nombre)
function cambiarArma(nombre) {
    const nueva = guerrero.armas.find(a => a.nombre === nombre); // Busca en la mochila el arma seleccionada.
    if (!nueva) return; // Termina si no se encontró el arma.
    guerrero.cambiarArma(nueva); // Equipa el arma encontrada.
    actualizarPantalla(); // Refresca los datos y los botones.
    decir("¡" + guerrero.nombre + " ahora usa " + guerrero.arma.nombre + "!"); // Confirma el cambio de arma.
}

// Ejecuta un ataque
function atacar() {
    decir(guerrero.atacar()); // Muestra el resultado del ataque.
}

// ===================== Turno en el circuito =====================

const esperar = ms => new Promise(r => setTimeout(r, ms)); // Crea una pausa asíncrona en milisegundos.

async function turno() {
    if (ocupado) return; // Evita iniciar otro turno mientras el actual está activo.
    ocupado = true; // Bloquea nuevos turnos hasta terminar el movimiento.
    const pasos = 1 + Math.floor(Math.random() * 4); // Simula un dado que avanza entre 1 y 4 casillas.
    registrar(`Dado: ${pasos}`); // Registra el resultado del dado.

    for (let i = 0; i < pasos; i++) {
        posicion = (posicion + 1) % RUTA.length; // Avanza una casilla y vuelve al inicio al completar el circuito.
        if (posicion === 0) { // Comprueba si se completó una vuelta.
            vuelta++; // Incrementa el contador de vueltas.
            reponerObjetos(); // Repone los objetos y actualiza la dificultad de los enemigos.
            registrar(`Completaste la vuelta ${vuelta}. Los objetos reaparecen y los enemigos son más fuertes.`, "evo"); // Anuncia la vuelta completada.
        }
        actualizarPantalla(); // Dibuja la posición nueva.
        await esperar(220); // Espera brevemente para animar el movimiento paso a paso.
    }

    const objeto = casillas[posicion]; // Obtiene el objeto de la casilla donde terminó el movimiento.
    if (objeto) { // Aplica el efecto únicamente si había un objeto.
        const res = objeto.aplicar(guerrero); // Ejecuta el efecto del objeto sobre el guerrero.
        registrar(res.texto, res.tipo); // Añade el resultado al registro.
        decir(res.texto); // Muestra el resultado como mensaje principal.
        casillas[posicion] = null; // Retira el objeto para que no se recoja otra vez.
        if (res.derrota) { // Comprueba si el resultado fue una derrota.
            guerrero.vida = Math.ceil(guerrero.vidaMax / 2); // Devuelve al guerrero con la mitad de vida, redondeada hacia arriba.
            posicion = 0; // Devuelve al guerrero a la salida.
        }
        const evolucion = res.xp ? guerrero.ganarXp(res.xp) : null; // Suma experiencia si el objeto la otorgó.
        if (evolucion) { // Comprueba si la experiencia produjo una evolución.
            registrar(evolucion, "evo"); // Registra el mensaje de evolución.
            decir(evolucion); // Muestra la evolución en el mensaje principal.
        }
    }

    ocupado = false; // Habilita el inicio de otro turno.
    actualizarPantalla(); // Refresca la interfaz al finalizar el turno.
}

// ===================== Inicio =====================

$("btnAtacar").addEventListener("click", atacar); // Conecta el botón de ataque con su función.
reponerObjetos(); // Coloca los objetos iniciales en el circuito.
registrar("Pulsá «Tirar dado» para avanzar por el circuito."); // Añade las instrucciones iniciales al registro.
actualizarPantalla(); // Dibuja el estado inicial del juego.
