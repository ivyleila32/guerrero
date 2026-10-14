
"use strict";

// Clase que representa un arma
class Arma {
    constructor(nombre, danio, icono) {
        this.nombre = nombre;
        this.danio = danio;
        this.icono = icono;
    }
}

// Clase que representa al guerrero
class Guerrero {
    constructor(nombre, fuerza, arma) {
        this.nombre = nombre;
        this.fuerza = fuerza;
        this.arma = arma;
    }

    // Permite cambiar el arma equipada
    cambiarArma(nuevaArma) {
        this.arma = nuevaArma;
    }

    // Permite atacar utilizando el arma actual
    atacar() {
        return `${this.nombre} ataca con ${this.arma.nombre}
                y causa ${this.arma.danio} puntos de daño.`;
    }
}

// Creamos armas como objetos independientes
const espada = new Arma("Espada", 25, "⚔️");
const hacha = new Arma("Hacha", 35, "🪓");
const lanza = new Arma("Lanza", 20, "🔱");

// Creamos al guerrero y le asignamos la espada
const guerrero = new Guerrero("Ragnar", 80, espada);

// Actualiza la información de la interfaz
function actualizarPantalla() {
    document.getElementById("nombreGuerrero").textContent =
        guerrero.nombre;

    document.getElementById("fuerza").textContent =
        guerrero.fuerza;

    document.getElementById("nombreArma").textContent =
        guerrero.arma.nombre;

    document.getElementById("danioArma").textContent =
        guerrero.arma.danio;

    document.getElementById("iconoArma").textContent =
        guerrero.arma.icono;
}

// Cambia el arma del guerrero
function cambiarArma(tipo) {
    if (tipo === "espada") {
        guerrero.cambiarArma(espada);
    } else if (tipo === "hacha") {
        guerrero.cambiarArma(hacha);
    } else if (tipo === "lanza") {
        guerrero.cambiarArma(lanza);
    }

    actualizarPantalla();

    document.getElementById("mensaje").textContent =
        "¡" + guerrero.nombre + " ahora usa " +
        guerrero.arma.nombre + "!";
}

// Ejecuta un ataque
function atacar() {
    document.getElementById("mensaje").textContent =
        guerrero.atacar();
}

// Muestra los datos iniciales
actualizarPantalla();
