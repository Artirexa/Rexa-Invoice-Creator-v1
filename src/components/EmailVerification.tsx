import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/App';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationProps {
  onVerified?: () => void;
  onSkip?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified, onSkip }) => {
  const { user, sendEmailVerification, isEmailVerified } = useAuth();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setIsChecking(true);
      const verified = await isEmailVerified();
      setIsVerified(verified);
      
      if (verified && onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      const result = await sendEmailVerification();
      
      if (result.success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and click the verification link",
        });
      } else {
        setError(result.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = () => {
    checkVerificationStatus();
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onVerified} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to <strong>{user?.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Please check your email and click the verification link to continue.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isChecking}
              variant="outline"
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Verification Status
                </>
              )}
            </Button>
            
            <Button
              onClick={handleResendVerification}
              disabled={isSending}
              variant="outline"
              className="w-full"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>
          
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full text-sm"
            >
              Skip for now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
