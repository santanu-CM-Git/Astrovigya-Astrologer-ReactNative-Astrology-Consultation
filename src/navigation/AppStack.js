import React from 'react';
import { Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { homeImg, helpImg, SessionIcon, PolicyIcon, availabilityBlackImg, earningBlackImg, settingsIcon, bankImg, paymentBank, bankIcon, reportIcon, calenderIcon, availabilityIconImg, clientIconImg, accountSetupImg } from '../utils/Images';
import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomerSupport from '../screens/NoAuthScreen/CustomerSupport';

import TabNavigator from './TabNavigator';
import PrivacyPolicy from '../screens//NoAuthScreen/PrivacyPolicy';

import SessionHistory from '../screens/NoAuthScreen/ReportScreen';
import NoNotification from '../screens/NoAuthScreen/NoNotification';
import UploadSessionSummary from '../screens/NoAuthScreen/UploadSessionSummary';
import AvailabilityScreen from '../screens/NoAuthScreen/AvailabilityScreen';
import EarningScreen from '../screens/NoAuthScreen/EarningScreen';
import TestPage from '../screens/NoAuthScreen/TestPage';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import ReportScreen from '../screens/NoAuthScreen/ReportScreen';
import SettingsScreen from '../screens/NoAuthScreen/SettingsScreen';
import ReviewScreen from '../screens/NoAuthScreen/ReviewScreen';
import UploadBankDetails from '../screens/NoAuthScreen/UploadBankDetails';
import ServiceScreen from '../screens/NoAuthScreen/ServiceScreen';
import ClientManagement from '../screens/NoAuthScreen/ClientManagement';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import { withTranslation, useTranslation } from 'react-i18next';
import WithdrawScreen from '../screens/NoAuthScreen/WithdrawScreen';
import ChatHistory from '../screens/NoAuthScreen/ChatHistory';
const Drawer = createDrawerNavigator();

const AuthStack = () => {
  const { t, i18n } = useTranslation();
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#FEF3E5',
        drawerActiveTintColor: '#2D2D2D',
        drawerInactiveTintColor: '#949494',
        drawerLabelStyle: {
          marginLeft: 0,
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: responsiveFontSize(1.8),
        },
        drawerStyle: {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        //swipeEdgeWidth: 0, //for off the drawer swipe
      }}>
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={homeImg} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t('sidemenu.Availability')}
        component={AvailabilityScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={availabilityBlackImg} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t('sidemenu.Earning')}
        component={EarningScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={earningBlackImg} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name={t('sidemenu.MyServices')}
        component={ServiceScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={availabilityIconImg} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name={t('sidemenu.ClientManagement')}
        component={ClientManagement}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={clientIconImg} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t('sidemenu.Reports')}
        component={ReportScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={reportIcon} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Customer Support"
        component={CustomerSupport}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={helpImg} style={{ width: 25, height: 25, marginRight: 5 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Privacy Policy"
        component={PrivacyPolicy}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25, height: 25, marginRight: 5 }} color={color} />
          ),
        }}
      /> */}
      {/* <Drawer.Screen
        name="Review Screen"
        component={ReviewScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25, height: 25, marginRight: 5 }} color={color} />
          ),
        }}
      /> */}
      <Drawer.Screen
        name={t('sidemenu.BankAccount')}
        component={UploadBankDetails}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={bankIcon} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name={t('sidemenu.Settings')}
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={settingsIcon} style={{ width: 25, height: 25, marginRight: responsiveWidth(5) }} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name="WithdrawScreen"
        component={WithdrawScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      
      <Drawer.Screen
        name="ChatHistory"
        component={ChatHistory}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      {/* <Drawer.Screen
        name="  testtttt"
        component={TestPage}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default withTranslation()(AuthStack);
