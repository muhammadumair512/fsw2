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
  export async function getUpdateRequests() {
    try {
      const requests = await getAllUpdateRequests();
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
  export async function processUpdateRequest(
    requestId: string,
    approved: boolean,
    adminComment?: string
  ) {
    try {
      const updateRequest = await findUpdateRequestWithUser(requestId);
      if (!updateRequest) {
        throw new Error("Update request not found");
      }
      await updateRequestStatus(
        requestId,
        approved ? "APPROVED" : "REJECTED",
        adminComment
      );
      if (approved) {
        await applyRequestChanges(updateRequest);
      }
      try {
        await emailService.sendRequestProcessedEmail({
          to: updateRequest.user.email,
          name: `${updateRequest.user.firstName} ${updateRequest.user.lastName}`,
          requestType: updateRequest.requestType,
          approved,
        });
      } catch (emailError) {
        console.error("Email sending failed but request was processed:", emailError);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to process update request:", error);
      throw new Error("Failed to process update request");
    }
  }
  async function applyRequestChanges(updateRequest: any) {
    const { requestType, requestData, userId } = updateRequest;
    try {
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