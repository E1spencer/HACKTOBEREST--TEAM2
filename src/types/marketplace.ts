/**
 * CampusHelp Marketplace Types & Contracts
 * Enterprise-grade clean architecture domain models for student peer marketplace
 */

export type UserRole = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone: string;
  studentId: string;
  university: string;
  campusDorm: string;
  avatarUrl: string;
  isVerifiedStudent: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface AgentProfile {
  userId: string;
  user?: User;
  bio: string;
  major: string;
  yearOfStudy: string; // Freshman, Sophomore, Junior, Senior, Graduate
  gpa?: string;
  languages: string[];
  baseCampusZone: string; // e.g., "North Quad", "Science & Engineering Complex"
  serviceRadiusDorms: string[]; // List of campus dorms/halls serviced
  verificationStatus: VerificationStatus;
  studentCardDocUrl?: string;
  isAvailableForWork: boolean;
  profileCompleteness: number; // 0-100
  cachedRating: number;
  cachedReviewCount: number;
  cachedCompletionRate: number; // Percentage, e.g. 98
  cachedResponseRate: number; // Percentage, e.g. 100
  badges: string[];
  joinedAt: string;
  completedJobsCount: number;
}

export interface AgentAvailabilityRule {
  id: string;
  agentId: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  startTime: string; // "14:00"
  endTime: string; // "20:00"
}

export interface AgentTimeOff {
  id: string;
  agentId: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  description: string;
  keywords: string[];
  suggestedHourlyMin: number;
  suggestedHourlyMax: number;
  activeAgentsCount: number;
}

export type PricingType = 'hourly' | 'fixed';

export interface AgentService {
  id: string;
  agentId: string;
  categoryId: string;
  categorySlug: string;
  title: string;
  description: string;
  pricingType: PricingType;
  priceMinor: number; // e.g. 2000 = $20.00
  currency: string;
  minHours?: number;
  whatsIncluded: string[];
  isActive: boolean;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'confirmed' // payment held in escrow
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'declined'
  | 'cancelled'
  | 'expired'
  | 'disputed';

export interface PriceSnapshot {
  pricingType: PricingType;
  rateMinor: number;
  hours: number;
  subtotalMinor: number;
  platformFeeMinor: number; // 10%
  totalMinor: number; // subtotal + platformFee
  currency: string;
}

export interface BookingStatusChange {
  from: BookingStatus | null;
  to: BookingStatus;
  changedBy: string; // userId or 'system'
  changedAt: string;
  reason?: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientDorm: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  agentMajor: string;
  agentServiceId: string;
  serviceTitle: string;
  categorySlug: string;
  status: BookingStatus;
  scheduledStart: string; // ISO date-time
  scheduledEnd: string;
  durationHours: number;
  campusLocation: string; // e.g. "Library 3rd Floor Study Room B" or "Kendall Hall Rm 204"
  notes: string;
  priceSnapshot: PriceSnapshot;
  statusHistory: BookingStatusChange[];
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  isReviewed?: boolean;
}

export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed';

export interface Payment {
  id: string;
  bookingId: string;
  amountMinor: number;
  feeMinor: number;
  netAgentMinor: number;
  currency: string;
  status: PaymentStatus;
  provider: 'campus_escrow_sim';
  reference: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  bookingId: string;
  account: 'client_escrow' | 'agent_payable' | 'platform_revenue';
  type: 'debit' | 'credit';
  amountMinor: number;
  currency: string;
  timestamp: string;
  description: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  agentId: string;
  rating: number; // 1 - 5
  comment: string;
  tags: string[];
  agentReply?: string;
  isHidden: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  body: string;
  sentAt: string;
  isFlaggedForLeakage?: boolean;
  flagReason?: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  clientId: string;
  agentId: string;
  serviceTitle: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountClient: number;
  unreadCountAgent: number;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'booking_requested'
    | 'booking_accepted'
    | 'booking_declined'
    | 'payment_held'
    | 'booking_started'
    | 'booking_completed'
    | 'payment_released'
    | 'review_received'
    | 'verification_status'
    | 'chat_message'
    | 'dispute_opened';
  title: string;
  body: string;
  bookingId?: string;
  readAt?: string;
  createdAt: string;
}

export interface AiMatchRequest {
  query: string;
  campusZone?: string;
  dormLocation?: string;
  budgetMaxPerHourMinor?: number;
  openRouterApiKey?: string;
  model?: string;
}

export interface ExtractedIntent {
  isServiceRequest: boolean;
  categorySlug: string | null;
  alternativeCategorySlugs: string[];
  summary: string;
  schedule: {
    dateHint?: string;
    urgency?: 'urgent' | 'today' | 'this_week' | 'flexible';
    durationHours?: number;
  };
  location: {
    campusZoneHint?: string;
    dormHint?: string;
  };
  budget: {
    maxPerHourMinor?: number;
    currency: string;
  };
  preferences: {
    verifiedOnly?: boolean;
    minRating?: number;
  };
  clarifyingQuestion?: string | null;
  confidence: number;
}

export interface RankedAgent {
  agentId: string;
  displayName: string;
  photoUrl: string;
  major: string;
  yearOfStudy: string;
  baseCampusZone: string;
  rating: number;
  reviewCount: number;
  completionRate: number;
  responseRate: number;
  serviceTitle: string;
  pricePerHourMinor: number;
  serviceId: string;
  score: number;
  matchReasons: string[];
  badges: string[];
}

export interface AiMatchResult {
  sessionId: string;
  type: 'matches' | 'clarification' | 'refusal';
  interpretedRequest?: {
    categoryName: string;
    summary: string;
    schedule: string;
    location: string;
    budget: string;
  };
  clarifyingQuestion?: string;
  relaxationsApplied: string[];
  agents: RankedAgent[];
  modelUsed: string;
  executionMs: number;
  isDegradedFallback: boolean;
}

export interface Dispute {
  id: string;
  bookingId: string;
  openedByUserId: string;
  openedByName: string;
  reason: string;
  evidenceText: string;
  status: 'opened' | 'under_review' | 'resolved';
  resolution?: 'client_refund_full' | 'client_refund_partial' | 'release_to_agent';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}
