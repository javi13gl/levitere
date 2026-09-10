import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/work.css';
import './styles/modal.css';
import './styles/carousel.css';
import './styles/studio.css';
import './styles/contact.css';

import { initNav } from './scripts/nav.js';
import { initHero } from './scripts/hero.js';
import { initWorkModal } from './scripts/work-modal.js';
import { initCarousel } from './scripts/carousel.js';
import { initLazyVideos } from './scripts/lazy-video.js';
import { initForm } from './scripts/form.js';
import { initScrollFade } from './scripts/scroll-fade.js';
import { initWordmark } from './scripts/wordmark.js';

initNav();
initScrollFade();
initHero();
initWorkModal();
initCarousel();
initLazyVideos();
initForm();
initWordmark();
