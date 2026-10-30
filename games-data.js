/* games-data.js — catálogo central de juegos axcStudios (compartido por index y store) */
window.AXC_GAMES = [
  { id: 'call-of-gruty', title: 'Call of Gruty', genre: 'FPS · Battle Royale', cat: 'axc', img: 'images/games/call-of-gruty.png', desc: 'Battle royale táctico: despliega, saquea, sobrevive al círculo que se cierra y sé el último escuadrón en pie.', url: 'https://axcgamestudios.github.io/cod1/', star: true },
  { id: 'rocket-ball', title: 'Rocket Ball', genre: 'Deportes · Acción', cat: 'arcade', img: 'images/games/rocket-ball.png', desc: 'Fútbol con coches propulsados: vuelo, turbo y goles imposibles.', url: 'https://axcgamestudios.github.io/ra1/' },
  { id: 'lost-pizzeria-nw', title: 'The Lost Pizzeria: New World', genre: 'Terror · Aventura', cat: 'fnaf', img: 'images/games/fnaf-nw.png', desc: 'Un mundo nuevo y en ruinas donde los titanes animatrónicos dominan la ciudad.', url: 'https://axcgamestudios.github.io/FNAW/' },
  { id: 'lost-pizzeria-mp', title: 'The Lost Pizzeria: Multiplayer', genre: 'Terror · Online', cat: 'fnaf', img: 'images/games/fnaf-mp.png', desc: 'El terror compartido: huye o caza junto a otros jugadores en tiempo real.', url: 'https://axcgamestudios2.github.io/fnafm/' },
  { id: 'kfs', title: 'Kingdom of the Forgotten Seas', genre: 'Aventura · Mundo abierto', cat: 'axc', img: 'images/games/kingdom-forgotten-seas.png', desc: 'Navega un velero por un archipiélago medieval: batallas navales, tesoros hundidos, castillos y tripulación que reclutar.', url: 'https://axcgamestudios.github.io/KFS/', star: true },
  { id: 'f1', title: 'F1: The Game', genre: 'Carreras · Simulación', cat: 'axc', img: 'images/games/f1-the-game.png', desc: 'Vueltas rápidas en circuitos nocturnos, gestión de neumáticos y física de conducción exigente.', url: 'https://axcgamestudios.github.io/googleslides/' },
  { id: 'emergency-strike', title: 'Emergency Strike', genre: 'FPS · Táctico', cat: 'axc', img: 'images/games/emergency-strike.png', desc: 'FPS táctico: operativo de élite en zonas urbanas de combate, oleadas enemigas y misiones bajo presión.', url: 'https://axcgamestudios.github.io/Googlecom/' },
  { id: 'apex-kart', title: 'Apex Kart', genre: 'Karts · Arcade', cat: 'axc', img: 'images/games/apex-kart.png', desc: 'Karts arcade estilo Mario Kart: derrapes para cargar turbo, objetos explosivos, atajos y caos hasta la última vuelta.', url: 'https://axcgamestudios.github.io/gmail/' },
  { id: 'zona-cero', title: 'Zona Cero', genre: 'Battle Royale', cat: 'axc', img: 'images/games/zona-cero.png', desc: 'La zona se cierra: recolecta recursos, fabrica mejoras y sé el último en pie.', url: 'https://nflowstudios.github.io/Googlemeet/' },
  { id: 'gtv', title: 'Grand Theft Voxel', genre: 'Mundo abierto · Voxel', cat: 'axc', img: 'images/games/grand-theft-voxel.png', desc: 'GTA en mundo voxel: roba coches, escapa de la policía con estrellas de búsqueda y ciudad destructible.', url: 'https://axcgamestudios.github.io/GTV/' }
];

/* Renderiza el catálogo en un contenedor. opts: {filter, onPlay, locked(g)->bool, query} */
window.axcRenderGames = function (gridEl, opts) {
  opts = opts || {};
  const f = opts.filter || 'all';
  const q = (opts.query || '').toLowerCase();
  const list = window.AXC_GAMES.filter(g =>
    (f === 'all' || g.cat === f) &&
    (!q || g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q))
  );
  if (!list.length) {
    gridEl.innerHTML = '<div class="store-empty">Sin resultados… prueba otra búsqueda 🎮</div>';
    return;
  }
  gridEl.innerHTML = list.map((g, i) => `
    <article class="game-card" data-cat="${g.cat}" style="animation:axc-in .6s cubic-bezier(.16,1,.3,1) ${Math.min(i * 0.04, 0.5)}s backwards">
      <div class="game-cover">
        ${g.star ? `<span class="badge">★ Insignia axc</span>` : ''}
        <img src="${g.img}" alt="Portada de ${g.title}" loading="lazy" width="675" height="900">
      </div>
      <div class="game-body">
        <div class="game-genre">${g.genre}</div>
        <div class="game-title">${g.title}</div>
        <p class="game-desc">${g.desc}</p>
        <div class="game-actions">
          <button class="btn-play" data-play="${g.id}" title="Jugar a ${g.title}">
            <svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg> Jugar
          </button>
          <span class="free-tag">GRATIS</span>
        </div>
      </div>
    </article>`).join('');
  gridEl.querySelectorAll('[data-play]').forEach(b => {
    b.addEventListener('click', () => {
      const g = window.AXC_GAMES.find(x => x.id === b.dataset.play);
      /* pasa también la tarjeta: la animación FLIP vuela desde ahí */
      if (g && opts.onPlay) opts.onPlay(g, b.closest('.game-card') || b);
    });
  });
};
