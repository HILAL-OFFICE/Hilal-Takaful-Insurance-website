const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// Protect all admin routes with authentication
router.use(requireAuth);

// -----------------------------------------------------------------------------
// SITE SETTINGS
// -----------------------------------------------------------------------------
router.put('/settings', async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id; // Preserve primary key

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .update(updates)
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Settings updated successfully', data });
  } catch (err) {
    console.error('Admin settings update error:', err.message);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

// -----------------------------------------------------------------------------
// TEAM MEMBERS
// -----------------------------------------------------------------------------
router.post('/team', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Team member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/team/reorder — bulk update order_index for a leadership category
// Body: { updates: [{ id, order_index }, ...] }
router.patch('/team/reorder', async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    const errors = [];
    for (const { id, order_index } of updates) {
      const { error } = await supabaseAdmin
        .from('team_members')
        .update({ order_index, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) errors.push(`${id}: ${error.message}`);
    }

    if (errors.length > 0) {
      return res.status(500).json({ error: errors.join('; ') });
    }

    res.json({ success: true, message: `Reordered ${updates.length} members` });
  } catch (err) {
    console.error('Admin team reorder error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// PRODUCTS
// -----------------------------------------------------------------------------
router.post('/products', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// BLOG POSTS
// -----------------------------------------------------------------------------
router.post('/blog', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GALLERY
// -----------------------------------------------------------------------------
router.post('/gallery', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_events')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('gallery_events')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('gallery_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// FINANCIAL REPORTS
// -----------------------------------------------------------------------------
router.post('/reports', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('financial_reports')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('financial_reports')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('financial_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
