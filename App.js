import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const setupInitialized = useRef(false);
  const unsubscribeRefs = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Memoize data parsing to avoid repeated JSON.parse calls
  const parseSessionData = useCallback((data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse session data:', e);
        return null;
      }
    }
    return data;
  }, []);

  // Optimize AsyncStorage calls with caching
  const getUserToken = useCallback(async () => {
    if (!getUserToken.cache) {
      getUserToken.cache = await AsyncStorage.getItem('userToken');
    }
    return getUserToken.cache;
  }, []);

  useEffect(() => {
    const setup = async () => {
      if (setupInitialized.current) return;
      setupInitialized.current = true;
      
      try {
        await Promise.all([
          requestNotificationPermission(),
          createNotificationChannel()
        ]);

        // Store unsubscribe functions for cleanup
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
          console.log('📲 Foreground Message:', remoteMessage.messageId);
          
          if (remoteMessage.data?.screen === 'Session') {
            const parsevalue = parseSessionData(remoteMessage?.data?.data);
            if (parsevalue) {
              DeviceEventEmitter.emit('SESSION_REQUEST_RECEIVED', parsevalue);
              
              if (appState !== 'active') {
                await showLocalNotification(remoteMessage);
              }
            }
          } else if (appState !== 'active') {
            await showLocalNotification(remoteMessage);
          }
        });

        const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('📩 Background Message:', remoteMessage.messageId);
          await showLocalNotification(remoteMessage);
        });

        const unsubscribeForegroundEvent = notifee.onForegroundEvent(async ({ type, detail }) => {
          const notificationData = detail.notification?.data;
          
          if (type === EventType.ACTION_PRESS) {
            const { id } = detail.pressAction;
            if (id === 'accept') {
              await handleJoin(notificationData);
            } else if (id === 'decline') {
              await handleReject(notificationData);
            }
          } else if (type === EventType.PRESS) {
            await handleNotificationPress(notificationData);
          }
        });

        const unsubscribeBackgroundEvent = notifee.onBackgroundEvent(async ({ type, detail }) => {
          const notificationData = detail.notification?.data;
          
          if (type === EventType.ACTION_PRESS) {
            const { id } = detail.pressAction;
            if (id === 'accept') {
              await handleJoin(notificationData, true);
            } else if (id === 'decline') {
              await handleReject(notificationData);
            }
          } else if (type === EventType.PRESS) {
            await handleNotificationPress(notificationData);
          }
        });

        const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('🔁 Notification opened from background:', remoteMessage.messageId);
          setTimeout(() => handleNotificationNavigation(remoteMessage), 1000);
        });

        // Store all unsubscribe functions
        unsubscribeRefs.current = [
          unsubscribeForeground,
          unsubscribeBackground,
          unsubscribeForegroundEvent,
          unsubscribeBackgroundEvent,
          unsubscribeNotificationOpened
        ];

        // Handle initial notification
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('🚀 Initial notification:', initialNotification.messageId);
          setTimeout(() => handleNotificationNavigation(initialNotification), 2000);
        }

      } catch (error) {
        console.error('Setup error:', error);
      }
    };

    setup();

    // Cleanup function
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  const handleNotificationNavigation = useCallback((remoteMessage) => {
    if (remoteMessage?.data?.screen !== 'Session') return;
    
    const data = parseSessionData(remoteMessage.data.data);
    if (!data) return;
    
    navigate('ChatScreen', {
      commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
      details2: data,
      details: {},
    });
  }, [parseSessionData]);

  const handleNotificationPress = useCallback(async (notificationData) => {
    if (notificationData?.screen !== 'Session') return;
    
    const data = parseSessionData(notificationData.data);
    if (!data) return;
    
    setTimeout(() => {
      navigate('ChatScreen', {
        commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
        details2: data,
        details: {},
      });
    }, 500);
  }, [parseSessionData]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      const [settings, token] = await Promise.all([
        notifee.requestPermission(),
        messaging().getToken()
      ]);

      if (settings.authorizationStatus >= 1) {
        console.log('✅ Notification permission granted');
      }

      console.log('📲 FCM Token received');
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Permission request error:', error);
    }
  }, []);

  const createNotificationChannel = useCallback(async () => {
    try {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 4,
        badge: true,
        lights: true,
        vibration: true,
      });
    } catch (error) {
      console.error('Channel creation error:', error);
    }
  }, []);

  const showLocalNotification = useCallback(async (remoteMessage) => {
    try {
      const { title, body } = remoteMessage.notification || {};
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
                launchActivity: 'default'
              } 
            },
            { 
              title: 'Decline', 
              pressAction: { 
                id: 'decline',
                launchActivity: 'default'
              } 
            },
          ] : [],
          importance: 4,
          autoCancel: false,
          ongoing: isCallRequest,
        },
        data: {
          ...remoteMessage.data,
          originalData: JSON.stringify(remoteMessage.data)
        },
      });
    } catch (error) {
      console.error('Show notification error:', error);
    }
  }, []);

  const handleJoin = useCallback(async (sessionDetails, fromBackground = false) => {
    try {
      let data = sessionDetails.data || sessionDetails;
      
      if (typeof data === 'string') {
        data = parseSessionData(data);
      }

      if (sessionDetails.originalData) {
        try {
          const originalData = JSON.parse(sessionDetails.originalData);
          data = parseSessionData(originalData.data);
        } catch (e) {
          console.error('Failed to parse original data:', e);
        }
      }

      if (!data?.id) return;

      const success = await acceptInvitation(data.id, data, fromBackground);
      
      if (success && fromBackground) {
        setTimeout(() => {
          navigate('ChatScreen', {
            commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
            details2: data,
            details: success.sessionData || {},
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Handle join error:', error);
    }
  }, [parseSessionData]);

  const handleReject = useCallback(async (sessionDetails) => {
    try {
      let data = sessionDetails.data || sessionDetails;
      
      if (typeof data === 'string') {
        data = parseSessionData(data);
      }

      if (sessionDetails.originalData) {
        try {
          const originalData = JSON.parse(sessionDetails.originalData);
          data = parseSessionData(originalData.data);
        } catch (e) {
          console.error('Failed to parse original data:', e);
        }
      }

      if (data?.id) {
        await cancelInvitation(data.id);
      }
    } catch (error) {
      console.error('Handle reject error:', error);
    }
  }, [parseSessionData]);

  const cancelInvitation = useCallback(async (sessionId) => {
    try {
      const userToken = await getUserToken();
      if (!userToken) {
        console.error('No user token found');
        return false;
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

      console.log('❌ Session cancelled');
      await notifee.cancelAllNotifications();
      return response.data.response === true;
    } catch (error) {
      console.error('Cancel session error:', error);
      return false;
    }
  }, [getUserToken]);

  const acceptInvitation = useCallback(async (sessionId, data, fromBackground = false) => {
    try {
      const userToken = await getUserToken();
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

      if (response.data.response === true) {
        await notifee.cancelAllNotifications();
        
        if (appState === 'active' && !fromBackground) {
          setTimeout(() => {
            navigate('ChatScreen', {
              commingFrom: data.chat === '1' ? 'from_chat' : 'from_call',
              details2: data,
              details: response.data.data,
            });
          }, 500);
        }
        
        return {
          success: true,
          sessionData: response.data.data
        };
      }
      
      return false;
    } catch (error) {
      console.error('Accept session error:', error);
      return false;
    }
  }, [appState, getUserToken]);

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