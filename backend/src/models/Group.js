const pool = require("../config/db");

class Group {
  constructor(group_id, leader_name, group_name) {
    this.group_id = group_id;
    this.leader_name = leader_name;
    this.group_name = group_name;
  }

  static rowToModel(row) {
    return new Group(row.group_id, row.leader_name, row.group_name);
  }

  // Create
  static async create({ leader_name, group_name }) {
    const { rows } = await pool.query(
      `INSERT INTO groups (leader_name, group_name)
       VALUES ($1, $2)
       RETURNING group_id, leader_name, group_name`,
      [leader_name, group_name]
    );
    return this.rowToModel(rows[0]);
  }

  // Read (single)
  static async findById(group_id) {
    const { rows } = await pool.query(
      `SELECT group_id, leader_name, group_name
       FROM groups WHERE group_id = $1`,
      [group_id]
    );
    return rows.length ? this.rowToModel(rows[0]) : null;
  }

  // Read (all) - optional pagination
  static async findAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT group_id, leader_name, group_name
       FROM groups
       ORDER BY group_id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows.map(this.rowToModel);
  }

  // Update
  static async update(group_id, { leader_name, group_name }) {
    const { rows } = await pool.query(
      `UPDATE groups
       SET leader_name = COALESCE($1, leader_name),
           group_name  = COALESCE($2, group_name)
       WHERE group_id = $3
       RETURNING group_id, leader_name, group_name`,
      [leader_name ?? null, group_name ?? null, group_id]
    );
    return rows.length ? this.rowToModel(rows[0]) : null;
  }

  // Delete
  static async delete(group_id) {
    const { rowCount } = await pool.query(
      `DELETE FROM groups WHERE group_id = $1`,
      [group_id]
    );
    return rowCount > 0;
  }

  // --- Domain actions from the diagram ---

  // + joinGame()
  static async joinGame({ group_id, game_id }) {
    const { rows } = await pool.query(
      `INSERT INTO game_groups (game_id, group_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING game_id, group_id`,
      [game_id, group_id]
    );
    return rows[0] || { game_id, group_id };
  }

  // + submitSelection()
  // Adds a record to round_card_selections with placed_at = now()
  static async submitSelection({ group_id, round_id, card_id }) {
    const { rows } = await pool.query(
      `INSERT INTO round_card_selections (placed_at, round_id, group_id, card_id)
       VALUES (NOW(), $1, $2, $3)
       RETURNING selection_id, placed_at, round_id, group_id, card_id`,
      [round_id, group_id, card_id]
    );
    return rows[0];
  }
}

module.exports = Group;
