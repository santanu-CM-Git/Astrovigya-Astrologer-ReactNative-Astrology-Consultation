import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Dimensions, Image, Platform, Alert, FlatList, TextInput } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { ArrowDown, ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, bankImg, cardArrowImg, dateIcon, notifyImg, timeIcon, userPhoto, walletDebit } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import CustomButton from '../../components/CustomButton'
import moment from 'moment';
import axios from 'axios';
import Loader from '../../utils/Loader';
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { withTranslation, useTranslation } from 'react-i18next';


const WithdrawScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true)
    const [availableWithdrawAmount, setAvailableWithdrawAmount] = useState(0)
    const [bankDetails, setBankDetails] = useState([])
    const [accountNo, setAccountNo] = useState('')
    const [number, onChangeNumber] = React.useState(0);
    const [withdrawList, setWithdrawList] = useState([])

    useEffect(() => {
        availableBalance()
        fetchWithdrawRequest()
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            availableBalance()
            fetchWithdrawRequest()
        }, [])
    )

    const availableBalance = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken'); // Get the token from AsyncStorage
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            console.log(userToken, 'userToken');
            // Make the API call to fetch the profile details
            const response = await axios.get(
                `${API_URL}/astrologer/astrologer-withdraw-request`,
                {
                    headers: {
                        "Authorization": `Bearer ${userToken}`, // Correct token variable used
                        "Content-Type": 'application/json',
                        'Accept-Language': savedLang,
                    },
                }
            );
            const userInfo = response.data.data; // Extract user info from the response
            console.log(userInfo, 'availableBalance');

            setAvailableWithdrawAmount(userInfo.available_amount); // Set the userInfo state
            console.log(userInfo.bank_details);

            if (userInfo.bank_details) {
                setBankDetails(userInfo.bank_details)
                const data = userInfo?.bank_details?.account_number;
                console.log(data, 'mmmmm');

                const maskedData = data.slice(0, -4).replace(/\d/g, "X") + data.slice(-4);
                setAccountNo(maskedData)
            }
            setIsLoading(false)
        } catch (e) {
            console.error(`Error fetching availableBalance: ${e}`);
            console.log(e.response?.data?.message);
            setIsLoading(false)
        } finally {
            setIsLoading(false); // Set loading state to false
        }
    };

    const submitWithdrawRequest = () => {
        console.log(number)
        if (bankDetails.length == '0') {
            Alert.alert('', t('Withdraw.Youneedtoaddbankdetailsfirst'), [
                { text: 'OK', onPress: () => navigation.navigate('UploadBankDetails') },
            ]);
            return
        }
        if (number == '0') {
            Alert.alert('', t('Withdraw.Pleaseenteramountfirst'), [
                { text: 'OK', onPress: () => null },
            ]);
            return
        }
        if (availableWithdrawAmount >= number) {
            const option = {
                "withdrawal_amount": number,
            }
            setIsLoading(true)
            AsyncStorage.getItem('userToken', async (err, usertoken) => {
                const savedLang = await AsyncStorage.getItem('selectedLanguage');
                axios.post(`${API_URL}/astrologer/astrologer-withdraw-request`, option, {
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
                            navigation.navigate('WithdrawSuccess')
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
        } else {
            Alert.alert('', `${t('Withdraw.YourAvailablebalanceis')} ${availableWithdrawAmount.toFixed(2)}`, [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }

    }

    const fetchWithdrawRequest = async () => {
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
                `${API_URL}/astrologer/astrologer-withdrawl-list`, {},
                {
                    headers: {
                        "Authorization": `Bearer ${userToken}`, // Correct token variable used
                        "Content-Type": 'application/json',
                        'Accept-Language': savedLang,
                    },
                }
            );
            const userInfo = response.data.data; // Extract user info from the response
            setWithdrawList(userInfo)
            setIsLoading(false)
        } catch (e) {
            console.error(`Error fetching availableBalance: ${e}`);
            console.log(e.response?.data?.message);
            setIsLoading(false)
        } finally {
            setIsLoading(false); // Set loading state to false
        }
    }

    const renderwithdrawList = ({ item }) => (
        <View style={styles.singleValue}>
            <View style={styles.iconView}>
                <Image
                    source={walletDebit}
                    style={styles.iconStyle}
                />
            </View>
            <View style={styles.remarkView}>
                <Text style={styles.remarkText}>{t('Withdraw.WithdrawRequest')}</Text>
                <Text style={styles.remarkDate}>{item?.withdrawl_date}</Text>
            </View>
            <View style={styles.remarkAmountView}>
                <Text style={[styles.remarkAmount, { color: '#E1293B', alignSelf: 'flex-end' }]}>
                    - ₹{(Number(item?.withdrawal_amount) || 0).toFixed(2)}
                </Text>
                <Text style={[styles.remarkDate, { alignSelf: 'flex-end' }]}>
                    {
                        item?.status === '0' ? t('Withdraw.Pending') :
                            item?.status === '1' ? t('Withdraw.Approved') :
                                item?.status === '2' ? t('Withdraw.Release') :
                                    item?.status === '3' ? t('Withdraw.Reject') : ""
                    }
                </Text>
            </View>

        </View>
    )


    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Withdraw'} onPress={() => navigation.goBack()} title={t('Withdraw.Withdraw')} />
            <ScrollView style={styles.wrapper}>
                <Text style={styles.withdrawlinputHeader}>{t('Withdraw.Availableamounttowithdraw')} : ₹ {availableWithdrawAmount.toFixed(2)}</Text>
                <Text style={styles.inputHeader}>{t('Withdraw.EnterAmount')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeNumber}
                    value={number}
                    placeholder=""
                    keyboardType="numeric"
                    selectionColor="#000"
                />
                {bankDetails.length != '0' ?
                    <>
                        <Text style={styles.headerText}>{t('Withdraw.Withdrawmoneyto')}</Text>
                        <View style={styles.flexView}>
                            <Image
                                source={bankImg}
                                style={styles.cardIconImg}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(75), }}>
                                <View style={styles.colomnView}>
                                    <Text style={styles.bankName}>{bankDetails?.bank_name}</Text>
                                    <Text style={styles.bankAccount}>{accountNo}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { navigation.navigate('UploadBankDetails') }}>
                                    <Text style={{
                                        color: '#FB7401', fontFamily: 'PlusJakartaSans-Regular',
                                        fontSize: responsiveFontSize(2),
                                    }}>{t('Withdraw.Edit')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </> : null}
                <View style={styles.buttonwrapper}>
                    <CustomButton
                        label={t('Withdraw.WithdrawMoney')}
                        onPress={() => submitWithdrawRequest()}
                    />
                </View>
                <View>
                    <Text style={styles.headerText}>{t('Withdraw.WithdrawTransaction')}</Text>
                </View>
                <View style={{ marginBottom: responsiveHeight(2) }}>
                    {withdrawList.length != '0' ?
                        <FlatList
                            data={withdrawList}
                            renderItem={renderwithdrawList}
                            keyExtractor={(item) => item.id?.toString()}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            initialNumToRender={10}
                            showsVerticalScrollIndicator={false}
                            getItemLayout={(withdrawList, index) => (
                                { length: 50, offset: 50 * index, index }
                            )}
                        /> :
                        <Text style={{
                            color: '#8B939D',
                            fontSize: responsiveFontSize(1.7),
                            fontFamily: 'PlusJakartaSans-Regular',
                        }}>{t('Withdraw.Notransactionfound')}</Text>
                    }
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}


export default withTranslation()(WithdrawScreen)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    buttonwrapper: {
        width: responsiveWidth(92),
        marginVertical: responsiveHeight(2),
        alignSelf: 'center'
    },
    withdrawlinputHeader: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Bold',
        alignSelf: 'center',
        marginBottom: responsiveHeight(2)
    },
    inputHeader: {
        color: '#8B939D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Medium',
        alignSelf: 'center'
    },
    input: {
        height: responsiveHeight(7),
        margin: 12,
        padding: 10,
        borderBottomColor: '#E3E3E3',
        borderBottomWidth: 1,
        width: responsiveWidth(40),
        alignSelf: 'center',
        fontSize: responsiveFontSize(4),
        fontFamily: 'PlusJakartaSans-Bold',
        textAlign: 'center',
        color: '#1E2023',
    },
    headerText: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginVertical: responsiveHeight(2)
    },
    flexView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconImg: { height: 60, width: 60, resizeMode: 'contain' },
    colomnView: {
        flexDirection: 'column',
        marginLeft: responsiveWidth(3)
    },
    bankName: {
        color: '#1E2023',
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-Medium',
    },
    bankAccount: {
        color: '#8B939D',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Regular',
    },
    singleValue: {
        width: responsiveWidth(90),
        height: responsiveHeight(10),
        padding: 5,
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconView: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        backgroundColor: '#F4F5F5',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    remarkView: {
        flexDirection: 'column',
        marginLeft: 20,
        width: responsiveWidth(45),
    },
    remarkText: {
        color: '#444343',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    remarkDate: {
        color: '#746868',
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    remarkAmountView: {
        width: responsiveWidth(28),
        marginLeft: 10,
        justifyContent: 'flex-end',
        flexDirection: 'column',
    },
    remarkAmount: {
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: responsiveFontSize(2),
        textAlign: 'right'
    },
});
