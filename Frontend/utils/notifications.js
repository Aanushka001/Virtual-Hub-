// utils/notifications.js
window.notificationUtils = {
  getUserNotifications: async (userId) => {
    try {
      if (!userId) {
        console.warn('No userId provided to getUserNotifications');
        return [];
      }
      
      const userDoc = await window.firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.notifications || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  addNotification: async (notification) => {
    try {
      if (!notification) {
        console.warn('No notification data provided');
        return null;
      }

      // Get current user safely
      const currentUser = window.auth.currentUser;
      if (!currentUser) {
        console.warn('No authenticated user for notification');
        return null;
      }

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNotification = {
        id: notificationId,
        ...notification,
        read: false,
        timestamp: new Date().toISOString()
      };

      // Check if user document exists first
      const userDoc = await window.firestore.collection('users').doc(currentUser.uid).get();
      if (!userDoc.exists) {
        console.warn('User document does not exist, cannot add notification');
        return null;
      }

      await window.firestore.collection('users').doc(currentUser.uid).update({
        notifications: firebase.firestore.FieldValue.arrayUnion(newNotification)
      });

      return notificationId;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      if (!notificationId) return;

      const currentUser = window.auth.currentUser;
      if (!currentUser) return;

      const userDoc = await window.firestore.collection('users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const notifications = userData.notifications || [];
                
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );

        await window.firestore.collection('users').doc(currentUser.uid).update({
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const currentUser = window.auth.currentUser;
      if (!currentUser) return;

      const userDoc = await window.firestore.collection('users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const notifications = userData.notifications || [];
                
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));

        await window.firestore.collection('users').doc(currentUser.uid).update({
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  clearAllNotifications: async () => {
    try {
      const currentUser = window.auth.currentUser;
      if (!currentUser) return;

      await window.firestore.collection('users').doc(currentUser.uid).update({
        notifications: []
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Helper function to create different types of notifications
  createNotification: async (userId, title, message, type = 'info') => {
    try {
      if (!userId || !title || !message) {
        console.warn('Missing required notification parameters');
        return null;
      }

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNotification = {
        id: notificationId,
        type,
        title,
        message,
        read: false,
        timestamp: new Date().toISOString()
      };

      // Check if user document exists first
      const userDoc = await window.firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.warn(`User document ${userId} does not exist, cannot create notification`);
        return null;
      }

      await window.firestore.collection('users').doc(userId).update({
        notifications: firebase.firestore.FieldValue.arrayUnion(newNotification)
      });

      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId) => {
    try {
      if (!userId) return 0;

      const notifications = await window.notificationUtils.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Delete a specific notification
  deleteNotification: async (notificationId) => {
    try {
      if (!notificationId) return;

      const currentUser = window.auth.currentUser;
      if (!currentUser) return;

      const userDoc = await window.firestore.collection('users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const notifications = userData.notifications || [];
                
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);

        await window.firestore.collection('users').doc(currentUser.uid).update({
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }
};