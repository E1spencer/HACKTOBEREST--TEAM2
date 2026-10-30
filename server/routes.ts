/**
 * CampusHelp Express REST API Router
 * Endpoints for Auth, Catalog, Agents, Bookings, Payments, Reviews,
 * Chat, AI Service Matching, and Admin Trust & Safety.
 */

import { Router, Request, Response } from 'express';
import { store } from './store.ts';
import { matchAgentsWithAi } from './aiMatching.ts';

export const apiRouter = Router();

// Middleware to parse user id from header if passed or fallback
function getActorId(req: Request): string {
  return (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr-client-1';
}

// ==================== AUTH & USERS ====================
apiRouter.get('/auth/users', (req: Request, res: Response) => {
  const users = Array.from(store.users.values());
  res.json({ users });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const user = store.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const agentProfile = store.agentProfiles.get(userId);
  res.json({ user, agentProfile });
});

// Switch active user or register a new campus user
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, displayName, role, studentId, university, campusDorm, phone } = req.body;
  if (!email || !displayName || !role) {
    return res.status(400).json({ error: 'Email, display name, and role are required.' });
  }

  const existing = Array.from(store.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ user: existing });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    displayName,
    role,
    phone: phone || '+1 (555) 019-9000',
    studentId: studentId || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    university: university || 'Oakwood University',
    campusDorm: campusDorm || 'Kendall Residence Hall',
    avatarUrl: `https://images.unsplash.com/photo-${role === 'agent' ? '1534528741775-53994a69daeb' : '1539571696357-5a69c17a67c6'}?w=200&h=200&fit=crop&crop=faces`,
    isVerifiedStudent: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  store.users.set(newUser.id, newUser);

  if (role === 'agent') {
    store.agentProfiles.set(newUser.id, {
      userId: newUser.id,
      bio: 'New student helper ready to support campus peers.',
      major: 'Undeclared',
      yearOfStudy: 'Sophomore',
      languages: ['English'],
      baseCampusZone: 'North Quad',
      serviceRadiusDorms: ['North Quad', 'Science Quad', 'Kendall Hall'],
      verificationStatus: 'pending',
      isAvailableForWork: true,
      profileCompleteness: 70,
      cachedRating: 5.0,
      cachedReviewCount: 0,
      cachedCompletionRate: 100,
      cachedResponseRate: 100,
      badges: ['ID Verified Student'],
      joinedAt: new Date().toISOString(),
      completedJobsCount: 0,
    });
  }

  store.logAudit(displayName, 'User Registered', 'User', newUser.id, `Role: ${role}`);
  res.status(201).json({ user: newUser });
});

// ==================== CATALOG & CATEGORIES ====================
apiRouter.get('/categories', (req: Request, res: Response) => {
  const categories = Array.from(store.categories.values());
  res.json({ categories });
});

apiRouter.get('/categories/:slug', (req: Request, res: Response) => {
  const category = Array.from(store.categories.values()).find((c) => c.slug === req.params.slug);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json({ category });
});

// ==================== AGENTS & SEARCH ====================
apiRouter.get('/agents/search', (req: Request, res: Response) => {
  const { categorySlug, q, campusZone, maxPrice, minRating, verifiedOnly, sort } = req.query;

  const results = store.getPublicAgents({
    categorySlug: categorySlug ? String(categorySlug) : undefined,
    searchQuery: q ? String(q) : undefined,
    campusZone: campusZone ? String(campusZone) : undefined,
    maxPriceMinor: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    verifiedOnly: verifiedOnly === 'true',
    sort: (sort as any) || 'relevance',
  });

  res.json({
    total: results.length,
    agents: results,
  });
});

apiRouter.get('/agents/:id', (req: Request, res: Response) => {
  const profile = store.agentProfiles.get(req.params.id);
  const user = store.users.get(req.params.id);
  if (!profile || !user) return res.status(404).json({ error: 'Helper not found' });

  const services = Array.from(store.agentServices.values()).filter((s) => s.agentId === profile.userId);
  const reviews = Array.from(store.reviews.values()).filter(
    (r) => r.agentId === profile.userId && !r.isHidden
  );

  res.json({
    profile,
    user: {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      university: user.university,
      isVerifiedStudent: user.isVerifiedStudent,
    },
    services,
    reviews,
  });
});

apiRouter.put('/agents/me/profile', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const profile = store.agentProfiles.get(userId);
  if (!profile) return res.status(404).json({ error: 'Agent profile not found' });

  const { bio, major, yearOfStudy, languages, baseCampusZone, serviceRadiusDorms, isAvailableForWork } = req.body;
  if (bio !== undefined) profile.bio = bio;
  if (major !== undefined) profile.major = major;
  if (yearOfStudy !== undefined) profile.yearOfStudy = yearOfStudy;
  if (languages !== undefined) profile.languages = languages;
  if (baseCampusZone !== undefined) profile.baseCampusZone = baseCampusZone;
  if (serviceRadiusDorms !== undefined) profile.serviceRadiusDorms = serviceRadiusDorms;
  if (isAvailableForWork !== undefined) profile.isAvailableForWork = isAvailableForWork;

  res.json({ profile });
});

apiRouter.post('/agents/me/services', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const { categorySlug, title, description, pricingType, priceMinor, whatsIncluded } = req.body;

  const category = Array.from(store.categories.values()).find((c) => c.slug === categorySlug);
  if (!category) return res.status(400).json({ error: 'Invalid category' });

  const serviceId = `svc-${userId}-${Date.now()}`;
  const service = {
    id: serviceId,
    agentId: userId,
    categoryId: category.id,
    categorySlug: category.slug,
    title: title || 'Custom Campus Peer Service',
    description: description || '',
    pricingType: pricingType || 'hourly',
    priceMinor: Number(priceMinor) || 2000,
    currency: 'USD',
    minHours: 1,
    whatsIncluded: Array.isArray(whatsIncluded) ? whatsIncluded : ['Campus peer session', 'Direct support'],
    isActive: true,
  };

  store.agentServices.set(serviceId, service);
  res.status(201).json({ service });
});

// ==================== AGENT EARNINGS & PAYOUTS ====================
apiRouter.get('/agents/me/earnings', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const earnings = store.getAgentEarnings(userId);
  const ledgerHistory = store.ledger.filter((l) => l.account === 'agent_payable');
  res.json({ earnings, ledger: ledgerHistory });
});

apiRouter.post('/agents/me/payouts', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const { amountMinor } = req.body;
  const result = store.requestPayout(userId, Number(amountMinor));
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Payout submitted for campus ACH direct deposit.' });
});

// ==================== BOOKING ENGINE (PROMPT 06) ====================
apiRouter.get('/bookings', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const role = req.query.role as string;

  const all = Array.from(store.bookings.values());
  const filtered = all.filter((b) => {
    if (role === 'agent') return b.agentId === userId;
    if (role === 'client') return b.clientId === userId;
    return b.clientId === userId || b.agentId === userId;
  });

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ bookings: filtered });
});

apiRouter.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = store.bookings.get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const payment = Array.from(store.payments.values()).find((p) => p.bookingId === booking.id);
  const conversation = store.ensureConversation(booking);
  res.json({ booking, payment, conversationId: conversation.id });
});

apiRouter.post('/bookings', (req: Request, res: Response) => {
  const clientId = getActorId(req);
  const { agentId, agentServiceId, scheduledStart, durationHours, campusLocation, notes } = req.body;

  if (!agentId || !agentServiceId || !scheduledStart) {
    return res.status(400).json({ error: 'Helper, service, and scheduled time are required.' });
  }

  const result = store.createBooking({
    clientId,
    agentId,
    agentServiceId,
    scheduledStart,
    durationHours: Number(durationHours) || 1,
    campusLocation: campusLocation || 'Student Union / Central Library',
    notes,
  });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({ booking: result.booking });
});

// Transition routes
apiRouter.post('/bookings/:id/accept', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const result = store.transitionBooking(req.params.id, 'accepted', actorId);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking });
});

apiRouter.post('/bookings/:id/decline', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const { reason } = req.body;
  const result = store.transitionBooking(req.params.id, 'declined', actorId, reason);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking });
});

apiRouter.post('/bookings/:id/pay', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const result = store.transitionBooking(req.params.id, 'confirmed', actorId, 'Student funded escrow');
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking, message: 'Payment successfully secured in CampusHelp Escrow.' });
});

apiRouter.post('/bookings/:id/start', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const result = store.transitionBooking(req.params.id, 'in_progress', actorId, 'Helper checked in and started session');
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking });
});

apiRouter.post('/bookings/:id/complete', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const result = store.transitionBooking(req.params.id, 'completed', actorId, 'Helper marked session completed');
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking });
});

apiRouter.post('/bookings/:id/confirm-completion', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const result = store.transitionBooking(req.params.id, 'closed', actorId, 'Student confirmed completion and released escrow funds');
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking, message: 'Escrow released to helper!' });
});

apiRouter.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  const actorId = getActorId(req);
  const { reason } = req.body;
  const result = store.transitionBooking(req.params.id, 'cancelled', actorId, reason);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ booking: result.booking });
});

apiRouter.post('/bookings/:id/review', (req: Request, res: Response) => {
  const clientId = getActorId(req);
  const { rating, comment, tags } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and review comment are required.' });
  }

  const result = store.submitReview({
    bookingId: req.params.id,
    clientId,
    rating: Number(rating),
    comment,
    tags,
  });

  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ review: result.review });
});

apiRouter.post('/bookings/:id/dispute', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const { reason, evidenceText } = req.body;

  if (!reason || !evidenceText) {
    return res.status(400).json({ error: 'Reason and evidence description are required.' });
  }

  const result = store.openDispute({
    bookingId: req.params.id,
    openedByUserId: userId,
    reason,
    evidenceText,
  });

  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ dispute: result.dispute });
});

// ==================== IN-APP CHAT (PROMPT 10) ====================
apiRouter.get('/conversations/:id/messages', (req: Request, res: Response) => {
  const conv = store.conversations.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  const messages = store.messages.get(conv.id) || [];
  res.json({ conversation: conv, messages });
});

apiRouter.post('/conversations/:id/messages', (req: Request, res: Response) => {
  const senderId = getActorId(req);
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const result = store.sendMessage({
    conversationId: req.params.id,
    senderId,
    body,
  });

  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({
    message: result.message,
    warningBanner: result.warningBanner,
  });
});

// ==================== NOTIFICATIONS ====================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const list = store.notifications.get(userId) || [];
  res.json({ notifications: list });
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const userId = getActorId(req);
  const list = store.notifications.get(userId) || [];
  const notif = list.find((n) => n.id === req.params.id);
  if (notif) notif.readAt = new Date().toISOString();
  res.json({ success: true });
});

// ==================== AI SERVICE MATCHING (PROMPT 07) ====================
apiRouter.post('/ai/match', async (req: Request, res: Response) => {
  try {
    const { query, campusZone, dormLocation, budgetMaxPerHourMinor, openRouterApiKey, model } = req.body;
    const headerKey = req.headers['x-openrouter-key'] as string;

    const result = await matchAgentsWithAi({
      query,
      campusZone,
      dormLocation,
      budgetMaxPerHourMinor: budgetMaxPerHourMinor ? Number(budgetMaxPerHourMinor) : undefined,
      openRouterApiKey: headerKey || openRouterApiKey,
      model,
    });

    res.json(result);
  } catch (err: any) {
    console.error('AI match error:', err);
    res.status(500).json({
      error: 'AI matching service encountered an unexpected error.',
      details: err?.message,
    });
  }
});

// ==================== ADMIN & TRUST SAFETY (PROMPT 13) ====================
apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const totalBookings = store.bookings.size;
  const bookingsList = Array.from(store.bookings.values());
  const completed = bookingsList.filter((b) => ['completed', 'closed'].includes(b.status)).length;
  const inEscrow = bookingsList.filter((b) => b.status === 'confirmed').length;

  let totalGmvMinor = 0;
  bookingsList.forEach((b) => {
    if (['confirmed', 'in_progress', 'completed', 'closed'].includes(b.status)) {
      totalGmvMinor += b.priceSnapshot.totalMinor;
    }
  });

  const totalHelpers = store.agentProfiles.size;
  const verifiedHelpers = Array.from(store.agentProfiles.values()).filter((p) => p.verificationStatus === 'verified').length;
  const pendingVerifications = Array.from(store.agentProfiles.values()).filter((p) => p.verificationStatus === 'pending').length;
  const openDisputes = Array.from(store.disputes.values()).filter((d) => d.status === 'opened').length;

  res.json({
    kpis: {
      totalGmvMinor,
      totalBookings,
      completedBookings: completed,
      activeEscrowBookings: inEscrow,
      totalHelpers,
      verifiedHelpers,
      pendingVerifications,
      openDisputes,
    },
    disputes: Array.from(store.disputes.values()),
    pendingAgents: Array.from(store.agentProfiles.values())
      .filter((p) => p.verificationStatus === 'pending')
      .map((p) => ({
        profile: p,
        user: store.users.get(p.userId),
      })),
    auditLogs: store.auditLogs.slice(0, 50),
  });
});

apiRouter.post('/admin/verifications/:userId/approve', (req: Request, res: Response) => {
  const profile = store.agentProfiles.get(req.params.userId);
  if (!profile) return res.status(404).json({ error: 'Helper profile not found' });

  profile.verificationStatus = 'verified';
  const badges = new Set(profile.badges);
  badges.add('ID Verified Student');
  profile.badges = Array.from(badges);

  store.addNotification(req.params.userId, {
    type: 'verification_status',
    title: 'Student ID Verification Approved!',
    body: 'Your Oakwood University student credential has been verified. You can now accept client bookings.',
  });

  store.logAudit('Admin (Trust Office)', 'Approved Student Verification', 'AgentProfile', req.params.userId, '');
  res.json({ success: true, profile });
});

apiRouter.post('/admin/disputes/:id/resolve', (req: Request, res: Response) => {
  const { resolution } = req.body;
  if (!['client_refund_full', 'client_refund_partial', 'release_to_agent'].includes(resolution)) {
    return res.status(400).json({ error: 'Invalid resolution action.' });
  }

  const result = store.resolveDispute(req.params.id, resolution, 'usr-admin');
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ success: true, message: `Dispute resolved as ${resolution}.` });
});

// Reset data endpoint
apiRouter.post('/dev/reset-seed', (req: Request, res: Response) => {
  store.seedInitialData();
  res.json({ success: true, message: 'CampusHelp database re-seeded to initial state.' });
});
