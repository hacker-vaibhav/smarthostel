const pool = require('../config/database');

const assignComplaintToStaff = async (complaintId, priority, suggestedStaff, category) => {
  try {
    // Get least busy staff member for the category
    const query = `
      SELECT u.id, u.name, s.current_tasks
      FROM users u
      JOIN staff s ON u.id = s.user_id
      WHERE s.role ILIKE $1 OR u.name LIKE $2
      ORDER BY s.current_tasks ASC
      LIMIT 1
    `;

    const result = await pool.query(query, [`%${category}%`, `%${suggestedStaff}%`]);
    
    if (result.rows.length === 0) {
      // Default to any staff member with least tasks
      const defaultQuery = `
        SELECT u.id, u.name, s.current_tasks
        FROM users u
        JOIN staff s ON u.id = s.user_id
        ORDER BY s.current_tasks ASC
        LIMIT 1
      `;
      const defaultResult = await pool.query(defaultQuery);
      
      if (defaultResult.rows.length === 0) {
        return null; // No staff available
      }

      const staff = defaultResult.rows[0];
      
      // Update complaint with assigned staff
      await pool.query(
        'UPDATE complaints SET assigned_to = $1 WHERE id = $2',
        [staff.id, complaintId]
      );

      // Increment staff workload
      await pool.query(
        'UPDATE staff SET current_tasks = current_tasks + 1 WHERE user_id = $1',
        [staff.id]
      );

      return staff;
    }

    const staff = result.rows[0];
    
    // Update complaint with assigned staff
    await pool.query(
      'UPDATE complaints SET assigned_to = $1 WHERE id = $2',
      [staff.id, complaintId]
    );

    // Increment staff workload
    await pool.query(
      'UPDATE staff SET current_tasks = current_tasks + 1 WHERE user_id = $1',
      [staff.id]
    );

    console.log(`✅ Complaint ${complaintId} assigned to ${staff.name}`);
    return staff;
  } catch (error) {
    console.error('❌ Error assigning complaint:', error);
    throw error;
  }
};

const updateComplaintStatus = async (complaintId, newStatus) => {
  try {
    const result = await pool.query(
      'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, complaintId]
    );

    if (result.rows.length === 0) {
      throw new Error('Complaint not found');
    }

    console.log(`✅ Complaint ${complaintId} status updated to ${newStatus}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating complaint status:', error);
    throw error;
  }
};

const checkAndEscalateComplaints = async () => {
  try {
    // Escalate complaints pending for more than 2 minutes (for demo)
    const query = `
      UPDATE complaints 
      SET status = 'escalated'
      WHERE status = 'pending' 
      AND created_at < NOW() - INTERVAL '2 minutes'
      RETURNING *
    `;

    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      console.log(`⚠️ ${result.rows.length} complaints escalated to warden`);
    }

    return result.rows;
  } catch (error) {
    console.error('❌ Error escalating complaints:', error);
    throw error;
  }
};

module.exports = {
  assignComplaintToStaff,
  updateComplaintStatus,
  checkAndEscalateComplaints,
};
