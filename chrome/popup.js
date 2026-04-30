document.addEventListener('DOMContentLoaded', () => {
    const donateBtn = document.getElementById('donateButton');

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://buymeacoffee.com/khushwnt' });
        });
    }
});