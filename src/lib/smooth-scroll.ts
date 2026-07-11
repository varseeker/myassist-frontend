export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) {
    scrollToTop();
    return;
  }

  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });

  window.history.pushState(null, '', `#${id}`);
}
