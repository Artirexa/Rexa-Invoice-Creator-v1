import { supabase } from './supabase';
import { InvoiceData, CompanyInfo } from '@/contexts/InvoiceContext';

// Database service for handling all Supabase operations
export class DatabaseService {
  // Profile operations
  static async createProfile(userId: string, email: string, fullName: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          subscription_tier: 'free',
          invoices_created_this_month: 0,
          company_name: '',
          company_logo: '',
          address: '',
          phone: '',
          website: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  }

  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  static async updateProfile(userId: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  static async updateCompanyInfo(userId: string, companyInfo: Partial<CompanyInfo>) {
    return this.updateProfile(userId, {
      company_name: companyInfo.name,
      company_logo: companyInfo.logoUrl,
      address: companyInfo.address,
      phone: companyInfo.phone,
      website: companyInfo.website
    });
  }

  // Invoice operations
  static async saveInvoice(invoice: InvoiceData, userId: string) {
    const invoiceData = {
      id: invoice.id,
      user_id: userId,
      invoice_number: invoice.details.invoiceNumber,
      client_name: invoice.customer.name,
      client_email: invoice.customer.email,
      client_address: invoice.customer.address,
      issue_date: invoice.details.issueDate,
      due_date: invoice.details.dueDate || null,
      subtotal: invoice.subtotal,
      tax_amount: invoice.taxTotal,
      discount_amount: invoice.discountTotal,
      total_amount: invoice.total,
      notes: invoice.details.notes,
      payment_terms: invoice.details.paymentTerms,
      invoice_data: invoice, // Store complete invoice data as JSONB
      created_at: invoice.createdAt,
      updated_at: invoice.updatedAt
    };

    const { data, error } = await supabase
      .from('invoices')
      .upsert(invoiceData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving invoice:', error);
      throw new Error(`Failed to save invoice: ${error.message}`);
    }

    return data;
  }

  static async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    // Convert database format back to InvoiceData format
    return data.map(row => row.invoice_data as InvoiceData);
  }

  static async getInvoice(invoiceId: string, userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }

    return data.invoice_data as InvoiceData;
  }

  static async deleteInvoice(invoiceId: string, userId: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }

    return true;
  }

  static async getInvoiceCount(userId: string) {
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting invoice count:', error);
      throw new Error(`Failed to get invoice count: ${error.message}`);
    }

    return count || 0;
  }

  static async getMonthlyInvoiceCount(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) {
      console.error('Error getting monthly invoice count:', error);
      throw new Error(`Failed to get monthly invoice count: ${error.message}`);
    }

    return count || 0;
  }

  // Check if user can create more invoices (free tier limit)
  static async canCreateInvoice(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return true; // No profile means new user, allow creation

      if (profile.subscription_tier === 'premium') {
        return true; // Premium users have unlimited invoices
      }

      const monthlyCount = await this.getMonthlyInvoiceCount(userId);
      return monthlyCount < 10; // Free tier limit: 10 invoices per month
    } catch (error) {
      console.error('Error checking invoice limit:', error);
      return false; // Default to false on error for safety
    }
  }

  // Update monthly invoice count in profile
  static async incrementMonthlyInvoiceCount(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        invoices_created_this_month: supabase.sql`invoices_created_this_month + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error incrementing invoice count:', error);
      throw new Error(`Failed to increment invoice count: ${error.message}`);
    }
  }
}

// Database initialization and setup
export const initializeDatabase = async () => {
  try {
    // Check if tables exist, if not, they need to be created manually in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Ensure user has a profile
      const profile = await DatabaseService.getProfile(user.id);
      if (!profile) {
        await DatabaseService.createProfile(
          user.id, 
          user.email || '', 
          user.user_metadata?.full_name || 'User'
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error };
  }
};

// Export the database service
export default DatabaseService;
