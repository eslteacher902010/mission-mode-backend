const Mission = require('../models/missions.js');
const User = require('../models/user.js');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');

const isSameDay = (d1, d2) => //this function checks if two dates are the same day
  d1.toDateString() === d2.toDateString();



// READ - GET - /missions
router.get('/', async (req, res) => {
  try {
    const missions = await Mission.find().populate('rewardBadge').populate('user');
    res.json(missions);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// CREATE - POST - /missions
router.post('/', async (req, res) => {
 console.log("POST response:", req.body);
 console.log("Collection name being used:", Mission.collection.collectionName);
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:missionId', async (req, res) => {
  try {
    const deletedMission = await Mission.findByIdAndDelete(req.params.missionId);

    // if no mission found, send 404
    if (!deletedMission) {
      res.status(404);
      throw new Error('Mission not found.');
    }

    // success
    res.status(200).json({ message: 'Mission deleted successfully', mission: deletedMission });
  } catch (err) {
    if (res.statusCode === 404) {
      res.json({ err: err.message });
    } else {
      res.status(500).json({ err: err.message });
    }
  }
});


// UPDATE - PUT - /missions/:missionId
router.put('/:missionId', verifyToken, async (req, res) => {
  try {
    console.log("UPDATE BODY:", req.body);

    // 1️⃣ Find the mission we are updating
    const mission = await Mission.findById(req.params.missionId)
      .populate('rewardBadge')
      .populate('user');

    if (!mission) {
      res.status(404);
      throw new Error('Mission not found.');
    }

    // 2️⃣ Save the OLD status so we can compare transitions
    // (this is critical for detecting pause/resume/start)
    const oldStatus = mission.status;

    // 3️⃣ Normalize incoming status (frontend might send "Completed")
    if (req.body.status) {
      req.body.status = req.body.status.toLowerCase();
    }

    /*
      ===============================
       TIMER STATE MANAGEMENT
      ===============================
      These blocks run BEFORE Object.assign,
      because we need the OLD state to calculate time correctly.
    */ //object.assign in simple terms means take everything the user sent in req.body and apply it to the existing mission object.

    // 4️⃣ FIRST START:
    // Mission was not active → becomes active
    // remainingMs does not exist yet
    if (
      oldStatus !== "active" &&
      req.body.status === "active" &&
      mission.remainingMs == null
    ) {
      // Initialize total remaining time
      mission.remainingMs = mission.duration * 60 * 1000;

      // Mark when the timer started
      mission.lastResumedAt = new Date();
    }

    // 5️⃣ RESUME:
    // Mission was paused → becomes active again
    if (
      oldStatus === "paused" &&
      req.body.status === "active"
    ) {
      // Restart timer from now
      mission.lastResumedAt = new Date();
    }

    // 6️⃣ PAUSE:
    // Mission was active → becomes paused
    if (
      oldStatus === "active" &&
      req.body.status === "paused"
    ) {
      // Calculate how much time has passed since last resume
      const elapsed =
        Date.now() - new Date(mission.lastResumedAt).getTime();

      // Subtract elapsed time from remaining time
      mission.remainingMs = Math.max(
        mission.remainingMs - elapsed,
        0
      );
    }

    /*
      ===============================
      APPLY OTHER UPDATES
      ===============================
      Now that timing is handled,
      we can safely apply user edits (title, status, etc.)
    */
    Object.assign(mission, req.body);

// DAILY CHECK LOGIC (backend-controlled)
if (req.body.markCompletedToday === true) {
  const today = new Date();

  if (
    !mission.lastCompleted ||
    !isSameDay(new Date(mission.lastCompleted), today)
  ) {
    mission.checkCount += 1;
    mission.lastCompleted = today;
  }
}



    // 7️⃣ Save mission changes
    await mission.save();

    /*
      ===============================
      🏅 BADGE AWARDING LOGIC
      ===============================
      This runs AFTER save, based on final state
    */
    if (
      oldStatus !== "completed" &&
      mission.status === "completed" &&
      mission.rewardBadge
    ) {
      const user = await User.findById(req.user._id);

      const alreadyHasBadge = user.earnedBadges.some(
        b => b.toString() === mission.rewardBadge._id.toString()
      );

      if (!alreadyHasBadge) {
        user.earnedBadges.push(mission.rewardBadge._id);
        await user.save();
      }
    }

    // 8️⃣ Send updated mission back to frontend
    res.status(200).json(mission);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;// Additional mission-related controller logic can be added here in the future