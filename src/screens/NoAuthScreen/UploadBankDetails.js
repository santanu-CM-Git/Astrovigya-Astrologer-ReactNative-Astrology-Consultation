import React, { useContext, useState, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomHeader from '../../components/CustomHeader';
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { withTranslation, useTranslation } from 'react-i18next';

const UploadBankDetails = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')
    const [bankname, setBankName] = useState('');
    const [banknameError, setBankNameError] = useState('')
    const [accountno, setAccountNo] = useState('');
    const [accountnoError, setAccountNoError] = useState('')
    const [confirmaccountno, setConfirmaccountNo] = useState('');
    const [confirmaccountnoError, setConfirmaccountNoError] = useState('')
    const [ifsc, setIfsc] = useState('')
    const [ifscError, setIfscError] = useState('')
    const [upiId, setUpiId] = useState('')
    const [upiIdError, setupiIdError] = useState('')
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const changeFirstname = (text) => {
        setFirstname(text)
        setFirstNameError('')
    }
    const chnageBankName = (text) => {
        setBankName(text)
        setBankNameError('')
    }
    const changeAccountNo = (text) => {
        setAccountNo(text)
        setAccountNoError('')
    }
    const chnageConfirmAccountNo = (text) => {
        setConfirmaccountNo(text)
        setConfirmaccountNoError('')
    }
    const chnageIfscCode = (text) => {
        setIfsc(text)
        setIfscError('')
    }
    const changeUpiId = (text) => {
        setUpiId(text)
        setupiIdError('')
    }

    const fetchBankDetails = () => {
        setIsLoading(true);
        AsyncStorage.getItem('userToken', async(err, usertoken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            axios.get(`${API_URL}/astrologer/add-astrologer-bank-details`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    //console.log(res.data,'user details')  
                    let bankInfo = res.data.data;
                    console.log(bankInfo, 'bankInfo')
                    if (bankInfo) {
                        setFirstname(bankInfo.full_name)
                        setBankName(bankInfo.bank_name)
                        setAccountNo(bankInfo.account_number)
                        setConfirmaccountNo(bankInfo.account_number)
                        setIfsc(bankInfo.account_number)
                        setUpiId(bankInfo.upi_id)
                    } else {
                        setFirstname('')
                        setBankName('')
                        setAccountNo('')
                        setConfirmaccountNo('')
                        setIfsc('')
                        setUpiId('')
                    }
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`fetchBankDetails error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    useEffect(() => {
        fetchBankDetails()
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchBankDetails()
        }, [])
      )

    const submitForm = () => {
        if (!firstname) {
            setFirstNameError(t('UploadBankDetails.PleaseenterFullname'));
        } else if (!bankname) {
            setBankNameError(t('UploadBankDetails.PleaseenterBankname'));
        } else if (!accountno) {
            setAccountNoError(t('UploadBankDetails.PleaseenterAccountno'));
        } else if (!confirmaccountno) {
            setConfirmaccountNoError(t('UploadBankDetails.PleaserepeatyourAccountno'));
        } else if (accountno !== confirmaccountno) {
            setConfirmaccountNoError(t('UploadBankDetails.AccountnoandConfirmAccountnoshouldmatch'));
        } else if (!ifsc) {
            setIfscError(t('UploadBankDetails.PleaseenterIFSCcode'));
        } else if (!upiId) {
            setupiIdError(t('UploadBankDetails.PleaseenterUPIId'));
        } else {

            const option = {
                "full_name": firstname,
                "bank_name": bankname,
                "account_number": accountno,
                "ifsc_code": ifsc,
                "upi_id": upiId
            }
            console.log(option)
            setIsLoading(true)
            AsyncStorage.getItem('userToken', async(err, usertoken) => {
                const savedLang = await AsyncStorage.getItem('selectedLanguage');
                axios.post(`${API_URL}/astrologer/add-astrologer-bank-details`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${usertoken}`,
                        'Accept-Language': savedLang,
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        if (res.data.response == true) {
                            setIsLoading(false)
                            Toast.show({
                                type: 'success',
                                text1: '',
                                text2: res.data.message,
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
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
            <CustomHeader commingFrom={'Add Bank Account Details'} onPress={() => navigation.goBack()} title={t('UploadBankDetails.AddBankAccountDetails')} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.FullNameAsPerBank')}</Text>
                        </View>
                        {firstNameError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{firstNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.EnterFullName')}
                                keyboardType=" "
                                value={firstname}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeFirstname(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.BankName')}</Text>
                            <Text style={{ color: 'red' }}> *</Text>
                        </View>
                        {banknameError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{banknameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.EnterBankName')}
                                keyboardType=" "
                                value={bankname}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => chnageBankName(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.AccountNumber')}</Text>
                            <Text style={{ color: 'red' }}> *</Text>
                        </View>
                        {accountnoError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{accountnoError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.EnterBankAccountNumber')}
                                keyboardType=" "
                                value={accountno}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeAccountNo(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.ConfirmAccountNumber')}</Text>
                            <Text style={{ color: 'red' }}> *</Text>
                        </View>
                        {confirmaccountnoError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{confirmaccountnoError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.ConfirmBankAccountNumber')}
                                keyboardType=" "
                                value={confirmaccountno}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => chnageConfirmAccountNo(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.IFSCCode')}</Text>
                            <Text style={{ color: 'red' }}> *</Text>
                        </View>
                        {ifscError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{ifscError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.EnterIFSCCode')}
                                keyboardType=" "
                                value={ifsc}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => chnageIfscCode(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>{t('UploadBankDetails.UPIId')}</Text>
                            <Text style={{ color: 'red' }}> *</Text>
                        </View>
                        {upiIdError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{upiIdError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={t('UploadBankDetails.EnterUPIId')}
                                keyboardType=" "
                                value={upiId}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeUpiId(text)}
                            />
                        </View>
                    </View>

                </View>

            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={t('UploadBankDetails.SaveBankAccount')}
                    // onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default withTranslation()(UploadBankDetails);

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 15,
        //height: responsiveHeight(78)
    },
    header1: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(3),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    header: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    requiredheader: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5),
        color: '#E1293B',
        marginBottom: responsiveHeight(1),
        marginLeft: responsiveWidth(1)
    },
    subheader: {
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(1),
    },
    photoheader: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F'
    },
    imageView: {
        marginTop: responsiveHeight(2)
    },
    imageStyle: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10
    },
    plusIcon: {
        position: 'absolute',
        bottom: 10,
        left: 50
    },
    textinputview: {
        marginBottom: responsiveHeight(10),
        marginTop: responsiveHeight(5)
    },
    inputView: {
        paddingVertical: 1
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
    searchInput: {
        color: '#333',
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        //borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5
    },
    dropdownMenu: {
        backgroundColor: '#FFF'
    },
    dropdownMenuSubsection: {
        borderBottomWidth: 0,

    },
    mainWrapper: {
        flex: 1,
        marginTop: responsiveHeight(1)

    },
    dropdown: {
        height: responsiveHeight(7.2),
        borderColor: '#DDD',
        borderWidth: 0.7,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: responsiveHeight(4)
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#2F2F2F'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#2F2F2F'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2F2F2F'
    },
    dropdownHalf: {
        height: responsiveHeight(7.2),
        width: responsiveWidth(40),
        borderColor: '#DDD',
        borderWidth: 0.7,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: responsiveHeight(4)
    },
});
