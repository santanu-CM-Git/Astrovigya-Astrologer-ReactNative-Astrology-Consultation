import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, Platform, AppState, DeviceEventEmitter } from 'react-native';
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
        
        // Handle session requests in foreground
        if (remoteMessage.data?.screen === 'Session') {
          const parsevalue = JSON.parse(remoteMessage?.data?.data);
          
          // Emit event to CustomHeader components
          DeviceEventEmitter.emit('SESSION_REQUEST_RECEIVED', parsevalue);
          
          // Only show local notification if app is NOT in active/foreground state
          if (appState !== 'active') {
            showLocalNotification(remoteMessage);
          } else {
            console.log('App is active, session request handled by CustomHeader');
          }
        } else {
          // For other notifications, show local notification if not active
          if (appState !== 'active') {
            showLocalNotification(remoteMessage);
          }
        }
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📩 Background Message:', JSON.stringify(remoteMessage));
        // Show local notification with action buttons when app is in background
        await showLocalNotification(remoteMessage);
      });

      // Handle foreground notification interactions (when app is open)
      notifee.onForegroundEvent(async ({ type, detail }) => {
        const notificationData = detail.notification?.data;
        console.log('🔥 Foreground Event:', type, notificationData);
        
        if (type === EventType.ACTION_PRESS) {
          if (detail.pressAction.id === 'accept') {
            console.log('Foreground: Accept pressed');
            await handleJoin(notificationData);
          } else if (detail.pressAction.id === 'decline') {
            console.log('Foreground: Decline pressed');
            await handleReject(notificationData);
          }
        }
        
        // Handle notification tap (opens app to specific screen)
        if (type === EventType.PRESS) {
          console.log('Notification pressed in foreground');
          await handleNotificationPress(notificationData);
        }
      });

      // Handle background notification interactions (when app is closed/minimized)
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        const notificationData = detail.notification?.data;
        console.log('🌙 Background Event:', type, notificationData);
        
        if (type === EventType.ACTION_PRESS) {
          if (detail.pressAction.id === 'accept') {
            console.log('Background: Accept pressed');
            await handleJoin(notificationData, true); // true indicates background
          } else if (detail.pressAction.id === 'decline') {
            console.log('Background: Decline pressed');
            await handleReject(notificationData);
          }
        }
        
        // Handle notification tap from background
        if (type === EventType.PRESS) {
          console.log('Notification pressed in background');
          await handleNotificationPress(notificationData);
        }
      });

      // Handle notification that opened the app from background
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔁 Notification opened from background:', remoteMessage);
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage);
        }, 1000); // Small delay to ensure navigation is ready
      });

      // Handle notification that opened the app from quit state
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('🚀 Notification opened from quit:', initialNotification);
        setTimeout(() => {
          handleNotificationNavigation(initialNotification);
        }, 2000); // Longer delay for app initialization
      }

      return () => {
        unsubscribeForeground();
      };
    };

    setup();
  }, [appState]);

  const handleNotificationNavigation = (remoteMessage) => {
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
      
      navigate('ChatScreen', {
        commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
        details2: data,
        details: {}, // You may want to fetch fresh session details here
      });
      console.log('Navigation to ChatScreen completed');
    }
  };

  const handleNotificationPress = async (notificationData) => {
    if (notificationData?.screen === 'Session') {
      let data = notificationData.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse session data:', e, data);
          return;
        }
      }
      
      // Navigate to the session screen
      setTimeout(() => {
        navigate('ChatScreen', {
          commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
          details2: data,
          details: {},
        });
      }, 500);
    }
  };

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
    const { title, body } = remoteMessage.notification || {};
    
    // Check if it's a session request
    const isCallRequest = remoteMessage.data?.screen === 'Session';

    await notifee.displayNotification({
      title: title || 'Session Request',
      body: body || 'You have a new session request',
      android: {
        channelId: 'default',
        pressAction: { id: 'default' },
        actions: isCallRequest ? [
          { 
            title: 'Accept', 
            pressAction: { 
              id: 'accept',
              launchActivity: 'default' // This ensures the app opens
            } 
          },
          { 
            title: 'Decline', 
            pressAction: { 
              id: 'decline',
              launchActivity: 'default' // This ensures the app opens
            } 
          },
        ] : [],
        importance: 4,
        autoCancel: false,
        ongoing: isCallRequest,
      },
      data: {
        ...remoteMessage.data,
        // Ensure data is properly formatted for later retrieval
        originalData: JSON.stringify(remoteMessage.data)
      },
    });
  };

  const handleJoin = async (sessionDetails, fromBackground = false) => {
    console.log('🔄 Handling join for session:', sessionDetails, 'from background:', fromBackground);
    
    let data = sessionDetails.data || sessionDetails;
    
    // Handle different data formats
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse session data:', e, data);
        return;
      }
    }

    // If we have original data, use that
    if (sessionDetails.originalData) {
      try {
        const originalData = JSON.parse(sessionDetails.originalData);
        const innerData = JSON.parse(originalData.data);
        data = innerData;
      } catch (e) {
        console.error('Failed to parse original data:', e);
      }
    }

    if (data?.id) {
      const success = await acceptInvitation(data.id, data, fromBackground);
      
      // If accept was successful and we're coming from background, navigate
      if (success && fromBackground) {
        setTimeout(() => {
          navigate('ChatScreen', {
            commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
            details2: data,
            details: success.sessionData || {},
          });
          console.log('Navigation to ChatScreen from background accept');
        }, 1000);
      }
    }
  };

  const handleReject = async (sessionDetails) => {
    console.log('❌ Handling reject for session:', sessionDetails);
    
    let data = sessionDetails.data || sessionDetails;
    
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse session data:', e, data);
        return;
      }
    }

    // Handle original data format
    if (sessionDetails.originalData) {
      try {
        const originalData = JSON.parse(sessionDetails.originalData);
        const innerData = JSON.parse(originalData.data);
        data = innerData;
      } catch (e) {
        console.error('Failed to parse original data:', e);
      }
    }

    if (data?.id) {
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
      
      // Dismiss all notifications after successful cancellation
      await notifee.cancelAllNotifications();
      
      return response.data.response === true;
    } catch (error) {
      console.error('Cancel session error:', error.response?.data || error.message || error);
      return false;
    }
  };

  const acceptInvitation = async (sessionId, data, fromBackground = false) => {
    try {
      console.log('Accepting session:', sessionId, 'with data:', data);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.error('No user token found');
        return false;
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
        // Dismiss notifications after successful acceptance
        await notifee.cancelAllNotifications();
        
        // If app is in foreground and not from background action, navigate immediately
        if (appState === 'active' && !fromBackground) {
          setTimeout(() => {
            navigate('ChatScreen', {
              commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
              details2: data,
              details: response.data.data,
            });
            console.log('Navigation to ChatScreen from foreground accept');
          }, 500);
        }
        
        return {
          success: true,
          sessionData: response.data.data
        };
      }
      
      return false;
    } catch (error) {
      console.error('Accept session error:', error.response?.data || error.message || error);
      return false;
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