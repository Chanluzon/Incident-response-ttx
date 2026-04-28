// controllers/groupController.js
const Group = require("../models/Group");

// Create group
const pool = require("../config/db");

exports.createGroup = async (req, res) => {
  const { group_name, leader_name } = req.body;

  if (!group_name || !leader_name) {
    return res.status(400).json({ error: "Group name and leader are required" });
  }

  try {
    // check if group + leader already exists
    const existing = await pool.query(
      `
      SELECT *
      FROM groups
      WHERE group_name = $1
        AND leader_name = $2
      `,
      [group_name.trim(), leader_name.trim()]
    );

    // reused
    if (existing.rows.length > 0) {
      return res.status(200).json({
        group: existing.rows[0],
        reused: true,
      });
    }

    // created
    const created = await pool.query(
      `
      INSERT INTO groups (group_name, leader_name)
      VALUES ($1, $2)
      RETURNING *
      `,
      [group_name.trim(), leader_name.trim()]
    );

    return res.status(201).json({
      group: created.rows[0],
      reused: false,
    });

  } catch (err) {
    console.error("createGroup error:", err);
    return res.status(500).json({ error: "Failed to create or find group" });
  }
};

// Get one group
exports.getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    console.error("getGroup error:", err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

// List groups
exports.listGroups = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit ?? "50", 10);
    const offset = parseInt(req.query.offset ?? "0", 10);
    const groups = await Group.findAll({ limit, offset });
    res.json(groups);
  } catch (err) {
    console.error("listGroups error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { leader_name, group_name } = req.body;
    const updated = await Group.update(groupId, { leader_name, group_name });
    if (!updated) return res.status(404).json({ error: "Group not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateGroup error:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const ok = await Group.delete(groupId);
    if (!ok) return res.status(404).json({ error: "Group not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteGroup error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

// Domain action: joinGame
exports.joinGame = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { game_id } = req.body;
    if (!game_id) return res.status(400).json({ error: "game_id is required" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const result = await Group.joinGame({ group_id: group.group_id, game_id });
    res.status(201).json(result);
  } catch (err) {
    console.error("joinGame error:", err);
    res.status(500).json({ error: "Failed to join game (check game_groups table and FKs)" });
  }
};

// Domain action: submitSelection
exports.submitSelection = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { round_id, card_id } = req.body;

    if (!round_id || !card_id) {
      return res.status(400).json({ error: "round_id and card_id are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const selection = await Group.submitSelection({
      group_id: group.group_id,
      round_id,
      card_id,
    });

    res.status(201).json(selection);
  } catch (err) {
    console.error("submitSelection error:", err);
    res.status(500).json({ error: "Failed to submit selection (check round_card_selections table and FKs)" });
  }
};
