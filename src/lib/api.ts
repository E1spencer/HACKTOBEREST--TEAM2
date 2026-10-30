/**
 * CampusHelp API Client
 * Typed wrapper for REST backend with error handling and user context
 */

import {
  User,
  ServiceCategory,
  Booking,
  Review,
  Conversation,
  Message,
  Notification,
  AiMatchRequest,
  AiMatchResult,
} from '../types/marketplace.ts';

class CampusApiClient {
  private currentUserId: string = 'usr-client-1';
  private openRouterKey: string = '';
  private openRouterModel: string = 'google/gemma-2-9b-it';

  public setUserId(id: string) {
    this.currentUserId = id;
    localStorage.setItem('campushelp_user_id', id);
  }

  public getUserId(): string {
    const saved = localStorage.getItem('campushelp_user_id');
    if (saved) this.currentUserId = saved;
    return this.currentUserId;
  }

  public setOpenRouterConfig(key: string, model: string) {
    this.openRouterKey = key;
    this.openRouterModel = model;
    localStorage.setItem('campushelp_openrouter_key', key);
    localStorage.setItem('campushelp_openrouter_model', model);
  }

  public getOpenRouterConfig() {
    return {
      key: localStorage.getItem('campushelp_openrouter_key') || this.openRouterKey || '',
      model: localStorage.getItem('campushelp_openrouter_model') || this.openRouterModel || 'google/gemma-2-9b-it',
    };
  }

  private async fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    headers.set('x-user-id', this.getUserId());

    const { key, model } = this.getOpenRouterConfig();
    if (key) {
      headers.set('x-openrouter-key', key);
    }

    const res = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data as T;
  }

  // Users
  public async getUsers(): Promise<{ users: User[] }> {
    return this.fetchJson('/auth/users');
  }

  public async getMe(): Promise<{ user: User; agentProfile?: any }> {
    return this.fetchJson('/auth/me');
  }

  // Categories
  public async getCategories(): Promise<{ categories: ServiceCategory[] }> {
    return this.fetchJson('/categories');
  }

  // Agents
  public async searchAgents(params: {
    categorySlug?: string;
    q?: string;
    campusZone?: string;
    maxPrice?: number;
    minRating?: number;
    verifiedOnly?: boolean;
    sort?: string;
  }): Promise<{ total: number; agents: any[] }> {
    const searchParams = new URLSearchParams();
    if (params.categorySlug) searchParams.set('categorySlug', params.categorySlug);
    if (params.q) searchParams.set('q', params.q);
    if (params.campusZone) searchParams.set('campusZone', params.campusZone);
    if (params.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
    if (params.minRating) searchParams.set('minRating', String(params.minRating));
    if (params.verifiedOnly) searchParams.set('verifiedOnly', 'true');
    if (params.sort) searchParams.set('sort', params.sort);

    return this.fetchJson(`/agents/search?${searchParams.toString()}`);
  }

  public async getAgentProfile(id: string): Promise<any> {
    return this.fetchJson(`/agents/${id}`);
  }

  // Bookings
  public async getBookings(role?: 'client' | 'agent'): Promise<{ bookings: Booking[] }> {
    const q = role ? `?role=${role}` : '';
    return this.fetchJson(`/bookings${q}`);
  }

  public async getBooking(id: string): Promise<{ booking: Booking; payment?: any; conversationId: string }> {
    return this.fetchJson(`/bookings/${id}`);
  }

  public async createBooking(data: {
    agentId: string;
    agentServiceId: string;
    scheduledStart: string;
    durationHours: number;
    campusLocation: string;
    notes?: string;
  }): Promise<{ booking: Booking }> {
    return this.fetchJson('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async acceptBooking(id: string): Promise<{ booking: Booking }> {
    return this.fetchJson(`/bookings/${id}/accept`, { method: 'POST' });
  }

  public async declineBooking(id: string, reason?: string): Promise<{ booking: Booking }> {
    return this.fetchJson(`/bookings/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async payBookingEscrow(id: string): Promise<{ booking: Booking; message: string }> {
    return this.fetchJson(`/bookings/${id}/pay`, { method: 'POST' });
  }

  public async startBooking(id: string): Promise<{ booking: Booking }> {
    return this.fetchJson(`/bookings/${id}/start`, { method: 'POST' });
  }

  public async completeBooking(id: string): Promise<{ booking: Booking }> {
    return this.fetchJson(`/bookings/${id}/complete`, { method: 'POST' });
  }

  public async confirmCompletion(id: string): Promise<{ booking: Booking; message: string }> {
    return this.fetchJson(`/bookings/${id}/confirm-completion`, { method: 'POST' });
  }

  public async cancelBooking(id: string, reason: string): Promise<{ booking: Booking }> {
    return this.fetchJson(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async submitReview(bookingId: string, rating: number, comment: string, tags?: string[]): Promise<{ review: Review }> {
    return this.fetchJson(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, tags }),
    });
  }

  public async openDispute(bookingId: string, reason: string, evidenceText: string): Promise<any> {
    return this.fetchJson(`/bookings/${bookingId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason, evidenceText }),
    });
  }

  // Chat
  public async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    return this.fetchJson(`/conversations/${conversationId}/messages`);
  }

  public async sendMessage(conversationId: string, body: string): Promise<{ message: Message; warningBanner?: string }> {
    return this.fetchJson(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  // Earnings & Payouts
  public async getAgentEarnings(): Promise<any> {
    return this.fetchJson('/agents/me/earnings');
  }

  public async requestPayout(amountMinor: number): Promise<any> {
    return this.fetchJson('/agents/me/payouts', {
      method: 'POST',
      body: JSON.stringify({ amountMinor }),
    });
  }

  // Notifications
  public async getNotifications(): Promise<{ notifications: Notification[] }> {
    return this.fetchJson('/notifications');
  }

  public async markNotificationRead(id: string): Promise<any> {
    return this.fetchJson(`/notifications/${id}/read`, { method: 'POST' });
  }

  // AI Matching
  public async matchWithAi(query: string, options: Partial<AiMatchRequest> = {}): Promise<AiMatchResult> {
    const { key, model } = this.getOpenRouterConfig();
    return this.fetchJson('/ai/match', {
      method: 'POST',
      body: JSON.stringify({
        query,
        openRouterApiKey: key,
        model: options.model || model,
        ...options,
      }),
    });
  }

  // Admin
  public async getAdminOverview(): Promise<any> {
    return this.fetchJson('/admin/overview');
  }

  public async approveVerification(userId: string): Promise<any> {
    return this.fetchJson(`/admin/verifications/${userId}/approve`, { method: 'POST' });
  }

  public async resolveDispute(id: string, resolution: string): Promise<any> {
    return this.fetchJson(`/admin/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  public async resetDevSeed(): Promise<any> {
    return this.fetchJson('/dev/reset-seed', { method: 'POST' });
  }
}

export const api = new CampusApiClient();
