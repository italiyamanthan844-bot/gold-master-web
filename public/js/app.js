// app.js

// Import Firebase functions from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- CONFIGURATION ---
// ⚠️ REPLACE THIS OBJECT WITH YOUR FIREBASE CONFIG
// Go to Firebase Console -> Project Settings -> General -> Your Apps -> Web App
const firebaseConfig = {
    apiKey: "AIzaSyADZLv4P6bktfNX-_BCw_hmEPSAsy5i3rM",
    authDomain: "gold-master-7c737.firebaseapp.com",
    databaseURL: "https://gold-master-7c737-default-rtdb.firebaseio.com",
    projectId: "gold-master-7c737",
    storageBucket: "gold-master-7c737.firebasestorage.app",
    messagingSenderId: "323471090424",
    appId: "1:323471090424:web:1ed36fa00482865dd1d10d",
    measurementId: "G-4BLBCNCN38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- DOM ELEMENTS ---
const linksContainer = document.getElementById('links-container');
const lastUpdatedText = document.getElementById('last-updated');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');

// --- THEME LOGIC ---
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    // Sun for light, Moon for dark
    themeIcon.innerText = theme === 'dark' ? '🌙' : '☀';
}

// --- APP LOGIC ---

/**
 * Main function to start the app
 */
function init() {
    console.log("App Initializing...");

    if (!linksContainer) {
        console.error("Critical Error: 'links-container' not found in DOM.");
        return;
    }

    fetchLinks();
}

/**
 * Fetch links from Firebase Realtime Database
 * Path: DB-1/spins
 */
function fetchLinks() {
    // Reference to the 'spins' node inside 'DB-1'
    const spinsRef = ref(db, 'DB-1/spins');

    // Listen for data changes
    onValue(spinsRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            // Convert object to array
            const linksArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));

            // Optional: Reverse array to show latest added at top 
            linksArray.reverse();

            renderLinks(linksArray);
            updateStatus("Updated just now");
        } else {
            renderEmptyState();
            updateStatus("No links found");
        }
    }, (error) => {
        console.error("Firebase Error:", error);
        if (linksContainer) {
            linksContainer.innerHTML = `
                <div style="text-align:center; color: #ef4444; padding: 20px;">
                    <p><strong>Error loading data</strong></p>
                    <p style="font-size: 0.9em;">${error.message}</p>
                    <p style="font-size: 0.8em; margin-top: 10px; color: var(--text-secondary);">Please check your internet connection.</p>
                </div>
            `;
        }
        updateStatus("Connection Error");
    });
}

/**
 * Render the list of link items (Mobile Optimized)
 * @param {Array} links - Array of link objects
 */
function renderLinks(links) {
    linksContainer.innerHTML = ''; // Clear loading spinner

    links.forEach(link => {
        // Create List Item Element (formerly card)
        const item = document.createElement('div');
        item.className = 'list-item';

        // Determine Icon based on type
        let iconPath = 'resources/ic_list_spin.png';
        if (link.type && link.type.toLowerCase().includes('coin')) {
            iconPath = 'resources/ic_list_coin.png';
        }

        // Updated List Item Structure
        item.innerHTML = `
            <div class="item-left">
                <div class="item-icon">
                    <img src="${iconPath}" alt="Reward">
                </div>
                <div class="item-info">
                    <h4>${link.title || 'Free Reward'}</h4>
                    <p>${link.type || 'Daily Link'}</p>
                </div>
            </div>
            
            <a href="${link.url}" target="_blank" class="btn-collect">GET</a>
        `;

        // Add click handler for visual feedback
        const btn = item.querySelector('.btn-collect');
        btn.addEventListener('click', () => {
            btn.classList.add('collected');
            btn.innerText = "OPEN";
        });

        linksContainer.appendChild(item);
    });
}

function renderEmptyState() {
    linksContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <p>No links available right now. Check back later!</p>
        </div>
    `;
}

function updateStatus(text) {
    lastUpdatedText.innerText = text;
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
