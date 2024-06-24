const express = require("express");
var bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const sharp = require("sharp");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db");
const app = express();
const port = 3001;

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
  try {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (user.id != req.body.id && user.password == req.body.password) {
        grantAchievement(req.body.id, req.body.achievement);
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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
