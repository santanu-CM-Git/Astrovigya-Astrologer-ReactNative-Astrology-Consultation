import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';

import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';


import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import PrivacyPolicy from '../screens/NoAuthScreen/PrivacyPolicy';
import ChatScreen from '../screens/NoAuthScreen/ChatScreen';
import EarningScreen from '../screens/NoAuthScreen/EarningScreen';
import AvailabilityScreen from '../screens/NoAuthScreen/AvailabilityScreen';
import UploadSessionSummary from '../screens/NoAuthScreen/UploadSessionSummary';
import { availabilityIconFocusedImg, availabilityIconImg, clientIconFocusedImg, clientIconImg, earningIconFocusedImg, earningIconImg, homeIconFocusedImg, homeIconImg, myserviceIconFocusedImg, myserviceIconImg } from '../utils/Images';
import ServiceScreen from '../screens/NoAuthScreen/ServiceScreen';
import ClientManagement from '../screens/NoAuthScreen/ClientManagement';
import UploadBankDetails from '../screens/NoAuthScreen/UploadBankDetails';
import OrderSummary from '../screens/NoAuthScreen/OrderSummary';
import WithdrawScreen from '../screens/NoAuthScreen/WithdrawScreen';
import WithdrawSuccess from '../screens/NoAuthScreen/WithdrawSuccess';
import CustomerSupport from '../screens/NoAuthScreen/CustomerSupport';
import ReviewScreen from '../screens/NoAuthScreen/ReviewScreen';
import ChatHistory from '../screens/NoAuthScreen/ChatHistory';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { withTranslation, useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadBankDetails"
        component={UploadBankDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WithdrawScreen"
        component={WithdrawScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WithdrawSuccess"
        component={WithdrawSuccess}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerSupport"
        component={CustomerSupport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatHistory"
        component={ChatHistory}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const EarningStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EarningScreen"
        component={EarningScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummary}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const ServiceStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ServiceScreen"
        component={ServiceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const ClientStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClientManagement"
        component={ClientManagement}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};
const AvailabilityStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AvailabilityScreen"
        component={AvailabilityScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const TabNavigator = () => {
  const { t, i18n } = useTranslation();
  const cartProducts = useSelector(state => state.cart)
  console.log(cartProducts)
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#CACCCE',
        tabBarActiveTintColor: '#FB7401',
        tabBarStyle: {
          height: Platform.select({
            android: responsiveHeight(8) + insets.bottom, // Add bottom safe area
            ios: responsiveHeight(11) + insets.bottom, // Add bottom safe area
          }),
          paddingBottom: insets.bottom, // Add padding for safe area
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8) + Math.max(insets.bottom, 10), // Ensure minimum padding
              ios: responsiveHeight(11) + Math.max(insets.bottom, 10), // Ensure minimum padding
            }),
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 10), // Ensure minimum padding
            paddingTop: 5, // Add some top padding
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? homeIconFocusedImg : homeIconImg} style={{ width: responsiveWidth(6.5), height: responsiveHeight(3.5), marginTop: responsiveHeight(0.2),marginBottom: responsiveHeight(1) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>{t('tab.Home')}</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Earning"
        component={EarningStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8) + Math.max(insets.bottom, 10),
              ios: responsiveHeight(11) + Math.max(insets.bottom, 10),
            }),
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 5,
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? earningIconFocusedImg : earningIconImg} style={{ width: responsiveWidth(6.5), height: responsiveHeight(3.5),  marginTop: responsiveHeight(0.2),marginBottom: responsiveHeight(1) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>{t('tab.Earning')}</Text>
          ),
        })}
      />
      <Tab.Screen
        name="My Services"
        component={ServiceStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8) + Math.max(insets.bottom, 10),
              ios: responsiveHeight(11) + Math.max(insets.bottom, 10),
            }),
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 5,
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? myserviceIconFocusedImg : myserviceIconImg} style={{ width: responsiveWidth(6), height: responsiveHeight(3.5),  marginTop: responsiveHeight(0.2),marginBottom: responsiveHeight(1) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>{t('tab.MyServices')}</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Clients"
        component={ClientStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8) + Math.max(insets.bottom, 10),
              ios: responsiveHeight(11) + Math.max(insets.bottom, 10),
            }),
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 5,
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? clientIconFocusedImg : clientIconImg} style={{ width: responsiveWidth(7.5), height: responsiveHeight(3.5),  marginTop: responsiveHeight(0.2),marginBottom: responsiveHeight(1) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: 5 }}>{t('tab.Clients')}</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Availability"
        component={AvailabilityStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8) + Math.max(insets.bottom, 10),
              ios: responsiveHeight(11) + Math.max(insets.bottom, 10),
            }),
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 5,
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? availabilityIconFocusedImg : availabilityIconImg} style={{ width: responsiveWidth(6.5), height: responsiveHeight(3.5),  marginTop: responsiveHeight(0.2),marginBottom: responsiveHeight(1) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: 2 }}>{t('tab.Availability')}</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

// const getTabBarVisibility = route => {
//    console.log(route);
//   const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';
//   console.log(routeName);


//   if (routeName == 'Chat') {
//     return 'none';
//   } else {
//     return 'flex';
//   }

// };
const getTabBarVisibility = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  console.log(routeName)
  if (routeName == 'ChatScreen') {
    return 'none';
  } else if (routeName == 'UploadSessionSummary') {
    return 'none';
  } else if (routeName == 'CustomerSupport') {
    return 'none';
  } else if (routeName == 'ProfileScreen') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default withTranslation()(TabNavigator);
