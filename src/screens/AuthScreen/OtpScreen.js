import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { AuthContext } from '../../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Loader from '../../utils/Loader';
import Toast from 'react-native-toast-message';
import { withTranslation, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
// import OTPVerify from 'react-native-otp-verify';

const OtpScreen = ({ route }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [langvalue, setLangValue] = useState('en');

    const [otp, setOtp] = useState('');
    const [comingOTP, setComingOTP] = useState(route?.params?.otp)
    const [errors, setError] = useState(true)
    const [errorText, setErrorText] = useState('Please enter OTP')
    const [isLoading, setIsLoading] = useState(false)
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    const { login, userToken } = useContext(AuthContext);

    const inputRef = useRef();
    const [timer, setTimer] = useState(60 * 1);
    useEffect(() => {
        // If timer is 0, return early
        if (timer === 0) {
            setIsResendDisabled(false);
            return;
        }

        // Create an interval that decrements the timer value every second
        const interval = setInterval(() => {
            setTimer((timer) => timer - 1);
        }, 1000);

        // Clear the interval if the component is unmounted or timer reaches 0
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        // Format the time to ensure it always shows two digits for minutes and seconds
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

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

    // useEffect(() => {
    //     // Start listening for OTP messages
    //     OTPVerify.getOtp()
    //       .then(promise => {
    //         // Start listening for OTP
    //         OTPVerify.addListener(message => {
    //         const otp = /(\d{4})/g.exec(message)[1];
    //           console.log('OTP received:', otp);
    //           setOtp(otp);
    //         });

    //         // Stop listening when component unmounts
    //         return () => OTPVerify.removeListener();
    //       })
    //       .catch(error => console.error('Error setting up OTP listener:', error));
    //   }, []);

    const onChangeCode = (code) => {
        setOtp(code)
        setError(false)

    }

    // const handleSubmit = () => {
    //     //navigation.navigate('Otp', { phone: phone, otp: '2345', token: 'sfsdfdsf', name: 'name' })
    //     setIsLoading(true)
    //     AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
    //         console.log(fcmToken, 'firebase token')
    //         const option = {
    //             "mobile": route?.params?.phone,
    //             "firebase_token": fcmToken,
    //         }
    //         axios.post(`${API_URL}/astrologer-login`, option, {
    //             headers: {
    //                 'Accept': 'application/json',
    //                 //'Content-Type': 'multipart/form-data',
    //             },
    //         })
    //             .then(res => {
    //                 console.log(res.data)
    //                 console.log(res.data.data[0].blocked_by_admin, 'admin aproval')
    //                 if (res.data.response == true) {
    //                     setIsLoading(false)
    //                     if (res.data.data[0].blocked_by_admin == 1) {
    //                         login();
    //                     } else {
    //                         if (res.data.data[0].full_name && res.data.data[0].astrologer_details && res.data.data[0].astrologer_details.goverment_id) {
    //                             Alert.alert('Hello', "Please wait for admin approval", [
    //                                 { text: 'OK', onPress: () => navigation.navigate('Onboarding') },
    //                             ]);
    //                         } else {
    //                             if (res.data.data[0].full_name) {
    //                                 if (res.data.data[0].astrologer_details) {
    //                                     if (res.data.data[0].astrologer_details.goverment_id) {
    //                                         login();
    //                                     } else {
    //                                         navigation.navigate('PersonalInformationThree', { token: res?.data?.token });
    //                                     }
    //                                 } else {
    //                                     navigation.navigate('PersonalInformationTwo', { token: res?.data?.token });
    //                                 }
    //                             } else {
    //                                 navigation.navigate('PersonalInformation', {
    //                                     token: res?.data?.token,
    //                                     phoneno: res?.data?.data[0]?.mobile,
    //                                     email: res?.data?.data[0]?.email
    //                                 });
    //                             }
    //                         }

    //                     }
    //                 } else {
    //                     console.log('not okk')
    //                     setIsLoading(false)
    //                     Alert.alert('Oops..', "Something went wrong", [
    //                         {
    //                             text: 'Cancel',
    //                             onPress: () => console.log('Cancel Pressed'),
    //                             style: 'cancel',
    //                         },
    //                         { text: 'OK', onPress: () => console.log('OK Pressed') },
    //                     ]);
    //                 }
    //             })
    //             .catch(e => {
    //                 setIsLoading(false)
    //                 console.log(`user login error ${e}`)
    //                 console.log(e.response)
    //                 Alert.alert('Oops..', e.response?.data?.message, [
    //                     {
    //                         text: 'Cancel',
    //                         onPress: () => console.log('Cancel Pressed'),
    //                         style: 'cancel',
    //                     },
    //                     { text: 'OK', onPress: () => console.log('OK Pressed') },
    //                 ]);
    //             });
    //     });
    // }

    const handleSubmit = () => {
        setIsLoading(true);
        AsyncStorage.getItem('fcmToken', async (err, fcmToken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            if (err) {
                console.log('Error fetching FCM token:', err);
                setIsLoading(false);
                return;
            }

            console.log(fcmToken, 'firebase token');
            const option = {
                "mobile": route?.params?.phone,
                "firebase_token": fcmToken,
            };

            axios.post(`${API_URL}/astrologer-login`, option, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    console.log(res.data);
                    // Handle case where data might be an array
                    const userData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
                    const isBlocked = userData.status === "1";

                    console.log('User Data:', userData);
                    console.log('Is Blocked:', isBlocked);
                    console.log('Full Name:', userData.full_name);
                    console.log('Astrologer Details:', userData.astrologer_details);
                    console.log('Government ID:', userData.astrologer_details?.goverment_id);

                    if (res.data.response === true) {
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
                                    phoneno: route?.params?.phone,
                                    email: route?.params?.email,
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
                    console.log('User login error:', e);
                    Alert.alert('Oops..', e.response?.data?.message || 'Something went wrong', [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    };


    const goToNextPage = (code) => {
        // setIsLoading(true)
        if (code == comingOTP) {
            setIsLoading(false)
            handleSubmit()
        } else {
            console.log('not correct')
            setIsLoading(false)
            Alert.alert('', t('login.TheOTPdoesnotmatchPleaseenterthecorrectOTP'), [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
            setOtp('')
        }
        // navigation.navigate('PersonalInformation', { phoneno: 2454545435, usertoken: 'sdfwr32432423424' })
    }

    const resendOtp = () => {
        AsyncStorage.getItem('fcmToken', async (err, fcmToken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            setIsLoading(true)
            const option = {
                "mobile": route?.params?.phone,
                "firebase_token": fcmToken,
            }
            axios.post(`${API_URL}/login-otp`, option, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': savedLang,
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
                        alert(res.data?.data)
                        setComingOTP(res.data.otp)
                        setTimer(60 * 1)
                        setIsResendDisabled(true);
                        setOtp('')
                    } else {
                        console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', res.data.message, [
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
                    console.log(`resend otp error ${e}`)
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
        })
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginTop: responsiveHeight(5) }}>
                <MaterialIcons name="arrow-back-ios-new" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View> */}
            <View style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    {t('otp.header')}
                </Text>
                <Text
                    style={styles.subheader}>
                    {t('otp.subheader')}
                </Text>
                <Text
                    style={styles.subheadernum}>
                    {route?.params?.phone}
                </Text>
                {/* <Text
                    style={styles.subheader}>
                    or admin can share OTP over the call
                </Text> */}

                <View style={styles.textinputview}>
                    <OTPInputView
                        ref={inputRef}
                        style={styles.otpTextView}
                        pinCount={4}
                        code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                        onCodeChanged={code => { onChangeCode(code) }}
                        autoFocusOnLoad={false}
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        onCodeFilled={(code) => goToNextPage(code)}
                        keyboardType={'numeric'}
                        keyboardAppearance={'default'}
                    />
                </View>
                {errors &&
                    <Text style={styles.errorText}>{errorText}</Text>
                }
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.otpText}>{t('otp.didnotreceived')}</Text>
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                    <TouchableOpacity onPress={() => resendOtp()} disabled={isResendDisabled}>
                        <Text style={[styles.resendText, isResendDisabled && { color: '#808080' }]}>{t('otp.resendotp')}</Text>
                    </TouchableOpacity>

                </View>

            </View>
            {/* <View style={styles.buttonwrapper}>
                <CustomButton label={"Verify OTP "}
                    onPress={() => navigation.navigate('PersonalInformation')}
                />
            </View> */}
        </SafeAreaView>
    );
};

export default withTranslation()(OtpScreen);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        height: responsiveHeight(100)
    },
    wrapper: {
        paddingHorizontal: 25,
        height: responsiveHeight(80),
        marginTop: responsiveHeight(5)
    },
    header: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: responsiveFontSize(2.5),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(3),
    },
    subheader: {
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(0),
    },
    subheadernum: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#2F2F2F',
        marginBottom: responsiveHeight(0),
        lineHeight: 40
    },
    textinputview: {
        marginBottom: responsiveHeight(0),
    },
    buttonwrapper: {
        paddingHorizontal: 25,
        bottom: 15
    },
    otpTextView: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    underlineStyleBase: {
        width: responsiveWidth(15),
        height: responsiveHeight(8),
        borderRadius: 8,
        color: '#2F2F2F',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(2)
    },

    underlineStyleHighLighted: {
        borderColor: "#DAE0EA",
        borderRadius: 8,
        backgroundColor: '#F2F4F6'
    },
    errorText: {
        fontSize: responsiveFontSize(1.5),
        color: 'red',
        marginBottom: 20,
        marginTop: -25,
        alignSelf: 'center',
        fontFamily: 'PlusJakartaSans-Medium'
    },
    timerText: {
        color: '#808080',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    otpText: {
        color: '#808080',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    resendText: {
        color: '#2D2D2D',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    }
});



