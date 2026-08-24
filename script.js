/* FAIXA ANIMADA: repete as categorias o suficiente pra cobrir a tela inteira antes
     de dar a volta — em telas largas 2 cópias fixas deixavam um vão em branco no
     fim do loop; aqui a quantidade de cópias se ajusta à largura da janela */
  const roadTrack = document.getElementById('roadTrack');
  const roadBaseHTML = roadTrack.innerHTML;
  const ROAD_BASE_DURATION = 22;

  function buildRoadTrack(){
    roadTrack.innerHTML = roadBaseHTML;
    const baseWidth = roadTrack.scrollWidth;
    const repeats = Math.max(1, Math.ceil(window.innerWidth / baseWidth) + 1);
    roadTrack.innerHTML = roadBaseHTML.repeat(repeats * 2);
    roadTrack.style.animationDuration = `${repeats * ROAD_BASE_DURATION}s`;
  }

  buildRoadTrack();
  window.addEventListener('resize', buildRoadTrack);

/* animação: revela os blocos com data-reveal suavemente ao rolar a página (não precisa mexer) */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.15});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

/* LIGHTBOX: clique numa foto do portfólio pra abrir ampliada, com setas e teclado (não precisa mexer) */
  const galleryImgs = Array.from(document.querySelectorAll('.cell img'));
  const heroImg = document.querySelector('.hero-frame img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function updateImage(morph = true){
    if(!morph){
      lightboxImg.src = galleryImgs[currentIndex].src;
      lightboxImg.alt = galleryImgs[currentIndex].alt;
      return;
    }
    lightboxImg.classList.add('morphing');
    setTimeout(() => {
      lightboxImg.src = galleryImgs[currentIndex].src;
      lightboxImg.alt = galleryImgs[currentIndex].alt;
      requestAnimationFrame(() => {
        lightboxImg.classList.remove('morphing');
      });
    }, 260);
  }

  function openLightbox(index){
    currentIndex = index;
    updateImage(false);
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    lightbox.classList.add('active');
    document.documentElement.classList.add('scroll-lock');
  }

  function openSingleLightbox(img){
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    lightbox.classList.add('active');
    document.documentElement.classList.add('scroll-lock');
  }

  function closeLightbox(){
    lightbox.classList.remove('active');
    document.documentElement.classList.remove('scroll-lock');
  }

  function showNext(){
    currentIndex = (currentIndex + 1) % galleryImgs.length;
    updateImage();
  }

  function showPrev(){
    currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
    updateImage();
  }

  galleryImgs.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(index));
  });

  if(heroImg){
    heroImg.style.cursor = 'pointer';
    heroImg.addEventListener('click', () => openSingleLightbox(heroImg));
  }

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
  });

  // EASTER EGG (sem pista visível): clique nos itens de "Serviços" até a soma dos
  // números (01,02,03,04) bater exatamente 6 — a contagem zera sozinha. Depois,
  // clique de novo do zero até a soma bater exatamente 7 — abre a secreto.jpeg
  // em tela cheia com confete. Passar do alvo em qualquer uma das duas fases
  // zera a soma (sem trocar de fase), pra pessoa poder tentar de novo.
  function burstConfetti(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const COLORS = ['#C99A44', '#A8462B', '#7C3220', '#EDE6D6', '#EAB308', '#E8C87A'];
    const particles = Array.from({ length: 220 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 220,
      y: canvas.height / 2 + (Math.random() - 0.5) * 120,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 11 - 5,
      size: Math.random() * 10 + 10,
      shape: Math.random() < 0.65 ? 'rect' : 'circle',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 16,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.06 + Math.random() * 0.08,
      life: 1
    }));

    const GRAVITY = 0.16;
    let start = null;

    function frame(t){
      if(!start) start = t;
      const elapsed = t - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach(p => {
        if(p.life <= 0) return;
        p.vy += GRAVITY;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 2.2;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.005;
        if(p.life > 0){
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.color;
          if(p.shape === 'circle'){
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
          }
          ctx.restore();
        }
      });

      if(alive && elapsed < 6000){
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  let eggSum = 0;
  let eggPhase = 1;
  document.querySelectorAll('.servico-item').forEach(item => {
    const value = parseInt(item.querySelector('.num').textContent, 10);
    item.addEventListener('click', () => {
      eggSum += value;
      const target = eggPhase === 1 ? 6 : 7;
      if(eggSum === target){
        if(eggPhase === 1){
          eggPhase = 2;
        } else {
          openSingleLightbox({ src: 'secreto.jpeg', alt: '' });
          burstConfetti();
          eggPhase = 1;
        }
        eggSum = 0;
      } else if(eggSum > target){
        eggSum = 0;
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('active')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight' && nextBtn.style.display !== 'none') showNext();
    if(e.key === 'ArrowLeft' && prevBtn.style.display !== 'none') showPrev();
  });

/* WARP TEXT: as letras de NAIRON DALMASO se distorcem perto do cursor (efeito inspirado no reactbits.dev/text-animations/warp-text) */
  const warpTitle = document.getElementById('warpTitle');
  const warpLetters = warpTitle.querySelectorAll('.warp-letter');
  const WARP_RADIUS = 140;
  const WARP_STRETCH = 0.6;
  const WARP_SKEW = 20;
  const WARP_LIFT = 16;

  function applyWarp(mouseX, mouseY){
    warpLetters.forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < WARP_RADIUS){
        const strength = 1 - dist / WARP_RADIUS;
        const skew = (dx / WARP_RADIUS) * WARP_SKEW * strength;
        const scaleY = 1 + strength * WARP_STRETCH;
        const translateY = -strength * WARP_LIFT;
        el.style.transform = `translateY(${translateY}px) scaleY(${scaleY}) skewX(${skew}deg)`;
      } else {
        el.style.transform = '';
      }
    });
  }

  function resetWarp(){
    warpLetters.forEach(el => { el.style.transform = ''; });
  }

  document.addEventListener('mousemove', (e) => {
    applyWarp(e.clientX, e.clientY);
  });
  warpTitle.addEventListener('mouseleave', resetWarp);

/* DECRYPTED TEXT: a citação "decodifica" letra por letra quando entra na tela (efeito inspirado no reactbits.dev/text-animations/decrypted-text) */
  const decryptEl = document.querySelector('.citacao blockquote');
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%*';

  // Envolve cada caractere de texto em um <span>, preservando <br> e o <span class="hl">
  function wrapChars(node){
    Array.from(node.childNodes).forEach(child => {
      if(child.nodeType === Node.TEXT_NODE){
        const frag = document.createDocumentFragment();
        [...child.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'decrypt-char';
          span.dataset.final = ch;
          span.textContent = ch;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if(child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR'){
        wrapChars(child);
      }
    });
  }
  wrapChars(decryptEl);

  const decryptChars = decryptEl.querySelectorAll('.decrypt-char');

  function runDecrypt(){
    let revealed = 0;
    const total = decryptChars.length;
    function tick(){
      decryptChars.forEach((el, i) => {
        const final = el.dataset.final;
        if(i < revealed || final === ' '){
          el.textContent = final;
        } else {
          el.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      });
      revealed++;
      if(revealed <= total){
        setTimeout(tick, 28);
      } else {
        decryptChars.forEach(el => { el.textContent = el.dataset.final; });
      }
    }
    tick();
  }

  const decryptObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        runDecrypt();
        decryptObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.5});
  decryptObserver.observe(decryptEl);

/* DOT FIELD: fundo animado de pontos na seção de assinatura (efeito inspirado no reactbits.dev/backgrounds/dot-field) */
  const dotCanvas = document.getElementById('dotFieldCanvas');
  const dotCtx = dotCanvas.getContext('2d');
  const dotSection = dotCanvas.closest('.citacao');

  const DOT_SPACING = 34;
  const DOT_RADIUS = 1.4;
  const CURSOR_RADIUS = 130;
  const BULGE_STRENGTH = 2.6;
  const WAVE_AMPLITUDE = 1.2;

  let dots = [];
  let mouseX = -9999, mouseY = -9999;
  let time = 0;

  function resizeDotCanvas(){
    const rect = dotSection.getBoundingClientRect();
    dotCanvas.width = rect.width * devicePixelRatio;
    dotCanvas.height = rect.height * devicePixelRatio;
    dotCanvas.style.width = rect.width + 'px';
    dotCanvas.style.height = rect.height + 'px';
    dotCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    dots = [];
    const cols = Math.ceil(rect.width / DOT_SPACING) + 1;
    const rows = Math.ceil(rect.height / DOT_SPACING) + 1;
    for(let r = 0; r < rows; r++){
      for(let c = 0; c < cols; c++){
        dots.push({
          x: c * DOT_SPACING,
          y: r * DOT_SPACING,
          seed: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function drawDots(){
    const rect = dotSection.getBoundingClientRect();
    dotCtx.clearRect(0, 0, rect.width, rect.height);
    time += 0.02;

    dots.forEach(dot => {
      const waveOffset = Math.sin(time + dot.seed) * WAVE_AMPLITUDE;
      const dx = mouseX - dot.x;
      const dy = mouseY - dot.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      let radius = DOT_RADIUS;
      let opacity = 0.35;

      if(dist < CURSOR_RADIUS){
        const strength = 1 - dist / CURSOR_RADIUS;
        radius = DOT_RADIUS + strength * BULGE_STRENGTH;
        opacity = 0.35 + strength * 0.65;
      }

      dotCtx.beginPath();
      dotCtx.arc(dot.x, dot.y + waveOffset, radius, 0, Math.PI * 2);
      dotCtx.fillStyle = `rgba(201, 154, 68, ${opacity})`;
      dotCtx.fill();
    });

    requestAnimationFrame(drawDots);
  }

  dotSection.addEventListener('mousemove', (e) => {
    const rect = dotSection.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  dotSection.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  window.addEventListener('resize', resizeDotCanvas);
  resizeDotCanvas();
  drawDots();

/* TILTED CARD: a foto de destaque (moldura + foto + legenda) inclina em 3D acompanhando o mouse (efeito inspirado no reactbits.dev/components/tilted-card) */
  const tiltFrame = document.getElementById('tiltFrame');
  const tiltGlare = tiltFrame.querySelector('.tilt-glare');
  const TILT_MAX = 12;

  tiltFrame.addEventListener('mousemove', (e) => {
    const rect = tiltFrame.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * TILT_MAX * 2;
    const rotateX = (0.5 - py) * TILT_MAX * 2;

    tiltFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(2deg) scale(1.05)`;
    tiltGlare.style.setProperty('--glare-x', `${px * 100}%`);
    tiltGlare.style.setProperty('--glare-y', `${py * 100}%`);
  });

  tiltFrame.addEventListener('mouseleave', () => {
    tiltFrame.style.transform = 'rotateX(0deg) rotateY(0deg) rotate(2deg) scale(1)';
  });

/* SCROLL EXPAND: a foto de destaque cresce de um cartão pequeno até tela cheia conforme a página rola (efeito inspirado no reactbits.dev/animations/scroll-expand) */
  const scrollExpandSection = document.getElementById('scrollExpand');
  const scrollExpandSticky = document.getElementById('scrollExpandSticky');
  const scrollExpandMedia = document.getElementById('scrollExpandMedia');
  const scrollExpandCaption = document.getElementById('scrollExpandCaption');

  function updateScrollExpand(){
    const rect = scrollExpandSection.getBoundingClientRect();
    const scrollDistance = scrollExpandSection.offsetHeight - window.innerHeight;

    // o crescimento termina em 35% do percurso "grudado" — o resto é
    // a foto ficando parada em tela cheia antes de soltar, pra dar
    // tempo de ver (sem isso, ela chegava no tamanho total e saía
    // da tela no mesmíssimo instante)
    const growthDistance = scrollDistance * 0.35;
    let progress = -rect.top / growthDistance;
    progress = Math.min(Math.max(progress, 0), 1);

    // "sticky" manual: fixa na tela enquanto a seção está passando,
    // gruda no topo antes e no fundo depois
    if(rect.top > 0){
      scrollExpandSticky.style.position = 'absolute';
      scrollExpandSticky.style.top = '0';
      scrollExpandSticky.style.bottom = 'auto';
    } else if(rect.bottom > window.innerHeight){
      scrollExpandSticky.style.position = 'fixed';
      scrollExpandSticky.style.top = '0';
      scrollExpandSticky.style.bottom = 'auto';
    } else {
      scrollExpandSticky.style.position = 'absolute';
      scrollExpandSticky.style.top = 'auto';
      scrollExpandSticky.style.bottom = '0';
    }

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const startWidth = vw * 0.4, endWidth = vw;
    const startHeight = vh * 0.56, endHeight = vh;
    const startRadius = 22, endRadius = 0;

    scrollExpandMedia.style.width = `${startWidth + (endWidth - startWidth) * progress}px`;
    scrollExpandMedia.style.height = `${startHeight + (endHeight - startHeight) * progress}px`;
    scrollExpandMedia.style.borderRadius = `${startRadius + (endRadius - startRadius) * progress}px`;
  }

  // roda a cada quadro (não só quando o navegador dispara o evento de
  // scroll) — em rolagens rápidas o navegador agrupa vários pixels
  // num evento só, e isso fazia a transição final "pular" de vez
  // em quando; checando a cada quadro isso não acontece mais
  function scrollExpandLoop(){
    updateScrollExpand();
    requestAnimationFrame(scrollExpandLoop);
  }
  window.addEventListener('resize', updateScrollExpand);
  requestAnimationFrame(scrollExpandLoop);

/* GRID MOTION: monta a grade de fotos/palavras do fundo da seção de orçamento
     (roda sempre, sem depender do GSAP — assim a grade aparece mesmo se o CDN falhar) */
  const ORCAMENTO_ITEMS = [
    'img/DSC08897.jpg', 'RODEIO', 'RETRATO', 'EDITORIAL',
    'img/DSC06557.jpg', 'EVENTOS', 'AÇÃO SOCIAL', 'PRÉ WEDDING',
    'img/DSC04158.jpg', 'ENSAIOS', 'COBERTURA', 'ORÇAMENTO',
    'img/DSC02517.jpg', 'JUÍNA — MT', 'RODEIO', 'RETRATO',
    'img/DSC6428.jpg', 'EDITORIAL', 'EVENTOS', 'AÇÃO SOCIAL',
    'img/DSC02504.jpg', 'PRÉ WEDDING', 'ENSAIOS', 'COBERTURA',
    'img/DSC04158.jpg', 'ORÇAMENTO', 'JUÍNA — MT', 'img/DSC06557.jpg'
  ];

  const orcamentoGrid = document.getElementById('orcamentoGrid');
  if (orcamentoGrid) {
    for (let r = 0; r < 4; r++) {
      const row = document.createElement('div');
      row.className = 'orcamento-row';
      for (let c = 0; c < 7; c++) {
        const item = ORCAMENTO_ITEMS[r * 7 + c];
        const cell = document.createElement('div');
        cell.className = 'orcamento-cell';
        if (item.startsWith('img/')) {
          const img = document.createElement('img');
          img.src = item;
          img.alt = '';
          img.loading = 'lazy';
          cell.appendChild(img);
        } else {
          const span = document.createElement('span');
          span.className = 'mono';
          span.textContent = item;
          cell.appendChild(span);
        }
        row.appendChild(cell);
      }
      orcamentoGrid.appendChild(row);
    }
  }

/* FORMULÁRIO DE ORÇAMENTO: envia via Web3Forms (web3forms.com) sem precisar de servidor —
     a "access_key" do Web3Forms é feita pra ficar exposta no HTML, diferente de uma chave de
     API secreta (tipo Resend), que nunca deve ir pro código do lado do cliente */
  const orcamentoForm = document.getElementById('orcamentoForm');
  const orcamentoStatus = document.getElementById('orcamentoStatus');

  orcamentoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = orcamentoForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    orcamentoStatus.textContent = 'ENVIANDO...';
    orcamentoStatus.className = 'orcamento-status mono';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(orcamentoForm)
      });
      const data = await res.json();
      if (data.success) {
        orcamentoStatus.textContent = 'PEDIDO ENVIADO — RESPONDO EM BREVE!';
        orcamentoStatus.className = 'orcamento-status mono ok';
        orcamentoForm.reset();
      } else {
        throw new Error(data.message || 'Falha no envio');
      }
    } catch (err) {
      orcamentoStatus.textContent = 'NÃO FOI POSSÍVEL ENVIAR — TENTE PELO WHATSAPP.';
      orcamentoStatus.className = 'orcamento-status mono err';
    } finally {
      submitBtn.disabled = false;
    }
  });

/* PLAYLIST: player flutuante que toca músicas da pasta "musicas/". Pra adicionar uma
   faixa: (1) coloque o arquivo .mp3 dentro da pasta "musicas/" e (2) adicione uma linha
   aqui embaixo, no array PLAYLIST, com o nome do arquivo e o título que deve aparecer no
   player. A ordem do array é a ordem de reprodução, e ao terminar a última ela volta
   pra primeira sozinha. */
  const PLAYLIST = [
    { file: 'musicas/alex-morgan-lofi.mp3', title: 'Lofi — Alex Morgan' },
    { file: 'musicas/alex-morgan-lofi-chill-vlog-beats.mp3', title: 'Lofi Chill Vlog Beats — Alex Morgan' },
    { file: 'musicas/apalonbeats-lofi.mp3', title: 'Lofi — ApalonBeats' },
    { file: 'musicas/kulakovka-lofi-relax.mp3', title: 'Lofi Relax — Kulakovka' },
    { file: 'musicas/pulsebox-lofi.mp3', title: 'Lofi — Pulsebox' },
  ];

  const musicWidget = document.getElementById('musicWidget');
  const musicToggle = document.getElementById('musicToggle');
  const musicPlayBtn = document.getElementById('musicPlayBtn');
  const musicPrevBtn = document.getElementById('musicPrevBtn');
  const musicNextBtn = document.getElementById('musicNextBtn');
  const musicAudio = document.getElementById('musicAudio');
  const musicTrackEl = document.getElementById('musicTrack');
  const musicStatusEl = document.getElementById('musicStatus');

  let musicOpen = false;
  let trackIndex = 0;

  if (PLAYLIST.length) {
    musicTrackEl.textContent = PLAYLIST[0].title;
    musicStatusEl.textContent = 'PARADO';
  } else {
    musicWidget.classList.add('empty');
  }

  function setMusicStatus(text){
    musicStatusEl.textContent = text;
  }

  function openMusicPanel(){
    musicOpen = true;
    musicWidget.classList.add('open');
    musicToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMusicPanel(){
    musicOpen = false;
    musicWidget.classList.remove('open');
    musicToggle.setAttribute('aria-expanded', 'false');
  }

  musicToggle.addEventListener('click', () => {
    if (musicOpen) closeMusicPanel(); else openMusicPanel();
  });

  document.addEventListener('click', (e) => {
    if (musicOpen && !musicWidget.contains(e.target)) closeMusicPanel();
  });

  function loadTrack(index, autoplay){
    if (!PLAYLIST.length) return;
    trackIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[trackIndex];
    musicAudio.src = track.file;
    musicTrackEl.textContent = track.title;
    if (autoplay) {
      setMusicStatus('CARREGANDO...');
      musicAudio.play().catch(() => setMusicStatus('ERRO AO TOCAR ESSA FAIXA'));
    }
  }

  musicPlayBtn.addEventListener('click', () => {
    if (!PLAYLIST.length) return;
    if (!musicAudio.src) {
      loadTrack(trackIndex, true);
    } else if (musicAudio.paused) {
      musicAudio.play().catch(() => setMusicStatus('ERRO AO TOCAR ESSA FAIXA'));
    } else {
      musicAudio.pause();
    }
  });

  musicPrevBtn.addEventListener('click', () => loadTrack(trackIndex - 1, true));
  musicNextBtn.addEventListener('click', () => loadTrack(trackIndex + 1, true));

  musicAudio.addEventListener('playing', () => {
    musicWidget.classList.add('playing');
    setMusicStatus('TOCANDO');
  });

  musicAudio.addEventListener('pause', () => {
    musicWidget.classList.remove('playing');
    if (musicAudio.src) setMusicStatus('PAUSADO');
  });

  musicAudio.addEventListener('ended', () => loadTrack(trackIndex + 1, true));

  musicAudio.addEventListener('error', () => {
    musicWidget.classList.remove('playing');
    setMusicStatus('ARQUIVO NÃO ENCONTRADO');
  });
