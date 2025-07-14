import React, { useContext, useState,useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { userPhoto } from '../utils/Images';
import LinearGradient from 'react-native-linear-gradient';
import { withTranslation, useTranslation } from 'react-i18next';

const CustomDrawer = (props) => {
  const { t, i18n } = useTranslation();
  const { logout } = useContext(AuthContext);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [userInfo, setuserInfo] = useState([]);
  const navigation = useNavigation();


  useEffect(() => {
    fetchProfileDetails()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileDetails()
    }, [])
  )

  const fetchProfileDetails = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken'); // Get the token from AsyncStorage
      if (!userToken) {
        console.log('No user token found');
        return;
      }
      console.log(userToken, 'userToken');
      // Make the API call to fetch the profile details
      const response = await axios.post(
        `${API_URL}/astrologer/profile`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${userToken}`, // Correct token variable used
            "Content-Type": 'application/json',
          },
        }
      );
      const userInfo = response.data.data; // Extract user info from the response
      console.log(userInfo, 'userInfo from API from drawer');

      setuserInfo(userInfo); // Set the userInfo state
    } catch (e) {
      console.error(`Error fetching profile details: ${e}`);
      console.log(e.response?.data?.message);
    } finally {
      //setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContentContainer}
      >

        <LinearGradient
          colors={['#EFDFC9', '#FFFFFF']} // Example colors, replace with your desired gradient
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.profileContainer}
        >
          <View style={styles.profileDetailsContainer}>
            {userInfo?.profile_pic ? (
              <Image
                source={{ uri: userInfo?.profile_pic}}
                style={styles.profilePic}
              />
            ) : (
              <Image source={userPhoto} style={styles.profilePic} />
            )}
            <View style={styles.profileTextContainer}>
              {/* <Text style={styles.profileName}>{userInfo.name}</Text> */}
              <Text style={styles.profileName}>{userInfo.full_name}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileScreen')}
              >
                <Text style={styles.viewProfileText}>{t('CustomDrawer.ViewProfile')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.drawerItemListContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      {/* <View style={styles.footerContainer}>
        <TouchableOpacity onPress={logout} style={styles.signOutButton}>
          <View style={styles.signOutContainer}>
            <Ionicons name="exit-outline" size={22} color="#000" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View> */}
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* <TouchableOpacity onPress={() => { logout() }} style={{ paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="exit-outline" size={22} color={'#000'} />
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans-Medium', marginLeft: 5, color: '#2D2D2D' }}>Sign Out</Text>
          </View>
        </TouchableOpacity> */}
        <View style={{ paddingVertical: 0 }}>
          <Text style={{ fontSize: responsiveFontSize(1.8), fontFamily: 'Outfit-Medium', color: '#949494' }}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContentContainer: {
    //backgroundColor: '#EFDFC9',
  },
  profileContainer: {
    height: responsiveHeight(21),
    paddingLeft: responsiveWidth(5),
    justifyContent: 'center',
    marginTop: -responsiveHeight(1)
  },
  profileDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    height: 60,
    width: 60,
    borderRadius: 40,
    marginBottom: 10,
    marginTop: 10,
    marginRight: 20,
  },
  profileTextContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  profileName: {
    color: '#3A3232',
    fontSize: responsiveFontSize(2.2),
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 5,
  },
  viewProfileText: {
    color: '#949494',
    fontFamily: 'PlusJakartaSans-Regular',
    marginRight: 5,
    fontSize: responsiveFontSize(1.7),
  },
  drawerItemListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutButton: {
    paddingVertical: 10,
  },
  signOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
    marginLeft: 5,
    color: '#2D2D2D',
  },
  versionContainer: {
    paddingVertical: 5,
  },
  versionText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#949494',
  },
});

export default withTranslation()(CustomDrawer);
