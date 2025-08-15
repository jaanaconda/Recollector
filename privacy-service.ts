import { randomBytes } from "crypto";
import type { 
  MemoryShare, 
  InsertMemoryShare, 
  MemoryAccessLog, 
  InsertMemoryAccessLog 
} from "@shared/schema";

export class PrivacyService {
  /**
   * Generate a secure, unique passcode for memory sharing
   */
  static generateAccessPasscode(): string {
    // Generate a 12-character alphanumeric passcode
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = randomBytes(12);
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Validate passcode format
   */
  static isValidPasscode(passcode: string): boolean {
    return /^[A-Za-z0-9]{12}$/.test(passcode);
  }

  /**
   * Check if a memory share is still valid
   */
  static isShareValid(share: MemoryShare): boolean {
    if (!share.isActive) return false;
    
    // Check expiration
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return false;
    }
    
    // Check view limits
    if ((share.allowedViews ?? -1) > 0 && (share.currentViews ?? 0) >= (share.allowedViews ?? -1)) {
      return false;
    }
    
    return true;
  }

  /**
   * Create viewer information for access logging
   */
  static createViewerInfo(req: any): {
    ipAddress: string;
    userAgent: string;
  } {
    return {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };
  }

  /**
   * Sanitize memory data for sharing (remove sensitive info)
   */
  static sanitizeMemoryForSharing(memory: any): any {
    // Remove user ID and other sensitive fields when sharing
    const { userId, sharePasscode, isPrivate, allowPublicView, ...publicMemory } = memory;
    return publicMemory;
  }
}