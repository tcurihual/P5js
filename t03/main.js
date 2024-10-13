let cartas = [];
let imagenes = [];
let cartaReverso;
let primeraCarta = null;
let segundaCarta = null;
let bloquear = false;
let puntaje = 0; // Inicializar puntaje
let intentos = 0; // Contador de intentos fallidos
const puntajeBase = 50; // Puntaje base por par correcto
const cartaAncho = 100;
const cartaAlto = 150;
let aciertos = 0; // Contador de pares encontrados
let puntajeGuardado = false; // Nueva variable para evitar guardar puntaje múltiples veces

function preload() {
  // Cargar las imágenes de las cartas
  cartaReverso = loadImage('back.png'); // Imagen de la parte trasera
  for (let i = 1; i <= 4; i++) {
    let img = loadImage(`front${i}.png`); // Imagenes de las cartas (front1.png, front2.png, etc.)
    imagenes.push(img, img); // Añadimos dos veces la misma imagen para formar los pares
  }
}

function setup() {
  createCanvas(600, 500);
  generarCartas();
  actualizarPuntaje();
  ocultarBotonReiniciar(); // Asegurarse de que el botón esté oculto al principio
  mostrarPuntajes(); // Mostrar los puntajes guardados al inicio
}

function draw() {
  background(241);
  dibujarCartas();
  verificarFinJuego(); // Verificar si el juego ha terminado
}

function mousePressed() {
  if (bloquear) return;

  for (let i = 0; i < cartas.length; i++) {
    let carta = cartas[i];

    if (mouseX > carta.x && mouseX < carta.x + cartaAncho && mouseY > carta.y && mouseY < carta.y + cartaAlto && !carta.volteada) {
      carta.volteada = true;

      if (primeraCarta === null) {
        primeraCarta = carta;
      } else {
        segundaCarta = carta;
        bloquear = true;

        setTimeout(() => {
          verificarCoincidencia();
        }, 1000);
      }
      break;
    }
  }
}

function generarCartas() {
  imagenes = shuffle(imagenes); // Mezclar las imágenes
  cartas = []; // Resetear cartas
  aciertos = 0; // Resetear aciertos
  intentos = 0; // Resetear intentos
  puntajeGuardado = false; // Resetear la variable de puntaje guardado

  for (let i = 0; i < 8; i++) {
    let x = (i % 4) * (cartaAncho + 10) + 30; // Ajustar para espaciar mejor
    let y = floor(i / 4) * (cartaAlto + 10) + 50;
    let imagen = imagenes[i];
    cartas.push({ x, y, imagen, volteada: false, acertada: false });
  }

  puntaje = 0; // Reiniciar el puntaje solo al iniciar un nuevo juego
  actualizarPuntaje();
}

function dibujarCartas() {
  for (let i = 0; i < cartas.length; i++) {
    let carta = cartas[i];

    if (carta.volteada || carta.acertada) {
      image(carta.imagen, carta.x, carta.y, cartaAncho, cartaAlto);
    } else {
      image(cartaReverso, carta.x, carta.y, cartaAncho, cartaAlto);
    }
  }
}

function verificarCoincidencia() {
  if (primeraCarta.imagen === segundaCarta.imagen) {
    primeraCarta.acertada = true;
    segundaCarta.acertada = true;
    aciertos++;

    let multiplicador = intentos === 0 ? 2 : 1; // Doble puntaje si acierta en el primer intento
    let penalizacion = 1 - (0.1 * intentos); // Penalización por fallos (10% por cada fallo)

    let puntajeGanado = puntajeBase * multiplicador * penalizacion;
    puntaje += puntajeGanado; // Sumar puntaje ajustado

    intentos = 0; // Resetear contador de intentos
  } else {
    primeraCarta.volteada = false;
    segundaCarta.volteada = false;
    intentos++; // Aumentar contador de intentos al fallar
  }

  primeraCarta = null;
  segundaCarta = null;
  bloquear = false;
  actualizarPuntaje(); // Actualizar la visualización del puntaje
}

function verificarFinJuego() {
  if (aciertos === cartas.length / 2 && !puntajeGuardado) {
    mostrarBotonReiniciar(); // Mostrar el botón cuando todas las cartas estén acertadas
    guardarPuntaje(); // Guardar puntaje cuando todas las cartas están acertadas
    mostrarPuntajes(); // Actualizar los puntajes en el footer
    puntajeGuardado = true; // Asegurarse de que el puntaje solo se guarde una vez
  }
}

function actualizarPuntaje() {
  document.getElementById('puntaje').innerText = `Puntaje: ${Math.floor(puntaje)}`; // Mostrar puntaje redondeado
}

function mostrarBotonReiniciar() {
  document.getElementById('reiniciar').style.display = 'block';
}

function ocultarBotonReiniciar() {
  document.getElementById('reiniciar').style.display = 'none';
}

function reiniciarJuego() {
  generarCartas(); // Volver a generar las cartas
  ocultarBotonReiniciar(); // Ocultar el botón nuevamente
}

function guardarPuntaje() {
  // Obtener el puntaje actual y el número de jugadores
  let puntajes = JSON.parse(localStorage.getItem('puntajes')) || {};
  let jugadorId = Object.keys(puntajes).length + 1; // Crear un nuevo ID de jugador
  puntajes[`jugador${jugadorId}`] = Math.floor(puntaje);
  localStorage.setItem('puntajes', JSON.stringify(puntajes));
}

function mostrarPuntajes() {
  let puntajes = JSON.parse(localStorage.getItem('puntajes')) || {};
  let puntajesHTML = '<h2>Puntajes de Jugadores:</h2>';
  
  for (const jugador in puntajes) {
    puntajesHTML += `<p>${jugador}: ${puntajes[jugador]} puntos</p>`;
  }
  
  document.getElementById('puntajes').innerHTML = puntajesHTML;
}
