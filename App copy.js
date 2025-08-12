import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, Platform, AppState } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import notifee, { EventType } from '@notifee/react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef, navigate } from './src/navigation/RootNavigation';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, []);

  useEffect(() => {
    // Track app state changes
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const setup = async () => {
      await requestNotificationPermission();
      await createNotificationChannel();

      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('📲 Foreground Message:', JSON.stringify(remoteMessage));
        
        // Only show local notification if app is NOT in active/foreground state
        if (appState !== 'active') {
          showLocalNotification(remoteMessage);
        } else {
          // Handle foreground message without showing notification
          console.log('App is active, not showing local notification');
          
          // If it's a session request, you might want to show an in-app modal instead
          if (remoteMessage.data?.screen === 'Session') {
            console.log('Session request received while app is active');
            // You can trigger an in-app modal/alert here instead of notification
          }
        }
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📩 Background Message:', JSON.stringify(remoteMessage));
        // Show local notification with action buttons when app is in background
        await showLocalNotification(remoteMessage);
      });

      notifee.onForegroundEvent(async ({ type, detail }) => {
        const notificationData = detail.notification?.data;
        if (type === EventType.ACTION_PRESS) {
          if (detail.pressAction.id === 'accept') {
            console.log('Foreground: Accept pressed');
            handleJoin(notificationData);
          } else if (detail.pressAction.id === 'decline') {
            console.log('Foreground: Decline pressed');
            handleReject(notificationData);
          }
        }
      });

      notifee.onBackgroundEvent(async ({ type, detail }) => {
        const notificationData = detail.notification?.data;
        if (type === EventType.ACTION_PRESS) {
          if (detail.pressAction.id === 'accept') {
            console.log('Background: Accept pressed');
            handleJoin(notificationData);
          } else if (detail.pressAction.id === 'decline') {
            console.log('Background: Decline pressed');
            handleReject(notificationData);
          }
        }
      });

      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔁 Notification opened from background:', remoteMessage);
        // Try to navigate if this is a session accept
        if (remoteMessage?.data?.screen === 'Session') {
          let data = remoteMessage.data.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              console.error('Failed to parse session data:', e, data);
              return;
            }
          }
          // You may want to fetch session details from server here if needed
          navigate('ChatScreen', {
            commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
            details2: data,
            details: {}, // You may want to fetch or pass details here
          });
          console.log('Navigation to ChatScreen from onNotificationOpenedApp');
        }
      });

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('🚀 Notification opened from quit:', initialNotification);
        if (initialNotification?.data?.screen === 'Session') {
          let data = initialNotification.data.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              console.error('Failed to parse session data:', e, data);
              return;
            }
          }
          navigate('ChatScreen', {
            commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
            details2: data,
            details: {}, // You may want to fetch or pass details here
          });
          console.log('Navigation to ChatScreen from getInitialNotification');
        }
      }

      return () => {
        unsubscribeForeground();
      };
    };

    setup();
  }, [appState]); // Add appState as dependency

  const requestNotificationPermission = async () => {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= 1) {
      console.log('✅ Notification permission granted');
    } else {
      console.log('❌ Notification permission denied');
    }

    const token = await messaging().getToken();
    console.log('📲 FCM Token:', token);
    await AsyncStorage.setItem('fcmToken', token);
  };

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 4, // IMPORTANCE_HIGH
      badge: true,
      lights: true,
      vibration: true,
    });
  };

  const showLocalNotification = async (remoteMessage) => {
    const { title, body, data } = remoteMessage.notification || remoteMessage;
    
    // Check if it's a session request using the correct data structure
    const isCallRequest = remoteMessage.data?.screen === 'Session';

    await notifee.displayNotification({
      title: title || 'Session Request',
      body: body || 'You have a new session request',
      android: {
        channelId: 'default',
        pressAction: { id: 'default' },
        actions: isCallRequest ? [
          { title: 'Accept', pressAction: { id: 'accept' } },
          { title: 'Decline', pressAction: { id: 'decline' } },
        ] : [],
        importance: 4, // IMPORTANCE_HIGH
        autoCancel: false, // Keep notification until user interacts
        ongoing: isCallRequest, // Make session requests persistent
      },
      data: remoteMessage.data,
    });
  };

  const handleJoin = async (sessionDetails) => {
    console.log('🔄 Handling join for session:', sessionDetails);
    if (sessionDetails) {
      let data = sessionDetails.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse session data:', e, data);
          return;
        }
      }
      await acceptInvitation(data.id, data);
    }
  };

  const handleReject = async (sessionDetails) => {
    if (sessionDetails) {
      let data = sessionDetails.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse session data:', e, data);
          return;
        }
      }
      await cancelInvitation(data.id);
    }
  };

  const cancelInvitation = async (sessionId) => {
    try {
      console.log('Cancelling session:', sessionId);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.error('No user token found');
        return;
      }

      const response = await axios.post(
        `${API_URL}/astrologer/astrologer-cancel-session`,
        { session_id: sessionId },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('❌ Session cancelled:', response.data);
      
      // Dismiss the notification after successful cancellation
      await notifee.cancelAllNotifications();
      
    } catch (error) {
      console.error('Cancel session error:', error.response?.data || error.message || error);
    }
  };

  const acceptInvitation = async (sessionId, data) => {
    try {
      console.log('Accepting session:', sessionId, 'with data:', data);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.error('No user token found');
        return;
      }

      const response = await axios.post(
        `${API_URL}/astrologer/astrologer-accept-session`,
        { session_id: sessionId },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Accept session response:', response.data);

      if (response.data.response === true) {
        const chat = data.chat;
        // Dismiss the notification after successful acceptance
        
        console.log('Navigating to ChatScreen with:', {
          commingFrom: chat === '1' ? 'from_chat' : 'from_call',
          details2: data,
          details: response.data.data,
        });
        setTimeout(() => {
          navigate('ChatScreen', {
            commingFrom: chat === '1' ? 'from_chat' : 'from_call',
            details2: data,
            details: response.data.data,
          });
          console.log('Navigation to ChatScreen called');
        }, 500);
        await notifee.cancelAllNotifications();
        // Show follow-up notification if app is not in foreground
        if (appState !== 'active') {
          await notifee.displayNotification({
            title: 'Session Accepted',
            body: 'Tap to join the chat session.',
            android: {
              channelId: 'default',
              pressAction: { id: 'default' },
            },
            data: {
              screen: 'Session',
              data: JSON.stringify(data),
            },
          });
        }
      }
    } catch (error) {
      console.error('Accept session error:', error.response?.data || error.message || error);
    }
  };

  return (
    <Provider store={store}>
      <StatusBar backgroundColor="#EFDFC9" />
      <OfflineNotice />
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNav />
        </NavigationContainer>
      </AuthProvider>
      <Toast />
    </Provider>
  );
}

export default App;