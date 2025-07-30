// App.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import config from './config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = React.useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        axios.post(`${config.SERVER_URL}/register`, { token }).catch(console.log);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received In-App:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const triggerInAppNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "In-App Notification",
        body: "This is triggered from inside the app!",
      },
      trigger: null,
    });
  };

  const triggerPushNotification = async () => {
    await axios.post(`${config.SERVER_URL}/send`, {
      token: expoPushToken,
      title: "Push Notification",
      message: "This is from the backend server!",
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Expo Notification Demo</Text>
      <Button title="Trigger In-App Notification" onPress={triggerInAppNotification} />
      <Button title="Trigger Push Notification" onPress={triggerPushNotification} />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}
