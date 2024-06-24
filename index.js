const db = new Dexie("ServerConnectionDB");
db.version(1).stores({
  serverDetails: "id, ip, port, useHttps",
});
window.onload = async function () {
  if (window.location.protocol == "https:") {
    document.getElementById("httpsCheckbox").disabled = true;
  }
  try {
    const savedDetails = await db.serverDetails.get(1);
    if (savedDetails) {
      document.getElementById("ipInput").value = savedDetails.ip;
      document.getElementById("portInput").value = savedDetails.port;
      document.getElementById("httpsCheckbox").checked = savedDetails.useHttps;

      if (window.location.protocol == "https:") {
        document.getElementById("httpsCheckbox").checked = false;
      }
    }
  } catch (error) {
    console.error("Error loading saved details:", error);
  }
};

async function connect() {
  const ip = document.getElementById("ipInput").value;
  const port = document.getElementById("portInput").value;
  const useHttps = document.getElementById("httpsCheckbox").disabled
    ? true
    : document.getElementById("httpsCheckbox").checked;
  const statusElement = document.getElementById("status");
  const connectButton = document.getElementById("connectButton");

  if (ip && port) {
    try {
      connectButton.disabled = true;
      statusElement.textContent = "Connecting...";
      await db.serverDetails.put({ id: 1, ip, port, useHttps });

      const connectionSuccessful = await checkConnection(ip, port, useHttps);

      if (connectionSuccessful) {
        const iframe = document.getElementById("serverFrame");
        iframe.src = `${useHttps ? "https" : "http"}://${ip}:${port}`;
        iframe.style.display = "block";
        document.querySelector(".input-container").style.display = "none";
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      statusElement.textContent = "Connection failed. Please try again.";
      connectButton.disabled = false;
    }
  } else {
    statusElement.textContent = "Please enter both IP and Port";
  }
}

async function checkConnection(ip, port, useHttps) {
  try {
    const response = await fetch(
      `${useHttps ? "https" : "http"}://${ip}:${port}`,
      {
        method: "HEAD",
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const identifier = response.headers.get("X-Identifier");
    if (identifier === "e3848c91-3882-4b5a-bd8a-798888c8cd2a") {
      console.log("Identifier header found with correct value");
      return true;
    } else {
      console.log("Identifier header not found or does not match: ", response);
      return false;
    }
  } catch (error) {
    console.error("Connection check failed:", error);
    return false;
  }
}
