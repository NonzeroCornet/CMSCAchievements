# 🏆 Staff Achievements App

Welcome to the Staff Achievements App! This progressive web application allows you to connect to a server and showcase staff accomplishments in an engaging and interactive way.

## 🌟 Features

- **Server Connection**: Connect seamlessly to your achievement server.
- **HTTPS Support**: 🔒 Option to use HTTPS for secure connections.
- **Persistent Storage**: 💾 Saves connection details for convenience.
- **Offline Capability**: 🔌 Works offline as a PWA for easy access.

## 🛠 Tech Stack

- HTML5 for structure
- CSS3 for Steam-inspired dark theme
- JavaScript (ES6+) for interactivity
- [Dexie.js](https://dexie.org/) for smooth IndexedDB operations
- [Workbox](https://developers.google.com/web/tools/workbox) for powerful service worker generation

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Server details (IP address and port)

## 🖥 Usage

1. Open the app in your web browser.
2. Enter the server IP address and port number.
3. Toggle the "Use HTTPS" option if needed.
4. Click "Connect" to launch into the world of achievements!

Or just visit https://nonzerocornet.github.io/CMSCAchievements/

## 👩‍💻 Development

To modify the service worker:

1. Install Workbox CLI globally:

   ```
   npm install workbox-cli --global
   ```

2. Tweak `workbox-config.js` to your heart's content.

3. Generate the service worker:

   ```
   workbox generateSW workbox-config.js
   ```

## 🤝 Contributing

We welcome contributions! Feel free to submit a Pull Request and join our achievement-tracking adventure.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- The open-source community for the amazing tools and libraries
- All the hardworking staff members who inspire us to track achievements

Happy achieving, team! 🌟
