import { 
    createChild, 
    findChildByIdAndUserId,
    updateChild,
    getChildrenByUserId
  } from '@/repositories/ChildRepository';
  import { createUpdateRequest } from '@/repositories/UpdateRequestRepository';
  import { ChildData } from '@/types/child/ChildTypes';
  export async function addChildDirect(userId: string, childData: ChildData) {
    try {
      const child = await createChild({
        firstName: childData.firstName,
        lastName: childData.lastName,
        age: childData.age,
        specialNotes: childData.specialNotes,
        user: { connect: { id: userId } },
      });
      return child;
    } catch (error) {
      console.error("Failed to add child:", error);
      throw new Error("Failed to add child");
    }
  }
  export async function addChildWithApproval(userId: string, childData: ChildData) {
    try {
      await createUpdateRequest({
        userId,
        requestType: "CHILD_ADD",
        requestData: {
          firstName: childData.firstName,
          lastName: childData.lastName,
          age: childData.age,
          specialNotes: childData.specialNotes,
        },
        status: "PENDING",
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to submit child add request:", error);
      throw new Error("Failed to submit child add request");
    }
  }
  export async function updateChildDirect(userId: string, childData: ChildData) {
    try {
      const child = await findChildByIdAndUserId(childData.id, userId);
      if (!child) {
        throw new Error("Child not found or does not belong to user");
      }
      const updatedChild = await updateChild(childData.id, {
        firstName: childData.firstName,
        lastName: childData.lastName,
        age: childData.age,
        specialNotes: childData.specialNotes || "",
      });
      return updatedChild;
    } catch (error) {
      console.error("Failed to update child:", error);
      throw new Error("Failed to update child");
    }
  }
  export async function updateChildWithApproval(userId: string, childData: ChildData) {
    try {
      const child = await findChildByIdAndUserId(childData.id, userId);
      if (!child) {
        throw new Error("Child not found or does not belong to user");
      }
      await createUpdateRequest({
        userId,
        requestType: "CHILD_UPDATE",
        requestData: {
          id: childData.id,
          childId: childData.id,
          firstName: childData.firstName,
          lastName: childData.lastName,
          age: childData.age,
          specialNotes: childData.specialNotes,
        },
        status: "PENDING",
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to submit child update request:", error);
      throw new Error("Failed to submit child update request");
    }
  }
  export async function getUserChildren(userId: string) {
    try {
      return await getChildrenByUserId(userId);
    } catch (error) {
      console.error("Failed to fetch children:", error);
      throw new Error("Failed to fetch children");
    }
  }