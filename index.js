const express = require("express");
var bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const sharp = require("sharp");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db");
const app = express();
const port = 3001;

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

var users = [];

function getUsersWithAchievements(callback) {
  const out = [];
  db.each(
    `SELECT users.id, users.username, users.password_hash,
           achievements.name, achievements.description, achievements.date, achievements.notes
           FROM users 
           LEFT JOIN achievements ON users.id = achievements.user_id
           ORDER BY users.id, achievements.id`,
    (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }

      let user = out.find((u) => u.id === row.id);
      if (!user) {
        user = {
          id: row.id,
          username: row.username,
          password: row.password_hash,
          achievements: [],
        };
        out.push(user);
      }

      if (row.name) {
        user.achievements.push({
          name: row.name,
          description: row.description,
          date: row.date,
          notes: row.notes,
        });
      }
    },
    (err) => {
      if (err) {
        console.error(err.message);
        return callback(err);
      }
      callback(null, out);
    },
  );
}

function addUser(username, passwordHash) {
  let newID = (users[users.length - 1] || { id: 0 }).id + 1;
  users.push({
    id: newID,
    username: username,
    password: passwordHash,
    achievements: [],
  });
  const sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
  db.run(sql, [username, passwordHash], function (err) {
    if (err) {
      console.log(err);
    }
  });
}

function grantAchievement(userId, achievement) {
  users.find((obj) => obj.id === userId).achievements.push(achievement);
  const { name, description, date, notes } = achievement;
  const sql =
    "INSERT INTO achievements (user_id, name, description, date, notes) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [userId, name, description, date, notes], function (err) {
    if (err) {
      console.log(err);
    }
  });
}

async function processDataURIImage(dataURI, id) {
  const base64Data = dataURI.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const size = Math.min(metadata.width, metadata.height);
    const left = Math.max(0, Math.floor((metadata.width - size) / 2));
    const top = Math.max(0, Math.floor((metadata.height - size) / 2));

    await image
      .extract({ left, top, width: size, height: size })
      .resize(200, 200)
      .webp()
      .toFile(path.join("public", "user", `${id}.webp`));
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

getUsersWithAchievements((err, out) => {
  if (err) {
    console.error(err);
  } else {
    users = out;
  }
});

app.use(bodyParser.json({ limit: "25mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { users, title: "Home" });
});

app.get("/profile/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.render("profile", { user, title: `${user.username}'s Profile` });
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/new", (req, res) => {
  try {
    processDataURIImage(
      req.body.profilePictureDataURL,
      (users[users.length - 1] || { id: 0 }).id + 1,
    );
    addUser(req.body.username, req.body.password);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(403);
  }
});

app.post("/grant", (req, res) => {
  if (req.body.achievement) {
    if (
      achievements.indexOf(
        req.body.achievement.name + req.body.achievement.description,
      ) != -1
    ) {
      try {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          if (user.id != req.body.id && user.password == req.body.password) {
            if (
              !user.achievements.some(
                (obj) => obj.description === req.body.achievement.description,
              )
            ) {
              grantAchievement(req.body.id, req.body.achievement);
            }
            res.sendStatus(200);
            break;
          } else if (i == users.length - 1) {
            res.sendStatus(403);
          }
        }
      } catch (e) {
        console.log(e);
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
