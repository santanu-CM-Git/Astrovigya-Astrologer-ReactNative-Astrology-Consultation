import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Switch,
  AppState,
  BackHandler,
  Button,
  Platform,
  RefreshControl
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { userPhoto, GreenTick, dotIcon, YellowTck, RedCross, accountSetupImg, arrowColorImg, callColorImg, chatColorImg, dateIcon, timeIcon, bankImg, paymentBank } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from '@react-native-material/core';
import ChatRequestModal from '../../components/ChatRequestModal';
import notifee, { EventType } from '@notifee/react-native';
import { withTranslation, useTranslation } from 'react-i18next';

const HomeScreen = ({  }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const [appState, setAppState] = useState(AppState.currentState);
  //const { userInfo } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDateTime] = useState(null)
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setuserInfo] = useState([]);
  const [remediesDataUpcomming, setremediesDataUpcomming] = useState([])
  const [totalEarning, setTotalEarning] = useState(0)
  const [noOfRemedies, setNoOfRemedies] = useState(0)
  const [noOfSession, setNoOfSession] = useState(0)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [langvalue, setLangValue] = useState('en');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchProfileDetails(true),
      fetchUpcomingRemedies(true),
      fetchProgressData(true),
    ]).finally(() => setRefreshing(false));
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (savedLang) {
        console.log(savedLang, 'console language from home screen');

        setLangValue(savedLang);
        i18n.changeLanguage(savedLang);
      }
    } catch (error) {
      console.error('Failed to load language from AsyncStorage', error);
    }
  };

  const updateOnlineStatus = async (status) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found');
        return;
      }
      const option = { "online_offline": status }
      const response = await axios.post(`${API_URL}/astrologer/astrologers-offline-online`, option, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json'
        }
      });

      console.log('Status updated:', response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // useEffect(() => {
  //   // Set online status when app is opened or in the foreground
  //   updateOnlineStatus("1"); // App is open, set online_offline to 1

  //   const subscription = AppState.addEventListener('change', (nextAppState) => {
  //     if (appState.match(/inactive|background/) && nextAppState === 'active') {
  //       // App has come back to the foreground, set online status
  //       console.log('App is now in the foreground');
  //       updateOnlineStatus("1");
  //     } else if (nextAppState === 'background') {
  //       // App has gone to the background, set offline status
  //       console.log('App is now in the background');
  //       updateOnlineStatus("0");
  //     }

  //     setAppState(nextAppState);
  //   });

  //   return () => {
  //     // Cleanup the listener
  //     subscription.remove();
  //   };
  // }, [appState]);

  // useEffect(() => {
  //   const backAction = () => {
  //     Alert.alert(
  //       'Hold on!',
  //       'Do you want to stay active?',
  //       [
  //         {
  //           text: 'Cancel',
  //           onPress: () => null,
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'YES',
  //           onPress: () => {
  //             updateOnlineStatus("1");
  //             BackHandler.exitApp()
  //           }, // Allow app to close
  //         },
  //       ],
  //       { cancelable: true }
  //     );
  //     return true; // Prevent default back button behavior
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove(); // Cleanup on unmount
  // }, []);


  const handleJoin = () => {
    // Handle join logic
    setModalVisible(false);
  };

  const handleReject = () => {
    // Handle reject logic
    setModalVisible(false);
  };

  useEffect(() => {
    // Update currentDateTime every second
    const interval = setInterval(() => {
      setCurrentDateTime(moment().toDate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      //console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFCMToken()

    // if (Platform.OS == 'android') {
    //   /* this is app foreground notification */
    //   const unsubscribe = messaging().onMessage(async remoteMessage => {
    //     // if (remoteMessage?.data?.screen === 'Session') {
    //     //   Alert.alert('A new session request arrived!', JSON.stringify(remoteMessage));
    //     // }
    //     console.log('Received background message:', JSON.stringify(remoteMessage));
    //   });
    //   /* This is for handling background messages */
    //   messaging().setBackgroundMessageHandler(async remoteMessage => {
    //     console.log('Received background message:', remoteMessage);
    //     // Handle background message here
    //   });

    //   return unsubscribe;
    // }

  }, [])

  const toggleSwitch = async () => {
    const newStatus = !isEnabled; // Toggle the current status
    const call_consultancy = newStatus ? '1' : '0';

    // Optimistically update the switch UI
    setIsEnabled(newStatus);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        console.log('No user token found');
        return;
      }

      const option = { call_consultancy };
      console.log(userToken, 'usertoken');
      console.log(option);

      // API request 
      const response = await axios.post(`${API_URL}/astrologer/update-call-chat-availability`, option, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json',
          'Accept-Language': savedLang,
        }
      });

      //console.log(JSON.stringify(response.data));

      // Check the response success
      if (!response.data.response) {
        // If the response fails, revert the switch state
        setIsEnabled(!newStatus);
        console.log('Failed to update status');
      }
    } catch (error) {
      console.log(`Profile error: ${error}`);

      // Revert the switch state in case of error
      setIsEnabled(!newStatus);
    }
  };

  const toggleSwitch2 = async () => {
    // setIsEnabled2(!isEnabled2);
    const newStatus = !isEnabled2;

    // Optimistically update the switch UI
    setIsEnabled2(newStatus);

    const chat_consultancy = newStatus ? '1' : '0';

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        console.log('No user token found');
        return;
      }
      const option = { chat_consultancy };
      console.log(userToken, 'usertoken');
      console.log(option);
      const response = await axios.post(`${API_URL}/astrologer/update-call-chat-availability`, option, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json',
          'Accept-Language': savedLang,
        }
      });
      console.log(response.data);

      if (!response.data.response) {
        // If the response is not successful, revert the switch state
        setIsEnabled2(prevState => !prevState);
      }
    } catch (error) {
      console.log(`Profile error: ${error}`);
      // Revert the switch state in case of an error
      setIsEnabled2(prevState => !prevState);
    }
  };

  useEffect(() => {
    loadLanguage()
    fetchProfileDetails()
    fetchUpcomingRemedies()
    fetchProgressData()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadLanguage()
      fetchProfileDetails()
      fetchUpcomingRemedies()
      fetchProgressData()
    }, [])
  )

  const fetchProgressData = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    const currentDate = moment().format('YYYY-MM-DD');
    option = {
      sdate: currentDate,
      edate: currentDate,
    };
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      const response = await axios.post(`${API_URL}/astrologer/astrologer-reporting-counter`, option, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept-Language': savedLang,
        },
      });

      console.log(JSON.stringify(response.data), 'response from report api');

      if (response.data.response === true) {
        const res = response.data.data;
        const minutes = res.duration_minutes;
        const totalSeconds = Math.floor(minutes * 60);

        const hours = Math.floor(totalSeconds / 3600);
        const remainingSeconds = totalSeconds % 3600;
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;

        const formattedDuration = `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (!isRefresh) setIsLoading(false);
        setTotalEarning(res?.net_earning)
        setNoOfRemedies(res?.no_of_remedies)
        setNoOfSession(res?.no_of_session)
        setTotalSessionTime(formattedDuration)
      } else {
        console.log('not okk');
        if (!isRefresh) setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      if (!isRefresh) setIsLoading(false);
      console.error('Fetch error:', e);
      Alert.alert('Oops..', e.response?.data?.message, [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  }

  const fetchProfileDetails = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken'); // Get the token from AsyncStorage
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
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
            'Accept-Language': savedLang,
          },
        }
      );
      const userInfo = response.data.data; // Extract user info from the response
      console.log(userInfo, 'userInfo from API');
      if (userInfo.call_consultancy == 1) {
        setIsEnabled(true)
      } else {
        setIsEnabled(false)
      }
      if (userInfo.chat_consultancy == 1) {
        setIsEnabled2(true)
      } else {
        setIsEnabled2(false)
      }

      setuserInfo(userInfo); // Set the userInfo state
    } catch (e) {
      console.error(`Error fetching profile details: ${e}`);
      console.log(e.response?.data?.message);
    } finally {
      if (!isRefresh) setIsLoading(false); // Set loading state to false
    }
  };

  const fetchUpcomingRemedies = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        console.log('No user token found');
        if (!isRefresh) setIsLoading(false);
        return;
      }
      const response = await axios.post(`${API_URL}/astrologer/puja-booked-history-upcomming`, {}, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept-Language': savedLang,
        },
      });

      const responseData = response.data.data;

      console.log(responseData, 'fetchUpcomingRemedies')
      setremediesDataUpcomming(responseData)
      if (!isRefresh) setIsLoading(false);

    } catch (error) {
      console.log(`Fetch puja history error: ${error}`);
      let myerror = error.response?.data?.message;
      Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
        { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
      ]);
    } finally {
      if (!isRefresh) setIsLoading(false);
    }
  }

  const renderRemedies = ({ item, index }) => {

    return (
      <View style={styles.upcommingAppointmentView}>
        <View style={styles.profileView}>
          {item?.user?.profile_pic ?
            <Image
              source={{ uri: item?.user?.profile_pic }}
              style={styles.profilePic}
            /> :
            <Image
              source={userPhoto}
              style={styles.profilePic}
            />
          }
          <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(1), width: responsiveWidth(70) }}>
            <Text style={styles.nameText}>{item?.user?.full_name}</Text>
            <Text style={styles.namesubText}>{item?.puja?.name}</Text>
            <Text style={styles.namesubText}>Duration: <Text style={styles.hrsubtext}>{moment(item.puja_availability?.st, 'HH:mm:ss').format('hh:mm A')} - {moment(item.puja_availability?.et, 'HH:mm:ss').format('hh:mm A')}</Text></Text>
          </View>
          {/* <TouchableOpacity style={styles.joinNowButton} onPress={() => navigation.navigate('ChatScreen')}>
            <Text style={styles.joinButtonText}>Join Now</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.dateTimeView}>
          <View style={styles.dateView1}>
            <Image
              source={dateIcon}
              style={styles.datetimeIcon}
            />
            <Text style={styles.dateTimeText}>{moment(item?.puja_dates?.date).format('dddd, DD MMMM, YYYY')}</Text>
          </View>
          {/* <View style={styles.dividerLine} />
          <View style={styles.dateView2}>
            <Image
              source={timeIcon}
              style={styles.datetimeIcon}
            />
            <Text style={styles.dateTimeText}>09:00 PM</Text>
          </View> */}
        </View>
      </View>
    );
  };



  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        pressAction: {
          id: 'default', // Opens the app when notification is pressed
        },
        actions: [
          {
            title: 'Accept', // Text for the first button
            pressAction: {
              id: 'accept', // Unique ID for this action
            },
          },
          {
            title: 'Decline', // Text for the second button
            pressAction: {
              id: 'decline', // Unique ID for this action
            },
          },
        ],
      },
    });
  }

  useEffect(() => {
    // Register the foreground event listener
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'accept') {
        console.log('Accept button pressed');
        // Handle accept action
      } else if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'decline') {
        console.log('Decline button pressed');
        // Handle decline action
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FB7401']} // Android spinner color(s)
            tintColor="#FB7401" />
        }>
        <View style={[styles.wrapper, { marginBottom: responsiveHeight(9) }]}>
          <View style={styles.profileInformation}>
            {userInfo?.profile_pic ?
              <Image
                source={{ uri: userInfo?.profile_pic }}
                style={styles.profilePic}
              />
              :
              <Image
                source={userPhoto}
                style={styles.profilePic}
              />
            }
            <View style={styles.profileText}>
              <Text style={styles.userName}>
                {userInfo?.full_name}
              </Text>
              <Text style={styles.emailName}>
                {userInfo?.email}
              </Text>
            </View>
          </View>
          {userInfo?.astrologer_bank_details == null ?
            <TouchableOpacity onPress={() => navigation.navigate('UploadBankDetails')}>
              {/* <Image
              source={accountSetupImg}
              style={styles.accountSetupImg}
            /> */}
              <View style={styles.paymentView}>
                <Image
                  source={paymentBank}
                  style={{ height: 30, width: 30, resizeMode: 'contain', zIndex: 3, }}
                />
                <View style={styles.verticleLine}></View>
                <View style={styles.textView}>
                  <Text style={styles.paymentText}>{t('home.paymentinfo')}</Text>
                </View>
                <View style={styles.circleBackground3}></View>
              </View>
            </TouchableOpacity>
            : null}
          <Text style={styles.sectionHeader}>{t('home.todaysprogress')}</Text>
          <View style={styles.todaysProCard}>
            <View style={styles.cardSection}>
              <View style={styles.collumn}>
                <Text style={styles.containValue}>₹ {totalEarning?.toFixed(2)}</Text>
                <View style={styles.containHeaderView}>
                  <Text style={styles.containHeader}>{t('home.Earnings')}</Text>
                  <Image source={arrowColorImg} style={styles.iconImage} />
                </View>
              </View>
              <View style={styles.collumn}>
                <Text style={styles.containValue}>{noOfSession}</Text>
                <View style={styles.containHeaderView}>
                  <Text style={styles.containHeader}>{t('home.NoofSessions')}</Text>
                  <Image source={arrowColorImg} style={styles.iconImage} />
                </View>
              </View>
            </View>
            <View style={[styles.horizontalLine, { borderColor: '#FBEAD4' }]} />
            <View style={styles.cardSection}>
              <View style={styles.collumn}>
                <Text style={styles.containValue}>{totalSessionTime} Hrs</Text>
                <View style={styles.containHeaderView}>
                  <Text style={styles.containHeader}>{t('home.Sessions')}</Text>
                  <Image source={arrowColorImg} style={styles.iconImage} />
                </View>
              </View>
              <View style={styles.collumn}>
                <Text style={styles.containValue}>{noOfRemedies}</Text>
                <View style={styles.containHeaderView}>
                  <Text style={styles.containHeader}>{t('home.NoofRemedies')}</Text>
                  <Image source={arrowColorImg} style={styles.iconImage} />
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.sectionHeader}>{t('home.Availability')}</Text>
          <View style={styles.availabilityView}>
            <View style={styles.availabilitySection}>
              <View style={styles.availabilityIconText}>
                <Image source={callColorImg} style={styles.availabilityImage} />
                <Text style={styles.availabilityText}>{t('home.CallConsultancy')}</Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#1CAB04' }}
                thumbColor={isEnabled ? '#fff' : '#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                style={styles.switchStyle}
              />
            </View>
            <View style={[styles.horizontalLine, { borderColor: '#F2F2F2' }]} />
            <View style={styles.availabilitySection}>
              <View style={styles.availabilityIconText}>
                <Image source={chatColorImg} style={styles.availabilityImage} />
                <Text style={styles.availabilityText}>{t('home.ChatConsultancy')}</Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#1CAB04' }}
                thumbColor={isEnabled2 ? '#fff' : '#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch2}
                value={isEnabled2}
                style={styles.switchStyle}
              />
            </View>
          </View>
          {remediesDataUpcomming.length != '0' ?
            <View style={styles.sectionHeaderView}>
              <Text style={styles.sectionHeader}>{t('home.UpcomingAppointment')}</Text>
              <TouchableOpacity>
                <Text style={styles.seeallText}>See All</Text>
              </TouchableOpacity>
            </View> : null}
          <FlatList
            data={remediesDataUpcomming}
            renderItem={renderRemedies}
            //keyExtractor={(item) => item.id.toString()}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            getItemLayout={(remediesDataUpcomming, index) => (
              { length: 50, offset: 50 * index, index }
            )}
          />
        </View>
        {/* <View>
          <Button title="Display Notification" onPress={() => onDisplayNotification()} />
        </View> */}
      </ScrollView>
      {/* <LinearGradient
        colors={['#415BE8', '#415BE8']} // Example colors, replace with your desired gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.stickyFooter}
      >
        <View style={styles.circleBackground}></View>
        <View style={styles.circleBackground2}></View>
        <View style={styles.stickywrapper}>
          <View style={styles.stickySec1}>
            <Text style={styles.stickyHeaderText}>Kal Sarp Dasha Remedies</Text>
            <Text style={styles.stickyHeaderSubText}>Duration: 1 Hour</Text>
          </View>
          <TouchableOpacity style={styles.stickyButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.stickyButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient> */}
      <ChatRequestModal
        visible={modalVisible}
        onJoin={handleJoin}
        onReject={handleReject}
        onClose={() => setModalVisible(false)}
        name="Diptamoy Sanyal"
        consultationType="Paid"
        image={"https://via.placeholder.com/50"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
  },
  wrapper: {
    paddingHorizontal: 15, marginTop: 10
  },
  profileInformation: { flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(2) },
  profilePic: { height: 60, width: 60, borderRadius: 40, marginRight: 20 },
  profileText: { flexDirection: 'column', marginLeft: responsiveWidth(1) },
  userName: {
    color: '#3A3232',
    fontSize: responsiveFontSize(2),
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 5,
  },
  emailName: {
    color: '#949494',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.7),
    marginRight: 5,
  },
  sectionHeader: {
    marginVertical: responsiveHeight(2),
    color: '#2D2D2D',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  accountSetupImg: {
    height: responsiveHeight(10),
    width: responsiveWidth(92),
    resizeMode: 'contain',
    alignSelf: "center"
  },
  todaysProCard: {
    //height: responsiveHeight(22),
    width: responsiveWidth(92),
    backgroundColor: '#FEF3E5',
    borderRadius: 12,
    padding: 20
  },
  cardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(70),
  },
  collumn: {
    flexDirection: 'column',
    width: responsiveWidth(30),
  },
  containValue: {
    color: '#1E2023',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  containHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containHeader: {
    color: '#FB7401',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(1.7)
  },
  iconImage: {
    height: 12,
    width: 12,
    resizeMode: 'contain',
    marginLeft: 5
  },
  horizontalLine: {
    borderWidth: 1,
    marginVertical: responsiveHeight(2),
  },
  availabilityView: {

  },
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  availabilityIconText: {
    width: responsiveWidth(60),
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityImage: {
    height: 45,
    width: 45,
    resizeMode: 'contain',
    marginRight: responsiveWidth(5)
  },
  availabilityText: {
    color: '#1E2023',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(2)
  },
  switchStyle: {
    ...Platform.select({
      ios: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]  // Adjust scale values as needed
      },
      android: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
      }
    })
  },
  upcommingAppointmentView: {
    //height: responsiveHeight(22),
    width: responsiveWidth(90),
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: responsiveHeight(1),
    //borderWidth:1,
    //borderColor:'#000',
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
    margin: 5
  },
  profileView: {
    flexDirection: 'row',
    //alignItems: 'center',

  },
  nameText: {
    color: '#2D2D2D',
    fontSize: responsiveFontSize(2),
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 5,
  },
  namesubText: {
    color: '#1E2023',
    fontFamily: 'PlusJakartaSans-Medium',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5),
    marginBottom: 5,
  },
  hrsubtext: {
    color: '#8B939D',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: responsiveFontSize(1.5)
  },
  joinNowButton: {
    height: responsiveHeight(4.5),
    marginLeft: responsiveWidth(2),
    backgroundColor: '#FB7401',
    borderColor: '#FB7401',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  joinButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFF',
    fontSize: responsiveFontSize(1.7)
  },
  dateTimeView: {
    height: responsiveHeight(5),
    width: responsiveWidth(85),
    marginTop: responsiveHeight(2),
    backgroundColor: '#FEF3E5',
    borderColor: '#FEF3E5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateView1: {
    flexDirection: 'row',
    alignItems: 'center',
    //width: responsiveWidth(40)
  },
  dateView2: {
    flexDirection: 'row',
    alignItems: 'center',
    width: responsiveWidth(40)
  },
  datetimeIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginRight: responsiveWidth(2)
  },
  dateTimeText: {
    color: '#444343',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(1.5)
  },
  dividerLine: {
    height: '70%',
    width: 1,
    backgroundColor: '#FBEAD4',
    marginHorizontal: responsiveWidth(2)
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    height: responsiveHeight(7),
    width: responsiveWidth(100),
    overflow: 'hidden'
  },
  stickywrapper: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  stickySec1: {
    flexDirection: 'column'
  },
  stickyHeaderText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(2)
  },
  stickyHeaderSubText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: responsiveFontSize(1.7)
  },
  stickyButton: {
    height: responsiveHeight(4.5),
    marginLeft: responsiveWidth(2),
    backgroundColor: '#EDF1F3',
    borderColor: '#EDF1F3',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stickyButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#8B939D',
    fontSize: responsiveFontSize(1.7)
  },
  sectionHeaderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  seeallText: {
    color: '#746868',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.7)
  },
  circleBackground: {
    position: 'absolute',
    bottom: -30, // Adjust as needed
    left: 0,
    right: 0,
    height: 60, // Adjust as needed
    width: 60,
    borderRadius: 30,
    backgroundColor: '#344DD3',
    zIndex: 1,
  },
  circleBackground2: {
    position: 'absolute',
    top: -10, // Adjust as needed
    //left: 0,
    right: -20,
    height: 90, // Adjust as needed
    width: 90,
    borderRadius: 45,
    backgroundColor: '#344DD3',
    zIndex: 1,
  },
  verticleLine: {
    height: '80%',
    width: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    zIndex: 3,
  },
  paymentView: {
    backgroundColor: '#415BE8',
    width: responsiveWidth(92),
    //height: responsiveHeight(10),
    borderRadius: 12,
    marginTop: responsiveHeight(1),
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    overflow: 'hidden',
    zIndex: 3,
  },
  paymentText: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: responsiveFontSize(1.7)
  },
  textView: {
    width: responsiveWidth(80),
    zIndex: 3,
  },
  circleBackground3: {
    position: 'absolute',
    bottom: -20, // Adjust as needed
    left: -40,
    //right: -20,
    height: 200, // Adjust as needed
    width: 200,
    borderRadius: 100,
    backgroundColor: '#344DD3',
    zIndex: 1,
  }
});

export default withTranslation()(HomeScreen);