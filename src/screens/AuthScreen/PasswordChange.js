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
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForgotPass from '../..//assets/images/misc/forgotPass.svg';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const PasswordChange = ({route }) => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+233');

    const { login, userToken } = useContext(AuthContext);

    const onChangePassword = (text) => {
        setPassword(text)
        if (text) {
            setPasswordError('')
        } else {
            setPasswordError('Please enter Password')
        }
    }
    const onChangeConfirmPassword = (text) => {
        setConfirmPassword(text)
        if (text) {
            setConfirmPasswordError('')
        } else {
            setConfirmPasswordError('Please enter Confirm Password')
        }
    }


    const handleSubmit = () => {
        if (!password) {
            setPasswordError('Please enter Password');
        } else if (!confirmPassword) {
            setConfirmPasswordError('Please enter Confirm Password');
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setIsLoading(true)
            const option = {
                "user_id": route?.params?.userId,
                "password": password,
            };
            axios.post(`${API_URL}/therapist/password-change`, option, {
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
                        navigation.navigate('Login')
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
                    <View style={{ marginBottom: responsiveHeight(1) }}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-SemiBold', fontSize: responsiveFontSize(2.5), marginBottom: responsiveHeight(1) }}>Create New Password</Text>
                        <Text style={{ color: '#746868', fontFamily: 'PlusJakartaSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Your new password must be different from previously used password</Text>
                    </View>
                    {passwordError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{passwordError}</Text> : <></>}
                    <View style={styles.textinputview}>
                        <InputField
                            label={'Password'}
                            keyboardType="default"
                            inputType={'others'}
                            value={password}
                            onChangeText={(text) => onChangePassword(text)}
                        //helperText={mobileError}
                        />
                    </View>
                    {confirmPasswordError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{confirmPasswordError}</Text> : <></>}
                    <View style={styles.textinputview}>
                        <InputField
                            label={'Confirm Password'}
                            keyboardType="default"
                            inputType={'others'}
                            value={confirmPassword}
                            onChangeText={(text) => onChangeConfirmPassword(text)}
                        //helperText={mobileError}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <View style={styles.buttonwrapper}>
                <CustomButton label={"Continue"}
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


export default PasswordChange;
