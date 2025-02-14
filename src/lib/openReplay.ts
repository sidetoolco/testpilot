import Tracker from '@openreplay/tracker';

let trackerInstance: Tracker | null = null;

export const getTracker = (userId: string) => {
  if (!trackerInstance) {
    trackerInstance = new Tracker({
      projectKey: 'hyctshQRzQlIQG8xsP8J', // Reemplaza con tu projectKey
    });
    trackerInstance.start();
    trackerInstance.setUserID(userId);
  }

  return trackerInstance;
};
