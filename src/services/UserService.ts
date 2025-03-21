import { hash } from 'bcryptjs';

import AuthError, { AuthErrorType } from '@/lib/handlers/errors/types/AuthError';
import { 
  createUser, 
  findUserByEmail, 
  updateUserProfile,
  getUserProfile,
  getAllUsers,
  getUserDetailsById,
  toggleUserApproval,
  toggleUserActiveStatus
} from '@/repositories/UserRepository';
import { createChild } from '@/repositories/ChildRepository';
import { createServices } from '@/repositories/ServiceRepository';
import { createPayment } from '@/repositories/PaymentRepository';
import { EmailService } from './EmailService';
import { UserRegistrationData } from '@/types/auth/UserTypes';

const emailService = new EmailService();

/**
 * Register a new user
 */
export async function registerUser(data: UserRegistrationData) {
  // Check if email already exists
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AuthError(AuthErrorType.EMAIL_ALREADY_EXISTS, 400);
  }

  // Hash password
  const hashedPassword = await hash(data.password, 12);

  // Create admin user if it's the admin email
  const isAdmin = data.email === "aaabbb@gmail.com";
  const isApproved = isAdmin; // Auto approve admin
  const role = isAdmin ? "ADMIN" : "FAMILY";
// const Role=isAdmin?"admin":"user";
  try {
    // Create user transaction with profilePicture
    const user = await createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      additionalInfo: data.additionalInfo,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      profilePicture: data.profilePicture || null, // Store profile picture URL
      role: role, // This will be converted to enum
      isAdmin,
      isApproved,
    });

    // Create children records
    for (const child of data.children) {
      await createChild({
        firstName: child.firstName,
        lastName: child.lastName,
        age: child.age,
        specialNotes: child.specialNotes,
        user: { connect: { id: user.id } },
      });
    }

    // Create services record
    await createServices({
      childcare: data.services.childcare,
      mealPreparation: data.services.mealPreparation,
      lightHousekeeping: data.services.lightHousekeeping,
      tutoring: data.services.tutoring,
      petMinding: data.services.petMinding,
      user: { connect: { id: user.id } },
    });

    // Create payment record
    await createPayment({
      nameOnCard: data.payment.nameOnCard,
      cardNumber: data.payment.cardNumber,
      expiryDate: data.payment.expiryDate,
      cvv: data.payment.cvv,
      saveCard: data.payment.saveCard,
      agreedToTerms: data.payment.agreedToTerms,
      user: { connect: { id: user.id } },
    });

    // Send registration confirmation email
    if (!isAdmin) {
      await emailService.sendRegistrationEmail({
        to: data.email,
        name: `${data.firstName} ${data.lastName}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    throw new AuthError(AuthErrorType.SERVER_ERROR, 500);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: any) {
  try {
    await updateUserProfile(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      additionalInfo: data.additionalInfo,
      // Add profilePicture to the update if provided
      ...(data.profilePicture ? { profilePicture: data.profilePicture } : {}),
    });

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    throw new Error("Failed to update profile");
  }
}

/**
 * Get user profile for dashboard
 */
export async function getProfileData(userId: string) {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
    }
    return profile;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

/**
 * Get all users (admin function)
 */
export async function getUsers() {
  try {
    return await getAllUsers();
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get user details by ID (admin function)
 */
export async function getUserDetails(userId: string) {
  try {
    const user = await getUserDetailsById(userId);
    if (!user) {
      throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
    }
    return user;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    throw new Error("Failed to fetch user details");
  }
}

/**
 * Toggle user approval status (admin function)
 */
export async function toggleApproval(userId: string, isApproved: boolean) {
  try {
    const user = await getUserDetailsById(userId);
    if (!user) {
      throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
    }

    const updatedUser = await toggleUserApproval(userId, isApproved);

    // Send notification email based on approval status
    if (isApproved) {
      // Account approved - send approval email
      await emailService.sendApprovalEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
    } else {
      // Account unapproved - send unapproval email
      await emailService.sendAccountBlockedEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        reason: "not meeting service terms and conditions"
      });
    }

    return updatedUser;
  } catch (error) {
    console.error("Failed to toggle user approval:", error);
    throw new Error("Failed to toggle user approval status");
  }
}

/**
 * Toggle user active status (admin function)
 */
export async function toggleActiveStatus(userId: string, isActive: boolean) {
  try {
    const user = await getUserDetailsById(userId);
    if (!user) {
      throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
    }

    const updatedUser = await toggleUserActiveStatus(userId, isActive);

    // Send notification email based on active status
    if (!isActive) {
      // Account deactivated - send blocked email
      await emailService.sendAccountBlockedEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        reason: "not meeting service terms and conditions"
      });
    } else {
      // Account activated - send activation email
      await emailService.sendAccountActivatedEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
    }

    return updatedUser;
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    throw new Error("Failed to toggle user active status");
  }
}