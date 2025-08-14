// Storage abstraction layer for offline-first functionality

export interface StorageProvider {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

export class LocalStorageProvider implements StorageProvider {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
  }
}

// TODO: Implement SupabaseProvider for future cloud sync
export class SupabaseProvider implements StorageProvider {
  async get<T>(key: string): Promise<T | null> {
    // TODO: Implement Supabase integration
    throw new Error("SupabaseProvider not implemented yet")
  }

  async set<T>(key: string, value: T): Promise<void> {
    // TODO: Implement Supabase integration
    throw new Error("SupabaseProvider not implemented yet")
  }

  async remove(key: string): Promise<void> {
    // TODO: Implement Supabase integration
    throw new Error("SupabaseProvider not implemented yet")
  }

  async clear(): Promise<void> {
    // TODO: Implement Supabase integration
    throw new Error("SupabaseProvider not implemented yet")
  }

  async keys(): Promise<string[]> {
    // TODO: Implement Supabase integration
    throw new Error("SupabaseProvider not implemented yet")
  }
}

// Default storage instance
export const storage = new LocalStorageProvider()
