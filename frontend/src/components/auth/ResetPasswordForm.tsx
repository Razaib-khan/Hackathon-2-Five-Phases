'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';

interface FormData {
  new_password: string;
  confirm_new_password: string;
}

interface FormErrors {
  new_password?: string;
  confirm_new_password?: string;
}

const ResetPasswordForm = () => {
  const [formData, setFormData] = useState<FormData>({
    new_password: '',
    confirm_new_password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL query parameter

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'new_password':
        if (!value) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 128) return 'Password must be less than 128 characters';
        break;
      case 'confirm_new_password':
        if (!value) return 'Please confirm your new password';
        if (value !== formData.new_password) return 'Passwords do not match';
        break;
      default:
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key as keyof FormData, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setGlobalError(null);
    setSuccessMessage(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setGlobalError('Missing reset token. Please use the link from your email.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        token: token,
        new_password: formData.new_password,
        confirm_new_password: formData.confirm_new_password
      });

      setSuccessMessage('Password reset successfully. You can now sign in with your new password.');
      setFormData({ new_password: '', confirm_new_password: '' });
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

      {!token ? (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Missing reset token. Please use the link from your email.
        </div>
      ) : null}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {globalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.new_password ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.new_password && (
            <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm_new_password"
            name="confirm_new_password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.confirm_new_password ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.confirm_new_password && (
            <p className="mt-1 text-sm text-red-600">{errors.confirm_new_password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;