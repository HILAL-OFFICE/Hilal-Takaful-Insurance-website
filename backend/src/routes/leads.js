const express = require('express');
const router = express.Router();
const { supabasePublic, supabaseAdmin } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

const db = () => supabaseAdmin || supabasePublic;

// POST /api/leads - Public Contact / Quote Request Submission
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, subject, service_type, message } = req.body;

    if (!full_name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields' });
    }

    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { data, error } = await client
      .from('inquiries')
      .insert([{
        full_name,
        email,
        phone: phone || '',
        subject: subject || '',
        service_type: service_type || 'General Inquiry',
        message,
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our team will contact you shortly.',
      data: { id: data.id }
    });
  } catch (err) {
    console.error('Lead submission error:', err.message);
    res.status(500).json({ error: 'Failed to submit inquiry. Please try again or email us directly.' });
  }
});

// GET /api/leads - Protected: Admin view of all leads/inquiries
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id - Protected: Admin delete inquiry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

