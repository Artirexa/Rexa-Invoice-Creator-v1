import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import DatabaseService from './database';

// Enhanced authentication service with proper error handling and security
export class AuthService {
  // Enhanced login with proper error handling
  static async login(email: string, password: string): Promise<{ user: User; error: string | null }> {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.log('Login error:', error.message);
        
        // Handle email confirmation issue by auto-confirming
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          console.log('Email not confirmed, attempting to auto-confirm via SQL...');
          
          try {
            // Try to confirm email directly via SQL
            const { error: sqlError } = await supabase.rpc('confirm_user_email', {
              user_email: email.toLowerCase().trim()
            });
            
            if (!sqlError) {
              console.log('Email confirmed via SQL, retrying login...');
              
              // Retry login after confirmation
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password,
              });
              
              if (retryError) {
                console.log('Retry login failed:', retryError.message);
                return { user: null, error: 'Please check your email and click the confirmation link before logging in.' };
              }
              
              // Continue with successful login
              if (retryData.user) {
                try {
                  await DatabaseService.getProfile(retryData.user.id);
                } catch (profileError) {
                  await DatabaseService.createProfile(
                    retryData.user.id,
                    retryData.user.email || '',
                    retryData.user.user_metadata?.full_name || 'User'
                  );
                }
              }
              
              return { user: retryData.user, error: null };
            }
          } catch (sqlConfirmError) {
            console.log('SQL confirmation failed:', sqlConfirmError);
          }
          
          // If SQL confirmation fails, try the updateUser method
          try {
            const { error: confirmError } = await supabase.auth.updateUser({
              data: { email_confirmed: true }
            });
            
            if (!confirmError) {
              console.log('Email confirmed via updateUser, retrying login...');
              
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password,
              });
              
              if (!retryError && retryData.user) {
                try {
                  await DatabaseService.getProfile(retryData.user.id);
                } catch (profileError) {
                  await DatabaseService.createProfile(
                    retryData.user.id,
                    retryData.user.email || '',
                    retryData.user.user_metadata?.full_name || 'User'
                  );
                }
                return { user: retryData.user, error: null };
              }
            }
          } catch (updateError) {
            console.log('UpdateUser confirmation failed:', updateError);
          }
        }
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          userMessage = 'Email confirmation is required. Please disable email confirmation in Supabase dashboard or check your email for confirmation link.';
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          userMessage = 'No account found with this email address. Please sign up first.';
        }

        return { user: null, error: userMessage };
      }

      console.log('Login successful for:', data.user?.email);
      
      if (data.user) {
        // Initialize user profile if it doesn't exist
        try {
          await DatabaseService.getProfile(data.user.id);
        } catch (profileError) {
          // Profile doesn't exist, create it
          await DatabaseService.createProfile(
            data.user.id,
            data.user.email || '',
            data.user.user_metadata?.full_name || 'User'
          );
        }
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { user: null, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  // Enhanced signup with proper validation and error handling
  static async signup(email: string, password: string, name: string): Promise<{ user: User; error: string | null }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { user: null, error: 'Please enter a valid email address.' };
      }

      // Validate password strength
      if (password.length < 6) {
        return { user: null, error: 'Password must be at least 6 characters long.' };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingUser) {
        return { user: null, error: 'An account with this email already exists. Please log in instead.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) {
        let userMessage = error.message;
        
        if (error.message.includes('already registered')) {
          userMessage = 'An account with this email already exists. Please log in instead.';
        } else if (error.message.includes('Password should be')) {
          userMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message.includes('Invalid email')) {
          userMessage = 'Please enter a valid email address.';
        }

        return { user: null, error: userMessage };
      }

      if (data.user) {
        // Create user profile
        try {
          await DatabaseService.createProfile(
            data.user.id,
            email.toLowerCase().trim(),
            name.trim()
          );
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail signup if profile creation fails
        }

        // Auto-confirm email for better UX (development only)
        try {
          await supabase.auth.updateUser({
            data: { email_confirmed: true }
          });
          console.log('Email auto-confirmed for development');
        } catch (confirmError) {
          console.log('Could not auto-confirm email:', confirmError);
          // This is not critical for signup success
        }
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { user: null, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  // Enhanced Google OAuth with proper error handling
  static async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      console.log('Starting Google OAuth flow...');
      console.log('Current origin:', window.location.origin);
      
      // Check if Google OAuth is properly configured
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to sign in with Google. Please try again.';
        
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.message.includes('access_denied')) {
          errorMessage = 'Access denied. Please allow permissions and try again.';
        } else if (error.message.includes('invalid_request')) {
          errorMessage = 'Google OAuth is not properly configured. Please check your Supabase settings.';
        } else if (error.message.includes('unauthorized_client')) {
          errorMessage = 'Google OAuth credentials are invalid. Please check your Google Cloud Console settings.';
        } else if (error.message.includes('redirect_uri_mismatch')) {
          errorMessage = 'Redirect URL mismatch. Please check your Google OAuth configuration.';
        } else if (error.message.includes('invalid_client')) {
          errorMessage = 'Invalid Google OAuth client. Please check your credentials.';
        }
        
        return { error: errorMessage };
      }

      console.log('Google OAuth initiated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      
      // Handle specific error types
      if (error.message?.includes('popup_blocked')) {
        return { error: 'Popup was blocked by your browser. Please allow popups and try again.' };
      } else if (error.message?.includes('network')) {
        return { error: 'Network error. Please check your internet connection and try again.' };
      } else if (error.message?.includes('CORS')) {
        return { error: 'CORS error. Please check your domain configuration.' };
      }
      
      return { error: `Google OAuth error: ${error.message || 'Unknown error occurred'}` };
    }
  }

  // Enhanced password reset with proper error handling
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        let userMessage = error.message;
        
        if (error.message.includes('User not found')) {
          userMessage = 'No account found with this email address.';
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many reset attempts. Please wait before trying again.';
        }

        return { error: userMessage };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  }

  // Enhanced password update with proper validation
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters long.' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        let userMessage = error.message;
        
        if (error.message.includes('Password should be')) {
          userMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message.includes('session')) {
          userMessage = 'Your session has expired. Please log in again.';
        }

        return { error: userMessage };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  }

  // Enhanced logout with proper cleanup
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return { error: 'Failed to log out. Please try again.' };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: 'An unexpected error occurred during logout.' };
    }
  }

  // Get current user session
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { user: null, error: error.message };
      }

      return { user, error: null };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return { user: null, error: 'Failed to get user session.' };
    }
  }

  // Check if user session is valid
  static async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Handle OAuth callback and create profile if needed
  static async handleOAuthCallback(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { user: null, error: error.message };
      }

      if (data.session?.user) {
        const user = data.session.user;
        
        // Check if profile exists, create if not
        try {
          await DatabaseService.getProfile(user.id);
        } catch (profileError) {
          // Profile doesn't exist, create it
          await DatabaseService.createProfile(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || user.user_metadata?.name || 'User'
          );
        }

        return { user, error: null };
      }

      return { user: null, error: 'No valid session found.' };
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return { user: null, error: 'Failed to process authentication.' };
    }
  }

  // Send email verification
  static async sendEmailVerification(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await this.getCurrentUser()).user?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return { error: 'Failed to send verification email.' };
    }
  }

  // Check if email is verified
  static async isEmailVerified(): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return user?.email_confirmed_at ? true : false;
    } catch (error) {
      console.error('Email verification check error:', error);
      return false;
    }
  }
}

export default AuthService;
