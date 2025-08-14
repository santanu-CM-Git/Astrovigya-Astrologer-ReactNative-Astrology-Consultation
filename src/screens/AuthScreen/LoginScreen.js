import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import axios from 'axios';
import CheckBox from '@react-native-community/checkbox';
import { API_URL } from '@env'
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { AuthContext } from '../../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
// import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/Loader';
import { CountryPicker } from "react-native-country-codes-picker";
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orImg } from '../../utils/Images';
import Toast from 'react-native-toast-message';
import { withTranslation, useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native'; 

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const LoginScreen = ({  }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [langvalue, setLangValue] = useState('en');
  const [phone, setPhone] = useState('');
  const [mobileError, setMobileError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toggleCheckBox, setToggleCheckBox] = useState(true)
  const [showfield, setShowfield] = useState('mobile');

  const { login, userToken } = useContext(AuthContext);

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFCMToken()
  }, [])

  useEffect(() => {
    // Load language from AsyncStorage when the component mounts
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('selectedLanguage');
        if (savedLang) {
          setLangValue(savedLang);
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error('Failed to load language from AsyncStorage', error);
      }
    };

    loadLanguage();
  }, []);

  const onChangeText = (text) => {
    const phoneRegex = /^\d{10}$/;
    setPhone(text)
    if (!phoneRegex.test(text)) {
      setMobileError(t('login.Pleaseentera10digitnumber'))
    } else {
      setMobileError('')
    }
  }
  const changeEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log("Email is Not Correct");
      setEmail(text)
      setEmailError(t('login.PleaseentercorrectEmailId'))
      return false;
    }
    else {
      setEmailError('')
      console.log("Email is Correct");
      setEmail(text)
    }
  }

  const changeToEmail = () => {
    if (showfield == 'mobile') {
      setShowfield('email')
    } else {
      setShowfield('mobile')
    }

  }

  const handleSubmitForMobile = () => {

    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setMobileError(t('login.PleaseenterMobileno'))
    } else if (!phoneRegex.test(phone)) {
      setMobileError(t('login.Pleaseentera10digitnumber'))
    } else {
      //navigation.navigate('Otp', { phone: phone, otp: '2345', token: 'sfsdfdsf', name: 'name' })
      setIsLoading(true)
      AsyncStorage.getItem('fcmToken', async(err, fcmToken) => {
        const savedLang = await AsyncStorage.getItem('selectedLanguage');
        console.log(fcmToken, 'firebase token')
        const option = {
          "mobile": phone,
          "firebase_token": fcmToken,
          //"deviceid": deviceId,
        }
        console.log(option)
        console.log(API_URL)
        axios.post(`${API_URL}/login-otp`, option, {
          headers: {
            'Accept': 'application/json',
            'Accept-Language':savedLang,
            //'Content-Type': 'multipart/form-data',
          },
        })
          .then(res => {
            console.log(res.data)
            if (res.data.response == true) {
              setIsLoading(false)
              Toast.show({
                type: 'success',
                text1: '',
                text2: t('login.OTPsenttoyourmobileno'),
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
              });
              //alert(res.data?.data)
              // login(res.data.token)
              navigation.navigate('Otp', { phone: phone, otp: res.data?.data })
            } else {
              console.log('not okk')
              setIsLoading(false)
              Alert.alert('Oops..', "Something went wrong", [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ]);
            }
          })
          .catch(e => {
            setIsLoading(false)
            console.log(`user login error ${e}`)
            console.log(e.response)
            Alert.alert('Oops..', e.response?.data?.message, [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          });
      });
    }

  }
  // const handleSubmitForEmail = () => {

  //   if (!email) {
  //     setEmailError('Please enter Email Id.')
  //   } else if (!password) {
  //     setPasswordError('Please enter a Password.')
  //   } else {
  //     //navigation.navigate('Otp', { phone: phone, otp: '2345', token: 'sfsdfdsf', name: 'name' })
  //     setIsLoading(true)
  //     AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
  //       console.log(fcmToken, 'firebase token')
  //       const option = {
  //         "email": email,
  //         "password": password,
  //         "firebase_token": fcmToken,
  //         //"deviceid": deviceId,
  //       }
  //       axios.post(`${API_URL}/astrologer-login`, option, {
  //         headers: {
  //           'Accept': 'application/json',
  //           //'Content-Type': 'multipart/form-data',
  //         },
  //       })
  //         .then(res => {
  //           console.log(res.data)
  //           console.log(res.data.data[0].blocked_by_admin, 'admin aproval')
  //           if (res.data.response == true) {
  //             setIsLoading(false)
  //             if (res.data.data[0].blocked_by_admin == 1) {
  //               login();
  //             } else {
  //               if (res.data.data[0].full_name && res.data.data[0].astrologer_details && res.data.data[0].astrologer_details.goverment_id) {
  //                 Alert.alert('Hello', "Please wait for admin approval", [
  //                   { text: 'OK', onPress: () => navigation.navigate('Onboarding') },
  //                 ]);
  //               } else {
  //                 if (res.data.data[0].full_name) {
  //                   if (res.data.data[0].astrologer_details) {
  //                     if (res.data.data[0].astrologer_details.goverment_id) {
  //                       login();
  //                     } else {
  //                       navigation.navigate('PersonalInformationThree', { token: res?.data?.token });
  //                     }
  //                   } else {
  //                     navigation.navigate('PersonalInformationTwo', { token: res?.data?.token });
  //                   }
  //                 } else {
  //                   navigation.navigate('PersonalInformation', {
  //                     token: res?.data?.token,
  //                     phoneno: res?.data?.data[0]?.mobile,
  //                     email: res?.data?.data[0]?.email
  //                   });
  //                 }
  //               }

  //             }

  //           } else {
  //             console.log('not okk')
  //             setIsLoading(false)
  //             Alert.alert('Oops..', "Something went wrong", [
  //               {
  //                 text: 'Cancel',
  //                 onPress: () => console.log('Cancel Pressed'),
  //                 style: 'cancel',
  //               },
  //               { text: 'OK', onPress: () => console.log('OK Pressed') },
  //             ]);
  //           }
  //         })
  //         .catch(e => {
  //           setIsLoading(false)
  //           console.log(`user login error ${e}`)
  //           console.log(e.response)
  //           Alert.alert('Oops..', e.response?.data?.message, [
  //             {
  //               text: 'Cancel',
  //               onPress: () => console.log('Cancel Pressed'),
  //               style: 'cancel',
  //             },
  //             { text: 'OK', onPress: () => console.log('OK Pressed') },
  //           ]);
  //         });
  //     });
  //   }
  // }

  const handleSubmitForEmail = () => {
    if (!email) {
      setEmailError(t('login.PleaseenterEmailId'));
    } else if (!password) {
      setPasswordError(t('login.PleaseenteraPassword'));
    } else {
      setIsLoading(true);
      AsyncStorage.getItem('fcmToken', async(err, fcmToken) => {
        const savedLang = await AsyncStorage.getItem('selectedLanguage');
        console.log(fcmToken, 'firebase token');
        const option = {
          email: email.toLowerCase(),
          password,
          firebase_token: fcmToken,
        };

        axios.post(`${API_URL}/astrologer-login`, option, {
          headers: {
            Accept: 'application/json',
            'Accept-Language':savedLang,
          },
        })
          .then(res => {
            console.log(res.data.data,'kkkkkkkkkkkkk');

            // Handle case where data might be an array
            const userData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
            const isBlocked = userData.status === "1";

            console.log('User Data:', userData);
            console.log('Is Blocked:', isBlocked);
            console.log('Full Name:', userData.full_name);
            console.log('Astrologer Details:', userData.astrologer_details);
            console.log('Government ID:', userData.astrologer_details?.goverment_id);

            if (res.data.response) {
              setIsLoading(false);

              if (isBlocked) {
                login(res?.data?.token);
              } else {
                if (userData.full_name && userData.astrologer_details && userData.astrologer_details.goverment_id) {
                  // Check if status is 0, if so redirect to Onboarding
                  if (userData.status === "0") {
                    Alert.alert('', t('login.Pleasewaitforadminapproval'), [
                      { text: 'OK', onPress: () => navigation.navigate('Onboarding') },
                    ]);
                  } else {
                    // User has all required information and is approved, log them in directly
                    login(res?.data?.token);
                  }
                } else if (userData.full_name) {
                  if (userData.astrologer_details) {
                    if (userData.astrologer_details.goverment_id) {
                      login(res?.data?.token);
                    } else {
                      navigation.navigate('PersonalInformationThree', { token: res?.data?.token });
                    }
                  } else {
                    navigation.navigate('PersonalInformationTwo', { token: res?.data?.token });
                  }
                } else {
                  navigation.navigate('PersonalInformation', {
                    token: res?.data?.token,
                    phoneno: userData.mobile || '',
                    email: userData.email || email,
                  });
                }
              }
            } else {
              console.log('Login failed');
              setIsLoading(false);
              Alert.alert('Oops..', 'Something went wrong', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ]);
            }
          })
          .catch(e => {
            setIsLoading(false);
            console.log(`User login error: ${e}`);
            Alert.alert('Oops..', e.response?.data?.message || 'Something went wrong', [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          });
      });
    }
  };


  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <KeyboardAwareScrollView>
        <View style={[styles.bannaerContainer, { height: showfield == 'email' ? responsiveHeight(38) : responsiveHeight(50) }]}>
          <Image
            source={require('../../assets/images/Rectangle6.png')}
            style={styles.bannerBg}
          />
          <View style={[styles.bannerContain, { top: showfield == 'email' ? responsiveHeight(7) : responsiveHeight(10) }]}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.icon}
              />
            </View>
            <Text style={styles.welcomeText}>{t('login.welcometext')}</Text>
            <LinearGradient
              colors={['#E3A15D', '#D18C44']} // Change these colors as needed
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.bannerboardView}
            >
              <Text style={styles.bannerboardText}>{t('login.welcomesesc')}</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.wrapper}>
          {showfield == 'mobile' ?
            <>
              <View style={{ marginBottom: responsiveHeight(0) }}>
                <Text style={styles.headerText}>{t('login.mobileno')}<Text style={{ color: 'red' }}> *</Text></Text>
              </View>
              {mobileError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{mobileError}</Text> : <></>}
              <View style={styles.textinputview}>
                <InputField
                  label={t('login.mobileplaceholder')}
                  keyboardType="numeric"
                  value={phone}
                  inputType={'others'}
                  onChangeText={(text) => onChangeText(text)}
                />
              </View>
            </>
            :
            <>
              <View style={{ marginBottom: responsiveHeight(0) }}>
                <Text style={styles.headerText}>{t('login.emailid')}<Text style={{ color: 'red' }}> *</Text></Text>
              </View>
              {emailError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{emailError}</Text> : <></>}
              <View style={styles.textinputview}>
                <InputField
                  label={t('login.emailplaceholder')}
                  keyboardType="email"
                  value={email}
                  inputType={'email'}
                  onChangeText={(text) => changeEmail(text)}
                />
              </View>
              <View style={{ marginBottom: responsiveHeight(0) }}>
                <Text style={styles.headerText}>{t('login.password')}<Text style={{ color: 'red' }}> *</Text></Text>
              </View>
              {passwordError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{passwordError}</Text> : <></>}
              <View style={styles.textinputview}>
                <InputField
                  label={t('login.passwordplaceholder')}
                  keyboardType=""
                  value={password}
                  inputType={'password'}
                  onChangeText={(text) => setPassword(text)}
                />
              </View>
            </>
          }
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonwrapper}>
        <CustomButton
          label={showfield == 'mobile' ? t('login.sentotp') : t('login.exploreastrologer')}
          onPress={() => showfield == 'mobile' ? handleSubmitForMobile() : handleSubmitForEmail()}
        // onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
        />
      </View>
      <View style={styles.termsView}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            disabled={false}
            value={toggleCheckBox}
            onValueChange={(newValue) => setToggleCheckBox(newValue)}
            tintColors={{ true: '#FB7401', false: '#444343' }}
          />
        </View>
        <Text style={styles.termsText}>{t('login.termstext1')} <Text style={styles.boldtermsText}> {t('login.termstext2')}</Text> {t('login.termstext3')} <Text style={styles.boldtermsText}>{t('login.termstext4')}</Text></Text>
      </View>
      <Image
        source={orImg}
        style={styles.orImg}
      />
      <View style={styles.buttonwrapper}>
        <CustomButton label={showfield == 'mobile' ? t('login.emaillogin') : t('login.mobilelogin')}
          onPress={() => changeToEmail()}
          buttonColor='gray'
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 15,
    marginTop: -responsiveHeight(5),
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: responsiveHeight(5),
  },
  textinputview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //marginBottom: responsiveHeight(1)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
  },
  countryInputView: {
    height: responsiveHeight(7),
    width: responsiveWidth(15),
    borderColor: '#808080',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannaerContainer: {
    width: responsiveWidth(100),
    backgroundColor: '#fff',
  },
  bannerBg: {
    flex: 1,
    //position: 'absolute',
    //right: 0,
    // bottom: 20,
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  headerText: {
    color: '#2D2D2D',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1)
  },
  termsView: {
    marginBottom: responsiveHeight(2),
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: responsiveWidth(90),
  },
  termsText: {
    color: '#746868',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.5),

  },
  boldtermsText: {
    color: '#1E2023',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: responsiveFontSize(1.5),
  },
  orImg: {
    height: responsiveHeight(10),
    width: responsiveWidth(80),
    resizeMode: 'contain',
    alignSelf: "center"
  },
  checkboxContainer: {
    ...Platform.select({
      ios: {
          transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }]  // Adjust scale values as needed
      },
      android: {
          transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
      }
  }),
    marginRight: responsiveWidth(2)
  },
  iconContainer: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  icon: {
    height: responsiveHeight(7),
    width: responsiveWidth(80),
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: responsiveFontSize(2),
    color: '#3C2200',
    textAlign: 'center',
    marginBottom: '1%', // 5% margin at the bottom,
    fontFamily: 'PlusJakartaSans-Regular'
  },
  bannerContain: {
    position: 'absolute',
    alignSelf: 'center'
  },
  bannerboardView: {
    width: responsiveWidth(50),
    height: responsiveHeight(5),
    alignSelf: 'center',
    marginVertical: responsiveHeight(2),
    borderRadius: 20,
    borderColor: '#E3A15D',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerboardText: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#FFFFFF',
  },
  emailInput: {
    fontSize: responsiveFontSize(1.4),
  },
});


export default withTranslation()(LoginScreen);
