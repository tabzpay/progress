/**
 * Browser Notifications Utility
 */

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
        return new Notification(title, {
            icon: "/favicon.ico", // Ensure path is correct
            ...options,
        });
    }
    return null;
};

/**
 * Convenience method to check and send
 */
export const notifyIfPossible = async (title: string, options?: NotificationOptions) => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
        return sendNotification(title, options);
    }
    return null;
};
