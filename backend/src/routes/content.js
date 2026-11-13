const express = require('express');
const router = express.Router();
const { supabasePublic, supabaseAdmin } = require('../config/supabase');

const db = () => supabaseAdmin || supabasePublic;

// GET /api/content/settings - Public Site Settings
router.get('/settings', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching site settings:', err.message);
    res.status(500).json({ error: 'Failed to retrieve site settings' });
  }
});

// GET /api/content/team - Team members grouped or filtered by category
router.get('/team', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { category } = req.query;
    let query = client
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching team members:', err.message);
    res.status(500).json({ error: 'Failed to retrieve team members' });
  }
});

// GET /api/content/products - Products filtered by category (general/family)
router.get('/products', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { category } = req.query;
    let query = client
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET /api/content/blog - Blog Posts
router.get('/blog', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching blog posts:', err.message);
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

// GET /api/content/gallery - Gallery events
router.get('/gallery', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { data, error } = await client
      .from('gallery_events')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching gallery events:', err.message);
    res.status(500).json({ error: 'Failed to retrieve gallery events' });
  }
});

// GET /api/content/reports - Financial & Shariah Reports
router.get('/reports', async (req, res) => {
  try {
    const client = db();
    if (!client) return res.status(503).json({ error: 'Database service unavailable' });

    const { data, error } = await client
      .from('financial_reports')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching reports:', err.message);
    res.status(500).json({ error: 'Failed to retrieve financial reports' });
  }
});

module.exports = router;

