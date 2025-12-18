const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect("mongodb://127.0.0.1:27017/eventScheduler", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found. Please register." });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
  if (res.ok) {
    window.location.href = "dashboard.html";  
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  datetime: Date,
  location: String,
  category: String
});

const Event = mongoose.model("Event", eventSchema, "events");


app.post("/events", async (req, res) => {
  try {
    const { title, description, date, time, location, category } = req.body;
    const datetime = new Date(`${date}T${time}`);
    const event = new Event({ title, description, datetime, location, category });
    await event.save();
    res.json({ message: "Event created successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
});


app.get("/events", async (req, res) => {
  try {
    const { keyword, category, date } = req.query;
    let filter = {};

    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.datetime = { $gte: start, $lt: end };
    }

    const events = await Event.find(filter).sort({ datetime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


app.put("/events/:id", async (req, res) => {
  try {
    const { title, description, date, time, location, category } = req.body;
    const datetime = new Date(`${date}T${time}`);
    await Event.findByIdAndUpdate(req.params.id, { title, description, datetime, location, category });
    res.json({ message: "Event updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

const schedule = require("node-schedule");

const reminderSchema = new mongoose.Schema({
  eventId: mongoose.Schema.Types.ObjectId,
  reminderDate: Date,
  message: String
});
const Reminder = mongoose.model("Reminder", reminderSchema);

app.post("/reminders", async (req, res) => {
  const { eventId, reminderDate, message } = req.body;
  const reminder = new Reminder({ eventId, reminderDate, message });
  await reminder.save();


  const reminderTime = new Date(reminderDate);

  schedule.scheduleJob(reminderTime, () => {
    console.log(`🔔 Reminder: ${message} for Event ID ${eventId}`);
  });

  res.json({ message: "Reminder scheduled successfully!" });
});