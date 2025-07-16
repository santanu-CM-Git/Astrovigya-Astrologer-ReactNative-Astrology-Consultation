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
    StatusBar
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
import ForgotPass from '../..//assets/images/misc/forgotPass.svg';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const ForgotPassword = ({  }) => {
    const navigation = useNavigation();
    const [inputText, setinputText] = useState('');
    const [inputTextError, setinputTextError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [show, setShow] = useState(false);

    const { login, userToken } = useContext(AuthContext);

    const isEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };
    const isPhoneNumber = (text) => {
        // This regex matches phone numbers with or without country code, with various separators
        const phoneRegex = /^(\+?\d{1,3}?[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
        return phoneRegex.test(text);
    };

    const onChangeinputText = (text) => {
        setinputText(text)
        if (text) {
            setinputTextError('')
        } else {
            setinputTextError('Please enter Mobile Number or Email Id')
        }

    }

    const handleSubmit = () => {
        
        // if (!inputText) {
        //     setinputTextError('Please enter Mobile Number or Email Id')
        // }
        // else {
        //     navigation.push('Otp')
        // }

        if (isEmail(inputText)) {
            let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
            if (reg.test(inputText) === false) {
                console.log("Email is Not Correct");
                setinputTextError('Please enter correct Email Id')
                return false;
            } else {
                //setinputTextError('The input is an Email ID');
                setIsLoading(true)
                forgetPassword(inputText)
            }
        } else if (isPhoneNumber(inputText)) {
            let phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(inputText)) {
                setinputTextError('Please enter a 10-digit number.')
                return false;
            } else {
                //setinputTextError('The input is a Phone Number');
                setIsLoading(true)
                forgetPassword(inputText)
            }
        } else {
            setinputTextError('Please enter Correct Mobile Number or Email Id')
        }

        // const phoneRegex = /^\d{10}$/;
        // if (!phone) {
        //   setMobileError('Please enter Mobile no')
        // } else if (!phoneRegex.test(phone)) {
        //   setMobileError('Please enter a 10-digit number.')
        // } else {
        //   setIsLoading(true)
        //   AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
        //     const option = {
        //       "code": countryCode,
        //       "phone": phone,
        //       "deviceid": deviceId,
        //       "email": email,
        //       "deviceToken": fcmToken
        //     }

        //     console.log(option)
        //     axios.post(`${API_URL}/api/driver/registration`, option)
        //       .then(res => {
        //         console.log(JSON.stringify(res.data))
        //         if (res.data.response.status.code === 200) {
        //           setIsLoading(false)
        //           navigation.push('Otp', { counterycode: countryCode, phoneno: phone, userid: res.data?.response.records.userData.id })
        //         } else {
        //           setIsLoading(false)
        //           Alert.alert('Oops..', "Something went wrong", [
        //             {
        //               text: 'Cancel',
        //               onPress: () => console.log('Cancel Pressed'),
        //               style: 'cancel',
        //             },
        //             { text: 'OK', onPress: () => console.log('OK Pressed') },
        //           ]);
        //         }
        //       })
        //       .catch(e => {
        //         setIsLoading(false)
        //         console.log(`user register error ${e}`)
        //         Alert.alert('Oops..', e.response.data?.response.records.message, [
        //           {
        //             text: 'Cancel',
        //             onPress: () => console.log('Cancel Pressed'),
        //             style: 'cancel',
        //           },
        //           { text: 'OK', onPress: () => console.log('OK Pressed') },
        //         ]);
        //       });
        //   });
        // }
    }

    const forgetPassword = (inputText) => {
        const option = {
            "input": inputText,
          }
        axios.post(`${API_URL}/therapist/forgot-password`, option, {
            headers: {
              'Accept': 'application/json',
              //'Content-Type': 'multipart/form-data',
            },
          })
            .then(res => {
              console.log(res.data)
              console.log(res.data.user?.id)
              if (res.data.response == true) {
                setIsLoading(false)
                Toast.show({
                  type: 'success',
                  text1: 'Hello',
                  text2: res.data.message,
                  position: 'top',
                  topOffset: Platform.OS == 'ios' ? 55 : 20
                });
                navigation.navigate('Otp',{phoneno:inputText,otp:res.data.otp,userId:res.data.user?.id})
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
              console.log(`user register error ${e}`)
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
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <KeyboardAwareScrollView>
                <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                </View>
                <View style={styles.wrapper}>
                    <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center', marginBottom: responsiveHeight(3) }}>
                        <ForgotPass
                            width={300}
                            height={200}
                        //style={{transform: [{rotate: '-15deg'}]}}
                        />
                    </View>

                    <View style={{ marginBottom: responsiveHeight(1) }}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-SemiBold', fontSize: responsiveFontSize(2.5), marginBottom: responsiveHeight(1) }}>Forgot Password</Text>
                        <Text style={{ color: '#746868', fontFamily: 'PlusJakartaSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Enter your email address so we can send you a link to your email address<Text style={{ color: '#444343', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.5) }}> Create Account</Text></Text>
                    </View>
                    <Text
                        style={styles.header}>
                        Email Id or Mobile Number
                    </Text>
                    {inputTextError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{inputTextError}</Text> : <></>}
                    <View style={styles.textinputview}>
                        <InputField
                            label={'Email Id or Mobile Number'}
                            keyboardType="default"
                            inputType={'others'}
                            value={inputText}
                            onChangeText={(text) => onChangeinputText(text)}
                        //helperText={mobileError}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <View style={styles.buttonwrapper}>
                <CustomButton label={"Submit"}
                    onPress={() => handleSubmit()}
                //onPress={() => { navigation.push('Otp') }}
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
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        //height: responsiveHeight(50),
        paddingTop: responsiveHeight(5),
        //position:'absolute',
        bottom: 0
    },
    header: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(2),
    },
    subheader: {
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(3),
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
        height: responsiveHeight(40),
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
    textWrap: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    bannerText: {
        fontSize: responsiveFontSize(2),
        color: '#FFFFFF',
        fontWeight: '300',
        fontFamily: 'PlusJakartaSans-Medium',
        position: 'relative',
        zIndex: 1,
        width: width * 0.8,
        marginBottom: 10,
        paddingLeft: 20,
    },

    bannerSubText: {
        fontSize: responsiveFontSize(3),
        color: '#FFFFFF',
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Medium',
        position: 'relative',
        zIndex: 1,
        width: width * 0.8,
        marginBottom: 30,
        paddingLeft: 20,
    },
});


export default ForgotPassword;
