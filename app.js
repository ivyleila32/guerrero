"use strict";

// ===================== Dominio =====================

// Clase que representa un arma (existe por sí sola)
class Arma {
    constructor(nombre, danio, icono) {
        this.nombre = nombre;
        this.danio = danio;
        this.icono = icono;
    }
}

// Clase que representa al guerrero
class Guerrero {
    // Etapas de evolución: [vida, fuerza, defensa] que se ganan al alcanzarla
    static ETAPAS = [
        { xp: 0,   titulo: "Aprendiz",         bonus: [0, 0, 0] },
        { xp: 40,  titulo: "Guerrero",         bonus: [30, 5, 3] },
        { xp: 100, titulo: "Caballero",        bonus: [40, 5, 3] },
        { xp: 180, titulo: "Héroe legendario", bonus: [50, 8, 5] }
    ];

    constructor(nombre, fuerza, arma) {
        this.nombre = nombre;
        this.fuerza = fuerza;
        this.arma = arma;          // AGREGACIÓN: referencia a un Arma externa
        this.armas = [arma];       // mochila con las armas que va encontrando
        this.vidaMax = 100;
        this.vida = 100;
        this.defensa = 1;
        this.xp = 0;
        this.etapa = 0;
    }

    // Permite cambiar el arma equipada
    cambiarArma(nuevaArma) {
        this.arma = nuevaArma;
    }

    // Daño total de un golpe: fuerza + daño del arma
    poderAtaque() {
        return this.fuerza + this.arma.danio;
    }

    // Permite atacar utilizando el arma actual
    atacar() {
        return `${this.nombre} ataca con ${this.arma.nombre} ` +
               `y causa ${this.poderAtaque()} puntos de daño.`;
    }

    curar(cantidad) {
        this.vida = Math.min(this.vidaMax, this.vida + cantidad);
    }

    // Suma experiencia; si cambia de etapa devuelve el mensaje de evolución
    ganarXp(cantidad) {
        this.xp += cantidad;
        const siguiente = Guerrero.ETAPAS[this.etapa + 1];
        if (siguiente && this.xp >= siguiente.xp) {
            this.etapa++;
            const [v, f, d] = siguiente.bonus;
            this.vidaMax += v;
            this.vida = this.vidaMax;
            this.fuerza += f;
            this.defensa += d;
            return `¡${this.nombre} evoluciona a ${siguiente.titulo}! ` +
                   `Vida +${v}, fuerza +${f}, defensa +${d}.`;
        }
        return null;
    }
}

// Objetos que se encuentran en el circuito
class Objeto {
    constructor(icono) { this.icono = icono; }
    aplicar(guerrero) { return { texto: "", tipo: "" }; }
}

class ObjetoArma extends Objeto {
    constructor(arma) { super("⚔️"); this.arma = arma; }
    aplicar(g) {
        g.armas.push(this.arma);
        return { texto: `Encontraste ${this.arma.icono} ${this.arma.nombre} (daño ${this.arma.danio}). ¡Ya podés equiparla!`, tipo: "bien" };
    }
}

class Pocion extends Objeto {
    constructor() { super("🧪"); }
    aplicar(g) { g.curar(40); return { texto: "Poción: recuperás 40 de vida.", tipo: "bien" }; }
}

class Armadura extends Objeto {
    constructor() { super("🛡️"); }
    aplicar(g) { g.defensa += 2; return { texto: "Armadura: defensa +2.", tipo: "bien" }; }
}

class Amuleto extends Objeto {
    constructor() { super("💪"); }
    aplicar(g) { g.fuerza += 3; return { texto: "Amuleto: fuerza +3.", tipo: "bien" }; }
}

class Experiencia extends Objeto {
    constructor() { super("✨"); }
    aplicar() { return { texto: "Orbe de experiencia: +20 XP.", tipo: "bien", xp: 20 }; }
}

class Enemigo extends Objeto {
    constructor(vuelta) {
        super("👹");
        this.vida = 90 + vuelta * 40;
        this.ataque = 10 + vuelta * 4;
    }
    aplicar(g) {
        let vidaEnemigo = this.vida;
        while (vidaEnemigo > 0 && g.vida > 0) {
            vidaEnemigo -= g.poderAtaque() + Math.floor(Math.random() * 6);
            if (vidaEnemigo > 0) g.vida -= Math.max(2, this.ataque - g.defensa);
        }
        if (g.vida <= 0) {
            return { texto: "Un enemigo te derrota. Volvés a la salida con la mitad de vida.", tipo: "mal", derrota: true };
        }
        return { texto: `Vencés a un enemigo con ${g.arma.nombre} (te quedan ${g.vida} de vida). +25 XP.`, tipo: "bien", xp: 25 };
    }
}

// ===================== Datos del juego =====================

// Armas independientes (las tres originales + dos nuevas)
const espada = new Arma("Espada", 25, "⚔️");
const hacha = new Arma("Hacha", 35, "🪓");
const lanza = new Arma("Lanza", 20, "🔱");
const martillo = new Arma("Martillo", 45, "🔨");
const espadaFuego = new Arma("Espada de fuego", 55, "🗡️");

// El guerrero empieza con la espada
const guerrero = new Guerrero("Ragnar", 10, espada);

// Circuito: perímetro de una grilla de 8 x 6 (24 casillas)
const COLUMNAS = 8, FILAS = 6;
const RUTA = [];
for (let c = 1; c <= COLUMNAS; c++) RUTA.push([1, c]);
for (let f = 2; f <= FILAS; f++) RUTA.push([f, COLUMNAS]);
for (let c = COLUMNAS - 1; c >= 1; c--) RUTA.push([FILAS, c]);
for (let f = FILAS - 1; f >= 2; f--) RUTA.push([f, 1]);

// null = casilla vacía. H/L/M/F = armas, P/R/A/X/E = otros objetos
const PLAN = [null, "H", "P", "E", "X", "R", "E", "P", "L", "A", "E", "X",
              "M", "P", "E", "R", "X", "F", "E", "A", "P", "X", "E", "R"];

function crearObjeto(clave, vuelta) {
    const fabrica = {
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
    return clave ? fabrica[clave]() : null;
}

let posicion = 0, vuelta = 0, ocupado = false;
let casillas = [];

function reponerObjetos() {
    casillas = PLAN.map(clave => crearObjeto(clave, vuelta));
}

// ===================== Dibujo del muñeco (SVG) =====================

function muneco(etapa, arma) {
    const c = [{ t: "#8a5a2b", a: "#c99a62" }, { t: "#2f5d8a", a: "#9aa7b4" },
               { t: "#6b7683", a: "#d3dae1" }, { t: "#c9a227", a: "#ffe08a" }][etapa];
    const piel = "#f0c9a0", oscuro = "#3a2f26";
    let s = `<svg viewBox="-8 -8 76 88" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Guerrero">`;
    if (etapa === 3) s += `<path d="M20 30 L8 70 L52 70 L40 30Z" fill="#a32626"/>`;
    s += `<rect x="21" y="56" width="7" height="17" rx="3" fill="${oscuro}"/><rect x="32" y="56" width="7" height="17" rx="3" fill="${oscuro}"/>`;
    s += `<rect x="18" y="71" width="11" height="5" rx="2.5" fill="#222"/><rect x="31" y="71" width="11" height="5" rx="2.5" fill="#222"/>`;
    s += `<rect x="41" y="32" width="7" height="19" rx="3.5" fill="${piel}"/>`;
    s += `<rect x="19" y="30" width="22" height="29" rx="6" fill="${c.t}"/><rect x="19" y="48" width="22" height="4" fill="${oscuro}"/>`;
    s += `<rect x="12" y="32" width="7" height="19" rx="3.5" fill="${piel}"/>`;
    if (etapa >= 1) s += `<path d="M4 36 H20 V48 Q12 58 4 48Z" fill="${c.a}" stroke="${oscuro}" stroke-width="1.5"/>`;
    s += `<circle cx="30" cy="20" r="11" fill="${piel}"/><circle cx="26" cy="21" r="1.5" fill="#222"/><circle cx="34" cy="21" r="1.5" fill="#222"/><path d="M26 26 Q30 29 34 26" stroke="#222" fill="none" stroke-width="1.3"/>`;
    if (etapa === 0) s += `<path d="M19 19 A11 11 0 0 1 41 19 Q30 12 19 19Z" fill="#5a3a1e"/>`;
    if (etapa >= 1) s += `<path d="M19 20 A11 11 0 0 1 41 20 Z" fill="${c.a}" stroke="${oscuro}" stroke-width="1"/>`;
    if (etapa === 2) s += `<path d="M30 8 Q40 -4 48 6 Q38 6 33 12Z" fill="#a32626"/>`;
    if (etapa === 3) s += `<path d="M20 12 L23 2 L30 9 L37 2 L40 12Z" fill="#ffd23f" stroke="#8a6a00" stroke-width="1"/>`;
    if (arma) s += `<text x="52" y="46" font-size="26" text-anchor="middle">${arma.icono}</text>`;
    return s + `<circle cx="44.5" cy="51" r="3.6" fill="${piel}"/></svg>`;
}

// ===================== Interfaz =====================

const $ = id => document.getElementById(id);

function registrar(texto, tipo = "") {
    const li = document.createElement("li");
    li.className = tipo;
    li.textContent = texto;
    $("registro").prepend(li);
}

function decir(texto) {
    $("mensaje").textContent = texto;
}

// Actualiza la información de la interfaz
function actualizarPantalla() {
    const etapa = Guerrero.ETAPAS[guerrero.etapa];
    const siguiente = Guerrero.ETAPAS[guerrero.etapa + 1];

    $("muneco").innerHTML = muneco(guerrero.etapa, guerrero.arma);
    $("nombreGuerrero").textContent = guerrero.nombre;
    $("etapa").textContent = etapa.titulo;
    $("fuerza").textContent = guerrero.fuerza;
    $("defensa").textContent = guerrero.defensa;

    $("barraVida").style.width = (guerrero.vida / guerrero.vidaMax * 100) + "%";
    $("textoVida").textContent = `${guerrero.vida} / ${guerrero.vidaMax}`;

    const base = etapa.xp;
    const porcentaje = siguiente ? (guerrero.xp - base) / (siguiente.xp - base) * 100 : 100;
    $("barraXp").style.width = Math.min(100, porcentaje) + "%";
    $("textoXp").textContent = siguiente
        ? `${guerrero.xp} / ${siguiente.xp} para ser ${siguiente.titulo}`
        : `${guerrero.xp} (etapa máxima)`;

    $("nombreArma").textContent = guerrero.arma.nombre;
    $("danioArma").textContent = guerrero.arma.danio;
    $("iconoArma").textContent = guerrero.arma.icono;

    // Botones de la mochila: uno por cada arma que tiene el guerrero
    const contenedor = $("botonesArmas");
    contenedor.innerHTML = "";
    guerrero.armas.forEach(arma => {
        const b = document.createElement("button");
        b.textContent = `${arma.icono} ${arma.nombre}`;
        if (arma === guerrero.arma) b.className = "activo";
        b.addEventListener("click", () => cambiarArma(arma.nombre));
        contenedor.appendChild(b);
    });

    dibujarTablero();
}

function dibujarTablero() {
    const tablero = $("tablero");
    tablero.innerHTML = "";
    RUTA.forEach(([fila, col], i) => {
        const d = document.createElement("div");
        const objeto = casillas[i];
        d.className = "casilla" + (i === 0 ? " inicio" : "") +
                      (i === posicion ? " aqui" : "") +
                      (i !== 0 && !objeto ? " usada" : "");
        d.style.gridRow = fila;
        d.style.gridColumn = col;
        d.textContent = i === 0 ? "Salida" : (objeto ? objeto.icono : "·");
        if (i === posicion) {
            const h = document.createElement("div");
            h.className = "heroe";
            h.innerHTML = muneco(guerrero.etapa, guerrero.arma);
            d.appendChild(h);
        }
        tablero.appendChild(d);
    });

    const centro = document.createElement("div");
    centro.className = "centro";
    centro.innerHTML = `<div class="dado">🎲</div>
        <button id="btnDado">Tirar dado</button>
        <small>Vuelta ${vuelta + 1}</small>`;
    tablero.appendChild(centro);
    $("btnDado").disabled = ocupado;
    $("btnDado").addEventListener("click", turno);
}

// Cambia el arma del guerrero (busca en su mochila por nombre)
function cambiarArma(nombre) {
    const nueva = guerrero.armas.find(a => a.nombre === nombre);
    if (!nueva) return;
    guerrero.cambiarArma(nueva);
    actualizarPantalla();
    decir("¡" + guerrero.nombre + " ahora usa " + guerrero.arma.nombre + "!");
}

// Ejecuta un ataque
function atacar() {
    decir(guerrero.atacar());
}

// ===================== Turno en el circuito =====================

const esperar = ms => new Promise(r => setTimeout(r, ms));

async function turno() {
    if (ocupado) return;
    ocupado = true;
    const pasos = 1 + Math.floor(Math.random() * 4);
    registrar(`Dado: ${pasos}`);

    for (let i = 0; i < pasos; i++) {
        posicion = (posicion + 1) % RUTA.length;
        if (posicion === 0) {
            vuelta++;
            reponerObjetos();
            registrar(`Completaste la vuelta ${vuelta}. Los objetos reaparecen y los enemigos son más fuertes.`, "evo");
        }
        actualizarPantalla();
        await esperar(220);
    }

    const objeto = casillas[posicion];
    if (objeto) {
        const res = objeto.aplicar(guerrero);
        registrar(res.texto, res.tipo);
        decir(res.texto);
        casillas[posicion] = null;
        if (res.derrota) {
            guerrero.vida = Math.ceil(guerrero.vidaMax / 2);
            posicion = 0;
        }
        const evolucion = res.xp ? guerrero.ganarXp(res.xp) : null;
        if (evolucion) {
            registrar(evolucion, "evo");
            decir(evolucion);
        }
    }

    ocupado = false;
    actualizarPantalla();
}

// ===================== Inicio =====================

$("btnAtacar").addEventListener("click", atacar);
reponerObjetos();
registrar("Pulsá «Tirar dado» para avanzar por el circuito.");
actualizarPantalla();
