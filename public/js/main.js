async function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

document.addEventListener("DOMContentLoaded", () => {
  const createAccountBtn = document.getElementById("createAccountBtn");
  const grantAchievementBtn = document.getElementById("grantAchievementBtn");

  const achievements = [
    "🚀 Activate the ID in front of another ship on accident",
    "🕐 Finish a 5 hour without the crew destroying a single ship",
    "⏱️ Finish briefing on under 10 minutes",
    "📛 Have each crew member consistently answer to a code name",
    "🏕️ Get a camp crew of entirely single riders (No one came together to the camp)",
    "🤥 Tell a crew that they are a liar and a poor one at that but by a protagonist.",
    "🎵 End your mission at the natural end of your playlist.",
    "🎶 Get a really good unplanned music que.",
    "🔧 Fix a problem in the ship using a trick Jon taught you.",
    "🔥 Crew member comments on a savage burn to them or another character",
    "👋 Crew member recognizes you from a previous flight",
    "🎙️ Go an entire flight without using the wrong voice setting on the voice changer.",
    "🔊 Use every setting on the voice changer in one flight.",
    "🏃 Lose mic cable mid flight and sprint to obtain and install a new one.",
    "🎭 Make a reference to another character not involved in the mission in character.",
    "😂 Laugh so loud the crew comments on it from the bridge.",
    "👽 Have a crew try and speak Klingon to a Klingon",
    "💕 Crew member flirts with a character",
    "💡 You and your staff are so still for long enough the lights turn off.",
    "🍔 Eat from both Wendy's and Culver's in one day.",
    "🗨️ Have a crew member quoting something you said as they leave because they found it hilarious.",
    "🎂 Crew sings happy birthday on the bridge to another crew member or character.",
    "❤️ Your crew tells Apollo they love them.",
    "⚫ Finish a full camp without blacking out for a strike/death once.",
    "👻 Someone other than yourself invokes the oven ghost.",
    "😱 You or a crew member is spooked by a loud Ellie or Scott.",
    "💀 Crew threatens to kill Chuck or Chad.",
    "😆 Make your supervisor laugh out loud on the bridge.",
    "🎯 Have a failed bride retake or take or other phaser scenario they need to win.",
    '🤣 Crew member makes a "your mom" joke to a villain.',
    "🖥️ Laugh as the computer accidentally.",
    "📺 Make a reference as a character to a tv show or movie.",
    "🩸 Forget you are wearing blood makeup.",
    "🧁 Make the two muffin joke as the computer.",
    '🤥 Find a way to say "you are such a liar and a poor one at that" as someone other than the Ferengi.',
    "🏢 Mention something about the old building.",
    "🍪 Eat one of the moist pumpkin cookies Vic brings.",
    "💧 Drink at least two water bottles full of water.",
    "☕ Drink hot cocoa or tea in the odyssey.",
    "😴 Take a nap in the Cassini bunks.",
    "💤 Take a nap in any of the control rooms.",
    "🛠️ Have a crew member with the same name as your engineer.",
    "☎️ Have a three way call with Sontall, Wilkes, and the cap.",
    "🎉 Plan a surprise away mission.",
    "🎯 Call shots as a character other than the doctor (or doctor replacement) and not staff.",
    "💡 Fix the lighting when it isn't working.",
    "💥 Play explosions instead of computer beeps.",
    "🚢 Crew member invokes the full name of their ship including registry number when introducing themselves.",
    "⚔️ Crew member promises to avenge someone.",
  ];

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      Swal.fire({
        title: "Create Account",
        html:
          '<input id="swal-profile-picture" type="file" accept=".jpg, .jpeg, .png" style="display:none">' +
          '<button id="profile-picture-btn" class="imgIn" onclick="document.getElementById(\'swal-profile-picture\').click()">Select Profile Picture</button>' +
          '<input id="swal-username" class="swal2-input" placeholder="Name">' +
          '<input id="swal-password" class="swal2-input" type="password" placeholder="Password">',
        showCancelButton: true,
        focusConfirm: false,
        didOpen: () => {
          const fileInput = document.getElementById("swal-profile-picture");
          const profilePictureBtn = document.getElementById(
            "profile-picture-btn",
          );

          fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataURL = e.target.result;
                profilePictureBtn.innerHTML = `<img src="${dataURL}" alt="Profile Picture" style="width: 100px;height: 100px;object-fit: cover">`;

                fileInput.dataset.dataURL = dataURL;
              };
              reader.readAsDataURL(file);
            } else {
              Swal.showValidationMessage("Please select a valid image file.");
              profilePictureBtn.innerHTML = "Select Profile Picture";
              delete fileInput.dataset.dataURL;
            }
          });
        },
        preConfirm: () => {
          const fileInput = document.getElementById("swal-profile-picture");
          const username = document.getElementById("swal-username").value;
          const password = document.getElementById("swal-password").value;

          if (!validatePassword(password)) {
            Swal.showValidationMessage(
              "Password must be 8 characters long, contain one symbol and one upper/lowercase letter.",
            );
            return false;
          }

          return {
            profilePictureDataURL: fileInput.dataset.dataURL || null,
            username: username,
            password: password,
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          hash(result.value.password).then((hex) => {
            result.value.password = hex;
            fetch("/new", {
              method: "POST",
              body: JSON.stringify(result.value),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
            }).then((res) => {
              if (res.status == 200) {
                Swal.fire("Account Created!", "", "success").then(() => {
                  window.location.href = "/";
                });
              } else {
                Swal.fire("An unexpected error occurred.", "", "error");
              }
            });
          });
        }
      });
    });
  }

  if (grantAchievementBtn) {
    grantAchievementBtn.addEventListener("click", () => {
      const optionsHtml = achievements
        .map(
          (achievement) =>
            `<option value="${achievement}">${achievement}</option>`,
        )
        .join("");

      Swal.fire({
        title: "Grant Achievement",
        html: `<select id="swal-achievement" class="swal2-select" style="width: 280px">
            <option value="">Select an achievement</option>
            ${optionsHtml}
          </select>
          <input id="swal-password" class="swal2-input" style="width: 280px" type="password" placeholder="Witness password">
          <input id="swal-notes" class="swal2-input" style="width: 280px" type="text" placeholder="Notes about achievement">`,
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
          const achievement = document.getElementById("swal-achievement").value;
          const password = document.getElementById("swal-password").value;
          const notes = document.getElementById("swal-notes").value;
          if (!achievement) {
            Swal.showValidationMessage("Please select an achievement");
          }
          if (!password) {
            Swal.showValidationMessage("Please enter the witnesses password");
          }
          if (!notes) {
            Swal.showValidationMessage(
              "Don't you have anything to say about how the achievement was acquired?",
            );
          }
          return { achievement, password, notes };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          hash(result.value.password).then((hex) => {
            let d = new Date();
            let newBody = {};
            newBody.id = Number(
              window.location.pathname[window.location.pathname.length - 1],
            );
            newBody.password = hex;
            newBody.achievement = {
              name: result.value.achievement.split(" ")[0],
              description: result.value.achievement.slice(2),
              date:
                String(d.getMonth() + 1).padStart(2, "0") +
                "/" +
                String(d.getDate()).padStart(2, "0") +
                "/" +
                d.getFullYear(),
              notes: result.value.notes,
            };

            fetch("/grant", {
              method: "POST",
              body: JSON.stringify(newBody),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
            }).then((res) => {
              if (res.status == 200) {
                Swal.fire("Achievement Granted!", "", "success").then(() => {
                  window.location.reload();
                });
              } else {
                Swal.fire(
                  "Please enter the password of a witness.",
                  "",
                  "error",
                );
              }
            });
          });
        }
      });
    });
  }
});

function validatePassword(password) {
  const minLength = 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  return (
    password.length >= minLength && hasSymbol && hasUpperCase && hasLowerCase
  );
}
