import { 
    updateServices, 
    findServicesByUserId 
  } from '@/repositories/ServiceRepository';
  import { createUpdateRequest } from '@/repositories/UpdateRequestRepository';
  import { ServiceData } from '@/types/service/ServiceTypes';
  export async function updateServicesDirect(userId: string, serviceData: ServiceData) {
    try {
      const existingServices = await findServicesByUserId(userId);
      if (!existingServices) {
        throw new Error("Services not found for user");
      }
      const updatedServices = await updateServices(userId, {
        childcare: serviceData.childcare,
        mealPreparation: serviceData.mealPreparation,
        lightHousekeeping: serviceData.lightHousekeeping,
        tutoring: serviceData.tutoring,
        petMinding: serviceData.petMinding,
      });
      return updatedServices;
    } catch (error) {
      console.error("Failed to update services:", error);
      throw new Error("Failed to update services");
    }
  }
  export async function updateServicesWithApproval(userId: string, serviceData: ServiceData) {
    try {
      await createUpdateRequest({
        userId,
        requestType: "SERVICE_UPDATE",
        requestData: {
          childcare: serviceData.childcare,
          mealPreparation: serviceData.mealPreparation,
          lightHousekeeping: serviceData.lightHousekeeping,
          tutoring: serviceData.tutoring,
          petMinding: serviceData.petMinding,
        },
        status: "PENDING",
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to submit service update request:", error);
      throw new Error("Failed to submit service update request");
    }
  }
  export async function getUserServices(userId: string) {
    try {
      const services = await findServicesByUserId(userId);
      if (!services) {
        throw new Error("Services not found for user");
      }
      return services;
    } catch (error) {
      console.error("Failed to fetch services:", error);
      throw new Error("Failed to fetch services");
    }
  }