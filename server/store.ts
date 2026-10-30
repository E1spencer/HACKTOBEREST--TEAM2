/**
 * CampusHelp In-Memory Repository & State Machine Engine
 * Implements Clean Architecture domain services, double-entry ledger,
 * state transitions, Bayesian reputation, and seed data.
 */

import {
  User,
  AgentProfile,
  ServiceCategory,
  AgentService,
  Booking,
  BookingStatus,
  BookingStatusChange,
  PriceSnapshot,
  Payment,
  LedgerEntry,
  Review,
  Message,
  Conversation,
  Notification,
  Dispute,
  AuditLog,
} from '../src/types/marketplace.ts';

export class CampusMarketplaceStore {
  public users: Map<string, User> = new Map();
  public agentProfiles: Map<string, AgentProfile> = new Map();
  public categories: Map<string, ServiceCategory> = new Map();
  public agentServices: Map<string, AgentService> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public payments: Map<string, Payment> = new Map();
  public ledger: LedgerEntry[] = [];
  public reviews: Map<string, Review> = new Map();
  public conversations: Map<string, Conversation> = new Map();
  public messages: Map<string, Message[]> = new Map(); // conversationId -> messages
  public notifications: Map<string, Notification[]> = new Map(); // userId -> notifications
  public disputes: Map<string, Dispute> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  // --- Seed Data ---
  public seedInitialData(): void {
    this.users.clear();
    this.agentProfiles.clear();
    this.categories.clear();
    this.agentServices.clear();
    this.bookings.clear();
    this.payments.clear();
    this.ledger = [];
    this.reviews.clear();
    this.conversations.clear();
    this.messages.clear();
    this.notifications.clear();
    this.disputes.clear();
    this.auditLogs = [];

    // 1. Categories
    const categoriesList: ServiceCategory[] = [
      {
        id: 'cat-stem',
        slug: 'stem-tutoring',
        name: 'STEM & Coding Tutoring',
        iconName: 'Code2',
        description: 'One-on-one peer tutoring in Calculus, Physics, Python, Algorithms, and Chemistry.',
        keywords: ['math', 'calculus', 'python', 'code', 'physics', 'cs', 'data structures', 'programming', 'algebra', 'stem'],
        suggestedHourlyMin: 1800,
        suggestedHourlyMax: 3500,
        activeAgentsCount: 3,
      },
      {
        id: 'cat-humanities',
        slug: 'humanities-writing',
        name: 'Essay Proofreading & Writing',
        iconName: 'PenTool',
        description: 'Review essays, research drafts, citations, and language tutoring with senior humanities peers.',
        keywords: ['essay', 'writing', 'proofreading', 'paper', 'english', 'history', 'editing', 'literature', 'grammar'],
        suggestedHourlyMin: 1500,
        suggestedHourlyMax: 2800,
        activeAgentsCount: 2,
      },
      {
        id: 'cat-dorm-moving',
        slug: 'dorm-moving-help',
        name: 'Dorm Moving & Lifting',
        iconName: 'Truck',
        description: 'Move-in/out muscle, lugging heavy trunks, lofting beds, and dorm room furniture rearranges.',
        keywords: ['moving', 'lift', 'furniture', 'boxes', 'dorm shift', 'heavy', 'move-in', 'storage', 'trunk'],
        suggestedHourlyMin: 2000,
        suggestedHourlyMax: 4000,
        activeAgentsCount: 2,
      },
      {
        id: 'cat-laundry',
        slug: 'laundry-wash-fold',
        name: 'Dorm Laundry & Fold',
        iconName: 'Shirt',
        description: 'Same-day dorm room pickup, wash, dry, crisp fold, and delivery back to your hall door.',
        keywords: ['laundry', 'clothes', 'wash', 'fold', 'iron', 'dorm laundry', 'clean clothes'],
        suggestedHourlyMin: 1500,
        suggestedHourlyMax: 2500,
        activeAgentsCount: 1,
      },
      {
        id: 'cat-errands',
        slug: 'campus-errands',
        name: 'Campus Errands & Deliveries',
        iconName: 'ShoppingBag',
        description: 'Bookstore runs, package collection from student mail, dining hall line-waiting, or urgent supplies.',
        keywords: ['errands', 'pickup', 'delivery', 'mail', 'package', 'bookstore', 'queue', 'line', 'supplies'],
        suggestedHourlyMin: 1200,
        suggestedHourlyMax: 2200,
        activeAgentsCount: 2,
      },
      {
        id: 'cat-tech',
        slug: 'tech-setup-repairs',
        name: 'Tech & Laptop Setup',
        iconName: 'Cpu',
        description: 'Campus eduroam WiFi fix, software installs, clean Windows/Mac re-install, and virus cleanup.',
        keywords: ['tech', 'laptop', 'wifi', 'mac', 'windows', 'printer', 'repair', 'software', 'eduroam'],
        suggestedHourlyMin: 1800,
        suggestedHourlyMax: 3200,
        activeAgentsCount: 2,
      },
    ];

    categoriesList.forEach((c) => this.categories.set(c.id, c));

    // 2. Users (Admin, Clients, Agents)
    const adminUser: User = {
      id: 'usr-admin',
      email: 'trust-safety@campushelp.edu',
      displayName: 'Dean of Students Office (Admin)',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      studentId: 'FAC-8092',
      university: 'Oakwood University',
      campusDorm: 'Administration Hall Suite 300',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      isVerifiedStudent: true,
      createdAt: '2026-09-01T08:00:00Z',
      lastLoginAt: '2026-10-30T09:00:00Z',
    };
    this.users.set(adminUser.id, adminUser);

    const clientUser1: User = {
      id: 'usr-client-1',
      email: 'alex.foster@campushelp.edu',
      displayName: 'Alex Foster',
      role: 'client',
      phone: '+1 (555) 012-3456',
      studentId: 'STU-2026-8812',
      university: 'Oakwood University',
      campusDorm: 'Kendall Residence Hall, Rm 312',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      isVerifiedStudent: true,
      createdAt: '2026-09-10T10:00:00Z',
      lastLoginAt: '2026-10-30T10:00:00Z',
    };
    this.users.set(clientUser1.id, clientUser1);

    const clientUser2: User = {
      id: 'usr-client-2',
      email: 'chloe.bennett@campushelp.edu',
      displayName: 'Chloe Bennett',
      role: 'client',
      phone: '+1 (555) 014-9922',
      studentId: 'STU-2025-4421',
      university: 'Oakwood University',
      campusDorm: 'North Quad Tower B, Rm 405',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      isVerifiedStudent: true,
      createdAt: '2026-09-12T14:30:00Z',
      lastLoginAt: '2026-10-29T18:00:00Z',
    };
    this.users.set(clientUser2.id, clientUser2);

    // Agents
    const agentsData = [
      {
        id: 'usr-agent-maya',
        email: 'maya.chen@campushelp.edu',
        name: 'Maya Chen',
        dorm: 'North Quad Tower A, Rm 512',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
        major: 'Computer Science & AI',
        year: 'Senior (Class of 2027)',
        gpa: '3.94',
        languages: ['English', 'Mandarin'],
        zone: 'North Quad',
        dorms: ['North Quad', 'Science Quad', 'Kendall Hall', 'Central Campus'],
        badges: ['Top Rated', 'ID Verified Student', "Dean's List", 'Fast Responder'],
        rating: 4.9,
        reviews: 38,
        completion: 99,
        response: 98,
        bio: 'Senior CS student and TA for CS106 (Data Structures & Python). Passionate about demystifying algorithms, recursion, and debugging code without stress.',
        service: {
          catId: 'cat-stem',
          slug: 'stem-tutoring',
          title: 'Python, Algorithms & Calculus Peer Tutoring',
          desc: '1-on-1 personalized tutoring. We break down homework problems, prepare for midterms, and build intuitive mental models.',
          priceMinor: 2200, // $22/hr
          minHours: 1,
          included: ['Interactive live coding review', 'Shared Notion cheat-sheet', 'Exam-style sample questions'],
        },
      },
      {
        id: 'usr-agent-marcus',
        email: 'marcus.j@campushelp.edu',
        name: 'Marcus Johnson',
        dorm: 'Science Quad Court, Rm 204',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        major: 'Mechanical Engineering',
        year: 'Junior (Class of 2028)',
        gpa: '3.88',
        languages: ['English'],
        zone: 'Science Quad',
        dorms: ['Science Quad', 'Kendall Hall', 'East Towers', 'South Campus'],
        badges: ['Top Rated', 'ID Verified Student', 'Fast Responder'],
        rating: 4.8,
        reviews: 29,
        completion: 96,
        response: 95,
        bio: 'Engineering junior who loves helping fellow students conquer Calculus I-III and Physics Mechanics. Step-by-step problem solver with clear notes.',
        service: {
          catId: 'cat-stem',
          slug: 'stem-tutoring',
          title: 'Calculus I-III & Engineering Physics Crash Sessions',
          desc: 'Targeted drill sessions on derivatives, integrals, vectors, and mechanics equations. Proven results for midterm exams.',
          priceMinor: 2000, // $20/hr
          minHours: 1,
          included: ['Step-by-step whiteboard walkthrough', 'Formula formula card', 'Practice problem sets'],
        },
      },
      {
        id: 'usr-agent-david',
        email: 'david.kim@campushelp.edu',
        name: 'David Kim',
        dorm: 'West Quad Hall 3, Rm 118',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
        major: 'Kinesiology & Sports Science',
        year: 'Junior (Class of 2028)',
        gpa: '3.75',
        languages: ['English', 'Korean'],
        zone: 'West Quad',
        dorms: ['West Quad', 'North Quad', 'Kendall Hall', 'East Towers', 'South Campus'],
        badges: ['Top Rated', 'ID Verified Student', 'Heavy Lifter Certified'],
        rating: 4.95,
        reviews: 44,
        completion: 100,
        response: 97,
        bio: 'Varsity athlete with a hand-truck dolly. Experienced in rapid move-ins, move-outs, lifting mini-fridges, futons, and organizing tight dorm layouts safely.',
        service: {
          catId: 'cat-dorm-moving',
          slug: 'dorm-moving-help',
          title: 'Dorm Moving Muscle & Heavy Lifting',
          desc: 'Efficient heavy lifting assistance for move-in, move-out, or room shifts. Hand-truck and moving straps provided.',
          priceMinor: 2500, // $25/hr
          minHours: 1,
          included: ['Use of heavy-duty foldable hand-truck', 'Stair lifting support', 'Safe furniture arrangement'],
        },
      },
      {
        id: 'usr-agent-emily',
        email: 'emily.davis@campushelp.edu',
        name: 'Emily Davis',
        dorm: 'East Towers East, Rm 410',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        major: 'Hospitality & Management',
        year: 'Sophomore (Class of 2029)',
        gpa: '3.82',
        languages: ['English', 'Spanish'],
        zone: 'East Towers',
        dorms: ['East Towers', 'Kendall Hall', 'North Quad'],
        badges: ['ID Verified Student', 'Rising Talent'],
        rating: 4.85,
        reviews: 21,
        completion: 98,
        response: 100,
        bio: 'Keep your wardrobe pristine while studying for finals. I do careful sorting (colors/darks/delicates), wash with hypoallergenic detergent, and deliver back folded.',
        service: {
          catId: 'cat-laundry',
          slug: 'laundry-wash-fold',
          title: 'Campus Dorm Laundry Wash & Crisp Fold Service',
          desc: 'Door-to-door dorm laundry service. Fresh, clean, categorized, and neatly folded laundry returned within 4-6 hours.',
          priceMinor: 1800, // $18/hr
          minHours: 1,
          included: ['Hypoallergenic Tide Pods + Dryer sheets', 'Delicates mesh bag care', 'Square retail-style folding'],
        },
      },
      {
        id: 'usr-agent-jordan',
        email: 'jordan.taylor@campushelp.edu',
        name: 'Jordan Taylor',
        dorm: 'Kendall Residence Hall, Rm 215',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        major: 'English & Comparative Lit',
        year: 'Senior (Class of 2027)',
        gpa: '3.91',
        languages: ['English', 'French'],
        zone: 'Central Campus',
        dorms: ['Kendall Hall', 'North Quad', 'East Towers', 'West Quad'],
        badges: ['Top Rated', 'ID Verified Student', "Dean's List"],
        rating: 4.9,
        reviews: 26,
        completion: 97,
        response: 95,
        bio: 'Editor for the University Undergraduate Review. I help you sharpen thesis statements, tighten syntax, check MLA/APA format, and eliminate fluff.',
        service: {
          catId: 'cat-humanities',
          slug: 'humanities-writing',
          title: 'College Essay & Research Paper Intensive Polish',
          desc: 'Line-by-line review of your draft with constructive margin comments and a 30-min strategy feedback call.',
          priceMinor: 2000, // $20/hr
          minHours: 1,
          included: ['Google Docs tracked changes', 'Citation formatting check', 'Thesis strength analysis'],
        },
      },
      {
        id: 'usr-agent-alex',
        email: 'alex.rivera@campushelp.edu',
        name: 'Alex Rivera',
        dorm: 'North Quad Tower B, Rm 302',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces',
        major: 'Electrical & Computer Eng',
        year: 'Junior (Class of 2028)',
        gpa: '3.80',
        languages: ['English', 'Spanish'],
        zone: 'North Quad',
        dorms: ['North Quad', 'Science Quad', 'Kendall Hall', 'West Quad'],
        badges: ['ID Verified Student', 'Fast Responder'],
        rating: 4.9,
        reviews: 32,
        completion: 100,
        response: 99,
        bio: 'Student IT Desk consultant. I troubleshoot college WiFi issues, dual boot Linux, restore corrupted drives, set up printers, and clean up malware.',
        service: {
          catId: 'cat-tech',
          slug: 'tech-setup-repairs',
          title: 'Dorm Tech Diagnostics & Eduroam WiFi Setup',
          desc: 'In-person diagnosis for laptops, printers, tablets, and gaming consoles. Fix connectivity and performance slowness.',
          priceMinor: 2200, // $22/hr
          minHours: 1,
          included: ['OS diagnostic sweep', 'Secure campus WiFi authentication', 'Driver & firmware updates'],
        },
      },
      {
        id: 'usr-agent-samira',
        email: 'samira.khan@campushelp.edu',
        name: 'Samira Khan',
        dorm: 'Kendall Residence Hall, Rm 109',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
        major: 'Public Policy',
        year: 'Sophomore (Class of 2029)',
        gpa: '3.86',
        languages: ['English', 'Urdu', 'Hindi'],
        zone: 'Central Campus',
        dorms: ['Kendall Hall', 'North Quad', 'Science Quad', 'East Towers'],
        badges: ['ID Verified Student', 'Fast Responder', 'Rising Talent'],
        rating: 4.75,
        reviews: 18,
        completion: 95,
        response: 98,
        bio: 'Fast on an electric scooter across campus. I retrieve heavy mail packages from student post, pick up bookstore course packs, or grab pharmacy essentials.',
        service: {
          catId: 'cat-errands',
          slug: 'campus-errands',
          title: 'Express Campus Package & Bookstore Errands',
          desc: 'Quick and reliable campus errand runs. Tracked via live chat with receipt photos provided.',
          priceMinor: 1500, // $15/hr
          minHours: 1,
          included: ['Photo verification of pickup', 'Secure transport backpack', 'Direct drop-off at your dorm door'],
        },
      },
    ];

    agentsData.forEach((a, idx) => {
      const u: User = {
        id: a.id,
        email: a.email,
        displayName: a.name,
        role: 'agent',
        phone: `+1 (555) 018-${7000 + idx}`,
        studentId: `STU-2024-${5000 + idx}`,
        university: 'Oakwood University',
        campusDorm: a.dorm,
        avatarUrl: a.avatar,
        isVerifiedStudent: true,
        createdAt: '2026-08-25T10:00:00Z',
        lastLoginAt: '2026-10-30T11:00:00Z',
      };
      this.users.set(u.id, u);

      const p: AgentProfile = {
        userId: a.id,
        bio: a.bio,
        major: a.major,
        yearOfStudy: a.year,
        gpa: a.gpa,
        languages: a.languages,
        baseCampusZone: a.zone,
        serviceRadiusDorms: a.dorms,
        verificationStatus: 'verified',
        studentCardDocUrl: 'https://placehold.co/600x400/1e293b/white?text=Verified+Student+ID',
        isAvailableForWork: true,
        profileCompleteness: 95,
        cachedRating: a.rating,
        cachedReviewCount: a.reviews,
        cachedCompletionRate: a.completion,
        cachedResponseRate: a.response,
        badges: a.badges,
        joinedAt: '2026-08-26T12:00:00Z',
        completedJobsCount: a.reviews + 4,
      };
      this.agentProfiles.set(p.userId, p);

      const s: AgentService = {
        id: `svc-${a.id}`,
        agentId: a.id,
        categoryId: a.service.catId,
        categorySlug: a.service.slug,
        title: a.service.title,
        description: a.service.desc,
        pricingType: 'hourly',
        priceMinor: a.service.priceMinor,
        currency: 'USD',
        minHours: a.service.minHours,
        whatsIncluded: a.service.included,
        isActive: true,
      };
      this.agentServices.set(s.id, s);
    });

    // 3. Pre-seed Sample Completed Bookings, Escrow Payments, and Reviews
    const completedBooking1: Booking = {
      id: 'bk-sample-01',
      clientId: 'usr-client-1',
      clientName: 'Alex Foster',
      clientAvatar: clientUser1.avatarUrl,
      clientDorm: clientUser1.campusDorm,
      agentId: 'usr-agent-maya',
      agentName: 'Maya Chen',
      agentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      agentMajor: 'Computer Science & AI',
      agentServiceId: 'svc-usr-agent-maya',
      serviceTitle: 'Python, Algorithms & Calculus Peer Tutoring',
      categorySlug: 'stem-tutoring',
      status: 'closed',
      scheduledStart: '2026-10-25T15:00:00Z',
      scheduledEnd: '2026-10-25T17:00:00Z',
      durationHours: 2,
      campusLocation: 'Central Library, Room 204',
      notes: 'Need to prepare for the Binary Search Tree and Recursion midterm quiz.',
      priceSnapshot: {
        pricingType: 'hourly',
        rateMinor: 2200,
        hours: 2,
        subtotalMinor: 4400,
        platformFeeMinor: 440,
        totalMinor: 4840,
        currency: 'USD',
      },
      statusHistory: [
        { from: null, to: 'requested', changedBy: 'usr-client-1', changedAt: '2026-10-24T12:00:00Z' },
        { from: 'requested', to: 'accepted', changedBy: 'usr-agent-maya', changedAt: '2026-10-24T12:15:00Z' },
        { from: 'accepted', to: 'confirmed', changedBy: 'usr-client-1', changedAt: '2026-10-24T12:30:00Z', reason: 'Payment held in escrow' },
        { from: 'confirmed', to: 'in_progress', changedBy: 'usr-agent-maya', changedAt: '2026-10-25T15:00:00Z' },
        { from: 'in_progress', to: 'completed', changedBy: 'usr-agent-maya', changedAt: '2026-10-25T17:00:00Z' },
        { from: 'completed', to: 'closed', changedBy: 'usr-client-1', changedAt: '2026-10-25T17:30:00Z', reason: 'Student confirmed completion' },
      ],
      createdAt: '2026-10-24T12:00:00Z',
      updatedAt: '2026-10-25T17:30:00Z',
      isReviewed: true,
    };
    this.bookings.set(completedBooking1.id, completedBooking1);

    const payment1: Payment = {
      id: 'pay-sample-01',
      bookingId: completedBooking1.id,
      amountMinor: 4840,
      feeMinor: 440,
      netAgentMinor: 4400,
      currency: 'USD',
      status: 'released',
      provider: 'campus_escrow_sim',
      reference: 'ESCROW-TX-99812',
      heldAt: '2026-10-24T12:30:00Z',
      releasedAt: '2026-10-25T17:30:00Z',
      createdAt: '2026-10-24T12:30:00Z',
    };
    this.payments.set(payment1.id, payment1);

    // Ledger entries for payment1 (double entry escrow release)
    this.ledger.push(
      {
        id: 'led-1',
        bookingId: completedBooking1.id,
        account: 'client_escrow',
        type: 'credit',
        amountMinor: 4840,
        currency: 'USD',
        timestamp: '2026-10-24T12:30:00Z',
        description: 'Escrow hold deposit from Alex Foster',
      },
      {
        id: 'led-2',
        bookingId: completedBooking1.id,
        account: 'client_escrow',
        type: 'debit',
        amountMinor: 4840,
        currency: 'USD',
        timestamp: '2026-10-25T17:30:00Z',
        description: 'Escrow released on completion',
      },
      {
        id: 'led-3',
        bookingId: completedBooking1.id,
        account: 'agent_payable',
        type: 'credit',
        amountMinor: 4400,
        currency: 'USD',
        timestamp: '2026-10-25T17:30:00Z',
        description: 'Net earnings credited to Maya Chen',
      },
      {
        id: 'led-4',
        bookingId: completedBooking1.id,
        account: 'platform_revenue',
        type: 'credit',
        amountMinor: 440,
        currency: 'USD',
        timestamp: '2026-10-25T17:30:00Z',
        description: '10% CampusHelp platform commission',
      }
    );

    // Review for booking 1
    const review1: Review = {
      id: 'rev-01',
      bookingId: completedBooking1.id,
      clientId: 'usr-client-1',
      clientName: 'Alex Foster',
      clientAvatar: clientUser1.avatarUrl,
      agentId: 'usr-agent-maya',
      rating: 5,
      comment: 'Maya is hands down the best CS tutor on campus! She explained recursion in 20 minutes better than my professor did all semester. Aided my test score significantly!',
      tags: ['Patient Tutor', 'Punctual', 'Clear Explanations', 'A+ Exam Prep'],
      agentReply: 'Thank you Alex! You crushed those tree traversals. Always happy to help!',
      isHidden: false,
      createdAt: '2026-10-25T18:00:00Z',
    };
    this.reviews.set(review1.id, review1);

    // 4. Pre-seed Active/Upcoming Booking (Confirmed in Escrow)
    const activeBooking: Booking = {
      id: 'bk-sample-02',
      clientId: 'usr-client-1',
      clientName: 'Alex Foster',
      clientAvatar: clientUser1.avatarUrl,
      clientDorm: clientUser1.campusDorm,
      agentId: 'usr-agent-david',
      agentName: 'David Kim',
      agentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      agentMajor: 'Kinesiology & Sports Science',
      agentServiceId: 'svc-usr-agent-david',
      serviceTitle: 'Dorm Moving Muscle & Heavy Lifting',
      categorySlug: 'dorm-moving-help',
      status: 'confirmed',
      scheduledStart: '2026-10-31T14:00:00Z',
      scheduledEnd: '2026-10-31T16:00:00Z',
      durationHours: 2,
      campusLocation: 'Kendall Residence Hall Room 312 to West Quad',
      notes: 'Moving a mini-fridge and 3 heavy textbook containers across campus.',
      priceSnapshot: {
        pricingType: 'hourly',
        rateMinor: 2500,
        hours: 2,
        subtotalMinor: 5000,
        platformFeeMinor: 500,
        totalMinor: 5500,
        currency: 'USD',
      },
      statusHistory: [
        { from: null, to: 'requested', changedBy: 'usr-client-1', changedAt: '2026-10-29T10:00:00Z' },
        { from: 'requested', to: 'accepted', changedBy: 'usr-agent-david', changedAt: '2026-10-29T10:20:00Z' },
        { from: 'accepted', to: 'confirmed', changedBy: 'usr-client-1', changedAt: '2026-10-29T11:00:00Z', reason: 'Payment $55.00 held in Escrow' },
      ],
      createdAt: '2026-10-29T10:00:00Z',
      updatedAt: '2026-10-29T11:00:00Z',
      isReviewed: false,
    };
    this.bookings.set(activeBooking.id, activeBooking);

    const payment2: Payment = {
      id: 'pay-sample-02',
      bookingId: activeBooking.id,
      amountMinor: 5500,
      feeMinor: 500,
      netAgentMinor: 5000,
      currency: 'USD',
      status: 'held',
      provider: 'campus_escrow_sim',
      reference: 'ESCROW-TX-99845',
      heldAt: '2026-10-29T11:00:00Z',
      createdAt: '2026-10-29T11:00:00Z',
    };
    this.payments.set(payment2.id, payment2);

    this.ledger.push({
      id: 'led-5',
      bookingId: activeBooking.id,
      account: 'client_escrow',
      type: 'credit',
      amountMinor: 5500,
      currency: 'USD',
      timestamp: '2026-10-29T11:00:00Z',
      description: 'Escrow hold for David Kim dorm move',
    });

    // Conversation and Chat messages for activeBooking
    const conv1: Conversation = {
      id: 'conv-sample-02',
      bookingId: activeBooking.id,
      clientId: 'usr-client-1',
      agentId: 'usr-agent-david',
      serviceTitle: 'Dorm Moving Muscle & Heavy Lifting',
      lastMessage: 'Got it, see you at 2:00 PM outside Kendall Hall with my hand truck!',
      lastMessageAt: '2026-10-29T11:30:00Z',
      unreadCountClient: 0,
      unreadCountAgent: 0,
    };
    this.conversations.set(conv1.id, conv1);

    this.messages.set(conv1.id, [
      {
        id: 'msg-1',
        conversationId: conv1.id,
        bookingId: activeBooking.id,
        senderId: 'usr-client-1',
        senderName: 'Alex Foster',
        senderRole: 'client',
        body: 'Hey David! Just confirming we will need to bring the mini-fridge down 2 flights of stairs.',
        sentAt: '2026-10-29T11:15:00Z',
      },
      {
        id: 'msg-2',
        conversationId: conv1.id,
        bookingId: activeBooking.id,
        senderId: 'usr-agent-david',
        senderName: 'David Kim',
        senderRole: 'agent',
        body: 'No problem at all! I have moving straps and rubber-padded corners. We will get it down safely.',
        sentAt: '2026-10-29T11:20:00Z',
      },
      {
        id: 'msg-3',
        conversationId: conv1.id,
        bookingId: activeBooking.id,
        senderId: 'usr-agent-david',
        senderName: 'David Kim',
        senderRole: 'agent',
        body: 'Got it, see you at 2:00 PM outside Kendall Hall with my hand truck!',
        sentAt: '2026-10-29T11:30:00Z',
      },
    ]);

    // Initial notifications
    this.addNotification('usr-client-1', {
      type: 'payment_held',
      title: 'Escrow Payment Secured ($55.00)',
      body: 'Your booking with David Kim is confirmed. Funds are safely held until you confirm completion.',
      bookingId: activeBooking.id,
    });
    this.addNotification('usr-agent-david', {
      type: 'booking_accepted',
      title: 'New Confirmed Job with Alex Foster',
      body: 'Dorm Moving scheduled for Oct 31, 2:00 PM. Escrow secured.',
      bookingId: activeBooking.id,
    });
  }

  // --- Helper Methods ---

  public getPublicAgents(filters?: {
    categorySlug?: string;
    searchQuery?: string;
    campusZone?: string;
    maxPriceMinor?: number;
    minRating?: number;
    verifiedOnly?: boolean;
    sort?: 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'completion';
  }) {
    const list: any[] = [];

    for (const profile of this.agentProfiles.values()) {
      const user = this.users.get(profile.userId);
      if (!user || user.role !== 'agent') continue;
      if (!profile.isAvailableForWork) continue;

      // Find services
      const services = Array.from(this.agentServices.values()).filter(
        (s) => s.agentId === profile.userId && s.isActive
      );
      if (services.length === 0) continue;

      const mainService = services[0];

      // Filters
      if (filters?.categorySlug && mainService.categorySlug !== filters.categorySlug) {
        continue;
      }
      if (filters?.campusZone && profile.baseCampusZone !== filters.campusZone) {
        // also check if services that dorm
        if (!profile.serviceRadiusDorms.includes(filters.campusZone)) {
          continue;
        }
      }
      if (filters?.maxPriceMinor && mainService.priceMinor > filters.maxPriceMinor) {
        continue;
      }
      if (filters?.minRating && profile.cachedRating < filters.minRating) {
        continue;
      }
      if (filters?.verifiedOnly && profile.verificationStatus !== 'verified') {
        continue;
      }

      // Text query match
      let textMatchScore = 1.0;
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const combined = `${user.displayName} ${profile.bio} ${profile.major} ${mainService.title} ${mainService.description} ${mainService.categorySlug}`.toLowerCase();
        if (!combined.includes(q)) {
          // Check keywords
          const cat = this.categories.get(mainService.categoryId);
          const hasKeyword = cat?.keywords.some((k) => q.includes(k) || k.includes(q));
          if (!hasKeyword) continue;
          textMatchScore = 0.7;
        } else {
          textMatchScore = 1.0;
        }
      }

      // Bayesian average: (C * m + sum) / (C + n) with m = 4.5, C = 10
      const C = 10;
      const m = 4.5;
      const bayesianRating =
        (C * m + profile.cachedRating * profile.cachedReviewCount) / (C + profile.cachedReviewCount);

      // Score formula per prompt 05:
      // score = 0.35*textMatch + 0.25*(bayesianRating/5) + 0.15*(completion/100) + 0.15*(proximity) + 0.10*(response/100)
      const score =
        0.35 * textMatchScore +
        0.25 * (bayesianRating / 5) +
        0.15 * (profile.cachedCompletionRate / 100) +
        0.15 * 1.0 +
        0.1 * (profile.cachedResponseRate / 100);

      list.push({
        agentId: profile.userId,
        displayName: user.displayName,
        photoUrl: user.avatarUrl,
        major: profile.major,
        yearOfStudy: profile.yearOfStudy,
        gpa: profile.gpa,
        baseCampusZone: profile.baseCampusZone,
        languages: profile.languages,
        verificationStatus: profile.verificationStatus,
        rating: profile.cachedRating,
        reviewCount: profile.cachedReviewCount,
        completionRate: profile.cachedCompletionRate,
        responseRate: profile.cachedResponseRate,
        badges: profile.badges,
        bio: profile.bio,
        mainService: {
          id: mainService.id,
          title: mainService.title,
          description: mainService.description,
          priceMinor: mainService.priceMinor,
          pricingType: mainService.pricingType,
          categorySlug: mainService.categorySlug,
          whatsIncluded: mainService.whatsIncluded,
        },
        services: services,
        score,
      });
    }

    // Sort
    const sort = filters?.sort || 'relevance';
    list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'price_asc') return a.mainService.priceMinor - b.mainService.priceMinor;
      if (sort === 'price_desc') return b.mainService.priceMinor - a.mainService.priceMinor;
      if (sort === 'completion') return b.completionRate - a.completionRate;
      return b.score - a.score;
    });

    return list;
  }

  // --- Booking Engine State Machine (Prompt 06) ---
  public createBooking(data: {
    clientId: string;
    agentId: string;
    agentServiceId: string;
    scheduledStart: string;
    durationHours: number;
    campusLocation: string;
    notes?: string;
  }): { booking?: Booking; error?: string } {
    const client = this.users.get(data.clientId);
    const agent = this.users.get(data.agentId);
    const service = this.agentServices.get(data.agentServiceId);
    const profile = this.agentProfiles.get(data.agentId);

    if (!client || !agent || !service || !profile) {
      return { error: 'Client, helper, or service not found.' };
    }

    if (!profile.isAvailableForWork || profile.verificationStatus === 'rejected') {
      return { error: 'This helper is currently unavailable for bookings.' };
    }

    // Check client concurrent requested limit (anti-spam, max 3 requested)
    const clientRequestedCount = Array.from(this.bookings.values()).filter(
      (b) => b.clientId === data.clientId && b.status === 'requested'
    ).length;
    if (clientRequestedCount >= 3) {
      return { error: 'You have reached the maximum of 3 pending requested bookings. Please wait for helpers to respond.' };
    }

    // Calculate PriceSnapshot
    const hours = Math.max(service.minHours || 1, data.durationHours || 1);
    const subtotalMinor = service.priceMinor * hours;
    const platformFeeMinor = Math.round(subtotalMinor * 0.1); // 10% fee
    const totalMinor = subtotalMinor + platformFeeMinor;

    const startDate = new Date(data.scheduledStart);
    const endDate = new Date(startDate.getTime() + hours * 3600 * 1000);

    // Concurrency conflict check: check if slot overlaps existing confirmed/in_progress bookings
    const overlapping = Array.from(this.bookings.values()).find((b) => {
      if (b.agentId !== data.agentId) return false;
      if (['confirmed', 'in_progress'].includes(b.status)) {
        const bStart = new Date(b.scheduledStart).getTime();
        const bEnd = new Date(b.scheduledEnd).getTime();
        const reqStart = startDate.getTime();
        const reqEnd = endDate.getTime();
        return Math.max(bStart, reqStart) < Math.min(bEnd, reqEnd);
      }
      return false;
    });

    if (overlapping) {
      return { error: 'Helper has a conflicting confirmed session at this time. Please pick another slot.' };
    }

    const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const priceSnapshot: PriceSnapshot = {
      pricingType: service.pricingType,
      rateMinor: service.priceMinor,
      hours,
      subtotalMinor,
      platformFeeMinor,
      totalMinor,
      currency: 'USD',
    };

    const statusHistory: BookingStatusChange[] = [
      {
        from: null,
        to: 'requested',
        changedBy: data.clientId,
        changedAt: now,
        reason: 'Initial booking request submitted',
      },
    ];

    const booking: Booking = {
      id: bookingId,
      clientId: data.clientId,
      clientName: client.displayName,
      clientAvatar: client.avatarUrl,
      clientDorm: client.campusDorm,
      agentId: data.agentId,
      agentName: agent.displayName,
      agentAvatar: agent.avatarUrl,
      agentMajor: profile.major,
      agentServiceId: service.id,
      serviceTitle: service.title,
      categorySlug: service.categorySlug,
      status: 'requested',
      scheduledStart: startDate.toISOString(),
      scheduledEnd: endDate.toISOString(),
      durationHours: hours,
      campusLocation: data.campusLocation || client.campusDorm,
      notes: data.notes || '',
      priceSnapshot,
      statusHistory,
      createdAt: now,
      updatedAt: now,
      isReviewed: false,
    };

    this.bookings.set(booking.id, booking);

    // Notify agent
    this.addNotification(data.agentId, {
      type: 'booking_requested',
      title: 'New Service Request Received!',
      body: `${client.displayName} requested "${service.title}" for ${hours}h on ${startDate.toLocaleDateString()}.`,
      bookingId: booking.id,
    });

    this.logAudit(client.displayName, 'Booking Requested', 'Booking', booking.id, `Total: $${(totalMinor / 100).toFixed(2)}`);

    return { booking };
  }

  // --- State Transitions ---
  public transitionBooking(
    bookingId: string,
    newStatus: BookingStatus,
    actorUserId: string,
    reason?: string
  ): { booking?: Booking; error?: string } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { error: 'Booking not found.' };

    const currentStatus = booking.status;
    const now = new Date().toISOString();

    // Valid State Machine Transitions (from File 06)
    // Requested -> Accepted | Declined | Cancelled | Expired
    // Accepted -> Confirmed (on payment) | Cancelled
    // Confirmed -> InProgress | Cancelled | Disputed
    // InProgress -> Completed | Disputed
    // Completed -> Closed (client confirms or 24h auto) | Disputed
    // Disputed -> Resolved (handled via admin dispute action)

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      requested: ['accepted', 'declined', 'cancelled', 'expired'],
      accepted: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled', 'disputed'],
      in_progress: ['completed', 'disputed'],
      completed: ['closed', 'disputed'],
      closed: ['disputed'],
      declined: [],
      cancelled: [],
      expired: [],
      disputed: ['closed', 'cancelled'],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return {
        error: `Invalid transition from "${currentStatus}" to "${newStatus}".`,
      };
    }

    // Role-specific check
    if (newStatus === 'accepted' || newStatus === 'declined') {
      if (booking.agentId !== actorUserId) {
        return { error: 'Only the assigned helper can accept or decline this request.' };
      }
    }

    // Execute side effects
    if (newStatus === 'confirmed') {
      // Payment held in escrow
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        bookingId: booking.id,
        amountMinor: booking.priceSnapshot.totalMinor,
        feeMinor: booking.priceSnapshot.platformFeeMinor,
        netAgentMinor: booking.priceSnapshot.subtotalMinor,
        currency: 'USD',
        status: 'held',
        provider: 'campus_escrow_sim',
        reference: `ESCROW-SIM-${Date.now()}`,
        heldAt: now,
        createdAt: now,
      };
      this.payments.set(payment.id, payment);

      this.ledger.push({
        id: `led-${Date.now()}-1`,
        bookingId: booking.id,
        account: 'client_escrow',
        type: 'credit',
        amountMinor: payment.amountMinor,
        currency: 'USD',
        timestamp: now,
        description: `Escrow payment held for ${booking.serviceTitle}`,
      });

      // Create conversation if not exists
      this.ensureConversation(booking);

      this.addNotification(booking.agentId, {
        type: 'payment_held',
        title: 'Payment Held in Escrow!',
        body: `Client ${booking.clientName} deposited $${(payment.amountMinor / 100).toFixed(2)}. You are confirmed to begin on time.`,
        bookingId: booking.id,
      });
    }

    if (newStatus === 'closed') {
      // Release escrow funds to agent
      const payment = Array.from(this.payments.values()).find((p) => p.bookingId === booking.id);
      if (payment && payment.status === 'held') {
        payment.status = 'released';
        payment.releasedAt = now;

        this.ledger.push(
          {
            id: `led-${Date.now()}-rel-esc`,
            bookingId: booking.id,
            account: 'client_escrow',
            type: 'debit',
            amountMinor: payment.amountMinor,
            currency: 'USD',
            timestamp: now,
            description: `Escrow release upon job completion`,
          },
          {
            id: `led-${Date.now()}-cred-agent`,
            bookingId: booking.id,
            account: 'agent_payable',
            type: 'credit',
            amountMinor: payment.netAgentMinor,
            currency: 'USD',
            timestamp: now,
            description: `Helper payout credited: $${(payment.netAgentMinor / 100).toFixed(2)}`,
          },
          {
            id: `led-${Date.now()}-plat-rev`,
            bookingId: booking.id,
            account: 'platform_revenue',
            type: 'credit',
            amountMinor: payment.feeMinor,
            currency: 'USD',
            timestamp: now,
            description: `Platform fee: $${(payment.feeMinor / 100).toFixed(2)}`,
          }
        );

        this.addNotification(booking.agentId, {
          type: 'payment_released',
          title: 'Funds Released to Your Balance!',
          body: `$${(payment.netAgentMinor / 100).toFixed(2)} has been credited to your available balance for "${booking.serviceTitle}".`,
          bookingId: booking.id,
        });

        // Recompute agent stats
        this.recomputeAgentReputation(booking.agentId);
      }
    }

    if (newStatus === 'cancelled') {
      booking.cancelledBy = actorUserId;
      booking.cancellationReason = reason || 'Cancelled by user';

      // Cancellation policy refund calculation (File 06):
      // Free if > 24h before start; 50% fee if 2-24h; 100% fee if < 2h.
      const payment = Array.from(this.payments.values()).find((p) => p.bookingId === booking.id);
      if (payment && payment.status === 'held') {
        const startMillis = new Date(booking.scheduledStart).getTime();
        const nowMillis = Date.now();
        const diffHours = (startMillis - nowMillis) / (1000 * 3600);

        let refundPercentage = 100;
        if (diffHours < 2) {
          refundPercentage = 0; // No refund if < 2h
        } else if (diffHours < 24) {
          refundPercentage = 50;
        }

        const refundMinor = Math.round((payment.amountMinor * refundPercentage) / 100);
        payment.status = 'refunded';
        payment.refundedAt = now;

        this.ledger.push({
          id: `led-${Date.now()}-ref`,
          bookingId: booking.id,
          account: 'client_escrow',
          type: 'debit',
          amountMinor: refundMinor,
          currency: 'USD',
          timestamp: now,
          description: `Cancellation refund (${refundPercentage}%) of $${(refundMinor / 100).toFixed(2)}`,
        });
      }

      this.recomputeAgentReputation(booking.agentId);
    }

    // Append to status history
    booking.status = newStatus;
    booking.updatedAt = now;
    booking.statusHistory.push({
      from: currentStatus,
      to: newStatus,
      changedBy: actorUserId,
      changedAt: now,
      reason: reason || undefined,
    });

    const actor = this.users.get(actorUserId)?.displayName || 'System';
    this.logAudit(actor, `Booking Transition: ${currentStatus} -> ${newStatus}`, 'Booking', booking.id, reason || '');

    return { booking };
  }

  // --- Reviews & Bayesian Reputation (Prompt 08) ---
  public submitReview(data: {
    bookingId: string;
    clientId: string;
    rating: number;
    comment: string;
    tags?: string[];
  }): { review?: Review; error?: string } {
    const booking = this.bookings.get(data.bookingId);
    if (!booking) return { error: 'Booking not found.' };

    if (booking.clientId !== data.clientId) {
      return { error: 'Only the client who booked this service can leave a review.' };
    }

    if (booking.status !== 'completed' && booking.status !== 'closed') {
      return { error: 'Reviews can only be submitted after the service has been completed.' };
    }

    if (booking.isReviewed) {
      return { error: 'You have already reviewed this booking.' };
    }

    const reviewId = `rev-${Date.now()}`;
    const now = new Date().toISOString();
    const client = this.users.get(data.clientId);

    const review: Review = {
      id: reviewId,
      bookingId: booking.id,
      clientId: data.clientId,
      clientName: client?.displayName || 'Student Client',
      clientAvatar: client?.avatarUrl,
      agentId: booking.agentId,
      rating: Math.min(5, Math.max(1, data.rating)),
      comment: data.comment,
      tags: data.tags || ['Verified Student', 'Punctual'],
      isHidden: false,
      createdAt: now,
    };

    this.reviews.set(review.id, review);
    booking.isReviewed = true;

    // Recalculate reputation
    this.recomputeAgentReputation(booking.agentId);

    // Notify agent
    this.addNotification(booking.agentId, {
      type: 'review_received',
      title: `New ${review.rating}★ Review from ${client?.displayName}!`,
      body: `"${review.comment.substring(0, 80)}..."`,
      bookingId: booking.id,
    });

    this.logAudit(client?.displayName || 'Client', 'Submitted Review', 'Review', review.id, `Rating: ${review.rating}★`);

    return { review };
  }

  public recomputeAgentReputation(agentId: string): void {
    const profile = this.agentProfiles.get(agentId);
    if (!profile) return;

    const agentReviews = Array.from(this.reviews.values()).filter(
      (r) => r.agentId === agentId && !r.isHidden
    );

    const totalRatings = agentReviews.reduce((acc, r) => acc + r.rating, 0);
    const count = agentReviews.length;
    const avgRating = count > 0 ? Number((totalRatings / count).toFixed(2)) : 5.0;

    // Completion rate = completed / (completed + agent cancelled + no show)
    const agentBookings = Array.from(this.bookings.values()).filter(
      (b) => b.agentId === agentId
    );
    const completedCount = agentBookings.filter((b) => ['completed', 'closed'].includes(b.status)).length;
    const agentCancelled = agentBookings.filter((b) => b.status === 'cancelled' && b.cancelledBy === agentId).length;
    const divisor = completedCount + agentCancelled;
    const completionRate = divisor > 0 ? Math.round((completedCount / divisor) * 100) : 98;

    profile.cachedRating = avgRating;
    profile.cachedReviewCount = count;
    profile.cachedCompletionRate = completionRate;
    profile.completedJobsCount = completedCount;

    // Badges update
    const badges = new Set(profile.badges);
    if (avgRating >= 4.8 && count >= 5 && completionRate >= 95) {
      badges.add('Top Rated');
    }
    if (count < 5 && avgRating >= 4.8) {
      badges.add('Rising Talent');
    }
    profile.badges = Array.from(badges);
  }

  // --- In-App Chat & Anti-Leakage Guard (Prompt 10) ---
  public ensureConversation(booking: Booking): Conversation {
    const existing = Array.from(this.conversations.values()).find(
      (c) => c.bookingId === booking.id
    );
    if (existing) return existing;

    const convId = `conv-${booking.id}`;
    const conv: Conversation = {
      id: convId,
      bookingId: booking.id,
      clientId: booking.clientId,
      agentId: booking.agentId,
      serviceTitle: booking.serviceTitle,
      unreadCountClient: 0,
      unreadCountAgent: 0,
    };
    this.conversations.set(conv.id, conv);
    this.messages.set(conv.id, []);
    return conv;
  }

  public sendMessage(data: {
    conversationId: string;
    senderId: string;
    body: string;
  }): { message?: Message; warningBanner?: string; error?: string } {
    const conv = this.conversations.get(data.conversationId);
    if (!conv) return { error: 'Conversation not found.' };

    const sender = this.users.get(data.senderId);
    if (!sender) return { error: 'Sender not found.' };

    // Anti-leakage detection: detect phone numbers, emails, and off-platform payments (e.g. cashapp, venmo, zelle, wire)
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const paymentPattern = /\b(cashapp|venmo|zelle|paypal|pay me directly|wire transfer|direct deposit|crypto|bitcoin)\b/i;

    let flagged = false;
    let reason = '';

    if (phonePattern.test(data.body)) {
      flagged = true;
      reason = 'Phone number detected';
    } else if (emailPattern.test(data.body)) {
      flagged = true;
      reason = 'Direct email detected';
    } else if (paymentPattern.test(data.body)) {
      flagged = true;
      reason = 'Off-platform payment attempt detected';
    }

    const msgId = `msg-${Date.now()}`;
    const now = new Date().toISOString();

    const msg: Message = {
      id: msgId,
      conversationId: conv.id,
      bookingId: conv.bookingId,
      senderId: data.senderId,
      senderName: sender.displayName,
      senderRole: sender.role,
      body: data.body,
      sentAt: now,
      isFlaggedForLeakage: flagged,
      flagReason: flagged ? reason : undefined,
    };

    const list = this.messages.get(conv.id) || [];
    list.push(msg);
    this.messages.set(conv.id, list);

    conv.lastMessage = data.body;
    conv.lastMessageAt = now;

    // Recipient notification
    const recipientId = sender.id === conv.clientId ? conv.agentId : conv.clientId;
    this.addNotification(recipientId, {
      type: 'chat_message',
      title: `Message from ${sender.displayName}`,
      body: data.body.substring(0, 60),
      bookingId: conv.bookingId,
    });

    let warningBanner: string | undefined = undefined;
    if (flagged) {
      warningBanner =
        'Safety Notice: For your student protection and escrow security guarantee, all communications and payments must stay inside CampusHelp.';
      this.logAudit(
        sender.displayName,
        'Off-Platform Leakage Flagged',
        'Message',
        msgId,
        `Reason: ${reason}`
      );
    }

    return { message: msg, warningBanner };
  }

  // --- Wallet & Earnings (Prompt 09) ---
  public getAgentEarnings(agentId: string) {
    // Total released from ledger
    const agentEntries = this.ledger.filter(
      (l) => l.account === 'agent_payable'
    );

    // Sum earnings for bookings tied to this agent
    const agentBookings = Array.from(this.bookings.values()).filter((b) => b.agentId === agentId);
    const bookingIds = new Set(agentBookings.map((b) => b.id));

    let availableBalanceMinor = 0;
    agentEntries.forEach((e) => {
      if (bookingIds.has(e.bookingId)) {
        if (e.type === 'credit') availableBalanceMinor += e.amountMinor;
        if (e.type === 'debit') availableBalanceMinor -= e.amountMinor;
      }
    });

    // Pending escrow balance
    const pendingBookings = agentBookings.filter((b) =>
      ['accepted', 'confirmed', 'in_progress', 'completed'].includes(b.status)
    );
    let pendingBalanceMinor = 0;
    pendingBookings.forEach((b) => {
      const p = Array.from(this.payments.values()).find((pay) => pay.bookingId === b.id && pay.status === 'held');
      if (p) pendingBalanceMinor += p.netAgentMinor;
    });

    return {
      availableBalanceMinor,
      pendingBalanceMinor,
      totalEarnedMinor: availableBalanceMinor,
      currency: 'USD',
    };
  }

  public requestPayout(agentId: string, amountMinor: number): { success: boolean; error?: string } {
    const earnings = this.getAgentEarnings(agentId);
    if (amountMinor > earnings.availableBalanceMinor) {
      return { success: false, error: 'Requested amount exceeds available balance.' };
    }
    if (amountMinor < 1000) {
      return { success: false, error: 'Minimum payout is $10.00.' };
    }

    const now = new Date().toISOString();
    this.ledger.push({
      id: `led-${Date.now()}-payout`,
      bookingId: 'payout-withdrawal',
      account: 'agent_payable',
      type: 'debit',
      amountMinor,
      currency: 'USD',
      timestamp: now,
      description: `Student Helper Payout Direct Deposit: $${(amountMinor / 100).toFixed(2)}`,
    });

    const agent = this.users.get(agentId);
    this.logAudit(agent?.displayName || 'Helper', 'Requested Payout', 'Payout', agentId, `$${(amountMinor / 100).toFixed(2)}`);

    return { success: true };
  }

  // --- Trust & Safety / Dispute (Prompt 13) ---
  public openDispute(data: {
    bookingId: string;
    openedByUserId: string;
    reason: string;
    evidenceText: string;
  }): { dispute?: Dispute; error?: string } {
    const booking = this.bookings.get(data.bookingId);
    if (!booking) return { error: 'Booking not found.' };

    const opener = this.users.get(data.openedByUserId);
    if (!opener) return { error: 'User not found.' };

    const disputeId = `disp-${Date.now()}`;
    const dispute: Dispute = {
      id: disputeId,
      bookingId: booking.id,
      openedByUserId: data.openedByUserId,
      openedByName: opener.displayName,
      reason: data.reason,
      evidenceText: data.evidenceText,
      status: 'opened',
      createdAt: new Date().toISOString(),
    };

    this.disputes.set(dispute.id, dispute);
    booking.status = 'disputed';

    // Notify admins and other party
    this.addNotification('usr-admin', {
      type: 'dispute_opened',
      title: `Dispute Opened on Booking #${booking.id}`,
      body: `Reason: ${data.reason}. Action required by Campus Trust team.`,
      bookingId: booking.id,
    });

    this.logAudit(opener.displayName, 'Opened Safety Dispute', 'Dispute', dispute.id, data.reason);

    return { dispute };
  }

  public resolveDispute(
    disputeId: string,
    resolution: 'client_refund_full' | 'client_refund_partial' | 'release_to_agent',
    resolvedByAdminId: string
  ): { success: boolean; error?: string } {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return { error: 'Dispute not found.' };

    const booking = this.bookings.get(dispute.bookingId);
    if (!booking) return { error: 'Booking not found.' };

    const payment = Array.from(this.payments.values()).find((p) => p.bookingId === booking.id);
    const now = new Date().toISOString();

    if (resolution === 'client_refund_full') {
      if (payment) payment.status = 'refunded';
      booking.status = 'cancelled';
      this.ledger.push({
        id: `led-${Date.now()}-disp-ref`,
        bookingId: booking.id,
        account: 'client_escrow',
        type: 'debit',
        amountMinor: payment?.amountMinor || 0,
        currency: 'USD',
        timestamp: now,
        description: 'Full refund to student client via dispute resolution',
      });
    } else if (resolution === 'release_to_agent') {
      if (payment) payment.status = 'released';
      booking.status = 'closed';
      this.ledger.push({
        id: `led-${Date.now()}-disp-rel`,
        bookingId: booking.id,
        account: 'agent_payable',
        type: 'credit',
        amountMinor: payment?.netAgentMinor || 0,
        currency: 'USD',
        timestamp: now,
        description: 'Dispute resolved: released to helper',
      });
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = resolvedByAdminId;
    dispute.resolvedAt = now;

    this.logAudit('Admin', `Resolved Dispute: ${resolution}`, 'Dispute', disputeId, '');

    return { success: true };
  }

  // --- Notifications & Audit ---
  public addNotification(userId: string, data: Omit<Notification, 'id' | 'userId' | 'createdAt'>) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    const list = this.notifications.get(userId) || [];
    list.unshift(notif);
    this.notifications.set(userId, list);
  }

  public logAudit(actor: string, action: string, entityType: string, entityId: string, details: string) {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      entityType,
      entityId,
      details,
    });
  }
}

// Global Singleton for the Express Applet
export const store = new CampusMarketplaceStore();
