import {
    findUpdateRequestWithUser,
    updateRequestStatus,
    getAllUpdateRequests
  } from '@/repositories/UpdateRequestRepository';
  import { updateUserProfile } from '@/repositories/UserRepository';
  import { updateChild, createChild } from '@/repositories/ChildRepository';
  import { updateServices } from '@/repositories/ServiceRepository';
  import { EmailService } from './EmailService';
  
  const emailService = new EmailService();
  
  /**
   * Get all update requests (for admin)
   */
  export async function getUpdateRequests() {
    try {
      const requests = await getAllUpdateRequests();
      
      // Format the requests for better display
      const formattedRequests = requests.map((request: { id: string; userId: string; user: { firstName: string; lastName: string; email: string }; requestType: string; requestData: any; status: string; createdAt: Date }) => ({
        id: request.id,
        userId: request.userId,
        userName: `${request.user.firstName} ${request.user.lastName}`,
        userEmail: request.user.email,
        requestType: request.requestType,
        requestData: request.requestData,
        status: request.status,
        createdAt: request.createdAt,
      }));
      
      return formattedRequests;
    } catch (error) {
      console.error("Failed to fetch update requests:", error);
      throw new Error("Failed to fetch update requests");
    }
  }
  
  /**
   * Process an update request (approve or reject)
   */
  export async function processUpdateRequest(
    requestId: string,
    approved: boolean,
    adminComment?: string
  ) {
    try {
      // Get the update request with user details
      const updateRequest = await findUpdateRequestWithUser(requestId);
      if (!updateRequest) {
        throw new Error("Update request not found");
      }
  
      // Update the request status
      await updateRequestStatus(
        requestId,
        approved ? "APPROVED" : "REJECTED",
        adminComment
      );
  
      // If approved, apply the changes
      if (approved) {
        await applyRequestChanges(updateRequest);
      }
  
      // Send email notification to user
      try {
        await emailService.sendRequestProcessedEmail({
          to: updateRequest.user.email,
          name: `${updateRequest.user.firstName} ${updateRequest.user.lastName}`,
          requestType: updateRequest.requestType,
          approved,
        });
      } catch (emailError) {
        // Log but don't fail if email sending fails
        console.error("Email sending failed but request was processed:", emailError);
      }
  
      return { success: true };
    } catch (error) {
      console.error("Failed to process update request:", error);
      throw new Error("Failed to process update request");
    }
  }
  
  /**
   * Apply changes based on the request type
   */
  async function applyRequestChanges(updateRequest: any) {
    const { requestType, requestData, userId } = updateRequest;
    
    try {
      // Handle different request types
      switch (requestType) {
        case "PROFILE_UPDATE":
          await updateUserProfile(userId, {
            firstName: requestData.firstName,
            lastName: requestData.lastName,
            phone: requestData.phone,
            address: requestData.address,
            city: requestData.city,
            postalCode: requestData.postalCode,
            additionalInfo: requestData.additionalInfo,
          });
          break;
          
        case "SERVICE_UPDATE":
          await updateServices(userId, {
            childcare: requestData.childcare,
            mealPreparation: requestData.mealPreparation,
            lightHousekeeping: requestData.lightHousekeeping,
            tutoring: requestData.tutoring,
            petMinding: requestData.petMinding,
          });
          break;
          
        case "CHILD_UPDATE":
          await updateChild(
            requestData.childId || requestData.id,
            {
              firstName: requestData.firstName,
              lastName: requestData.lastName,
              age: requestData.age,
              specialNotes: requestData.specialNotes,
            }
          );
          break;
          
        case "CHILD_ADD":
          await createChild({
            firstName: requestData.firstName,
            lastName: requestData.lastName,
            age: requestData.age,
            specialNotes: requestData.specialNotes,
            user: { connect: { id: userId } },
          });
          break;
        
        default:
          console.warn(`Unknown request type: ${requestType}`);
      }
    } catch (error) {
      console.error(`Error applying changes for request ${updateRequest.id}:`, error);
      throw error;
    }
  }