const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const waitlistForm = document.getElementById('waitlistForm');
const waitlistMessage = document.getElementById('waitlistMessage');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuButton.setAttribute('aria-expanded', String(isHidden));
  });
}

if (waitlistForm && waitlistMessage) {
  waitlistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
      waitlistMessage.textContent = 'Add an email address first.';
      return;
    }

    waitlistMessage.textContent = `Nice — ${email} looks ready for a real waitlist integration.`;
    waitlistForm.reset();
  });
}
