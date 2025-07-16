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
import { useNavigation } from '@react-navigation/native';

const OtpScreen = ({ route }) => {
    const navigation = useNavigation();
    const [otp, setOtp] = useState('');
    const [comingOTP, setComingOTP] = useState(route?.params?.otp)
    const [errors, setError] = useState(true)
    const [errorText, setErrorText] = useState('Please enter OTP')
    const [isLoading, setIsLoading] = useState(false)

    const { login, userToken } = useContext(AuthContext);

    const inputRef = useRef();
    const [timer, setTimer] = useState(60 * 1);
    useEffect(() => {
        // If timer is 0, return early
        if (timer === 0) return;

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

    const onChangeCode = (code) => {
        setOtp(code)
        setError(false)

    }

    const goToNextPage = (code) => {
        setIsLoading(true)
        // const option = {
        //     "phone": route?.params?.phoneno,
        //     "otp": code,
        //     "code": route?.params?.counterycode,
        //     "userId": route?.params?.userid,
        // }
        if (code == comingOTP) {
            setIsLoading(false)
            Toast.show({
                type: 'success',
                text1: 'Hello',
                text2: "The OTP has been successfully matched.",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
            });
            navigation.navigate('PasswordChange',{userId:route?.params?.userId})
        } else {
            console.log('not correct')
            setIsLoading(false)
            Alert.alert('Oops..', "The OTP does not match. Please enter the correct OTP.", [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
            setOtp('')
        }

    }

    const resendOtp = () => {
        setIsLoading(true)
        const option = {
            "input": route?.params?.phoneno,
        }
        axios.post(`${API_URL}/therapist/forgot-password`, option, {
            headers: {
                'Accept': 'application/json',
                //'Content-Type': 'multipart/form-data',
            },
        })
            .then(res => {
                console.log(res.data)
                if (res.data.response == true) {
                    setIsLoading(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Hello',
                        text2: res.data.message,
                        position: 'top',
                        topOffset: Platform.OS == 'ios' ? 55 : 20
                    });
                    setComingOTP(res.data.otp)
                    setTimer(60 * 1)
                    setOtp('')
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
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginTop: responsiveHeight(5) }}>
                <MaterialIcons name="arrow-back-ios-new" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    Verify Code
                </Text>
                <Text
                    style={styles.subheader}>
                    We have sent a verification code to your email or phone no. Please verify the code.
                </Text>
                <Text
                    style={styles.subheadernum}>
                    {route?.params?.phoneno}
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
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: 'red', marginBottom: 20, marginTop: -25, alignSelf: 'center', fontFamily: 'PlusJakartaSans-Medium' }}>{errorText}</Text>
                }
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#808080', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7) }}>Didn’t receive OTP?</Text>
                    <TouchableOpacity onPress={() => resendOtp()}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>Resend OTP</Text>
                    </TouchableOpacity>
                    <Text style={{ color: '#808080', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7) }}>{formatTime(timer)}</Text>
                </View>

            </View>
            {/* <View style={styles.buttonwrapper}>
                <CustomButton label={"Verify Now"}
                onPress={() => navigation.navigate('PasswordChange')} 
                />
            </View> */}
        </SafeAreaView>
    );
};

export default OtpScreen;

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
        fontSize: responsiveFontSize(3),
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
        borderColor: "#2F2F2F",
        borderRadius: 8
    },
});



